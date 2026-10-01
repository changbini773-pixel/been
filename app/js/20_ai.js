/* ============ js/20_ai.js ============
   AI 기능(claude.ai sample): 후기 분석, 증거 인용 검증, AI가 다시 골라줘
*/
/* ================= AI (claude.ai sample capability) ================= */
var AI=null,AI_READY=false,AI_CTL=null,AI_LAST=null;
(async()=>{try{if(window.claude&&claude.use){AI=await claude.use("sample");}}catch(e){AI=null}
  AI_READY=true;try{renderAiEntry();renderRouteArea()}catch(e){}})();
function aiOn(){return !!AI}
function aiErr(e){const c=e&&e.code;
  if(c==='not_granted'||c==='sampling_disabled'||c==='not_declared'||c==='capability_disabled'){AI=null;renderAiEntry();return 'AI 사용이 허용되지 않았어. 이 화면에서는 AI 기능을 숨길게.'}
  if(c==='rate_limited')return '요청이 많아. 잠시 뒤에 다시 눌러줘.';
  if(c==='invalid_json')return 'AI 응답 형식이 깨졌어. 다시 시도해줘.';
  if(c==='refused')return 'AI가 이 입력은 처리하지 않았어. 내용을 바꿔서 시도해줘.';
  if(c==='session_expired')return 'claude.ai에 다시 로그인해줘.';
  if(c==='cancelled')return '중지했어.';
  return '연결이 불안정해. 다시 시도해줘.'}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function norm(s){return String(s||'').replace(/\s+/g,'').replace(/[.,!?~·…'"“”‘’()]/g,'')}
function renderAiEntry(){const el=g('aiEntry');if(!el)return;
  el.innerHTML=`<button class="ai-btn" onclick="aiSheet()"><span class="ai-k">AI</span>
    <span class="tx"><b>후기로 접근성 분석하기</b><span>${aiOn()?'후기를 붙여 넣으면 AI가 접근성 사실만 뽑아 판정해':'claude.ai에서 열었을 때 동작해 · 지금은 결과 예시만 볼 수 있어'}</span></span>${chevR(20)}</button>`}

var AI_ITEMS='parking(장애인 주차) transit(대중교통 접근) entrance_step(출입구 턱·계단) ramp(경사로) path_surface(노면) elevator(엘리베이터) toilet(장애인 화장실) door_width(문·통로 폭) seating(휠체어석·좌석) wheelchair_rent(휠체어 대여) braille_block(점자블록) audio_guide(음성 안내) staff_guide(안내요원) stroller(유모차) rest_bench(휴식 벤치)';
function aiExtractPrompt(place,mob,txt){return `너는 무장애 여행 정보 추출기다. 아래 후기에서 접근성 관련 "사실"만 뽑아 JSON으로 변환하고, 지정된 이동 유형 기준으로 판정한다.

# 절대 규칙
1. 후기에 쓰여 있지 않은 것은 추정하지 않는다. 모르면 넣지 않는다.
2. 모든 항목의 evidence는 후기 원문 구절을 글자 그대로 복사한다(요약·수정 금지, 40자 이내). 인용할 수 없으면 그 항목은 넣지 않는다.
3. 수치가 원문에 없으면 만들지 않는다.
4. 광고성 표기("휠체어 이용 가능" 같은 업체 정보란)와 실제 방문 서술을 구분한다: source는 "방문" 또는 "표기".
5. 접근성 언급이 없으면 items를 빈 배열로 둔다.

# 항목 키
${AI_ITEMS}

# 판정 (이동 유형: ${mob})
- verdict: "가능" | "부분" | "불가" | "판단불가"
- "불가"는 실제로 들어가지 못했다는 방문 서술이 있을 때만.
- items가 비었거나 이 이동 유형과 무관하면 "판단불가".
- reason: 한 문장, 반드시 items에 있는 사실만 근거로.

# 출력 (JSON만)
{"place":"${place.replace(/"/g,'')}","mentioned":true,"items":[{"key":"entrance_step","label":"출입구 턱","status":"있음|없음|가능|부분|불가","detail":"짧게","evidence":"원문 그대로","source":"방문|표기"}],"barrier_report":false,"verdict":"가능","reason":"...","affects":["휠체어","노약자","시각장애 동반"]}

# 후기 (장소: ${place})
${txt.slice(0,6000)}`}

var AI_DEMO={place:"예시 카페 (직접 작성한 가상 후기)",
  txt:`[후기1] 매장 정보에 휠체어 출입 가능, 장애인 주차 가능이라고 적혀 있어요.
[후기2] 엄마 휠체어 모시고 갔는데 입구 쪽은 경사로라 괜찮았어요. 근데 주차장에서 올라오는 길이 꽤 가팔라서 혼자 밀기는 힘들어 보였어요.
[후기3] 화장실이 2층에만 있고 엘리베이터가 없어서 결국 근처 공원 화장실 갔습니다.`};

function aiSheet(prefill){
  const d=prefill||{place:'',txt:''};
  sheet('AI 후기 분석',`<b>${esc(S.mob)}</b> 기준으로 판정해. 원문에 없는 내용은 결과에서 자동으로 걸러져.`,`
    <div class="fform">
      <label class="flbl" for="aiPlace">장소 이름</label>
      <input id="aiPlace" value="${esc(d.place)}" placeholder="예: 까사평사">
      <label class="flbl" for="aiTxt">후기 (여러 개면 줄을 바꿔서)</label>
      <textarea id="aiTxt" rows="7" placeholder="블로그·지도 후기에서 접근성 관련 부분을 붙여 넣어줘">${esc(d.txt)}</textarea>
      <div class="err" id="aiErr"></div>
      <div class="stack" style="margin-top:14px">
        <button class="btn pri" id="aiGo" onclick="aiRun()">${aiOn()?'AI로 분석':'결과 예시 보기'}</button>
        <button class="btn line" onclick="aiSheet(AI_DEMO)">예시 후기 넣기</button>
      </div>
      <div id="aiOut"></div>
      <p class="sample">AI는 후기를 <b>요약하지 않고</b> 접근성 사실만 뽑아. 뽑은 근거 문장이 입력한 원문에 실제로 있는지 앱이 한 번 더 대조해서, 없으면 결과에서 빼.</p>
    </div>`);
}
function aiVerify(res,txt){const src=norm(txt);
  const items=(Array.isArray(res.items)?res.items:[]).map(it=>{const ev=norm(it.evidence);const ok=ev.length>=4&&src.indexOf(ev)>=0;return Object.assign({},it,{ok})});
  return {items,kept:items.filter(i=>i.ok),dropped:items.filter(i=>!i.ok)}}
var AI_FAKE={place:"예시 카페 (직접 작성한 가상 후기)",mentioned:true,barrier_report:false,verdict:"부분",
  reason:"입구는 경사로지만 주차장 진입로가 가파르고 화장실이 엘리베이터 없는 2층에만 있다.",affects:["휠체어","노약자"],
  items:[{key:"ramp",label:"경사로",status:"있음",detail:"입구 경사로",evidence:"입구 쪽은 경사로라 괜찮았어요",source:"방문"},
   {key:"path_surface",label:"진입로",status:"부분",detail:"주차장→입구 가파름",evidence:"주차장에서 올라오는 길이 꽤 가팔라서",source:"방문"},
   {key:"toilet",label:"화장실",status:"불가",detail:"2층에만 있음",evidence:"화장실이 2층에만 있고",source:"방문"},
   {key:"elevator",label:"엘리베이터",status:"없음",detail:"",evidence:"엘리베이터가 없어서",source:"방문"},
   {key:"parking",label:"장애인 주차",status:"있음",detail:"업체 표기",evidence:"장애인 주차 가능이라고 적혀 있어요",source:"표기"},
   {key:"seating",label:"좌석",status:"있음",detail:"휠체어석 4석",evidence:"휠체어석 4석 마련",source:"방문"}]};
async function aiRun(){
  const place=(g('aiPlace').value||'').trim(),txt=(g('aiTxt').value||'').trim(),out=g('aiOut'),err=g('aiErr'),btn=g('aiGo');
  err.textContent='';err.style.display='none';
  if(!place||txt.length<15){err.textContent='장소 이름과 15자 이상의 후기를 넣어줘';err.style.display='block';return}
  if(!aiOn()){ // 오프라인 예시: 검증 단계가 어떻게 작동하는지 보여주기 위해 가상 결과에 '원문에 없는 근거' 1개를 일부러 넣어 둠
    const v=aiVerify(AI_FAKE,AI_DEMO.txt);out.innerHTML=aiResultHTML(AI_FAKE,v,true);return}
  AI_CTL=new AbortController();btn.disabled=true;
  out.innerHTML=`<div class="ai-wait"><span class="ai-dot"></span>AI가 후기를 읽는 중… (처음엔 허용 창이 뜰 수 있어)<button class="tbtn" onclick="AI_CTL&&AI_CTL.abort()">중지</button></div>`;
  try{
    const res=await AI.json(aiExtractPrompt(place,S.mob,txt),{signal:AI_CTL.signal});
    if(!res||typeof res!=='object')throw {code:'invalid_json'};
    const v=aiVerify(res,txt);AI_LAST={place,res,v};out.innerHTML=aiResultHTML(res,v,false);
  }catch(e){out.innerHTML=`<div class="err" style="display:block">${aiErr(e)}</div>`}
  finally{btn.disabled=false}
}
var VCLS={"가능":"v-가능","부분":"v-부분","불가":"v-불가","판단불가":"v-미확인"};
function aiResultHTML(res,v,demo){
  const verdict=v.kept.length?(res.verdict||'판단불가'):'판단불가';
  return `<div class="ai-res">
    ${demo?'<div class="ai-demo">결과 예시 · AI를 부르지 않고 미리 만든 값이야. 검증 단계를 보여주려고 원문에 없는 근거 1개를 일부러 넣어 뒀어.</div>':''}
    <div class="ai-hd"><div><div class="spot-cat">${esc(S.mob)} 기준 판정</div><b>${esc(res.place||'')}</b></div>
      <div class="verd ${VCLS[verdict]||'v-미확인'}"><b>${esc(verdict)}</b><span>AI 판정</span></div></div>
    ${res.reason&&v.kept.length?`<p class="ai-reason">${esc(res.reason)}</p>`:''}
    ${res.barrier_report?'<div class="bdg no" style="margin-top:8px">“못 들어감” 제보 포함</div>':''}
    <div class="ai-items">${v.kept.map(i=>`<div class="ai-it"><span class="bdg ${/불가|없음/.test(i.status)?'no':/부분/.test(i.status)?'warn':'ok'}">${esc(i.label||i.key)} · ${esc(i.status)}</span>
      <span class="src ${i.source==='방문'?'b':''}">${i.source==='방문'?'방문 서술':'업체 표기'}</span>
      <q>${esc(i.evidence)}</q><em>✓ 원문 확인</em></div>`).join('')||'<p class="sample">원문에서 확인된 접근성 사실이 없어.</p>'}</div>
    ${v.dropped.length?`<div class="ai-drop"><b>원문에 없어서 뺀 항목 ${v.dropped.length}개</b>${v.dropped.map(i=>`<div>✗ ${esc(i.label||i.key)} · “${esc(i.evidence)}”</div>`).join('')}</div>`:''}
    <div class="ai-stat">검증 통과 ${v.kept.length} / 추출 ${v.items.length} · 방문 서술 ${v.kept.filter(i=>i.source==='방문').length}건</div>
    ${!demo&&v.kept.length?`<button class="btn pri" style="margin-top:12px" onclick="aiSave()">편의 스팟에 추가</button>`:''}
  </div>`}
function aiSave(){if(!AI_LAST)return;const {place,res,v}=AI_LAST,r=R();r.spots=r.spots||[];
  const verdict=res.verdict||'판단불가',vv=verdict==='판단불가'?'미확인':verdict,visit=v.kept.some(i=>i.source==='방문');
  const id='ai'+Date.now();
  r.spots.unshift({id,name:place,cat:'AI 분석',dist:r.name+' · 방금 추가',rate:null,v:vv,cnt:1,
    tags:['etc'].concat(visit?['visit']:[]).concat(vv==='불가'?['no']:[]),
    f:[["휠체어",vv+' · AI 추출',vv==='가능'&&visit?'ok':'warn'],["근거",res.reason||'','ok']],
    badges:v.kept.slice(0,5).map(i=>[/불가|없음/.test(i.status)?'no':/부분/.test(i.status)?'warn':'ok',(i.label||i.key)+' '+i.status]),
    rv:[],evi:{ty:visit?'방문 후기(AI 추출)':'업체 표기(AI 추출)',t:v.kept.map(i=>(i.label||i.key)+': '+i.status).join(', '),w:'',n:1,u:'#',osm:false}});
  closeSheet();S.filter='all';goTab(1);renderSpots();toast(place+'을 편의 스팟 맨 위에 추가했어')}

/* ---- AI 동선 추천: 실데이터 목록 안에서만 고르게 하고, 앱이 id를 검증 ---- */
async function aiRoute(){
  const r=R(),pool=(r.spots||[]).filter(s=>s.v&&s.v!=='불가');
  if(!pool.length){toast('이 지역엔 판정 데이터가 없어서 AI 추천을 못 해');return}
  if(!aiOn()){toast('claude.ai에서 열었을 때만 AI 추천이 동작해');return}
  const list=pool.map(s=>({id:s.id,name:s.name,cat:s.cat,area:s.dist,verdict:s.v,evidence:s.evi?s.evi.ty:'',note:s.evi?s.evi.w:''}));
  const prompt=`너는 무장애 여행 동선 도우미다. 아래 JSON 목록에 있는 장소만 사용해 ${S.nDays}일 동선을 짠다.
규칙: 1) 목록의 id만 쓴다. 새 장소를 만들지 않는다. 2) 이동 유형은 "${S.mob}". verdict가 "가능"이고 evidence가 "방문"을 포함한 곳을 우선한다. "부분"은 note를 reason에 반드시 적는다. 3) 하루 2~4곳, 같은 area끼리 묶는다. 4) 숙소는 목록에 없으면 만들지 말고 note에 "숙소 데이터 없음"이라고 쓴다.
출력(JSON만): {"days":[{"sub":"지역 묶음 이름","stops":[{"id":"y1","reason":"한 문장"}]}],"note":"전체 주의사항 한 문장"}
목록: ${JSON.stringify(list)}`;
  const el=g('aiRouteMsg');if(el)el.innerHTML='<div class="ai-wait"><span class="ai-dot"></span>AI가 실데이터 '+pool.length+'곳 중에서 고르는 중…</div>';
  try{
    const res=await AI.json(prompt,{cache:false});
    const byId={};pool.forEach(s=>byId[s.id]=s);let bad=0;
    const days=[];for(let i=0;i<S.nDays;i++){const d=(res.days||[])[i];const stops=[];let t=10*60;
      (d&&d.stops||[]).forEach(x=>{const s=byId[String(x.id)];if(!s){bad++;return}
        stops.push({n:s.name,k:s.cat,t:String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'),s:s.v,f:JSON.parse(JSON.stringify(s.f)),note:'AI 추천 이유 · '+String(x.reason||'').slice(0,120)});t+=150});
      days.push(stops.length?{label:'DAY '+(i+1),sub:String(d.sub||'AI 추천').slice(0,20),stops}:newDay(i))}
    S.plan={mode:'auto',days};S.day=0;S.addDay=0;S.openStop={0:true};renderRouteArea();renderPlanBanner();
    toast('AI 추천 동선을 표시했어'+(bad?' · 목록에 없는 장소 '+bad+'곳은 제외':'')+(res.note?' · '+String(res.note).slice(0,40):''));
  }catch(e){if(el)el.innerHTML='<div class="err" style="display:block">'+aiErr(e)+'</div>'}
}


