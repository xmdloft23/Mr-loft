module.exports = {
  command: "promote",
  desc: "Make a user admin",
  category: "group",
  use: ".promote @user or reply",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const { remoteJid } = msg.key;
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const isReply = msg.message?.extendedTextMessage?.contextInfo?.participant;

    const targets = mentioned.length ? mentioned : isReply ? [msg.message.extendedTextMessage.contextInfo.participant] : [];

    if (!targets.length) return sock.sendMessage(remoteJid, { text: "❗ Mention or reply to promote." }, { quoted: msg });

    for (let user of targets) {
      await sock.groupParticipantsUpdate(remoteJid, [user], "promote");
    }
  }
};
