/* ═══════════════════════════════════════════════════════════
   CodeForge — 💰 ZEUS — Super Agente Financeiro
   Gerencia cobranças, planos, pagamentos, faturas
   ═══════════════════════════════════════════════════════════ */

var FINANCE_DB_KEY = 'codeforge_finance';

function getFinanceDB() {
  return JSON.parse(localStorage.getItem(FINANCE_DB_KEY) || JSON.stringify({
    plans: [
      { id:'free', name:'Grátis', price:0, billing:'mensal', active:true, features:['5 projetos','IA básica','1 agente por vez','Suporte comunidade'], color:'#71717a', users:0 },
      { id:'pro', name:'Pro', price:29.90, billing:'mensal', active:true, features:['Projetos ilimitados','IA avançada','Todos os agentes','Editor com preview','Suporte prioritário','Exportar código'], color:'#6366f1', users:0, popular:true },
      { id:'team', name:'Team', price:79.90, billing:'mensal', active:true, features:['Tudo do Pro','5 membros','Projetos compartilhados','API access','Deploy automático','Suporte 24h'], color:'#10b981', users:0 },
      { id:'enterprise', name:'Enterprise', price:199.90, billing:'mensal', active:true, features:['Tudo do Team','Membros ilimitados','IA dedicada','SLA 99.9%','Gerente de conta','Custom branding'], color:'#f59e0b', users:0 }
    ],
    invoices: [],
    subscriptions: [],
    transactions: [],
    coupons: [],
    revenue: { total:0, month:0, pending:0, refunded:0 },
    settings: { currency:'BRL', taxRate:0, gateway:'pix' }
  }));
}
function saveFinanceDB(db) { localStorage.setItem(FINANCE_DB_KEY, JSON.stringify(db)); }

/* ═══ FUNÇÕES FINANCEIRAS ═══ */

function createInvoice(userId, planId, amount) {
  var db = getFinanceDB();
  var inv = {
    id: 'INV-' + Date.now().toString(36).toUpperCase(),
    userId: userId,
    planId: planId,
    amount: amount,
    status: 'pending', // pending, paid, overdue, cancelled, refunded
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    paidAt: null,
    method: null
  };
  db.invoices.push(inv);
  saveFinanceDB(db);
  return inv;
}

function payInvoice(invoiceId, method) {
  var db = getFinanceDB();
  var inv = db.invoices.find(function(i) { return i.id === invoiceId; });
  if (!inv) return false;
  inv.status = 'paid';
  inv.paidAt = new Date().toISOString();
  inv.method = method || 'pix';
  db.revenue.total += inv.amount;
  db.revenue.month += inv.amount;
  db.transactions.push({ id: 'TXN-' + Date.now().toString(36).toUpperCase(), invoiceId: inv.id, amount: inv.amount, type: 'payment', method: method || 'pix', date: new Date().toISOString() });
  saveFinanceDB(db);
  return true;
}

function cancelInvoice(invoiceId) {
  var db = getFinanceDB();
  var inv = db.invoices.find(function(i) { return i.id === invoiceId; });
  if (!inv) return false;
  inv.status = 'cancelled';
  saveFinanceDB(db);
  return true;
}

function refundInvoice(invoiceId) {
  var db = getFinanceDB();
  var inv = db.invoices.find(function(i) { return i.id === invoiceId; });
  if (!inv || inv.status !== 'paid') return false;
  inv.status = 'refunded';
  db.revenue.refunded += inv.amount;
  db.revenue.total -= inv.amount;
  db.transactions.push({ id: 'TXN-' + Date.now().toString(36).toUpperCase(), invoiceId: inv.id, amount: -inv.amount, type: 'refund', method: inv.method, date: new Date().toISOString() });
  saveFinanceDB(db);
  return true;
}

function updatePlanPrice(planId, newPrice) {
  var db = getFinanceDB();
  var plan = db.plans.find(function(p) { return p.id === planId; });
  if (!plan) return false;
  plan.price = newPrice;
  saveFinanceDB(db);
  return true;
}

function togglePlan(planId) {
  var db = getFinanceDB();
  var plan = db.plans.find(function(p) { return p.id === planId; });
  if (!plan) return false;
  plan.active = !plan.active;
  saveFinanceDB(db);
  return plan.active;
}

