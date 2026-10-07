// commands/main/menu.js
'use strict';

const config = require('../config');

module.exports = {
    name: "menu",
    command: "menu",
    aliases: ["help", "cmds"],
    description: "Displays bot commands list.",
    react: "🌟",
    category: "main",

    execute: async (socket, msg, args, number) => {
        const from = msg.key.remoteJid;
        const pushname = msg.pushName || "User";

        const menuText = `
*LOFT XMD MENU*

User: ${pushname}
Prefix: \`${config.PREFIX}\`
Version: 1.0.0

━━━━━━━━━━━━━━━━━━

*GENERAL*
• ${config.PREFIX}alive
• ${config.PREFIX}uptime
• ${config.PREFIX}ping
• ${config.PREFIX}system
• ${config.PREFIX}owner
• ${config.PREFIX}pair
• ${config.PREFIX}menu
• ${config.PREFIX}grouplink
• ${config.PREFIX}autobio

*DOWNLOAD*
• ${config.PREFIX}song
• ${config.PREFIX}video
• ${config.PREFIX}tiktok
• ${config.PREFIX}facebook
• ${config.PREFIX}apk
• ${config.PREFIX}img

*GROUP*
• ${config.PREFIX}join
• ${config.PREFIX}leave
• ${config.PREFIX}bc
• ${config.PREFIX}hidetag
• ${config.PREFIX}welcome
• ${config.PREFIX}mute
• ${config.PREFIX}unmute
• ${config.PREFIX}kick
• ${config.PREFIX}add
• ${config.PREFIX}tagall
• ${config.PREFIX}promote
• ${config.PREFIX}demote
• ${config.PREFIX}gname
• ${config.PREFIX}gdesc

*OWNER*
• ${config.PREFIX}block
• ${config.PREFIX}unblock
• ${config.PREFIX}delete
• ${config.PREFIX}leave
• ${config.PREFIX}vv
• ${config.PREFIX}join
• ${config.PREFIX}jid

*AI*
• ${config.PREFIX}loft
• ${config.PREFIX}gpt
• ${config.PREFIX}gemini
• ${config.PREFIX}imagine

*TOOLS*
• ${config.PREFIX}sticker
• ${config.PREFIX}toimg
• ${config.PREFIX}tts
• ${config.PREFIX}translate

━━━━━━━━━━━━━━━━━━

Powered by Sir LOFT
© 2026 Loft Xmd
`.trim();

        await socket.sendMessage(from, {
            text: menuText
        }, { quoted: msg });
    }
};