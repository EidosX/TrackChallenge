import { Context, createContext, FC, useContext, useEffect, useState } from "react";

const SessionCtx: Context<[string, (string) => void]> = createContext(null);

export const SessionProvider: FC = ({ children }) => {
  const [session, setSession] = useState<string>(null);
  useEffect(() => loadSessionFromLocalStorage(setSession), []);
  useEffect(() => saveSession(session), [session]);
  return <SessionCtx.Provider value={[session, setSession]}>{children}</SessionCtx.Provider>;
};

export const useSession = (): [string, (string) => void] => {
  const [session, setSession] = useContext(SessionCtx);
  return [session, setSession];
};

function saveSession(session: string) {
  if (!session) localStorage.removeItem("session");
  else localStorage.setItem("session", session);
}

function loadSessionFromLocalStorage(setSession: (string) => void) {
  const sess = localStorage.getItem("session");
  if (sess) setSession(sess);
}
