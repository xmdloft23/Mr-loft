const listCmd = require('../plugins/list.js');

module.exports = {
  name: 'reaction',
  type: 'reaction',
  execute: async (sock, msg, plugins) => {
    try {
      const { key, reaction } = msg.message.reaction;
      const emoji = reaction;
      const msgId = key.id;
      const sender = key.remoteJid;
      const reactingUser = key.participant;

      const map = listCmd.recentList();
      const data = map[msgId];
      if (!data) return;

      // Only allow the original requester to react
      if (reactingUser !== data.user) return;

      const commandName = data.emojiMap[emoji];
      if (!commandName) return;

      const command = plugins.find(p => p.command === commandName);
      if (!command) return;

      // Simulate a msg object compatible with your command system
      const fakeMsg = {
        key: {
          remoteJid: sender,
          fromMe: false,
          id: `fake-${Date.now()}`
        },
        message: {
          conversation: `.${commandName}`
        },
        pushName: 'Reaction',
        participant: reactingUser
      };

      // Print log to confirm execution
      console.log(`Executing command via reaction: ${commandName}`);

      // Run the command
      await command.execute(sock, fakeMsg, plugins);

    } catch (err) {
      console.error('Reaction Handler Error:', err);
    }
  }
};
