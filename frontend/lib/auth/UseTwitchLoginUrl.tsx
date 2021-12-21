import { gql, useApolloClient } from "@apollo/client";
import { useEffect } from "react";
import { challengeCodeCallbackURL, clientId } from "../Options";
import CryptoJS from "crypto-js";
import { useSession } from "./SessionCtx";

// Returns a function which redirects to Twitch's login page.
export const useTwitchLogin = (): (({ redirect }) => Promise<void>) => {
  const client = useApolloClient();
  return async ({ redirect }) => {
    const { pub, priv } = (await client.query({ query: pubPrivQuery })).data.generatePubPrivPair;
    localStorage.setItem("backend_priv_before_login_redirect", priv);
    const state = { pub, redirect };
    const loginUrl =
      `https://id.twitch.tv/oauth2/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${challengeCodeCallbackURL}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(JSON.stringify(state))}`;
    window.location.href = loginUrl;
  };
};

// only call this once at the top level
export function useCheckAfterLoginRedirectEffect() {
  const [session, setSession] = useSession();
  useEffect(() => {
    const fragments = new URLSearchParams(window.location.hash.substring(1));
    const priv = localStorage.getItem("backend_priv_before_login_redirect");
    const uriEncSessId = fragments.get("encrypted_session_id");
    const encSessId = decodeURIComponent(uriEncSessId);

    // Clear temp stuff
    setTimeout(() => {
      localStorage.removeItem("backend_priv_before_login_redirect");
      window.location.hash = window.location.hash.replace(/&?encrypted_session_id=[^&]*/g, "");
    }, 100);

    if (!encSessId || !priv) return;
    const sessId = CryptoJS.AES.decrypt(encSessId, priv).toString(CryptoJS.enc.Utf8);
    if (!sessId) return console.error("Failed to decrypt session id");
    setSession(sessId);
  }, []);
}

const pubPrivQuery = gql`
  query {
    generatePubPrivPair {
      pub
      priv
    }
  }
`;
