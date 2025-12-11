module.exports = {
  command: 'getpp',
  description: 'Fetch profile picture of a WhatsApp user by phone number',
  execute: async (socket, msg, args, number) => {
    const sender = msg.key.remoteJid;
    const messageInfo = msg;

    try {
      if (!args[0]) {
        return await socket.sendMessage(sender, {
          text: "🔥 Please provide a phone number\n\nExample: .getdp 255778018545"
        });
      }

      // Clean the phone number and create JID
      let targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

      // Send loading message
      await socket.sendMessage(sender, {
        text: "🔍 Fetching profile picture..."
      });

      let ppUrl;
      try {
        ppUrl = await socket.profilePictureUrl(targetJid, "image");
      } catch (e) {
        return await socket.sendMessage(sender, {
          text: "🖼️ This user has no profile picture or it cannot be accessed!"
        });
      }

      // Get user name
      let userName = targetJid.split("@")[0];
      try {
        const contact = await socket.getContact(targetJid);
        userName = contact.notify || contact.vname || contact.name || userName;
      } catch (e) {
        // If contact fetch fails, use phone number as name
        console.log("Could not fetch contact info:", e.message);
      }

      // Send the profile picture with caption and context info
      await socket.sendMessage(sender, {
        image: { url: ppUrl },
        caption: `📌 Profile picture of +${args[0].replace(/[^0-9]/g, "")}\n👤 Name: ${userName}\n\n> 𝙼𝚛 𝙻𝚘𝚏𝚝`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422731708290@newsletter',
            newsletterName: '𝙼𝚛 𝙻𝚘𝚏𝚝',
            serverMessageId: 143
          }
        }
      });

      // React with success emoji (optional)
      try {
        await socket.sendMessage(sender, {
          react: { text: "✅", key: messageInfo.key }
        });
      } catch (e) {
        console.log("Could not react to message:", e.message);
      }

    } catch (e) {
      console.error('Error in getdp plugin:', e);
      await socket.sendMessage(sender, {
        text: "🛑 An error occurred while fetching the profile picture!\n\nPlease try again later or check if the phone number is correct."
      });
    }
  }
};
