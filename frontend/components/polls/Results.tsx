import { useEffect, useState } from "react";
import FlipMove from "react-flip-move";
import { Poll } from "../../lib/polls/UsePoll";
import { usePollResults } from "../../lib/polls/UsePollResults";

const colors = [
  { color: "bg-red-500", border: "border-red-500" },
  { color: "bg-blue-500", border: "border-blue-500" },
  { color: "bg-teal-500", border: "border-teal-500" },
  { color: "bg-cyan-500", border: "border-cyan-500" },
  { color: "bg-sky-500", border: "border-sky-500" },
  { color: "bg-green-500", border: "border-green-500" },
  { color: "bg-slate-500", border: "border-slate-500" },
  { color: "bg-orange-500", border: "border-orange-500" },
  { color: "bg-amber-500", border: "border-amber-500" },
  { color: "bg-lime-500", border: "border-lime-500" },
  { color: "bg-emerald-500", border: "border-emerald-500" },
  { color: "bg-violet-500", border: "border-violet-500" },
  { color: "bg-fuchsia-500", border: "border-fuchsia-500" },
  { color: "bg-pink-500", border: "border-pink-500" },
  { color: "bg-white", border: "border-white" },
];

const Bar = ({ left, right, width, color, border }) => {
  return (
    <div className="h-16 relative">
      <div
        className={`w-full h-full absolute -z-10 ${color} bg-opacity-60 border-2 ${border} rounded-3xl`}
        style={{ width, transition: "width .4s" }}
      />
      <div className="flex h-full items-center px-7">
        {left}
        <div className="mx-auto"></div>
        {right}
      </div>
    </div>
  );
};

export const Results = ({ poll }: { poll: Poll }) => {
  const pollResults = usePollResults(poll?.id, {
    anonymous: poll?.state !== "PUBLISHED",
    skip: !poll,
  });
  if (!pollResults) return <></>;

  const sortedResults = pollResults.sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(0, ...sortedResults.map((r) => r.votes));

  return (
    <FlipMove easing="ease" className="flex flex-col gap-2">
      {sortedResults.map((r) => {
        const left = <p>{r.name ?? "???"}</p>;
        const right = <p>{r.votes}</p>;
        const i =
          r.hash
            .split("")
            .map((i) => i.charCodeAt(0))
            .reduce((a, b) => a + b, 0) % colors.length;

        return (
          <div key={r.hash}>
            <Bar
              left={left}
              right={right}
              color={colors[i].color}
              border={colors[i].border}
              width={(maxVotes == 0 ? 100 : (100 * r.votes) / maxVotes) + "%"}
            ></Bar>
          </div>
        );
      })}
    </FlipMove>
  );
};
