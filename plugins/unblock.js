module.exports = {
  command: "unblock",
  desc: "Unblock a user",
  category: "admin",
  use: ".unblock <number or reply>",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg, args) => {
    const { remoteJid, participant } = msg.key;
    const quoted = msg.quoted?.sender || msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = args[0]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    let userToUnblock = quoted || target;

    if (!userToUnblock) {
      return await sock.sendMessage(remoteJid, {
        text: "⚠️ Please provide a number or reply to a message."
      }, { quoted: msg });
    }

    try {
      await sock.updateBlockStatus(userToUnblock, "unblock");
      await sock.sendMessage(remoteJid, {
        text: `✅ Unblocked ${userToUnblock.split("@")[0]}`
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(remoteJid, {
        text: "❌ Failed to unblock the user."
      }, { quoted: msg });
    }
  }
};
