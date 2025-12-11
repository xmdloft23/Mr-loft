const {
  downloadContentFromMessage,
  toBuffer,
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");
const { fromBuffer } = require("file-type");

module.exports = {
  command: "sticker",
  desc: "Convert image/video to WhatsApp sticker",
  category: "sticker",
  use: ".sticker (reply to image/video)",
  alias: ["s"],
  fromMe: false,
  filename: __filename,

  execute: async (sock, msg, args) => {
    const { remoteJid, participant } = msg.key;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // === 1. Validate quoted media ===
    if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
      return sock.sendMessage(remoteJid, {
        text: "Please reply to an *image* or *short video* (max 10s) with `.sticker`",
      }, { quoted: msg });
    }

    const mediaMsg = quoted.imageMessage || quoted.videoMessage;
    const isVideo = !!quoted.videoMessage;
    const caption = mediaMsg.caption || "";

    // === 2. Video duration check (max 10s for stickers) ===
    if (isVideo && mediaMsg.seconds > 10) {
      return sock.sendMessage(remoteJid, {
        text: "Video too long! Max 10 seconds for stickers.",
      }, { quoted: msg });
    }

    // === 3. Send "converting..." ===
    const convertingMsg = await sock.sendMessage(remoteJid, {
      text: "Converting to sticker...",
    }, { quoted: msg });

    try {
      // === 4. Download media stream ===
      const stream = await downloadContentFromMessage(mediaMsg, isVideo ? "video" : "image");
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      // === 5. Detect MIME type ===
      const { mime } = await fromBuffer(buffer);
      if (!mime) throw new Error("Invalid file type");

      // === 6. Create WebP sticker using Exif metadata ===
      const webpSticker = await createSticker(buffer, {
        pack: "Sir LOFT Bot",
        author: participant?.split("@")[0] || "User",
        quality: 70,
        crop: false,
      });

      // === 7. Send sticker ===
      await sock.sendMessage(remoteJid, {
        sticker: webpSticker,
      }, { quoted: msg });

      // Optional: Delete "converting..." message
      await sock.sendMessage(remoteJid, { delete: convertingMsg.key });

    } catch (error) {
      console.error("Sticker Error:", error);
      await sock.sendMessage(remoteJid, {
        text: `Failed to create sticker:\n\`${error.message}\``,
        edit: convertingMsg.key,
      });
    }
  },
};

// === Sticker Creator Function (WebP + Exif) ===
async function createSticker(buffer, { pack, author, quality = 70, crop = false }) {
  const { default: webp } = await import("node-webpmux");
  const img = new webp.Image();

  // Add EXIF metadata
  const exif = {
    "sticker-pack-id": "com.sir-loft.sticker",
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author,
    "android-app-store-link": "https://play.google.com/store/apps/details?id=com.whatsapp",
    "ios-app-store-link": "https://apps.apple.com/app/whatsapp/id310633997",
    emojis: [],
  };

  const json = { "sticker-pack-id": exif["sticker-pack-id"], ...exif };
  const exifBuffer = Buffer.from(JSON.stringify(json), "utf-8");

  // Load image and add EXIF
  await img.load(buffer);
  img.exif = exifBuffer;

  // Optional: Crop to square
  if (crop && (img.width !== img.height)) {
    const size = Math.min(img.width, img.height);
    img.crop((img.width - size) / 2, (img.height - size) / 2, size, size);
  }

  return await img.save(null); // Returns WebP buffer
}