/* ============ js/30_region_picker.js ============
   지역 선택 화면(서울 강북/강남, 부산 묶음), 영문 표기 변환, 지역 일러스트
*/
/* ================= 지역 v2: 서울(강북/강남)·부산(구) 하위 선택 + 영문 표기 ================= */
function roman(s){
  const I=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const V=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  const Fv=['','g','kk','gs','n','nj','nh','d','l','lg','lm','lb','ls','lt','lp','lh','m','b','bs','s','ss','ng','j','ch','k','t','p','h'];
  const Fc=['','k','k','k','n','n','n','t','l','k','m','p','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
  const ch=[...s];let out='';
  for(let i=0;i<ch.length;i++){const c=ch[i].charCodeAt(0);
    if(c<0xAC00||c>0xD7A3){out+=ch[i];continue}
    const o=c-0xAC00,ii=Math.floor(o/588),vi=Math.floor(o%588/28),fi=o%28;
    const pc=i>0?ch[i-1].charCodeAt(0):0,pf=(pc>=0xAC00&&pc<=0xD7A3)?(pc-0xAC00)%28:-1;
    let ini=I[ii];
    if(ii===5){ if(pf===8)ini='l'; else if(pf===21||pf===16||pf===4)ini=(pf===4?'l':'n'); else if(pf<0||i===0)ini='r'}
    if(pf===8&&ii===11&&out.endsWith('l'))out=out.slice(0,-1)+'r';
    if(pf===4&&ii===5)out=out.slice(0,-1)+'l';
    const nc=i+1<ch.length?ch[i+1].charCodeAt(0):0,nextV=(nc>=0xAC00&&nc<=0xD7A3)&&Math.floor((nc-0xAC00)/588)===11;
    out+=ini+V[vi]+(fi?(nextV?Fv[fi]:Fc[fi]):'');
  }
  return out.charAt(0).toUpperCase()+out.slice(1);
}
var EN_FIX={'서울':'Seoul','부산':'Busan','경주':'Gyeongju','경산':'Gyeongsan','전주':'Jeonju','강릉':'Gangneung','해운대':'Haeundae','종로':'Jongno','중구':'Jung-gu','서구':'Seo-gu','동구':'Dong-gu','남구':'Nam-gu','북구':'Buk-gu'};
function enName(n){n=String(n).replace(/\(.*\)/,'').trim();if(EN_FIX[n])return EN_FIX[n];
  const m=n.match(/^(.+?)(구|군|시)$/);if(m&&m[1].length>=1&&n.length>=3)return m[2]==='시'?roman(m[1]):roman(m[1])+'-'+({구:'gu',군:'gun'}[m[2]]);return roman(n)}

var SEOUL={n:{name:'강북',en:'Gangbuk',gus:['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구'],hubs:['광화문','명동','이태원','성수','건대입구','청량리','상봉','성신여대','수유','창동','노원','연신내','신촌','홍대']},
  s:{name:'강남',en:'Gangnam',gus:['강서구','양천구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'],hubs:['마곡','목동','구로디지털단지','가산디지털단지','여의도','노량진','서울대입구','고속터미널','코엑스','잠실','천호']}};
/* 부산: 데이터 양(방문·후기 규모)에 맞춰 묶음. 수집 후 실제 건수로 다시 조정 */
var BUSAN_G=[
 {k:'bs_haeundae',name:'해운대',en:'Haeundae',gus:['해운대구'],hubs:['해운대'],c:[35.1634,129.1588]},
 {k:'bs_seomyeon',name:'서면',en:'Seomyeon',gus:['부산진구'],hubs:['서면'],c:[35.1577,129.0592]},
 {k:'bs_gwangan',name:'광안리·남구',en:'Gwangalli',gus:['수영구','남구'],hubs:['광안리','경성대'],c:[35.1450,129.1100]},
 {k:'bs_old',name:'원도심·영도',en:'Nampo · Yeongdo',gus:['중구','서구','동구','영도구'],hubs:['남포동','송도해수욕장','부산역','영도'],c:[35.0980,129.0350]},
 {k:'bs_north',name:'동래·연제·금정',en:'Dongnae',gus:['동래구','연제구','금정구'],hubs:['동래','연산동','부산대'],c:[35.2050,129.0830]},
 {k:'bs_west',name:'서부산',en:'West Busan',gus:['사하구','사상구','북구','강서구'],hubs:['하단','사상','덕천','명지'],c:[35.1300,128.9700]},
 {k:'bs_gijang',name:'기장',en:'Gijang',gus:['기장군'],hubs:['기장'],c:[35.2446,129.2186]}];
function pendingRegion(name,sub,en,scope,theme){return {name,sub,en,ready:1,pending:1,theme,scope,
  taxi:theme==='seoul'?{n:'서울 장애인콜택시 (서울시설공단)',tel:'1588-4388',note:'24시간 · 21시 이후 2시간 전 예약 권장',wait:''}:{n:'부산 두리발 (교통약자 콜택시)',tel:'번호 확인 중',note:'부산시 운영 · 앱 “부산 교통약자 이동지원 두리발”',wait:''},
  days:[],toilets:[],discounts:[],spots:[]}}
(function(){
  delete REGIONS.jongno;delete REGIONS.haeundae;delete REG_ALIAS.jongno;delete REG_ALIAS.haeundae;
  REGIONS.seoul_n=pendingRegion('서울 강북','서울특별시','Seoul Gangbuk',SEOUL.n.gus.length+'개 구','seoul');
  REGIONS.seoul_s=pendingRegion('서울 강남','서울특별시','Seoul Gangnam',SEOUL.s.gus.length+'개 구','seoul');
  REG_GEO.seoul_n=[37.5850,127.0000,11];REG_GEO.seoul_s=[37.5000,127.0000,11];
  REG_ALIAS.seoul_n=['서울','강북','Seoul'].concat(SEOUL.n.gus,SEOUL.n.hubs);REG_ALIAS.seoul_s=['서울','강남','Seoul'].concat(SEOUL.s.gus,SEOUL.s.hubs);
  BUSAN_G.forEach(x=>{REGIONS[x.k]=pendingRegion('부산 '+x.name,'부산광역시',x.en,x.gus.join('·'),'busan');REG_GEO[x.k]=[x.c[0],x.c[1],13];REG_ALIAS[x.k]=['부산','Busan'].concat(x.gus,x.hubs)});
  ['gyeongju','jeonju','gangneung'].forEach(k=>{if(REGIONS[k])REGIONS[k].example=1});
  const T={gyeongsan:'gyeongsan',gyeongju:'gyeongju',jeonju:'jeonju',gangneung:'gangneung'};Object.keys(T).forEach(k=>{if(REGIONS[k])REGIONS[k].theme=T[k]});
  REG_RECENT=REG_RECENT.filter(k=>REGIONS[k]||String(k).startsWith('c:'));
  if(!REGIONS[S.region])S.region='gyeongsan';
})();
function regEn(r){return r.en||enName(r.full||r.name)}
var REG_OPEN=null;
function toggleGroup(gk){REG_OPEN=REG_OPEN===gk?null:gk;renderRegList()}
var FEAT=[['gyeongsan'],['gyeongju'],['@seoul','서울','Seoul','강북 · 강남'],['@busan','부산','Busan','7개 묶음 · 16개 구·군'],['jeonju'],['gangneung']];
function stateTag(r){return r.real?'<em class="rtag real">실데이터</em>':r.pending?'<em class="rtag pend">수집 대기</em>':''}
function subBtn(k,title,en,desc){const r=REGIONS[k],i=RL.push(k)-1;
  return `<button class="rside-hd${S.region===k?' on':''}" onclick="setRegion(RL[${i}])"><span class="rart sm">${regArt(r.theme,k,36)}</span><span class="rs-tx"><b>${title}<i class="en">${en}</i></b><span>${desc} ${stateTag(r)}</span></span></button>`}
function featRow(f){
  if(f[0][0]!=='@'){const k=f[0],r=REGIONS[k];if(!r)return '';const i=RL.push(k)-1;
    return `<button class="mo rrow${k===S.region?' on':''}" onclick="setRegion(RL[${i}])"><span class="rart">${regArt(r.theme,k,40)}</span>
      <span class="mo-tx"><b>${r.name}<i class="en">${regEn(r)}</i></b><span>${r.sub} ${stateTag(r)}</span></span><span class="mo-ck">${ic('check',22,2.8)}</span></button>`}
  const gk=f[0].slice(1),open=REG_OPEN===gk,act=(gk==='seoul'?/^seoul_/:/^bs_/).test(S.region);
  let sub='';
  if(open&&gk==='seoul')sub=`<div class="rsub">${subBtn('seoul_n','서울 강북','Gangbuk',SEOUL.n.gus.length+'개 구 · '+SEOUL.n.hubs.slice(0,4).join('·')+' 등')}${subBtn('seoul_s','서울 강남','Gangnam',SEOUL.s.gus.length+'개 구 · '+['코엑스','잠실','여의도','고속터미널'].join('·')+' 등')}</div>`;
  if(open&&gk==='busan')sub=`<div class="rsub">${BUSAN_G.map(x=>subBtn(x.k,x.name,x.en,x.gus.join('·'))).join('')}<p class="rs-note">묶음마다 접근성이 확인된 장소가 14~19곳으로 비슷해지도록, 데이터가 적은 구는 가까운 구끼리 묶었어.</p></div>`;
  return `<div class="rgrp${open?' open':''}"><button class="mo rrow${act?' on':''}" aria-expanded="${open}" onclick="toggleGroup('${gk}')"><span class="rart">${regArt(gk,gk,40)}</span>
    <span class="mo-tx"><b>${f[1]}<i class="en">${f[2]}</i></b><span>${f[3]}</span></span><span class="rcv">${ic('chev',20,2.4)}</span></button>${sub}</div>`
}
renderRegList=function(){
  RL=[];const q=((g('regQ')||{}).value||'').trim().replace(/\s+/g,'');let h='';
  if(!q){h+=regLabel('추천 여행지')+FEAT.map(featRow).join('');
    const rec=REG_RECENT.filter(k=>!FEAT.some(f=>f[0]===k)&&!/^(seoul_|bs_)/.test(k));
    if(rec.length){h+=regLabel('최근 선택',`<button onclick="clearRecent()" style="font-size:13px;font-weight:700;color:var(--sky-d);min-height:32px;padding:0 4px">전체 삭제</button>`);h+=rec.map(k=>regRow(k,REG_RECENT.indexOf(k))).join('')}
  }else{
    const ks=[];const push=k=>{if(!ks.includes(k))ks.push(k)};
    Object.keys(REG_ALIAS).filter(k=>REGIONS[k]&&REG_ALIAS[k].some(a=>a.includes(q)||(q.length>=2&&q.includes(a)&&a.length>=2))).forEach(push);
    CITIES.filter(c=>c.n.includes(q)||c.full.includes(q)||c.prov.replace(/특별자치도|특별자치시/,'').includes(q)).filter(c=>c.n!=='서울'&&c.n!=='부산').sort((a,b)=>a.n.localeCompare(b.n,'ko')).forEach(c=>push(cityKey(c)));
    ks.forEach(k=>ensureRegion(k));
    h=ks.length?regLabel('검색 결과 '+ks.length+'곳')+ks.map(k=>regRow(k,-1)).join(''):'<p class="sample" style="text-align:center;padding:24px 0">"'+q.replace(/</g,'&lt;')+'"(으)로 찾은 도시가 없어</p>';
  }
  g('regList').innerHTML=h;
};
regRow=function(k,recIdx){
  const r=ensureRegion(k);if(!r)return '';const i=RL.push(k)-1,rec=recIdx>=0;
  return `<div style="position:relative;margin-top:8px"><button class="mo rrow${k===S.region?' on':''}" style="margin-top:0${rec?';padding-right:60px':''}" onclick="setRegion(RL[${i}])">
     <span class="rart">${regArt(r.theme,k,40)}</span>
     <span class="mo-tx"><b>${r.name}<i class="en">${regEn(r)}</i></b><span>${r.sub} ${stateTag(r)}</span></span>
     ${rec?'':`<span class="mo-ck">${ic('check',22,2.8)}</span>`}
   </button>${rec?`<button aria-label="${r.name} 기록 삭제" onclick="delRecent(${recIdx})" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--ink-3)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`:''}</div>`;
};
/* ---- 지역 일러스트 (지도 사진 대신, 부드럽게 움직이는 그림) ---- */
function hsh(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h}
function regArt(theme,seed,size){
  const sz=size||112,id='a'+(hsh(seed)%100000)+'_'+sz,v=hsh(seed);
  const P={gyeongsan:['#FFE7D6','#FFF6EC','#8FCB9B','#5FA777','#9ED3E6'],gyeongju:['#FFD9C2','#FFF1E4','#E8B77A','#C98C4E','#F6C08A'],
    seoul:['#D7E9FF','#F2F8FF','#9DB8E8','#5F7FC9','#8ED0F0'],busan:['#CDEBFF','#F0FAFF','#6CC4E8','#2E8BC7','#FFD37A'],
    jeonju:['#FCE3E6','#FFF5F5','#C9A27E','#6E5A4C','#F2B8C0'],gangneung:['#D4F1EC','#F2FFFB','#79D0C0','#3E9F8E','#FFE08A'],
    default:['#E6F0F6','#F7FBFD','#A9CFA0','#6FAE7A','#9ED3E6']}[theme]||null;
  const c=P||['#E6F0F6','#F7FBFD','#A9CFA0','#6FAE7A','#9ED3E6'];
  const cloud=(x,y,s,d)=>`<g class="ra-cloud" style="animation-duration:${d}s"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="12" ry="6" fill="#fff" opacity=".95"/><ellipse cx="9" cy="-3" rx="8" ry="6" fill="#fff" opacity=".95"/><ellipse cx="-8" cy="-2" rx="7" ry="5" fill="#fff" opacity=".95"/></g></g>`;
  const sun=`<circle class="ra-sun" cx="${78+v%12}" cy="${24+v%6}" r="11" fill="${c[4]}" opacity=".9"/>`;
  let scene='';
  if(theme==='gyeongsan'){ // 반곡지: 저수지 + 왕버들
    scene=`<path d="M0 70 Q30 60 56 66 T112 64 V112 H0Z" fill="${c[2]}"/><rect x="0" y="78" width="112" height="34" fill="${c[4]}" opacity=".75"/>
    <g class="ra-wave"><path d="M-20 86 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></g>
    ${[18,44,74,96].map((x,i)=>`<g class="ra-sway" style="transform-origin:${x}px 78px;animation-delay:${i*.4}s"><path d="M${x} 78 C${x-2} 66 ${x+3} 58 ${x} 48" stroke="#7A5A3A" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${46+i%2*3}" rx="${11-i%2*2}" ry="9" fill="${c[3]}"/><path d="M${x-8} 50 q-2 10 -1 18 M${x+8} 50 q2 10 1 18" stroke="${c[3]}" stroke-width="2" fill="none" opacity=".8"/></g>`).join('')}
    ${[18,44,74,96].map((x,i)=>`<ellipse cx="${x}" cy="${96+i%2*2}" rx="${9-i%2*2}" ry="4" fill="${c[3]}" opacity=".25"/>`).join('')}`}
  else if(theme==='gyeongju'){ // 첨성대 + 능
    scene=`<path d="M0 78 Q22 58 44 78 Q66 62 90 78 Q102 70 112 76 V112 H0Z" fill="${c[2]}" opacity=".7"/><rect x="0" y="86" width="112" height="26" fill="#C8DDA0"/>
    <g><path d="M48 88 C46 74 44 64 49 50 L63 50 C68 64 66 74 64 88Z" fill="${c[3]}"/><rect x="47" y="45" width="18" height="6" rx="1" fill="${c[3]}"/><rect x="53" y="62" width="6" height="6" fill="#6B4726"/>
    ${[56,62,68,74,80].map(y=>`<path d="M${47+(88-y)*0.05} ${y} H${65-(88-y)*0.05}" stroke="#E9C79B" stroke-width="1" opacity=".7"/>`).join('')}</g>`}
  else if(theme==='seoul'){ // 산 + 타워 + 한옥 지붕 + 한강
    scene=`<path d="M0 72 L22 46 L38 60 L58 38 L80 60 L96 50 L112 64 V112 H0Z" fill="${c[2]}" opacity=".8"/>
    <g><rect x="61" y="18" width="2.4" height="26" fill="${c[3]}"/><rect x="57.5" y="30" width="9.5" height="5" rx="2" fill="${c[3]}"/><circle cx="62.2" cy="17" r="1.6" fill="#FF7A7A" class="ra-blink"/></g>
    ${[8,24,40,76,92].map((x,i)=>`<rect x="${x}" y="${62-(i*7%14)}" width="12" height="${30+(i*7%14)}" rx="2" fill="#fff" opacity=".85"/>`).join('')}
    <path d="M30 76 Q56 64 82 76 L78 78 H34Z" fill="#445C8C"/><rect x="36" y="78" width="40" height="10" fill="#F6EBDD"/>
    <rect x="0" y="88" width="112" height="24" fill="${c[4]}" opacity=".85"/><g class="ra-wave"><path d="M-20 97 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".75"/></g>`}
  else if(theme==='busan'){ // 바다 + 현수교 + 갈매기
    scene=`<rect x="0" y="66" width="112" height="46" fill="${c[2]}"/><path d="M0 64 L20 50 L34 58 L52 44 L70 60 V66 H0Z" fill="#9CC9A6" opacity=".8"/>
    <g><path d="M6 72 Q36 44 56 72 Q76 44 106 72" stroke="#fff" stroke-width="1.5" fill="none"/><rect x="33" y="48" width="3" height="26" fill="#fff"/><rect x="77" y="48" width="3" height="26" fill="#fff"/><rect x="0" y="72" width="112" height="3" fill="#fff"/></g>
    <g class="ra-wave"><path d="M-20 88 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></g>
    <g class="ra-wave2"><path d="M-20 100 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></g>
    <path d="M0 104 Q56 96 112 104 V112 H0Z" fill="#F7E3B5"/>
    <g class="ra-bird"><path d="M20 36 q4 -4 8 0 q4 -4 8 0" stroke="#3E5566" stroke-width="1.6" fill="none"/></g>`}
  else if(theme==='jeonju'){ // 한옥 지붕 겹
    scene=`<rect x="0" y="80" width="112" height="32" fill="#E9DCC8"/>${[[6,58,44],[40,50,50],[76,60,40]].map(([x,y,w])=>`<path d="M${x} ${y+10} Q${x+w/2} ${y-4} ${x+w} ${y+10} L${x+w-4} ${y+12} H${x+4}Z" fill="${c[3]}"/><rect x="${x+6}" y="${y+12}" width="${w-12}" height="${80-y-12}" fill="#FBF3E6"/><rect x="${x+w/2-4}" y="${y+18}" width="8" height="${80-y-18}" fill="${c[2]}"/>`).join('')}
    <g class="ra-petal">${[14,40,70,98].map((x,i)=>`<circle cx="${x}" cy="${20+i*6}" r="1.8" fill="${c[4]}"/>`).join('')}</g>`}
  else if(theme==='gangneung'){ // 소나무 + 해변
    scene=`<rect x="0" y="62" width="112" height="50" fill="${c[2]}"/><g class="ra-wave"><path d="M-20 76 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></g>
    <path d="M0 90 Q56 80 112 92 V112 H0Z" fill="#F6E4B8"/>${[16,94].map((x,i)=>`<g class="ra-sway" style="transform-origin:${x}px 100px;animation-delay:${i*.6}s"><path d="M${x} 100 Q${x+4} 80 ${x-2} 60" stroke="#8A5A3A" stroke-width="3" fill="none"/><ellipse cx="${x-2}" cy="60" rx="12" ry="5" fill="${c[3]}"/><ellipse cx="${x+2}" cy="68" rx="10" ry="4" fill="${c[3]}"/></g>`).join('')}`}
  else { scene=`<path d="M0 74 Q28 56 56 72 T112 68 V112 H0Z" fill="${c[2]}"/><path d="M0 88 Q40 76 80 88 T112 86 V112 H0Z" fill="${c[3]}"/>`}
  return `<svg class="rart-svg" viewBox="0 0 112 112" width="${sz}" height="${sz}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>
    <rect width="112" height="112" fill="url(#${id})"/>${sun}${cloud(20+v%20,22,1,18+v%6)}${sz>60?cloud(70,40,.7,24):''}${scene}</svg>`;
}
loadRegPhoto=async function(){
  const el=g('regPh');if(!el)return;const r=R();
  el.innerHTML=regArt(r.theme,S.region,112);
  el.classList.add('art');
};
/* 헤더 영문 + 수집 대기 카드 */
var _setRegion0=setRegion;
setRegion=function(k){_setRegion0(k);const r=R();if(r){g('regSub').textContent=r.sub+' · '+regEn(r).split(' · ').pop()}REG_OPEN=null};
function pendingHTML(r){const isSeoul=r.theme==='seoul';
  return `<div class="dnote"><div class="dn-k">${esc(r.en||'')} · 실데이터 수집 대기</div>
    <div class="dn-big"><b style="font-size:24px">0<small>곳</small></b><span>이 지역은 아직 수집 전이라 판정된 장소가 없어. 예시 데이터를 채우지 않고 비워 뒀어.</span></div>
    <p>수집 범위 · ${esc(r.scope||'')} · 카카오 장소 6개 분류(음식점·카페·관광명소·숙박·문화시설·병원) + 블로그 후기 6개 키워드(휠체어·유모차·계단·경사로·엘리베이터·장애인화장실). 경산과 같은 방식이야.</p>
    ${isSeoul&&r.scope&&r.scope.includes('개 구')?'':''}</div>`}

try{const r0=R();g('regName').textContent=r0.name;g('regSub').textContent=r0.sub+' · '+regEn(r0).split(' · ').pop();loadRegPhoto();renderSpots()}catch(e){console.warn(e)}
