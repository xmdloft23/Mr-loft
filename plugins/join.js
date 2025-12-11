module.exports = {
  command: "join",
  desc: "Join a group via invite link",
  category: "owner",
  use: ".join <group-invite-link>",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg, args) => {
    const { remoteJid } = msg.key;
    const link = args[0];

    if (!link || !link.includes("whatsapp.com")) {
      return sock.sendMessage(remoteJid, {
        text: "🔗 Please provide a valid WhatsApp group invite link."
      }, { quoted: msg });
    }

    const code = link.split("https://chat.whatsapp.com/")[1].trim();

    try {
      await sock.groupAcceptInvite(code);
      await sock.sendMessage(remoteJid, { text: "✅ Successfully joined the group!" }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(remoteJid, { text: "❌ Failed to join the group." }, { quoted: msg });
    }
  }
};
