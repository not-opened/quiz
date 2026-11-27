"use strict";
// A small pilot: official visit guidance, followed by a question for the original Shorts comments.
const VISIT_NOTES=Object.freeze({
  kzhI95cI6Y8:{
    tip:'마을 주민이 실제로 생활하는 골목이에요. 조용히 둘러보고, 주민의 사생활이 찍히지 않도록 사진은 공개된 전망대나 포토존에서 찍어 보세요.',
    prompt:'전망대에서 내려다본 풍경과 골목에서 만난 작품 중, 무엇이 더 기억에 남았나요?',
    source:'사하구 공식 관광지도',
    url:'https://www.saha.go.kr/tour/Downfiles/2026_saha_tour_map01_kor.pdf'
  },
  ge3mCCl4L3g:{
    tip:'연못에 비친 전각을 보고 싶다면 해가 진 뒤에 둘러보세요. 일몰 후 전각과 연못 주변에 경관 조명이 켜져요.',
    prompt:'연못에 비친 전각은 어느 쪽에서 봤을 때 가장 인상적이었나요?',
    source:'경주시 공식 관광안내',
    url:'https://gyeongju.go.kr/tour/page.do?mnu_uid=4859'
  },
  GfJKJPvdJiI:{
    tip:'정상까지 오르지 않아도 우뭇개해안 쪽 무료 탐방로에서 성산일출봉과 바다를 함께 볼 수 있어요.',
    prompt:'정상에 오르지 않고 둘러봤다면, 어디에서 본 바다 풍경이 가장 기억에 남나요?',
    source:'제주 공식 관광안내 · 비짓제주',
    url:'https://www.visitjeju.net/kr/detail/view?contentsid=cont_000000000500349'
  }
});
const DECKS=[{"key":"first","name":"1탄 · 국내외 명소","start":0,"end":5},{"key":"second","name":"2탄 · 항구에서 경기장까지","start":5,"end":10},{"key":"third","name":"3탄 · 오래된 건축","start":10,"end":15},{"key":"fourth","name":"4탄 · 궁과 성문","start":15,"end":19},{"key":"fifth","name":"5탄 · 돌로 쌓은 명소","start":19,"end":23},{"key":"all","name":"23문제 한 번에","start":0,"end":23}];
const $=id=>document.getElementById(id);
let deck=null,run=[],index=0,points=0,answered=false;
const SAVE_PREFIX='notopened.places.v1.';
const itemById=new Map(ITEMS.map(q=>[q.id,q]));
const questionsFor=d=>d.ids?d.ids.map(id=>itemById.get(id)):ITEMS.slice(d.start,d.end);
const selected=new URLSearchParams(location.search).get('set');
function registerPlaceDeck({key,name,ids}){
  if(!/^region-[a-z-]{1,25}$/.test(key)||typeof name!=='string'||!Array.isArray(ids)||!ids.length
     ||new Set(ids).size!==ids.length||ids.some(id=>!itemById.has(id))||DECKS.some(d=>d.key===key))return false;
  DECKS.push({key,name,ids:[...ids]});
  if(selected===key)launch(key,true);
  else if(!$('choose').hidden)renderResumes();
  return true;
}
const signature=questions=>questions.map(q=>q.id).join(',');
function loadGame(d){
  try{
    const state=JSON.parse(localStorage.getItem(SAVE_PREFIX+d.key));
    const questions=questionsFor(d);
    if(!state||state.signature!==signature(questions)||!Number.isInteger(state.index)||state.index<0||state.index>=questions.length
       ||!Number.isInteger(state.points)||state.points<0||!Number.isFinite(state.savedAt))return null;
    if(state.choice!==null&&!questions[state.index].choices.includes(state.choice))return null;
    const currentPoint=state.choice===questions[state.index].answer?1:0;
    if(state.points<currentPoint||state.points>state.index+currentPoint)return null;
    return state;
  }catch{return null;}
}
function saveGame(choice){
  try{localStorage.setItem(SAVE_PREFIX+deck.key,JSON.stringify({signature:signature(run),index,points,choice,savedAt:Date.now()}));}catch{}
}
function clearGame(key){
  try{localStorage.removeItem(SAVE_PREFIX+key);}catch{}
}
let latest=null;
function renderResumes(){
  latest=null;
  DECKS.forEach(d=>{
    const state=loadGame(d), size=questionsFor(d).length;
    const small=document.querySelector('[data-key="'+d.key+'"] small');
    if(small)small.textContent=state?`이어 풀기 · ${state.index+1}/${size}번 문제`:size+'문제'+(d.key==='all'?' · 전체 도전':'');
    if(state&&(!latest||state.savedAt>latest.state.savedAt))latest={deck:d,state};
  });
  $('resume-card').hidden=!latest;
  if(latest){
    const {deck:d,state}=latest;
    put('resume-info',`${d.name} · ${state.index+1}번 문제 / ${questionsFor(d).length}문제`);
  }
}
const view=(id)=>['choose','game','result'].forEach(x=>$(x).hidden=x!==id);
const put=(id,text)=>{$(id).textContent=text;};
function addLink(el,label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';el.append(a);}
function showQuestion(savedChoice=null){
  document.dispatchEvent(new Event('notopened:place-question'));
  const q=run[index];
  answered=false;view('game');$('feedback').hidden=true;$('visit-note').hidden=true;
  put('set-name',deck.name);put('count',`${index+1} / ${run.length}`);
  $('progress').max=run.length;$('progress').value=index;
  put('prompt',q.prompt);$('photo').alt='정답을 가린 장소 사진. 사진을 보기 어렵다면 아래 질문의 글 단서를 참고하세요.';$('photo').src='./frames/'+q.id+'.webp';
  $('choices').replaceChildren();
  q.choices.forEach((choice,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+'. '+choice;b.addEventListener('click',()=>answer(choice,b));$('choices').append(b);});
  const previous=q.choices.indexOf(savedChoice);
  if(previous>=0)answer(savedChoice,$('choices').children[previous],true);
  else $('prompt').focus();
}
function answer(choice,b,restoring=false){
  if(answered)return;
  answered=true; const q=run[index],ok=q.answer===choice;
  if(!restoring){
    if(ok){points++;window.notopenedPlaceStamps?.record(q.id);}
    saveGame(choice);
  }
  [...$('choices').children].forEach((el,i)=>{el.disabled=true;if(q.choices[i]===q.answer)el.classList.add('correct');});if(!ok)b.classList.add('incorrect');
  put('verdict',(ok?'정답! ':'정답은 ')+q.answer);put('clue',q.clue);$('short').href='https://www.youtube.com/shorts/'+q.id;
  const cr=$('credit');cr.replaceChildren(document.createTextNode('사진: '+q.author));
  if(q.license){
    cr.append(' / Wikimedia Commons · ');
    const license=q.license==='CC0'?'https://creativecommons.org/publicdomain/zero/1.0/':'https://creativecommons.org/licenses/'+q.license.replace('CC ','').toLowerCase().replace(' ','/')+'/';
    addLink(cr,q.license,license);cr.append(' · 쇼츠 화면에서 자름·크기 조정');
    if(q.file){cr.append(' · ');addLink(cr,'원본 사진','https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(q.file.replaceAll(' ','_')));}
  }
  const visit=VISIT_NOTES[q.id], visitNote=$('visit-note');
  if(visit){
    put('visit-tip',visit.tip);put('visit-prompt',visit.prompt);
    put('visit-source',visit.source);$('visit-source').href=visit.url;
    visitNote.hidden=false;
  }
  $('progress').value=index+1;put('next',index+1===run.length?'점수 보기':'다음 문제');
  $('feedback').hidden=false;$('verdict').setAttribute('tabindex','-1');$('verdict').focus();
}
function launch(key,resume=false){
  const d=DECKS.find(x=>x.key===key);if(!d)return;
  deck=d;run=questionsFor(d);
  const state=resume?loadGame(d):null;
  index=state?state.index:0;points=state?state.points:0;
  showQuestion(state?state.choice:null);
}
function showMenu(){
  renderResumes();view('choose');
  (latest?$('resume'):document.querySelector('[data-key]')).focus();
}
document.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>launch(b.dataset.key,true)));
$('resume').addEventListener('click',()=>{if(latest)launch(latest.deck.key,true);});
$('restart').addEventListener('click',()=>{if(latest){const key=latest.deck.key;clearGame(key);launch(key);}});
$('back').addEventListener('click',showMenu);$('more').addEventListener('click',showMenu);
$('next').addEventListener('click',()=>{
  if(!answered)return;
  if(++index<run.length){saveGame(null);showQuestion();return;}
  answered=false;clearGame(deck.key);
  view('result');put('result-name',deck.name);put('score',`${run.length}문제 중 ${points}문제 정답!`);
  put('shared','');$('share-url').hidden=true;$('score').focus();
});
$('again').addEventListener('click',()=>launch(deck.key));
$('share').addEventListener('click',async()=>{
  const url=new URL('https://notopened.com/quiz/places/');url.searchParams.set('set',deck.key);
  const text=`여기 어디게? ${run.length}문제 중 ${points}개 맞혔어요. 같은 문제에 도전해 보세요!`;
  try{if(navigator.share){await navigator.share({title:'여기 어디게?',text,url:url.href});put('shared','공유 창을 열었어요.');return;}}catch(e){if(e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(text+' '+url.href);put('shared','도전 링크를 복사했어요.');return;}catch{}
  $('share-url').hidden=false;$('share-url').value=url.href;$('share-url').select();put('shared','아래 도전 링크를 복사해 주세요.');
});
if(DECKS.some(x=>x.key===selected))launch(selected,true);
else renderResumes();
