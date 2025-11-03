const { autoRankMessage } = require('./middleware/rankTracker');

// Inside your dynamic command loader:
const command = require(`./plugins/${file}`);

// Wrap each command to auto-trigger rank
const originalExecute = command.execute;

command.execute = async (sock, msg, args, number) => {
  try {
    await autoRankMessage(sock, msg); // 🚀 Auto Rank Trigger
    await originalExecute(sock, msg, args, number); // ✅ Run actual command
  } catch (err) {
    console.error(`Error in command ${command.command}:`, err);
  }
};
