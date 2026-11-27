import { quizData, QUIZ_CATEGORIES } from './data.js';
import { initTouchInteractions } from './touchHandler.js';

const SHARE_BASE_URL = 'https://notopened.com/quiz/';
const STORAGE_KEY = 'notopened.quiz.progress.v1';
const DAILY_KEY = 'notopened.quiz.daily.v1';
const ROUND_SIZE = 5;
const CYCLE_SIZE = quizData.length;

const progress = loadProgress();
const activeCategory = resolveCategory();
const dailyMode = resolveDailyMode();
const dailyDate = kstDateKey();
let round = [];
let roundCycleReset = false;
let currentIdx = 0;
let score = 0;
let answered = false;
let wrongAnswers = [];

/* ---------------------------------------------------------------- 상태 저장 */

function emptyProgress() {
  return {
    solved: [],
    cycle: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    bestScore: 0,
    bestRound: 0,
    streakDays: 0,
    lastPlayDate: null,
    wrongByCat: {}
  };
}

function sanitizeWrongByCat(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  QUIZ_CATEGORIES.forEach((c) => {
    const n = Math.floor(Number(raw[c.slug]) || 0);
    if (n > 0) out[c.slug] = Math.min(n, 999);
  });
  return out;
}

function weakestCategory() {
  const entries = Object.entries(progress.wrongByCat || {});
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { slug: entries[0][0], count: entries[0][1] };
}

function loadProgress() {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) || {};
    const validIds = new Set(quizData.map(q => q.id));
    return {
      solved: Array.isArray(saved.solved) ? [...new Set(saved.solved.filter(id => validIds.has(id)))] : [],
      cycle: Number(saved.cycle) >= 1 ? Math.floor(Number(saved.cycle)) : 1,
      totalAnswered: Math.max(0, Math.floor(Number(saved.totalAnswered) || 0)),
      totalCorrect: Math.max(0, Math.floor(Number(saved.totalCorrect) || 0)),
      bestScore: Math.max(0, Math.floor(Number(saved.bestScore) || 0)),
      bestRound: Math.max(0, Math.floor(Number(saved.bestRound) || 0)),
      streakDays: Math.max(0, Math.floor(Number(saved.streakDays) || 0)),
      lastPlayDate: typeof saved.lastPlayDate === 'string' ? saved.lastPlayDate : null,
      wrongByCat: sanitizeWrongByCat(saved.wrongByCat)
    };
  } catch (e) {
    return base;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) { /* 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 퀴즈는 계속 진행 */ }
}

/* ------------------------------------------------------------ 날짜 · 연속 일수 */

function localDateKey(d) {
  const t = d || new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function daysBetween(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

function touchStreak() {
  const today = localDateKey();
  if (progress.lastPlayDate === today) return;
  if (progress.lastPlayDate && daysBetween(progress.lastPlayDate, today) === 1) {
    progress.streakDays = Math.max(1, progress.streakDays) + 1;
  } else {
    progress.streakDays = 1;
  }
  progress.lastPlayDate = today;
}

/* --------------------------------------------- 오늘의 챌린지 (날짜 시드 고정 출제) */

function kstDateKey() {
  const now = new Date();
  const kst = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 9 * 3600000);
  return localDateKey(kst);
}

function kstDateLabel(key) {
  const parts = String(key).split('-').map(Number);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getUTCDay()];
  return `${parts[1]}월 ${parts[2]}일 (${weekday})`;
}

function resolveDailyMode() {
  try {
    const raw = (new URLSearchParams(window.location.search).get('daily') || '').trim().toLowerCase();
    return raw === '1' || raw === 'true' || raw === 'today';
  } catch (e) {
    return false;
  }
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 같은 KST 날짜에는 모든 방문자에게 같은 5문항이 나온다. */
function dailyQuestionList(key) {
  const rnd = mulberry32(hashString(`notopened.quiz.daily.${key}`));
  const pool = quizData.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(ROUND_SIZE, pool.length));
}

function loadDailyRecord() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function todayDailyEntry() {
  const entry = loadDailyRecord()[dailyDate];
  return entry && typeof entry === 'object' ? entry : null;
}

