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
    OWNER_NAME: 'LOFT',             // ✅ owner name
    OWNER_NUMBER: '255778018545',     // ✅ owner number

    HEROKU_APP_URL: 'https://vajiramini-5b70406079da.herokuapp.com',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/G3ChQEjwrdVBTBUQHWSNHF?mode=wwt',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/bkufwo.jpg',
    NEWSLETTER_JID: '120363398106360290@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBDVEEHLHQdjvSGpU1q'
};
