import { postgraphile } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import express from "express";
import { pool } from "./pgDb.js";
import * as Auth from "./auth.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(Auth.userMiddleware);
app.use(
  postgraphile(pool, "tc", {
    appendPlugins: [Auth.GenPubPrivPairPlugin, PgSimplifyInflectorPlugin],
    graphqlRoute: "/graphql",
    graphiqlRoute: "/graphiql",
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    ignoreRBAC: false,
    disableDefaultMutations: true,
    pgSettings: async (req) => ({
      "user.id": req.locals?.user?.id,
    }),
  })
);

app.get("/auth/twitch/challenge_code_callback", Auth.TwitchChallengeCodeCallbackRoute);

const port = process.env.PORT ?? 4000;
const server = app.listen(port, () => {
  const href = `http://localhost:${port}/graphiql`;
  console.log(`PostGraphiQL available at ${href} 🚀`);
});
