const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { Responder } = require('./responder');

const rutaConfig = process.env.CONFIG || path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(rutaConfig, 'utf8'));
const responder = new Responder(config);

// IDs de los mensajes que envía el bot, para distinguirlos de los que escribes tú.
const enviadosPorBot = new Set();

const client = new Client({
  authStrategy: new LocalAuth(), // guarda la sesión en .wwebjs_auth/ para no escanear el QR cada vez
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  },
});

client.on('qr', (qr) => {
  console.log('Escanea este código QR con WhatsApp (Ajustes > Dispositivos vinculados):');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ Bot conectado. Respondiendo mensajes automáticamente...'));
client.on('auth_failure', (msg) => console.error('❌ Error de autenticación:', msg));
client.on('disconnected', (motivo) => console.warn('⚠️ Desconectado:', motivo));

client.on('message_create', async (msg) => {
  // Si escribes tú a mano en un chat, el bot deja de responder en él durante un rato.
  if (msg.fromMe && !enviadosPorBot.has(msg.id._serialized)) {
    responder.pausar(msg.to);
  }
});

client.on('message', async (msg) => {
  try {
    if (msg.fromMe || msg.isStatus || msg.from === 'status@broadcast') return;

    const respuesta = responder.decidir({
      de: msg.from,
      texto: msg.body,
      esGrupo: msg.from.endsWith('@g.us'),
      fecha: new Date(msg.timestamp * 1000),
    });
    if (!respuesta) return;

    const enviado = await client.sendMessage(msg.from, respuesta);
    enviadosPorBot.add(enviado.id._serialized);
    console.log(`→ ${msg.from}: ${respuesta}`);
  } catch (err) {
    console.error('Error respondiendo mensaje:', err);
  }
});

client.initialize();
