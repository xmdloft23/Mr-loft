module.exports = {
  command: "demote",
  desc: "Remove admin role",
  category: "group",
  use: ".demote @user or reply",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const { remoteJid } = msg.key;
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const isReply = msg.message?.extendedTextMessage?.contextInfo?.participant;

    const targets = mentioned.length ? mentioned : isReply ? [msg.message.extendedTextMessage.contextInfo.participant] : [];

    if (!targets.length) return sock.sendMessage(remoteJid, { text: "❗ Mention or reply to demote." }, { quoted: msg });

    for (let user of targets) {
      await sock.groupParticipantsUpdate(remoteJid, [user], "demote");
    }
  }
};
