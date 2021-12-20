import Navbar from "../../components/Navbar";
import PageCenter from "../../components/PageCenter";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const LeftPanel = () => {
  const Participant = ({ name, twitchNickname }) => {
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
      <h3 className="px-6 text-xl font-bold mb-4 drop-shadow-md">Participants</h3>
      <div className="overflow-auto px-6">
        <Participant name="HeroicProd" twitchNickname="heroicprod" />
        <Participant name="Eidos" twitchNickname="eidosmusic" />
        <Participant name="Zipojama" twitchNickname="zipojama" />
        <Participant name="Hito" twitchNickname="hitosurtwitch" />
        <Participant name="Jack Jones" twitchNickname="jackjones" />
        <Participant name="Kisem" twitchNickname="kisemmusic" />
        <Participant name="Clayne" twitchNickname="clayneoff" />
        <Participant name="Jeremouille" twitchNickname="jeremouille" />
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
  return (
    <PageCenter header={<Navbar />}>
      <div className="relative flex gap-4 h-[32rem] w-screen max-w-4xl px-6">
        <div className={`basis-1/3 bg-blue-50 bg-opacity-50  ${boxStyle}`}>
          <LeftPanel />
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
