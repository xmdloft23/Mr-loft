const { formatMessage } = require('../lib/formatter');
const os = require('os');
const moment = require('moment-timezone');

module.exports = {
  command: 'system',
  description: 'Advanced system monitor with live stats',
  category: 'info',

  execute: async (socket, msg, args, number) => {
    const jid = msg.key.remoteJid;

    try {
      // === 1. Gather Advanced System Data ===
      const uptime = process.uptime();
      const uptimeStr = moment.utc(uptime * 1000).format('HH:mm:ss');

      const mem = process.memoryUsage();
      const usedMem = (mem.rss / 1024 / 1024).toFixed(2);
      const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

      const cpu = os.cpus()[0];
      const cpuLoad = os.loadavg()[0].toFixed(2);
      const cpuModel = `${cpu.model.split(' ').slice(0, 3).join(' ')}`;

      const [disk, network] = await Promise.all([
        si.diskLayout().catch(() => ({ error: 'N/A' })),
        si.networkInterfaces().catch(() => ({ error: 'N/A' }))
      ]);

      const primaryDisk = Array.isArray(disk) ? disk[0] : null;
      const diskSize = primaryDisk ? (primaryDisk.size / 1024 / 1024 / 1024).toFixed(1) + ' GB' : 'N/A';

      const net = Array.isArray(network) ? network.find(n => n.default) || network[0] : null;
      const ip = net ? net.ip4 || 'N/A' : 'N/A';

      // === 2. Bot Runtime Stats ===
      const startTime = process.hrtime.bigint();
      const ping = Number(process.hrtime.bigint() - startTime) / 1e6; // Simulated ping

      const loadedModules = Object.keys(require.cache).length;
      const nodeVersion = process.version;
      const platform = `${os.platform()} ${os.release()} (${os.arch()})`;

      // === 3. Build Advanced Caption ===
      const caption = formatMessage(`
*╭━━━━━━━━━━━━━━━━━━━━━━━⭓*
*│*    *⚡ SYSTEM MONITOR*    
*│*  
*│*  *⏳ Uptime:* \`${uptimeStr}\`  
*│*  *🖥️ Platform:* \`${platform}\`  
*│*  *💾 Disk:* \`${diskSize}\`  
*│*  *🌐 IP:* \`${ip}\`  
*│*  
*│*  *🧠 RAM:* \`${usedMem} MB / ${totalMem} GB\`  
*│*     ┖ *Free:* \`${freeMem} GB\`  
*│*  *📊 Heap:* \`${heapUsed} MB\`  
*│*  
*│*  *⚙️ CPU:* \`${cpuModel}\`  
*│*     ┖ *Load:* \`${cpuLoad}\`  
*│*  *🔥 Node.js:* \`${nodeVersion}\`  
*│*  
*│*  *📦 Modules:* \`${loadedModules}\`  
*│*  *👤 User:* \`${os.userInfo().username}\`
 ╰━━━━━━━━━━━━━━━━━━━━━━━⭓*

> *Powered by* _𝚂𝚒𝚛 𝙻𝙾𝙵𝚃 • Quantum Core v2_
      `).trim();

      // === 4. Send Image + Caption + Buttons ===
      await socket.sendMessage(jid, {
        image: { url: 'https://files.catbox.moe/deeo6l.jpg' },
        caption,
        contextInfo: {
          mentionedJid: ['255778018545@s.whatsapp.net'],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422731708290@newsletter',
            newsletterName: '𝙼𝚛 𝙻𝚘𝚏𝚝',
            serverMessageId: 143
          },
          externalAdReply: {
            title: "Quantum System Monitor",
            body: "Live Stats • Auto-Refresh",
            thumbnailUrl: 'https://files.catbox.moe/deeo6l.jpg',
            sourceUrl: "https://wa.me/255778018545",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        // === Interactive Buttons ===
        headerType: 4,
        footer: "© 2025 𝙼𝚛 𝙻𝚘𝚏𝚝",
        buttons: [
          {
            buttonId: '.system',
            buttonText: { displayText: "🔄 Refresh" },
            type: 1
          },
          {
            buttonId: '.uptime',
            buttonText: { displayText: "⏱ Uptime" },
            type: 1
          },
          {
            buttonId: '.ping',
            buttonText: { displayText: "🎁 Ping" },
            type: 1
          }
        ]
      }, { quoted: msg });

      // === React ===
      await socket.sendMessage(jid, { react: { text: "🗿", key: msg.key } });

    } catch (error) {
      console.error("System command error:", error);
      await socket.sendMessage(jid, {
        text: formatMessage(`
*⚠️ System Monitor Unavailable*

> _Trying to fetch live data..._
        `),
      }, { quoted: msg });
    }
  }
};