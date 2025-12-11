module.exports = {
  command: "unmute",
  desc: "Unmute the group (everyone can chat)",
  category: "group",
  use: ".unmute",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const { remoteJid } = msg.key;
    await sock.groupSettingUpdate(remoteJid, "not_announcement");
    await sock.sendMessage(remoteJid, { text: "🔊 Group has been unmuted." }, { quoted: msg });
  }
};
