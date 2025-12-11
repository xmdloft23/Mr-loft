const fs = require('fs');
const path = require('path');
const axios = require('axios');


const ppDir = path.join(__dirname, '../ppdata');
if (!fs.existsSync(ppDir)) fs.mkdirSync(ppDir);


module.exports = {
  command: 'getdp',
  description: 'Save image URLs and auto update profile picture every 5 minutes',
  execute: async (sock, msg, args) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    const number = sender.split('@')[0];

    try {
      if (!args[0]) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: "📸 Please provide image URLs separated by commas!\n\nExample:\n.getpp https://files.catbox.moe/deeo6l.jpg"
        });
      }

      const urls = args.join(' ').split(',').map(x => x.trim()).filter(Boolean);
      if (urls.length === 0) {
        return await sock.sendMessage(msg.key.remoteJid, { text: "❌ No valid image URLs found." });
      }

      
      const filePath = path.join(ppDir, `${number}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ urls, index: 0 }));

      await sock.sendMessage(msg.key.remoteJid, {
        text: `✅ Saved ${urls.length} profile pictures.\nAuto changer will update your profile pic every 5 minutes!`
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error saving URLs. Please check input and try again."
      });
    }
  }
};


setInterval(async () => {
  if (!fs.existsSync(ppDir)) return;

  const files = fs.readdirSync(ppDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const userPath = path.join(ppDir, file);
    const userData = JSON.parse(fs.readFileSync(userPath));

    const { urls, index } = userData;
    const currentUrl = urls[index];

    try {
      const { data } = await axios.get(currentUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(data);

    
      await global.sock.updateProfilePicture(global.sock.user.id, buffer);

      console.log(`✅ Updated profile picture to image ${index + 1}/${urls.length} from ${file}`);
    } catch (err) {
      console.error(`⚠️ Failed to update profile picture from ${file}:`, err.message);
    }

    
    userData.index = (index + 1) % urls.length;
    fs.writeFileSync(userPath, JSON.stringify(userData));
  }
}, 5 * 60 * 1000); 
