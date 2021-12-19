import { postgraphile } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import express from "express";
import { pool } from "./pgDb.js";
import { GenPubPrivPairPlugin } from "./auth.js";

console.log("GENERATING");
console.log();

const app = express();
app.use(
  postgraphile(pool, "tc", {
    appendPlugins: [GenPubPrivPairPlugin, PgSimplifyInflectorPlugin],
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
