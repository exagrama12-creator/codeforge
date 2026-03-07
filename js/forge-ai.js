/* ═══════════════════════════════════════════════════════════
   CodeForge — IA (Google Gemini — sem restrição)
   ═══════════════════════════════════════════════════════════ */

var FORGE_API_KEY = ''; // User sets via UI
var FORGE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

function getForgeApiKey() {
  return localStorage.getItem('codeforge_apikey') || '';
}
function saveForgeApiKey(k) {
  localStorage.setItem('codeforge_apikey', k);
}

async function callForgeAI(userMessage, agentId) {
  agentId = agentId || currentAgent;
  var apiKey = getForgeApiKey();
  if (!apiKey) throw new Error('Configure sua chave API! Clique em ⚙️ no menu.');
  var systemPrompt = getAgentSystemPrompt(agentId);
  
  // Pegar histórico do agente
  var allChat = getForgeChat();
  var agentChat = allChat.filter(function(m) { return m.agent === agentId; }).slice(-12);
  
  var contents = [];
  agentChat.forEach(function(m) {
    contents.push({ role: m.from === 'user' ? 'user' : 'model', parts: [{ text: m.message }] });
  });
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  var body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
  };

  // Tentar múltiplos modelos
  for (var i = 0; i < FORGE_MODELS.length; i++) {
    var model = FORGE_MODELS[i];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
    try {
      var resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (resp.ok) {
        var data = await resp.json();
        var text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
      if (resp.status === 429) continue;
      if (resp.status === 403) throw new Error('Chave API inválida.');
    } catch(e) {
      if (e.message === 'Chave API inválida.') throw e;
      continue;
    }
  }
  throw new Error('IA temporariamente indisponível. Tente novamente em 1 minuto.');
}

/* ═══ ENVIAR MENSAGEM ═══ */
async function sendForgeMessage() {
  var input = document.getElementById('forgeInput');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.style.height = '44px';

  // Salvar msg user
  var chat = getForgeChat();
  chat.push({ from: 'user', agent: currentAgent, message: msg, timestamp: new Date().toISOString() });
  saveForgeChat(chat);
  renderChatMessages();

  // Typing
  setTyping(true);

  try {
    var aiResp = await callForgeAI(msg, currentAgent);
    var chat2 = getForgeChat();
    chat2.push({ from: 'ai', agent: currentAgent, message: aiResp, timestamp: new Date().toISOString() });
    saveForgeChat(chat2);
  } catch(e) {
    var chat3 = getForgeChat();
    chat3.push({ from: 'ai', agent: currentAgent, message: '❌ ' + e.message, timestamp: new Date().toISOString() });
    saveForgeChat(chat3);
  }

  setTyping(false);
  renderChatMessages();
}

function setTyping(show) {
  var el = document.getElementById('forgeTyping');
  if (el) el.style.display = show ? 'flex' : 'none';
}
