

'use strict';

const State = {
  currentScreen: 'dashboard',
  histMonth: new Date().getMonth(),
  histYear:  new Date().getFullYear(),
  txType:    'saida',
  txPayment: 'pix',
  editingTxId:   null, // null = novo lançamento
  editingGoalId: null, // null = nova meta
};

const NOW = new Date();
const THIS_MONTH = NOW.getMonth();
const THIS_YEAR  = NOW.getFullYear();

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const GOAL_EMOJIS = ['🏡','✈️','🚗','💻','🎓','💎','🏖️','🎯','📱','🛋️'];

const DEFAULT_CATEGORIES = [
  { id: 'alimentacao',  name: 'Alimentação',    emoji: '🍔', color: '#f59e0b' },
  { id: 'transporte',   name: 'Transporte',     emoji: '🚗', color: '#3b82f6' },
  { id: 'moradia',      name: 'Moradia',        emoji: '🏠', color: '#8b5cf6' },
  { id: 'lazer',        name: 'Lazer',          emoji: '🎮', color: '#ec4899' },
  { id: 'saude',        name: 'Saúde',          emoji: '💊', color: '#10b981' },
  { id: 'educacao',     name: 'Educação',       emoji: '📚', color: '#06b6d4' },
  { id: 'contas',       name: 'Contas',         emoji: '⚡', color: '#6366f1' },
  { id: 'investimento', name: 'Investimento',   emoji: '📈', color: '#16a34a' },
  { id: 'salario',      name: 'Salário',        emoji: '💰', color: '#16a34a' },
  { id: 'outros',       name: 'Outros',         emoji: '📦', color: '#9ca3af' },
];

const DEFAULT_DISTRIBUTION = [
  { id: 'essenciais',  name: 'Essenciais',    color: '#3b82f6', pct: 50 },
  { id: 'reserva',     name: 'Reserva',       color: '#16a34a', pct: 20 },
  { id: 'metas',       name: 'Metas',         color: '#8b5cf6', pct: 15 },
  { id: 'lazer',       name: 'Lazer',         color: '#ec4899', pct: 10 },
  { id: 'crescimento', name: 'Crescimento',   color: '#f59e0b', pct: 5  },
];

function makeDate(y, m, d) {
  return new Date(y, m, d).toISOString().slice(0, 10);
}

const DEFAULT_TRANSACTIONS = [];

const DEFAULT_GOALS = [];

const LEGACY_DEMO_TRANSACTIONS = (function() {
  const y = THIS_YEAR, m = THIS_MONTH, pm = THIS_MONTH - 1;
  return [
    { id:1,  type:'entrada', desc:'Salário',              value:8500, date:makeDate(y,m,5),  cat:'salario',      pay:'pix',     obs:'',          recurrent:true  },
    { id:2,  type:'entrada', desc:'Freela Design',        value:1200, date:makeDate(y,m,12), cat:'outros',       pay:'pix',     obs:'Landing page', recurrent:false },
    { id:3,  type:'saida',   desc:'Aluguel',              value:2200, date:makeDate(y,m,5),  cat:'moradia',      pay:'debito',  obs:'',          recurrent:true  },
    { id:4,  type:'saida',   desc:'Supermercado',         value:580,  date:makeDate(y,m,8),  cat:'alimentacao',  pay:'debito',  obs:'',          recurrent:false },
    { id:5,  type:'saida',   desc:'Uber',                 value:85,   date:makeDate(y,m,10), cat:'transporte',   pay:'credito', obs:'',          recurrent:false },
    { id:6,  type:'saida',   desc:'Conta de luz',         value:210,  date:makeDate(y,m,7),  cat:'contas',       pay:'pix',     obs:'',          recurrent:true  },
    { id:7,  type:'saida',   desc:'Academia',             value:120,  date:makeDate(y,m,1),  cat:'saude',        pay:'debito',  obs:'',          recurrent:true  },
    { id:8,  type:'saida',   desc:'Netflix + Spotify',    value:75,   date:makeDate(y,m,3),  cat:'lazer',        pay:'credito', obs:'',          recurrent:true  },
    { id:9,  type:'saida',   desc:'Restaurante',          value:160,  date:makeDate(y,m,14), cat:'alimentacao',  pay:'credito', obs:'Jantar',    recurrent:false },
    { id:10, type:'saida',   desc:'Curso Online',         value:250,  date:makeDate(y,m,11), cat:'educacao',     pay:'credito', obs:'',          recurrent:false },
    { id:11, type:'saida',   desc:'Internet',             value:100,  date:makeDate(y,m,6),  cat:'contas',       pay:'pix',     obs:'',          recurrent:true  },
    { id:12, type:'saida',   desc:'Farmácia',             value:90,   date:makeDate(y,m,9),  cat:'saude',        pay:'pix',     obs:'',          recurrent:false },
    { id:13, type:'entrada', desc:'Salário',              value:8500, date:makeDate(y,pm,5), cat:'salario',      pay:'pix',     obs:'',          recurrent:true  },
    { id:14, type:'saida',   desc:'Aluguel',              value:2200, date:makeDate(y,pm,5), cat:'moradia',      pay:'debito',  obs:'',          recurrent:true  },
    { id:15, type:'saida',   desc:'Supermercado',         value:620,  date:makeDate(y,pm,10),cat:'alimentacao',  pay:'debito',  obs:'',          recurrent:false },
    { id:16, type:'saida',   desc:'Viagem de fim de semana', value:900, date:makeDate(y,pm,20), cat:'lazer',     pay:'credito', obs:'',          recurrent:false },
    { id:17, type:'saida',   desc:'Conta de luz',         value:195,  date:makeDate(y,pm,7), cat:'contas',       pay:'pix',     obs:'',          recurrent:true  },
    { id:18, type:'saida',   desc:'Academia',             value:120,  date:makeDate(y,pm,1), cat:'saude',        pay:'debito',  obs:'',          recurrent:true  },
  ];
})();

