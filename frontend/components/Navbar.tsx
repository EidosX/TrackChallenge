import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { LoginUrlContext } from "../lib/AuthState";
import { UserContext } from "../lib/UserState";

export default () => {
  const currentUser = useContext(UserContext);
  const loginUrl = useContext(LoginUrlContext);
  return (
    <div className="w-full h-12 bg-slate-900 bg-opacity-50">
      <div className="mx-auto px-6 max-w-4xl h-full flex items-center">
        <p className="font-extrabold text-xl mr-auto select-none">TRACK CHALLENGE</p>
        <p>{currentUser ? <a href="#">Mon compte</a> : <a href={loginUrl}>Connexion</a>}</p>
        <p></p>
      </div>
    </div>
  );
};
