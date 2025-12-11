const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: "vv",
  alias: ["antivv", "avv", "viewonce", "open", "openphoto", "openvideo", "vvphoto", "vvphoto"],
  description: "Owner Only - retrieve quoted media (photo, video, audio)",
  category: "owner",
  react: "😃",
  usage: ".vv2 (reply on media)",
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const fromMe = msg.key.fromMe;
    const isCreator = fromMe; // Mini bot usually treats 'fromMe' as owner check
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    try {
      // Initial react 😃
      await socket.sendMessage(sender, { react: { text: "😃", key: msg.key } });

      // Owner check
      if (!isCreator) return;

      // Agar koi reply nahi kiya gaya
      if (!quoted) {
        await socket.sendMessage(sender, { react: { text: "😊", key: msg.key } });
        return await socket.sendMessage(sender, {
          text: "*𝙷𝙰𝚂 𝙰𝙽𝚈𝙾𝙽𝙴 𝚂𝙴𝙽𝚃 𝚈𝙾𝚄 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙿𝙷𝙾𝚃𝙾, 𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝙰𝚄𝙳𝙸𝙾 🥺 𝙰𝙽𝙳 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝚂𝙴𝙴 𝙸𝚃 🤔*\n\n*𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 ☺️*\n\n*❮𝚅𝚅2❯*\n\n*𝚃𝙷𝙴𝙽 𝚃𝙷𝙰𝚃 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙿𝙷𝙾𝚃𝙾, 𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝙰𝚄𝙳𝙸𝙾 𝚆𝙸𝙻𝙻 𝙾𝙿𝙴𝙽 🥰*"
        }, { quoted: msg });
      }

      // Identify media type
      let type = Object.keys(quoted)[0];
      if (!["imageMessage", "videoMessage", "audioMessage"].includes(type)) {
        await socket.sendMessage(sender, { react: { text: "🥺", key: msg.key } });
        return await socket.sendMessage(sender, {
          text: "*𝚈𝙾𝚄 𝙾𝙽𝙻𝚈 𝙽𝙴𝙴𝙳 𝚃𝙾 𝙼𝙴𝙽𝚃𝙸𝙾𝙽 𝚃𝙷𝙴 𝙿𝙷𝙾𝚃𝙾, 𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝙰𝚄𝙳𝙸𝙾 🥺*"
        }, { quoted: msg });
      }

      // Download media
      const stream = await downloadContentFromMessage(quoted[type], type.replace("Message", ""));
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Prepare message content
      let sendContent = {};
      if (type === "imageMessage") {
        sendContent = {
          image: buffer,
          caption: quoted[type]?.caption || "",
          mimetype: quoted[type]?.mimetype || "image/jpeg"
        };
      } else if (type === "videoMessage") {
        sendContent = {
          video: buffer,
          caption: quoted[type]?.caption || "",
          mimetype: quoted[type]?.mimetype || "video/mp4"
        };
      } else if (type === "audioMessage") {
        sendContent = {
          audio: buffer,
          mimetype: quoted[type]?.mimetype || "audio/mp4",
          ptt: quoted[type]?.ptt || false
        };
      }

      // Send back media
      await socket.sendMessage(sender, sendContent, { quoted: msg });

      // React after success 😍
      await socket.sendMessage(sender, { react: { text: "😍", key: msg.key } });

    } catch (error) {
      console.error("VV2 Error:", error);
      await socket.sendMessage(sender, { react: { text: "😔", key: msg.key } });
      await socket.sendMessage(sender, {
        text: '*𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝚁𝙸𝚃𝙴 ❮𝚅𝚅2❯ 𝙰𝙶𝙰𝙸𝙽 🥺*\n\n_Error:_ ${error.message}'
      }, { quoted: msg });
    }
  }
};