// commands/download/song.js
'use strict';

const fetch = require('node-fetch');
const config = require('../config');

module.exports = {
  command: 'song',
  alias: ["play", "mp3", "audio", "music", "s", "so", "son", "songs"],
  description: "Download YouTube song (Audio) via Nekolabs API",
  category: "download",
  react: "🎵",
  usage: ".song <song name>",

  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const text = args.join(" ").trim();

    // ────── No input ──────
    if (!text) {
      return await socket.sendMessage(sender, {
        text: `╭━━❮ *🎵 LOFT XMD MUSIC* ❯━━┓
┃
┃ 📥 *Tafadhali andika jina la wimbo*
┃
┃ 📌 *Mfano:*
┃ • ${config.PREFIX}song Faded
┃ • ${config.PREFIX}play Alone
┃ • ${config.PREFIX}mp3 Shape of You
┃
╰━━━━━━━━━━━━━━━━━━━━━━━┛

> ✨ *Powered by Sir LOFT* ✨`
      }, { quoted: msg });
    }

    try {
      // ────── Reaction ──────
      await socket.sendMessage(sender, {
        react: { text: '⏳', key: msg.key }
      });

      // ────── API Call (Nekolabs) ──────
      const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(text)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data?.success || !data?.result?.downloadUrl) {
        await socket.sendMessage(sender, {
          react: { text: '❌', key: msg.key }
        });
        return await socket.sendMessage(sender, {
          text: `❌ *Wimbo haukupatikana!*\n\nJaribu tena kwa jina lingine.`
        }, { quoted: msg });
      }

      const meta = data.result.metadata;
      const dlUrl = data.result.downloadUrl;

      // ────── Thumbnail buffer ──────
      let buffer = null;
      try {
        const thumbRes = await fetch(meta.cover);
        buffer = Buffer.from(await thumbRes.arrayBuffer());
      } catch (e) {
        buffer = null;
      }

      // ────── Song Info Card ──────
      const caption = `╭━━❮ *🎵 SONG INFO* ❯━━┓
┃
┃ 🎧 *Title*    : ${meta.title}
┃ 📺 *Channel*  : ${meta.channel}
┃ ⏱️ *Duration* : ${meta.duration}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━┛

> ✨ *Powered by Sir LOFT* ✨
> © 2025 ʟᴏꜰᴛ Xᴍᴅ™`.trim();

      // ────── Send Thumbnail + Info ──────
      if (buffer) {
        await socket.sendMessage(sender, {
          image: buffer,
          caption,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363424095366093@newsletter',
              newsletterName: '𝙻𝚘𝚏𝚝 𝚇𝚖𝚍',
              serverMessageId: 143
            }
          }
        }, { quoted: msg });
      } else {
        await socket.sendMessage(sender, { text: caption }, { quoted: msg });
      }

      // ────── Send MP3 File ──────
      await socket.sendMessage(sender, {
        audio: { url: dlUrl },
        mimetype: "audio/mpeg",
        fileName: `${meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.mp3`,
        ptt: false
      }, { quoted: msg });

      // ────── Success Reaction ──────
      await socket.sendMessage(sender, {
        react: { text: '✅', key: msg.key }
      });

    } catch (err) {
      console.error("❌ Audio download error:", err);
      await socket.sendMessage(sender, {
        react: { text: '❌', key: msg.key }
      });
      await socket.sendMessage(sender, {
        text: `❌ *Samahani, kuna hitilafu imetokea.*\n\nJaribu tena baada ya muda mfupi.`
      }, { quoted: msg });
    }
  }
};