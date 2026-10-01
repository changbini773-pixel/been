/* ============ js/07_region.js ============
   지역 선택 시트, 최근 지역, setRegion
*/
/* ================= 지역 ================= */
var KR_PROV={"서울특별시":["서울특별시"],"부산광역시":["부산광역시"],"대구광역시":["대구광역시"],"인천광역시":["인천광역시"],"광주광역시":["광주광역시"],"대전광역시":["대전광역시"],"울산광역시":["울산광역시"],"세종특별자치시":["세종특별자치시"],"경기도":["수원시","성남시","고양시","용인시","부천시","안산시","안양시","남양주시","화성시","평택시","의정부시","시흥시","파주시","김포시","광명시","광주시","군포시","하남시","오산시","이천시","안성시","의왕시","양주시","구리시","포천시","동두천시","과천시","여주시","양평군","가평군","연천군"],"강원특별자치도":["춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시","홍천군","횡성군","영월군","평창군","정선군","철원군","화천군","양구군","인제군","고성군","양양군"],"충청북도":["청주시","충주시","제천시","보은군","옥천군","영동군","증평군","진천군","괴산군","음성군","단양군"],"충청남도":["천안시","공주시","보령시","아산시","서산시","논산시","계룡시","당진시","금산군","부여군","서천군","청양군","홍성군","예산군","태안군"],"전북특별자치도":["전주시","군산시","익산시","정읍시","남원시","김제시","완주군","진안군","무주군","장수군","임실군","순창군","고창군","부안군"],"전라남도":["목포시","여수시","순천시","나주시","광양시","담양군","곡성군","구례군","고흥군","보성군","화순군","장흥군","강진군","해남군","영암군","무안군","함평군","영광군","장성군","완도군","진도군","신안군"],"경상북도":["포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시","문경시","경산시","의성군","청송군","영양군","영덕군","청도군","고령군","성주군","칠곡군","예천군","봉화군","울진군","울릉군"],"경상남도":["창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시","의령군","함안군","창녕군","고성군","남해군","하동군","산청군","함양군","거창군","합천군"],"제주특별자치도":["제주시","서귀포시"]};
var PROV_SHORT={"경기도":"경기","강원특별자치도":"강원","경상남도":"경남"};
var CITIES=(()=>{const out=[],cnt={};
  Object.keys(KR_PROV).forEach(p=>KR_PROV[p].forEach(f=>{const n=f.replace(/(특별자치시|특별자치도|특별시|광역시|시|군)$/,'');out.push({full:f,prov:p,n});cnt[n]=(cnt[n]||0)+1}));
  out.forEach(c=>{c.disp=cnt[c.n]>1&&!/광역시$/.test(c.full)?c.n+'('+(PROV_SHORT[c.prov]||c.prov.slice(0,2))+')':c.n});
  return out})();
