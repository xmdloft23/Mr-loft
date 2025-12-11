const axios = require("axios");
const config = require("../config");

// Heroku App URL
const HEROKU_APP_URL = 'https://mini-inconnu-xd-v2.onrender.com';

module.exports = {
  command: "pair",
  desc: "Get pairing code for 𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝",
  use: ".pair 923078071982",
  filename: __filename,

  execute: async (socket, msg, args) => {
    const messages = {
      invalid: "❌ Please provide a valid phone number with country code\nExample: .pair +255xxx",
      failed: "❌ Failed to retrieve pairing code. Please try again later.",
      done: "> *𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝✅*",
      error: "❌ An error occurred while getting pairing code. Please try again later.",
    };

    try {
      // Get sender details
      const senderId = msg.sender || msg.key?.participant || msg.key?.remoteJid || "";
      const senderNumber = senderId.split("@")[0];

      // Use args or fallback
      const phoneNumber = args.length > 0 ? args.join(" ").trim() : "";

      if (!phoneNumber) {
        return socket.sendMessage(
          msg.key?.remoteJid || senderId,
          {
            text: `🧩 *Pairing System*

To pair your account, please use:
*➡️ .pair <your_number>*

📌 Example:
.pair 923078071982`,
          },
          { quoted: msg }
        );
      }

      if (!phoneNumber.match(/^\+?\d{10,15}$/)) {
        return await socket.sendMessage(
          msg.key?.remoteJid || senderId,
          { text: messages.invalid },
          { quoted: msg }
        );
      }

      const baseUrl = `${HEROKU_APP_URL}/code?number=`;
      const response = await axios.get(`${baseUrl}${encodeURIComponent(phoneNumber)}`);

      if (!response.data || !response.data.code) {
        return await socket.sendMessage(
          msg.key?.remoteJid || senderId,
          { text: messages.failed },
          { quoted: msg }
        );
      }

      const pairingCode = response.data.code;

      const otpCaption = `🔐 *PAIRING OTP SENT!*

📞 *Number:* _${phoneNumber}_
📤 *Status:* _OTP sent successfully_

🔎 Check your WhatsApp messages on that number.

✅ Use this OTP to complete your pairing:
*➡️ .pair ${phoneNumber}*

🕐 *Note:* OTP is valid for a limited time. Complete pairing quickly!

- your paircode is - ${pairingCode}

✨ 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃`;

      await socket.sendMessage(
        msg.key?.remoteJid || senderId,
        { text: otpCaption },
        { quoted: msg }
      );

      await new Promise((r) => setTimeout(r, 2000));
      await socket.sendMessage(
        msg.key?.remoteJid || senderId,
        { text: pairingCode },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Pair command error:", error);
      const senderId = msg.sender || msg.key?.participant || msg.key?.remoteJid || "";
      await socket.sendMessage(
        msg.key?.remoteJid || senderId,
        { text: messages.error },
        { quoted: msg }
      );
    }
  },
};
