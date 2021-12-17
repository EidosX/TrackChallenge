require("dotenv").config();

const { postgraphile } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const express = require("express");
const session = require("express-session");
const passport = require("passport");

const port = process.env.PORT ?? 4000;

const { pool } = require("./pgDb");
const { setupTwitchAPIAuth } = require("./auth/twitch-api-auth");

const app = express();
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

setupTwitchAPIAuth(app);

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
      "user.id": req.session?.passport?.user?.id,
    }),
  })
);
const server = app.listen(port, () => {
  const href = `http://localhost:${port}/graphiql`;
  console.log(`PostGraphiQL available at ${href} 🚀`);
});
