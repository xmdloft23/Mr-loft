const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'database', 'wabenews.json');
const CHANNEL_JID = '120363422731708290@newsletter';

module.exports = {
  command: 'wabeta',
  description: 'Get the latest WABetaInfo news from WhatsApp Channel',
  fromMe: false,

  async execute(sock, msg, m) {
    try {
      const jid = msg.key.remoteJid;

      const from = msg?.key?.remoteJid;
      const isFromChannel = from === CHANNEL_JID;
      const messageContent = msg.message?.extendedTextMessage?.text ||
                             msg.message?.conversation;

      // Enregistre les messages du canal
      if (isFromChannel && messageContent) {
        let data = [];
        if (fs.existsSync(FILE_PATH)) {
          data = JSON.parse(fs.readFileSync(FILE_PATH));
        }

        data.push({
          text: messageContent,
          time: new Date().toLocaleString()
        });

        // Garde seulement les 10 derniers
        if (data.length > 10) data = data.slice(-10);
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
      }

      // Commande .wabeta pour afficher la dernière news
      if (msg.body && msg.body.startsWith('.wabeta')) {
        if (!fs.existsSync(FILE_PATH)) {
          return sock.sendMessage(jid, { text: '❌ No WABetaInfo news found yet.' });
        }

        const data = JSON.parse(fs.readFileSync(FILE_PATH));
        if (!data.length) {
          return sock.sendMessage(jid, { text: '❌ No recent news available.' });
        }

        const latest = data[data.length - 1];

        return sock.sendMessage(jid, {
          text: `
╭───────────────⭓
│
│  ${latest.text || '[ᴍᴇᴅɪᴀ]'}
│  
│  🕒 ${latest.time}
│  
╰───────────────⭓`,
        });
      } // 👈 Cette accolade manquait
    } catch (err) {
      console.error('Error in wabeta.js:', err);
    }
  }
};