const LEGACY_DEMO_GOALS = [
  { id:1, name:'Apartamento próprio', emoji:'🏡', target:60000, saved:18500, months:36, monthly:1200, createdAt:makeDate(THIS_YEAR-1,3,1) },
  { id:2, name:'Viagem para o Japão', emoji:'✈️', target:15000, saved:4800,  months:18, monthly:600,  createdAt:makeDate(THIS_YEAR,0,1) },
];

const Storage = {
  KEYS: { txs:'bolsy_txs', goals:'bolsy_goals', cats:'bolsy_cats', dist:'bolsy_dist', user:'bolsy_user', nextId:'bolsy_nextid', migrations:'bolsy_migrations' },

  save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { console.warn('Storage error', e); }
  },
  load(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
  },

  get transactions() { return this.load(this.KEYS.txs, DEFAULT_TRANSACTIONS); },
  set transactions(v) { this.save(this.KEYS.txs, v); },

  get goals() { return this.load(this.KEYS.goals, DEFAULT_GOALS); },
  set goals(v) { this.save(this.KEYS.goals, v); },

  get categories() { return this.load(this.KEYS.cats, DEFAULT_CATEGORIES); },
  set categories(v) { this.save(this.KEYS.cats, v); },

  get distribution() { return this.load(this.KEYS.dist, DEFAULT_DISTRIBUTION); },
  set distribution(v) { this.save(this.KEYS.dist, v); },

  get user()  { return this.load(this.KEYS.user, { name: '' }); },
  set user(v) { this.save(this.KEYS.user, v); },

  get nextId()  { return this.load(this.KEYS.nextId, 100); },
  set nextId(v) { this.save(this.KEYS.nextId, v); },

  genId() {
    const id = this.nextId;
    this.nextId = id + 1;
    return id;
  },

  exportAll() {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions: this.transactions,
      goals: this.goals,
      categories: this.categories,
      distribution: this.distribution,
      user: this.user,
    };
  },

  importAll(data) {
    if (data.transactions)  this.transactions  = data.transactions;
    if (data.goals)         this.goals         = data.goals;
    if (data.categories)    this.categories    = data.categories;
    if (data.distribution)  this.distribution  = data.distribution;
    if (data.user)          this.user          = data.user;
  },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },
};


