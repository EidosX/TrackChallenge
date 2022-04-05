import { gql, useMutation } from "@apollo/client";
import { useSession } from "../auth/SessionCtx";

export type UseVoteMutationRet = {
  errors?: {
    selfVote?: boolean;
  };
  ok?: boolean;
};

export function useVoteMutation({ participationId }): () => Promise<UseVoteMutationRet> {
  const [session] = useSession();
  const [mutation] = useMutation(voteMutation, {
    variables: { participationId },
    context: { headers: { authorization: session } },
  });
  return async () => {
    try {
      const data = await mutation();
    } catch (e) {
      if (e.message === "Self vote") return { errors: { selfVote: true } };
      throw e;
    }
    return { ok: true };
  };
}

const voteMutation = gql`
  mutation ($participationId: Int!) {
    voteFor(input: { _participationId: $participationId }) {
      vote {
        participationId
      }
    }
  }
`;
