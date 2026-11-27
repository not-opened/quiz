(() => {
  'use strict';
  const choose = document.getElementById('choose');
  const store = window.notopenedPlaceStamps;
  if (!choose || !store || typeof registerPlaceDeck !== 'function' || typeof launch !== 'function') return;
  const regions = [
    ['domestic','seoul','서울',['yKQWeuvLPIg','Y7xNqbUogE8','MAsaFxaxJ0w','vUHSV7IwTr4','iSCo3myxSl0','Ta5ID3xbyY0','qafQf8bD1nA']],
    ['domestic','chungnam','충남',['1YlR7ocRw2o']],
    ['domestic','gyeongbuk','경북',['ge3mCCl4L3g','FOvxnIRfRFg','pEeZvUrvcoA','Sp_2kDOgL48','2AlFOWdVcgs']],
    ['domestic','jeonnam','전남',['IUv1IaUpmW0']],
    ['domestic','southeast','부산·경남',['kzhI95cI6Y8','O3oJfyU04U8']],
    ['domestic','jeju','제주',['GfJKJPvdJiI']],
    ['overseas','eastasia','동아시아',['q0I9xRfgG1Y','NsWAXTRwqeM','Jxg_p-kjjAo']],
    ['overseas','europe','유럽',['9aj014pQabU','EF3jDIuUI5Y']],
    ['overseas','northamerica','북미',['Mjt5hZKEs-M']]
  ];
  const labels = new Map(ITEMS.map(item => [item.id,item.answer]));
  const journeys = regions.map(([group,slug,label,ids]) => ({
    group,slug,label,ids:ids.filter(id => labels.has(id)),key:'region-'+slug
  })).filter(region => region.ids.length && registerPlaceDeck({
    key:region.key,name:region.label+' · 지역 퀴즈',ids:region.ids
  }));
  if (!journeys.length) return;

  const validIds = new Set(journeys.flatMap(region => region.ids));
  const read = () => new Set(Array.from(store.list()).filter(id => validIds.has(id)));
  let earned = read();
  const element = (tag,className,copy) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (copy) el.textContent = copy;
    return el;
  };

  const map = element('section','stamp-map');
  map.id = 'place-stamp-map';
  map.setAttribute('aria-labelledby','place-stamp-title');
  const title = element('h2','','장소 도장 지도');
  title.id = 'place-stamp-title';
  const total = element('p','stamp-total');
  const lead = element('p','stamp-lead','정답을 맞힌 장소마다 도장을 하나 모아요. 지역을 누르면 그 지역 문제를 풀 수 있어요.');
  const meter = element('progress');
  meter.max = validIds.size;
  meter.setAttribute('aria-label','전체 장소 도장 모은 개수');
  map.append(title,total,meter,lead);

  const groupBoxes = {};
  for (const [kind,groupTitle] of [['domestic','국내'],['overseas','해외']]) {
    const group = element('div','stamp-group');
    const buttons = element('div','stamp-regions stamp-regions-'+kind);
    buttons.setAttribute('role','group');
    buttons.setAttribute('aria-label',groupTitle+' 지역 고르기');
    group.append(element('h3','',groupTitle),buttons);
    map.append(group);
    groupBoxes[kind] = buttons;
  }

  const paintCount = new Map();
  for (const region of journeys) {
    const button = element('button','stamp-region');
    button.type = 'button';
    button.dataset.stampRegion = region.slug;
    const caption = element('span','stamp-region-name',region.label);
    const count = element('span','stamp-region-count');
    button.append(caption,count);
    button.addEventListener('click',() => launch(region.key,true));
    groupBoxes[region.group].append(button);
    paintCount.set(region.key, (complete) => {
      const full = complete === region.ids.length;
      button.classList.toggle('stamp-region-done',full);
      count.textContent = (full ? '✓ ' : '') + complete + ' / ' + region.ids.length;
      button.setAttribute('aria-label',region.label+' 퀴즈, 도장 '+region.ids.length+'개 중 '+complete+'개'+(full?' 모두 모음':''));
    });
  }

  const collected = element('details','stamp-collected');
  const summary = element('summary');
  const list = element('ul','stamp-collection-list');
  collected.append(summary,list);
  map.append(collected,element('p','stamp-footnote','도장은 이 브라우저에 저장돼요. 지도는 위치를 간략히 보여줘요.'));
  choose.querySelector('.decks')?.after(map);
  if (!map.isConnected) choose.append(map);

  const awarded = element('p','stamp-awarded');
  awarded.hidden = true;
  // Keep the answer itself as the keyboard focus target; announce the added stamp separately.
  awarded.setAttribute('role','status');
  document.getElementById('clue')?.after(awarded);
  const render = () => {
    total.textContent = '전체 '+validIds.size+'곳 중 '+earned.size+'곳';
    meter.value = earned.size;
    for (const region of journeys) {
      paintCount.get(region.key)(region.ids.filter(id => earned.has(id)).length);
    }
    summary.textContent = '모은 도장 '+earned.size+'개 보기';
    list.replaceChildren();
    for (const region of journeys) for (const id of region.ids) {
      if (earned.has(id)) list.append(element('li','',region.label+' · '+labels.get(id)));
    }
    if (!earned.size) list.append(element('li','','아직 모은 도장이 없어요.'));
  };
  const resetAward = () => {awarded.hidden = true; awarded.textContent = '';};
  document.addEventListener('notopened:place-question',resetAward);
  // The same card is reused. Clear the previous notice before an incorrect answer
  // even if the core does not publish the optional question lifecycle event.
  document.getElementById('choices')?.addEventListener('click',resetAward,true);
  const refresh = announce => {
    const next = read();
    const gained = [...next].some(id => !earned.has(id));
    earned = next;
    render();
    if (announce && gained) {
      awarded.hidden = false;
      awarded.textContent = '새 도장을 모았어요! '+earned.size+' / '+validIds.size;
    }
  };
  document.addEventListener('notopened:stamp-change',() => refresh(true));
  window.addEventListener('storage',event => {
    if (event.key === store.key || event.key === null) refresh(false);
  });
  render();
})();
