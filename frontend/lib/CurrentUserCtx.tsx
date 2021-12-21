import { gql, useQuery } from "@apollo/client";
import { Context, createContext, FC, useContext, useEffect } from "react";
import { useSession } from "./SessionCtx";

export interface CurrentUser {
  userId: string;
  name: string;
  rank: "USER" | "ADMIN" | "DEV";
  twitchInfo: {
    twitchNickname: string;
  };
}

const CurrentUserCtx: Context<CurrentUser> = createContext(null);

export const CurrentUserProvider: FC = ({ children }) => {
  const [session, setSession] = useSession();
  const { data, error } = useQuery(currentUserQuery, {
    skip: !session,
    context: { headers: { authorization: session } },
  });

  useEffect(() => {
    if (error?.message === "You are not logged in") setSession(null);
  }, [error]);
  const currentUser = data?.getMyUser;

  return <CurrentUserCtx.Provider value={currentUser}>{children}</CurrentUserCtx.Provider>;
};

export const useCurrentUser = (): CurrentUser => useContext(CurrentUserCtx);

const currentUserQuery = gql`
  query {
    getMyUser {
      userId
      name
      rank
      twitchInfo {
        twitchNickname
      }
    }
  }
`;
