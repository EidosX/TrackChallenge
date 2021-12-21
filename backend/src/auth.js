import { makeExtendSchemaPlugin, gql } from "graphile-utils";
import cryptoRandomString from "crypto-random-string";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import fetch from "node-fetch";
import { pool } from "./pgDb.js";

const hashSecret = process.env.HASH_SECRET;
if (!hashSecret || hashSecret.length < 16) {
  throw new Error("HASH_SECRET must be set to a 16 or more characters string");
}

export const GenPubPrivPairPlugin = makeExtendSchemaPlugin((build) => {
  return {
    typeDefs: gql`
      type PubPrivPair {
        pub: String!
        priv: String!
      }
      extend type Query {
        generatePubPrivPair: PubPrivPair
      }
    `,
    resolvers: {
      Query: {
        generatePubPrivPair: async () => {
          const pub = cryptoRandomString({ length: 32, type: "base64" });
          const priv = crypto
            .createHash("sha1")
            .update(pub + hashSecret)
            .digest("base64");
          return { pub, priv };
        },
      },
    },
  };
});

export const TwitchChallengeCodeCallbackRoute = async (req, res) => {
  const code = req.query?.code;
  if (!code) return res.status(400).json({ message: "No code provided" });
  let state;
  try {
    state = JSON.parse(decodeURIComponent(req.query?.state));
  } catch (e) {
    return res.status(400).json({ message: "Invalid JSON state" });
  }
  const pub = state?.pub;
  if (!pub) return res.status(400).json({ message: "No pub key provided" });

  // Get access token
  const twitchRes = await fetch(
    `https://id.twitch.tv/oauth2/token` +
      `?client_id=${process.env.TWITCH_CLIENT_ID}` +
      `&client_secret=${process.env.TWITCH_SECRET}` +
      `&code=${code}` +
      `&grant_type=authorization_code` +
      `&redirect_uri=${process.env.AUTH_SUCCESS_REDIRECT}` +
      `&state=${req.query?.state}`,
    { method: "POST" }
  ).then((r) => r.json());
  const accessToken = twitchRes?.access_token;
  if (!accessToken) return res.status(400).json(twitchRes);

  // Get user info
  const userRes = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      authorization: `Bearer ${accessToken}`,
      "client-id": process.env.TWITCH_CLIENT_ID,
    },
  }).then((r) => r.json());
  if (!userRes) return res.status(400).json({ message: "Couldn't fetch user data" });

  // Create or get user
  const userId = (
    await pool.query("select user_id from tc_priv.upsert_twitch_user($1, $2, $3, $4)", [
      userRes.data[0].id,
      userRes.data[0].login,
      userRes.data[0].display_name,
      userRes.data[0].description,
    ])
  ).rows[0].user_id;

  // Create session
  const sessionId = (
    await pool.query("insert into tc_priv.sessions (user_id) values ($1) returning session_id", [
      userId,
    ])
  ).rows[0].session_id;
  const priv = crypto
    .createHash("sha1")
    .update(pub + hashSecret)
    .digest("base64");
  const encryptedSessionId = CryptoJS.AES.encrypt(sessionId, priv).toString();
  const urlEncSessId = encodeURIComponent(encryptedSessionId);
  const redirectUrl = state?.redirect ?? process.env.AUTH_SUCCESS_REDIRECT;
  res.redirect(`${redirectUrl}#&encrypted_session_id=${urlEncSessId}`);
};

export const userMiddleware = async (req, res, next) => {
  const sessionId = req.headers?.authorization;
  if (!sessionId) return next();

  const sessionUserId = (
    await pool.query("select user_id from tc_priv.sessions where session_id = $1", [sessionId])
  ).rows[0]?.user_id;
  if (!sessionUserId) return next();

  req.locals ??= {};
  req.locals.user = { id: sessionUserId };
  next();
};
