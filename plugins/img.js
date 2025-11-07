const gis = require("g-i-s");
const {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");

module.exports = {
  command: "img",
  description: "👾 Google Image Search (reply 1 = image, 2 = doc, 3 = 10 more images)",
  react: "📸",
  category: "media",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const pushname = msg.pushName || "User";
    const query = args.join(" ");

    if (!query) {
      return socket.sendMessage(from, {
        text: `🔍 *Google Image Search*\n\nPlease enter a query!\n\nExample: \`.img cat\``,
      }, { quoted: msg });
    }

    // Send "searching" reaction
    await socket.sendMessage(from, { react: { text: "🔍", key: msg.key } });

    try {
      // Use promisified gis
      const results = await new Promise((resolve, reject) => {
        gis(query, (error, results) => {
          if (error) return reject(error);
          resolve(results || []);
        });
      });

      if (!results || results.length < 3) {
        await socket.sendMessage(from, { react: { text: "❌", key: msg.key } });
        return socket.sendMessage(from, {
          text: "❌ Not enough images found. Try another keyword.",
        }, { quoted: msg });
      }

      const img1 = results[0].url;
      const img2 = results[1].url;
      const moreImages = results.slice(2, 12).map(r => r.url);

      const caption = `
╭───────────────⭓ 
│  👤 ʀᴇQᴜᴇꜱᴛᴇᴅ ʙʏ: ${pushname}
│  🔍 Qᴜᴇʀʏ: ${query}
│  
│  📸 ʀᴇᴘʟʏ ᴡɪᴛʜ:
│  
│  ╭─────────────●●►
│  ├ 🖼️ *1* → ɪᴍᴀɢᴇ ᴛʏᴘᴇ
│  ├ 📄 *2* → ᴅᴏᴄᴜᴍᴇɴᴛ ᴛʏᴘᴇ
│  ├ 🖼️ *3* → 10 ᴍᴏʀᴇ ɪᴍᴀɢᴇꜱ
│  ╰─────────────●●►
│  
│  ● 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃 ●
╰───────────────⭓`;

      const sentMsg = await socket.sendMessage(from, {
        image: { url: img1 },
        caption,
      }, { quoted: msg });

      // === CAROUSEL MESSAGE ===
      const cards = [];
      const topResults = results.slice(0, 10);

      for (let i = 0; i < topResults.length; i++) {
        const imageUrl = topResults[i].url;

        let media;
        try {
          media = await prepareWAMessageMedia(
            { image: { url: imageUrl } },
            { upload: socket.waUploadToServer }
          );
        } catch (uploadErr) {
          console.error(`Failed to upload image ${i + 1}:`, uploadErr);
          continue;
        }

        const header = proto.Message.InteractiveMessage.Header.create({
          ...media,
          title: `📸 Result ${i + 1}: ${query}\n\n👤 *Requested by:* ${pushname}`,
          subtitle: "ᴍɪɴɪ ɪɴᴄᴏɴɴᴜ xᴅ ᴠ²",
          hasMediaAttachment: true, // Fixed: must be true
        });

        cards.push({
          header,
          body: proto.Message.InteractiveMessage.Body.create({
            text: `\n\n● 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃 ●`
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: []
          })
        });
      }

      if (cards.length > 0) {
        const carouselMessage = generateWAMessageFromContent(from, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({ text: "" }),
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
                  cards,
                  messageVersion: 1
                }),
                contextInfo: {
                  stanzaId: msg.key.id,
                  participant: msg.key.participant || from,
                  quotedMessage: msg.message
                }
              })
            }
          }
        }, {});

        await socket.relayMessage(from, carouselMessage.message, {
          messageId: carouselMessage.key.id
        });
      }

      // === REPLY LISTENER ===
      const msgId = sentMsg.key.id;
      let listenerActive = true;

      const handler = async (update) => {
        if (!listenerActive) return;
        try {
          const m = update.messages[0];
          if (!m || !m.message) return;

          const contextInfo = m.message.extendedTextMessage?.contextInfo;
          const isReply = contextInfo?.stanzaId === msgId;
          const replyFrom = m.key.remoteJid;

          if (!isReply || replyFrom !== from) return;

          const text = (
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ""
          ).trim().toLowerCase();

          await socket.sendMessage(from, { react: { text: "✅", key: m.key } });

          switch (text) {
            case "1":
              await socket.sendMessage(from, {
                image: { url: img1 },
                caption: `✅ *Here is your image!*\n> 𝙼𝚛 𝙻𝚘𝚏𝚝`,
              }, { quoted: m });
              break;

            case "2":
              await socket.sendMessage(from, {
                document: { url: img2 },
                mimetype: "image/jpeg",
                fileName: `img_${Date.now()}.jpg`,
                caption: `📄 *Here is your image as document!*\n> 𝙼𝚛 𝙻𝚘𝚏𝚝`,
              }, { quoted: m });
              break;

            case "3":
              await socket.sendMessage(from, { react: { text: "⏳", key: m.key } });
              for (let i = 0; i < moreImages.length; i++) {
                try {
                  await socket.sendMessage(from, {
                    image: { url: moreImages[i] },
                    caption: `🖼️ *Extra Image ${i + 1}*\n> 𝙼𝚛 𝙻𝚘𝚏𝚝`,
                  }, { quoted: m });
                  await new Promise(res => setTimeout(res, 800));
                } catch (err) {
                  console.error("Failed to send extra image:", err);
                }
              }
              await socket.sendMessage(from, { react: { text: "✅", key: m.key } });
              break;

            default:
              await socket.sendMessage(from, {
                text: "❌ Invalid option. Reply with *1*, *2*, or *3* only.",
              }, { quoted: m });
          }

          // Auto-remove listener after response
          listenerActive = false;
          socket.ev.off("messages.upsert", handler);
        } catch (err) {
          console.error("Reply handler error:", err);
        }
      };

      socket.ev.on("messages.upsert", handler);

      // Auto cleanup after 2 minutes
      setTimeout(() => {
        if (listenerActive) {
          listenerActive = false;
          socket.ev.off("messages.upsert", handler);
        }
      }, 2 * 60 * 1000);

    } catch (e) {
      console.error("Image search error:", e);
      await socket.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
      await socket.sendMessage(from, {
        text: `⚠️ *Error:* ${e.message || "Unknown error occurred."}`,
      }, { quoted: msg });
    }
  }
};