'use strict';

const byId = new Map(ITEMS.map(q => [q.id, q]));
const originalNumbers = new Map(ITEMS.map((q, i) => [q.id, i + 1]));
const el = id => document.getElementById(id);
const text = (id, value) => { el(id).textContent = value; };
const tabs = ['review', 'invite', 'play', 'result', 'invalid'];
const numRequired = 3;
const allowedId = /^[A-Za-z0-9_-]{11}$/;
const allowedToken = /^[A-Za-z0-9_-]{1,280}$/;
const licenses = {
  'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/'
};
let chosen = [];
let run = null;
let currentInvite = null;
let pendingChoice = null;
let outgoingUrl = '';
let outgoingKind = '';

function show(tab, focus) {
  for (const id of tabs) el(id).hidden = id !== tab;
  if (focus) el(focus).focus();
}

function node(tag, value, className) {
  const n = document.createElement(tag);
  if (value != null) n.textContent = value;
  if (className) n.className = className;
  return n;
}

function link(value, href) {
  const a = node('a', value);
  a.href = href; a.rel = 'noopener noreferrer'; a.target = '_blank';
  return a;
}

function photoUrl(q) {
  return '../frames/' + q.id + '.webp';
}

function credit(target, q, withSource = false) {
  target.append(q.author);
  if (!q.license) return;
  target.append(' · Wikimedia Commons');
  if (licenses[q.license]) target.append(' · ', link(q.license, licenses[q.license]));
  target.append(' · 쇼츠 화면에서 자름·크기 조정');
  if (withSource && q.file) {
    target.append(' · ', link('원본 사진',
      'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(q.file.replaceAll(' ', '_'))));
  }
}

function buildPicks() {
  const cards = document.createDocumentFragment();
  const credits = document.createDocumentFragment();
  for (const q of ITEMS) {
    const btn = node('button', null, 'pick');
    btn.type = 'button'; btn.dataset.id = q.id;
    const img = node('img');
    img.src = photoUrl(q); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    btn.append(img, node('strong', originalNumbers.get(q.id) + '번 사진'), node('small', q.prompt), node('small', null, 'pick-order'));
    btn.addEventListener('click', () => {
      if (chosen.includes(q.id)) chosen = chosen.filter(id => id !== q.id);
      else if (chosen.length < numRequired) chosen.push(q.id);
      updatePicks();
    });
    cards.append(btn);
    const item = node('li', originalNumbers.get(q.id) + '번 사진: ');
    credit(item, q);
    credits.append(item);
  }
  el('picks').replaceChildren(cards);
  el('builder-credits').replaceChildren(credits);
  updatePicks();
}

function updatePicks() {
  const max = chosen.length === numRequired;
  for (const b of el('picks').children) {
    const idx = chosen.indexOf(b.dataset.id);
    b.setAttribute('aria-pressed', String(idx !== -1));
    b.disabled = max && idx === -1;
    b.querySelector('.pick-order').textContent = idx === -1 ? '' : (idx + 1) + '번째 선택';
  }
  text('picked', chosen.length + ' / 3 선택');
  el('start').disabled = !max;
}

// This version marker detects stale/reordered question content, not authenticity.
// Answers are only choice indexes for the three existing questions; there is no storage/account.
function revision(ids) {
  let hash = 2166136261;
  const contents = JSON.stringify(ids.map(id => {
    const q = byId.get(id);
    return [id, q.prompt, q.answer, q.choices];
  }));
  for (let i = 0; i < contents.length; i++) hash = Math.imul(hash ^ contents.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(36);
}

function encode(payload) {
  return btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function answersValid(answers, ids) {
  return Array.isArray(answers) && answers.length === numRequired && answers.every((choice, i) =>
    Number.isInteger(choice) && choice >= 0 && choice < byId.get(ids[i]).choices.length);
}

function decode(token, expectFriend) {
  if (!allowedToken.test(token)) return null;
  try {
    const raw = JSON.parse(atob(token.replaceAll('-', '+').replaceAll('_', '/')));
    if (!Array.isArray(raw) || raw.length !== (expectFriend ? 5 : 4) || raw[0] !== 1 || encode(raw) !== token) return null;
    const [, ids, rev, creator, friend] = raw;
    if (!Array.isArray(ids) || ids.length !== numRequired || new Set(ids).size !== numRequired) return null;
    if (!ids.every(id => typeof id === 'string' && allowedId.test(id) && byId.has(id))) return null;
    if (rev !== revision(ids) || !answersValid(creator, ids) || (expectFriend && !answersValid(friend, ids))) return null;
    return { ids, creator, friend };
  } catch {
    return null;
  }
}

function makeLink(kind, ids, creator, friend) {
  const base = new URL('./', location.href);
  const dat = [1, ids, revision(ids), creator];
  if (kind === 'result') dat.push(friend);
  base.hash = kind + '=' + encode(dat);
  return base.href;
}

function startRun(role, ids, creator) {
  run = {role, ids: ids.slice(), creator, answers: []};
  renderQuestion();
}

function renderQuestion() {
  pendingChoice = null;
  const nth = run.answers.length;
  const q = byId.get(run.ids[nth]);
  text('play-role', run.role === 'creator' ? '내가 먼저 풀기' : '친구의 도전장');
  text('count', (nth + 1) + ' / 3문제');
  text('prompt', q.prompt);
  el('photo').src = photoUrl(q);
  el('progress').value = nth;
  el('play-credit').replaceChildren();
  credit(el('play-credit'), q);
  el('play-credit').closest('details').open = false;
  const choices = q.choices.map((answer, i) => {
    const b = node('button', String.fromCharCode(65 + i) + '. ' + answer, 'answer');
    b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      pendingChoice = i;
      for (const option of el('choices').children) option.setAttribute('aria-pressed', String(option === b));
      el('next').disabled = false;
    });
    return b;
  });
  el('choices').replaceChildren(...choices);
  el('next').disabled = true;
  text('next', nth === numRequired - 1 ? '결과 보기' : '다음 문제');
  show('play', 'prompt');
}

function score(ids, responses) {
  return ids.filter((id, i) => {
    const q = byId.get(id);
    return q.choices[responses[i]] === q.answer;
  }).length;
}

function renderResult(ids, creator, friend, role) {
  const makerScore = score(ids, creator);
  const otherScore = friend ? score(ids, friend) : null;
  text('result-kicker', friend ? '같은 사진, 두 사람의 답' : '내 점수 확인');
  text('result-title', friend ? '도전 결과 비교' : '3문제 도전장이 완성됐어요');
  text('result-summary', friend ? '도전장을 만든 사람 ' + makerScore + '/3점 · 도전한 사람 ' + otherScore + '/3점' : '내 점수 ' + makerScore + '/3점');
  const list = ids.map((id, i) => {
    const q = byId.get(id);
    const li = node('li', null, 'comparison');
    li.append(node('h2', (i + 1) + '. ' + q.prompt));
    const table = node('dl', null, 'answers');
    const card = (label, index) => {
      const d = node('div');
      const name = q.choices[index];
      d.append(node('dt', label), node('dd', name + (name === q.answer ? ' · 정답' : ' · 오답')));
      return d;
    };
    table.append(card(friend ? '만든 사람의 답' : '내 답', creator[i]));
    if (friend) table.append(card('도전한 사람의 답', friend[i]));
    li.append(table);
    if (friend) {
      const same = creator[i] === friend[i];
      li.append(node('p', same ? '같은 답을 골랐어요.' : '서로 다른 답을 골랐어요.', same ? 'same' : 'different'));
    }
    li.append(node('p', '정답: ' + q.answer), node('p', q.clue, 'muted'));
    const origin = node('p');
    origin.append(link('원본 쇼츠 보기 ↗', 'https://www.youtube.com/shorts/' + id));
    li.append(origin);
    const source = node('p', '사진: ', 'muted');
    credit(source, q, true);
    li.append(source);
    return li;
  });
  el('compare').replaceChildren(...list);
  outgoingKind = friend ? 'result' : 'play';
  outgoingUrl = makeLink(outgoingKind, ids, creator, friend);
  text('share-heading', !friend ? '친구에게 도전장 보내기' : role === 'friend' ? '도전장을 보낸 친구에게 결과 돌려보내기' : '비교 결과 공유하기');
  text('share-help', !friend
    ? '이 링크에는 3문제와 내 답이 들어 있어요. 친구가 푼 뒤엔 친구가 결과 링크를 직접 보내야 알 수 있어요.'
    : '이 링크에 같은 세 문제와 양쪽의 답이 담겨요. 링크가 있는 사람은 누구나 열어 볼 수 있어요. 자동으로 전송되지는 않아요.');
  text('share-status', '');
  el('share-url').value = outgoingUrl;
  show('result', 'result-title');
}

function route() {
  run = null;
  currentInvite = null;
  pendingChoice = null;
  const hash = location.hash.slice(1);
  if (!hash) { show('review'); return; }
  const match = hash.length <= 287 && /^(play|result)=([A-Za-z0-9_-]+)$/.exec(hash);
  const decoded = match && decode(match[2], match[1] === 'result');
  if (!decoded) { show('invalid', 'invalid-title'); return; }
  if (match[1] === 'play') {
    currentInvite = decoded;
    show('invite', 'invite-title');
  } else {
    renderResult(decoded.ids, decoded.creator, decoded.friend, 'viewer');
  }
}

async function copyLink() {
  if (!outgoingUrl) return;
  try {
    await navigator.clipboard.writeText(outgoingUrl);
    text('share-status', '링크를 복사했어요.');
  } catch {
    el('share-url').focus();
    el('share-url').select();
    text('share-status', '아래 링크를 길게 누르거나 복사해 주세요.');
  }
}

el('start').addEventListener('click', () => {
  if (chosen.length === numRequired) startRun('creator', chosen, null);
});
el('accept').addEventListener('click', () => {
  if (currentInvite) startRun('friend', currentInvite.ids, currentInvite.creator);
});
el('next').addEventListener('click', () => {
  if (!run || pendingChoice === null || run.answers.length >= numRequired) return;
  run.answers.push(pendingChoice);
  pendingChoice = null;
  if (run.answers.length < numRequired) { renderQuestion(); return; }
  const {role, ids, creator, answers} = run;
  run = null;
  for (let i = 0; i < ids.length; i++) {
    const q = byId.get(ids[i]);
    if (q.choices[answers[i]] === q.answer) {
      try { window.notopenedPlaceStamps?.record(q.id); } catch { /* scoring does not depend on storage */ }
    }
  }
  if (role === 'creator') renderResult(ids, answers, null, role);
  else renderResult(ids, creator, answers, role);
});
el('copy').addEventListener('click', copyLink);
el('share-url').addEventListener('focus', e => e.target.select());
el('share').addEventListener('click', async () => {
  if (!outgoingUrl) return;
  if (navigator.share) {
    try {
      await navigator.share({title: outgoingKind === 'play' ? '여기 어디게? 내 3문제에 도전!' : '여기 어디게? 우리 둘의 도전 결과', url: outgoingUrl});
      return;
    } catch (e) { if (e?.name === 'AbortError') return; }
  }
  await copyLink();
});
window.addEventListener('hashchange', route);
buildPicks();
route();
