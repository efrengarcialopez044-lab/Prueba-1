const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');

let history = [];

function addMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

function autoGrow() {
  chatInput.style.height = 'auto';
  chatInput.style.height = `${chatInput.scrollHeight}px`;
}

chatInput.addEventListener('input', autoGrow);

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage('user', text);
  history.push({ role: 'user', content: text });

  chatInput.value = '';
  autoGrow();
  sendBtn.disabled = true;

  const loadingBubble = addMessage('assistant', 'Escribiendo...');
  loadingBubble.classList.add('loading');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error desconocido');
    }

    loadingBubble.classList.remove('loading');
    loadingBubble.textContent = data.reply;
    history.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    loadingBubble.classList.remove('loading');
    loadingBubble.textContent = `⚠️ ${err.message}`;
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
});

clearBtn.addEventListener('click', () => {
  history = [];
  chatWindow.innerHTML = '';
  addMessage('assistant', '¡Hola de nuevo! ¿En qué puedo ayudarte?');
});
