"use strict";
const ITEMS=[{"id":"q0I9xRfgG1Y","answer":"오다이바","choices":["요코하마 미나토미라이","오다이바","오사카 난바","고베 하버랜드"],"prompt":"거대한 로봇이 서 있던 이곳은?","clue":"파란 하늘을 배경으로 선 거대한 로봇은 도쿄 오다이바의 유니콘 건담이에요.","author":"notopened 직접 촬영"},{"id":"kzhI95cI6Y8","answer":"부산 감천문화마을","choices":["순천 낙안읍성","전주 한옥마을","통영 동피랑마을","부산 감천문화마을"],"prompt":"색색의 집이 층층이 보이는 마을은?","clue":"산비탈을 따라 집들이 층층이 모인 모습이 감천문화마을의 단서예요.","author":"Bernard Gagnon","license":"CC0","file":"Gamcheon Culture Village.jpg"},{"id":"Mjt5hZKEs-M","answer":"시카고","choices":["시카고","뉴욕","보스턴","샌프란시스코"],"prompt":"이 고딕풍 빌딩이 있는 도시는?","clue":"뾰족한 장식이 모인 트리뷴 타워의 꼭대기예요. 이 건물은 미시간호 옆 도시 시카고에 있어요.","author":"notopened 직접 촬영"},{"id":"yKQWeuvLPIg","answer":"창덕궁 인정전","choices":["덕수궁 중화전","창경궁 명정전","창덕궁 인정전","경복궁 근정전"],"prompt":"겹지붕 아래 단청이 보이는 이 궁궐 건물은?","clue":"이 사진의 겹지붕과 단청은 창덕궁의 정전인 인정전을 찍은 모습이에요.","author":"Bernard Gagnon","license":"CC0","file":"Injeongjeon Hall 01.jpg"},{"id":"ge3mCCl4L3g","answer":"경주 동궁과 월지","choices":["진주 촉석루","경주 동궁과 월지","서울 경회루","부여 궁남지"],"prompt":"밤에 불을 밝힌 이 전각이 있는 곳은?","clue":"조명에 드러난 기와지붕은 경주 동궁과 월지의 전각이에요. 월지는 신라 궁궐의 연못이에요.","author":"Bernard Gagnon","license":"CC0","file":"Donggung Palace 01.jpg"},{"id":"IUv1IaUpmW0","answer":"목포근대역사관","choices":["군산근대역사박물관","서울역사박물관","인천 개항박물관","목포근대역사관"],"prompt":"붉은 벽돌과 하얀 장식이 만나는 이 건물은?","clue":"붉은 벽돌 위에 하얀 처마 장식이 얹힌 건물은 목포근대역사관 1관이에요.","author":"notopened 직접 촬영"},{"id":"NsWAXTRwqeM","answer":"시안 병마용","choices":["시안 병마용","베이징 자금성","뤄양 용문석굴","둔황 막고굴"],"prompt":"흙으로 만든 병사들이 줄지어 선 이곳은?","clue":"같은 방향으로 줄지어 선 실물 크기 병사들은 시안 진시황릉의 병마용이에요.","author":"notopened 직접 촬영"},{"id":"9aj014pQabU","answer":"산티아고 베르나베우","choices":["알리안츠 아레나","올드 트래퍼드","산티아고 베르나베우","캄 노우"],"prompt":"은빛 가로 줄무늬 외벽의 이 경기장은?","clue":"금속 외벽을 두른 이 경기장은 마드리드에 있는 레알 마드리드의 홈구장이에요.","author":"notopened 직접 촬영"},{"id":"GfJKJPvdJiI","answer":"성산일출봉","choices":["송악산","성산일출봉","산방산","용머리해안"],"prompt":"바다 옆 초록색 분화구가 보이는 곳은?","clue":"윗부분이 오목한 초록 분화구가 제주 동쪽 성산일출봉을 가리켜요.","author":"Korea.net / Korean Culture and Information Service","license":"CC BY-SA 2.0","file":"Seongsan Ilchulbong from the air.jpg"},{"id":"Jxg_p-kjjAo","answer":"상하이 주자자오","choices":["난징 푸쯔먀오","항저우 시후","쑤저우 저우좡","상하이 주자자오"],"prompt":"붉은 등과 수로가 보이는 이 물의 마을은?","clue":"붉은 등 옆으로 수로와 물가 건물이 이어져요. 영상에 나온 곳은 상하이의 수향마을 주자자오예요.","author":"notopened 직접 촬영"},{"id":"O3oJfyU04U8","answer":"진주 촉석루","choices":["진주 촉석루","밀양 영남루","남원 광한루","경주 월정교"],"prompt":"남강 절벽 위 이 누각의 이름은?","clue":"기와지붕이 보이는 이 누각은 진주성 남강 절벽 위에 있는 촉석루예요.","author":"Kang Byeong Kee","license":"CC BY 3.0","file":"Choksuk Pavillion-JinjuCastle.jpg"},{"id":"Y7xNqbUogE8","answer":"덕수궁 석조전","choices":["정동제일교회","서울시립미술관 서소문본관","덕수궁 석조전","창경궁 대온실"],"prompt":"궁궐 안에 있는 서양식 기둥 건물은?","clue":"사진 속 삼각형 박공과 흰 기둥이 보이는 건물은 덕수궁 석조전이에요.","author":"Kimhs5400 (블루시티)","license":"CC BY-SA 4.0","file":"Seokjojeon.jpg"},{"id":"1YlR7ocRw2o","answer":"부여 정림사지 오층석탑","choices":["익산 미륵사지 석탑","부여 정림사지 오층석탑","경주 불국사 삼층석탑","경주 감은사지 삼층석탑"],"prompt":"이 돌지붕이 겹겹이 쌓인 탑은?","clue":"겹쳐 보이는 얇은 돌지붕은 부여 정림사지에 서 있는 백제 오층석탑의 일부예요.","author":"Bernard Gagnon","license":"CC0","file":"Jeongnimsa Temple 03.jpg"},{"id":"FOvxnIRfRFg","answer":"영주 부석사 무량수전","choices":["영천 은해사 거조암 영산전","예산 수덕사 대웅전","안동 봉정사 극락전","영주 부석사 무량수전"],"prompt":"굵은 목재가 맞물린 이 전각은?","clue":"처마 아래 굵은 나무 부재가 맞물린 부분을 찍은 사진으로, 영주 부석사 무량수전이에요.","author":"Bernard Gagnon","license":"CC0","file":"Muryangsujeon at Buseoksa 02.jpg"},{"id":"MAsaFxaxJ0w","answer":"흥인지문","choices":["흥인지문","숭례문","숙정문","광희문"],"prompt":"이 단청이 있는 서울의 성문은?","clue":"서울 도성의 동쪽 큰 문인 흥인지문이에요. 동대문이라고도 불러요.","author":"Tristan Surtel","license":"CC BY-SA 4.0","file":"Heunginjimun, Seoul.jpg"},{"id":"vUHSV7IwTr4","answer":"광화문","choices":["대한문","돈화문","광화문","흥례문"],"prompt":"이 화려한 처마가 있는 궁궐의 정문은?","clue":"이 처마는 경복궁 정문인 광화문의 일부예요.","author":"Huntsmanleader","license":"CC0","file":"Gwanghwamun Close Up of Roof and Title.jpg"},{"id":"iSCo3myxSl0","answer":"경복궁 근정전","choices":["경복궁 경회루","경복궁 근정전","창덕궁 인정전","덕수궁 중화전"],"prompt":"푸른빛 단청 아래의 이 정전은?","clue":"이 단청은 경복궁의 정전인 근정전 처마 아래에서 볼 수 있어요.","author":"Brady Bellini","license":"CC0","file":"Gyeongbokgung(palace) Geunjeongjeon(hall).jpg"},{"id":"Ta5ID3xbyY0","answer":"경복궁 경회루","choices":["창경궁 대온실","덕수궁 석조전","창덕궁 인정전","경복궁 경회루"],"prompt":"돌기둥으로 받친 이 궁궐 누각은?","clue":"돌기둥 사이로 주변 풍경이 보이는 이 누각은 연못에 자리한 경복궁 경회루예요.","author":"Kim Dae Jeung","license":"CC0","file":""},{"id":"qafQf8bD1nA","answer":"숭례문","choices":["숭례문","흥인지문","숙정문","창의문"],"prompt":"처마 밑 단청이 보이는 이 서울 성문은?","clue":"이 단청은 한양도성의 남쪽 큰 문인 숭례문에서 가져온 장면이에요. 남대문이라고도 해요.","author":"DoulosCore","license":"CC BY-SA 3.0","file":"Sungnyemun Gate, front, 2013.jpg"},{"id":"pEeZvUrvcoA","answer":"분황사 모전석탑","choices":["월정사 팔각구층석탑","정림사지 오층석탑","분황사 모전석탑","불국사 다보탑"],"prompt":"벽돌처럼 보이는 돌을 쌓은 이 탑은?","clue":"벽돌 모양으로 다듬은 돌을 층층이 쌓은 경주 분황사 모전석탑이에요.","author":"Alain Seguin","license":"CC BY 3.0","file":"Korea-Gyeongju-Bunhwangsa-Three story stone pagoda-02.jpg"},{"id":"Sp_2kDOgL48","answer":"불국사 다보탑","choices":["불국사 석가탑","불국사 다보탑","분황사 모전석탑","정림사지 오층석탑"],"prompt":"10원 동전 그림으로도 만나는 이 탑은?","clue":"사진은 불국사 다보탑의 돌 일부예요. 전체 모습은 10원 주화의 그림과 비교해 볼 수 있어요.","author":"Bernard Gagnon","license":"CC0","file":"Dabotap Pagoda 01.jpg"},{"id":"2AlFOWdVcgs","answer":"경주 첨성대","choices":["서울 석촌동 고분군","부여 정림사지","경주 분황사","경주 첨성대"],"prompt":"돌을 둥글게 쌓은 이 신라 유적은?","clue":"돌을 층층이 둘러 쌓은 둥근 몸체는 경주의 신라 천문대 첨성대예요.","author":"Bernard Gagnon","license":"CC0","file":"Cheomseongdae Observatory 01.jpg"},{"id":"EF3jDIuUI5Y","answer":"피사의 사탑","choices":["피사의 사탑","피렌체 조토의 종탑","베네치아 산마르코 종탑","로마 콜로세움"],"prompt":"하얀 기둥과 둥근 아치가 이어지는 이 탑은?","clue":"동그란 층마다 흰 기둥과 아치가 이어지는 이 건물은 이탈리아 피사의 사탑이에요.","author":"Julian Lupyan","license":"CC0","file":"Leaning Tower of Pisa, 2023.jpg"}];
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
const questionsFor=d=>ITEMS.slice(d.start,d.end);
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
    const state=loadGame(d), size=d.end-d.start;
    const small=document.querySelector('[data-key="'+d.key+'"] small');
    small.textContent=state?`이어 풀기 · ${state.index+1}/${size}번 문제`:size+'문제'+(d.key==='all'?' · 전체 도전':'');
    if(state&&(!latest||state.savedAt>latest.state.savedAt))latest={deck:d,state};
  });
  $('resume-card').hidden=!latest;
  if(latest){
    const {deck:d,state}=latest;
    put('resume-info',`${d.name} · ${state.index+1}번 문제 / ${d.end-d.start}문제`);
  }
}
const view=(id)=>['choose','game','result'].forEach(x=>$(x).hidden=x!==id);
const put=(id,text)=>{$(id).textContent=text;};
function addLink(el,label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';el.append(a);}
function showQuestion(savedChoice=null){
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
  if(!restoring){if(ok)points++;saveGame(choice);}
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
const selected=new URLSearchParams(location.search).get('set');
if(DECKS.some(x=>x.key===selected))launch(selected,true);
else renderResumes();
