const fetch = require('node-fetch');
const { delay } = require('@whiskeysockets/baileys');
const tools = require('../lib/config.js');

// Optional: Simple in-memory cooldown per user
const cooldowns = new Map();

module.exports = {
  command: "apk",
  description: "Get APK info and download the APK file",
  react: "📱",

  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const senderId = msg.key.participant || sender;
    const reply = (text) => socket.sendMessage(sender, { text }, { quoted: msg });

    // === COOLDOWN (5 seconds per user) ===
    const now = Date.now();
    const userCooldown = cooldowns.get(senderId);
    if (userCooldown && now - userCooldown < 5000) {
      return reply("⏳ Please wait a few seconds before using this command again.");
    }
    cooldowns.set(senderId, now);

    if (!args.length) {
      return reply("Please provide app package or name.\nExample: `.apk com.whatsapp`");
    }

    const query = args.join(" ").trim();

    // Loading reaction
    await socket.sendMessage(sender, { react: { text: "🔍", key: msg.key } });

    // === APK Download Function ===
    async function searchAndDownload(id, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(tools.api(5, '/apps/search', { query: id, limit: 1 }));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          if (!json.datalist?.list?.length) throw new Error('No app found');

          const app = json.datalist.list[0];
          let size = "Unknown";

          try {
            size = await file_size_url(app.file.path);
          } catch (sizeErr) {
            console.warn("Size fetch failed:", sizeErr.message);
            size = "Calculating...";
          }

          return {
            name: app.name || "Unknown App",
            package: app.package || "unknown.package",
            icon: app.icon || null,
            dllink: app.file.path,
            lastup: app.updated || "Unknown",
            size,
          };
        } catch (err) {
          if (i === retries) throw err;
          await delay(1000 * (i + 1)); // Exponential backoff
        }
      }
    }

    try {
      const data = await searchAndDownload(query);

      const caption = `
╭───────────────⭓
│  *${data.name}*
│  📦 ᴘᴀᴄᴋᴀɢᴇ: \`${data.package}\`
│  📅 ᴜᴘᴅᴀᴛᴇᴅ: ${data.lastup}
│  📏 ꜱɪᴢᴇ: ${data.size}
│  
│  🔗 ᴅᴏᴡɴʟᴏᴀᴅ ʙᴇʟᴏᴡ ⬇️
╰───────────────⭓
> 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃`;

      // Send app info with icon
      if (data.icon) {
        await socket.sendMessage(sender, {
          image: { url: data.icon },
          caption,
        }, { quoted: msg });
      } else {
        await reply(caption);
      }

      // === APK Size Check (WhatsApp limit ~100MB for docs) ===
      const sizeMB = parseFloat(data.size);
      if (sizeMB > 95) {
        await reply(`⚠️ *File is large (${data.size})*\nWhatsApp may not allow sending. Try downloading from browser:\n\n${data.dllink}`);
        await socket.sendMessage(sender, { react: { text: "⚠️", key: msg.key } });
        return;
      }

      // Send APK as document
      await socket.sendMessage(sender, {
        document: { url: data.dllink },
        fileName: `${data.name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: `✅ *APK Downloaded*\n> 𝙼𝚛 𝙻𝚘𝚏𝚝`,
      }, { quoted: msg });

      await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });

    } catch (e) {
      console.error("APK Command Error:", e);
      await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });

      const errMsg = e.message || "Unknown error";
      if (errMsg.includes('No app found')) {
        return reply("❌ App not found. Try a different name or package ID.");
      }
      if (errMsg.includes('fetch failed') || errMsg.includes('network')) {
        return reply("🌐 Network error. Please try again later.");
      }

      reply(`❌ Failed to fetch APK.\nError: ${errMsg}`);
    } finally {
      // Clean up cooldown after 10 seconds
      setTimeout(() => cooldowns.delete(senderId), 10000);
    }
  }
};