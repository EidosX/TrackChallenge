const { makeExtendSchemaPlugin, gql } = require("graphile-utils");
const { pool } = require("../pgDb");

let authCodes = [];

function clearExpiredAuthCodes() {
  authCodes = authCodes.filter((c) => c.expires > Date.now());
}

module.exports = {
  // Called by the twitch bot every time it sees a message ressembling a code
  handleTwitchChatCode: ({ code, twitchName, twitchId }) => {
    const codeIndex = authCodes.findIndex((c) => c.code === code && c.expires > Date.now());
    if (codeIndex == -1) return;
    const sessionId = authCodes[codeIndex].sessionId;
    pool.query(
      "select * from tc_private.associate_session($1, $2, $3);",
      [String(sessionId), String(twitchName), String(twitchId)],
      (err, result) => {
        if (err) return console.error("Error executing query", err.stack);
        authCodes.splice(codeIndex, 1);
      }
    );
  },
  plugin: makeExtendSchemaPlugin({
    typeDefs: gql`
      extend type Mutation {
        requestAuthCode(sessionId: String!): String!
      }
    `,
    resolvers: {
      Mutation: {
        requestAuthCode: async (_, { sessionId }) => {
          clearExpiredAuthCodes();
          return await new Promise((resolve, reject) => {
            pool.query(
              "select 1 from tc_private.session where id = $1::text;",
              [String(sessionId)],
              (err, result) => {
                if (err) {
                  console.error("Error executing query", err.stack);
                  return reject("XXXX");
                }
                if (result.rowCount <= 0) return reject("XXXX");
                // We know the sessionID is valid, we can push the code
                const code = generateRandomCode(4);
                authCodes.push({
                  code: code,
                  expires: new Date(Date.now() + 1000 * 5),
                  sessionId: sessionId,
                });
                resolve(code);
              }
            );
          });
        },
      },
    },
  }),
};

function generateRandomCode(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
