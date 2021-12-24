import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

export interface PollResult {
  votes: number;
  hash: string;
  name?: string;
  twitchNickname?: string;
  participationId?: number;
}

export const usePollResults = (
  pollId: number,
  { anonymous = true, skip = false }
): PollResult[] => {
  const anonymousData = useQuery(pollAnonymousResultsQuery, {
    skip: !anonymous || skip,
    variables: { id: pollId },
  });
  const data = useQuery(pollResultsQuery, {
    skip: anonymous || skip,
    variables: { id: pollId },
  });
  useEffect(() => {
    const interval = setInterval(() => {
      if (anonymous) anonymousData.refetch();
      else data.refetch();
    }, 400);
    return () => clearInterval(interval);
  }, [anonymous]);

  if (anonymous) {
    if (!anonymousData.data?.poll) return null;
    return anonymousData.data.poll.anonymousResults.nodes.map((r) => ({
      hash: r.uniqueHash,
      votes: r.votes,
    }));
  } else {
    if (!data.data?.poll) return null;
    return data.data.poll.participations.nodes.map((r) => ({
      hash: r.hash,
      votes: r.results,
      name: r.user.name,
      twitchNickname: r.user.twitchInfo.twitchNickname,
      participationId: r.participationId,
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
          hash
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
