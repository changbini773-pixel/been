/* ============ js/05_route_plan.js ============
   AI 추천 동선(일정) 생성·표시, 일정 편집, 음성 안내(TTS), 큰 글씨
*/
function showRoute(){
  const r=R();
  if(!r.days.length){toast('이 지역은 아직 검증된 동선이 없어');return}
  const days=[];
  for(let i=0;i<S.nDays;i++){const src=r.days[i];days.push(src?{label:'DAY '+(i+1),sub:src.sub,stops:JSON.parse(JSON.stringify(src.stops))}:newDay(i))}
  S.plan={mode:'auto',days}; S.day=0; S.addDay=0; S.openStop={0:true};
  renderRouteArea(); renderPlanBanner();
  toast(days.filter(d=>d.stops.length).length+'일치 AI 추천 동선을 표시했어');
}
function startManual(){
  const days=[];for(let i=0;i<S.nDays;i++) days.push(newDay(i));
  S.plan={mode:'manual',days}; S.day=0; S.addDay=0; S.openStop={};
  renderRouteArea(); renderPlanBanner(); goTab(1);
  toast('직접 구성 모드야. 스팟을 골라서 DAY 1에 담아봐');
}
function clearPlan(){
  const had=S.plan&&S.plan.days.some(d=>d.stops.length);
  S.plan=null; S.openStop={};
  g('statRow').style.display='none';
  renderRouteArea(); renderPlanBanner();
  toast(had?'동선을 지웠어. 처음부터 다시 정할 수 있어':'처음 화면으로 돌아왔어');
}
function addToPlan(spotId){
  const r=R(),sp=r.spots.find(s=>s.id===spotId); if(!sp)return;
  if(!S.plan){const days=[];for(let i=0;i<S.nDays;i++) days.push(newDay(i));S.plan={mode:'manual',days};S.day=0;S.addDay=0}
  const d=S.plan.days[S.addDay];
  if(d.stops.some(x=>x.n===sp.name)){toast(d.label+'에 이미 담겨 있어');return}
  const last=d.stops[d.stops.length-1],t=last?addMin(last.t,120):'10:00';
  d.stops.push({n:sp.name,k:sp.cat.split('·')[0].trim(),t,s:sp.rate!=null?sp.rate.toFixed(1):sp.v,
    f:JSON.parse(JSON.stringify(sp.f)),book:sp.book,bookId:sp.id,disc:(sp.badges.find(b=>b[0]==='info')||[])[1]});
  renderRouteArea(); renderPlanBanner(); renderSpots();
  toast(sp.v==='불가'?sp.name+'은 휠체어 불가 판정이야. 담았지만 대안을 꼭 확인해':sp.name+'을 '+d.label+'에 담았어');
}
function addMin(t,mins){const[h,m]=t.split(':').map(Number);let x=Math.min(h*60+m+mins,22*60);return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')}
function removeStop(d,i){
  const nm=S.plan.days[d].stops[i].n;
  S.plan.days[d].stops.splice(i,1); S.openStop={};
  renderRouteArea(); renderPlanBanner(); renderSpots();
  toast(nm+'을 동선에서 뺐어');
}
function inPlan(name){return !!(S.plan&&S.plan.days.some(d=>d.stops.some(s=>s.n===name)))}

function renderRouteArea(){
  const el=g('routeArea'),r=R();
  if(!S.plan){
    g('statRow').style.display='none';
    const avail=Math.min(S.nDays,r.days.length);
    el.innerHTML=`
      <div class="ask">
        <span class="lbl">AI 추천 동선</span>
        <h2>${r.name} ${S.nDays}일 일정</h2>
        ${avail?`<p>${S.mob} 기준으로 이동할 수 있는 <b>${avail}일치 AI 추천 동선</b>을 찾았어. 표시할까?</p>
        ${r.real&&typeof aiOn==="function"&&aiOn()?`<button class="btn ai-route" onclick="aiRoute()"><span class="ai-k">AI</span>실데이터 ${r.spots.length}곳 중에서 AI가 다시 골라줘</button><div id="aiRouteMsg"></div>`:''}
        <div class="ask-btns">
          <button class="btn ghost-inv" onclick="startManual()">직접 짤래</button>
          <button class="btn inv" onclick="showRoute()">AI 추천 동선 표시</button>
        </div>`:`<p>${r.name}은 아직 AI 추천 동선이 없어. 직접 일정을 짜서 담아봐.</p>
        <div class="ask-btns">
          <button class="btn inv" onclick="startManual()">직접 짤래</button>
        </div>`}
      </div>`;
    return;
  }
  const p=S.plan,total=p.days.reduce((a,d)=>a+d.stops.length,0);
  el.innerHTML=`
    <div class="ptool">
      <div class="tx"><b>${p.mode==='auto'?'AI 추천 동선':'직접 구성 중'}</b><span>${r.name} · 총 ${total}곳 담김</span></div>
      <button class="tbtn" onclick="goTab(1)">스팟 담기</button>
      <button class="tbtn warn" onclick="clearPlan()">취소</button>
    </div>
    <div class="days" id="days"></div>
    <div id="wxBox"></div>
    <div id="alertBox"></div>
    <div class="ttsbar">
      <span class="qi">${ic('speak',21,1.8)}</span>
      <div class="t"><b>동선 음성 안내</b><span id="ttsSub">순서·시간·접근성 정보를 읽어줘</span></div>
      <button class="play" id="ttsBtn" onclick="speakRoute()">${ic('speak',16,2)}<span id="ttsLbl">듣기</span></button>
    </div>
    <div id="tlBox"></div>`;
  g('statRow').style.display='grid';
  renderDays(); renderRoute();
}
function renderDays(){
  const p=S.plan;
  g('days').innerHTML=p.days.map((d,i)=>
    `<button class="dbtn${i===S.day?' on':''}" onclick="S.day=${i};S.addDay=${i};S.openStop={0:true};renderDays();renderRoute();renderPlanBanner()">
      <b>${d.label}</b><span>${d.stops.length?d.sub+' · '+d.stops.length+'곳':'비어 있음'}</span></button>`).join('');
  const d=p.days[S.day];
  const warnN=d.stops.reduce((a,s)=>a+s.f.filter(f=>f[2]==='warn').length,0);
  const discN=d.stops.filter(s=>s.disc).length;
  g('stN').innerHTML=d.stops.length+'<small>곳</small>';
  g('stW').innerHTML=warnN+'<small>개</small>';
  g('stD').innerHTML=discN+'<small>곳</small>';
}
function wxKey(){return S.region+'_'+S.day}
function cycleWx(){const o=['clear','rain','snow'],k=wxKey();S.wx[k]=o[(o.indexOf(S.wx[k]||'clear')+1)%3];renderRoute()}
function renderRoute(){
  const day=S.plan.days[S.day],w=S.wx[wxKey()]||'clear',wx=WX[w];
  g('wxBox').innerHTML=`
    <div class="wx ${w}">${ic(wx.ic.slice(3),26,1.7)}
      <div class="wx-tx"><b>${wx.t}</b><p>${wx.p}</p></div>
      <button class="wx-sw" onclick="cycleWx()">날씨 변경</button>
    </div>`;
  const showAlert=S.region==='gyeongju'&&day.stops.some(s=>s.n.indexOf('대릉원')>=0);
  g('alertBox').innerHTML=showAlert?`
    <div class="alert"><span class="ai">!</span>
      <div><b>대릉원 정문 경사로 공사 중</b><p>측면 2번 출입구로 우회 안내 중 · 10/20까지 · 제보 2건</p></div>
    </div>`:'';
  if(!day.stops.length){
    g('tlBox').innerHTML=`
      <div class="empty"><div class="ei">${ic('map',26,1.7)}</div>
        <b>${day.label}이 비어 있어</b><p>편의 스팟에서 갈 곳을 골라 담아줘</p>
        <button class="btn pri" onclick="goTab(1)">편의 스팟 열기</button>
      </div>`;
    return;
  }
  const slip=w!=='clear',n=day.stops.length;
  g('tlBox').innerHTML='<div class="tl">'+day.stops.map((s,i)=>{
    const facts=s.f.slice();
    if(slip) facts.push(["기상 경보",w==='rain'?"강수 · 노면 미끄러움":"적설 · 경사 결빙 위험","warn"]);
    const open=!!S.openStop[i],warnN=facts.filter(f=>f[2]==='warn').length;
    const sum=facts[0][1]+(facts[1]?' · '+facts[1][1]:'');
    return `<div class="stop${open?' open':''}">
      <span class="st-time">${s.t}</span><span class="st-dot"></span>
      <div class="stop-card">
        <button class="stop-hd" aria-expanded="${open}" onclick="S.openStop[${i}]=!S.openStop[${i}];renderRoute()">
          <span class="l">
            <span class="kicker">${String(i+1).padStart(2,'0')} · ${s.k}</span>
            <span class="stop-name">${s.n}</span>
            <span class="sumline">${sum}${warnN?`<span class="wtag">! 주의 ${warnN}</span>`:''}</span>
          </span>
          <span class="stop-r"><span class="score">${/^[\d.]+$/.test(s.s)?'<i>★</i>'+s.s:'<span class="vs v-'+s.s+'">'+s.s+'</span>'}</span><span class="cv">${ic('chev',20,2.4)}</span></span>
        </button>
        <div class="stop-body">
          <div class="tmwrap"><input type="time" value="${s.t}" onchange="setTime(${S.day},${i},this.value)" aria-label="${s.n} 도착 시간"><span>도착 시간 변경</span></div>
          <div class="facts">${facts.map(([k,v,st])=>`
            <div class="fact"><span class="mk ${st}">${st==='ok'?ic('check',14,3):'!'}</span><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}</div>
          ${s.note?`<div class="note">${s.note}</div>`:''}
          ${s.disc?`<div class="disc">${ic('tag',15,2)}할인 · ${s.disc}</div>`:''}
          <div class="acts">
            <button class="abtn del" onclick="removeStop(${S.day},${i})" aria-label="${s.n} 빼기">${ic('x',15,2.4)}빼기</button>
            ${s.book?`<button class="abtn" onclick="bookSheet('${s.bookId||''}','${s.book}')">${s.book==='room'?'객실 예약':'좌석 예약'}</button>`:''}
            <button class="abtn pri" onclick="toast('${s.n} 길안내 시작')">길안내${ic('arrow',15,2.4)}</button>
          </div>
        </div>
      </div>
      ${s.leg&&i<n-1?`<div class="leg-l">${ic('arrow',15,2.2,'transform:rotate(90deg)')}${s.leg}</div>`:'<div class="leg-sp"></div>'}
    </div>`}).join('')+'</div>';
}
function setTime(d,i,v){if(!v)return;S.plan.days[d].stops[i].t=v;renderRoute();toast('도착 시간을 '+v+'로 바꿨어')}

/* ================= TTS ================= */
function speakRoute(){
  if(!('speechSynthesis' in window)){toast('이 브라우저는 음성 안내를 지원하지 않아');return}
  if(S.speaking){stopSpeak();return}
  const day=S.plan&&S.plan.days[S.day];
  if(!day||!day.stops.length){toast('읽을 동선이 아직 없어');return}
  const r=R(),w=WX[S.wx[wxKey()]||'clear'];
  let txt=`${r.name} ${day.label} 동선입니다. 오늘 날씨는 ${w.t}. ${w.p} `;
  day.stops.forEach((s,i)=>{
    txt+=`${i+1}번째 장소, ${s.t} ${s.n}. `;
    s.f.forEach(f=>txt+=`${f[0]} ${f[1]}. `);
    if(s.note)txt+=s.note+' ';
    if(s.leg)txt+=`다음 장소까지 ${s.leg}. `;
  });
  const u=new SpeechSynthesisUtterance(txt); u.lang='ko-KR'; u.rate=.95;
  u.onend=()=>setSpeak(false); u.onerror=()=>setSpeak(false);
  speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeak(true);
}
function stopSpeak(){try{speechSynthesis.cancel()}catch(e){}setSpeak(false)}
function setSpeak(on){
  S.speaking=on;
  const b=g('ttsBtn'); if(!b)return;
  b.classList.toggle('stop',on);
  g('ttsLbl').textContent=on?'중지':'듣기';
  b.querySelector('use').setAttribute('href',on?'#i-stop':'#i-speak');
  g('ttsSub').textContent=on?'읽는 중… 다시 누르면 멈춰':'순서·시간·접근성 정보를 읽어줘';
}

/* ================= 이동 유형 ================= */
function toggleBig(){
  S.big=!S.big;
  document.body.classList.toggle('big',S.big);
  g('btnBig').classList.toggle('act',S.big);
  g('btnBig').setAttribute('aria-pressed',S.big);
  g('swBig').checked=S.big;
  toast(S.big?'큰 글씨 모드를 켰어':'큰 글씨 모드를 껐어');
}
