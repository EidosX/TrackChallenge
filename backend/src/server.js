require("dotenv").config();

const http = require("http");
const { postgraphile } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");

const port = process.env.PORT || 3000;

http
  .createServer(
    postgraphile(process.env.PG_URL, "public", {
      appendPlugins: [PgSimplifyInflectorPlugin],
      graphqlRoute: "/graphql",
      graphiqlRoute: "/graphiql",
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
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
