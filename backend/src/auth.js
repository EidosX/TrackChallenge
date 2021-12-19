import { makeExtendSchemaPlugin, gql } from "graphile-utils";
import cryptoRandomString from "crypto-random-string";
import crypto from "crypto";

export const GenPubPrivPairPlugin = makeExtendSchemaPlugin((build) => {
  return {
    typeDefs: gql`
      type PubPrivPair {
        pub: String!
        priv: String!
      }
      extend type Query {
        generatePubPrivPair: PubPrivPair
      }
    `,
    resolvers: {
      Query: {
        generatePubPrivPair: async () => {
          const hashSecret = process.env.HASH_SECRET;
          if (!hashSecret || hashSecret.length < 16) {
            throw new Error("HASH_SECRET must be set to a 16 or more characters string");
          }
          const pub = cryptoRandomString({ length: 32, type: "base64" });
          const priv = crypto
            .createHash("sha1")
            .update(pub + hashSecret)
            .digest("base64");
          return { pub, priv };
        },
      },
    },
  };
});
