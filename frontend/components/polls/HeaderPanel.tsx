import { PollPageState } from "../../pages/polls/[id]";

export const HeaderPanel = ({ state }: { state: PollPageState }) => {
  return (
    <div className="mx-11 justify-between h-full flex items-center">
      <div className="translate-y-1" style={{ textShadow: "0px 0px 0.3rem #000000AF" }}>
        <h1 className="font-bold text-4xl" style={{ fontSize: "2.5rem" }}>
          {state.current?.user.name}
        </h1>
        <p className="text-xs opacity-60">{state.current?.user.twitchInfo.twitchNickname}</p>
      </div>
      <p className="opacity-70 text-xs text-right" style={{ width: "12rem" }}>
        {state.current?.user.bio}
      </p>
    </div>
  );
};
