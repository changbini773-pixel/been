/* ============ js/35_type_judg.js ============
   v9 이동 유형 3종 판정(휠체어/노약자/시각장애 동반) — 유형별 장소 필터·지도 핀·AI 추천 동선·제보 정리.
   TYPE_JUDG_START~END 사이는 tools/merge_types.js 가 다시 쓴다(손으로 고치지 말 것).
*/
/* ================= v9 · 이동 유형 3종 판정 (휠체어 / 노약자 / 시각장애 동반) =================
   - 휠체어 판정은 기존 s.v / s.evi 를 그대로 쓴다.
   - 노약자·시각장애 판정은 TYPE_JUDG 에만 들어간다. tools/merge_types.js 가 CSV 를 검증해서 채운다.
   - 판정이 없으면 '미확인'으로 두고, 휠체어 판정으로 대신 채우지 않는다(추정 금지). */
var MV_TYPES=['휠체어','노약자','시각장애 동반'];
/*TYPE_JUDG_START*/var TYPE_JUDG={};var TYPE_META={};/*TYPE_JUDG_END*/
function mvShort(t){return t==='시각장애 동반'?'시각':t}
function curType(){return S.mob==='선택 안 함'?null:S.mob}
function mvOf(s,t){
  if(!t||t==='휠체어')return {v:s.v||'미확인',src:s.evi?s.evi.ty:'',q:s.evi?s.evi.t:'',u:s.evi?s.evi.u:''};
  return (TYPE_JUDG[s.id]&&TYPE_JUDG[s.id][t])||{v:'미확인',src:'',q:'',u:''}}
function mvFits(s,t){const v=mvOf(s,t).v;return v==='가능'||v==='부분'}
function mvCount(r,t){const c={'가능':0,'부분':0,'불가':0,'미확인':0};
  (r.spots||[]).forEach(s=>{const v=mvOf(s,t).v;c[v in c?v:'미확인']++});return c}

/* 1) '내 유형 리뷰만 보기' → '(내 유형)에 맞는 장소만 보기' */
S.typeOnly=false;
renderMineRow=function(){
  const el=g('mineBox'),t=curType();if(!el)return;
  if(!t){el.innerHTML=`<p class="hint" style="margin:14px 2px 16px">이동 유형이 <b>선택 안 함</b>이라 모든 장소를 보여주고 있어. 위쪽 이동 유형 버튼에서 유형을 고르면 그 유형에 맞는 장소만 걸러 볼 수 있어.</p>`;return}
  const r=R(),tot=(r.spots||[]).length,c=mvCount(r,t),n=c['가능']+c['부분'];
  const sub=!tot?'이 지역은 판정 데이터가 없어':c['미확인']===tot?`${t} 기준 판정이 아직 0곳이야`:`${t} 기준 가능 ${c['가능']} · 부분 ${c['부분']} / 전체 ${tot}곳`;
  el.innerHTML=`<label class="mine-row">
    <span class="qi">${mobIc(M(t),20,1.8)}</span>
    <div class="tx"><div class="t">${t}에 맞는 장소만 보기</div><div class="s">${sub}</div></div>
    <span class="sw"><input type="checkbox" id="typeOnly" ${S.typeOnly?'checked':''} onchange="S.typeOnly=this.checked;renderSpots()"><i></i></span>
  </label>`};

/* 2) 스팟 목록: 유형 필터 + 카드마다 3종 판정 표시 */
var _renderSpots9=renderSpots;
renderSpots=function(){
  const r=R(),t=curType(),on=!!(t&&S.typeOnly),all=r.spots||[];
  renderMineRow();
  if(on)r.spots=all.filter(s=>mvFits(s,t));
  try{_renderSpots9()}finally{r.spots=all}
  if(on&&all.length&&!all.some(s=>mvFits(s,t)))g('spotList').innerHTML=mvEmptyHTML(r,t);
  mvDecorate(all,t);
};
function mvEmptyHTML(r,t){const c=mvCount(r,t);
  return `<div class="empty" style="margin-top:4px"><div class="ei">${mobIc(M(t),24,1.8)}</div><b>${esc(r.name)}에는 아직 ${t} 기준으로 확인된 장소가 없어</b>
    <p>${c['불가']?`${t} 기준 ‘불가’ 판정만 ${c['불가']}곳 있어. `:''}수집한 후기가 휠체어 키워드 위주라 ${t} 정보가 적어. 추정으로 채우지 않고 비워 뒀어.<br>스위치를 끄면 전체 장소를 볼 수 있어.</p></div>`}
