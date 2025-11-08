const axios = require('axios');
const { franc } = require('franc');
const googleTTS = require('google-tts-api');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Cooldown map (user → timestamp)
const cooldowns = new Map();

const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000,
      ...options
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Network error');
  }
};

// Enhanced language map (ISO 639-1 → Google TTS code)
const langMap = {
  'afr': 'af', 'amh': 'am', 'ara': 'ar', 'ben': 'bn', 'bos': 'bs',
  'bul': 'bg', 'cat': 'ca', 'ceb': 'ceb', 'cmn': 'zh-CN', 'hrv': 'hr',
  'ces': 'cs', 'dan': 'da', 'nld': 'nl', 'eng': 'en', 'epo': 'eo',
  'est': 'et', 'fil': 'fil', 'fin': 'fi', 'fra': 'fr', 'glg': 'gl',
  'kat': 'ka', 'deu': 'de', 'ell': 'el', 'guj': 'gu', 'hau': 'ha',
  'heb': 'he', 'hin': 'hi', 'hun': 'hu', 'isl': 'is', 'ind': 'id',
  'ita': 'it', 'jpn': 'ja', 'jav': 'jv', 'kan': 'kn', 'kaz': 'kk',
  'khm': 'km', 'kor': 'ko', 'lao': 'lo', 'lav': 'lv', 'lit': 'lt',
  'mkd': 'mk', 'mal': 'ml', 'mar': 'mr', 'msa': 'ms', 'mya': 'my',
  'nep': 'ne', 'nor': 'no', 'pol': 'pl', 'por': 'pt', 'pan': 'pa',
  'ron': 'ro', 'rus': 'ru', 'srp': 'sr', 'sin': 'si', 'slk': 'sk',
  'slv': 'sl', 'som': 'so', 'spa': 'es', 'swa': 'sw', 'swe': 'sv',
  'tam': 'ta', 'tel': 'te', 'tha': 'th', 'tur': 'tr', 'ukr': 'uk',
  'urd': 'ur', 'uzb': 'uz', 'vie': 'vi', 'wel': 'cy', 'yor': 'yo',
  'zul': 'zu'
};

module.exports = {
  command: ['voicegpt', 'siri', 'bixby', 'breeno', 'xiaoai', 'ella'],
  description: 'Chat with AI and get voice reply',
  react: 'mic',

  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const userId = msg.key.participant || sender;
    const reply = (text) => socket.sendMessage(sender, { text }, { quoted: msg });

    // === COOLDOWN (8 seconds) ===
    const now = Date.now();
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < 8000) {
      return reply("Please wait a few seconds before using voice AI again.");
    }
    cooldowns.set(userId, now);

    if (!args.length) {
      return reply("Please ask something!\nExample: `.voicegpt Hello, how are you?`");
    }

    const query = args.join(" ").trim();

    // Step 1: Thinking reaction
    await socket.sendMessage(sender, { react: { text: 'thinking', key: msg.key } });

    let aiResponse;
    try {
      const res = await fetchJson(`https://api.siputzx.my.id/api/ai/gpt3?prompt=kamu%20adalah%20ai%20yang%20ceria&content=${encodeURIComponent(query)}`);
      aiResponse = res.data?.trim();

      if (!aiResponse || aiResponse.length < 3) throw new Error("Empty response");
    } catch (err) {
      await socket.sendMessage(sender, { react: { text: 'cross', key: msg.key } });
      return reply(`AI Error: ${err.message}`);
    }

    // Step 2: Detect language with confidence
    let detected = franc(aiResponse, { minLength: 3, whitelist: Object.keys(langMap) });
    let voiceLang = 'en';

    if (detected && detected !== 'und' && franc(aiResponse) !== 'und') {
      voiceLang = langMap[detected] || 'en';
    }

    // Optional: Force Swahili for TZ users
    // if (msg.key.fromMe === false && sender.endsWith('@g.us') === false) voiceLang = 'sw';

    // Step 3: Generate single TTS audio
    let audioBuffer;
    try {
      const audioUrls = googleTTS.getAllAudioUrls(aiResponse, {
        lang: voiceLang,
        slow: false,
        host: 'https://translate.google.com'
      });

      if (!audioUrls?.length) throw new Error("No audio generated");

      // Download and merge all chunks
      const chunks = await Promise.all(
        audioUrls.map(async (item) => {
          const res = await axios({ url: item.url, method: 'GET', responseType: 'arraybuffer' });
          return Buffer.from(res.data);
        })
      );

      audioBuffer = Buffer.concat(chunks);
    } catch (ttsErr) {
      console.warn("TTS failed, sending text:", ttsErr.message);
      await socket.sendMessage(sender, { react: { text: 'warning', key: msg.key } });
      return reply(`*AI Reply (Voice Failed):*\n\n${aiResponse}\n\n_TTS unavailable, text sent instead._`);
    }

    // Step 4: Send as PTT (Push-to-Talk)
    try {
      await socket.sendMessage(sender, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        waveform: generateWaveform(audioBuffer.length)
      }, { quoted: msg });

      await socket.sendMessage(sender, { react: { text: 'speaking', key: msg.key } });
    } catch (sendErr) {
      console.error("Failed to send audio:", sendErr);
      await reply(`*AI Reply:*\n\n${aiResponse}\n\n_Audio send failed._`);
    } finally {
      // Cleanup cooldown
      setTimeout(() => cooldowns.delete(userId), 15000);
    }
  }
};

// Generate fake waveform for PTT (optional visual)
function generateWaveform(durationMs = 5000) {
  const samples = 40;
  const waveform = [];
  for (let i = 0; i < samples; i++) {
    waveform.push(Math.floor(Math.random() * 50) + 20);
  }
  return new Uint8Array(waveform);
}