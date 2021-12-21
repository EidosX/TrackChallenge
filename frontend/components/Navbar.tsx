export default () => {
  const currentUser = null;
  return (
    <div className="w-full h-12 bg-slate-900 bg-opacity-50">
      <div className="mx-auto px-6 max-w-4xl h-full flex items-center">
        <p className="font-extrabold text-xl mr-auto select-none">TRACK CHALLENGE</p>
        <p>{currentUser ? <a href="#">Mon compte</a> : <a href="#">Connexion</a>}</p>
        <p></p>
      </div>
    </div>
  );
};
