/* ═══════════════════════════════════════════════════════════
   CodeForge — Editor de Código Integrado
   ═══════════════════════════════════════════════════════════ */

var editorContent = '';
var editorLang = 'html';

function renderEditorPanel() {
  var html = '';
  html += '<div class="panel-header"><h2>💻 Editor de Código</h2><p>Escreva código ou cole o que a IA gerou</p></div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap;">';
  ['html','css','javascript','python','php','sql','json'].forEach(function(lang) {
    html += '<button class="btn btn-sm ' + (editorLang===lang?'btn-primary':'btn-secondary') + '" onclick="setEditorLang(\'' + lang + '\')">' + lang.toUpperCase() + '</button>';
  });
  html += '<button class="btn btn-sm btn-secondary" onclick="runEditorCode()" style="margin-left:auto;">▶ Executar</button>';
  html += '<button class="btn btn-sm btn-secondary" onclick="copyEditorCode()">📋 Copiar</button>';
  html += '<button class="btn btn-sm btn-secondary" onclick="downloadEditorCode()">💾 Baixar</button>';
  html += '</div>';

  html += '<div class="editor-container">';
  html += '<div class="editor-pane">';
  html += '<div class="editor-pane-header"><div class="tab"><span class="dot" style="background:var(--primary);"></span> Código — ' + editorLang.toUpperCase() + '</div></div>';
  html += '<textarea class="editor-textarea" id="codeEditor" placeholder="// Escreva seu código aqui ou cole o que a IA gerou..." spellcheck="false" oninput="updatePreview()">' + escapeHtml(editorContent) + '</textarea>';
  html += '</div>';
  html += '<div class="editor-pane" style="border-left:1px solid var(--border);">';
  html += '<div class="editor-pane-header"><div class="tab"><span class="dot" style="background:var(--info);"></span> Preview</div></div>';
  html += '<iframe id="previewFrame" class="preview-frame" sandbox="allow-scripts allow-same-origin"></iframe>';
  html += '</div></div>';

  return html;
}

function setEditorLang(lang) { editorLang = lang; renderCurrentPanel(); }

function updatePreview() {
  var editor = document.getElementById('codeEditor');
  var frame = document.getElementById('previewFrame');
  if (!editor || !frame) return;
  editorContent = editor.value;
  if (editorLang === 'html' || editorLang === 'css') {
    var content = editorLang === 'css' ? '<style>' + editorContent + '</style><div>Preview CSS</div>' : editorContent;
    frame.srcdoc = content;
  }
}

function runEditorCode() {
  var editor = document.getElementById('codeEditor');
  if (!editor) return;
  editorContent = editor.value;
  if (editorLang === 'html') {
    var frame = document.getElementById('previewFrame');
    if (frame) frame.srcdoc = editorContent;
    showToast('▶ HTML renderizado!', 'success');
  } else if (editorLang === 'javascript') {
    try { eval(editorContent); showToast('▶ JavaScript executado!', 'success'); } catch(e) { showToast('❌ Erro: ' + e.message, 'error'); }
  } else {
    showToast('Preview disponível para HTML e JS', 'info');
  }
}

function copyEditorCode() {
  var editor = document.getElementById('codeEditor');
  if (!editor) return;
  navigator.clipboard.writeText(editor.value).then(function() { showToast('📋 Copiado!', 'success'); });
}

function downloadEditorCode() {
  var editor = document.getElementById('codeEditor');
  if (!editor) return;
  var ext = { html:'.html', css:'.css', javascript:'.js', python:'.py', php:'.php', sql:'.sql', json:'.json' };
  var blob = new Blob([editor.value], { type: 'text/plain' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'codeforge-output' + (ext[editorLang] || '.txt');
  a.click();
  showToast('💾 Arquivo baixado!', 'success');
}

function escapeHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ═══ COPIAR CÓDIGO DO CHAT ═══ */
function copyCodeBlock(btn) {
  var block = btn.closest('.code-block');
  if (!block) return;
  var code = block.querySelector('.code-body');
  if (!code) return;
  navigator.clipboard.writeText(code.textContent).then(function() {
    btn.textContent = '✅ Copiado!';
    setTimeout(function() { btn.textContent = '📋 Copiar'; }, 2000);
  });
}

function sendToEditor(btn) {
  var block = btn.closest('.code-block');
  if (!block) return;
  var code = block.querySelector('.code-body');
  var langEl = block.querySelector('.lang');
  if (!code) return;
  editorContent = code.textContent;
  if (langEl) {
    var l = langEl.textContent.toLowerCase().trim();
    if (['html','css','javascript','python','php','sql','json','js'].indexOf(l) > -1) editorLang = l === 'js' ? 'javascript' : l;
  }
  switchPanel('editor');
  showToast('📤 Código enviado para o editor!', 'success');
}
