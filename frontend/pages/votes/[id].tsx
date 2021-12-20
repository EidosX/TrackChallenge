import Navbar from "../../components/Navbar";
import PageCenter from "../../components/PageCenter";

const boxStyle = "rounded-3xl backdrop-blur-md shadow-md shadow-slate-900";

const LeftPanel = () => {
  return <div className={`basis-1/3 bg-blue-50 bg-opacity-50 ${boxStyle}`}></div>;
};

const HeaderPanel = () => {
  return <div className={`h-32 bg-blue-800 ${boxStyle}`}></div>;
};

const MainPanel = () => {
  return <div className={`grow bg-slate-900 bg-opacity-50 ${boxStyle}`}></div>;
};

export default () => {
  return (
    <PageCenter header={<Navbar />}>
      <div className="flex gap-4 h-[32rem] w-screen max-w-4xl px-6">
        <LeftPanel />
        <div className="flex flex-col gap-3 basis-2/3">
          <HeaderPanel />
          <MainPanel />
        </div>
      </div>
    </PageCenter>
  );
};
