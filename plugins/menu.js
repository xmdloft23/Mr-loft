const config = require('../config');

/**
 * Menu Command - Displays interactive slide menu (sections)
 * Category: main
 */
module.exports = {
  command: "menu",
  description: "Displays interactive bot commands menu with sections",
  react: "🌟",
  category: "main",

  execute: async (socket, msg, args, number) => {
    const { key } = msg;
    const from = key.remoteJid;
    const sender = key.participant || from;
    const pushname = msg.pushName || "User";

    try {
      // You can keep random image if you want header image
      const MENU_IMAGES = [
        'https://files.catbox.moe/pwqazx.jpg',
        // add more quality images if you want
      ];

      const randomImage = MENU_IMAGES[Math.floor(Math.random() * MENU_IMAGES.length)];

      // ────── INTERACTIVE SECTIONS MENU ──────
      const sections = [
        {
          title: "✨ General Commands",
          rows: [
            { title: "Alive", description: "Check if bot is online", rowId: `${config.PREFIX}alive` },
            { title: "Ping", description: "Check bot response speed", rowId: `${config.PREFIX}ping` },
            { title: "Uptime", description: "Bot running time", rowId: `${config.PREFIX}uptime` },
            { title: "System", description: "Server information", rowId: `${config.PREFIX}system` },
            { title: "Owner", description: "Contact owner", rowId: `${config.PREFIX}owner` },
            { title: "Pairing Code", description: "Get pairing code", rowId: `${config.PREFIX}pair` }
          ]
        },
        {
          title: "📥 Download Commands",
          rows: [
            { title: "Song", description: "Download YouTube music", rowId: `${config.PREFIX}song` },
            { title: "Video", description: "Download YouTube video", rowId: `${config.PREFIX}video` },
            { title: "TikTok", description: "Download TikTok video", rowId: `${config.PREFIX}tiktok` },
            { title: "Facebook", description: "Download FB video", rowId: `${config.PREFIX}facebook` },
            { title: "APK", description: "Download Android app", rowId: `${config.PREFIX}apk` },
            { title: "Image Search", description: "Google image search", rowId: `${config.PREFIX}img` }
          ]
        },
        {
          title: "👑 Owner Commands",
          rows: [
            { title: "Block User", rowId: `${config.PREFIX}block` },
            { title: "Unblock User", rowId: `${config.PREFIX}unblock` },
            { title: "Delete Message", rowId: `${config.PREFIX}delete` },
            { title: "Leave Group", rowId: `${config.PREFIX}leave` },
            { title: "View Once → Normal", rowId: `${config.PREFIX}vv` },
            { title: "Join Group", rowId: `${config.PREFIX}join` }
          ]
        },
        {
          title: "🏠 Group Management",
          rows: [
            { title: "Join Group", rowId: `${config.PREFIX}join` },
            { title: "Tag All", description: "Mention everyone", rowId: `${config.PREFIX}tagall` },
            { title: "Promote", description: "Make admin", rowId: `${config.PREFIX}promote` },
            { title: "Demote", description: "Remove admin", rowId: `${config.PREFIX}demote` },
            { title: "Kick", description: "Remove member", rowId: `${config.PREFIX}kick` },
            { title: "Mute Group", rowId: `${config.PREFIX}mute` },
            { title: "Unmute Group", rowId: `${config.PREFIX}unmute` },
            { title: "Change Group Name", rowId: `${config.PREFIX}gname` },
            { title: "Change Group Description", rowId: `${config.PREFIX}gdesc` }
          ]
        }
      ];

      const listMessage = {
        text: `✨ *LOFT QUANTUM* ✨\n\n` +
              `Hello *${pushname}* ツ\n` +
              `You are using the most powerful bot 2025\n` +
              `Prefix  →  \`${config.PREFIX}\`\n` +
              `Select category you want to use...`,

        footer: "© 2025 Loft Quantum™ • Powered by Sir LOFT",
        title: "「 LOFT QUANTUM MENU 」",
        buttonText: "Click Here ↓",
        sections: sections,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422731708290@newsletter',
            newsletterName: '𝙼𝚛 𝙻𝚘𝚏𝚝',
            serverMessageId: 143
          }
        }
      };

      // Optional: Send with header image
      await socket.sendMessage(from, {
        image: { url: randomImage },
        caption: listMessage.text,
        footer: listMessage.footer,
        title: listMessage.title,
        buttonText: listMessage.buttonText,
        sections: listMessage.sections,
        contextInfo: listMessage.contextInfo
      }, { quoted: msg });

      // Alternative (no image header - cleaner):
      /*
      await socket.sendMessage(from, { list: listMessage }, { quoted: msg });
      */

    } catch (error) {
      console.error("❌ Menu Error:", error);
      await socket.sendMessage(from, {
        text: `❌ *Menu failed to load*\n${error.message ? '```' + error.message + '```' : ''}`
      }, { quoted: msg });
    }
  }
};