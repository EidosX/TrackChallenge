import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { gqlEndpoint } from "../lib/Options";
import Head from "next/head";
import { useCheckAfterLoginRedirectEffect } from "../lib/UseTwitchLoginUrl";
import { SessionProvider } from "../lib/SessionCtx";
import { CurrentUserProvider } from "../lib/CurrentUserCtx";

const apolloClient = new ApolloClient({
  uri: gqlEndpoint,
  cache: new InMemoryCache(),
});

const Init = ({ children }) => {
  const InitEffects = ({ children }) => {
    useCheckAfterLoginRedirectEffect();
    return <>{children}</>;
  };
  const InitProviders = ({ children }) => {
    return (
      <ApolloProvider client={apolloClient}>
        <SessionProvider>
          <CurrentUserProvider>{children}</CurrentUserProvider>
        </SessionProvider>
      </ApolloProvider>
    );
  };

  return (
    <InitProviders>
      <InitEffects>{children}</InitEffects>
    </InitProviders>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Init>
      <Head>
        <title>Track Challenge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </Init>
  );
}

export default MyApp;
