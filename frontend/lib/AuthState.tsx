import { gql, useQuery } from "@apollo/client";
import {
  Context,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { challengeCodeCallbackURL, clientId } from "./Options";
import CryptoJS from "crypto-js";

export const LoginUrlContext = createContext("");

export const LoginUrlProvider: React.FC = ({ children }) => {
  const [sessionId, setSessionId] = useContext(SessionIdContext);
  const { data } = useQuery(pubPrivPairQuery, { skip: !!sessionId });

  let loginUrl = "";
  if (data) {
    const { priv, pub } = data.generatePubPrivPair;
    if (typeof window !== "undefined") localStorage.setItem("backend_privkey", priv);

    loginUrl =
      `https://id.twitch.tv/oauth2/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${challengeCodeCallbackURL}` +
      `&response_type=code` +
      `&state=${pub}`;
  }

  return <LoginUrlContext.Provider value={loginUrl}>{children}</LoginUrlContext.Provider>;
};

export const SessionIdContext: Context<[string, Dispatch<SetStateAction<string>>]> =
  createContext(null);

export const SessionIdProvider: React.FC = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>(null);

  useEffect(() => {
    // Pull session id from local storage
    if (typeof window !== "undefined") {
      setSessionId(localStorage.getItem("session_id"));
    }
    // If we were redirected from the backend auth route, we decrypt the session id
    if (typeof window !== "undefined") {
      const fragments = new URLSearchParams(window.location.hash.substring(1));
      const encSessId = fragments.get("encrypted_session_id");
      const priv = localStorage.getItem("backend_privkey");

      if (encSessId && priv) {
        window.location.hash = "";
        const sessId = CryptoJS.AES.decrypt(decodeURIComponent(encSessId), priv).toString(
          CryptoJS.enc.Utf8
        );
        if (!sessId) {
          console.error("Could not decrypt session id");
          setSessionId(null);
        } else {
          setSessionId(sessId);
        }
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && sessionId) localStorage.setItem("session_id", sessionId);
    if (typeof window !== "undefined" && !sessionId) localStorage.removeItem("session_id");
    if (sessionId) localStorage.removeItem("backend_privkey");
  }, [sessionId]);

  return (
    <SessionIdContext.Provider value={[sessionId, setSessionId]}>
      {children}
    </SessionIdContext.Provider>
  );
};

const pubPrivPairQuery = gql`
  {
    generatePubPrivPair {
      priv
      pub
    }
  }
`;
