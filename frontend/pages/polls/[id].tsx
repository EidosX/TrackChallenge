import Navbar from "../../components/Navbar";
import PageCenter from "../../components/PageCenter";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { usePoll, UsePollRet } from "../../lib/polls/UsePoll";
import { useRouter } from "next/router";

const LeftPanel = ({ poll }: { poll: UsePollRet }) => {
  const Participation = ({ name, twitchNickname }) => {
    return (
      <div className="cursor-pointer flex h-16 text-slate-900 items-center">
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
            key={p.participationId}
            name={p.user.name}
            twitchNickname={p.user.twitchInfo.twitchNickname}
          />
        ))}
      </div>
    </div>
  );
};

const HeaderPanel = () => {
  return <></>;
};

const MainPanel = () => {
  return <></>;
};

export default () => {
  const boxStyle = "rounded-3xl backdrop-blur-md shadow-md shadow-slate-900";
  const router = useRouter();
  const pollId = parseInt(router.query.id as string);
  if (!pollId) return <h1 className="text-6xl">Invalid Poll ID</h1>;
  const poll = usePoll(pollId);

  return (
    <PageCenter header={<Navbar />}>
      <div className="relative flex gap-4 h-[32rem] w-screen max-w-4xl px-6">
        <div className={`basis-1/3 bg-blue-50 bg-opacity-50  ${boxStyle}`}>
          <LeftPanel poll={poll} />
        </div>
        <div className="flex flex-col gap-3 basis-2/3">
          <div className={`h-32 bg-blue-800 ${boxStyle}`}>
            <HeaderPanel />
          </div>
          <div className={`grow bg-slate-900 bg-opacity-50 ${boxStyle}`}>
            <MainPanel />
          </div>
        </div>
      </div>
    </PageCenter>
  );
};
