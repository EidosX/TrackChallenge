const passport = require("passport");
const OAuth2Strategy = require("passport-oauth").OAuth2Strategy;
const request = require("request");
const { pool } = require("../pgDb");

function upsertTwitchUser({ twitch_id, twitch_nickname, name, bio }, callback) {
  pool.query(
    "select user_id from tc_priv.upsert_twitch_user($1, $2, $3, $4)",
    [twitch_id, twitch_nickname, name, bio],
    (err, res) => callback(err, res)
  );
}

module.exports = {
  upsertTwitchUser,
  setupTwitchAPIAuth: (app) => {
    OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
      var options = {
        url: "https://api.twitch.tv/helix/users",
        method: "GET",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Accept: "application/vnd.twitchtv.v5+json",
          Authorization: "Bearer " + accessToken,
        },
      };

      request(options, function (error, response, body) {
        if (response && response.statusCode == 200) done(null, JSON.parse(body));
        else done(JSON.parse(body));
      });
    };
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    passport.use(
      "twitch",
      new OAuth2Strategy(
        {
          authorizationURL: "https://id.twitch.tv/oauth2/authorize",
          tokenURL: "https://id.twitch.tv/oauth2/token",
          clientID: process.env.TWITCH_CLIENT_ID,
          clientSecret: process.env.TWITCH_SECRET,
          callbackURL: process.env.TWITCH_AUTH_CALLBACK_URL,
          state: true,
        },
        function (accessToken, refreshToken, profile, done) {
          const name = profile.data[0].display_name;
          const bio = profile.data[0].description ?? "";
          const twitch_id = profile.data[0].id;
          const twitch_nickname = profile.data[0].login;

          upsertTwitchUser({ twitch_id, twitch_nickname, name, bio }, (err, res) => {
            if (err) return done(err, null);
            return done(null, {
              id: res.rows[0].user_id,
              accessToken,
              refreshToken,
            });
          });
        }
      )
    );

    app.get("/auth/twitch", passport.authenticate("twitch", { scope: "" }));
    app.get(
      "/auth/twitch/callback",
      passport.authenticate("twitch", { successRedirect: "/", failureRedirect: "/" })
    );
  },
};
