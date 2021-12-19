import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { LoginUrlContext } from "../lib/AuthState";
import { UserContext } from "../lib/UserState";

export default () => {
  const currentUser = useContext(UserContext);
  const loginUrl = useContext(LoginUrlContext);
  return (
    <div className="w-full h-12 px-6 bg-black">
      <div className="mx-auto max-w-4xl h-full flex gap-6 items-center">
        <p className="font-extrabold text-lg mr-auto select-none">TRACK CHALLENGE</p>
        {currentUser ? <a href="#">Mon compte</a> : <a href={loginUrl}>Connexion</a>}
        <p></p>
      </div>
    </div>
  );
};
