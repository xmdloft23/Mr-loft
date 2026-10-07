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
    AUTO_VIEW_STATUS: 'true',
    AUTO_TYPING: 'true',
    AUTO_RECORDING: 'false',
    AUTO_REACT_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_LIKE_EMOJI: ['💥','👍','😍','💗','🎈','🎉','🥳','😎','🚀','🔥'],

    ALWAYS_ONLINE: 'false',

    PREFIX: '.',
    OWNER_NAME: 'LOFT',
    OWNER_NUMBER: '255778018545',

    HEROKU_APP_URL: 'https://vajiramini-5b70406079da.herokuapp.com',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/G3ChQEjwrdVBTBUQHWSNHF?mode=wwt',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/bkufwo.jpg',

    // ✅ Za zamani (bado zinatumika kwenye connection.js)
    NEWSLETTER_JID: '120363398106360290@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',

    // ✅ Za mpya (array ya channel nyingi)
    NEWSLETTERS: [
        { jid: '120363398106360290@newsletter', messageId: '428' },
        { jid: '120363424095366093@newsletter', messageId: '143' },
        { jid: '120363412381743329@newsletter', messageId: '454' },
    ],

    OTP_EXPIRY: 300000,
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb6B9xFCxoAseuG1g610'
};