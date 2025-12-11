module.exports = {
  command: "block",
  desc: "Block a user",
  category: "admin",
  use: ".block <number or reply>",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg, args) => {
    const { remoteJid, participant } = msg.key;
    const quoted = msg.quoted?.sender || msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = args[0]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    let userToBlock = quoted || target;

    if (!userToBlock) {
      return await sock.sendMessage(remoteJid, {
        text: "⚠️ Please provide a number or reply to a message."
      }, { quoted: msg });
    }

    try {
      await sock.updateBlockStatus(userToBlock, "block");
      await sock.sendMessage(remoteJid, {
        text: `✅ Blocked ${userToBlock.split("@")[0]}`
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(remoteJid, {
        text: "❌ Failed to block the user."
      }, { quoted: msg });
    }
  }
};
