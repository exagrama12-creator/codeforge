/* ═══════════════════════════════════════════════════════════
   CodeForge — UI Principal
   ═══════════════════════════════════════════════════════════ */

function renderApp() {
  var app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '<div class="app-layout">' +
    '<header class="app-header">' + renderHeader() + '</header>' +
    '<aside class="app-sidebar" id="sidebar">' + renderSidebar() + '</aside>' +
    '<main class="app-main" id="mainContent">' + renderMainPanels() + '</main>' +
    '</div>';

  // Ativar painel atual
  switchPanel(currentPanel);
  setTimeout(function() { renderChatMessages(); }, 50);
}

/* ═══ HEADER ═══ */
function renderHeader() {
  var agent = getAgent(currentAgent);
  var session = getSession();
  var userName = session ? session.name : '';
  return '<div class="logo-area">' +
    '<button class="btn-icon" onclick="toggleSidebar()" style="display:none;" id="menuBtn">☰</button>' +
    '<div class="logo-icon">⚡</div>' +
    '<div class="logo-text">CodeForge <span>Software House com IA</span></div>' +
    '</div>' +
    '<div class="header-status">' +
    '<div style="display:flex;align-items:center;gap:6px;padding:6px 14px;background:var(--bg-3);border-radius:20px;border:1px solid var(--border);">' +
    '<span style="font-size:1rem;">' + agent.icon + '</span>' +
    '<span style="font-size:0.8rem;color:var(--text);">' + agent.name + '</span>' +
    '<span style="font-size:0.7rem;color:var(--text-dim);">— ' + agent.role + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:6px;"><span class="status-dot"></span><span class="status-text">IA Online</span></div>' +
    '<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg-3);border-radius:20px;border:1px solid var(--border);">' +
    '<span style="font-size:0.8rem;">👑 ' + userName + '</span>' +
    '<button onclick="logoutUser()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.75rem;padding:2px 6px;" title="Sair">🚪</button>' +
    '</div>' +
    '</div>';
}

/* ═══ SIDEBAR ═══ */
function renderSidebar() {
  var h = '';

  // Seção principal
  h += '<div class="sidebar-section"><div class="sidebar-title">Chat IA</div>';
  h += '<div class="sidebar-item ' + (currentPanel==='commander'?'active':'') + '" onclick="switchToAgent(\'commander\')">' +
    '<div class="agent-icon" style="background:linear-gradient(135deg,#10b981,#0ea5e9);">⚡</div>' +
    '<div><span class="agent-name">FORGE</span><span class="agent-role">Comandante — Fale aqui</span></div></div>';
  h += '</div>';

  // Equipe
  h += '<div class="sidebar-section"><div class="sidebar-title">Equipe</div>';
  FORGE_AGENTS.forEach(function(a) {
    if (a.id === 'commander') return;
    h += '<div class="sidebar-item ' + (currentAgent===a.id?'active':'') + '" onclick="switchToAgent(\'' + a.id + '\')">' +
      '<div class="agent-icon" style="background:' + a.color + '20;color:' + a.color + ';">' + a.icon + '</div>' +
      '<div><span class="agent-name">' + a.name + '</span><span class="agent-role">' + a.role + '</span></div></div>';
  });
  h += '</div>';

  // Ferramentas
  h += '<div class="sidebar-section"><div class="sidebar-title">Ferramentas</div>';
  h += '<div class="sidebar-item ' + (currentPanel==='editor'?'active':'') + '" onclick="switchPanel(\'editor\')"><div class="agent-icon" style="background:rgba(99,102,241,0.15);color:#818cf8;">💻</div><div><span class="agent-name">Editor</span><span class="agent-role">Escreva e teste código</span></div></div>';
  h += '<div class="sidebar-item ' + (currentPanel==='projects'?'active':'') + '" onclick="switchPanel(\'projects\')"><div class="agent-icon" style="background:rgba(249,115,22,0.15);color:#f97316;">📁</div><div><span class="agent-name">Projetos</span><span class="agent-role">Seus projetos salvos</span></div></div>';
  h += '<div class="sidebar-item ' + (currentPanel==='team'?'active':'') + '" onclick="switchPanel(\'team\')"><div class="agent-icon" style="background:rgba(236,72,153,0.15);color:#ec4899;">👥</div><div><span class="agent-name">Equipe</span><span class="agent-role">Conheça os agentes</span></div></div>';
  h += '<div class="sidebar-item ' + (currentPanel==='settings'?'active':'') + '" onclick="switchPanel(\'settings\')"><div class="agent-icon" style="background:rgba(249,115,22,0.15);color:#f59e0b;">⚙️</div><div><span class="agent-name">Config</span><span class="agent-role">Chave API / Ajustes</span></div></div>';
  h += '</div>';

  return h;
}

