import { Poll } from "../../lib/polls/UsePoll";
import { PollPageState } from "../../pages/polls/[id]";
import { Results } from "./Results";

export const MainPanel = ({ pageState, poll }: { pageState: PollPageState; poll: Poll }) => {
  if (pageState.state === "results") {
    return (
      <div className="mx-4 my-6 absolute inset-0 overflow-auto">
        <Results poll={poll}></Results>
      </div>
    );
  } else return <></>;
};