function createCoupon(code, discount, type) {
  var db = getFinanceDB();
  var coupon = {
    id: Date.now().toString(36),
    code: code.toUpperCase(),
    discount: discount,
    type: type || 'percent', // percent or fixed
    active: true,
    uses: 0,
    maxUses: 100,
    createdAt: new Date().toISOString()
  };
  db.coupons.push(coupon);
  saveFinanceDB(db);
  return coupon;
}

function createSubscription(userId, planId) {
  var db = getFinanceDB();
  var plan = db.plans.find(function(p) { return p.id === planId; });
  if (!plan) return null;
  var sub = {
    id: 'SUB-' + Date.now().toString(36).toUpperCase(),
    userId: userId,
    planId: planId,
    status: 'active', // active, paused, cancelled, expired
    startDate: new Date().toISOString(),
    nextBilling: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    amount: plan.price
  };
  db.subscriptions.push(sub);
  plan.users++;
  saveFinanceDB(db);
  return sub;
}

function cancelSubscription(subId) {
  var db = getFinanceDB();
  var sub = db.subscriptions.find(function(s) { return s.id === subId; });
  if (!sub) return false;
  sub.status = 'cancelled';
  var plan = db.plans.find(function(p) { return p.id === sub.planId; });
  if (plan && plan.users > 0) plan.users--;
  saveFinanceDB(db);
  return true;
}

function getFinanceReport() {
  var db = getFinanceDB();
  var totalSubs = db.subscriptions.filter(function(s) { return s.status === 'active'; }).length;
  var pendingInv = db.invoices.filter(function(i) { return i.status === 'pending'; });
  var paidInv = db.invoices.filter(function(i) { return i.status === 'paid'; });
  var mrr = db.subscriptions.filter(function(s) { return s.status === 'active'; }).reduce(function(t,s) { return t + s.amount; }, 0);
  return {
    totalRevenue: db.revenue.total,
    monthRevenue: db.revenue.month,
    mrr: mrr,
    activeSubs: totalSubs,
    pendingInvoices: pendingInv.length,
    pendingAmount: pendingInv.reduce(function(t,i) { return t + i.amount; }, 0),
    paidInvoices: paidInv.length,
    refunded: db.revenue.refunded,
    transactions: db.transactions.length,
    coupons: db.coupons.filter(function(c) { return c.active; }).length
  };
}

