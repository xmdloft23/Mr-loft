// ---------------------------------------------------------------
//  XNXX Search & Download (Baileys + public XNXX scraper API)
// ---------------------------------------------------------------
const axios = require('axios');

const ACTIVE_HANDLERS = new Map();          // { msgId: { listener, qualityListener, timeout } }
const HANDLER_TTL = 5 * 60 * 1000;           // 5 min expiry

module.exports = {
  command: "xnxx",
  description: "Search and download XNXX videos (high/low quality)",
  react: "🔞",
  category: "adult",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(" ").trim();

    // ------------------- 1. Input validation -------------------
    if (!query) {
      return socket.sendMessage(
        from,
        { text: "❌ *Please provide a search keyword!*\n\nExample: *.xnxx mia khalifa*" },
        { quoted: msg }
      );
    }

    try {
      // ------------------- 2. Search videos -------------------
      const searchRes = await axios.get(
        `https://www.xnxx.com/api/search?q=${encodeURIComponent(query)}`
      );
      const videos = searchRes.data?.results?.slice(0, 10) || [];

      if (!videos.length) {
        return socket.sendMessage(
          from,
          { text: `❌ No results found for "${query}".` },
          { quoted: msg }
        );
      }

      // ------------------- 3. Build selection menu -------------------
      let menu = `🔞 *XNXX Results for:* ${query}\n\n`;
      videos.forEach((v, i) => (menu += `*${i + 1}.* ${v.title}\n`));
      menu += `\n📥 *Reply with a number (1-${videos.length}) to pick a video.*\n\n> 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃`;

      const sent = await socket.sendMessage(from, { text: menu }, { quoted: msg });
      const menuMsgId = sent.key.id;

      // ------------------- 4. Reply handler (video pick) -------------------
      const pickListener = async (update) => {
        const m = update.messages?.[0];
        if (!m?.message) return;

        const replyTo = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (replyTo !== menuMsgId) return;

        const txt = (m.message.conversation || m.message.extendedTextMessage?.text || "").trim();
        const idx = parseInt(txt, 10);
        if (isNaN(idx) || idx < 1 || idx > videos.length) {
          return socket.sendMessage(
            from,
            { text: `❌ Invalid number. Use 1-${videos.length}.` },
            { quoted: m }
          );
        }

        await socket.sendMessage(from, { react: { text: "✅", key: m.key } });

        const chosen = videos[idx - 1];

        // ------------------- 5. Quality selection -------------------
        const qualityMsg = await socket.sendMessage(
          from,
          {
            text:
              `✅ *Selected:* ${chosen.title}\n\n` +
              `🔢 *Choose quality:*\n` +
              `1️⃣ High Quality (larger file)\n` +
              `2️⃣ Low Quality (smaller file)\n\n` +
              `Reply **1** or **2**.`
          },
          { quoted: m }
        );
        const qualityMsgId = qualityMsg.key.id;

        // ------------------- 6. Quality reply handler -------------------
        const qualityListener = async (upd2) => {
          const m2 = upd2.messages?.[0];
          if (!m2?.message) return;

          const replyTo2 = m2.message?.extendedTextMessage?.contextInfo?.stanzaId;
          if (replyTo2 !== qualityMsgId) return;

          const choice = parseInt(
            (m2.message.conversation || m2.message.extendedTextMessage?.text || "").trim(),
            10
          );

          if (![1, 2].includes(choice)) {
            return socket.sendMessage(
              from,
              { text: "❌ Reply with **1** (High) or **2** (Low)." },
              { quoted: m2 }
            );
          }

          await socket.sendMessage(from, { react: { text: "⏬", key: m2.key } });

          // ------------------- 7. Fetch video URL -------------------
          try {
            const videoRes = await axios.get(
              `https://www.xnxx.com/api/video?id=${chosen.id}&quality=${choice === 1 ? "high" : "low"}`
            );
            const videoUrl = videoRes.data?.url;
            if (!videoUrl) throw new Error("Video URL not returned");

            const buffer = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;

            await socket.sendMessage(
              from,
              {
                video: Buffer.from(buffer),
                mimetype: "video/mp4",
                caption:
                  `${chosen.title}\n\n` +
                  `💾 ${choice === 1 ? "High" : "Low"} Quality\n\n` +
                  `> 𝙼𝚛 𝙻𝚘𝚏𝚝`
              },
              { quoted: m2 }
            );
          } catch (e) {
            console.error("Download error:", e);
            await socket.sendMessage(
              from,
              { text: "❌ Failed to download the video. Try again later." },
              { quoted: m2 }
            );
          } finally {
            // Clean up quality listener
            socket.ev.off("messages.upsert", qualityListener);
          }
        };

        socket.ev.on("messages.upsert", qualityListener);

        // Store quality listener for possible timeout
        const handler = ACTIVE_HANDLERS.get(menuMsgId) || {};
        handler.qualityListener = qualityListener;
        ACTIVE_HANDLERS.set(menuMsgId, handler);
      };

      socket.ev.on("messages.upsert", pickListener);

      // ------------------- 8. Cleanup on timeout -------------------
      const timeout = setTimeout(() => {
        socket.ev.off("messages.upsert", pickListener);
        const h = ACTIVE_HANDLERS.get(menuMsgId);
        if (h?.qualityListener) socket.ev.off("messages.upsert", h.qualityListener);
        ACTIVE_HANDLERS.delete(menuMsgId);
      }, HANDLER_TTL);

      ACTIVE_HANDLERS.set(menuMsgId, { listener: pickListener, timeout });
    } catch (err) {
      console.error("XNXX command error:", err);
      await socket.sendMessage(
        from,
        { text: `⚠️ *Error:* ${err.message || "Unknown error."}` },
        { quoted: msg }
      );
    }
  },
};