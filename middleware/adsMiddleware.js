const fs = require("fs");
const path = require("path");

const adsPath = path.join(__dirname, "../ads.json");

// 🧩 Attach ad after response
async function sendWithAd(sock, msg, mainText) {
  let ad;

  if (fs.existsSync(adsPath)) {
    const raw = JSON.parse(fs.readFileSync(adsPath));

    const mediaBuffer = Buffer.from(raw.media, "base64");

    ad = {
      [raw.type]: mediaBuffer,
      caption: raw.caption
    };
  }

  const jid = msg.key.remoteJid;

  // ✅ Send main response
  await sock.sendMessage(jid, { text: mainText });

  // 📢 Send ad if exists
  if (ad) {
    await sock.sendMessage(jid, ad, { quoted: msg });
  }
}

module.exports = { sendWithAd };
