import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { LoginUrlProvider, SessionIdProvider } from "../lib/AuthState";
import { UserProvider } from "../lib/UserState";
import { gqlEndpoint } from "../lib/Options";
import Head from "next/head";

const apolloClient = new ApolloClient({
  uri: gqlEndpoint,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <SessionIdProvider>
        <LoginUrlProvider>
          <UserProvider>
            <Head>
              <title>Track Challenge</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
              <Component {...pageProps} />
            </main>
          </UserProvider>
        </LoginUrlProvider>
      </SessionIdProvider>
    </ApolloProvider>
  );
}

export default MyApp;
