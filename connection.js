const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const { state, saveState } = useSingleFileAuthState('./session.json');
const commandMap = {};
global.autoSave = false;

const contactPath = path.join(__dirname, './lib/contacts.json');
if (!fs.existsSync(contactPath)) fs.writeFileSync(contactPath, '{}');


fs.readdirSync('./plugins').forEach(file => {
  const plugin = require('./plugins/' + file);
  if (plugin.command) {
    const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
    cmds.forEach(cmd => {
      commandMap[cmd] = plugin;
    });
  }
});

async function start() {
  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  conn.ev.on('creds.update', saveState);

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const sender = m.key.remoteJid;
    const pushName = m.pushName || 'Unknown';
    const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if (!body.startsWith(config.PREFIX)) return;

    
    if (global.autoSave && sender.endsWith('@s.whatsapp.net')) {
      await conn.readMessages([m.key]);
      let contacts = JSON.parse(fs.readFileSync(contactPath, 'utf-8'));
      if (!contacts[sender]) {
        contacts[sender] = pushName;
        fs.writeFileSync(contactPath, JSON.stringify(contacts, null, 2));
        console.log('🆕 Saved contact:', sender, pushName);
      }
    }

    const commandName = body.slice(1).split(' ')[0].toLowerCase();
    const args = body.trim().split(/\s+/).slice(1);

    const command = commandMap[commandName];
    if (command) {
      try {
        await command.execute(conn, m, { args });
      } catch (e) {
        console.error(`❌ Error in command ${commandName}:`, e);
        await conn.sendMessage(sender, { text: `⚠️ Command error: ${e.message}` });
      }
    }
  });

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        start(); // reconnect
      } else {
        console.log('🔒 Connection closed. Logged out.');
      }
    }
  });
}

start();
