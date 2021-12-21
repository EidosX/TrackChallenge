import { PollParticipation, UsePollRet } from "../../lib/polls/UsePoll";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export const LeftPanel = ({
  poll,
  onSelect,
}: {
  poll: UsePollRet;
  onSelect: (PollParticipation) => void;
}) => {
  const Participation = ({ name, twitchNickname, onClick }) => {
    return (
      <div onClick={onClick} className="cursor-pointer flex h-16 text-slate-900 items-center">
        <div className="">
          <p className="font-medium text-lg">{name}</p>
          <p className="-translate-y-1 font-medium opacity-60 text-xs">{twitchNickname}</p>
        </div>
        <KeyboardArrowRightIcon className="ml-auto translate-x-2"></KeyboardArrowRightIcon>
      </div>
    );
  };

  return (
    <div className="mx-2 my-7 absolute inset-0 flex flex-col">
      <h3 className="px-6 text-xl font-bold mb-4 drop-shadow-md">{poll.data?.name ?? "..."}</h3>
      <div className="overflow-auto px-6">
        {poll.data?.participations.map((p) => (
          <Participation
            onClick={() => onSelect(p)}
            key={p.participationId}
            name={p.user.name}
            twitchNickname={p.user.twitchInfo.twitchNickname}
          />
        ))}
      </div>
    </div>
  );
};
