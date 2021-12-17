const { Pool } = require("pg");

const pgDb = process.env.PG_DB ?? "tc";
const pgPort = process.env.PG_PORT ?? 5432;
const pgHost = process.env.PG_HOST ?? "localhost";
const pgGraphileUser = "admin";
const pgGraphilePassword = process.env.PG_GRAPHILE_PASSWORD;
const pool = new Pool({
  connectionString: `postgres://${pgGraphileUser}:${pgGraphilePassword}@${pgHost}:${pgPort}/${pgDb}`,
});
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});
module.exports = {
  pool,
};
