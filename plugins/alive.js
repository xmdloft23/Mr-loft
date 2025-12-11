module.exports = {
  command: "alive",
  description: "Check if bot is running",
  category: "info",

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const jidName = sender.split("@")[0];

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const speed = Math.floor(Math.random() * 90 + 10);

      const caption = `
╭───────────────⭓ 
│  🤖 ʙᴏᴛ ɴᴀᴍᴇ: 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝
│  💠 ꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ ✅
│  ⚡ ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ
│  👤 ᴜꜱᴇʀ: @${jidName}
│  📆 ᴅᴀᴛᴇ: ${date}
│  ⏰ ᴛɪᴍᴇ: ${time}
│  🔰 ᴘʀᴇꜰɪx: .
╰───────────────⭓`;

      // Envoyer simplement le message avec l'image
      await sock.sendMessage(
        jid,
        {
          image: { url: 'https://files.catbox.moe/xgsa85.jpg' },
          caption: caption
        },
        { quoted: msg }
      );

    } catch (err) {
      console.error("❌ Error in alive command:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error checking bot status",
      });
    }
  },
};
