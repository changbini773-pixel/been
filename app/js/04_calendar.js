/* ============ js/04_calendar.js ============
   날짜 선택 달력, 여행 일수 계산
*/
/* ================= 달력 ================= */
var WD=['일','월','화','수','목','금','토'];
var iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
var pd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
var fmtS=s=>{const d=pd(s);return `${d.getMonth()+1}.${d.getDate()}(${WD[d.getDay()]})`};
var CAL={y:2026,m:9,a:null,b:null};

function openCal(){
  CAL.a=S.start||null; CAL.b=S.end||null;
  const base=CAL.a?pd(CAL.a):new Date();
  CAL.y=base.getFullYear(); CAL.m=base.getMonth();
  sheet('여행 기간 선택','출발일을 누른 뒤 도착일을 한 번 더 눌러줘. 당일치기면 같은 날을 두 번 누르면 돼.',
   `<div id="calBox"></div>
    <div class="ask-btns" style="grid-template-columns:1fr 1.4fr;margin-top:18px">
      <button class="btn line" onclick="closeSheet()">취소</button>
      <button class="btn pri" onclick="applyCal()">적용</button>
    </div>`);
  renderCal();
}
function calMove(n){let m=CAL.m+n,y=CAL.y;if(m<0){m=11;y--}if(m>11){m=0;y++}CAL.m=m;CAL.y=y;renderCal()}
function renderCal(){
  const first=new Date(CAL.y,CAL.m,1),pad=first.getDay(),last=new Date(CAL.y,CAL.m+1,0).getDate();
  let cells='';
  for(let i=0;i<pad;i++) cells+=`<span class="cd off"></span>`;
  for(let d=1;d<=last;d++){
    const k=iso(new Date(CAL.y,CAL.m,d)),dow=new Date(CAL.y,CAL.m,d).getDay();
    let cls='cd'+(dow===0?' sun':'');
    if(CAL.a&&CAL.b&&k>CAL.a&&k<CAL.b) cls+=' mid';
    if(k===CAL.a) cls+=' a';
    if(k===CAL.b) cls+=' b';
    if(CAL.a&&!CAL.b&&k===CAL.a) cls+=' b';
    cells+=`<button class="${cls}" onclick="pickDay('${k}')">${d}</button>`;
  }
  const n=(CAL.a&&CAL.b)?Math.round((pd(CAL.b)-pd(CAL.a))/86400000)+1:(CAL.a?1:0);
  g('calBox').innerHTML=`
    <div class="calhd">
      <button class="navb" onclick="calMove(-1)" aria-label="이전 달">${ic('chev',18,2.6,'transform:rotate(90deg)')}</button>
      <b>${CAL.y}년 ${CAL.m+1}월</b>
      <button class="navb" onclick="calMove(1)" aria-label="다음 달">${chevR(18)}</button>
    </div>
    <div class="calw">${WD.map(w=>`<span>${w}</span>`).join('')}</div>
    <div class="calg">${cells}</div>
    <div class="calsum">${CAL.a?`<b>${fmtS(CAL.a)}</b>${CAL.b&&CAL.b!==CAL.a?` – <b>${fmtS(CAL.b)}</b>`:''} · 총 <b>${n}일</b>`:'출발일을 골라줘'}</div>`;
}
function pickDay(k){if(!CAL.a||CAL.b||k<CAL.a){CAL.a=k;CAL.b=null}else CAL.b=k;renderCal()}
function applyCal(){
  if(!CAL.a){toast('출발일을 먼저 골라줘');return}
  S.start=CAL.a; S.end=CAL.b||CAL.a;
  syncDate(); closeSheet();
  toast('여행 기간을 총 '+S.nDays+'일로 바꿨어');
}
function syncDate(){
  const a=pd(S.start),b=pd(S.end);
  const md=d=>`${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')}`;
  g('fStart').textContent=md(a); g('fStartW').textContent=`${a.getFullYear()} · ${WD[a.getDay()]}요일`;
  g('fEnd').textContent=md(b); g('fEndW').textContent=`${b.getFullYear()} · ${WD[b.getDay()]}요일`;
  S.nDays=Math.round((b-a)/86400000)+1;
  g('dRange').innerHTML=S.nDays>1?(S.nDays-1)+'박 '+S.nDays+'일':'당일';
  if(S.plan) adjustPlanDays();
  renderRouteArea(); renderPlanBanner();
}

/* ================= 플랜 ================= */
function newDay(i,sub,stops){return {label:'DAY '+(i+1),sub:sub||'직접 구성',stops:stops||[]}}
function adjustPlanDays(){
  const p=S.plan;
  while(p.days.length<S.nDays) p.days.push(newDay(p.days.length));
  if(p.days.length>S.nDays){
    const cut=p.days.splice(S.nDays),lost=cut.reduce((a,d)=>a+d.stops.length,0);
    if(lost) toast('일정이 줄어서 '+lost+'곳이 빠졌어');
  }
  if(S.day>=p.days.length)S.day=0;
  if(S.addDay>=p.days.length)S.addDay=0;
}
