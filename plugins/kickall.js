
module.exports = {
    command: "kickall",
    desc: "ʀᴇᴍᴏᴠᴇ ᴀʟʟ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀꜱ ᴀᴛ ᴏɴᴄᴇ",
    category: "ɢʀᴏᴜᴘ",
    use: ".ᴋɪᴄᴋᴀʟʟ",
    fromMe: true,
    filename: __filename,

    execute: async (sock, msg) => {
        const { remoteJid } = msg.key;

        if (!remoteJid.endsWith("@g.us")) {
            return sock.sendMessage(remoteJid, { 
                text: "❌ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ɪꜱ ꜰᴏʀ ɢʀᴏᴜᴘꜱ ᴏɴʟʏ." 
            }, { quoted: msg });
        }

        try {
            const groupMetadata = await sock.groupMetadata(remoteJid);
            const participants = groupMetadata.participants;

            const nonAdminParticipants = participants
                .filter(p => !p.admin)
                .map(p => p.id);

            if (nonAdminParticipants.length === 0) {
                return sock.sendMessage(remoteJid, { 
                    text: "ℹ️ ᴛʜᴇʀᴇ ᴀʀᴇ ɴᴏ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀꜱ ᴛᴏ ᴋɪᴄᴋ." 
                }, { quoted: msg });
            }

            await sock.groupParticipantsUpdate(remoteJid, nonAdminParticipants, "remove");
            await sock.sendMessage(remoteJid, { 
                text: `✅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴋɪᴄᴋᴇᴅ ᴀʟʟ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀꜱ.` 
            }, { quoted: msg });

        } catch (error) {
            console.error("ᴋɪᴄᴋᴀʟʟ ᴇʀʀᴏʀ:", error);
            await sock.sendMessage(remoteJid, { 
                text: "❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴛʀʏɪɴɢ ᴛᴏ ᴋɪᴄᴋ ᴍᴇᴍʙᴇʀꜱ." 
            }, { quoted: msg });
        }
    }
};
