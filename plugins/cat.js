const axios = require('axios');

module.exports = {
  command: 'cat',
  description: 'Send a random cute cat picture',
  execute: async (socket, msg, args, number) => {
    const sender = msg.key.remoteJid;
    try {
      const { data } = await axios.get('https://api.thecatapi.com/v1/images/search');
      await socket.sendMessage(sender, {
        image: { url: data[0].url },
        caption: '🐱 Here\'s a cute cat!'
      }, { quoted: msg });
    } catch (err) {
      await socket.sendMessage(sender, { text: '❌ Could not fetch cat image.' }, { quoted: msg });
    }
  }
};