/* ═══ RENDER PAINEL ZEUS (FINANCEIRO) ═══ */
function renderFinancePanel() {
  var db = getFinanceDB();
  var report = getFinanceReport();
  var h = '';

  // Header Zeus
  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem;position:relative;overflow:hidden;">';
  h += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#10b981,#6366f1);"></div>';
  h += '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">';
  h += '<div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#f97316);display:flex;align-items:center;justify-content:center;font-size:1.8rem;box-shadow:0 0 20px rgba(245,158,11,0.3);">💰</div>';
  h += '<div style="flex:1;"><h3 style="font-size:1.1rem;color:#fbbf24;margin:0;">ZEUS — Controlador Financeiro</h3>';
  h += '<p style="font-size:0.75rem;color:var(--text-dim);margin:2px 0 0;">Cobranças • Planos • Faturas • Relatórios</p></div>';
  h += '</div></div>';

  // KPIs
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:1rem;">';
  var kpis = [
    { label:'Receita Total', value:'R$ '+report.totalRevenue.toFixed(2), icon:'💰', color:'#10b981' },
    { label:'MRR', value:'R$ '+report.mrr.toFixed(2), icon:'📈', color:'#6366f1' },
    { label:'Assinaturas', value:report.activeSubs, icon:'👥', color:'#0ea5e9' },
    { label:'Faturas Pendentes', value:report.pendingInvoices, icon:'📋', color:'#f59e0b' },
    { label:'Reembolsos', value:'R$ '+report.refunded.toFixed(2), icon:'↩️', color:'#ef4444' },
    { label:'Transações', value:report.transactions, icon:'🔄', color:'#8b5cf6' }
  ];
  kpis.forEach(function(k) {
    h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem;text-align:center;">';
    h += '<div style="font-size:1.3rem;">' + k.icon + '</div>';
    h += '<div style="font-size:1.1rem;font-weight:800;color:' + k.color + ';margin:4px 0;">' + k.value + '</div>';
    h += '<div style="font-size:0.65rem;color:var(--text-muted);">' + k.label + '</div></div>';
  });
  h += '</div>';

  // Planos
  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem;">';
  h += '<h4 style="font-size:0.95rem;margin-bottom:1rem;display:flex;align-items:center;gap:8px;">📦 Planos <button class="btn btn-sm btn-secondary" onclick="addNewPlan()" style="margin-left:auto;">+ Novo Plano</button></h4>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">';
  db.plans.forEach(function(p) {
    h += '<div style="border:1px solid ' + (p.active ? p.color + '40' : 'var(--border)') + ';border-radius:var(--radius-sm);padding:1rem;position:relative;opacity:' + (p.active ? '1' : '0.5') + ';">';
    if (p.popular) h += '<div style="position:absolute;top:-1px;right:12px;background:' + p.color + ';color:white;font-size:0.55rem;padding:2px 8px;border-radius:0 0 6px 6px;font-weight:700;">POPULAR</div>';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    h += '<span style="font-weight:700;color:' + p.color + ';">' + p.name + '</span>';
    h += '<label style="cursor:pointer;"><input type="checkbox" ' + (p.active ? 'checked' : '') + ' onchange="togglePlanUI(\'' + p.id + '\')" style="cursor:pointer;"> Ativo</label></div>';
    h += '<div style="font-size:1.5rem;font-weight:900;margin:8px 0;">R$ ' + p.price.toFixed(2) + '<span style="font-size:0.7rem;color:var(--text-dim);font-weight:400;">/' + p.billing + '</span></div>';
    h += '<div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:8px;">' + p.users + ' assinantes</div>';
    h += '<ul style="font-size:0.7rem;color:var(--text-dim);list-style:none;margin-bottom:10px;">';
    p.features.forEach(function(f) { h += '<li style="padding:2px 0;">✓ ' + f + '</li>'; });
    h += '</ul>';
    h += '<div style="display:flex;gap:6px;">';
    h += '<button class="btn btn-sm btn-secondary" onclick="editPlanPrice(\'' + p.id + '\')">💲 Preço</button>';
    h += '<button class="btn btn-sm btn-secondary" onclick="removePlan(\'' + p.id + '\')">🗑️</button></div>';
    h += '</div>';
  });
  h += '</div></div>';

  // Faturas recentes
  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem;">';
  h += '<h4 style="font-size:0.95rem;margin-bottom:1rem;">📋 Faturas Recentes</h4>';
  if (db.invoices.length === 0) {
    h += '<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.8rem;">Nenhuma fatura ainda</div>';
  } else {
    h += '<div style="overflow-x:auto;"><table style="width:100%;font-size:0.75rem;border-collapse:collapse;">';
    h += '<tr style="border-bottom:1px solid var(--border);"><th style="padding:8px;text-align:left;color:var(--text-muted);">ID</th><th>Plano</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr>';
    db.invoices.slice(-10).reverse().forEach(function(inv) {
      var colors = { pending:'#f59e0b', paid:'#10b981', overdue:'#ef4444', cancelled:'#71717a', refunded:'#8b5cf6' };
      h += '<tr style="border-bottom:1px solid var(--border);">';
      h += '<td style="padding:8px;font-family:monospace;">' + inv.id + '</td>';
      h += '<td style="padding:8px;">' + inv.planId + '</td>';
      h += '<td style="padding:8px;">R$ ' + inv.amount.toFixed(2) + '</td>';
      h += '<td style="padding:8px;"><span style="padding:2px 8px;border-radius:4px;background:' + (colors[inv.status]||'#666') + '20;color:' + (colors[inv.status]||'#666') + ';font-size:0.65rem;font-weight:600;">' + inv.status.toUpperCase() + '</span></td>';
      h += '<td style="padding:8px;">' + inv.createdAt.split('T')[0] + '</td>';
      h += '<td style="padding:8px;">';
      if (inv.status === 'pending') h += '<button class="btn btn-sm btn-primary" onclick="payInvoiceUI(\'' + inv.id + '\')" style="font-size:0.6rem;padding:3px 8px;">✅ Pagar</button> ';
      if (inv.status === 'pending') h += '<button class="btn btn-sm btn-secondary" onclick="cancelInvoiceUI(\'' + inv.id + '\')" style="font-size:0.6rem;padding:3px 8px;">❌</button>';
      if (inv.status === 'paid') h += '<button class="btn btn-sm btn-secondary" onclick="refundInvoiceUI(\'' + inv.id + '\')" style="font-size:0.6rem;padding:3px 8px;">↩️ Reembolso</button>';
      h += '</td></tr>';
    });
    h += '</table></div>';
  }
  h += '</div>';

  // Cupons
  h += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;">';
  h += '<h4 style="font-size:0.95rem;margin-bottom:1rem;display:flex;align-items:center;gap:8px;">🎫 Cupons <button class="btn btn-sm btn-secondary" onclick="createCouponUI()" style="margin-left:auto;">+ Criar Cupom</button></h4>';
  if (db.coupons.length === 0) {
    h += '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.8rem;">Nenhum cupom criado</div>';
  } else {
    db.coupons.forEach(function(c) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid var(--border);">';
      h += '<span style="font-family:monospace;font-weight:700;color:var(--primary-light);">' + c.code + '</span>';
      h += '<span style="font-size:0.75rem;color:var(--text-dim);">' + c.discount + (c.type === 'percent' ? '%' : ' R$') + ' off</span>';
      h += '<span style="font-size:0.7rem;color:var(--text-muted);">' + c.uses + '/' + c.maxUses + ' usos</span>';
      h += '<span style="font-size:0.65rem;padding:2px 6px;border-radius:4px;background:' + (c.active ? 'rgba(16,185,129,0.15);color:#10b981' : 'rgba(239,68,68,0.15);color:#ef4444') + ';">' + (c.active ? 'Ativo' : 'Inativo') + '</span>';
      h += '</div>';
    });
  }
  h += '</div>';

  return h;
}