function dateKeyFromUtc(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function shiftDateKey(key, days) {
  const parts = String(key).split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  d.setUTCDate(d.getUTCDate() + days);
  return dateKeyFromUtc(d);
}

/* 오늘(아직 안 풀었으면 어제)부터 거슬러 올라가며 연속 참여 일수를 센다. */
function dailyParticipationStreak() {
  const map = loadDailyRecord();
  let key = (map[dailyDate] && typeof map[dailyDate].score === 'number') ? dailyDate : shiftDateKey(dailyDate, -1);
  let days = 0;
  while (days < 400) {
    const entry = map[key];
    if (!entry || typeof entry.score !== 'number') break;
    days++;
    key = shiftDateKey(key, -1);
  }
  return days;
}

function saveDailyResult() {
  try {
    const map = loadDailyRecord();
    map[dailyDate] = { score, total: round.length, at: new Date().toISOString() };
    const keys = Object.keys(map).sort();
    while (keys.length > 120) delete map[keys.shift()];
    localStorage.setItem(DAILY_KEY, JSON.stringify(map));
  } catch (e) { /* 사생활 보호 모드에서는 기록만 건너뜀 */ }
}

function renderDailyCard() {
  const card = document.getElementById('dailyCard');
  if (!card) return;
  if (dailyMode) { card.hidden = true; return; }
  card.hidden = false;
  const dateEl = document.getElementById('dailyDate');
  const descEl = document.getElementById('dailyDesc');
  const startEl = document.getElementById('dailyStart');
  const rec = todayDailyEntry();
  if (dateEl) dateEl.textContent = kstDateLabel(dailyDate);
  const done = !!(rec && typeof rec.score === 'number');
  card.classList.toggle('done', done);
  if (descEl) {
    descEl.textContent = done
      ? `오늘 기록 ${rec.score} / ${rec.total}점. 다시 풀어 기록을 갱신할 수 있습니다.`
      : '매일 자정에 바뀌는 5문항. 같은 날에는 누구에게나 같은 문제가 나옵니다.';
  }
  if (startEl) startEl.textContent = done ? '오늘의 5문항 다시 풀기 →' : '오늘의 5문항 시작 →';
  const streakEl = document.getElementById('dailyStreak');
  if (streakEl) {
    const streak = dailyParticipationStreak();
    const tomorrow = kstDateLabel(shiftDateKey(dailyDate, 1));
    streakEl.hidden = false;
    streakEl.innerHTML = streak > 0
      ? `🔥 오늘의 챌린지 <strong>${streak}일 연속</strong> 참여 중 · 내일(${tomorrow}) 0시에 새 5문항`
      : `내일(${tomorrow}) 0시에 새 5문항이 열립니다`;
  }
}

function setupDailyMode() {
  if (!dailyMode) return;
  const nav = document.querySelector('.cat-nav');
  if (nav) nav.style.display = 'none';
  const notice = document.getElementById('filterNotice');
  if (notice) notice.hidden = true;
  const sub = document.querySelector('header[role="banner"] p');
  if (sub) sub.textContent = `${kstDateLabel(dailyDate)} · 오늘의 5문항 챌린지 (매일 자정 갱신)`;
  document.title = `${kstDateLabel(dailyDate)} 오늘의 챌린지 · notopened 1일 1상식 두뇌 퀴즈`;
}

/* ------------------------------------------------------------------ 주제 · 풀 */

function resolveCategory() {
  try {
    const cat = (new URLSearchParams(window.location.search).get('cat') || '').trim().toLowerCase();
    return QUIZ_CATEGORIES.some(c => c.slug === cat) ? cat : null;
  } catch (e) {
    return null;
  }
}

function categoryLabel(slug) {
  const found = QUIZ_CATEGORIES.find(c => c.slug === slug);
  return found ? found.label : '';
}

function currentPool() {
  return activeCategory ? quizData.filter(q => q.slug === activeCategory) : quizData.slice();
}

function solvedCountInPool() {
  const pool = currentPool();
  const solved = new Set(progress.solved);
  return pool.filter(q => solved.has(q.id)).length;
}

function unsolvedInPool() {
  const solved = new Set(progress.solved);
  return currentPool().filter(q => !solved.has(q.id));
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startRound() {
  roundCycleReset = false;
  wrongAnswers = [];
  if (dailyMode) {
    round = dailyQuestionList(dailyDate);
    currentIdx = 0;
    score = 0;
    answered = false;
    return;
  }
  const pool = currentPool();
  if (pool.length === 0) {
    round = [];
    currentIdx = 0;
    score = 0;
    answered = false;
    return;
  }
  let unsolved = unsolvedInPool();

  if (unsolved.length === 0) {
    // 풀을 모두 소진 → 푼 기록을 초기화하고 새 순환 시작
    if (activeCategory) {
      const ids = new Set(pool.map(q => q.id));
      progress.solved = progress.solved.filter(id => !ids.has(id));
    } else {
      progress.solved = [];
      progress.cycle += 1;
    }
    unsolved = pool.slice();
    roundCycleReset = true;
  }

  round = shuffle(unsolved).slice(0, Math.min(ROUND_SIZE, unsolved.length));
  currentIdx = 0;
  score = 0;
  answered = false;
  saveProgress();
}

function cycleResetMessage() {
  return activeCategory
    ? `‘${categoryLabel(activeCategory)}’ 문항을 모두 완주! 이 주제의 새 순환을 시작합니다`
    : `모든 ${CYCLE_SIZE}문항 완주! 새 순환을 시작합니다`;
}

/* -------------------------------------------------------------------- 화면 */

export function initApp() {
  initTouchInteractions();
  renderCatChips();
  setCategoryMeta();
  setupDailyMode();
  startRound();
  renderQuestion();
  renderStats();
  renderFilterNotice();
  renderDailyCard();
  setupEventListeners();

  if (roundCycleReset) {
    setTimeout(() => showToast(cycleResetMessage()), 400);
  }
}

function setCategoryMeta() {
  if (!activeCategory) return;
  const label = categoryLabel(activeCategory);
  document.title = `${label} · notopened 1일 1상식 두뇌 퀴즈`;
}

function renderCatChips() {
  const wrap = document.getElementById('catChips');
  if (!wrap) return;
  const chips = QUIZ_CATEGORIES.map(c => {
    const active = c.slug === activeCategory;
    const count = quizData.filter(q => q.slug === c.slug).length;
    return `<a class="cat-chip${active ? ' active' : ''}" href="?cat=${c.slug}"${active ? ' aria-current="true"' : ''}>`
      + `${c.label}<span class="cat-chip-count">${count}</span></a>`;
  });
  if (activeCategory) {
    chips.unshift('<a class="cat-chip cat-chip-all" href="./">전체</a>');
  }
  wrap.innerHTML = chips.join('');
}

function renderFilterNotice() {
  const box = document.getElementById('filterNotice');
  if (!box) return;
  if (!activeCategory) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  const remaining = unsolvedInPool().length;
  box.hidden = false;
  box.innerHTML = `<span class="filter-tag">주제 · ${categoryLabel(activeCategory)}</span>`
    + `<span class="filter-sub">이 주제 ${currentPool().length}문항 · 미풀이 ${remaining}문항</span>`
    + '<a class="filter-link" href="./">전체 주제로 보기 →</a>';
}

function renderStats() {
  const bar = document.getElementById('statsBar');
  if (!bar) return;
  const pool = currentPool();
  const solved = solvedCountInPool();
  const pills = [];

  if (progress.streakDays > 0) {
    pills.push(`<span class="stat-pill">🔥 연속 <strong>${progress.streakDays}일</strong></span>`);
  }
  if (progress.totalAnswered > 0) {
    pills.push(`<span class="stat-pill">📚 누적 <strong>${progress.totalAnswered}문제</strong></span>`);
  }
  if (progress.bestRound > 0) {
    pills.push(`<span class="stat-pill">🏆 최고 <strong>${progress.bestScore}/${progress.bestRound}</strong></span>`);
  }
  pills.push(`<span class="stat-pill">🎯 ${activeCategory ? '이 주제' : '이번 순환'} <strong>${solved}/${pool.length}</strong></span>`);

  const weak = weakestCategory();
  if (weak) {
    pills.push(`<a class="stat-pill stat-pill-weak" href="?cat=${weak.slug}">🎯 약점 ${escapeHtml(categoryLabel(weak.slug))} <strong>${weak.count}</strong></a>`);
  }

  bar.innerHTML = pills.join('');
  bar.hidden = false;
}

function renderEmptyRound() {
  const categoryElem = document.getElementById('categoryText');
  const counterElem = document.getElementById('counterText');
  const questionElem = document.getElementById('questionText');
  const grid = document.getElementById('optionsGrid');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');
  const expBox = document.getElementById('explanationBox');
  const nextBtn = document.getElementById('nextBtn');

  if (categoryElem) categoryElem.textContent = '안내';
  if (counterElem) counterElem.textContent = '0 / 0';
  if (questionElem) questionElem.textContent = '지금 풀 수 있는 문항이 없습니다. 위에서 다른 주제를 골라 주세요.';
  if (grid) grid.innerHTML = '';
  if (progressFill) progressFill.style.width = '0%';
  if (progressBar) progressBar.setAttribute('aria-valuenow', '0');
  if (expBox) expBox.className = 'explanation-box';
  if (nextBtn) nextBtn.className = 'next-btn';
}

function renderQuestion() {
  answered = false;
  const q = round[currentIdx];
  if (!q) {
    renderEmptyRound();
    return;
  }

  const categoryElem = document.getElementById('categoryText');
  const counterElem = document.getElementById('counterText');
  const questionElem = document.getElementById('questionText');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');

  if (categoryElem) categoryElem.textContent = q.category;
  if (counterElem) counterElem.textContent = `${currentIdx + 1} / ${round.length}`;
  if (questionElem) questionElem.textContent = q.question;
  if (progressFill) progressFill.style.width = `${((currentIdx + 1) / round.length) * 100}%`;
  if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round(((currentIdx + 1) / round.length) * 100)));

  const expBox = document.getElementById('explanationBox');
  const nextBtn = document.getElementById('nextBtn');
  if (expBox) expBox.className = 'explanation-box';
  if (nextBtn) nextBtn.className = 'next-btn';

  const grid = document.getElementById('optionsGrid');
  if (grid) {
    grid.innerHTML = '';
    (q.options || []).forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', `선택지 ${idx + 1}: ${opt}`);
      btn.textContent = opt;
      btn.onclick = () => selectOption(idx);
      grid.appendChild(btn);
    });
  }

  const quizCard = document.getElementById('quizCard');
  if (quizCard) quizCard.style.display = 'block';
}