function mvDecorate(all,t){
  const tt=t||'휠체어',byId={};all.forEach(s=>byId[s.id]=s);
  ET_ROOT.querySelectorAll('#spotList .spot').forEach(card=>{
    const s=byId[card.id.replace('card-','')];if(!s||s.rate!=null)return;
    const m=mvOf(s,tt),vb=card.querySelector('.verd');
    if(vb){vb.className='verd v-'+m.v;vb.innerHTML=`<b>${esc(m.v)}</b><span>${mvShort(tt)} 판정</span>`}
    const bd=card.querySelector('.badges');
    if(bd&&!card.querySelector('.mv3')){const row=document.createElement('div');row.className='mv3';
      row.setAttribute('aria-label','이동 유형별 판정');
      row.innerHTML=MV_TYPES.map(x=>{const j=mvOf(s,x);return `<span class="mv3-i v-${esc(j.v)}${x===tt?' on':''}"><span class="mv3-ic">${mobIc(M(x),14,2)}</span>${mvShort(x)} ${esc(j.v)}</span>`}).join('');
      bd.parentNode.insertBefore(row,bd)}
    if(tt!=='휠체어'){const ev=card.querySelector('.evi-b');
      if(ev)ev.insertAdjacentHTML('afterbegin','<b>휠체어 근거</b><br>');
      if(ev&&m.q)ev.insertAdjacentHTML('beforebegin',`<p class="evi-b mv-q"><b>${tt} 근거</b> · ${esc(m.src||'')}<br>“${esc(m.q)}”${m.u&&m.u!==s.evi.u?` <a href="${esc(m.u)}" target="_blank" rel="noopener">출처 ↗</a>`:''}</p>`)}
  });
  const dn=ET_ROOT.querySelector('#spotList .dnote');
  if(dn&&!dn.querySelector('.dn-mv')){const r=R(),tot=(r.spots||[]).length,dv=dn.querySelector('.dn-v');
    if(dv)dv.insertAdjacentHTML('afterbegin','<span class="vs" style="background:none;padding-left:0;font-weight:700">휠체어</span>');
    const cell=x=>{const c=mvCount(r,x),n=tot-c['미확인'];return `<div class="dn-r"><span>${mvShort(x)}</span><i style="width:${Math.max(2,n/Math.max(1,tot)*100)}%"></i><b>${n}/${tot}</b></div>`};
    dn.insertAdjacentHTML('beforeend',`<div class="dn-mv"><div class="dn-k" style="margin-top:12px">이동 유형별 판정된 장소</div><div class="dn-rows">${MV_TYPES.map(cell).join('')}</div>
      <p>${MV_TYPES.slice(1).every(x=>mvCount(r,x)['미확인']===tot)?'노약자·시각장애 판정은 아직 이 지역에 들어가지 않았어. 수집 키워드가 휠체어 위주라 데이터가 휠체어에 쏠려 있어.':'유형마다 따로 판정했어. 휠체어 판정을 다른 유형에 그대로 옮기지 않아.'}</p></div>`)}
}

/* 3) 지도 핀: 선택한 유형의 판정 색, 유형 필터도 반영 */
var _mapPts9=mapPts;
mapPts=function(){const t=curType(),on=!!(t&&S.typeOnly);
  return _mapPts9().filter(p=>!on||mvFits(p.s,t)).map(p=>({s:Object.assign({},p.s,{v:mvOf(p.s,t||'휠체어').v}),lat:p.lat,lng:p.lng}))};