/* ═══ UI ACTIONS ═══ */
function togglePlanUI(id) { togglePlan(id); renderApp(); showToast('Plano atualizado!','success'); }
function editPlanPrice(id) {
  var newPrice = prompt('Novo preço (R$):');
  if (newPrice === null) return;
  var p = parseFloat(newPrice);
  if (isNaN(p) || p < 0) { showToast('Preço inválido!','error'); return; }
  updatePlanPrice(id, p);
  renderApp();
  showToast('✅ Preço atualizado!','success');
}
function removePlan(id) {
  if (!confirm('Remover este plano?')) return;
  var db = getFinanceDB();
  db.plans = db.plans.filter(function(p) { return p.id !== id; });
  saveFinanceDB(db);
  renderApp();
  showToast('Plano removido!','info');
}
function addNewPlan() {
  var name = prompt('Nome do novo plano:');
  if (!name) return;
  var price = parseFloat(prompt('Preço mensal (R$):') || '0');
  var db = getFinanceDB();
  db.plans.push({ id: name.toLowerCase().replace(/\s/g,'-'), name: name, price: price, billing:'mensal', active:true, features:['Personalizar features'], color:'#6366f1', users:0 });
  saveFinanceDB(db);
  renderApp();
  showToast('✅ Plano criado!','success');
}
function payInvoiceUI(id) { payInvoice(id,'pix'); renderApp(); showToast('✅ Fatura paga!','success'); }
function cancelInvoiceUI(id) { cancelInvoice(id); renderApp(); showToast('Fatura cancelada.','info'); }
function refundInvoiceUI(id) { if(confirm('Confirmar reembolso?')){ refundInvoice(id); renderApp(); showToast('↩️ Reembolsado!','info'); } }
function createCouponUI() {
  var code = prompt('Código do cupom (ex: PROMO50):');
  if (!code) return;
  var disc = parseFloat(prompt('Desconto (número):') || '10');
  var type = prompt('Tipo: "percent" ou "fixed"?') || 'percent';
  createCoupon(code, disc, type);
  renderApp();
  showToast('🎫 Cupom criado!','success');
}