function selectOption(selectedIdx) {
  if (answered) return;
  answered = true;

  const q = round[currentIdx];
  if (!q) return;
  const buttons = document.querySelectorAll('.option-btn');
  const isCorrect = (selectedIdx === q.answer);

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer) {
      btn.classList.add('correct');
    } else if (idx === selectedIdx) {
      btn.classList.add('wrong');
    }
  });

  if (isCorrect) score++;
  if (isCorrect && progress.wrongByCat[q.slug]) {
    progress.wrongByCat[q.slug] = Math.max(0, progress.wrongByCat[q.slug] - 1);
    if (!progress.wrongByCat[q.slug]) delete progress.wrongByCat[q.slug];
  }
  if (!isCorrect) {
    progress.wrongByCat[q.slug] = Math.min(999, (progress.wrongByCat[q.slug] || 0) + 1);
    wrongAnswers.push({
      id: q.id,
      slug: q.slug,
      category: q.category,
      question: q.question,
      chosen: (q.options || [])[selectedIdx] || '',
      answer: (q.options || [])[q.answer] || '',
      explanation: q.explanation,
      source: q.source
    });
  }

  // 재방문 기록: 푼 문항 ID · 누적 풀이 · 연속 도전 일수
  if (!progress.solved.includes(q.id)) progress.solved.push(q.id);
  progress.totalAnswered += 1;
  if (isCorrect) progress.totalCorrect += 1;
  touchStreak();
  saveProgress();
  renderStats();
  renderFilterNotice();

  const expBox = document.getElementById('explanationBox');
  const expResult = document.getElementById('expResult');
  const expText = document.getElementById('expText');

  if (expResult) {
    expResult.textContent = isCorrect ? '✅ 정답' : '❌ 오답';
    expResult.style.color = isCorrect ? 'var(--correct)' : 'var(--wrong)';
  }
  if (expText) expText.textContent = `${q.explanation} [출처: ${q.source}]`;
  if (expBox) expBox.classList.add('show');

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.textContent = (currentIdx === round.length - 1) ? '결과 보기' : '다음 문제로';
    nextBtn.classList.add('show');
    setTimeout(() => {
      try {
        nextBtn.focus();
      } catch (e) { /* 포커스 실패는 무시 */ }
    }, 200);
  }
}