/* ═══ MAIN PANELS ═══ */
function renderMainPanels() {
  return '<div class="panel" id="panel-chat">' + renderChatPanel() + '</div>' +
    '<div class="panel" id="panel-editor">' + renderEditorPanel() + '</div>' +
    '<div class="panel" id="panel-projects">' + renderProjectsPanel() + '</div>' +
    '<div class="panel" id="panel-team">' + renderTeamPanel() + '</div>' +
    '<div class="panel" id="panel-settings">' + renderSettingsPanel() + '</div>';
}

/* ═══ CHAT PANEL ═══ */
function renderChatPanel() {
  var agent = getAgent(currentAgent);
  var h = '';
  h += '<div class="panel-header"><h2>' + agent.icon + ' ' + agent.name + ' — ' + agent.role + '</h2><p>' + agent.desc + '</p></div>';
  h += '<div class="chat-container">';
  h += '<div class="chat-messages" id="chatMessages"></div>';
  h += '<div class="typing" id="forgeTyping" style="display:none;"><div class="typing-dots"><span></span><span></span><span></span></div>' + agent.name + ' está programando...</div>';
  h += '<div class="chat-input-area">';
  h += '<textarea class="chat-input" id="forgeInput" placeholder="Descreva o que precisa em português... (ex: cria um site de portfólio moderno)" onkeydown="handleForgeKey(event)" rows="1" oninput="autoResize(this)"></textarea>';
  h += '<button class="chat-send" onclick="sendForgeMessage()">➤</button>';
  h += '</div></div>';
  return h;
}

/* ═══ PROJECTS PANEL ═══ */
function renderProjectsPanel() {
  var db = getForgeDB();
  var h = '';
  h += '<div class="panel-header"><h2>📁 Projetos</h2><p>Códigos e projetos gerados pela equipe</p></div>';

  if (db.projects.length === 0) {
    h += '<div style="text-align:center;padding:4rem;color:var(--text-dim);">';
    h += '<div style="font-size:3rem;margin-bottom:1rem;">📁</div>';
    h += '<div style="font-size:1.1rem;margin-bottom:0.5rem;">Nenhum projeto ainda</div>';
    h += '<div style="font-size:0.85rem;">Peça algo pra equipe e o código será salvo aqui automaticamente</div>';
    h += '</div>';
  } else {
    h += '<div class="projects-grid">';
    db.projects.forEach(function(p) {
      h += '<div class="project-card" onclick="openProject(\'' + p.id + '\')">';
      h += '<h4>' + p.icon + ' ' + p.name + '</h4>';
      h += '<p>' + p.desc + '</p>';
      h += '<div class="project-meta">';
      (p.tags || []).forEach(function(t) { h += '<span class="tag">' + t + '</span>'; });
      h += '<span class="tag">' + (p.createdAt || '').split('T')[0] + '</span>';
      h += '</div></div>';
    });
    h += '</div>';
  }
  return h;
}

/* ═══ TEAM PANEL ═══ */
function renderTeamPanel() {
  var h = '';
  h += '<div class="panel-header"><h2>👥 Equipe CodeForge</h2><p>Sua software house completa com ' + FORGE_AGENTS.length + ' profissionais de IA</p></div>';
  h += '<div class="agents-grid">';
  FORGE_AGENTS.forEach(function(a) {
    h += '<div class="agent-card" onclick="switchToAgent(\'' + a.id + '\')" style="cursor:pointer;">';
    h += '<div class="agent-card-header">';
    h += '<div class="agent-card-icon" style="background:' + a.color + '20;color:' + a.color + ';">' + a.icon + '</div>';
    h += '<div class="agent-card-info"><h4>' + a.name + '</h4><div class="role">' + a.role + '</div></div></div>';
    h += '<div class="agent-card-desc">' + a.desc + '</div>';
    h += '<div class="agent-card-skills">';
    a.skills.forEach(function(s) { h += '<span class="skill">' + s + '</span>'; });
    h += '</div></div>';
  });
  h += '</div>';
  return h;
}

