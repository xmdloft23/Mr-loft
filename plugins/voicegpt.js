const googleTTS = require('google-tts-api');
const { franc } = require('franc');
const fetch = require('node-fetch');
const axios = require('axios')

const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

module.exports = {
  command: 'voicegpt',
  description: 'chat with voice ai',
  execute: async (socket, msg, args, number) => {
   var q = args.join(' ') 
let res = await fetchJson(`https://api.siputzx.my.id/api/ai/gpt3?prompt=kamu%20adalah%20ai%20yang%20ceria&content=${encodeURIComponent(q)}`);
const datas = res.data;
const sender = msg.key.remoteJid;
        await socket.sendMessage(sender, {  
            react: { text: '🫠', key: msg.key }  
        });


let detectedLang = franc(datas);

    const langMap = {
  'afr': 'af',     // Afrikaans
  'amh': 'am',     // Amharic
  'ara': 'ar',     // Arabic
  'ben': 'bn',     // Bengali
  'bos': 'bs',     // Bosnian
  'bul': 'bg',     // Bulgarian
  'cat': 'ca',     // Catalan
  'ceb': 'ceb',    // Cebuano
  'cmn': 'zh-CN',  // Chinese Mandarin
  'hrv': 'hr',     // Croatian
  'ces': 'cs',     // Czech
  'dan': 'da',     // Danish
  'nld': 'nl',     // Dutch
  'eng': 'en',     // English
  'epo': 'eo',     // Esperanto
  'est': 'et',     // Estonian
  'fil': 'fil',    // Filipino
  'fin': 'fi',     // Finnish
  'fra': 'fr',     // French
  'glg': 'gl',     // Galician
  'kat': 'ka',     // Georgian
  'deu': 'de',     // German
  'ell': 'el',     // Greek
  'guj': 'gu',     // Gujarati
  'hau': 'ha',     // Hausa
  'heb': 'he',     // Hebrew
  'hin': 'hi',     // Hindi
  'hun': 'hu',     // Hungarian
  'isl': 'is',     // Icelandic
  'ind': 'id',     // Indonesian
  'ita': 'it',     // Italian
  'jpn': 'ja',     // Japanese
  'jav': 'jv',     // Javanese
  'kan': 'kn',     // Kannada
  'kaz': 'kk',     // Kazakh
  'khm': 'km',     // Khmer
  'kor': 'ko',     // Korean
  'lao': 'lo',     // Lao
  'lav': 'lv',     // Latvian
  'lit': 'lt',     // Lithuanian
  'mkd': 'mk',     // Macedonian
  'mal': 'ml',     // Malayalam
  'mar': 'mr',     // Marathi
  'msa': 'ms',     // Malay
  'mya': 'my',     // Burmese
  'nep': 'ne',     // Nepali
  'nor': 'no',     // Norwegian
  'pol': 'pl',     // Polish
  'por': 'pt',     // Portuguese
  'pan': 'pa',     // Punjabi
  'ron': 'ro',     // Romanian
  'rus': 'ru',     // Russian
  'srp': 'sr',     // Serbian
  'sin': 'si',     // Sinhala
  'slk': 'sk',     // Slovak
  'slv': 'sl',     // Slovenian
  'som': 'so',     // Somali
  'spa': 'es',     // Spanish
  'swa': 'sw',     // Swahili
  'swe': 'sv',     // Swedish
  'tam': 'ta',     // Tamil
  'tel': 'te',     // Telugu
  'tha': 'th',     // Thai
  'tur': 'tr',     // Turkish
  'ukr': 'uk',     // Ukrainian
  'urd': 'ur',     // Urdu
  'uzb': 'uz',     // Uzbek
  'vie': 'vi',     // Vietnamese
  'wel': 'cy',     // Welsh
  'yor': 'yo',     // Yoruba
  'zul': 'zu'      // Zulu
};


    let voiceLanguage = langMap[detectedLang] || 'en'; // Default to English if unknown

    const audioUrls = googleTTS.getAllAudioUrls(datas, {
      lang: voiceLanguage,
      slow: false,
      host: 'https://translate.google.com'
    });

	    

    // Send each audio chunk one by one
    for (const audio of audioUrls) {
      await socket.sendMessage(sender, {
        audio: { url: audio.url },
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: msg });
    }
  }}
    
