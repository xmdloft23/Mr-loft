const config = require('../config');

/**
 * Menu Command - Displays a stylish command menu with a random image
 * Category: main
 */
module.exports = {
  command: "menu",
  description: "Displays bot commands menu with a random image.",
  react: "smile",
  category: "main",

  execute: async (socket, msg, args, number) => {
    const { key } = msg;
    const from = key.remoteJid;
    const sender = key.participant || from;
    const pushname = msg.pushName || "User";

    try {
      // ────── RANDOM IMAGE POOL (High-quality, stable hosts) ──────
      const MENU_IMAGES = [
        'https://files.catbox.moe/ursrow.png',
      ];

      const getRandomImage = () => 
        MENU_IMAGES[Math.floor(Math.random() * MENU_IMAGES.length)];

      // ────── DYNAMIC MENU TEXT (Clean, Structured, Maintainable) ──────
      const menuText = `
╭━━━━━━━━━━━━━━━━━━━━━━━╮
│   *ʟᴏꜰᴛ ᴋɴɪɢʜᴛ* ㋛ ꜰʀᴇᴇ ʙᴏᴛ │
╰━━━━━━━━━━━━━━━━━━━━━━━╯
✦ *Bot Name:* ʟᴏꜰᴛ ᴋɴɪɢʜᴛ
✦ *Owner:* 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃
✦ *Version:* 𝙻𝚊𝚝𝚎𝚜𝚝 𝚀𝚞𝚊𝚗𝚝𝚞𝚖
✦ *Platform:* 𝚀𝚞𝚊𝚗𝚝𝚞𝚖 (𝙻𝚒𝚗𝚞𝚡 𝟸𝟸.𝟶𝟺)
✦ *User:* ${pushname}
✦ *Prefix:* \`${config.PREFIX}\`
━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Welcome to Quantum Loft!* ✨
💡 *Thanks for using our bot!*

┏━━❮ *GENERAL COMMANDS* 
┃ • ${config.PREFIX}alive
┃ • ${config.PREFIX}uptime
┃ • ${config.PREFIX}ping
┃ • ${config.PREFIX}system
┃ • ${config.PREFIX}owner
┃ • ${config.PREFIX}pair
┃ • ${config.PREFIX}menu
┃ • ${config.PREFIX}grouplink
┃ • ${config.PREFIX}autobio
┗━━━━━━━━━━━━━━━━━━━━━

┏━━❮ *DOWNLOAD COMMANDS* 
┃ • ${config.PREFIX}song
┃ • ${config.PREFIX}video
┃ • ${config.PREFIX}tiktok
┃ • ${config.PREFIX}facebook
┃ • ${config.PREFIX}apk
┃ • ${config.PREFIX}img
┗━━━━━━━━━━━━━━━━━━━━━

┏━━❮ *OWNER ONLY* ❯━━┓
┃ • ${config.PREFIX}block
┃ • ${config.PREFIX}unblock
┃ • ${config.PREFIX}delete
┃ • ${config.PREFIX}leave
┃ • ${config.PREFIX}vv
┃ • ${config.PREFIX}join
┃ • ${config.PREFIX}jid
┗━━━━━━━━━━━━━━━━━━━━

┏━━❮ *GROUP COMMANDS* 
┃ • ${config.PREFIX}join
┃ • ${config.PREFIX}leave
┃ • ${config.PREFIX}bc
┃ • ${config.PREFIX}hidetag
┃ • ${config.PREFIX}welcome
┃ • ${config.PREFIX}mute
┃ • ${config.PREFIX}unmute
┃ • ${config.PREFIX}kick
┃ • ${config.PREFIX}add
┃ • ${config.PREFIX}tagall
┃ • ${config.PREFIX}promote
┃ • ${config.PREFIX}demote
┃ • ${config.PREFIX}gname
┃ • ${config.PREFIX}gdesc
┗━━━━━━━━━━━━━━━━━━━━

> ✨ *Powered by Sir LOFT* ✨
> © 2026 ʟᴏꜰᴛ Qᴜᴀɴᴛᴜᴍ™
`.trim();

      // ────── SEND MENU WITH IMAGE ──────
      await socket.sendMessage(from, {
        image: { url: getRandomImage() },
        caption: menuText,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422731708290@newsletter',
            newsletterName: 'ʟᴏꜰᴛ Qᴜᴀɴᴛᴜᴍ™',
            serverMessageId: 143
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error("❌ Menu Command Error:", error);
      await socket.sendMessage(from, {
        text: `❌ *Menu Error*\n\`\`\`${error.message}\`\`\``
      }, { quoted: msg });
    }
  }
};
