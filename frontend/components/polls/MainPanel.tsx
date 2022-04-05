import { Dispatch, SetStateAction } from "react";
import { useCurrentUser } from "../../lib/auth/CurrentUserCtx";
import { useCurrentDate } from "../../lib/misc/UseCurrentDate";
import { Poll } from "../../lib/polls/UsePoll";
import { useVoteMutation } from "../../lib/polls/UseVoteMutation";
import { PollPageState } from "../../pages/polls/[id]";
import { Results } from "./Results";

export const MainPanel = ({
  pageState: [pageState, setState],
  poll,
}: {
  pageState: [PollPageState, Dispatch<SetStateAction<PollPageState>>];
  poll: Poll;
}) => {
  const currentDate = useCurrentDate();
  const currentUser = useCurrentUser();
  const voteForCurrent = useVoteMutation({ participationId: pageState.current?.participationId });
  if (pageState.state === "results") {
    return (
      <div className="mx-4 my-6 absolute inset-0 overflow-auto">
        <Results poll={poll}></Results>
      </div>
    );
  } else if (pageState.state === "participation") {
    const remainingMs = Math.max(0, poll.votesEnd.getTime() - currentDate.getTime());
    const remainingSecs = Math.floor(remainingMs / 1000);
    const remainingMins = Math.floor(remainingSecs / 60);

    const remaining = () => {
      if (remainingMins > 0) return <p>{remainingMins} minutes restantes</p>;
      else if (remainingSecs > 0) return <p>{remainingSecs} secondes restantes</p>;
      else return <p>Votes terminés</p>;
    };

    return (
      <>
        {remaining()}
        <button onClick={onVote}>Voter</button>
      </>
    );
  }
  return <></>;

  async function onVote() {
    if (!currentUser) {
      setState({ state: "vote_login", current: pageState.current });
      return;
    }
    const data = await voteForCurrent();
    if (data.errors?.selfVote) {
      const xs = [
        "Chiale tu peux pas 👮‍♂️ 🚓",
        "Genant le vote",
        `Des femmes de ta région souhaitent te montrer leur bank kontakt (-5km)`,
        `Qui vote pour ${currentUser?.name} serieux, celle d'Eidos est 100 fois mieux`,
        `En vrai personne veut le dire mais les tracks de ${currentUser?.name} elles sont vraiment nulles a chier`,
        "rickroll",
        "shrekgirl",
      ];
      const msg = xs[Math.floor(Math.random() * xs.length)];
      if (msg === "rickroll") return (window.location.href = "https://youtu.be/dQw4w9WgXcQ");
      if (msg === "shrekgirl") return (window.location.href = "https://youtu.be/f3sVo0hXxSA?t=5");
      alert(msg);
      // return;
    }
    setState({ state: "confirmation", current: pageState.current });
  }
};
