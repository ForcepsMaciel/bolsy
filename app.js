'use strict';

// ─── STATE ────────────────────────────────────────────────────────────────────

const State = {
  currentScreen:      'dashboard',
  histMonth:          new Date().getMonth(),
  histYear:           new Date().getFullYear(),
  txType:             'saida',
  txPayment:          'pix',
  editingTxId:        null,
  editingGoalId:      null,
  editingFutureId:    null,
  futureItemType:     'receita',
};

const NOW        = new Date();
const THIS_MONTH = NOW.getMonth();
const THIS_YEAR  = NOW.getFullYear();

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const GOAL_EMOJIS = ['🏡','✈️','🚗','💻','🎓','💎','🏖️','🎯','📱','🛋️'];

const DEFAULT_CATEGORIES = [
  { id: 'alimentacao',  name: 'Alimentação',  emoji: '🍔', color: '#f59e0b' },
  { id: 'transporte',   name: 'Transporte',   emoji: '🚗', color: '#3b82f6' },
  { id: 'moradia',      name: 'Moradia',      emoji: '🏠', color: '#8b5cf6' },
  { id: 'lazer',        name: 'Lazer',        emoji: '🎮', color: '#ec4899' },
  { id: 'saude',        name: 'Saúde',        emoji: '💊', color: '#10b981' },
  { id: 'educacao',     name: 'Educação',     emoji: '📚', color: '#06b6d4' },
  { id: 'contas',       name: 'Contas',       emoji: '⚡', color: '#6366f1' },
  { id: 'investimento', name: 'Investimento', emoji: '📈', color: '#16a34a' },
  { id: 'salario',      name: 'Salário',      emoji: '💰', color: '#16a34a' },
  { id: 'outros',       name: 'Outros',       emoji: '📦', color: '#9ca3af' },
];

const DEFAULT_DISTRIBUTION = [
  { id: 'essenciais',  name: 'Essenciais',  color: '#3b82f6', pct: 50 },
  { id: 'reserva',     name: 'Reserva',     color: '#16a34a', pct: 20 },
  { id: 'metas',       name: 'Metas',       color: '#8b5cf6', pct: 15 },
  { id: 'lazer',       name: 'Lazer',       color: '#ec4899', pct: 10 },
  { id: 'crescimento', name: 'Crescimento', color: '#f59e0b', pct: 5  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function makeDate(y, m, d) {
  return new Date(y, m, d).toISOString().slice(0, 10);
}

// ─── LEGACY DEMO DATA ─────────────────────────────────────────────────────────

const LEGACY_DEMO_TRANSACTIONS = (function() {
  const y = THIS_YEAR, m = THIS_MONTH, pm = THIS_MONTH - 1;
  return [
    { id:1,  type:'entrada', desc:'Salário',                 value:8500, date:makeDate(y,m,5),   cat:'salario',     pay:'pix',    obs:'',           recurrent:true  },
    { id:2,  type:'entrada', desc:'Freela Design',           value:1200, date:makeDate(y,m,12),  cat:'outros',      pay:'pix',    obs:'Landing page',recurrent:false },
    { id:3,  type:'saida',   desc:'Aluguel',                 value:2200, date:makeDate(y,m,5),   cat:'moradia',     pay:'debito', obs:'',           recurrent:true  },
    { id:4,  type:'saida',   desc:'Supermercado',            value:580,  date:makeDate(y,m,8),   cat:'alimentacao', pay:'debito', obs:'',           recurrent:false },
    { id:5,  type:'saida',   desc:'Uber',                    value:85,   date:makeDate(y,m,10),  cat:'transporte',  pay:'credito',obs:'',           recurrent:false },
    { id:6,  type:'saida',   desc:'Conta de luz',            value:210,  date:makeDate(y,m,7),   cat:'contas',      pay:'pix',    obs:'',           recurrent:true  },
    { id:7,  type:'saida',   desc:'Academia',                value:120,  date:makeDate(y,m,1),   cat:'saude',       pay:'debito', obs:'',           recurrent:true  },
    { id:8,  type:'saida',   desc:'Netflix + Spotify',       value:75,   date:makeDate(y,m,3),   cat:'lazer',       pay:'credito',obs:'',           recurrent:true  },
    { id:9,  type:'saida',   desc:'Restaurante',             value:160,  date:makeDate(y,m,14),  cat:'alimentacao', pay:'credito',obs:'Jantar',     recurrent:false },
    { id:10, type:'saida',   desc:'Curso Online',            value:250,  date:makeDate(y,m,11),  cat:'educacao',    pay:'credito',obs:'',           recurrent:false },
    { id:11, type:'saida',   desc:'Internet',                value:100,  date:makeDate(y,m,6),   cat:'contas',      pay:'pix',    obs:'',           recurrent:true  },
    { id:12, type:'saida',   desc:'Farmácia',                value:90,   date:makeDate(y,m,9),   cat:'saude',       pay:'pix',    obs:'',           recurrent:false },
    { id:13, type:'entrada', desc:'Salário',                 value:8500, date:makeDate(y,pm,5),  cat:'salario',     pay:'pix',    obs:'',           recurrent:true  },
    { id:14, type:'saida',   desc:'Aluguel',                 value:2200, date:makeDate(y,pm,5),  cat:'moradia',     pay:'debito', obs:'',           recurrent:true  },
    { id:15, type:'saida',   desc:'Supermercado',            value:620,  date:makeDate(y,pm,10), cat:'alimentacao', pay:'debito', obs:'',           recurrent:false },
    { id:16, type:'saida',   desc:'Viagem de fim de semana', value:900,  date:makeDate(y,pm,20), cat:'lazer',       pay:'credito',obs:'',           recurrent:false },
    { id:17, type:'saida',   desc:'Conta de luz',            value:195,  date:makeDate(y,pm,7),  cat:'contas',      pay:'pix',    obs:'',           recurrent:true  },
    { id:18, type:'saida',   desc:'Academia',                value:120,  date:makeDate(y,pm,1),  cat:'saude',       pay:'debito', obs:'',           recurrent:true  },
  ];
})();

const LEGACY_DEMO_GOALS = [
  { id:1, name:'Apartamento próprio', emoji:'🏡', target:60000, saved:18500, months:36, monthly:1200, createdAt:makeDate(THIS_YEAR-1,3,1) },
  { id:2, name:'Viagem para o Japão', emoji:'✈️', target:15000, saved:4800,  months:18, monthly:600,  createdAt:makeDate(THIS_YEAR,0,1) },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────

const Storage = {
  KEYS: {
    txs:         'bolsy_txs',
    goals:       'bolsy_goals',
    cats:        'bolsy_cats',
    dist:        'bolsy_dist',
    user:        'bolsy_user',
    nextId:      'bolsy_nextid',
    migrations:  'bolsy_migrations',
    cards:       'bolsy_cards',
    futureitems: 'bolsy_futureitems',
  },

  save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { console.warn('Storage error', e); }
  },
  load(key, fallback) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  },

  get transactions()  { return this.load(this.KEYS.txs,         []); },
  set transactions(v) { this.save(this.KEYS.txs, v); },

  get goals()         { return this.load(this.KEYS.goals,       []); },
  set goals(v)        { this.save(this.KEYS.goals, v); },

  get categories()    { return this.load(this.KEYS.cats,        DEFAULT_CATEGORIES); },
  set categories(v)   { this.save(this.KEYS.cats, v); },

  get distribution()  { return this.load(this.KEYS.dist,        DEFAULT_DISTRIBUTION); },
  set distribution(v) { this.save(this.KEYS.dist, v); },

  get user()          { return this.load(this.KEYS.user,        { name: '' }); },
  set user(v)         { this.save(this.KEYS.user, v); },

  get nextId()        { return this.load(this.KEYS.nextId,      100); },
  set nextId(v)       { this.save(this.KEYS.nextId, v); },

  // Cartões: { id, nome, diaFechamento, diaVencimento, limite }
  get cards()         { return this.load(this.KEYS.cards,       []); },
  set cards(v)        { this.save(this.KEYS.cards, v); },

  // Itens futuros (receitas e despesas previstas):
  // { id, kind:'receita'|'despesa', desc, value, dataPrevista, cat,
  //   status:'previsto'|'realizado', txId? }
  // Quando 'realizado': txId aponta para a transação real gerada (anti-duplicação)
  get futureItems()   { return this.load(this.KEYS.futureitems, []); },
  set futureItems(v)  { this.save(this.KEYS.futureitems, v); },

  genId() {
    const id = this.nextId;
    this.nextId = id + 1;
    return id;
  },

  exportAll() {
    return {
      version:      '3.1',
      exportedAt:   new Date().toISOString(),
      transactions: this.transactions,
      goals:        this.goals,
      categories:   this.categories,
      distribution: this.distribution,
      user:         this.user,
      cards:        this.cards,
      futureItems:  this.futureItems,
    };
  },

  importAll(data) {
    if (data.transactions)  this.transactions  = data.transactions;
    if (data.goals)         this.goals         = data.goals;
    if (data.categories)    this.categories    = data.categories;
    if (data.distribution)  this.distribution  = data.distribution;
    if (data.user)          this.user          = data.user;
    if (data.cards)         this.cards         = data.cards;
    if (data.futureItems)   this.futureItems   = data.futureItems;
    // compatibilidade com versão anterior (bolsy_futureincome)
    if (data.futureIncome && !data.futureItems) {
      this.futureItems = data.futureIncome.map(r => ({
        ...r, kind: 'receita', cat: r.cat || 'outros',
        status: r.status === 'recebido' ? 'realizado' : 'previsto',
      }));
    }
  },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('bolsy_futureincome'); // chave legada
  },
};

