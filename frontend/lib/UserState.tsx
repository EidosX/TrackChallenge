import { gql, useQuery } from "@apollo/client";
import { cp } from "fs/promises";
import { Context, createContext, useContext, useEffect, useState } from "react";
import { SessionIdContext } from "./AuthState";

export interface CurrentUser {
  name: string;
  userId: string;
  rank: "USER" | "ADMIN" | "DEV";
  twitchInfo: {
    twitchNickname: string;
  };
}

export const UserContext: Context<CurrentUser> = createContext(null);

export const UserProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [sessionId, setSessionId] = useContext(SessionIdContext);

  const { data } = useQuery(currentUserQuery, {
    skip: !sessionId,
    context: {
      headers: {
        authorization: sessionId,
      },
    },
  });
  useEffect(() => {
    setCurrentUser(data?.getMyUser as CurrentUser);
  }, [data]);
  return <UserContext.Provider value={currentUser}>{children}</UserContext.Provider>;
};

const currentUserQuery = gql`
  {
    getMyUser {
      name
      userId
      rank
      twitchInfo {
        twitchNickname
      }
    }
  }
`;
