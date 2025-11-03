const { saveContact } = require('./lib/saveContact');

conn.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  if (!m.message || m.key.fromMe) return;

  const jid = m.key.remoteJid;
  const pushName = m.pushName || 'Unknown';

  if (global.autoSave) {
    try {
      await conn.readMessages([m.key]); // auto seen
      if (jid.endsWith('@s.whatsapp.net')) {
        await saveContact(jid, pushName);
      }
    } catch (e) {
      console.error('AutoSave Error:', e);
    }
  }
});
