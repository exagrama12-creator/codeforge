/* ═══════════════════════════════════════════════════════════
   CodeForge — Core (DB, utils, state)
   ═══════════════════════════════════════════════════════════ */

var FORGE_DB_KEY = 'codeforge_db';
var FORGE_CHAT_KEY = 'codeforge_chat';

function getForgeDB() {
  var def = {
    projects: [],
    files: [],
    history: [],
    settings: { theme:'dark', fontSize:14 }
  };
  return JSON.parse(localStorage.getItem(FORGE_DB_KEY) || JSON.stringify(def));
}
function saveForgeDB(db) { localStorage.setItem(FORGE_DB_KEY, JSON.stringify(db)); }

function getForgeChat() { return JSON.parse(localStorage.getItem(FORGE_CHAT_KEY) || '[]'); }
function saveForgeChat(c) { if(c.length>300) c=c.slice(-300); localStorage.setItem(FORGE_CHAT_KEY, JSON.stringify(c)); }

// Toast
function showToast(msg, type) {
  type = type || 'info';
  var tc = document.getElementById('toastContainer');
  if (!tc) return;
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(function(){ t.remove(); }, 4000);
}

// State
var currentPanel = 'commander';
var currentAgent = 'commander';

// Generate ID
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
