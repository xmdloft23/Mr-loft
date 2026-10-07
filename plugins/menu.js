// commands/main/menucat.js
'use strict';

const config = require('../config');

module.exports = {
    name: "menu",
    command: "menucat",
    aliases: ["mc", "catmenu"],
    description: "Shows commands of a selected category.",
    react: "📂",
    category: "main",

    execute: async (socket, msg, args, number) => {
        const from = msg.key.remoteJid;
        const category = (args[0] || '').toLowerCase();

        const categories = {
            general: {
                title: '🌟 GENERAL COMMANDS',
                commands: ['alive', 'uptime', 'ping', 'system', 'owner', 'pair', 'menu', 'grouplink', 'autobio']
            },
            download: {
                title: '📥 DOWNLOAD COMMANDS',
                commands: ['song', 'video', 'tiktok', 'facebook', 'apk', 'img']
            },
            group: {
                title: '👥 GROUP COMMANDS',
                commands: ['join', 'leave', 'bc', 'hidetag', 'welcome', 'mute', 'unmute', 'kick', 'add', 'tagall', 'promote', 'demote', 'gname', 'gdesc']
            },
            owner: {
                title: '🔒 OWNER COMMANDS',
                commands: ['block', 'unblock', 'delete', 'leave', 'vv', 'join', 'jid']
            },
            ai: {
                title: '🤖 AI COMMANDS',
                commands: ['loft', 'gpt', 'gemini', 'imagine']
            },
            tools: {
                title: '🛠️ TOOLS COMMANDS',
                commands: ['sticker', 'toimg', 'tts', 'translate']
            }
        };

        if (!category || !categories[category]) {
            return await socket.sendMessage(from, {
                text: `❌ *Category haipo!*\n\nChagua moja ya hizi:\n${Object.keys(categories).map(c => `• ${config.PREFIX}menucat ${c}`).join('\n')}`
            }, { quoted: msg });
        }

        const data = categories[category];
        const list = data.commands.map(cmd => `┃ • ${config.PREFIX}${cmd}`).join('\n');

        const text = `
┏━━❮ *${data.title}* ❯━━┓
${list}
┗━━━━━━━━━━━━━━━━━━━━━━━┛

> ℹ️ *Return To Main Menu:* ${config.PREFIX}menu
`.trim();

        await socket.sendMessage(from, {
            text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363424095366093@newsletter',
                    newsletterName: '𝙻𝚘𝚏𝚝 𝚇𝚖𝚍',
                    serverMessageId: 143
                },
                // ✅ Thumbnail imeongezwa hapa
                thumbnail: { url: 'https://raw.githubusercontent.com/xmdloft23/Bot-master/main/loft/tech.jpg' }
            }
        }, { quoted: msg });
    }
};