function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function runMigrations() {
  const migrations = Storage.load(Storage.KEYS.migrations, {});

  if (!migrations.v210_remove_demo_data) {
    const currentTxs = Storage.load(Storage.KEYS.txs, null);
    const currentGoals = Storage.load(Storage.KEYS.goals, null);

    if (currentTxs && currentTxs.length && arraysEqual(currentTxs, LEGACY_DEMO_TRANSACTIONS)) {
      Storage.transactions = [];
    }

    if (currentGoals && currentGoals.length && arraysEqual(currentGoals, LEGACY_DEMO_GOALS)) {
      Storage.goals = [];
    }

    Storage.save(Storage.KEYS.migrations, { ...migrations, v210_remove_demo_data: true });
  }
}

const Utils = {
  /** Format number as BRL currency string: R$ 1.234,56 */
  fmt(val) {
    return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(val || 0);
  },

  fmtShort(val) {
    if (Math.abs(val) >= 1000) return 'R$ ' + (val / 1000).toFixed(1).replace('.', ',') + 'k';
    return this.fmt(val);
  },

  applyMoneyMask(input) {
    let raw = input.value.replace(/\D/g, ''); // only digits
    if (!raw) { input.value = ''; return; }
    // Remove leading zeros
    raw = raw.replace(/^0+/, '') || '0';
    // Pad to at least 3 digits so we always have centavos
    while (raw.length < 3) raw = '0' + raw;
    const cents = raw.slice(-2);
    const reais = raw.slice(0, -2);
    // Format reais with thousands separator
    const reaisFormatted = parseInt(reais, 10).toLocaleString('pt-BR');
    input.value = reaisFormatted + ',' + cents;
  },

  /** Parse a masked money string back to float */
  parseMoney(str) {
    if (!str) return 0;
    // Remove dots (thousands sep) and replace comma with dot
    const clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  },

  getCat(id, cats) {
    return cats.find(c => c.id === id) || cats[cats.length - 1];
  },

  getMonthTxs(txs, month, year) {
    return txs.filter(tx => {
      const d = new Date(tx.date + 'T12:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    });
  },

  sumIncome(txs) { return txs.filter(t => t.type === 'entrada').reduce((s,t) => s+t.value, 0); },
  sumExpense(txs) { return txs.filter(t => t.type === 'saida').reduce((s,t) => s+t.value, 0); },

  today() { return new Date().toISOString().slice(0, 10); },

  initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
      : name.slice(0,2).toUpperCase();
  },
};

const Calc = {
  monthSummary(month, year) {
    const txs     = Utils.getMonthTxs(Storage.transactions, month, year);
    const income  = Utils.sumIncome(txs);
    const expense = Utils.sumExpense(txs);
    const balance = income - expense;
    const dist    = Storage.distribution;
    const metasPct = dist.find(d => d.id === 'metas')?.pct ?? 15;
    const paraMetas = income * (metasPct / 100);
    // "Comprometido" = recurring expenses (moradia, contas, saude…)
    const recurringSaidas = txs.filter(t => t.type === 'saida' && t.recurrent).reduce((s,t) => s+t.value, 0);
    const comprometido = recurringSaidas;
    const livre = Math.max(0, balance - comprometido);
    return { txs, income, expense, balance, paraMetas, comprometido, livre };
  },

  goalStatus(goal) {
    const start = new Date(goal.createdAt);
    const now   = new Date();
    const monthsElapsed = (now.getFullYear()-start.getFullYear())*12 + (now.getMonth()-start.getMonth());
    const expectedSaved = monthsElapsed * goal.monthly;
    const expectedPct   = (expectedSaved / goal.target) * 100;
    const actualPct     = (goal.saved / goal.target) * 100;
    let status = 'on-track', statusLabel = 'No ritmo';
    if (actualPct > expectedPct + 5)  { status = 'ahead';  statusLabel = 'Adiantada'; }
    if (actualPct < expectedPct - 10) { status = 'behind'; statusLabel = 'Atrasada';  }
    return { status, statusLabel, actualPct, expectedPct };
  },

  goalForecast(goal) {
    const remaining    = Math.max(0, goal.target - goal.saved);
    const monthsNeeded = goal.monthly > 0 ? Math.ceil(remaining / goal.monthly) : 999;
    const doneDate     = new Date(NOW.getFullYear(), NOW.getMonth() + monthsNeeded, 1);
    const doneDateStr  = doneDate.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });
    return { remaining, monthsNeeded, doneDateStr };
  },
};

