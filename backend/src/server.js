require("dotenv").config();

const http = require("http");
const { postgraphile } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");

const port = process.env.PORT ?? 3000;

require("./twitchbot");
const AuthCode = require("./schema_ext/authcode");
const { pool } = require("./pgDb");

http
  .createServer(
    postgraphile(pool, "tc", {
      appendPlugins: [AuthCode.plugin, PgSimplifyInflectorPlugin],
      graphqlRoute: "/graphql",
      graphiqlRoute: "/graphiql",
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      ignoreRBAC: false,
      disableDefaultMutations: true,
    })
  )
  .listen(port, () => () => {
    const address = server.address();
    if (typeof address !== "string") {
      const href = `http://localhost:${address.port}${options.graphiqlRoute || "/graphiql"}`;
      console.log(`PostGraphiQL available at ${href} 🚀`);
    } else {
      console.log(`PostGraphile listening on ${address} 🚀`);
    }
  });
