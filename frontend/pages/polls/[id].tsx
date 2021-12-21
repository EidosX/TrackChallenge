import Navbar from "../../components/Navbar";
import PageCenter from "../../components/PageCenter";
import { PollParticipation, usePoll } from "../../lib/polls/UsePoll";
import { useRouter } from "next/router";
import { LeftPanel } from "../../components/polls/LeftPanel";
import { useState } from "react";
import { HeaderPanel } from "../../components/polls/HeaderPanel";
import { MainPanel } from "../../components/polls/MainPanel";

export interface PollPageState {
  current?: PollParticipation;
  state: "results" | "participation" | "vote_login" | "confirmation";
}

export default () => {
  const [state, setState] = useState<PollPageState>({ state: "results" });
  const boxStyle = "rounded-3xl backdrop-blur-md shadow-md shadow-slate-900";
  const router = useRouter();
  const pollId = parseInt(router.query.id as string);

  const poll = usePoll(pollId, { skip: !pollId });

  return (
    <PageCenter header={<Navbar />}>
      <div className="relative flex gap-4 h-[32rem] w-screen max-w-4xl px-6">
        <div className={`basis-1/3 bg-blue-50 bg-opacity-50 shrink-0 ${boxStyle}`}>
          <LeftPanel
            poll={poll}
            onSelect={(p) => {
              if (p === state.current) setState({ state: "results" });
              else setState({ state: "participation", current: p });
            }}
          />
        </div>
        <div className="flex flex-col gap-3 basis-2/3">
          <div className={`h-32 bg-blue-800 ${boxStyle} ${state.current ? "" : "hidden"}`}>
            <HeaderPanel state={state} />
          </div>
          <div className={`grow bg-slate-900 bg-opacity-50 ${boxStyle}`}>
            <MainPanel pageState={state} poll={poll.data} />
          </div>
        </div>
      </div>
    </PageCenter>
  );
};
