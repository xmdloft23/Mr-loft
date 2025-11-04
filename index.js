const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();
const pino = require('pino');
const cheerio = require('cheerio');
const { Octokit } = require('@octokit/rest');
const os = require('os');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get,updb,updfb } = require("./lib/database")
var id_db = require('./lib/id_db')    

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    getContentType,
    proto,
    prepareWAMessageMedia,
    generateWAMessageFromContent
} = require('@whiskeysockets/baileys');

const config = {
   WELCOME: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_VOICE: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'false',
    HEROKU_APP_URL: 'https://bilal-md-deploy-1x.vercel.app/',
    AUTO_LIKE_EMOJI: ['🥹', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/G3ChQEjwrdVBTBUQHWSNHF?mode=wwt',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/deeo6l.jpg',
    NEWSLETTER_JID: '1@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '255778018545',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBDVEEHLHQdjvSGpU1q'    
}

const owner = 'Xmdloft23';
const octokit = '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';
const repo = 'Core';

const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';
const otpStore = new Map();

if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

function loadAdmins() {
    try {
        if (fs.existsSync(config.ADMIN_LIST_PATH)) {
            return JSON.parse(fs.readFileSync(config.ADMIN_LIST_PATH, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Failed to load admin list:', error);
        return [];
    }
}

function formatMessage(title, content, footer) {
    return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSriLankaTimestamp() {
    return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

async function cleanDuplicateFiles(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file => 
            file.name.startsWith(`empire_${sanitizedNumber}_`) && file.name.endsWith('.json')
        ).sort((a, b) => {
            const timeA = parseInt(a.name.match(/empire_\d+_(\d+)\.json/)?.[1] || 0);
            const timeB = parseInt(b.name.match(/empire_\d+_(\d+)\.json/)?.[1] || 0);
            return timeB - timeA;
        });

        const configFiles = data.filter(file => 
            file.name === `config_${sanitizedNumber}.json`
        );

        if (sessionFiles.length > 1) {
            for (let i = 1; i < sessionFiles.length; i++) {
                await octokit.repos.deleteFile({
                    owner,
                    repo,
                    path: `session/${sessionFiles[i].name}`,
                    message: `Delete duplicate session file for ${sanitizedNumber}`,
                    sha: sessionFiles[i].sha
                });
                console.log(`Deleted duplicate session file: ${sessionFiles[i].name}`);
            }
        }

        if (configFiles.length > 0) {
            console.log(`Config file for ${sanitizedNumber} already exists`);
        }
    } catch (error) {
        console.error(`Failed to clean duplicate files for ${number}:`, error);
    }
}

async function joinGroup(socket) {
    let retries = config.MAX_RETRIES;
    const inviteCodeMatch = config.GROUP_INVITE_LINK.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
    if (!inviteCodeMatch) {
        console.error('Invalid group invite link format');
        return { status: 'failed', error: 'Invalid group invite link' };
    }
    const inviteCode = inviteCodeMatch[1];

    while (retries > 0) {
        try {
            const response = await socket.groupAcceptInvite(inviteCode);
            if (response?.gid) {
                console.log(`Successfully joined group with ID: ${response.gid}`);
                return { status: 'success', gid: response.gid };
            }
            throw new Error('No group ID in response');
        } catch (error) {
            retries--;
            let errorMessage = error.message || 'Unknown error';
            if (error.message.includes('not-authorized')) {
                errorMessage = 'Bot is not authorized to join (possibly banned)';
            } else if (error.message.includes('conflict')) {
                errorMessage = 'Bot is already a member of the group';
            } else if (error.message.includes('gone')) {
                errorMessage = 'Group invite link is invalid or expired';
            }
            if (retries === 0) {
                return { status: 'failed', error: errorMessage };
            }
            await delay(2000 * (config.MAX_RETRIES - retries));
        }
    }
    return { status: 'failed', error: 'Max retries reached' };
}

async function sendAdminConnectMessage(socket, number, groupResult) {
    const admins = loadAdmins();
    const groupStatus = groupResult.status === 'success'
        ? `Joined (ID: ${groupResult.gid})`
        : `Failed to join group: ${groupResult.error}`;
    const caption = formatMessage(
        '𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝',
        `📞 Number: ${number}\n😊 Status: Connected`,
        '𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝'
    );

    for (const admin of admins) {
        try {
            await socket.sendMessage(
                `${admin}@s.whatsapp.net`,
                {
                    image: { url: config.RCD_IMAGE_PATH },
                    caption
                }
            );
        } catch (error) {
            console.error(`Failed to send connect message to admin ${admin}:`, error);
        }
    }
}

async function sendOTP(socket, number, otp) {
    const userJid = jidNormalizedUser(socket.user.id);
    const message = formatMessage(
        '🔐 OTP VERIFICATION',
        `Your OTP for config update is: *${otp}*\nThis OTP will expire in 3 minutes.`,
        '𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝'
    );

    try {
        await socket.sendMessage(userJid, { text: message });
        console.log(`OTP ${otp} sent to ${number}`);
    } catch (error) {
        console.error(`Failed to send OTP to ${number}:`, error);
        throw error;
    }
}

async function updateStoryStatus(socket) {
    const statusMessage = `𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝 🚀\nConnected at: ${getSriLankaTimestamp()}`;
    try {
        await socket.sendMessage('status@broadcast', { text: statusMessage });
        console.log(`Posted story status: ${statusMessage}`);
    } catch (error) {
        console.error('Failed to post story status:', error);
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== config.NEWSLETTER_JID) return;

        try {
            const emojis = ['❤️', '🔥', '😀', '👍'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId;

            if (!messageId) {
                return;
            }

            let retries = config.MAX_RETRIES;
            while (retries > 0) {
                try {
                    await socket.newsletterReactMessage(
                        config.NEWSLETTER_JID,
                        messageId.toString(),
                        randomEmoji
                    );
                    console.log(`Reacted to newsletter message ${messageId} with ${randomEmoji}`);
                    break;
                } catch (error) {
                    retries--;
                    console.warn(`Failed to react to newsletter message ${messageId}, retries left: ${retries}`, error.message);
                    if (retries === 0) throw error;
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
        } catch (error) {
            console.error('Newsletter reaction error:', error);
        }
    });
}

async function setupStatusHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant || message.key.remoteJid === config.NEWSLETTER_JID) return;

        try {
            if (config.AUTO_RECORDING === 'true' && message.key.remoteJid) {
                await socket.sendPresenceUpdate("recording", message.key.remoteJid);
            }

            if (config.AUTO_VIEW_STATUS === 'true') {
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([message.key]);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to read status, retries left: ${retries}`, error);
                        if (retries === 0) throw error;
                        await delay(1000 * (config.MAX_RETRIES - retries));
                    }
                }
            }

            if (config.AUTO_LIKE_STATUS === 'true') {
                const randomEmoji = config.AUTO_LIKE_EMOJI[Math.floor(Math.random() * config.AUTO_LIKE_EMOJI.length)];
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            message.key.remoteJid,
                            { react: { text: randomEmoji, key: message.key } },
                            { statusJidList: [message.key.participant] }
                        );
                        console.log(`Reacted to status with ${randomEmoji}`);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to react to status, retries left: ${retries}`, error);
                        if (retries === 0) throw error;
                        await delay(1000 * (config.MAX_RETRIES - retries));
                    }
                }
            }
        } catch (error) {
            console.error('Status handler error:', error);
        }
    });
}

