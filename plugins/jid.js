module.exports = {
  command: "jid",
  desc: "Get WhatsApp JID information",
  category: "utility", 
  use: ".jid [reply/mention]",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      const pushname = msg.pushName || "User";
      
      let targetJid;
      let targetName;
      let targetType;

      // Determine target based on context
      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        // If user is mentioned
        targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        targetName = "Mentioned User";
        targetType = "User";
      } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        // If replying to a message
        targetJid = msg.message.extendedTextMessage.contextInfo.participant;
        targetName = "Quoted User";
        targetType = "User";
      } else if (from.endsWith('@g.us')) {
        // If in group - get group info
        const metadata = await sock.groupMetadata(from);
        targetJid = from;
        targetName = metadata.subject || "Group";
        targetType = "Group";
      } else if (from.endsWith('@newsletter')) {
        // If in channel
        targetJid = from;
        targetName = "Channel";
        targetType = "Channel";
      } else {
        // Default to own JID
        targetJid = sender;
        targetName = pushname;
        targetType = "User";
      }

      // Format JID information
      const caption = `
╭───────────────⭓
│ 𝙼𝚛 𝙻𝚘𝚏𝚝 - 𝙹𝙸𝙳 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽
│  
│  🆔 𝙹𝙸𝙳 : ${targetJid}
│  📛 𝙽𝙰𝙼𝙴 : ${targetName}
│  📋 𝚃𝚈𝙿𝙴 : ${targetType}
│  👤 𝚁𝙴𝚀𝚄𝙴𝚂𝚃𝙴𝙳 𝙱𝚈 : ${pushname}
│  
│  💡 𝚄𝚂𝙰𝙶𝙴 𝙽𝙾𝚃𝙴𝚂:
│  • 𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚏𝚘𝚛 𝚞𝚜𝚎𝚛'𝚜 𝙹𝙸𝙳
│  • 𝙼𝚎𝚗𝚝𝚒𝚘𝚗 𝚞𝚜𝚎𝚛 𝚏𝚘𝚛 𝚝𝚑𝚎𝚒𝚛 𝙹𝙸𝙳  
│  • 𝚄𝚜𝚎 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙 𝚏𝚘𝚛 𝚐𝚛𝚘𝚞𝚙 𝙹𝙸𝙳
│  • 𝚄𝚜𝚎 𝚒𝚗 𝚌𝚑𝚊𝚗𝚗𝚎𝚕 𝚏𝚘𝚛 𝚌𝚑𝚊𝚗𝚗𝚎𝚕 𝙹𝙸𝙳
╰───────────────⭓
> *𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃*`;

      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/90i7j4.png" },
        caption: caption,
        mentions: [targetJid]
      }, { quoted: msg });

    } catch (error) {
      console.error("JID Command Error:", error);
      
      const errorMsg = `
╭───────────────⭓
│ 𝙼𝚛 𝙻𝚘𝚏𝚝 - 𝙹𝙸𝙳 𝙴𝚁𝚁𝙾𝚁
│  
│  ❌ 𝙴𝚁𝚁𝙾𝚁: ${error.message}
│  
│  💡 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽:
│  • 𝙼𝚊𝚔𝚎 𝚜𝚞𝚛𝚎 𝚢𝚘𝚞'𝚛𝚎 𝚛𝚎𝚙𝚕𝚢𝚒𝚗𝚐 𝚝𝚘 𝚊 𝚟𝚊𝚕𝚒𝚍 𝚖𝚎𝚜𝚜𝚊𝚐𝚎
│  • 𝙲𝚑𝚎𝚌𝚔 𝚒𝚏 𝚝𝚑𝚎 𝚞𝚜𝚎𝚛 𝚒𝚜 𝚜𝚝𝚒𝚕𝚕 𝚒𝚗 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙
╰───────────────⭓
> *𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃*`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: errorMsg
      }, { quoted: msg });
    }
  }
};