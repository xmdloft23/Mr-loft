module.exports = {
  command: "ping",
  desc: "Check bot response time",
  category: "utility",
  use: ".ping",
  fromMe: false,
  filename: __filename,

  execute: async (sock, msg) => {
    const start = Date.now();
    await sock.sendMessage(msg.key.remoteJid, { text: "Pong!" });
    const latency = Date.now() - start;
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🏓 Pong! Response time: ${latency}ms` 
    }, { quoted: msg });
  }
};
