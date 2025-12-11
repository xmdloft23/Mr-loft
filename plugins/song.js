const fetch = require('node-fetch');

module.exports = {
  command: 'song',
  alias: ["play","mp3","audio","music","s","so","son","songs"],
  description: "Download YouTube song (Audio) via Nekolabs API",
  category: "download",
  react: "🥺",
  usage: ".song <song name>",
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return await socket.sendMessage(sender, {
        text: "*𝙳𝙾 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙰𝙽𝚈 𝙰𝚄𝙳𝙸𝙾 🥺*\n*𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 ☺️*\n\n*𝙿𝙻𝙰𝚈 ❮𝚈𝙾𝚄𝚁 𝙰𝚄𝙳𝙸𝙾 𝙽𝙰𝙼𝙴❯*\n\n*𝚆𝚁𝙸𝚃𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ❮𝙿𝙻𝙰𝚈❯ 𝙰𝙽𝙳 𝚃𝙷𝙴𝙽 𝚈𝙾𝚄𝚁 𝙰𝚄𝙳𝙸𝙾 𝙽𝙰𝙼𝙴 ☺️ 𝚃𝙷𝙴𝙽 𝚃𝙷𝙰𝚃 𝙰𝚄𝙳𝙸𝙾 𝚆𝙸𝙻𝙻 𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳 𝙰𝙽𝙳 𝚂𝙴𝙽𝚃 𝙷𝙴𝚁𝙴 🥰💞*"
      }, { quoted: msg });
    }

    try {
      // 🔹 API Call (Nekolabs)
      const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(text)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data?.success || !data?.result?.downloadUrl) {
        return await socket.sendMessage(sender, { text: "*𝚈𝙾𝚄𝚁 𝙰𝚄𝙳𝙸𝙾 𝙲𝙾𝚄𝙻𝙳 𝙽𝙾𝚃 𝙱𝙴 𝙵𝙾𝚄𝙽𝙳 🥺❤️*" }, { quoted: msg });
      }

      const meta = data.result.metadata;
      const dlUrl = data.result.downloadUrl;

      // 🔹 Try fetching the thumbnail
      let buffer;
      try {
        const thumbRes = await fetch(meta.cover);
        buffer = Buffer.from(await thumbRes.arrayBuffer());
      } catch {
        buffer = null;
      }

      // 🔹 Song info card
      const caption = `*🐢 𝙰𝚄𝙳𝙸𝙾 𝙸𝙽𝙵𝙾 🐢*
*🐢 𝙽𝙰𝙼𝙴 :❯ ${meta.title}*
*🐢 𝙲𝙷𝙰𝙽𝙽𝙴𝙻 :❯ ${meta.channel}*
*🐢 𝚃𝙸𝙼𝙴 :❯ * ${meta.duration}*
*𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃*`;

      // 🖼️ Send thumbnail + info
      if (buffer) {
        await socket.sendMessage(sender, { image: buffer, caption }, { quoted: msg });
      } else {
        await socket.sendMessage(sender, { text: caption }, { quoted: msg });
      }

      // 🎧 Send MP3 file
      await socket.sendMessage(sender, {
        audio: { url: dlUrl },
        mimetype: "audio/mpeg",
        fileName: `${meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.mp3`
      }, { quoted: msg });

    } catch (err) {
      console.error("Audio download error:", err);
      await socket.sendMessage(sender, { text: "*😔 𝙿𝙻𝙴𝙰𝚂𝙴 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽!*" }, { quoted: msg });
    }
  }
};