function cityKey(c){const hit=Object.keys(REGIONS).find(k=>!REGIONS[k].empty&&REGIONS[k].name===c.n&&REGIONS[k].sub===c.prov);return hit||('c:'+c.full+':'+c.prov)}
function ensureRegion(k){
  if(REGIONS[k])return REGIONS[k];
  if(!k.startsWith('c:'))return null;
  const [,full,prov]=k.split(':'),c=CITIES.find(x=>x.full===full&&x.prov===prov);if(!c)return null;
  REGIONS[k]={name:c.disp,sub:prov,full:full,ready:1,empty:1,
    taxi:{n:c.n+' 교통약자 이동지원센터',tel:'연결 예정',note:prov+' 운영 기관',wait:''},days:[],toilets:[],discounts:[],spots:[]};
  return REGIONS[k];
}
var REG_RECENT=(()=>{try{return JSON.parse(localStorage.getItem('et-reg-recent')||'[]')}catch(e){return []}})();
REG_RECENT=REG_RECENT.filter(k=>ensureRegion(k));
function saveRecent(){try{localStorage.setItem('et-reg-recent',JSON.stringify(REG_RECENT))}catch(e){}}
function delRecent(i){REG_RECENT.splice(i,1);saveRecent();renderRegList()}
function clearRecent(){REG_RECENT=[];saveRecent();renderRegList()}
var PIN_RED='<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c-3.9 0-7 3-7 6.9 0 5.1 7 12.7 7 12.7s7-7.6 7-12.7c0-3.9-3.1-6.9-7-6.9z" fill="#E0655C"/><circle cx="12" cy="9.2" r="2.7" fill="#fff"/></svg>';
var RL=[];
function regionSheet(){
  sheet('지역 선택','전국 시·군 이름으로 검색해서 고를 수 있어.',
   `<div class="search" style="margin-bottom:6px">${ic('search',18,2.2)}<input id="regQ" type="search" placeholder="도시 이름 검색 (예: 수원, 여수)" oninput="renderRegList()" aria-label="지역 검색"></div><div id="regList"></div>`);
  const el=g('sheetEl');el.style.height='';el.classList.add('reg-fixed');
  renderRegList();
}
function regRow(k,recIdx){
  const r=REGIONS[k],i=RL.push(k)-1,rec=recIdx>=0;
  return `<div style="position:relative;margin-top:8px"><button class="mo${k===S.region?' on':''}" style="margin-top:0${rec?';padding-right:60px':''}" onclick="setRegion(RL[${i}])">
     <span class="mo-ic" style="background:#FDECEA">${PIN_RED}</span>
     <span class="mo-tx"><b>${r.name}</b>${r.empty?'':''}</span>
     ${rec?'':`<span class="mo-ck">${ic('check',22,2.8)}</span>`}
   </button>${rec?`<button aria-label="${r.name} 기록 삭제" onclick="delRecent(${recIdx})" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--ink-3)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`:''}</div>`;
}
function regLabel(t,btn){return `<div style="display:flex;align-items:center;justify-content:space-between;margin:16px 2px 0;min-height:32px"><span style="font-size:13px;font-weight:700;color:var(--ink-3)">${t}</span>${btn||''}</div>`}
function renderRegList(){
  RL=[];const q=((g('regQ')||{}).value||'').trim().replace(/\s+/g,'');let h='';
  if(!q){
    if(REG_RECENT.length){h+=regLabel('최근 선택',`<button onclick="clearRecent()" style="font-size:13px;font-weight:700;color:var(--sky-d);min-height:32px;padding:0 4px">전체 삭제</button>`);
      h+=REG_RECENT.map((k,i)=>regRow(k,i)).join('')}
    const feat=Object.keys(REGIONS).filter(k=>!REGIONS[k].empty&&!REG_RECENT.includes(k)).sort((a,b)=>REGIONS[a].name.localeCompare(REGIONS[b].name,'ko'));
    if(feat.length){h+=regLabel('추천 여행지');h+=feat.map(k=>regRow(k,-1)).join('')}
  }else{
    const aliasHit=Object.keys(REG_ALIAS).filter(k=>REG_ALIAS[k].some(a=>a.includes(q)));
    const ks=[];
    aliasHit.forEach(k=>{if(!ks.includes(k))ks.push(k)});
    CITIES.filter(c=>c.n.includes(q)||c.full.includes(q)||c.prov.replace(/특별자치도|특별자치시/,'').includes(q)).sort((a,b)=>a.n.localeCompare(b.n,'ko')).forEach(c=>{const k=cityKey(c);ensureRegion(k);if(!ks.includes(k))ks.push(k)});
    h=ks.length?regLabel('검색 결과 '+ks.length+'곳')+ks.map(k=>regRow(k,-1)).join(''):'<p class="sample" style="text-align:center;padding:24px 0">"'+q.replace(/</g,'&lt;')+'"(으)로 찾은 도시가 없어</p>';
  }
  g('regList').innerHTML=h;
}
async function ensureGeo(k){
  if(REG_GEO[k])return;const r=REGIONS[k];if(!r)return;const q=(r.sub+' '+(r.full||r.name));let hit=null;
  try{hit=MAP_MODE==='k'?await kSearch(q):await freeGeocode(q)}catch(e){}
  if(hit)REG_GEO[k]=[hit.lat,hit.lng,12];
}
function setRegion(k){
  if(!ensureRegion(k))return;
  S.region=k; S.filter='all'; S.open={};
  REG_RECENT=[k].concat(REG_RECENT.filter(x=>x!==k)).slice(0,8); saveRecent();
  const r=R();
  g('regName').textContent=r.name; g('regSub').textContent=r.sub; loadRegPhoto();
  g('q').value='';
  ET_ROOT.querySelectorAll('.fchip').forEach(c=>c.classList.toggle('on',c.dataset.f==='all'));
  S.plan=null; S.openStop={};
  g('statRow').style.display='none';
  renderRouteArea(); renderPlanBanner(); renderSpots(); closeSheet();
  if(MAP){try{drawMarkers();if(REG_GEO[k])mapRegion();else ensureGeo(k).then(()=>{if(S.region===k&&MAP)try{mapRegion()}catch(e){}})}catch(e){console.warn('map',e)}}
  else if(!REG_GEO[k]) ensureGeo(k);
  toast(r.name+' 정보로 바꿨어');
}