export function nextQuestion() {
  if (currentIdx < round.length - 1) {
    currentIdx++;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  if (!round.length) return;
  const quizCard = document.getElementById('quizCard');
  const resultCard = document.getElementById('resultCard');
  if (quizCard) quizCard.style.display = 'none';
  if (resultCard) {
    resultCard.classList.add('show');
    try {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { /* 구버전 브라우저는 무시 */ }
  }

  const finalScoreElem = document.getElementById('finalScore');
  if (finalScoreElem) finalScoreElem.textContent = score;
  const finalTotalElem = document.getElementById('scoreTotal');
  if (finalTotalElem) finalTotalElem.textContent = `/ ${round.length} 점`;

  const rankTitle = document.getElementById('rankTitle');
  const rankDesc = document.getElementById('rankDesc');
  const full = round.length;

  if (score === full) {
    if (rankTitle) rankTitle.textContent = '🏆 0.1% 상식 브레인 마스터!';
    if (rankDesc) rankDesc.textContent = '이번 세트를 모두 완벽하게 맞추셨습니다. 상식 내공이 대단합니다!';
  } else if (score / full >= 0.6) {
    if (rankTitle) rankTitle.textContent = '🥈 스마트한 상식 탐험가!';
    if (rankDesc) rankDesc.textContent = '뛰어난 상식 감각을 가지고 계십니다. 다음 세트도 도전해보세요!';
  } else {
    if (rankTitle) rankTitle.textContent = '🥉 상식 호기심 가득한 루키!';
    if (rankDesc) rankDesc.textContent = '새로운 지식을 채우는 재미를 느껴보세요. 다음 세트도 도전!';
  }

  // 최고 점수 갱신 (세트 정답률 기준)
  const rate = full ? score / full : 0;
  const bestRate = progress.bestRound ? progress.bestScore / progress.bestRound : -1;
  if (rate > bestRate) {
    progress.bestScore = score;
    progress.bestRound = full;
  }
  const prevDaily = dailyMode ? todayDailyEntry() : null;
  saveProgress();
  renderStats();
  renderResultStats();
  if (dailyMode) saveDailyResult();
  renderDailyBox(prevDaily);
  renderWrongNotes();
}

function renderDailyBox(prevEntry) {
  const box = document.getElementById('dailyResult');
  if (!box) return;
  if (!dailyMode) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  const prevScore = prevEntry && typeof prevEntry.score === 'number' ? prevEntry.score : null;
  const bestToday = prevScore === null ? score : Math.max(prevScore, score);
  const note = prevScore === null
    ? '오늘 첫 기록을 남겼습니다!'
    : (score > prevScore ? `오늘 기록 ${prevScore}점 → ${score}점 갱신!` : `오늘 최고 ${bestToday}점`);
  const streak = dailyParticipationStreak();
  box.hidden = false;
  box.innerHTML = `<span class="daily-result-label">📅 ${kstDateLabel(dailyDate)} 오늘의 챌린지</span>`
    + `<span class="daily-result-score">${score} / ${round.length}점</span>`
    + `<span class="daily-result-note">${note}${streak > 1 ? ` · 🔥 ${streak}일 연속 참여` : ''}</span>`
    + `<span class="daily-result-next">내일(${kstDateLabel(shiftDateKey(dailyDate, 1))}) 0시에 새 5문항이 열립니다</span>`;
}

function escapeHtml(text) {
  return String(text === undefined || text === null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderWrongNotes() {
  const box = document.getElementById('wrongNotes');
  if (!box) return;
  box.hidden = false;
  if (!wrongAnswers.length) {
    box.innerHTML = '<div class="wrong-head"><strong>🗒️ 오답 노트</strong><span class="wrong-empty">이번 세트는 모두 정답! 틀린 문항이 없습니다 🎉</span></div>';
    return;
  }

  const byCat = {};
  wrongAnswers.forEach((w) => { byCat[w.slug] = (byCat[w.slug] || 0) + 1; });
  const weakSlug = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])[0];

  const items = wrongAnswers.map((w, i) => {
    return `<details class="wrong-item"><summary><span class="wrong-no">${i + 1}</span><span class="wrong-q">${escapeHtml(w.question)}</span><span class="wrong-toggle" aria-hidden="true">펼치기</span></summary>`
      + `<div class="wrong-body">`
      + `<p class="wrong-cat">${escapeHtml(w.category)}</p>`
      + `<p class="wrong-answer">내 선택: <span class="wrong-mine">${escapeHtml(w.chosen)}</span> · 정답: <strong>${escapeHtml(w.answer)}</strong></p>`
      + `<p class="wrong-exp">${escapeHtml(w.explanation)}</p>`
      + `<p class="wrong-source">[출처: ${escapeHtml(w.source)}]</p>`
      + '</div></details>';
  }).join('');

  const retry = weakSlug
    ? `<a class="wrong-retry" href="?cat=${weakSlug}">🎯 약점 주제 ‘${escapeHtml(categoryLabel(weakSlug))}’ ${byCat[weakSlug]}문항 틀림 · 이 주제로 재도전 →</a>`
    : '';

  box.innerHTML = `<div class="wrong-head"><strong>🗒️ 오답 노트</strong><span class="wrong-sub">틀린 ${wrongAnswers.length}문항의 해설을 펼쳐 보세요</span></div>`
    + items + retry;
}

function renderResultStats() {
  const box = document.getElementById('resultStats');
  const pool = currentPool();
  const solved = solvedCountInPool();
  const remaining = pool.length - solved;
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  if (box) {
    const cycleLabel = dailyMode ? '📅 오늘의 챌린지' : `🎯 ${activeCategory ? '이 주제' : '이번 순환'}`;
    const cycleValue = dailyMode ? `${score} / ${round.length}점` : `${solved} / ${pool.length}문항`;
    box.innerHTML = `
      <div class="result-stat"><span class="k">🔥 연속 도전</span><span class="v">${progress.streakDays}일</span></div>
      <div class="result-stat"><span class="k">📚 누적 풀이</span><span class="v">${progress.totalAnswered}문제 · ${accuracy}%</span></div>
      <div class="result-stat"><span class="k">🏆 최고 점수</span><span class="v">${progress.bestScore} / ${progress.bestRound}</span></div>
      <div class="result-stat"><span class="k">${cycleLabel}</span><span class="v">${cycleValue}</span></div>
    `;
  }

  const nextSetBtn = document.getElementById('nextSetBtn');
  const freeLink = document.getElementById('dailyFreeLink');
  if (freeLink) freeLink.style.display = dailyMode ? 'block' : 'none';
  if (nextSetBtn) {
    nextSetBtn.style.display = dailyMode ? 'none' : 'block';
    if (remaining === 0) {
      nextSetBtn.textContent = activeCategory
        ? `✨ ‘${categoryLabel(activeCategory)}’ 새 순환 시작하기`
        : `✨ 새 순환 시작하기 (${CYCLE_SIZE}문항)`;
    } else {
      nextSetBtn.textContent = `⚡ 다음 미풀이 ${Math.min(ROUND_SIZE, remaining)}문항 도전 (남은 ${remaining}문항)`;
    }
  }

  const banner = document.getElementById('completionBanner');
  if (banner) {
    if (dailyMode) {
      banner.hidden = true;
      banner.textContent = '';
    } else if (remaining === 0) {
      banner.hidden = false;
      banner.textContent = activeCategory
        ? `🎉 ‘${categoryLabel(activeCategory)}’ 문항을 모두 풀었습니다. 다음 세트에서 새 순환이 시작됩니다.`
        : `🎉 모든 ${CYCLE_SIZE}문항 완주! 다음 세트에서 새 순환이 시작됩니다.`;
    } else {
      banner.hidden = true;
      banner.textContent = '';
    }
  }
}

export function restartQuiz() {
  currentIdx = 0;
  score = 0;
  answered = false;
  const resultCard = document.getElementById('resultCard');
  const quizCard = document.getElementById('quizCard');
  if (resultCard) resultCard.classList.remove('show');
  if (quizCard) {
    quizCard.style.display = 'block';
    try {
      quizCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { /* 구버전 브라우저는 무시 */ }
  }
  renderQuestion();
  renderStats();
}

export function nextRoundSet() {
  startRound();
  restartQuiz();
  renderFilterNotice();
  if (roundCycleReset) {
    showToast(cycleResetMessage());
  } else {
    showToast(`아직 풀지 않은 ${round.length}문항으로 새 세트를 시작합니다!`);
  }
}

/* -------------------------------------------------------------------- 공유 */

const RESULT_IMAGE_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif';

function shareUrl() {
  return activeCategory ? `${SHARE_BASE_URL}?cat=${activeCategory}` : SHARE_BASE_URL;
}

function resultComment() {
  const desc = document.getElementById('rankDesc');
  const title = document.getElementById('rankTitle');
  const text = (desc && desc.textContent.trim()) || (title && title.textContent.trim());
  return text || '오늘의 상식 한 판을 마쳤습니다.';
}

function sharePayload() {
  const rankTitleElem = document.getElementById('rankTitle');
  const rank = rankTitleElem ? rankTitleElem.textContent : '상식 퀴즈 도전자';
  const url = dailyMode ? `${SHARE_BASE_URL}?daily=1` : shareUrl();
  const streakLine = progress.streakDays > 1 ? `\n🔥 연속 ${progress.streakDays}일째 도전 중!` : '';
  const head = dailyMode
    ? `[notopened 상식 퀴즈] ${kstDateLabel(dailyDate)} 오늘의 챌린지 — ${round.length}문제 중 ${score}문제를 맞췄습니다!`
    : `[notopened 상식 퀴즈] ${round.length}문제 중 ${score}문제를 맞췄습니다!`;
  const tag = dailyMode ? '#notopened #상식퀴즈 #오늘의챌린지' : '#notopened #상식퀴즈';
  return {
    title: dailyMode ? `${kstDateLabel(dailyDate)} 오늘의 상식 챌린지` : 'notopened 1일 1상식 두뇌 퀴즈',
    url,
    comment: resultComment(),
    dateLabel: dailyMode ? `${kstDateLabel(dailyDate)} 오늘의 챌린지` : '',
    nativeShareText: `${head}\n나의 등급: ${rank}${streakLine}\n지금 바로 도전해보세요! ${tag}`,
    clipboardShareText: `${head}\n나의 등급: ${rank}${streakLine}\n도전하기 👉 ${url}\n${tag}`
  };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawResultImage(ctx, scoreValue, total, comment, dateLabel) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1080, 1350);

  const glow = ctx.createRadialGradient(540, 80, 20, 540, 180, 640);
  glow.addColorStop(0, 'rgba(250, 204, 21, 0.18)');
  glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);

  roundRectPath(ctx, 72, 150, 936, 1050, 48);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  const logo = 84;
  ctx.font = `700 52px ${RESULT_IMAGE_FONT}`;
  const name = 'notopened';
  const nameWidth = ctx.measureText(name).width;
  const brandX = (1080 - (logo + 18 + nameWidth)) / 2;
  const brandY = 250;
  roundRectPath(ctx, brandX, brandY, logo, logo, 20);
  ctx.fillStyle = '#facc15';
  ctx.fill();
  const scale = logo / 32;
  ctx.beginPath();
  ctx.moveTo(brandX + 13 * scale, brandY + 9 * scale);
  ctx.lineTo(brandX + 13 * scale, brandY + 23 * scale);
  ctx.lineTo(brandX + 24 * scale, brandY + 16 * scale);
  ctx.closePath();
  ctx.fillStyle = '#0b1220';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, brandX + logo + 18, brandY + logo / 2);

  ctx.textAlign = 'center';
  ctx.font = `800 52px ${RESULT_IMAGE_FONT}`;
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('1일 1상식 두뇌 퀴즈', 540, 470);

  if (dateLabel) {
    ctx.font = `700 34px ${RESULT_IMAGE_FONT}`;
    ctx.fillStyle = '#facc15';
    ctx.fillText(dateLabel, 540, 380);
  }

  ctx.font = `700 28px ${RESULT_IMAGE_FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('맞춘 문제', 540, 580);

  ctx.font = `800 168px ${RESULT_IMAGE_FONT}`;
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`${scoreValue}/${total}`, 540, 720);

  let commentSize = 36;
  const maxCommentWidth = 820;
  while (commentSize > 26) {
    ctx.font = `600 ${commentSize}px ${RESULT_IMAGE_FONT}`;
    if (ctx.measureText(comment).width <= maxCommentWidth) break;
    commentSize -= 2;
  }
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(comment, 540, 900);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 1140);
  ctx.lineTo(900, 1140);
  ctx.stroke();

  ctx.font = `600 32px ${RESULT_IMAGE_FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('notopened.com/quiz', 540, 1248);
}

export async function createResultImageFile(scoreValue, total, comment, dateLabel) {
  if (typeof document === 'undefined') return null;
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* 폰트 대기 실패는 무시 */ }
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx || typeof canvas.toBlob !== 'function') return null;
  drawResultImage(ctx, scoreValue, total, comment || '오늘의 상식 한 판을 마쳤습니다.', dateLabel || '');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob || typeof File !== 'function') return null;
  return new File([blob], 'notopened-quiz-result.png', { type: 'image/png' });
}

