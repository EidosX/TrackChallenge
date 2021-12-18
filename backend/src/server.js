require("dotenv").config();

const { postgraphile } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const express = require("express");
const { pool } = require("./pgDb");

const app = express();
app.use(
  postgraphile(pool, "tc", {
    appendPlugins: [PgSimplifyInflectorPlugin],
    graphqlRoute: "/graphql",
    graphiqlRoute: "/graphiql",
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    ignoreRBAC: false,
    disableDefaultMutations: true,
    pgSettings: async (req) => ({
      user_id: req.locals?.user?.id,
    }),
  })
);
const port = process.env.PORT ?? 4000;
const server = app.listen(port, () => {
  const href = `http://localhost:${port}/graphiql`;
  console.log(`PostGraphiQL available at ${href} 🚀`);
});