/* 4) AI 추천 동선: 유형별로. 휠체어는 기존 검증 동선, 노약자·시각장애는 해당 유형 판정으로 구성 */
function mvDays(r,t){
  const rank=s=>{const m=mvOf(s,t);return (m.v==='가능'?0:2)+(/방문/.test(m.src)?0:1)};
  const pool=(r.spots||[]).filter(s=>mvFits(s,t)).sort((a,b)=>rank(a)-rank(b)||(b.cnt||0)-(a.cnt||0));
  const groups={};pool.forEach(s=>{const k=String(s.dist||'').split(' · ')[0]||r.name;(groups[k]=groups[k]||[]).push(s)});
  return Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([sub,list])=>{
    const pick=[],cats=new Set();list.forEach(s=>{if(pick.length<3&&!cats.has(catKo(s))){pick.push(s);cats.add(catKo(s))}});
    list.forEach(s=>{if(pick.length<3&&!pick.includes(s))pick.push(s)});
    return {sub,stops:pick.map((s,i)=>{const m=mvOf(s,t);return {n:s.name,k:s.cat,t:['10:00','12:30','15:00'][i],s:m.v,
      f:[[t,m.v+(m.src?' · '+m.src:''),m.v==='가능'&&/방문/.test(m.src)?'ok':'warn'],['근거',m.q||'','ok'],['휠체어',s.v||'미확인',s.v==='가능'?'ok':'warn']],
      note:m.v==='부분'?t+' 기준 부분 판정이야. 근거를 꼭 확인해':''}})}})}
var _showRoute9=showRoute;
showRoute=function(){const t=curType();if(!t||t==='휠체어'){_showRoute9();return}
  const r=R(),src=mvDays(r,t);if(!src.length){toast(t+' 기준으로 확인된 장소가 없어서 동선을 만들 수 없어');return}
  const days=[];for(let i=0;i<S.nDays;i++){const d=src[i];days.push(d?{label:'DAY '+(i+1),sub:d.sub,stops:JSON.parse(JSON.stringify(d.stops))}:newDay(i))}
  S.plan={mode:'auto',days};S.day=0;S.addDay=0;S.openStop={0:true};renderRouteArea();renderPlanBanner();
  toast(t+' 판정 기준 '+days.filter(d=>d.stops.length).length+'일치 AI 추천 동선을 표시했어')};
var _renderRouteArea9=renderRouteArea;
renderRouteArea=function(){const t=curType(),r=R();
  if(S.plan||!t||t==='휠체어'){_renderRouteArea9();return}
  const saved=r.days;r.days=mvDays(r,t);
  try{_renderRouteArea9()}finally{r.days=saved}
  if(!mvDays(r,t).length){const p=g('routeArea').querySelector('.ask p');
    if(p)p.innerHTML=`${esc(r.name)}에는 아직 <b>${t}</b> 기준으로 확인된 장소가 없어서 AI 추천 동선을 만들지 않았어. 휠체어 기준 동선을 유형만 바꿔 보여주지 않아. 직접 일정을 짜서 담아봐.`}};
