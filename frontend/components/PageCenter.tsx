export default ({ children, header }) => {
  return (
    <div className="w-full h-screen flex flex-col">
      {header}
      <div className="flex grow w-full justify-center items-center">{children}</div>
    </div>
  );
};