async function handleMessageRevocation(socket, number) {
    socket.ev.on('messages.delete', async ({ keys }) => {
        if (!keys || keys.length === 0) return;

        const messageKey = keys[0];
        const userJid = jidNormalizedUser(socket.user.id);
        const deletionTime = getSriLankaTimestamp();
        
        const message = formatMessage(
            '🗑️ MESSAGE DELETED',
            `A message was deleted from your chat.\n📋 From: ${messageKey.remoteJid}\n🍁 Deletion Time: ${deletionTime}`,
            'ᴍɪɴɪ bilal'
        );

        try {
            await socket.sendMessage(userJid, {
                image: { url: config.RCD_IMAGE_PATH },
                caption: message
            });
            console.log(`Notified ${number} about message deletion: ${messageKey.id}`);
        } catch (error) {
            console.error('Failed to send deletion notification:', error);
        }
    });
}

async function resize(image, width, height) {
    let oyy = await Jimp.read(image);
    let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
    return kiyomasa;
}

function capital(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const createSerial = (size) => {
    return crypto.randomBytes(size).toString('hex').slice(0, size);
}

const plugins = new Map();
const pluginDir = path.join(__dirname, 'plugins');
fs.readdirSync(pluginDir).forEach(file => {
    if (file.endsWith('.js')) {
        const plugin = require(path.join(pluginDir, file));
        if (plugin.command) {
            plugins.set(plugin.command, plugin);
        }
    }
});

// me fonct inconnu boy
function setupCommandHandlers(socket, number) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (
        !msg.message ||
        msg.key.remoteJid === 'status@broadcast' ||
        msg.key.remoteJid === config.NEWSLETTER_JID
      )
        return;

      let command = null;
      let args = [];
      let sender = msg.key.remoteJid;
      let from = sender;

      // ✅ Analyse du message texte ou bouton
      if (msg.message.conversation || msg.message.extendedTextMessage?.text) {
        const text =
          (msg.message.conversation || msg.message.extendedTextMessage.text || '').trim();
        if (text.startsWith(config.PREFIX)) {
          const parts = text.slice(config.PREFIX.length).trim().split(/\s+/);
          command = parts[0].toLowerCase();
          args = parts.slice(1);
        }
      } else if (msg.message.buttonsResponseMessage) {
        const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
        if (buttonId && buttonId.startsWith(config.PREFIX)) {
          const parts = buttonId.slice(config.PREFIX.length).trim().split(/\s+/);
          command = parts[0].toLowerCase();
          args = parts.slice(1);
        }
      }

      if (!command) return;

      // ✅ Exécution du plugin correspondant
      if (plugins.has(command)) {
        const plugin = plugins.get(command);
        try {
          await plugin.execute(socket, msg, args, number);
        } catch (err) {
          console.error(`❌ Plugin "${command}" error:`, err);
          
          // ✅ Message d’erreur avec contexte ajouté
          await socket.sendMessage(
            from,
            {
              image: { url: config.RCD_IMAGE_PATH },
              caption: formatMessage(
                '❌ ERROR',
                `Command *${command}* failed!\n\n${err.message || err}`,
                '𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝'
              ),
              contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '1@newsletter',
                  newsletterName: '𝙼𝚛 𝙻𝚘𝚏𝚝',
                  serverMessageId: 143
                }
              }
            },
            { quoted: msg }
          );
        }
      }
    } catch (err) {
      console.error('❌ Global handler error:', err);
    }
  });
}


    
function setupMessageHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;

        if (config.AUTO_RECORDING === 'true') {
            try {
                await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
              //  console.log(`Set recording presence for ${msg.key.remoteJid}`);
            } catch (error) {
                console.error('Failed to set recording presence:', error);
            }
        }
    });
}

