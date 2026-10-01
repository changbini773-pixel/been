(()=>{
const P=Object.values(__X.places),B=Object.values(__X.blogs);
const AD=/(체험단|원고료|소정의|제공받아|제공 받아|협찬|광고|업체로부터|지원받아|내돈내산 아님)/;
const PHONE=/0\d{1,2}[-.\s]\d{3,4}[-.\s]\d{4}/;
const clean=B.filter(b=>{const t=b.title+' '+b.text;if(AD.test(t)||PHONE.test(t))return false;if((t.match(/#/g)||[]).length>=4)return false;return true});
const POS=/(휠체어\s*(로|도|를|가|석)?\s*(이용|출입|진입|입장|접근|대여)?\s*(가능|편하|편했|괜찮|문제\s*없|충분)|경사로|턱\s*(이|도)?\s*(없|낮)|단차\s*(가|도)?\s*없|엘리베이터\s*(가|도)?\s*(있|이용|타고)|장애인\s*(전용)?\s*화장실|배리어\s*프리|무장애|휠체어\s*대여)/;
const NEG=/(휠체어\s*(는|로는|로|가)?\s*(불가|어렵|힘들|못\s|들어가기\s*힘)|계단\s*(만|밖에|뿐)|엘리베이터\s*(가|는|도)?\s*없|턱\s*(이|도)?\s*(높|있어서)|유모차\s*(는|로는)?\s*(불가|어렵|힘들|못))/;
const STOP=new Set(['카페','식당','병원','호텔','모텔','공원','시장','서울','부산','경주','전주','강릉','커피','치킨','맥주','의원','약국','편의점','스타벅스','이디야커피','이디야','투썸플레이스','메가MGC커피','메가커피','컴포즈커피','빽다방','파리바게뜨','롯데리아','맥도날드','버거킹','맘스터치','해운대','광안리','명동','홍대','신촌','강남','잠실','서면','남포동','이태원','성수','여의도','종로','경포','안목','보문','불국사','한옥마을','주문진','기장','동래','전시','미술관','박물관','게스트하우스','호스텔','펜션','한의원','치과','정형외과','내과','소아과','피부과','안과','이비인후과','노래방','PC방','공영주차장','주차장','화장실','광장','해수욕장','해변']);
const core=n=>{let s=n.replace(/\([^)]*\)/g,'').trim();const parts=s.split(/\s+/);let branch=null;
  if(parts.length>1&&/점$/.test(parts[parts.length-1])){branch=parts.pop().replace(/점$/,'').replace(/(본|직영)$/,'')}
  return {c:parts.join(''),branch}};
const cityOf=c=>c.startsWith('서울')?'서울':c;
const byCity={};for(const b of clean){const k=cityOf(b.city);(byCity[k]=byCity[k]||[]).push({b,t:(b.title+' '+b.text).replace(/\s+/g,'')})}
const out={};
for(const p of P){const {c,branch}=core(p.name);if(c.length<3||STOP.has(c)||/^[A-Za-z0-9]{1,3}$/.test(c))continue;
  const list=byCity[cityOf(p.city)]||[];
  const bs=list.filter(o=>o.t.includes(c)&&(!branch||branch.length<2||o.t.includes(branch))).map(o=>o.b);
  if(!bs.length)continue;
  const pos=bs.filter(b=>POS.test(b.title+' '+b.text)),neg=bs.filter(b=>NEG.test(b.title+' '+b.text));
  out[p.id]={id:p.id,name:p.name,group:p.group,cat:p.cat,city:p.city,unit:p.unit,addr:p.addr,x:p.x,y:p.y,n:bs.length,pos:pos.length,neg:neg.length,
    docs:bs.filter(b=>POS.test(b.title+' '+b.text)||NEG.test(b.title+' '+b.text)).slice(0,3).map(b=>({u:b.url,d:b.date,t:(b.title+' | '+b.text).slice(0,280)}))};
}
window.__R={out,clean:clean.length,raw:B.length};
const st={};for(const p of P){const k=p.city;st[k]=st[k]||{};const g=st[k][p.group]=st[k][p.group]||{t:0,m:0,s:0,neg:0};g.t++;const o=out[p.id];if(o){g.m++;if(o.pos||o.neg)g.s++;if(o.neg)g.neg++}}
const un={};for(const p of P){const k=p.city+'|'+p.unit;un[k]=un[k]||{t:0,m:0,s:0};un[k].t++;const o=out[p.id];if(o){un[k].m++;if(o.pos||o.neg)un[k].s++}}
const bu={};for(const b of clean){const k=b.city+'|'+b.unit;bu[k]=(bu[k]||0)+1}
const rawc={};for(const b of B){rawc[b.city]=(rawc[b.city]||0)+1}
const cleanc={};for(const b of clean){cleanc[b.city]=(cleanc[b.city]||0)+1}
return JSON.stringify({raw:B.length,clean:clean.length,rawc,cleanc,places:P.length,matched:Object.keys(out).length,signal:Object.values(out).filter(o=>o.pos||o.neg).length,st,un,bu});
})()