/* ═══ RENDER CHAT MESSAGES ═══ */
function renderChatMessages() {
  var c = document.getElementById('chatMessages');
  if (!c) return;
  var chat = getForgeChat().filter(function(m) { return m.agent === currentAgent; });
  var agent = getAgent(currentAgent);

  if (!chat.length) {
    var hasKey = !!getForgeApiKey();
    var keyWarning = hasKey ? '' : '<div style="margin-top:1rem;padding:12px 16px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:8px;font-size:0.8rem;color:#f59e0b;">⚠️ <strong>Configure sua chave API</strong> para ativar a IA! Vá em <a href="#" onclick="switchPanel(\'settings\');return false;" style="color:var(--primary-light);">⚙️ Config</a> no menu lateral.</div>';
    c.innerHTML = '<div style="text-align:center;padding:4rem 1rem;color:var(--text-dim);">' +
      '<div style="font-size:3.5rem;margin-bottom:1rem;">' + agent.icon + '</div>' +
      '<div style="font-size:1.2rem;font-weight:700;color:' + agent.color + ';margin-bottom:0.5rem;">' + agent.name + ' — ' + agent.role + '</div>' +
      '<div style="font-size:0.9rem;max-width:500px;margin:0 auto;line-height:1.7;">' + agent.desc + '<br><br>Fale em português o que precisa!' + keyWarning + '</div></div>';
    return;
  }

  c.innerHTML = chat.map(function(m) {
    var isUser = m.from === 'user';
    var text = formatMessage(m.message);
    var time = new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    return '<div class="msg ' + (isUser ? 'user' : 'ai') + '">' +
      '<div class="msg-avatar" style="' + (isUser ? '' : 'background:linear-gradient(135deg,' + agent.color + ',' + agent.color + '80);') + '">' + (isUser ? '👑' : agent.icon) + '</div>' +
      '<div class="msg-body">' +
      '<div class="msg-meta">' + (isUser ? 'Você' : agent.icon + ' ' + agent.name) + ' • ' + time + '</div>' +
      '<div class="msg-content">' + text + '</div>' +
      '</div></div>';
  }).join('');

  c.scrollTop = c.scrollHeight;
}

/* ═══ FORMAT MESSAGE (com code blocks) ═══ */
function formatMessage(text) {
  // Escape HTML primeiro
  text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  
  // Code blocks ```lang ... ```
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
    lang = lang || 'code';
    return '<div class="code-block">' +
      '<div class="code-header"><span class="lang">' + lang + '</span><div style="display:flex;gap:6px;"><button class="code-copy" onclick="copyCodeBlock(this)">📋 Copiar</button><button class="code-copy" onclick="sendToEditor(this)">📤 Editor</button></div></div>' +
      '<div class="code-body">' + code.trim() + '</div></div>';
  });

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code style="background:var(--bg-3);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.8rem;">$1</code>');

  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Line breaks
  text = text.replace(/\n/g, '<br>');

  return text;
}

