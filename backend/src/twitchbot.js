const tmi = require("tmi.js");
const AuthCode = require("./schema_ext/authcode");

const twitchBot = new tmi.Client({
  channels: ["eidosmusic"],
});

twitchBot.connect();

twitchBot.on("message", (channel, tags, message, self) => {
  if (message.length == 4)
    AuthCode.handleTwitchChatCode({
      code: message.toUpperCase(),
      twitchName: tags.username,
      twitchId: tags["user-id"],
    });
});

exports.default = twitchBot;
