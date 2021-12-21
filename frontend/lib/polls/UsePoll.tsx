import { gql, useQuery } from "@apollo/client";
import { log } from "console";
import { useEffect } from "react";

export interface Poll {
  name: string;
  state: PollState;
  creator: {
    name: string;
  };
  votesEnd: Date;
  participations: [
    {
      participationId: number;
      description: string;
      link: string;
      title: string;
      user: {
        bio: string;
        name: string;
        twitchInfo: {
          twitchNickname: string;
        };
        bannerImage: {
          imageUrl: string | null;
        };
      };
    }
  ];
}

export enum PollState {
  "SUBMISSIONS",
  "VOTES",
  "ENDED",
  "PUBLISHED",
}

export interface UsePollRet {
  data: Poll | null;
  loading: boolean;
}

export const usePoll = (pollId: number, { skip }): UsePollRet => {
  const { data, loading, error, refetch } = useQuery(pollQuery, { variables: { pollId }, skip });
  useEffect(() => {
    const interval = setInterval(() => {
      if (data) refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data?.poll) return { data: null, loading };

  return {
    loading: false,
    data: {
      name: data.poll.name,
      state: data.poll.state,
      creator: data.poll.creator,
      votesEnd: new Date(data.poll.votesEnd),
      participations: data.poll.participations.nodes,
    },
  };
};

const pollQuery = gql`
  query ($pollId: Int!) {
    poll(pollId: $pollId) {
      name
      state
      creator {
        name
      }
      votesEnd
      participations {
        nodes {
          participationId
          description
          link
          title
          user {
            bio
            name
            twitchInfo {
              twitchNickname
            }
            bannerImage {
              imageUrl
            }
          }
        }
      }
    }
  }
`;