aiRoute=async function(){
  const r=R(),t=curType()||'휠체어',pool=(r.spots||[]).filter(s=>mvFits(s,t));
  if(!pool.length){toast(t+' 기준 판정 데이터가 없어서 AI 추천을 못 해');return}
  if(!aiOn()){toast('claude.ai에서 열었을 때만 AI 추천이 동작해');return}
  const list=pool.map(s=>{const m=mvOf(s,t);return {id:s.id,name:s.name,cat:s.cat,area:s.dist,verdict:m.v,evidence:m.src,note:t==='휠체어'?(s.evi?s.evi.w:''):m.q}});
  const prompt=`너는 무장애 여행 동선 도우미다. 아래 JSON 목록에 있는 장소만 사용해 ${S.nDays}일 동선을 짠다.
규칙: 1) 목록의 id만 쓴다. 새 장소를 만들지 않는다. 2) 이동 유형은 "${t}"이고 verdict는 이 유형 기준 판정이다. verdict가 "가능"이고 evidence가 "방문"을 포함한 곳을 우선한다. "부분"은 note를 reason에 반드시 적는다. 3) 하루 2~4곳, 같은 area끼리 묶는다. 4) 숙소는 목록에 없으면 만들지 말고 note에 "숙소 데이터 없음"이라고 쓴다.
출력(JSON만): {"days":[{"sub":"지역 묶음 이름","stops":[{"id":"${pool[0].id}","reason":"한 문장"}]}],"note":"전체 주의사항 한 문장"}
목록: ${JSON.stringify(list)}`;
  const el=g('aiRouteMsg');if(el)el.innerHTML='<div class="ai-wait"><span class="ai-dot"></span>AI가 '+t+' 기준 실데이터 '+pool.length+'곳 중에서 고르는 중…</div>';
  try{
    const res=await AI.json(prompt,{cache:false});
    const byId={};pool.forEach(s=>byId[s.id]=s);let bad=0;const days=[];
    for(let i=0;i<S.nDays;i++){const d=(res.days||[])[i],stops=[];let tm=10*60;
      (d&&d.stops||[]).forEach(x=>{const s=byId[String(x.id)];if(!s){bad++;return}const m=mvOf(s,t);
        stops.push({n:s.name,k:s.cat,t:String(Math.floor(tm/60)).padStart(2,'0')+':'+String(tm%60).padStart(2,'0'),s:m.v,
          f:t==='휠체어'?JSON.parse(JSON.stringify(s.f)):[[t,m.v+(m.src?' · '+m.src:''),m.v==='가능'?'ok':'warn'],['근거',m.q||'','ok']],
          note:'AI 추천 이유 · '+String(x.reason||'').slice(0,120)});tm+=150});
      days.push(stops.length?{label:'DAY '+(i+1),sub:String(d.sub||'AI 추천').slice(0,20),stops}:newDay(i))}
    S.plan={mode:'auto',days};S.day=0;S.addDay=0;S.openStop={0:true};renderRouteArea();renderPlanBanner();
    toast(t+' 기준 AI 추천 동선을 표시했어'+(bad?' · 목록에 없는 장소 '+bad+'곳은 제외':'')+(res.note?' · '+String(res.note).slice(0,40):''));
  }catch(e){if(el)el.innerHTML='<div class="err" style="display:block">'+aiErr(e)+'</div>'}};

/* 5) 제보: v5 시연용으로 지어낸 제보 3건 삭제. 실제 제보만 표시 */
REPORTS.length=0;
var _renderReports9=renderReports;
renderReports=function(){_renderReports9();
  if(!REPORTS.length)g('repList').innerHTML=`<div class="empty" style="margin-top:4px"><div class="ei">${ic('pin',24,1.8)}</div><b>아직 올라온 제보가 없어</b><p>경사로 공사, 고장 난 엘리베이터처럼 현장에서 본 걸 처음으로 알려줘.</p></div>`};

(function(){const st=document.createElement('style');st.textContent=`
.mv3{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.mv3-i{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;padding:4px 8px 4px 5px;border-radius:999px;opacity:.75}
.mv3-i.on{opacity:1;box-shadow:0 0 0 2px currentColor inset}
.mv3-ic{display:inline-flex;width:18px;height:18px;align-items:center;justify-content:center}
.mv3-ic img,.mv3-ic svg{width:16px;height:16px}
.mv-q{border-bottom:1px dashed var(--line);padding-bottom:8px}
.dn-mv p{font-size:12.5px;color:var(--ink-3);margin:8px 0 0;line-height:1.5}`;document.head.appendChild(st)})();
try{renderReports();renderMineRow();renderSpots();renderRouteArea()}catch(e){console.warn(e)}