function canShareResultFile(file) {
  if (!file || typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch (e) {
    return false;
  }
}

const LINK_COPIED_TOAST = '링크가 복사됐어요. 카톡에 붙여넣기 해주세요';

function shareTextWithUrl(payload) {
  return `${payload.nativeShareText}\n${payload.url}`;
}

async function copyShareTextAndUrl(payload) {
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') return;
    await navigator.clipboard.writeText(shareTextWithUrl(payload));
  } catch (e) { /* 클립보드 거부는 조용히 무시 */ }
}

async function shareResultText(payload) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.nativeShareText,
        url: payload.url
      });
      showToast('공유되었습니다!');
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(payload.clipboardShareText).then(() => {
      showToast('결과가 클립보드에 복사되었습니다!');
    }).catch(() => {
      fallbackCopyText(payload.clipboardShareText);
    });
  } else {
    fallbackCopyText(payload.clipboardShareText);
  }
}

export async function shareResultLink() {
  await shareResultText(sharePayload());
}

export async function shareResult() {
  const payload = sharePayload();
  const total = round.length || 5;
  const file = await createResultImageFile(score, total, payload.comment, payload.dateLabel);
  if (canShareResultFile(file)) {
    await copyShareTextAndUrl(payload);
    try {
      await navigator.share({
        files: [file],
        title: payload.title,
        text: payload.nativeShareText,
        url: payload.url
      });
      showToast(LINK_COPIED_TOAST);
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') {
        showToast(LINK_COPIED_TOAST);
        return;
      }
    }
  }
  await shareResultText(payload);
}