async function deleteSessionFromGitHub(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file =>
            file.name.includes(sanitizedNumber) && file.name.endsWith('.json')
        );

        for (const file of sessionFiles) {
            await octokit.repos.deleteFile({
                owner,
                repo,
                path: `session/${file.name}`,
                message: `Delete session for ${sanitizedNumber}`,
                sha: file.sha
            });
        }
    } catch (error) {
        console.error('Failed to delete session from GitHub:', error);
    }
}

async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'session'
        });

        const sessionFiles = data.filter(file =>
            file.name === `creds_${sanitizedNumber}.json`
        );

        if (sessionFiles.length === 0) return null;

        const latestSession = sessionFiles[0];
        const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path: `session/${latestSession.name}`
        });

        const content = Buffer.from(fileData.content, 'base64').toString('utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Session restore failed:', error);
        return null;
    }
}

async function loadUserConfig(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configPath = `session/config_${sanitizedNumber}.json`;
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: configPath
        });

        const content = Buffer.from(data.content, 'base64').toString('utf8');
        return JSON.parse(content);
    } catch (error) {
        console.warn(`No configuration found for ${number}, using default config`);
        return { ...config };
    }
}

async function updateUserConfig(number, newConfig) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configPath = `session/config_${sanitizedNumber}.json`;
        let sha;

        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path: configPath
            });
            sha = data.sha;
        } catch (error) {
        }

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: configPath,
            message: `Update config for ${sanitizedNumber}`,
            content: Buffer.from(JSON.stringify(newConfig, null, 2)).toString('base64'),
            sha
        });
        console.log(`Updated config for ${sanitizedNumber}`);
    } catch (error) {
        console.error('Failed to update config:', error);
        throw error;
    }
}

