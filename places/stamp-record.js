'use strict';
(() => {
  const key='notopened.places.stamps.v1';
  const known=new Set(ITEMS.map(item=>item.id));
  const temporary=new Set();
  const saved=()=>{
    try{
      const data=JSON.parse(localStorage.getItem(key)||'[]');
      return Array.isArray(data)?data.filter(id=>known.has(id)):[];
    }catch{return [];}
  };
  const list=()=>[...new Set([...saved(),...temporary])];
  const record=id=>{
    if(!known.has(id))return false;
    const previous=list();
    if(previous.includes(id))return false;
    try{
      localStorage.setItem(key,JSON.stringify([...previous,id]));
      temporary.clear();
    }catch{temporary.add(id);}
    document.dispatchEvent(new Event('notopened:stamp-change'));
    return true;
  };
  window.notopenedPlaceStamps=Object.freeze({key,list,record});
})();
