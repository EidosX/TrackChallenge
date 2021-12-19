import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { UserProvider } from "../lib/UserState";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { gqlEndpoint } from "../lib/Options";
import { LoginUrlProvider, SessionIdProvider } from "../lib/AuthState";

const apolloClient = new ApolloClient({
  uri: gqlEndpoint,
  cache: new InMemoryCache(),
});

const Home: NextPage = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <SessionIdProvider>
        <LoginUrlProvider>
          <UserProvider>
            <Head>
              <title>Track Challenge</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
              <Navbar />
            </header>
            <main></main>
          </UserProvider>
        </LoginUrlProvider>
      </SessionIdProvider>
    </ApolloProvider>
  );
};

export default Home;
