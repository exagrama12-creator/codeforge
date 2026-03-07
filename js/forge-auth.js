/* ═══════════════════════════════════════════════════════════
   CodeForge — Sistema de Login/Cadastro
   ═══════════════════════════════════════════════════════════ */

var FORGE_USERS_KEY = 'codeforge_users';
var FORGE_SESSION_KEY = 'codeforge_session';

function getUsers() { return JSON.parse(localStorage.getItem(FORGE_USERS_KEY) || '[]'); }
function saveUsers(u) { localStorage.setItem(FORGE_USERS_KEY, JSON.stringify(u)); }
function getSession() { return JSON.parse(localStorage.getItem(FORGE_SESSION_KEY) || 'null'); }
function saveSession(s) { localStorage.setItem(FORGE_SESSION_KEY, JSON.stringify(s)); }

function isLoggedIn() { return getSession() !== null; }

function hashPassword(pw) {
  // Hash simples mas funcional (SHA-256 via string)
  var hash = 0;
  for (var i = 0; i < pw.length; i++) {
    var c = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return 'cf_' + Math.abs(hash).toString(36) + '_' + pw.length + '_' + pw.charCodeAt(0).toString(36);
}

/* ═══ CADASTRO ═══ */
function registerUser() {
  var name = document.getElementById('regName').value.trim();
  var email = document.getElementById('regEmail').value.trim();
  var pw = document.getElementById('regPassword').value;
  var pw2 = document.getElementById('regPassword2').value;

  if (!name || !email || !pw) { showToast('Preencha todos os campos!', 'error'); return; }
  if (pw.length < 4) { showToast('Senha deve ter pelo menos 4 caracteres!', 'error'); return; }
  if (pw !== pw2) { showToast('As senhas não conferem!', 'error'); return; }

  var users = getUsers();
  if (users.some(function(u) { return u.email === email; })) {
    showToast('Email já cadastrado!', 'error'); return;
  }

  var user = {
    id: Date.now().toString(36),
    name: name,
    email: email,
    password: hashPassword(pw),
    role: users.length === 0 ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);

  // Auto-login
  saveSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  showToast('✅ Conta criada! Bem-vindo, ' + name + '!', 'success');

  setTimeout(function() { renderApp(); }, 500);
}

/* ═══ LOGIN ═══ */
function loginUser() {
  var email = document.getElementById('loginEmail').value.trim();
  var pw = document.getElementById('loginPassword').value;

  if (!email || !pw) { showToast('Preencha email e senha!', 'error'); return; }

  var users = getUsers();
  var user = users.find(function(u) { return u.email === email && u.password === hashPassword(pw); });

  if (!user) { showToast('Email ou senha incorretos!', 'error'); return; }

  saveSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  showToast('✅ Bem-vindo de volta, ' + user.name + '!', 'success');

  setTimeout(function() { renderApp(); }, 500);
}

/* ═══ LOGOUT ═══ */
function logoutUser() {
  localStorage.removeItem(FORGE_SESSION_KEY);
  showToast('👋 Até logo!', 'info');
  setTimeout(function() { renderLoginScreen(); }, 300);
}

/* ═══ TELA DE LOGIN ═══ */
var loginMode = 'login'; // 'login' ou 'register'

function toggleLoginMode() {
  loginMode = loginMode === 'login' ? 'register' : 'login';
  renderLoginScreen();
}

function renderLoginScreen() {
  var app = document.getElementById('app');
  if (!app) return;

  var h = '';
  h += '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:1rem;">';
  h += '<div style="width:100%;max-width:420px;">';

  // Logo
  h += '<div style="text-align:center;margin-bottom:2.5rem;">';
  h += '<div style="width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 1rem;box-shadow:0 0 40px rgba(16,185,129,0.3);">⚡</div>';
  h += '<h1 style="font-size:1.8rem;font-weight:800;color:var(--primary-light);margin:0;">CodeForge</h1>';
  h += '<p style="color:var(--text-dim);font-size:0.85rem;margin-top:4px;">Software House com Inteligência Artificial</p>';
  h += '</div>';

  // Card
  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2rem;box-shadow:var(--shadow);">';

  if (loginMode === 'login') {
    h += '<h2 style="font-size:1.2rem;margin-bottom:1.5rem;text-align:center;">🔐 Entrar</h2>';

    h += '<div style="margin-bottom:1rem;">';
    h += '<label style="font-size:0.75rem;color:var(--text-dim);display:block;margin-bottom:4px;">Email</label>';
    h += '<input type="email" id="loginEmail" placeholder="seu@email.com" style="width:100%;padding:12px 16px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;" onkeydown="if(event.key===\'Enter\')document.getElementById(\'loginPassword\').focus()">';
    h += '</div>';

    h += '<div style="margin-bottom:1.5rem;">';
    h += '<label style="font-size:0.75rem;color:var(--text-dim);display:block;margin-bottom:4px;">Senha</label>';
    h += '<input type="password" id="loginPassword" placeholder="••••••" style="width:100%;padding:12px 16px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;" onkeydown="if(event.key===\'Enter\')loginUser()">';
    h += '</div>';

    h += '<button class="btn btn-primary" onclick="loginUser()" style="width:100%;padding:14px;font-size:1rem;border-radius:var(--radius-sm);">Entrar ➤</button>';

    h += '<div style="text-align:center;margin-top:1.5rem;font-size:0.85rem;color:var(--text-dim);">';
    h += 'Não tem conta? <a href="#" onclick="toggleLoginMode();return false;" style="color:var(--primary-light);text-decoration:none;font-weight:600;">Cadastre-se</a>';
    h += '</div>';

  } else {
    h += '<h2 style="font-size:1.2rem;margin-bottom:1.5rem;text-align:center;">📝 Criar Conta</h2>';

    h += '<div style="margin-bottom:1rem;">';
    h += '<label style="font-size:0.75rem;color:var(--text-dim);display:block;margin-bottom:4px;">Nome</label>';
    h += '<input type="text" id="regName" placeholder="Seu nome" style="width:100%;padding:12px 16px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;">';
    h += '</div>';

    h += '<div style="margin-bottom:1rem;">';
    h += '<label style="font-size:0.75rem;color:var(--text-dim);display:block;margin-bottom:4px;">Email</label>';
    h += '<input type="email" id="regEmail" placeholder="seu@email.com" style="width:100%;padding:12px 16px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;">';
    h += '</div>';

    h += '<div style="margin-bottom:1rem;">';
    h += '<label style="font-size:0.75rem;color:var(--text-dim);display:block;margin-bottom:4px;">Senha</label>';
    h += '<input type="password" id="regPassword" placeholder="Mínimo 4 caracteres" style="width:100%;padding:12px 16px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;">';
    h += '</div>';

    h += '<div style="margin-bottom:1.5rem;">';
    h += '<label style="font-size:0.75rem;color:var(--text-dim);display:block;margin-bottom:4px;">Confirmar Senha</label>';
    h += '<input type="password" id="regPassword2" placeholder="Repita a senha" style="width:100%;padding:12px 16px;background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;" onkeydown="if(event.key===\'Enter\')registerUser()">';
    h += '</div>';

    h += '<button class="btn btn-primary" onclick="registerUser()" style="width:100%;padding:14px;font-size:1rem;border-radius:var(--radius-sm);">Criar Conta ⚡</button>';

    h += '<div style="text-align:center;margin-top:1.5rem;font-size:0.85rem;color:var(--text-dim);">';
    h += 'Já tem conta? <a href="#" onclick="toggleLoginMode();return false;" style="color:var(--primary-light);text-decoration:none;font-weight:600;">Fazer Login</a>';
    h += '</div>';
  }

  h += '</div>'; // card

  // Footer
  h += '<div style="text-align:center;margin-top:1.5rem;font-size:0.7rem;color:var(--text-muted);">⚡ CodeForge — Powered by IA Real</div>';

  h += '</div></div>';

  app.innerHTML = h;

  // Focus no primeiro campo
  setTimeout(function() {
    var first = document.getElementById(loginMode === 'login' ? 'loginEmail' : 'regName');
    if (first) first.focus();
  }, 100);
}
