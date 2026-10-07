const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({
    path: './config.env'
});

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    LANG: 'en',
    WELCOME: 'true',

    // Auto Settings
    AUTO_VIEW_STATUS: 'true',        // ✅ auto read status
    AUTO_TYPING: 'true',             // ✅ auto typing
    AUTO_RECORDING: 'false',         // ✅ auto recording
    AUTO_REACT_STATUS: 'true',       // ✅ auto reacts
    AUTO_LIKE_STATUS: 'true',        // legacy auto like
    AUTO_LIKE_EMOJI: ['💥','👍','😍','💗','🎈','🎉','🥳','😎','🚀','🔥'],

    ALWAYS_ONLINE: 'false',          // ✅ always online mode

    PREFIX: '.',                      // command prefix
    OWNER_NAME: 'LOFT',               // ✅ owner name
    OWNER_NUMBER: '25577801854',     // ✅ owner number

    HEROKU_APP_URL: 'https://vajiramini-5b70406079da.herokuapp.com',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/IuA7cyj01NVA1vRds9EtKu',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://raw.githubusercontent.com/xmdloft23/Bot-master/main/loft/tech.jpg',

    // ✅ Newsletters/Channels nyingi
    NEWSLETTERS: [
        { jid: '120363398106360290@newsletter', messageId: '428' },
        { jid: '120363422731708290@newsletter', messageId: '143' },
        { jid: '120363412381743329@newsletter', messageId: '454' },
        // Ongeza channel nyingine hapa kwa muundo huo huo
    ],

    OTP_EXPIRY: 300000,
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBe2WY7j6g9hbbT6F0N'
};