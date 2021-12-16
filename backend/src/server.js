require("dotenv").config();

const http = require("http");
const { postgraphile } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");

const port = process.env.PORT ?? 3000;

const pgDb = process.env.PG_DB ?? "tc";
const pgPort = process.env.PG_PORT ?? 5432;
const pgHost = process.env.PG_HOST ?? "localhost";
const pgGraphileUser = "admin";
const pgGraphilePassword = process.env.PG_GRAPHILE_PASSWORD;

const pgConnStr = `postgres://${pgGraphileUser}:${pgGraphilePassword}@${pgHost}:${pgPort}/${pgDb}`;

http
  .createServer(
    postgraphile(pgConnStr, "tc", {
      appendPlugins: [PgSimplifyInflectorPlugin],
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
