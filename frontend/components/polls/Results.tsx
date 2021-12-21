import { Poll } from "../../lib/polls/UsePoll";
import { usePollResults } from "../../lib/polls/UsePollResults";

export const Results = ({ poll }: { poll: Poll }) => {
  if (!poll) return <></>;
  const pollResults = usePollResults(poll.id, { anonymous: poll.state !== "PUBLISHED" });
  return <>{JSON.stringify(pollResults)}</>;
};