const Render = {

  /*  DASHBOARD  */
  dashboard() {
    const { txs, income, expense, balance, paraMetas, comprometido, livre } = Calc.monthSummary(THIS_MONTH, THIS_YEAR);

    // Header
    const user = Storage.user;
    const name = user.name || '';
    const greeting = name ? `Olá, ${name.split(' ')[0]} 👋` : 'Olá 👋';
    document.getElementById('greeting-name').textContent = greeting;
    const opts = { weekday:'long', day:'numeric', month:'long' };
    document.getElementById('current-date').textContent = NOW.toLocaleDateString('pt-BR', opts);

    // Avatar
    const avatarEl = document.getElementById('header-avatar-btn');
    avatarEl.textContent = Utils.initials(name);

    // Hero
    document.getElementById('dash-saldo').textContent       = Utils.fmt(balance);
    document.getElementById('dash-entradas').textContent    = Utils.fmtShort(income);
    document.getElementById('dash-saidas').textContent      = Utils.fmtShort(expense);
    document.getElementById('dash-livre').textContent       = Utils.fmtShort(livre);
    document.getElementById('dash-comprometido').textContent= Utils.fmtShort(comprometido);
    document.getElementById('dash-metas-valor').textContent = Utils.fmtShort(paraMetas);

    this.mainGoal();
    this.categoryChart(txs);
    this.alerts(income, expense, balance);
  },

  mainGoal() {
    const el    = document.getElementById('dash-main-goal');
    const goals = Storage.goals;
    if (!goals.length) {
      el.innerHTML = `<div class="goal-card"><div class="empty-state"><div class="empty-state-icon">🎯</div><p>Nenhuma meta ainda.<br>Adicione uma na aba Metas!</p></div></div>`;
      return;
    }
    el.innerHTML = `<div class="goal-card">${this._goalCardContent(goals[0])}</div>`;
  },

  _goalCardContent(g) {
    const { status, statusLabel, actualPct } = Calc.goalStatus(g);
    const { remaining, monthsNeeded, doneDateStr } = Calc.goalForecast(g);
    const pct = Math.min(100, actualPct);
    const statusCssClass = status === 'ahead' ? 'status-ahead' : status === 'behind' ? 'status-behind' : 'status-on-track';

    return `
      <div class="goal-card-header">
        <div class="goal-card-emoji">${g.emoji}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="goal-status ${statusCssClass}">${statusLabel}</span>
          <div class="goal-card-actions">
            <button class="goal-action-btn" onclick="editGoal(${g.id})" title="Editar">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5-8 8L3 14l.5-2.5 8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="goal-action-btn delete" onclick="deleteGoal(${g.id})" title="Apagar">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="goal-card-name">${g.name}</div>
      <div class="goal-card-sub">${Utils.fmt(g.saved)} guardados de ${Utils.fmt(g.target)}</div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill ${status}" style="width:${pct}%"></div>
      </div>
      <div class="progress-labels">
        <span>${pct.toFixed(1)}% concluído</span>
        <span>Falta <strong class="progress-amount">${Utils.fmt(remaining)}</strong></span>
      </div>
      <div class="goal-meta-row">
        <div class="goal-meta-item">
          <div class="goal-meta-label">Por mês</div>
          <div class="goal-meta-value" style="color:var(--green)">${Utils.fmt(g.monthly)}</div>
        </div>
        <div class="goal-meta-item">
          <div class="goal-meta-label">Previsão</div>
          <div class="goal-meta-value" style="font-size:11px">${doneDateStr}</div>
        </div>
        <div class="goal-meta-item">
          <div class="goal-meta-label">Faltam</div>
          <div class="goal-meta-value">${monthsNeeded > 500 ? '—' : monthsNeeded + ' meses'}</div>
        </div>
      </div>
    `;
  },

  categoryChart(txs) {
    const el     = document.getElementById('dash-categories');
    const cats   = Storage.categories;
    const saidas = txs.filter(t => t.type === 'saida');
    const total  = Utils.sumExpense(saidas.length ? saidas : []);
    if (!total) { el.innerHTML = '<p style="color:var(--text-ter);font-size:13px;padding:4px 0">Nenhum gasto este mês.</p>'; return; }

    const bycat = {};
    saidas.forEach(t => { bycat[t.cat] = (bycat[t.cat]||0) + t.value; });
    const sorted = Object.entries(bycat).sort((a,b) => b[1]-a[1]).slice(0,6);

    el.innerHTML = sorted.map(([catId, val]) => {
      const cat = Utils.getCat(catId, cats);
      const pct = (val / total) * 100;
      return `
        <div class="category-row">
          <div class="cat-emoji">${cat.emoji}</div>
          <div class="cat-details">
            <div class="cat-name-row">
              <span class="cat-name">${cat.name}</span>
              <span class="cat-value">${Utils.fmt(val)}</span>
            </div>
            <div class="cat-bar-track">
              <div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  alerts(income, expense, balance) {
    const section   = document.getElementById('dash-alerts-section');
    const container = document.getElementById('dash-alerts');
    const alerts    = [];
    const spendPct  = income > 0 ? (expense / income) * 100 : 0;

    if (balance < 0)
      alerts.push({ icon:'🔴', text:`<strong>Saldo negativo!</strong> As saídas superaram as entradas este mês.` });
    else if (spendPct > 85)
      alerts.push({ icon:'⚠️', text:`Você gastou <strong>${spendPct.toFixed(0)}%</strong> da renda este mês. Atenção!` });
    else if (spendPct > 70)
      alerts.push({ icon:'💡', text:`Você já usou <strong>${spendPct.toFixed(0)}%</strong> da renda. Monitore os gastos.` });

    const goals = Storage.goals;
    if (goals.length) {
      const g   = goals[0];
      const { status } = Calc.goalStatus(g);
      if (status === 'behind')
        alerts.push({ icon:'📉', text:`Meta <strong>${g.name}</strong> está atrasada. Considere aumentar o aporte.` });
    }

    if (!alerts.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    container.innerHTML = alerts.map(a =>
      `<div class="alert-item"><span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span></div>`
    ).join('');
  },

  /*  HISTÓRICO  */
  historico() {
    const m = State.histMonth, y = State.histYear;
    document.getElementById('hist-month-label').textContent = MONTHS_PT[m] + ' ' + y;

    const txs     = Utils.getMonthTxs(Storage.transactions, m, y);
    const income  = Utils.sumIncome(txs);
    const expense = Utils.sumExpense(txs);
    const balance = income - expense;

    document.getElementById('hist-total-in').textContent  = Utils.fmt(income);
    document.getElementById('hist-total-out').textContent = Utils.fmt(expense);
    const balEl = document.getElementById('hist-balance');
    balEl.textContent = Utils.fmt(balance);
    balEl.style.color = balance >= 0 ? 'var(--green)' : 'var(--red)';

    const listEl = document.getElementById('hist-list');
    if (!txs.length) {
      listEl.innerHTML = '<div class="hist-empty">Nenhum lançamento neste mês.</div>';
      return;
    }

    const cats   = Storage.categories;
    const groups = {};
    [...txs].sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });

    listEl.innerHTML = Object.entries(groups).map(([date, items]) => {
      const dt    = new Date(date + 'T12:00:00');
      const label = dt.toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' });
      return `
        <div class="tx-date-group">
          <div class="tx-date-label">${label}</div>
          ${items.map(tx => {
            const cat      = Utils.getCat(tx.cat, cats);
            const isIncome = tx.type === 'entrada';
            return `
              <div class="tx-item">
                <div class="tx-icon">${cat.emoji}</div>
                <div class="tx-info">
                  <div class="tx-desc">${tx.desc}${tx.recurrent ? ' <span style="font-size:10px;opacity:.6">↺</span>' : ''}</div>
                  <div class="tx-cat">${cat.name}${tx.pay ? ' · ' + tx.pay : ''}${tx.obs ? ' · ' + tx.obs : ''}</div>
                </div>
                <div class="tx-right">
                  <span class="tx-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : '-'}${Utils.fmt(tx.value)}</span>
                  <div class="tx-actions">
                    <button class="tx-btn" onclick="editTransaction(${tx.id})" title="Editar">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5-8 8L3 14l.5-2.5 8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="tx-btn del" onclick="deleteTransaction(${tx.id})" title="Apagar">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');
  },

  /*  METAS  */
  metas() {
    const el    = document.getElementById('goals-list');
    const goals = Storage.goals;
    if (!goals.length) {
      el.innerHTML = `
        <div class="empty-state" style="padding-top:32px">
          <div class="empty-state-icon">🎯</div>
          <p>Nenhuma meta ainda.<br>Crie sua primeira meta financeira.</p>
        </div>
        <button class="btn-primary btn-full" style="margin-top:16px" onclick="showGoalModal()">Criar primeira meta</button>`;
      return;
    }
    el.innerHTML = goals.map(g => `
      <div class="goal-list-card">
        ${this._goalCardContent(g)}
      </div>`
    ).join('');
  },

  /*  CONFIGURAÇÕES  */
  configs() {
    const user = Storage.user;
    const name = user.name || '';
    document.getElementById('config-name').textContent     = name || 'Seu nome';
    document.getElementById('config-avatar').textContent   = Utils.initials(name);
    document.getElementById('config-name-input').value     = name;

    // Distribution
    const dist  = Storage.distribution;
    const { income } = Calc.monthSummary(THIS_MONTH, THIS_YEAR);
    const distEl = document.getElementById('distribution-card');

    const rows = dist.map(d => {
      const val = income * (d.pct / 100);
      return `
        <div class="dist-row">
          <div class="dist-color" style="background:${d.color}"></div>
          <div class="dist-name">${d.name}</div>
          <div class="dist-pct">${d.pct}%</div>
          <div class="dist-val">${Utils.fmt(val)}</div>
        </div>`;
    }).join('');

    const bar = dist.map(d =>
      `<div class="dist-bar-segment" style="width:${d.pct}%;background:${d.color}"></div>`
    ).join('');

    distEl.innerHTML = rows + `<div class="dist-bar-track">${bar}</div>`;

    // Categories grid
    const cats = Storage.categories;
    document.getElementById('categories-grid').innerHTML = cats.map(c => `
      <div class="cat-chip">
        <div class="cat-chip-emoji">${c.emoji}</div>
        <div class="cat-chip-name">${c.name}</div>
      </div>`
    ).join('');
  },
};

function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el  = document.getElementById('screen-' + screen);
  const nav = document.getElementById('nav-' + screen);
  if (el)  el.classList.add('active');
  if (nav) nav.classList.add('active');

  State.currentScreen = screen;

  switch(screen) {
    case 'dashboard':     Render.dashboard(); break;
    case 'historico':     Render.historico(); break;
    case 'novo':          initNovoForm(null); break;
    case 'metas':         Render.metas();     break;
    case 'configuracoes': Render.configs();   break;
  }
}

function changeHistMonth(dir) {
  State.histMonth += dir;
  if (State.histMonth < 0)  { State.histMonth = 11; State.histYear--; }
  if (State.histMonth > 11) { State.histMonth = 0;  State.histYear++; }
  Render.historico();
}

function initNovoForm(txId) {
  const cats = Storage.categories;

  // Populate category select
  const sel = document.getElementById('input-categoria');
  sel.innerHTML = cats.map(c =>
    `<option value="${c.id}">${c.emoji} ${c.name}</option>`
  ).join('');

  State.editingTxId = txId;

  if (txId !== null) {
    // Editing existing
    const tx = Storage.transactions.find(t => t.id === txId);
    if (!tx) return;
    document.getElementById('novo-screen-title').textContent = 'Editar lançamento';
    document.getElementById('btn-save-tx').textContent = 'Atualizar lançamento';
    document.getElementById('input-editing-id').value = txId;
    setTransactionType(tx.type);
    document.getElementById('input-valor').value = tx.value.toFixed(2).replace('.', ',');
    document.getElementById('input-descricao').value = tx.desc;
    document.getElementById('input-data').value = tx.date;
    sel.value = tx.cat;
    document.getElementById('input-obs').value = tx.obs || '';
    document.getElementById('input-recorrente').checked = !!tx.recurrent;
    // Set payment chip
    document.querySelectorAll('#payment-chips .chip').forEach(c => c.classList.remove('active'));
    const payChip = document.querySelector(`#payment-chips .chip[onclick*="${tx.pay}"]`);
    if (payChip) payChip.classList.add('active');
    State.txPayment = tx.pay;
  } else {
    // New
    document.getElementById('novo-screen-title').textContent = 'Novo lançamento';
    document.getElementById('btn-save-tx').textContent = 'Salvar lançamento';
    document.getElementById('input-editing-id').value = '';
    setTransactionType('saida');
    document.getElementById('input-valor').value = '';
    document.getElementById('input-descricao').value = '';
    document.getElementById('input-data').value = Utils.today();
    document.getElementById('input-obs').value = '';
    document.getElementById('input-recorrente').checked = false;
    document.querySelectorAll('#payment-chips .chip').forEach(c => c.classList.remove('active'));
    document.querySelector('#payment-chips .chip').classList.add('active');
    State.txPayment = 'pix';
  }
}

function setTransactionType(type) {
  State.txType = type;
  const btnSaida   = document.getElementById('btn-saida');
  const btnEntrada = document.getElementById('btn-entrada');
  btnSaida.className   = 'type-btn' + (type === 'saida'   ? ' active-saida'   : '');
  btnEntrada.className = 'type-btn' + (type === 'entrada' ? ' active-entrada' : '');
}

function selectPayment(el, method) {
  document.querySelectorAll('#payment-chips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  State.txPayment = method;
}

function cancelForm() {
  navigate(State.currentScreen === 'novo' ? 'historico' : 'dashboard');
}

function saveTransaction() {
  const valorStr = document.getElementById('input-valor').value;
  const valor    = Utils.parseMoney(valorStr);
  const desc     = document.getElementById('input-descricao').value.trim();
  const data     = document.getElementById('input-data').value;
  const cat      = document.getElementById('input-categoria').value;
  const obs      = document.getElementById('input-obs').value.trim();
  const rec      = document.getElementById('input-recorrente').checked;

  if (!valor || valor <= 0)  { showToast('⚠️ Informe um valor válido'); return; }
  if (!desc)                  { showToast('⚠️ Informe uma descrição');   return; }
  if (!data)                  { showToast('⚠️ Informe a data');          return; }

  let txs = Storage.transactions;

  if (State.editingTxId !== null) {
    // Update existing
    txs = txs.map(t => t.id === State.editingTxId
      ? { ...t, type: State.txType, desc, value: valor, date: data, cat, pay: State.txPayment, obs, recurrent: rec }
      : t
    );
    Storage.transactions = txs;
    showToast('✅ Lançamento atualizado!');
  } else {
    // New
    const newTx = { id: Storage.genId(), type: State.txType, desc, value: valor, date: data, cat, pay: State.txPayment, obs, recurrent: rec };
    txs.push(newTx);
    Storage.transactions = txs;
    showToast('💸 Lançamento salvo!');
  }

  navigate('historico');
}

function editTransaction(id) {
  State.editingTxId = id;
  // Navigate to novo screen and load data
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-novo').classList.add('active');
  State.currentScreen = 'novo';
  initNovoForm(id);
}

function deleteTransaction(id) {
  showConfirm(
    '🗑️',
    'Apagar lançamento',
    'Este lançamento será removido permanentemente.',
    () => {
      Storage.transactions = Storage.transactions.filter(t => t.id !== id);
      Render.historico();
      Render.dashboard();
      showToast('🗑️ Lançamento removido');
    }
  );
}

function showGoalModal(goalId = null) {
  State.editingGoalId = goalId;
  const titleEl  = document.getElementById('modal-goal-title');
  const btnLabel = document.getElementById('btn-save-goal');

  if (goalId !== null) {
    const g = Storage.goals.find(g => g.id === goalId);
    if (!g) return;
    titleEl.textContent  = 'Editar meta';
    btnLabel.textContent = 'Atualizar meta';
    document.getElementById('goal-editing-id').value = goalId;
    document.getElementById('goal-name').value    = g.name;
    document.getElementById('goal-target').value  = g.target.toFixed(2).replace('.', ',');
    document.getElementById('goal-saved').value   = g.saved.toFixed(2).replace('.', ',');
    document.getElementById('goal-months').value  = g.months;
    document.getElementById('goal-monthly').value = g.monthly.toFixed(2).replace('.', ',');
  } else {
    titleEl.textContent  = 'Nova meta';
    btnLabel.textContent = 'Criar meta';
    document.getElementById('goal-editing-id').value = '';
    ['goal-name','goal-target','goal-saved','goal-months','goal-monthly'].forEach(id => {
      document.getElementById(id).value = '';
    });
  }

  document.getElementById('modal-goal').classList.add('open');
  setTimeout(() => document.getElementById('goal-name').focus(), 300);
}

function saveGoal() {
  const name    = document.getElementById('goal-name').value.trim();
  const target  = Utils.parseMoney(document.getElementById('goal-target').value);
  const saved   = Utils.parseMoney(document.getElementById('goal-saved').value);
  const months  = parseInt(document.getElementById('goal-months').value) || 12;
  const monthly = Utils.parseMoney(document.getElementById('goal-monthly').value);

  if (!name)        { showToast('⚠️ Informe o nome da meta'); return; }
  if (target <= 0)  { showToast('⚠️ Informe o valor alvo');   return; }

  const calcMonthly = monthly > 0 ? monthly : Math.ceil(Math.max(0, target - saved) / months);
  let goals = Storage.goals;

  if (State.editingGoalId !== null) {
    goals = goals.map(g => g.id === State.editingGoalId
      ? { ...g, name, target, saved: saved||0, months, monthly: calcMonthly }
      : g
    );
    Storage.goals = goals;
    showToast('✅ Meta atualizada!');
  } else {
    const emoji = GOAL_EMOJIS[goals.length % GOAL_EMOJIS.length];
    goals.push({ id: Storage.genId(), name, emoji, target, saved: saved||0, months, monthly: calcMonthly, createdAt: Utils.today() });
    Storage.goals = goals;
    showToast('🎯 Meta criada!');
  }

  closeModal('modal-goal');
  Render.metas();
}

function editGoal(id) { showGoalModal(id); }

function deleteGoal(id) {
  const g = Storage.goals.find(g => g.id === id);
  showConfirm(
    '🎯',
    'Apagar meta',
    `A meta "${g?.name || ''}" será removida permanentemente.`,
    () => {
      Storage.goals = Storage.goals.filter(g => g.id !== id);
      Render.metas();
      Render.dashboard();
      showToast('🗑️ Meta removida');
    }
  );
}

function saveName() {
  const name = document.getElementById('config-name-input').value.trim();
  if (!name) { showToast('⚠️ Informe seu nome'); return; }
  Storage.user = { ...Storage.user, name };
  Render.configs();
  showToast('✅ Nome salvo!');
}

function exportData() {
  const data = Storage.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bolsy-backup-${Utils.today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Backup exportado!');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Storage.importAll(data);
      const maxTxId = Math.max(0, ...Storage.transactions.map(t => Number(t.id) || 0));
      const maxGoalId = Math.max(0, ...Storage.goals.map(g => Number(g.id) || 0));
      Storage.nextId = Math.max(100, maxTxId, maxGoalId) + 1;
      showToast('📥 Backup importado!');
      Render.configs();
      Render.dashboard();
    } catch(err) {
      showToast('❌ Arquivo inválido');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function confirmClearData() {
  showConfirm(
    '🗑️',
    'Apagar todos os dados',
    'Todos os lançamentos, metas e configurações serão removidos. Esta ação não pode ser desfeita.',
    () => {
      Storage.clearAll();
      State.editingTxId = null;
      State.editingGoalId = null;
      showToast('🗑️ Dados apagados');
      Render.dashboard();
      Render.metas();
      Render.configs();
    }
  );
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOnBackdrop(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

function showConfirm(icon, title, text, onOk) {
  document.getElementById('confirm-icon').textContent  = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-text').textContent  = text;
  const btn = document.getElementById('confirm-ok');
  // Remove old listeners by cloning
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  document.getElementById('confirm-ok').addEventListener('click', () => {
    closeModal('modal-confirm');
    onOk();
  });
  document.getElementById('modal-confirm').classList.add('open');
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}


function setupMoneyMask() {
  const amountInput = document.getElementById('input-valor');
  amountInput.addEventListener('input', () => Utils.applyMoneyMask(amountInput));

  document.querySelectorAll('.money-input').forEach(input => {
    input.addEventListener('input', () => Utils.applyMoneyMask(input));
  });
}

function init() {
  runMigrations();

  State.histMonth = THIS_MONTH;
  State.histYear  = THIS_YEAR;

  // Render first screen
  Render.dashboard();

  // Setup masks
  setupMoneyMask();

  // Prevent pull-to-refresh
  document.body.addEventListener('touchmove', e => {
    if (e.target.closest('.screen-scroll') || e.target.closest('.modal-sheet')) return;
    e.preventDefault();
  }, { passive: false });

  // Close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['modal-goal','modal-confirm'].forEach(closeModal);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
