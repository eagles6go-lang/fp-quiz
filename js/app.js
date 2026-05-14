const App = (function () {
  const CAT_CLASS = {
    'ライフプランニング': 'life',
    'リスク管理':         'risk',
    '金融資産運用':       'finance',
    'タックスプランニング': 'tax',
    '不動産':             'real',
    '相続・事業承継':     'inherit',
  };
  const LABELS = ['A', 'B', 'C', 'D'];

  let state = {
    grade: null,
    questions: [],
    queue: [],
    queuePos: 0,
    currentQ: null,
    sessionCorrect: 0,
    sessionTotal: 0,
    listGrade: '2kyu',
    filterCat: 'all',
    filterStatus: 'all',
    filteredQs: [],
    history: { '2kyu': {}, '1kyu': {} },
  };

  /* ── localStorage ── */
  function loadHistory() {
    try {
      const raw = localStorage.getItem('fp_history');
      if (raw) state.history = JSON.parse(raw);
    } catch (e) {}
    if (!state.history['2kyu']) state.history['2kyu'] = {};
    if (!state.history['1kyu']) state.history['1kyu'] = {};
  }
  function saveHistory() {
    localStorage.setItem('fp_history', JSON.stringify(state.history));
  }
  function recordAnswer(grade, id, isCorrect) {
    const h = state.history[grade];
    if (!h[id]) h[id] = { attempts: 0, correct: 0, last: null };
    h[id].attempts++;
    if (isCorrect) h[id].correct++;
    h[id].last = isCorrect ? 'correct' : 'wrong';
    saveHistory();
  }

  /* ── 画面遷移 ── */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ── ホーム ── */
  function init() {
    loadHistory();
    updateHomeInfo();
  }
  function updateHomeInfo() {
    ['2kyu', '1kyu'].forEach(g => {
      const qs = g === '2kyu' ? QUESTIONS_2KYU : QUESTIONS_1KYU;
      const h = state.history[g];
      const total = qs.length;
      const answered = qs.filter(q => h[q.id]).length;
      const correct = qs.filter(q => h[q.id] && h[q.id].last === 'correct').length;
      const el = document.getElementById('info-' + g);
      if (!el) return;
      if (answered === 0) {
        el.textContent = `全${total}問`;
      } else {
        const pct = Math.round(correct / answered * 100);
        el.textContent = `${answered}/${total}問 正解率${pct}%`;
      }
    });
  }

  /* ── クイズ開始 ── */
  function startQuiz(grade, customQs) {
    state.grade = grade;
    state.questions = customQs || (grade === '2kyu' ? QUESTIONS_2KYU : QUESTIONS_1KYU);
    state.sessionCorrect = 0;
    state.sessionTotal = 0;
    shuffle();
    const lbl = grade === '2kyu' ? '2級' : '1級';
    document.getElementById('quiz-grade-label').textContent = lbl;
    document.getElementById('result-grade-label').textContent = lbl;
    showScreen('screen-quiz');
    displayQuestion();
  }
  function shuffle() {
    const len = state.questions.length;
    state.queue = Array.from({ length: len }, (_, i) => i);
    for (let i = len - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
    }
    state.queuePos = 0;
  }

  /* ── 問題表示 ── */
  function displayQuestion() {
    if (state.queuePos >= state.queue.length) shuffle();
    const q = state.questions[state.queue[state.queuePos]];
    state.currentQ = q;

    const total = state.questions.length;
    const pos = state.queuePos + 1;
    document.getElementById('quiz-progress').textContent = `${pos} / ${total}`;
    document.getElementById('progress-fill').style.width = `${(pos / total) * 100}%`;

    const catEl = document.getElementById('q-category');
    catEl.textContent = q.category;
    catEl.className = 'cat-tag cat-' + (CAT_CLASS[q.category] || 'other');

    document.getElementById('q-num').textContent = `Q${state.queue[state.queuePos] + 1}`;
    document.getElementById('q-text').textContent = q.question;

    const choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = '';
    q.choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-label">${LABELS[i]}</span><span class="choice-text">${c}</span>`;
      btn.addEventListener('click', () => handleAnswer(i));
      choicesEl.appendChild(btn);
    });
  }

  /* ── 回答処理 ── */
  function handleAnswer(selected) {
    const q = state.currentQ;
    const correct = selected === q.answer;
    state.sessionTotal++;
    if (correct) state.sessionCorrect++;
    recordAnswer(state.grade, q.id, correct);
    showResult(q, selected, correct);
  }

  /* ── 結果表示 ── */
  function showResult(q, selected, correct) {
    const judgeEl = document.getElementById('judge-area');
    judgeEl.innerHTML = correct
      ? `<div class="judge-circle ok">○</div><div class="judge-label ok">正解！</div>`
      : `<div class="judge-circle ng">×</div><div class="judge-label ng">不正解</div>`;

    document.getElementById('result-q-text').textContent = q.question;

    const rcEl = document.getElementById('result-choices');
    rcEl.innerHTML = '';
    q.choices.forEach((c, i) => {
      const div = document.createElement('div');
      let cls = 'result-choice';
      if (i === q.answer) cls += ' is-correct';
      if (i === selected && !correct) cls += ' is-wrong';
      div.className = cls;
      div.innerHTML = `<span class="choice-label">${LABELS[i]}</span><span class="choice-text">${c}</span>${i === q.answer ? '<span class="correct-mark">✓</span>' : ''}`;
      rcEl.appendChild(div);
    });

    document.getElementById('exp-text').textContent = q.explanation;

    const refBtn = document.getElementById('ref-btn');
    document.getElementById('ref-text').textContent = q.reference.text;
    refBtn.href = q.reference.url;
    refBtn.style.display = q.reference.url ? 'flex' : 'none';

    document.getElementById('session-score').textContent =
      `${state.sessionCorrect} / ${state.sessionTotal} 正解`;

    showScreen('screen-result');
  }

  /* ── 次の問題 ── */
  function nextQuestion() {
    state.queuePos++;
    showScreen('screen-quiz');
    displayQuestion();
  }

  /* ── ホームへ ── */
  function confirmHome() {
    if (state.sessionTotal > 0) {
      document.getElementById('overlay').style.display = 'block';
      document.getElementById('dialog').style.display = 'block';
    } else {
      goHome();
    }
  }
  function closeDialog() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('dialog').style.display = 'none';
  }
  function goHome() {
    closeDialog();
    updateHomeInfo();
    showScreen('screen-home');
  }

  /* ── 問題一覧 ── */
  function showList() {
    state.listGrade = '2kyu';
    renderListGradeTabs();
    renderStats();
    applyFilters();
    showScreen('screen-list');
  }
  function switchListGrade(g) {
    state.listGrade = g;
    document.getElementById('filter-cat').value = 'all';
    document.getElementById('filter-status').value = 'all';
    state.filterCat = 'all';
    state.filterStatus = 'all';
    renderListGradeTabs();
    renderStats();
    applyFilters();
  }
  function renderListGradeTabs() {
    document.getElementById('tab-2kyu').classList.toggle('active', state.listGrade === '2kyu');
    document.getElementById('tab-1kyu').classList.toggle('active', state.listGrade === '1kyu');
  }
  function renderStats() {
    const qs = state.listGrade === '2kyu' ? QUESTIONS_2KYU : QUESTIONS_1KYU;
    const h = state.history[state.listGrade];
    const total = qs.length;
    const answered = qs.filter(q => h[q.id]).length;
    const correct = qs.filter(q => h[q.id] && h[q.id].last === 'correct').length;
    const wrong = qs.filter(q => h[q.id] && h[q.id].last === 'wrong').length;
    const unanswered = total - answered;

    const area = document.getElementById('stats-area');
    const CATS = Object.keys(CAT_CLASS);
    let catHtml = CATS.map(cat => {
      const cqs = qs.filter(q => q.category === cat);
      const ca = cqs.filter(q => h[q.id]).length;
      const cc = cqs.filter(q => h[q.id] && h[q.id].last === 'correct').length;
      const pct = ca > 0 ? Math.round(cc / ca * 100) : 0;
      const cls = CAT_CLASS[cat];
      return `<div class="cat-card cat-${cls}">
        <div class="cat-name">${cat}</div>
        <div class="cat-nums">${cc} / ${cqs.length}</div>
        <div class="cat-pct-bar"><div class="cat-pct-fill" style="width:${ca > 0 ? pct : 0}%"></div></div>
        <div class="cat-pct-text">${ca > 0 ? pct + '%' : '未回答'}</div>
      </div>`;
    }).join('');

    area.innerHTML = `
      <div class="stats-total">
        <div class="stat-box"><div class="stat-n">${total}</div><div class="stat-l">総問題数</div></div>
        <div class="stat-box"><div class="stat-n">${answered}</div><div class="stat-l">回答済</div></div>
        <div class="stat-box"><div class="stat-n ok">${correct}</div><div class="stat-l">正解</div></div>
        <div class="stat-box"><div class="stat-n ng">${wrong}</div><div class="stat-l">不正解</div></div>
      </div>
      <div class="cat-grid">${catHtml}</div>`;
  }
  function applyFilters() {
    state.filterCat = document.getElementById('filter-cat').value;
    state.filterStatus = document.getElementById('filter-status').value;
    const qs = state.listGrade === '2kyu' ? QUESTIONS_2KYU : QUESTIONS_1KYU;
    const h = state.history[state.listGrade];
    const filtered = qs.filter(q => {
      if (state.filterCat !== 'all' && q.category !== state.filterCat) return false;
      const entry = h[q.id];
      if (state.filterStatus === 'correct' && (!entry || entry.last !== 'correct')) return false;
      if (state.filterStatus === 'wrong' && (!entry || entry.last !== 'wrong')) return false;
      if (state.filterStatus === 'unanswered' && entry) return false;
      return true;
    });
    state.filteredQs = filtered;
    renderQList(filtered);
    const wrap = document.getElementById('practice-btn-wrap');
    if (filtered.length > 0 && (state.filterCat !== 'all' || state.filterStatus !== 'all')) {
      wrap.style.display = 'block';
      document.getElementById('btn-practice').textContent = `この ${filtered.length} 問を練習する`;
    } else {
      wrap.style.display = 'none';
    }
  }
  function renderQList(qs) {
    const h = state.history[state.listGrade];
    const container = document.getElementById('q-list');
    container.innerHTML = '';
    if (qs.length === 0) {
      container.innerHTML = '<div class="q-empty">該当する問題がありません</div>';
      return;
    }
    qs.forEach(q => {
      const entry = h[q.id];
      let stCls = 'na', stIcon = '－';
      if (entry) {
        stCls = entry.last === 'correct' ? 'ok' : 'ng';
        stIcon = entry.last === 'correct' ? '○' : '×';
      }
      const attText = entry ? `<span class="q-attempts">${entry.attempts}回</span>` : '';
      const preview = q.question.length > 52 ? q.question.slice(0, 52) + '…' : q.question;
      const item = document.createElement('div');
      item.className = 'q-item';
      item.innerHTML = `
        <div class="q-status-icon ${stCls}">${stIcon}</div>
        <div class="q-info">
          <div><span class="cat-tag cat-${CAT_CLASS[q.category] || 'other'}">${q.category}</span>${attText}</div>
          <div class="q-preview">${preview}</div>
        </div>
        <div class="q-arrow">›</div>`;
      item.addEventListener('click', () => startSingleQuestion(q));
      container.appendChild(item);
    });
  }
  function startSingleQuestion(q) {
    state.grade = state.listGrade;
    state.questions = [q];
    state.sessionCorrect = 0;
    state.sessionTotal = 0;
    state.queue = [0];
    state.queuePos = 0;
    const lbl = state.grade === '2kyu' ? '2級' : '1級';
    document.getElementById('quiz-grade-label').textContent = lbl;
    document.getElementById('result-grade-label').textContent = lbl;
    showScreen('screen-quiz');
    displayQuestion();
  }
  function startFilteredPractice() {
    startQuiz(state.listGrade, state.filteredQs);
  }

  return {
    init, startQuiz, nextQuestion,
    confirmHome, closeDialog, goHome,
    showList, switchListGrade, applyFilters,
    startFilteredPractice,
  };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
