const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({
    path: './config.env'
});

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}






module.exports = {
    LANG: 'si',
    WELCOME: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_VOICE: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'false',
    HEROKU_APP_URL: '',
    AUTO_LIKE_EMOJI: ['💥', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/G3ChQEjwrdVBTBUQHWSNHF?mode=wwt',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/bkufwo.jpg',
    NEWSLETTER_JID: [
      '120363422638889358@c.us',
      '120363422731708290@c.us',
      '120363404947266611@c.us',
      '120363401788545030@c.us',
      '120363420304481096@c.us',
      '120363405821254655@c.us',
      '120363405157355542@c.us',
      '120363422984664452@c.us',
      '120363404192160985@c.us',
      '120363405849631117@c.us',
      '120363405957760706@c.us'
    ],
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '255778018545',
    CHANNEL_LINK: [
  'https://whatsapp.com/channel/0029VbBDVEEHLHQdjvSGpU1q',
  'https://whatsapp.com/channel/0029Vb739mkC1FuInfO1js2t',
  'https://whatsapp.com/channel/0029Vb63GvUGU3BGlY6Rju1M',
  'https://whatsapp.com/channel/0029VbBk35eKGGGPh2DJzR0r',
  'https://whatsapp.com/channel/0029VbBRlIx2975IRqrQgg1L',
  'https://whatsapp.com/channel/0029VbBUHfGEawdiG5eqLK3o',
  'https://whatsapp.com/channel/0029VbBuFrw0gcfEJ0b2XA0Z',
  'https://whatsapp.com/channel/0029VbBmFUaEFeXiYZ4lqR1v',
  'https://whatsapp.com/channel/0029Vb7SwW0KwqSX2ZnLGA45',
  'https://whatsapp.com/channel/0029Vb764Y12phHH5xvCQ205',
  'https://whatsapp.com/channel/0029Vb78LeNIN9it4Mlbp83P'
]};