// ─── MIGRATIONS ───────────────────────────────────────────────────────────────

function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function runMigrations() {
  const mig = Storage.load(Storage.KEYS.migrations, {});

  if (!mig.v210_remove_demo_data) {
    const t = Storage.load(Storage.KEYS.txs,   null);
    const g = Storage.load(Storage.KEYS.goals, null);
    if (t && t.length && arraysEqual(t, LEGACY_DEMO_TRANSACTIONS)) Storage.transactions = [];
    if (g && g.length && arraysEqual(g, LEGACY_DEMO_GOALS))        Storage.goals        = [];
    Storage.save(Storage.KEYS.migrations, { ...mig, v210_remove_demo_data: true });
    mig.v210_remove_demo_data = true;
  }

  if (!mig.v310_future_items) {
    const legacy = Storage.load('bolsy_futureincome', null);
    if (legacy && legacy.length && !Storage.futureItems.length) {
      Storage.futureItems = legacy.map(r => ({
        ...r, kind: 'receita', cat: r.cat || 'outros',
        status: r.status === 'recebido' ? 'realizado' : 'previsto',
      }));
      localStorage.removeItem('bolsy_futureincome');
    }
    Storage.save(Storage.KEYS.migrations, { ...mig, v310_future_items: true });
  }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

const Utils = {
  fmt(val) {
    return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(val || 0);
  },
  fmtShort(val) {
    if (Math.abs(val) >= 1000) return 'R$ ' + (val / 1000).toFixed(1).replace('.', ',') + 'k';
    return this.fmt(val);
  },
  applyMoneyMask(input) {
    let raw = input.value.replace(/\D/g, '');
    if (!raw) { input.value = ''; return; }
    raw = raw.replace(/^0+/, '') || '0';
    while (raw.length < 3) raw = '0' + raw;
    input.value = parseInt(raw.slice(0, -2), 10).toLocaleString('pt-BR') + ',' + raw.slice(-2);
  },
  parseMoney(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  },
  getCat(id, cats) { return cats.find(c => c.id === id) || cats[cats.length - 1]; },
  getMonthTxs(txs, month, year) {
    return txs.filter(tx => {
      const d = new Date(tx.date + 'T12:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    });
  },
  sumIncome(txs)  { return txs.filter(t => t.type === 'entrada').reduce((s,t) => s + t.value, 0); },
  sumExpense(txs) { return txs.filter(t => t.type === 'saida').reduce((s,t) => s + t.value, 0); },
  today() { return new Date().toISOString().slice(0, 10); },
  initials(name) {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length > 1 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
  },
  dateForDay(year, month, day) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) return new Date(year, month + 1, 0).toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  },
};

// ─── CREDIT CARD ENGINE ───────────────────────────────────────────────────────

const CardEngine = {
  calcFaturaDate(card, dataCompra) {
    const c  = new Date(dataCompra + 'T12:00:00');
    const cy = c.getFullYear(), cm = c.getMonth(), dd = c.getDate();
    let fechMes = dd <= card.diaFechamento ? cm : cm + 1;
    let fechAno = cy;
    if (fechMes > 11) { fechMes = 0; fechAno++; }
    let vencMes = fechMes + 1, vencAno = fechAno;
    if (vencMes > 11) { vencMes = 0; vencAno++; }
    return {
      dataFechamento: Utils.dateForDay(fechAno, fechMes, card.diaFechamento),
      dataVencimento: Utils.dateForDay(vencAno, vencMes, card.diaVencimento),
    };
  },

  gerarParcelas({ card, desc, value, dataCompra, parcelas, cat, obs }) {
    const n = parcelas || 1;
    const vp = parseFloat((value / n).toFixed(2));
    const result = [];
    for (let i = 0; i < n; i++) {
      const base      = new Date(dataCompra + 'T12:00:00');
      const mesRaw    = base.getMonth() + i;
      const anoAdj    = base.getFullYear() + Math.floor(mesRaw / 12);
      const dataPar   = Utils.dateForDay(anoAdj, mesRaw % 12, base.getDate());
      const { dataFechamento, dataVencimento } = this.calcFaturaDate(card, dataPar);
      result.push({
        id: Storage.genId(), type: 'credito',
        desc: n > 1 ? `${desc} (${i+1}/${n})` : desc,
        value: vp, date: dataPar, cat, pay: 'credito', obs: obs || '',
        recurrent: false, cardId: card.id, parcelas: n, parcelaAtual: i + 1,
        dataCompra, dataFatura: dataVencimento, dataFechamento,
      });
    }
    return result;
  },

  getFaturas() {
    const map   = {};
    const cards = Storage.cards;
    Storage.transactions.filter(t => t.type === 'credito').forEach(tx => {
      const key = `${tx.cardId}__${tx.dataFatura}`;
      if (!map[key]) map[key] = {
        cardId: tx.cardId,
        card: cards.find(c => c.id === tx.cardId) || { id: tx.cardId, nome: 'Cartão' },
        dataFechamento: tx.dataFechamento, dataVencimento: tx.dataFatura,
        transactions: [], total: 0,
      };
      map[key].transactions.push(tx);
      map[key].total += tx.value;
    });
    return Object.values(map).sort((a,b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
  },

  getFaturasFuturas() {
    const hoje = Utils.today();
    return this.getFaturas().filter(f => f.dataVencimento >= hoje);
  },
};

// ─── PROJECTED CASH FLOW ──────────────────────────────────────────────────────

const CashFlow = {
  /**
   * Saldo real hoje:
   *   Σ entradas reais  −  Σ saídas reais
   *   (type:'credito' NÃO entra — ainda não impactou o caixa)
   */
  saldoAtual() {
    const txs = Storage.transactions;
    return txs.filter(t => t.type === 'entrada').reduce((s,t) => s + t.value, 0)
         - txs.filter(t => t.type === 'saida').reduce((s,t) => s + t.value, 0);
  },

  /**
   * Saldo projetado em dataAlvo.
   *
   * Fórmula:
   *   saldo atual
   *   + Σ receitas futuras previstas  com dataPrevista ≤ dataAlvo
   *   − Σ despesas futuras previstas  com dataPrevista ≤ dataAlvo
   *   − Σ faturas de crédito          com dataVencimento ≤ dataAlvo
   *
   * Itens 'realizado' já viraram transação real → já estão no saldoAtual.
   * Por isso filtramos apenas status:'previsto'.
   */
  calculateProjectedBalance(dataAlvo) {
    const saldo = this.saldoAtual();

    const prevItems = Storage.futureItems.filter(i => i.status === 'previsto' && i.dataPrevista <= dataAlvo);
    const recFuturas  = prevItems.filter(i => i.kind === 'receita').reduce((s,i) => s + i.value, 0);
    const despFuturas = prevItems.filter(i => i.kind === 'despesa').reduce((s,i) => s + i.value, 0);

    const faturas = CardEngine.getFaturas()
      .filter(f => f.dataVencimento <= dataAlvo)
      .reduce((s,f) => s + f.total, 0);

    return saldo + recFuturas - despFuturas - faturas;
  },

  /**
   * Folga até a fatura.
   *
   * Pergunta: "depois de pagar tudo até o vencimento desta fatura (inclusive ela),
   * quanto sobra no caixa?"
   *
   * Resposta = calculateProjectedBalance(fatura.dataVencimento)
   *
   * Essa função já desconta:
   *   • receitas futuras até aquela data  (+)
   *   • despesas futuras até aquela data  (−)
   *   • TODAS as faturas até aquela data, inclusive esta (−)
   *
   * O resultado é exatamente a folga — sem truques.
   */
  folgaAteFatura(fatura) {
    return this.calculateProjectedBalance(fatura.dataVencimento);
  },

  projecaoResumo() {
    const d30 = new Date(NOW); d30.setDate(d30.getDate() + 30);
    const d60 = new Date(NOW); d60.setDate(d60.getDate() + 60);
    const faturasFuturas = CardEngine.getFaturasFuturas().slice(0, 3);
    return {
      saldoAtual:     this.saldoAtual(),
      saldoEm30d:     this.calculateProjectedBalance(d30.toISOString().slice(0,10)),
      saldoEm60d:     this.calculateProjectedBalance(d60.toISOString().slice(0,10)),
      faturasFuturas: faturasFuturas.map(f => ({ ...f, folga: this.folgaAteFatura(f) })),
    };
  },
};

// ─── CALC ─────────────────────────────────────────────────────────────────────

const Calc = {
  monthSummary(month, year) {
    const all        = Storage.transactions;
    const txs        = Utils.getMonthTxs(all, month, year).filter(t => t.type === 'entrada' || t.type === 'saida');
    const creditoTxs = Utils.getMonthTxs(all, month, year).filter(t => t.type === 'credito');
    const income     = Utils.sumIncome(txs);
    const expense    = Utils.sumExpense(txs);
    const balance    = income - expense;
    const dist       = Storage.distribution;
    const paraMetas  = income * ((dist.find(d => d.id === 'metas')?.pct ?? 15) / 100);
    const comprometido = txs.filter(t => t.type === 'saida' && t.recurrent).reduce((s,t) => s + t.value, 0);
    const livre        = Math.max(0, balance - comprometido);
    const totalCredito = creditoTxs.reduce((s,t) => s + t.value, 0);
    return { txs, creditoTxs, income, expense, balance, paraMetas, comprometido, livre, totalCredito };
  },

  goalStatus(goal) {
    const start = new Date(goal.createdAt), now = new Date();
    const monthsElapsed = (now.getFullYear()-start.getFullYear())*12 + (now.getMonth()-start.getMonth());
    const expectedPct = (monthsElapsed * goal.monthly / goal.target) * 100;
    const actualPct   = (goal.saved / goal.target) * 100;
    let status = 'on-track', statusLabel = 'No ritmo';
    if (actualPct > expectedPct + 5)  { status = 'ahead';  statusLabel = 'Adiantada'; }
    if (actualPct < expectedPct - 10) { status = 'behind'; statusLabel = 'Atrasada';  }
    return { status, statusLabel, actualPct, expectedPct };
  },

  goalForecast(goal) {
    const remaining    = Math.max(0, goal.target - goal.saved);
    const monthsNeeded = goal.monthly > 0 ? Math.ceil(remaining / goal.monthly) : 999;
    const doneDate     = new Date(NOW.getFullYear(), NOW.getMonth() + monthsNeeded, 1);
    return { remaining, monthsNeeded, doneDateStr: doneDate.toLocaleDateString('pt-BR', { month:'long', year:'numeric' }) };
  },
};

// ─── RENDER ───────────────────────────────────────────────────────────────────

const Render = {

  dashboard() {
    const { income, expense, balance, paraMetas, comprometido, livre, totalCredito } =
      Calc.monthSummary(THIS_MONTH, THIS_YEAR);

    const name = Storage.user.name || '';
    document.getElementById('greeting-name').textContent = name ? `Olá, ${name.split(' ')[0]} 👋` : 'Olá 👋';
    document.getElementById('current-date').textContent  = NOW.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
    document.getElementById('header-avatar-btn').textContent = Utils.initials(name);
    document.getElementById('dash-saldo').textContent        = Utils.fmt(balance);
    document.getElementById('dash-entradas').textContent     = Utils.fmtShort(income);
    document.getElementById('dash-saidas').textContent       = Utils.fmtShort(expense);
    document.getElementById('dash-livre').textContent        = Utils.fmtShort(livre);
    document.getElementById('dash-comprometido').textContent = Utils.fmtShort(comprometido);
    document.getElementById('dash-metas-valor').textContent  = Utils.fmtShort(paraMetas);

    this.mainGoal();
    this.categoryChart();
    this.faturasSummary();
    this.projecaoPreview();
    this.alerts(income, expense, balance, totalCredito);
  },

  faturasSummary() {
    const section  = document.getElementById('dash-faturas-section');
    const projecao = CashFlow.projecaoResumo();
    if (!projecao.faturasFuturas.length) { if (section) section.style.display = 'none'; return; }
    if (section) section.style.display = 'block';
    const container = document.getElementById('dash-faturas');
    if (!container) return;
    container.innerHTML = projecao.faturasFuturas.map(f => {
      const fClass   = f.folga >= 0 ? 'income' : 'expense';
      const fIcon    = f.folga >= 0 ? '✅' : '⚠️';
      const vencLbl  = new Date(f.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR', { day:'numeric', month:'short' });
      return `
        <div class="fatura-card">
          <div class="fatura-header">
            <span class="fatura-card-name">💳 ${f.card?.nome || 'Cartão'}</span>
            <span class="fatura-venc">Vence ${vencLbl}</span>
          </div>
          <div class="fatura-total">${Utils.fmt(f.total)}</div>
          <div class="fatura-folga">${fIcon} Saldo depois de pagar: <span class="tx-amount ${fClass}">${Utils.fmt(f.folga)}</span></div>
        </div>`;
    }).join('');
  },

  // Preview no dashboard: próximos 5 itens futuros previstos
  projecaoPreview() {
    const section   = document.getElementById('dash-projecao-section');
    const container = document.getElementById('dash-projecao-list');
    if (!section || !container) return;
    const hoje  = Utils.today();
    const items = Storage.futureItems
      .filter(i => i.status === 'previsto' && i.dataPrevista >= hoje)
      .sort((a,b) => a.dataPrevista.localeCompare(b.dataPrevista))
      .slice(0, 5);
    if (!items.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    const cats = Storage.categories;
    container.innerHTML = items.map(item => {
      const isRec  = item.kind === 'receita';
      const cat    = Utils.getCat(item.cat || 'outros', cats);
      const dlbl   = new Date(item.dataPrevista + 'T12:00:00').toLocaleDateString('pt-BR', { day:'numeric', month:'short' });
      return `
        <div class="tx-item">
          <div class="tx-icon" style="opacity:.7">${isRec ? '📥' : cat.emoji}</div>
          <div class="tx-info">
            <div class="tx-desc">${item.desc} <span style="font-size:10px;opacity:.6">📅 previsto</span></div>
            <div class="tx-cat">${isRec ? 'Receita' : cat.name} · ${dlbl}</div>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${isRec ? 'income' : 'expense'}" style="opacity:.8">${isRec ? '+' : '-'}${Utils.fmt(item.value)}</span>
          </div>
        </div>`;
    }).join('');
  },

  mainGoal() {
    const el    = document.getElementById('dash-main-goal');
    const goals = Storage.goals;
    if (!goals.length) {
      el.innerHTML = `<div class="goal-card"><div class="empty-state"><div class="empty-state-icon">🎯</div><p>Nenhuma meta ainda.<br>Adicione uma em <strong>Metas</strong>!</p></div></div>`;
      return;
    }
    el.innerHTML = `<div class="goal-card">${this._goalCardContent(goals[0])}</div>`;
  },

  _goalCardContent(g) {
    const { status, statusLabel, actualPct } = Calc.goalStatus(g);
    const { remaining, monthsNeeded, doneDateStr } = Calc.goalForecast(g);
    const pct = Math.min(100, actualPct);
    const sc  = status === 'ahead' ? 'status-ahead' : status === 'behind' ? 'status-behind' : 'status-on-track';
    return `
      <div class="goal-card-header">
        <div class="goal-card-emoji">${g.emoji}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="goal-status ${sc}">${statusLabel}</span>
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
      <div class="progress-bar-track"><div class="progress-bar-fill ${status}" style="width:${pct}%"></div></div>
      <div class="progress-labels">
        <span>${pct.toFixed(1)}% concluído</span>
        <span>Falta <strong class="progress-amount">${Utils.fmt(remaining)}</strong></span>
      </div>
      <div class="goal-meta-row">
        <div class="goal-meta-item"><div class="goal-meta-label">Por mês</div><div class="goal-meta-value" style="color:var(--green)">${Utils.fmt(g.monthly)}</div></div>
        <div class="goal-meta-item"><div class="goal-meta-label">Previsão</div><div class="goal-meta-value" style="font-size:11px">${doneDateStr}</div></div>
        <div class="goal-meta-item"><div class="goal-meta-label">Faltam</div><div class="goal-meta-value">${monthsNeeded > 500 ? '—' : monthsNeeded + ' meses'}</div></div>
      </div>`;
  },

  categoryChart() {
    const el     = document.getElementById('dash-categories');
    const cats   = Storage.categories;
    const saidas = Utils.getMonthTxs(Storage.transactions, THIS_MONTH, THIS_YEAR)
                     .filter(t => t.type === 'saida' || t.type === 'credito');
    const total  = saidas.reduce((s,t) => s + t.value, 0);
    if (!total) { el.innerHTML = '<p style="color:var(--text-ter);font-size:13px;padding:4px 0">Nenhum gasto este mês.</p>'; return; }
    const bycat  = {};
    saidas.forEach(t => { bycat[t.cat] = (bycat[t.cat]||0) + t.value; });
    el.innerHTML = Object.entries(bycat).sort((a,b) => b[1]-a[1]).slice(0,6).map(([catId, val]) => {
      const cat = Utils.getCat(catId, cats);
      const pct = (val / total) * 100;
      return `
        <div class="category-row">
          <div class="cat-emoji">${cat.emoji}</div>
          <div class="cat-details">
            <div class="cat-name-row"><span class="cat-name">${cat.name}</span><span class="cat-value">${Utils.fmt(val)}</span></div>
            <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>
          </div>
        </div>`;
    }).join('');
  },

  alerts(income, expense, balance, totalCredito) {
    const section   = document.getElementById('dash-alerts-section');
    const container = document.getElementById('dash-alerts');
    const alerts    = [];
    const spendPct  = income > 0 ? (expense / income) * 100 : 0;

    if (balance < 0)         alerts.push({ icon:'🔴', text:`<strong>Saldo negativo!</strong> As saídas superaram as entradas este mês.` });
    else if (spendPct > 85)  alerts.push({ icon:'⚠️', text:`Você gastou <strong>${spendPct.toFixed(0)}%</strong> da renda este mês. Atenção!` });
    else if (spendPct > 70)  alerts.push({ icon:'💡', text:`Você já usou <strong>${spendPct.toFixed(0)}%</strong> da renda. Monitore os gastos.` });

    if (totalCredito > 0)
      alerts.push({ icon:'💳', text:`<strong>${Utils.fmt(totalCredito)}</strong> em compras no crédito este mês (entram nas faturas).` });

    CashFlow.projecaoResumo().faturasFuturas.forEach(f => {
      if (f.folga < 0)
        alerts.push({ icon:'🚨', text:`Fatura <strong>${f.card?.nome || 'Cartão'}</strong> (${Utils.fmt(f.total)}): saldo projetado insuficiente para pagar!` });
    });

    if (Storage.goals.length) {
      const { status } = Calc.goalStatus(Storage.goals[0]);
      if (status === 'behind') alerts.push({ icon:'📉', text:`Meta <strong>${Storage.goals[0].name}</strong> está atrasada. Considere aumentar o aporte.` });
    }

    if (!alerts.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    container.innerHTML = alerts.map(a =>
      `<div class="alert-item"><span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span></div>`
    ).join('');
  },

  historico() {
    const m = State.histMonth, y = State.histYear;
    document.getElementById('hist-month-label').textContent = MONTHS_PT[m] + ' ' + y;

    const txs      = Utils.getMonthTxs(Storage.transactions, m, y);
    const txsReais = txs.filter(t => t.type === 'entrada' || t.type === 'saida');
    const income   = Utils.sumIncome(txsReais);
    const expense  = Utils.sumExpense(txsReais);
    const balance  = income - expense;

    document.getElementById('hist-total-in').textContent  = Utils.fmt(income);
    document.getElementById('hist-total-out').textContent = Utils.fmt(expense);
    const balEl = document.getElementById('hist-balance');
    balEl.textContent = Utils.fmt(balance);
    balEl.style.color = balance >= 0 ? 'var(--green)' : 'var(--red)';

    const listEl = document.getElementById('hist-list');
    if (!txs.length) { listEl.innerHTML = '<div class="hist-empty">Nenhum lançamento neste mês.</div>'; return; }

    const cats   = Storage.categories;
    const cards  = Storage.cards;
    const groups = {};
    [...txs].sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });

    listEl.innerHTML = Object.entries(groups).map(([date, items]) => {
      const label = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' });
      return `
        <div class="tx-date-group">
          <div class="tx-date-label">${label}</div>
          ${items.map(tx => {
            const cat      = Utils.getCat(tx.cat, cats);
            const isIncome = tx.type === 'entrada';
            const isCredit = tx.type === 'credito';
            const card     = isCredit ? cards.find(c => c.id === tx.cardId) : null;
            const creditBadge = isCredit
              ? `<div style="margin-top:2px"><span style="font-size:10px;background:var(--surface-2);border-radius:4px;padding:1px 5px;color:var(--text-sec)">💳 fatura ${new Date(tx.dataFatura+'T12:00:00').toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})}</span></div>`
              : '';
            const payLabel = isCredit ? (card ? card.nome : 'Crédito') : (tx.pay || '');
            return `
              <div class="tx-item">
                <div class="tx-icon">${cat.emoji}</div>
                <div class="tx-info">
                  <div class="tx-desc">${tx.desc}${tx.recurrent ? ' <span style="font-size:10px;opacity:.6">↺</span>' : ''}${isCredit ? ' <span style="font-size:10px;opacity:.7">📅</span>' : ''}</div>
                  <div class="tx-cat">${cat.name}${payLabel ? ' · ' + payLabel : ''}${tx.obs ? ' · ' + tx.obs : ''}</div>
                  ${creditBadge}
                </div>
                <div class="tx-right">
                  <span class="tx-amount ${isIncome ? 'income' : 'expense'}" style="${isCredit ? 'opacity:.7' : ''}">${isIncome ? '+' : '-'}${Utils.fmt(tx.value)}</span>
                  <div class="tx-actions">
                    ${!isCredit ? `<button class="tx-btn" onclick="editTransaction(${tx.id})" title="Editar"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5-8 8L3 14l.5-2.5 8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : ''}
                    <button class="tx-btn del" onclick="deleteTransaction(${tx.id})" title="Apagar"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');
  },

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
    el.innerHTML = goals.map(g => `<div class="goal-list-card">${this._goalCardContent(g)}</div>`).join('');
  },

  configs() {
    const name = Storage.user.name || '';
    document.getElementById('config-name').textContent     = name || 'Seu nome';
    document.getElementById('config-avatar').textContent   = Utils.initials(name);
    document.getElementById('config-name-input').value     = name;

    const dist   = Storage.distribution;
    const { income } = Calc.monthSummary(THIS_MONTH, THIS_YEAR);
    const rows   = dist.map(d => `
      <div class="dist-row">
        <div class="dist-color" style="background:${d.color}"></div>
        <div class="dist-name">${d.name}</div>
        <div class="dist-pct">${d.pct}%</div>
        <div class="dist-val">${Utils.fmt(income * (d.pct / 100))}</div>
      </div>`).join('');
    const bar = dist.map(d => `<div class="dist-bar-segment" style="width:${d.pct}%;background:${d.color}"></div>`).join('');
    document.getElementById('distribution-card').innerHTML = rows + `<div class="dist-bar-track">${bar}</div>`;

    document.getElementById('categories-grid').innerHTML = Storage.categories.map(c =>
      `<div class="cat-chip"><div class="cat-chip-emoji">${c.emoji}</div><div class="cat-chip-name">${c.name}</div></div>`
    ).join('');

    this.cardsList();
  },

  cardsList() {
    const el = document.getElementById('cards-list');
    if (!el) return;
    const cards = Storage.cards;
    if (!cards.length) { el.innerHTML = `<div style="color:var(--text-ter);font-size:13px;padding:8px 0">Nenhum cartão cadastrado.</div>`; return; }
    el.innerHTML = cards.map(c => {
      const aberto = CardEngine.getFaturas()
        .filter(f => f.cardId === c.id && f.dataVencimento >= Utils.today())
        .reduce((s,f) => s + f.total, 0);
      return `
        <div class="settings-item" style="padding:12px 0">
          <div class="settings-item-left" style="flex:1">
            <div class="settings-icon">💳</div>
            <div>
              <div style="font-weight:500;font-size:14px">${c.nome}</div>
              <div style="font-size:12px;color:var(--text-sec)">Fecha dia ${c.diaFechamento} · Vence dia ${c.diaVencimento}${aberto > 0 ? ' · <span style="color:var(--red)">' + Utils.fmt(aberto) + ' em aberto</span>' : ''}</div>
            </div>
          </div>
          <button class="tx-btn del" onclick="deleteCard(${c.id})" style="padding:6px">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>`;
    }).join('');
  },

  // Lista completa de itens futuros (tela Projeção)
  futureItemsList() {
    const el = document.getElementById('future-items-list');
    if (!el) return;
    const items = [...Storage.futureItems].sort((a,b) => a.dataPrevista.localeCompare(b.dataPrevista));
    const cats  = Storage.categories;

    if (!items.length) {
      el.innerHTML = `<div class="hist-empty" style="padding:24px 0 8px">Nenhum item previsto.<br>Adicione receitas ou despesas futuras usando os botões acima.</div>`;
      return;
    }

    const hoje = Utils.today();
    el.innerHTML = items.map(item => {
      const isRec    = item.kind === 'receita';
      const cat      = Utils.getCat(item.cat || 'outros', cats);
      const dlbl     = new Date(item.dataPrevista + 'T12:00:00').toLocaleDateString('pt-BR', { day:'numeric', month:'short', year:'numeric' });
      const isPast   = item.dataPrevista < hoje && item.status === 'previsto';
      const badgeCss = item.status === 'realizado' ? 'status-ahead' : isPast ? 'status-behind' : 'status-on-track';
      const badgeTxt = item.status === 'realizado' ? 'Realizado' : isPast ? 'Vencido' : 'Previsto';

      return `
        <div class="tx-item" style="${item.status === 'realizado' ? 'opacity:.5' : ''}">
          <div class="tx-icon">${isRec ? '📥' : cat.emoji}</div>
          <div class="tx-info">
            <div class="tx-desc">${item.desc} <span class="goal-status ${badgeCss}" style="font-size:9px;padding:1px 5px">${badgeTxt}</span></div>
            <div class="tx-cat">${isRec ? 'Receita prevista' : cat.name} · ${dlbl}</div>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${isRec ? 'income' : 'expense'}">${isRec ? '+' : '-'}${Utils.fmt(item.value)}</span>
            <div class="tx-actions">
              ${item.status === 'previsto' ? `
                <button class="tx-btn" onclick="realizarFutureItem(${item.id})" title="Marcar como realizado" style="color:var(--green);font-size:14px;padding:2px 4px">✓</button>
                <button class="tx-btn" onclick="editFutureItem(${item.id})" title="Editar">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5-8 8L3 14l.5-2.5 8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>` : ''}
              <button class="tx-btn del" onclick="deleteFutureItem(${item.id})" title="Apagar">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  },
};

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el  = document.getElementById('screen-' + screen);
  const nav = document.getElementById('nav-' + screen);
  if (el)  el.classList.add('active');
  if (nav) nav.classList.add('active');
  State.currentScreen = screen;
  switch(screen) {
    case 'dashboard':     Render.dashboard();      break;
    case 'historico':     Render.historico();      break;
    case 'novo':          initNovoForm(null);      break;
    case 'metas':         Render.metas();          break;
    case 'configuracoes': Render.configs();        break;
    case 'projecao':      renderProjecaoScreen();  break;
  }
}

function changeHistMonth(dir) {
  State.histMonth += dir;
  if (State.histMonth < 0)  { State.histMonth = 11; State.histYear--; }
  if (State.histMonth > 11) { State.histMonth = 0;  State.histYear++; }
  Render.historico();
}

// ─── FORMULÁRIO NOVA TRANSAÇÃO ────────────────────────────────────────────────

function initNovoForm(txId) {
  const cats  = Storage.categories;
  const cards = Storage.cards;

  document.getElementById('input-categoria').innerHTML = cats.map(c =>
    `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');

  const cardSel = document.getElementById('input-card-id');
  if (cardSel) {
    cardSel.innerHTML = cards.length
      ? cards.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
      : `<option value="">— cadastre um cartão —</option>`;
  }

  State.editingTxId = txId;

  if (txId !== null) {
    const tx = Storage.transactions.find(t => t.id === txId);
    if (!tx) return;
    document.getElementById('novo-screen-title').textContent = 'Editar lançamento';
    document.getElementById('btn-save-tx').textContent       = 'Atualizar lançamento';
    document.getElementById('input-editing-id').value        = txId;
    setTransactionType(tx.type === 'credito' ? 'saida' : tx.type);
    document.getElementById('input-valor').value            = tx.value.toFixed(2).replace('.', ',');
    document.getElementById('input-descricao').value        = tx.desc;
    document.getElementById('input-data').value             = tx.date;
    document.getElementById('input-categoria').value        = tx.cat;
    document.getElementById('input-obs').value              = tx.obs || '';
    document.getElementById('input-recorrente').checked     = !!tx.recurrent;
    document.querySelectorAll('#payment-chips .chip').forEach(c => c.classList.remove('active'));
    const payChip = document.querySelector(`#payment-chips .chip[data-pay="${tx.pay}"]`);
    if (payChip) payChip.classList.add('active');
    else document.querySelector('#payment-chips .chip').classList.add('active');
    State.txPayment = tx.pay || 'pix';
    updateCreditFields(tx.pay);
  } else {
    document.getElementById('novo-screen-title').textContent = 'Novo lançamento';
    document.getElementById('btn-save-tx').textContent       = 'Salvar lançamento';
    document.getElementById('input-editing-id').value        = '';
    setTransactionType('saida');
    document.getElementById('input-valor').value     = '';
    document.getElementById('input-descricao').value = '';
    document.getElementById('input-data').value      = Utils.today();
    document.getElementById('input-obs').value       = '';
    document.getElementById('input-recorrente').checked = false;
    document.querySelectorAll('#payment-chips .chip').forEach(c => c.classList.remove('active'));
    document.querySelector('#payment-chips .chip').classList.add('active');
    State.txPayment = 'pix';
    updateCreditFields('pix');
  }
}

function setTransactionType(type) {
  State.txType = type;
  document.getElementById('btn-saida').className   = 'type-btn' + (type === 'saida'   ? ' active-saida'   : '');
  document.getElementById('btn-entrada').className = 'type-btn' + (type === 'entrada' ? ' active-entrada' : '');
}

function selectPayment(el, method) {
  document.querySelectorAll('#payment-chips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  State.txPayment = method;
  updateCreditFields(method);
}

function updateCreditFields(method) {
  const el = document.getElementById('credit-extra-fields');
  if (el) el.style.display = method === 'credito' ? 'block' : 'none';
}

function cancelForm() { navigate('historico'); }

// ─── SAVE TRANSACTION ─────────────────────────────────────────────────────────

function saveTransaction() {
  const valor = Utils.parseMoney(document.getElementById('input-valor').value);
  const desc  = document.getElementById('input-descricao').value.trim();
  const data  = document.getElementById('input-data').value;
  const cat   = document.getElementById('input-categoria').value;
  const obs   = document.getElementById('input-obs').value.trim();
  const rec   = document.getElementById('input-recorrente').checked;

  if (!valor || valor <= 0) { showToast('⚠️ Informe um valor válido'); return; }
  if (!desc)                 { showToast('⚠️ Informe uma descrição');   return; }
  if (!data)                 { showToast('⚠️ Informe a data');          return; }

  if (State.txPayment === 'credito' && State.txType === 'saida') {
    const cards = Storage.cards;
    if (!cards.length) { showToast('⚠️ Cadastre um cartão nas Configurações primeiro.'); return; }
    const cardId = parseInt(document.getElementById('input-card-id')?.value);
    const card   = cards.find(c => c.id === cardId);
    if (!card) { showToast('⚠️ Selecione um cartão válido'); return; }
    const parcelas = parseInt(document.getElementById('input-parcelas')?.value) || 1;
    const novas    = CardEngine.gerarParcelas({ card, desc, value: valor, dataCompra: data, parcelas, cat, obs });
    const txs      = Storage.transactions;
    novas.forEach(p => txs.push(p));
    Storage.transactions = txs;
    showToast(parcelas > 1 ? `💳 ${parcelas}x de ${Utils.fmt(valor/parcelas)} lançados!` : `💳 Lançado na fatura de ${card.nome}!`);
    navigate('historico');
    return;
  }

  let txs = Storage.transactions;
  if (State.editingTxId !== null) {
    txs = txs.map(t => t.id === State.editingTxId
      ? { ...t, type: State.txType, desc, value: valor, date: data, cat, pay: State.txPayment, obs, recurrent: rec }
      : t
    );
    Storage.transactions = txs;
    showToast('✅ Lançamento atualizado!');
  } else {
    txs.push({ id: Storage.genId(), type: State.txType, desc, value: valor, date: data, cat, pay: State.txPayment, obs, recurrent: rec });
    Storage.transactions = txs;
    showToast('💸 Lançamento salvo!');
  }
  navigate('historico');
}

function editTransaction(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-novo').classList.add('active');
  State.currentScreen = 'novo';
  initNovoForm(id);
}

function deleteTransaction(id) {
  showConfirm('🗑️', 'Apagar lançamento', 'Este lançamento será removido permanentemente.', () => {
    Storage.transactions = Storage.transactions.filter(t => t.id !== id);
    Render.historico();
    Render.dashboard();
    showToast('🗑️ Lançamento removido');
  });
}

// ─── CARTÕES ──────────────────────────────────────────────────────────────────

function showCardModal() {
  const modal = document.getElementById('modal-card');
  if (!modal) return;
  ['card-nome','card-fechamento','card-vencimento','card-limite'].forEach(id => {
    document.getElementById(id).value = '';
  });
  modal.classList.add('open');
  setTimeout(() => document.getElementById('card-nome').focus(), 300);
}

function saveCard() {
  const nome       = document.getElementById('card-nome').value.trim();
  const fechamento = parseInt(document.getElementById('card-fechamento').value);
  const vencimento = parseInt(document.getElementById('card-vencimento').value);
  const limite     = Utils.parseMoney(document.getElementById('card-limite').value);
  if (!nome)                                        { showToast('⚠️ Informe o nome do cartão'); return; }
  if (!fechamento || fechamento < 1 || fechamento > 31) { showToast('⚠️ Dia de fechamento inválido'); return; }
  if (!vencimento || vencimento < 1 || vencimento > 31) { showToast('⚠️ Dia de vencimento inválido'); return; }
  const cards = Storage.cards;
  cards.push({ id: Storage.genId(), nome, diaFechamento: fechamento, diaVencimento: vencimento, limite: limite || null });
  Storage.cards = cards;
  closeModal('modal-card');
  Render.configs();
  showToast('💳 Cartão cadastrado!');
}

function deleteCard(id) {
  const card = Storage.cards.find(c => c.id === id);
  if (!card) return;

  // Conta transações de crédito vinculadas a este cartão
  const txsVinculadas = Storage.transactions.filter(t => t.type === 'credito' && t.cardId === id);
  const faturasAbertas = CardEngine.getFaturas()
    .filter(f => f.cardId === id && f.dataVencimento >= Utils.today());

  let aviso;
  if (faturasAbertas.length > 0) {
    const totalAberto = faturasAbertas.reduce((s,f) => s + f.total, 0);
    // Tem faturas em aberto → impede exclusão
    showToast(`⚠️ Remova as faturas em aberto (${Utils.fmt(totalAberto)}) antes de excluir o cartão.`);
    return;
  }

  if (txsVinculadas.length > 0) {
    aviso = `Este cartão tem ${txsVinculadas.length} compra${txsVinculadas.length > 1 ? 's' : ''} no histórico. Elas permanecerão sem nome de cartão vinculado.`;
  } else {
    aviso = 'O cartão será removido. Nenhuma transação vinculada encontrada.';
  }

  showConfirm('💳', `Remover "${card.nome}"`, aviso, () => {
    Storage.cards = Storage.cards.filter(c => c.id !== id);
    Render.configs();
    showToast('🗑️ Cartão removido');
  });
}

// ─── ITENS FUTUROS ────────────────────────────────────────────────────────────

function renderProjecaoScreen() {
  // Atualiza saldos projetados
  const d30 = new Date(NOW); d30.setDate(d30.getDate() + 30);
  const d60 = new Date(NOW); d60.setDate(d60.getDate() + 60);
  const p   = CashFlow.projecaoResumo();

  const s30 = document.getElementById('proj-saldo-30');
  const s60 = document.getElementById('proj-saldo-60');
  if (s30) { s30.textContent = Utils.fmt(p.saldoEm30d); s30.style.color = p.saldoEm30d >= 0 ? 'var(--green)' : 'var(--red)'; }
  if (s60) { s60.textContent = Utils.fmt(p.saldoEm60d); s60.style.color = p.saldoEm60d >= 0 ? 'var(--green)' : 'var(--red)'; }

  const sa = document.getElementById('proj-saldo-atual');
  if (sa) { sa.textContent = Utils.fmt(p.saldoAtual); sa.style.color = p.saldoAtual >= 0 ? 'var(--green)' : 'var(--red)'; }

  Render.futureItemsList();
}

function showFutureItemModal(kind, itemId) {
  itemId = itemId || null;
  State.futureItemType  = kind;
  State.editingFutureId = itemId;

  const modal  = document.getElementById('modal-future-item');
  const titleEl = document.getElementById('future-item-modal-title');
  const btnEl   = document.getElementById('btn-save-future-item');
  const catRow  = document.getElementById('future-item-cat-row');
  const catSel  = document.getElementById('future-item-cat');

  catSel.innerHTML = Storage.categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');

  const isRec = kind === 'receita';
  titleEl.textContent = itemId
    ? (isRec ? 'Editar receita prevista' : 'Editar despesa prevista')
    : (isRec ? 'Nova receita prevista'   : 'Nova despesa prevista');
  btnEl.textContent = itemId
    ? (isRec ? 'Atualizar receita' : 'Atualizar despesa')
    : (isRec ? 'Salvar receita'    : 'Salvar despesa');

  if (catRow) catRow.style.display = isRec ? 'none' : '';

  if (itemId !== null) {
    const item = Storage.futureItems.find(i => i.id === itemId);
    if (!item) return;
    document.getElementById('future-item-desc').value  = item.desc;
    document.getElementById('future-item-valor').value = item.value.toFixed(2).replace('.', ',');
    document.getElementById('future-item-data').value  = item.dataPrevista;
    if (catSel) catSel.value = item.cat || 'outros';
  } else {
    document.getElementById('future-item-desc').value  = '';
    document.getElementById('future-item-valor').value = '';
    document.getElementById('future-item-data').value  = Utils.today();
  }

  modal.classList.add('open');
  setTimeout(() => document.getElementById('future-item-desc').focus(), 300);
}

function saveFutureItem() {
  const desc  = document.getElementById('future-item-desc').value.trim();
  const valor = Utils.parseMoney(document.getElementById('future-item-valor').value);
  const data  = document.getElementById('future-item-data').value;
  const cat   = document.getElementById('future-item-cat')?.value || 'outros';

  if (!desc)             { showToast('⚠️ Informe a descrição'); return; }
  if (!valor || valor <= 0) { showToast('⚠️ Informe o valor'); return; }
  if (!data)             { showToast('⚠️ Informe a data');     return; }

  let items = Storage.futureItems;

  if (State.editingFutureId !== null) {
    items = items.map(i => i.id === State.editingFutureId
      ? { ...i, desc, value: valor, dataPrevista: data, cat }
      : i
    );
    Storage.futureItems = items;
    showToast('✅ Item atualizado!');
  } else {
    items.push({
      id: Storage.genId(), kind: State.futureItemType,
      desc, value: valor, dataPrevista: data, cat, status: 'previsto',
    });
    Storage.futureItems = items;
    showToast(State.futureItemType === 'receita' ? '📥 Receita prevista salva!' : '📤 Despesa prevista salva!');
  }

  closeModal('modal-future-item');
  renderProjecaoScreen();
  Render.dashboard();
}

function editFutureItem(id) {
  const item = Storage.futureItems.find(i => i.id === id);
  if (item) showFutureItemModal(item.kind, id);
}

/**
 * Realiza o item: cria a transação real e marca status como 'realizado'.
 * Guarda txId para garantir que não crie duplicatas.
 */
function realizarFutureItem(id) {
  const item = Storage.futureItems.find(i => i.id === id);
  if (!item || item.status === 'realizado') return;

  const tipo  = item.kind === 'receita' ? 'receita' : 'despesa';
  showConfirm(
    item.kind === 'receita' ? '📥' : '📤',
    `Confirmar ${tipo}`,
    `Isso criará um lançamento real de ${Utils.fmt(item.value)} ("${item.desc}") e removerá das previsões.`,
    () => {
      // Previne duplicação: só cria se ainda não tem txId
      if (!item.txId) {
        const txType = item.kind === 'receita' ? 'entrada' : 'saida';
        const newTx  = {
          id: Storage.genId(), type: txType,
          desc: item.desc, value: item.value,
          date: item.dataPrevista <= Utils.today() ? item.dataPrevista : Utils.today(),
          cat:  item.cat || (txType === 'entrada' ? 'salario' : 'outros'),
          pay: 'pix', obs: 'Gerado de item previsto', recurrent: false,
        };
        const txs = Storage.transactions;
        txs.push(newTx);
        Storage.transactions = txs;

        Storage.futureItems = Storage.futureItems.map(i =>
          i.id === id ? { ...i, status: 'realizado', txId: newTx.id } : i
        );
      }
      renderProjecaoScreen();
      Render.historico();
      Render.dashboard();
      showToast(item.kind === 'receita' ? '✅ Receita lançada!' : '✅ Despesa lançada!');
    }
  );
}

function deleteFutureItem(id) {
  showConfirm('🗑️', 'Apagar item previsto', 'Este item previsto será removido permanentemente.', () => {
    Storage.futureItems = Storage.futureItems.filter(i => i.id !== id);
    renderProjecaoScreen();
    Render.dashboard();
    showToast('🗑️ Item removido');
  });
}

// ─── METAS ────────────────────────────────────────────────────────────────────

function showGoalModal(goalId) {
  goalId = goalId || null;
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
    ['goal-name','goal-target','goal-saved','goal-months','goal-monthly'].forEach(id => { document.getElementById(id).value = ''; });
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
  if (!name)       { showToast('⚠️ Informe o nome da meta'); return; }
  if (target <= 0) { showToast('⚠️ Informe o valor alvo');   return; }
  const calc = monthly > 0 ? monthly : Math.ceil(Math.max(0, target - saved) / months);
  let goals  = Storage.goals;
  if (State.editingGoalId !== null) {
    goals = goals.map(g => g.id === State.editingGoalId ? { ...g, name, target, saved: saved||0, months, monthly: calc } : g);
    Storage.goals = goals;
    showToast('✅ Meta atualizada!');
  } else {
    goals.push({ id: Storage.genId(), name, emoji: GOAL_EMOJIS[goals.length % GOAL_EMOJIS.length], target, saved: saved||0, months, monthly: calc, createdAt: Utils.today() });
    Storage.goals = goals;
    showToast('🎯 Meta criada!');
  }
  closeModal('modal-goal');
  Render.metas();
}

function editGoal(id) { showGoalModal(id); }

function deleteGoal(id) {
  const g = Storage.goals.find(g => g.id === id);
  showConfirm('🎯', 'Apagar meta', `A meta "${g?.name || ''}" será removida permanentemente.`, () => {
    Storage.goals = Storage.goals.filter(g => g.id !== id);
    Render.metas();
    Render.dashboard();
    showToast('🗑️ Meta removida');
  });
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────

function saveName() {
  const name = document.getElementById('config-name-input').value.trim();
  if (!name) { showToast('⚠️ Informe seu nome'); return; }
  Storage.user = { ...Storage.user, name };
  Render.configs();
  showToast('✅ Nome salvo!');
}

function exportData() {
  const blob = new Blob([JSON.stringify(Storage.exportAll(), null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `bolsy-backup-${Utils.today()}.json` });
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
      const ids = [
        ...Storage.transactions.map(t => Number(t.id)||0),
        ...Storage.goals.map(g => Number(g.id)||0),
        ...Storage.cards.map(c => Number(c.id)||0),
        ...Storage.futureItems.map(i => Number(i.id)||0),
      ];
      Storage.nextId = Math.max(100, ...ids) + 1;
      showToast('📥 Backup importado!');
      Render.configs();
      Render.dashboard();
    } catch(err) { showToast('❌ Arquivo inválido'); }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function confirmClearData() {
  showConfirm('🗑️', 'Apagar todos os dados', 'Todos os lançamentos, metas e configurações serão removidos. Esta ação não pode ser desfeita.', () => {
    Storage.clearAll();
    State.editingTxId = State.editingGoalId = null;
    showToast('🗑️ Dados apagados');
    Render.dashboard();
    Render.metas();
    Render.configs();
  });
}

// ─── MODALS & TOAST ───────────────────────────────────────────────────────────

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function closeModalOnBackdrop(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

/**
 * showConfirm — sem acumulação de listeners.
 * Clona o botão OK antes de adicionar o listener, garantindo que cada chamada
 * tem exatamente UM listener ativo.
 */
function showConfirm(icon, title, text, onOk) {
  document.getElementById('confirm-icon').textContent  = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-text').textContent  = text;

  const oldBtn = document.getElementById('confirm-ok');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);

  newBtn.addEventListener('click', function handler() {
    newBtn.removeEventListener('click', handler);
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

// ─── MONEY MASK ───────────────────────────────────────────────────────────────

function setupMoneyMask() {
  const main = document.getElementById('input-valor');
  if (main) main.addEventListener('input', () => Utils.applyMoneyMask(main));
  document.querySelectorAll('.money-input').forEach(input => {
    input.addEventListener('input', () => Utils.applyMoneyMask(input));
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

function init() {
  runMigrations();
  State.histMonth = THIS_MONTH;
  State.histYear  = THIS_YEAR;
  Render.dashboard();
  setupMoneyMask();

  document.body.addEventListener('touchmove', e => {
    if (e.target.closest('.screen-scroll') || e.target.closest('.modal-sheet')) return;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      ['modal-goal','modal-confirm','modal-card','modal-future-item'].forEach(closeModal);
  });
}

document.addEventListener('DOMContentLoaded', init);
