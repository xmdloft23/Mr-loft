module.exports = {
  command: "delete",
  desc: "Delete the replied message for everyone",
  category: "group",
  use: ".delete (reply to a message)",
  filename: __filename,
  fromMe: false,

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");

      if (!isGroup)
        return await sock.sendMessage(from, { text: "😅" }, { quoted: msg });

      // Group metadata se participants nikal lo
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants.map(p => p.id);
      const groupAdmins = groupMetadata.participants
        .filter(p => p.admin !== null)
        .map(p => p.id);

      // Sender admin check
      const sender = msg.key.participant || msg.sender;
      const isAdmin = groupAdmins.includes(sender);

      if (!isAdmin)
        return await sock.sendMessage(from, { text: "☺️" }, { quoted: msg });

      // Reply check
      const stanzaId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      if (!stanzaId)
        return await sock.sendMessage(from, { text: "🥳" }, { quoted: msg });

      // Delete message
      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: stanzaId,
          participant: participant,
        },
      });

      await sock.sendMessage(from, { text: "*✅ Message delete enabled!*" }, { quoted: msg });

    } catch (err) {
      console.error("Delete Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to delete the message." }, { quoted: msg });
    }
  }
};