export async function saveResultImage() {
  const total = round.length || 5;
  const file = await createResultImageFile(score, total, resultComment(), dailyMode ? `${kstDateLabel(dailyDate)} 오늘의 챌린지` : '');
  if (!file) {
    showToast('결과 이미지를 만들지 못했습니다.');
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  showToast('결과 이미지를 저장했습니다.');
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showToast('결과가 클립보드에 복사되었습니다!');
    } else {
      showToast('클립보드 복사에 실패했습니다. 주소창 URL을 직접 공유해주세요.');
    }
  } catch (err) {
    showToast('클립보드 복사 권한이 필요합니다.');
  }
  document.body.removeChild(textArea);
}

export function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

/* ------------------------------------------------------------------ 이벤트 */

function setupEventListeners() {
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.addEventListener('click', nextQuestion);

  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) restartBtn.addEventListener('click', restartQuiz);

  const nextSetBtn = document.getElementById('nextSetBtn');
  if (nextSetBtn) nextSetBtn.addEventListener('click', nextRoundSet);

  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', shareResult);

  const shareLinkBtn = document.getElementById('shareLinkBtn');
  if (shareLinkBtn) shareLinkBtn.addEventListener('click', shareResultLink);

  const saveResultBtn = document.getElementById('saveResultBtn');
  if (saveResultBtn) saveResultBtn.addEventListener('click', saveResultImage);
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
  window.nextQuestion = nextQuestion;
  window.restartQuiz = restartQuiz;
  window.nextRoundSet = nextRoundSet;
  window.shareResult = shareResult;
  window.shareResultLink = shareResultLink;
  window.saveResultImage = saveResultImage;
  window.createResultImageFile = createResultImageFile;
  window.showToast = showToast;
}
