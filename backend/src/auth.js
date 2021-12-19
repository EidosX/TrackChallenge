import { makeExtendSchemaPlugin, gql } from "graphile-utils";
import cryptoRandomString from "crypto-random-string";
import crypto from "crypto";
import fetch from "node-fetch";
import { filter, take, Subject, map, timeout } from "rxjs";

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
          const hashSecret = process.env.HASH_SECRET;
          if (!hashSecret || hashSecret.length < 16) {
            throw new Error("HASH_SECRET must be set to a 16 or more characters string");
          }
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
  const pubKey = req.query?.state;
  if (!pubKey) return res.status(400).json({ message: "No pub key provided" });

  const twitchURL =
    `https://id.twitch.tv/oauth2/token` +
    `?client_id=${process.env.TWITCH_CLIENT_ID}` +
    `&client_secret=${process.env.TWITCH_SECRET}` +
    `&code=${code}` +
    `&state=${pubKey}` +
    `&grant_type=authorization_code` +
    `&redirect_uri=${process.env.TWITCH_ACCESS_TOKEN_REDIRECT}`;
  const twitchRes = await fetch(twitchURL, { method: "POST" }).then((r) => r.json());
  if (!twitchRes.access_token) return res.status(400).json(twitchRes);
  res.json({ message: "TODO" }); // TODO
};