/* ═══ SETTINGS PANEL ═══ */
function renderSettingsPanel() {
  var key = getForgeApiKey();
  var masked = key ? key.substring(0,8) + '...' + key.substring(key.length-4) : '';
  var h = '';
  h += '<div class="panel-header"><h2>⚙️ Configurações</h2><p>Configure sua chave API para ativar a IA</p></div>';

  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem;">';
  h += '<h3 style="font-size:1rem;margin-bottom:1rem;display:flex;align-items:center;gap:8px;">🔑 Chave API Google Gemini <span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:' + (key ? 'rgba(16,185,129,0.15);color:var(--success);' : 'rgba(239,68,68,0.15);color:var(--danger);') + '">' + (key ? '✅ Ativa' : '❌ Pendente') + '</span></h3>';

  if (key) {
    h += '<div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:1rem;">Chave atual: <code style="background:var(--bg-3);padding:2px 8px;border-radius:4px;">' + masked + '</code></div>';
    h += '<button class="btn btn-secondary" onclick="removeForgeApiKey()">🗑️ Remover Chave</button>';
  } else {
    h += '<div style="font-size:0.85rem;line-height:1.8;margin-bottom:1rem;">';
    h += '<strong>Como obter (100% grátis):</strong><br>';
    h += '1️⃣ Acesse <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--primary-light);">aistudio.google.com/apikey</a><br>';
    h += '2️⃣ Login com conta Google<br>';
    h += '3️⃣ Clique em <strong>"Create API Key in new project"</strong><br>';
    h += '4️⃣ Copie e cole abaixo</div>';
    h += '<div style="display:flex;gap:8px;"><input type="text" id="forgeApiKeyInput" placeholder="Cole a chave aqui (AIza...)" style="flex:1;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;"><button class="btn btn-primary" onclick="setForgeApiKey()">💾 Salvar</button></div>';
  }
  h += '</div>';

  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;">';
  h += '<h3 style="font-size:1rem;margin-bottom:0.5rem;">ℹ️ Sobre a Chave</h3>';
  h += '<div style="font-size:0.8rem;color:var(--text-dim);line-height:1.7;">';
  h += '• A chave fica salva <strong>apenas no seu navegador</strong> (localStorage)<br>';
  h += '• Nunca é enviada pra nenhum servidor nosso<br>';
  h += '• Google Gemini oferece <strong>60 requisições por minuto grátis</strong><br>';
  h += '• Se mudar de navegador, precisa colocar novamente</div>';
  h += '</div>';

  return h;
}

function setForgeApiKey() {
  var input = document.getElementById('forgeApiKeyInput');
  if (!input) return;
  var k = input.value.trim();
  if (!k || k.length < 20) { showToast('Chave inválida!', 'error'); return; }
  saveForgeApiKey(k);
  showToast('✅ Chave salva! IA ativada!', 'success');
  switchPanel('settings');
  renderApp();
}

function removeForgeApiKey() {
  localStorage.removeItem('codeforge_apikey');
  showToast('Chave removida.', 'info');
  renderApp();
}

/* ═══ NAVIGATION ═══ */
function switchPanel(panel) {
  currentPanel = panel;
  // Hide all panels
  var panels = document.querySelectorAll('.panel');
  panels.forEach(function(p) { p.classList.remove('active'); });
  
  // Show target
  var target = panel === 'editor' || panel === 'projects' || panel === 'team' || panel === 'settings' ? panel : 'chat';
  var el = document.getElementById('panel-' + target);
  if (el) el.classList.add('active');

  // Update sidebar
  var items = document.querySelectorAll('.sidebar-item');
  items.forEach(function(i) { i.classList.remove('active'); });

  // Re-render if needed
  if (panel === 'editor') {
    el.innerHTML = renderEditorPanel();
    setTimeout(updatePreview, 100);
  }
}

function switchToAgent(agentId) {
  currentAgent = agentId;
  currentPanel = agentId;
  renderApp();
}

function toggleSidebar() {
  var sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}

/* ═══ INPUT HANDLING ═══ */
function handleForgeKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendForgeMessage();
  }
}

function autoResize(el) {
  el.style.height = '44px';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* ═══ CLEAR CHAT ═══ */
function clearAgentChat() {
  var chat = getForgeChat().filter(function(m) { return m.agent !== currentAgent; });
  saveForgeChat(chat);
  renderChatMessages();
  showToast('Chat limpo!', 'info');
}

/* ═══ RESPONSIVE ═══ */
function checkResponsive() {
  var btn = document.getElementById('menuBtn');
  if (btn) btn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
}
window.addEventListener('resize', checkResponsive);

/* ═══ INIT ═══ */
document.addEventListener('DOMContentLoaded', function() {
  if (isLoggedIn()) {
    renderApp();
  } else {
    renderLoginScreen();
  }
  checkResponsive();
});
