import { Poll } from "../../lib/polls/UsePoll";
import { PollPageState } from "../../pages/polls/[id]";
import { Results } from "./Results";

export const MainPanel = ({ pageState, poll }: { pageState: PollPageState; poll: Poll }) => {
  if (pageState.state === "results") {
    return <Results poll={poll}></Results>;
  } else return <></>;
};
