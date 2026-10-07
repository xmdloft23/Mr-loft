// commands/info/alive.js
'use strict';

const config = require('../config');

module.exports = {
  command: "alive",
  description: "Check if bot is running",
  category: "info",
  react: "💚",

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const jidName = sender.split("@")[0];

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const speed = Math.floor(Math.random() * 90 + 10);
      const prefix = config.PREFIX || '.';

      const caption = `
╭───────────────⭓
│  🤖 ʙᴏᴛ ɴᴀᴍᴇ: 𝙻𝚘𝚏𝚝 𝚇𝚖𝚍
│  💠 ꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ ✅
│  ⚡ ꜱᴘᴇᴇᴅ: ${speed} ᴍꜱ
│  👤 ᴜꜱᴇʀ: @${jidName}
│  📆 ᴅᴀᴛᴇ: ${date}
│  ⏰ ᴛɪᴍᴇ: ${time}
│  🔰 ᴘʀᴇꜰɪx: ${prefix}
╰───────────────⭓

> ✨ *Powered by Sir LOFT* ✨
> © 2026 ʟᴏꜰᴛ Xᴍᴅ™
`.trim();

      await sock.sendMessage(
        jid,
        {
          thumbnail: { url: 'https://raw.githubusercontent.com/xmdloft23/Bot-master/main/loft/tech.jpg' },
          caption: caption,
          mentions: [sender]
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