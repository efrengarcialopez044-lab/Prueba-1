require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ADVERTENCIA: no se encontró ANTHROPIC_API_KEY en el entorno. Configúrala en .env');
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = 'Eres un asistente de IA útil, honesto y conciso. Responde en el mismo idioma en que te escriben.';

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array "messages" no vacío.' });
    }

    const sanitized = messages
      .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ reply });
  } catch (error) {
    console.error('Error al llamar a la API de Anthropic:', error);
    res.status(500).json({ error: 'Ocurrió un error al generar la respuesta.' });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot corriendo en http://localhost:${PORT}`);
});
