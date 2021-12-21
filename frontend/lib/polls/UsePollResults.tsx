import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

export type PollResult = { votes: number } & (
  | { hash: string }
  | { name: string; twitchNickname: string; participationId: number }
);

export const usePollResults = (pollId: number, { anonymous = true }): [PollResult] => {
  const anonymousData = useQuery(pollAnonymousResultsQuery, {
    skip: !anonymous,
    variables: { id: pollId },
  });
  const data = useQuery(pollResultsQuery, { skip: anonymous, variables: { id: pollId } });
  useEffect(() => {
    const interval = setInterval(() => {
      if (anonymous) anonymousData.refetch();
      else data.refetch();
    }, 400);
    return () => clearInterval(interval);
  }, [anonymous]);

  console.log(anonymousData.error);

  if (anonymous) {
    if (!anonymousData.data?.poll) return null;
    return anonymousData.data.poll.anonymousResults.nodes.map((r) => ({
      hash: r.uniqueHash,
      votes: r.votes,
    }));
  } else {
    if (!data.data?.poll) return null;
    return data.data.poll.participations.nodes.map((r) => ({
      name: r.user.name,
      twitchNickname: r.user.twitchInfo.twitchNickname,
      participationId: r.participationId,
      votes: r.results,
    }));
  }
};

const pollAnonymousResultsQuery = gql`
  query ($id: Int!) {
    poll(pollId: $id) {
      anonymousResults {
        nodes {
          uniqueHash
          votes
        }
      }
    }
  }
`;

const pollResultsQuery = gql`
  query ($id: Int!) {
    poll(pollId: $id) {
      participations {
        nodes {
          results
          participationId
          user {
            name
            twitchInfo {
              twitchNickname
            }
          }
        }
      }
    }
  }
`;
