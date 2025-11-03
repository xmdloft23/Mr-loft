const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dbFile = path.join(__dirname, '../database/commandTrack.json');

function loadDB() {
  if (!fs.existsSync(dbFile)) return {};
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

async function autoRankMessage(sock, msg) {
  const sender = msg.key.remoteJid;
  if (!sender || sender.endsWith('@g.us')) return;

  const jidName = sender.split('@')[0];
  const db = loadDB();
  const user = db[sender] || { count: 0, rankShown: 0, lastReset: null };
  const today = new Date().toISOString().split('T')[0];

  // Reset daily count
  if (user.lastReset !== today) {
    user.count = 0;
    user.rankShown = 0;
    user.lastReset = today;
  }

  user.count += 1;

  const shouldSendRank = user.rankShown < 8 && user.count % 5 === 0;

  if (shouldSendRank) {
    user.rankShown += 1;

    let thumbnailBuffer;
    try {
      const thumbUrl = await sock.profilePictureUrl(sender, 'image');
      const res = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(res.data, 'binary');
    } catch {
      thumbnailBuffer = Buffer.from('');
    }

    const caption = `🎖️ *RANK UP ALERT*\n\n@${jidName}, you're actively using the bot!\n\n🧠 Commands used today: *${user.count}*\n🏆 Rank notices sent: *${user.rankShown}/8*`;

    await sock.sendMessage(sender, {
      image: { url: 'https://files.catbox.moe/bm2v7m.jpg' },
      caption,
      footer: 'Rank System • 𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝',
      headerType: 4,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 777,
        isForwarded: true,
        externalAdReply: {
          title: 'Meta AI Ranking System',
          body: 'Keep interacting to unlock higher levels!',
          thumbnail: thumbnailBuffer,
          mediaType: 2,
          sourceUrl: 'https://meta.ai',
          mediaUrl: 'https://meta.ai',
          showAdAttribution: true
        }
      }
    });
  }

  db[sender] = user;
  saveDB(db);
}

module.exports = { autoRankMessage };
          