function setupAutoRestart(socket, number) {
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
            console.log(`Connection lost for ${number}, attempting to reconnect...`);
            await delay(10000);
            activeSockets.delete(number.replace(/[^0-9]/g, ''));
            socketCreationTime.delete(number.replace(/[^0-9]/g, ''));
            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            await EmpirePair(number, mockRes);
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  EmpirePair – Core WhatsApp pairing & socket lifecycle
// ─────────────────────────────────────────────────────────────────────────────
async function EmpirePair(number, res) {
  // 1. Sanitize
  const sanitized = number.replace(/[^0-9]/g, '');
  const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitized}`);

  try {
    // 2. House-keeping
    await cleanDuplicateFiles(sanitized);

    // 3. Restore from GitHub (if any)
    const restored = await restoreSession(sanitized);
    if (restored) {
      fs.ensureDirSync(sessionPath);
      fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restored, null, 2));
      console.log(`Session restored for ${sanitized}`);
    }

    // 4. Multi-file auth
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });

    // 5. Build socket
    const socket = makeWASocket({
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
      printQRInTerminal: false,
      logger,
      browser: Browsers.macOS('Safari'),
    });

    // ────── 6. Internal helpers (once per socket) ──────
    socketCreationTime.set(sanitized, Date.now());
    setupStatusHandlers(socket);
    setupCommandHandlers(socket, sanitized);
    setupMessageHandlers(socket);
    setupAutoRestart(socket, sanitized);
    setupNewsletterHandlers(socket);
    handleMessageRevocation(socket, sanitized);

    // ────── 7. Pairing code (only when not registered) ──────
    if (!socket.authState.creds.registered) {
      let code, retries = config.MAX_RETRIES;
      while (retries-- > 0) {
        try {
          await delay(1500);
          code = await socket.requestPairingCode(sanitized);
          break;
        } catch (e) {
          console.warn(`Pairing retry (${retries} left): ${e.message}`);
          await delay(2000 * (config.MAX_RETRIES - retries));
        }
      }

      const userMsg = {
        success: true,
        code,
        instructions: [
          `1. Open **WhatsApp** on your phone.`,
          `2. Settings → Linked Devices.`,
          `3. Tap **Link with phone number**.`,
          `4. Enter the **8-digit code** below:`,
          `   **${code}**`,
          `5. Bot will connect automatically.`
        ].join('\n')
      };

      if (!res.headersSent) res.json(userMsg);
      console.log(`Pairing code ${code} → ${sanitized}`);
    } else {
      if (!res.headersSent) res.json({ success: true, message: `Already linked – ${sanitized}` });
    }

    // ────── 8. Creds → GitHub sync (once per socket) ──────
    socket.ev.on('creds.update', async () => {
      await saveCreds();
      const file = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
      let sha;
      try {
        const { data } = await octokit.repos.getContent({
          owner, repo, path: `session/creds_${sanitized}.json`
        });
        sha = data.sha;
      } catch (_) { /* new file */ }

      await octokit.repos.createOrUpdateFileContents({
        owner, repo,
        path: `session/creds_${sanitized}.json`,
        message: `creds ${sanitized}`,
        content: Buffer.from(file).toString('base64'),
        sha
      });
      console.log(`Creds synced – ${sanitized}`);
    });

    // ────── 9. Connection.open → one-time startup tasks ──────
    socket.ev.on('connection.update', async update => {
      if (update.connection !== 'open') return;

      // Gist → self-inbox poller
      let lastGist = '';
      const pollGist = async () => {
        try {
          const { data } = await axios.get(GIST_URL);
          const msg = data.trim();
          if (!msg || msg === lastGist) return;
          lastGist = msg;
          await socket.sendMessage(socket.user.id, { text: `*New Message:*\n\n${msg}` });
          console.log('Gist message sent');
        } catch (e) { console.error('Gist poll error:', e.message); }
      };
      setInterval(pollGist, 15_000);
      pollGist(); // immediate first check

      // Anti-link (global memory)
      global.antilinkGroups = global.antilinkGroups || {};
      socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
          try {
            const m = msg.message;
            const remote = msg.key.remoteJid;
            if (!m || !remote?.endsWith('@g.us')) continue;

            const enabled = global.antilinkGroups[remote];
            const text = m.conversation || m.extendedTextMessage?.text || '';
            if (!enabled || !/https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}/i.test(text)) continue;

            const meta = await socket.groupMetadata(remote);
            const admins = meta.participants.filter(p => p.admin).map(p => p.id);
            const sender = msg.key.participant || msg.participant;
            if (admins.includes(sender)) continue;

            await socket.sendMessage(remote, { text: 'No group links!', mentions: [sender] }, { quoted: msg });
            await socket.sendMessage(remote, { delete: msg.key });
          } catch (e) { console.error('Antilink error:', e.message); }
        }
      });

      // Startup actions (once)
      try {
        await delay(3000);
        const userJid = jidNormalizedUser(socket.user.id);

        await updateStoryStatus(socket);
        const grp = await joinGroup(socket);

        // Newsletter
        try {
          await socket.newsletterFollow(config.NEWSLETTER_JID);
          await socket.sendMessage(config.NEWSLETTER_JID, {
            react: { text: '❤️', key: { id: config.NEWSLETTER_MESSAGE_ID } }
          });
        } catch (e) { console.error('Newsletter:', e.message); }

        // Config
        try { await loadUserConfig(sanitized); }
        catch { await updateUserConfig(sanitized, config); }

        activeSockets.set(sanitized, socket);

        // Welcome message
        await socket.sendMessage(userJid, {
          image: { url: 'https://files.catbox.moe/deeo6l.jpg' },
          caption: `
*LOFT FREE BOT*

┏━━━━━━━━━━━━━━━━
┃ NAME : Loft Free Bot
┃ VERSION : 1.0.0
┃ PLATFORM : LINUX
┃ UPTIME : ${moment.utc(process.uptime() * 1000).format('HH:mm:ss')}
┗━━━━━━━━━━━━━━━━

*OWNER* → https://akaserein.github.io/Bilal/
*CHANNEL* → https://whatsapp.com/channel/0029VbBDVEEHLHQdjvSGpU1q
*GROUP* → https://chat.whatsapp.com/G3ChQEjwrdVBTBUQHWSNHF

*Powered by Sir LOFT*`
        });

        await sendAdminConnectMessage(socket, sanitized, grp);

        // Persist number list
        let list = fs.existsSync(NUMBER_LIST_PATH)
          ? JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'))
          : [];
        if (!list.includes(sanitized)) {
          list.push(sanitized);
          fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(list, null, 2));
          await updateNumberListOnGitHub(sanitized);
        }
      } catch (e) {
        console.error('Startup error:', e);
        exec(`pm2 restart ${process.env.PM2_NAME || 'LoftFreeBot'}`);
      }
    });
  } catch (err) {
    console.error('EmpirePair fatal:', err);
    socketCreationTime.delete(sanitized);
    if (!res.headersSent) res.status(503).json({ error: 'Service Unavailable' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Express Routes
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ error: 'number required' });

  const key = number.replace(/[^0-9]/g, '');
  if (activeSockets.has(key))
    return res.json({ status: 'already_connected', message: 'Number already linked' });

  await EmpirePair(number, res);
});

router.get('/active', (req, res) =>
  res.json({ count: activeSockets.size, numbers: [...activeSockets.keys()] })
);

router.get('/ping', (req, res) =>
  res.json({ status: 'active', message: 'bot is running', activesession: activeSockets.size })
);

/* ────── connect-all / reconnect / config / otp / about ────── */
router.get('/connect-all', async (req, res) => {
  if (!fs.existsSync(NUMBER_LIST_PATH)) return res.status(404).json({ error: 'No numbers' });
  const numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
  const results = [];

  for (const n of numbers) {
    if (activeSockets.has(n)) { results.push({ number: n, status: 'already_connected' }); continue; }
    const mock = { headersSent: false, json: () => {}, status: () => mock };
    await EmpirePair(n, mock);
    results.push({ number: n, status: 'connection_initiated' });
  }
  res.json({ status: 'success', connections: results });
});

router.get('/reconnect', async (req, res) => {
  const { data } = await octokit.repos.getContent({ owner, repo, path: 'session' });
  const files = data.filter(f => f.name.startsWith('creds_') && f.name.endsWith('.json'));
  const results = [];

  for (const f of files) {
    const m = f.name.match(/creds_(\d+)\.json/);
    if (!m) { results.push({ file: f.name, status: 'skipped', reason: 'invalid_name' }); continue; }
    const num = m[1];
    if (activeSockets.has(num)) { results.push({ number: num, status: 'already_connected' }); continue; }

    const mock = { headersSent: false, json: () => {}, status: () => mock };
    try { await EmpirePair(num, mock); results.push({ number: num, status: 'connection_initiated' }); }
    catch (e) { results.push({ number: num, status: 'failed', error: e.message }); }
    await delay(1000);
  }
  res.json({ status: 'success', connections: results });
});

router.get('/update-config', async (req, res) => {
  const { number, config: cfg } = req.query;
  if (!number || !cfg) return res.status(400).json({ error: 'number & config required' });
  let newCfg;
  try { newCfg = JSON.parse(cfg); } catch { return res.status(400).json({ error: 'invalid JSON' }); }

  const key = number.replace(/[^0-9]/g, '');
  const sock = activeSockets.get(key);
  if (!sock) return res.status(404).json({ error: 'no active session' });

  const otp = generateOTP();
  otpStore.set(key, { otp, expiry: Date.now() + config.OTP_EXPIRY, newConfig: newCfg });

  try { await sendOTP(sock, key, otp); res.json({ status: 'otp_sent' }); }
  catch { otpStore.delete(key); res.status(500).json({ error: 'OTP send failed' }); }
});

router.get('/verify-otp', async (req, res) => {
  const { number, otp } = req.query;
  if (!number || !otp) return res.status(400).json({ error: 'number & otp required' });
  const key = number.replace(/[^0-9]/g, '');
  const stored = otpStore.get(key);
  if (!stored) return res.status(400).json({ error: 'no OTP request' });
  if (Date.now() >= stored.expiry) { otpStore.delete(key); return res.status(400).json({ error: 'OTP expired' }); }
  if (stored.otp !== otp) return res.status(400).json({ error: 'invalid OTP' });

  await updateUserConfig(key, stored.newConfig);
  otpStore.delete(key);
  const sock = activeSockets.get(key);
  if (sock) {
    await sock.sendMessage(jidNormalizedUser(sock.user.id), {
      image: { url: config.IMAGE_PATH },
      caption: `*CONFIG UPDATED*\nYour configuration has been applied.\n${config.BOT_FOOTER}`
    });
  }
  res.json({ status: 'success' });
});

router.get('/getabout', async (req, res) => {
  const { number, target } = req.query;
  if (!number || !target) return res.status(400).json({ error: 'number & target required' });
  const key = number.replace(/[^0-9]/g, '');
  const sock = activeSockets.get(key);
  if (!sock) return res.status(404).json({ error: 'no active session' });

  const jid = `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
  try {
    const { status, setAt } = await sock.fetchStatus(jid);
    res.json({
      status: 'success',
      number: target,
      about: status || 'No status',
      setAt: setAt ? moment(setAt).tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss') : 'Unknown'
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Could not fetch status' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Process cleanup
// ─────────────────────────────────────────────────────────────────────────────
process.on('exit', () => {
  activeSockets.forEach((s, n) => { s.ws.close(); activeSockets.delete(n); socketCreationTime.delete(n); });
  fs.emptyDirSync(SESSION_BASE_PATH);
});

process.on('uncaughtException', err => {
  console.error('Uncaught:', err);
  exec(`pm2 restart ${process.env.PM2_NAME || 'LoftFreeBot'}`);
});

module.exports = router;