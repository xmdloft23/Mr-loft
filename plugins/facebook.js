const axios = require('axios');

function formatDuration(ms) {
  if (!ms) return "N/A";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Active handlers to prevent duplicates & memory leaks
const activeHandlers = new Map();

module.exports = {
  command: "facebook",
  description: "Download Facebook Reel/Video (HD/SD) with quality selection",
  react: "DOWNLOAD",
  category: "download",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const url = args[0]?.trim();
    const senderName = msg.pushName || "User";

    // === Input Validation ===
    if (!url || !url.includes("facebook.com")) {
      return socket.sendMessage(from, {
        text: "❌ *Invalid or missing URL!*\n\n*Usage:* `.facebook https://www.facebook.com/reel/xyz`",
      }, { quoted: msg });
    }

    try {
      // === Fetch from your API ===
      const { data: api } = await axios.get(
        `https://api.princetechn.com/api/download/facebook?apikey=prince&url=${encodeURIComponent(url)}`
      );

      if (!api.status || !api.data) {
        return socket.sendMessage(from, {
          text: "API Error: No data received. Try again later.",
        }, { quoted: msg });
      }

      const { title, duration, views, reactions, comments, urls } = api.data;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return socket.sendMessage(from, {
          text: "No video links found. The reel may be private or removed.",
        }, { quoted: msg });
      }

      const hdVideo = urls[0];
      const sdVideo = urls[1] || null;

      // === Build Rich Caption ===
      const caption = `
*╭━━━━━━━━━━━━━━━━━━⭓*
*│*  *REQUESTED BY:* @${senderName.split(" ")[0]}
*│*  
*│*  *TITLE:* ${title || "Unknown"}
*│*  *DURATION:* \`${formatDuration(duration)}\`
*│*  *VIEWS:* \`${views?.toLocaleString() || "N/A"}\`
*│*  *LIKES:* \`${reactions?.toLocaleString() || "N/A"}\`
*│*  *COMMENTS:* \`${comments?.toLocaleString() || "N/A"}\`
*│*  *SOURCE:* [Tap Here](${url})
*│*  
*│*  *Choose Quality:*
*│*  
*│*  *1. HD Quality* (1080p)
*│*  *2. SD Quality* (480p)
*│*  *3. Audio Only* (Not Available)
*│*  
*╰━━━━━━━━━━━━━━━━━━⭓*

> Reply with *1*, *2*, or *3* to download
> *Powered by 𝙼𝚛 𝙻𝚘𝚏𝚝*
      `.trim();

      // === Send Preview + Menu ===
      const previewUrl = "https://files.catbox.moe/deeo6l.jpg";
      const sentMsg = await socket.sendMessage(from, {
        image: { url: previewUrl },
        caption,
        mentions: [msg.key.participant || from],
      }, { quoted: msg });

      const menuMsgId = sentMsg.key.id;

      // === Prevent Duplicate Handlers ===
      if (activeHandlers.has(menuMsgId)) return;
      const handlerTimeout = setTimeout(() => activeHandlers.delete(menuMsgId), 3 * 60 * 1000);

      // === Reply Handler ===
      const replyHandler = async (update) => {
        const m = update.messages?.[0];
        if (!m?.message) return;

        const replyTo = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (replyTo !== menuMsgId || m.key.remoteJid !== from) return;

        const choice = (m.message.conversation || m.message.extendedTextMessage?.text || "").trim();

        // React to selection
        await socket.sendMessage(from, { react: { text: "CHECKMARK", key: m.key } });

        switch (choice) {
          case "1":
            if (!hdVideo) {
              return socket.sendMessage(from, { text: "HD link unavailable." }, { quoted: m });
            }
            await socket.sendMessage(from, {
              video: { url: hdVideo },
              mimetype: "video/mp4",
              caption: `*HD Video Downloaded*\n> _Quality: 1080p_ • 𝙼𝚛 𝙻𝚘𝚏𝚝`
            }, { quoted: m });
            break;

          case "2":
            if (!sdVideo) {
              return socket.sendMessage(from, { text: "SD link unavailable." }, { quoted: m });
            }
            await socket.sendMessage(from, {
              video: { url: sdVideo },
              mimetype: "video/mp4",
              caption: `*SD Video Downloaded*\n> _Quality: 480p_ • 𝙼𝚛 𝙻𝚘𝚏𝚝`
            }, { quoted: m });
            break;

          case "3":
            await socket.sendMessage(from, {
              text: "Audio extraction is *not supported* for Facebook videos.",
            }, { quoted: m });
            break;

          default:
            await socket.sendMessage(from, {
              text: "Invalid choice. Reply with *1* (HD), *2* (SD), or *3* (Audio).",
            }, { quoted: m });
            return;
        }

        // === Cleanup ===
        socket.ev.off("messages.upsert", replyHandler);
        clearTimeout(handlerTimeout);
        activeHandlers.delete(menuMsgId);
      };

      socket.ev.on("messages.upsert", replyHandler);
      activeHandlers.set(menuMsgId, { handler: replyHandler, timeout: handlerTimeout });

    } catch (error) {
      console.error("Facebook Downloader Error:", error.message);
      await socket.sendMessage(from, {
        text: `Download Failed\n\`\`\`${error.message}\`\`\``,
      }, { quoted: msg });
    }
  }
};