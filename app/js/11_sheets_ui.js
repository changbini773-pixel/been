/* ============ js/11_sheets_ui.js ============
   바텀시트(택시·화장실·할인·동행자·SOS·예약), 탭 이동, 토스트, 온보딩
*/
/* ================= 시트 ================= */
function sheet(t,sub,body){
  g('shTitle').textContent=t; g('shSub').innerHTML=sub; g('shBody').innerHTML=body;
  g('sheetEl').classList.remove('reg-fixed'); g('sheetEl').scrollTop=0; g('sheetBg').classList.add('on');
}
function closeSheet(){g('sheetBg').classList.remove('on');const el=g('sheetEl');setTimeout(()=>{if(!g('sheetBg').classList.contains('on'))el.classList.remove('reg-fixed')},320)}
function taxiSheet(){
  const t=R().taxi;
  sheet('부르미 호출','현재 위치에서 가장 가까운 운영 기관으로 연결돼.',`
    <div class="row">${ic('taxi',24,1.7)}<div class="tx"><b>${t.n}</b><span>${t.note}</span></div><span class="val b">${t.tel}</span></div>
    <div class="stack">
      <button class="btn pri" onclick="toast('${t.n}로 전화 연결 중…')">${ic('phone',19,1.8)}전화로 연결</button>
      <button class="btn line" onclick="toast('앱에서 바로 호출 요청을 보냈어')">앱에서 바로 호출</button>
    </div>`);
}
function toiletSheet(){
  const r=R();
  sheet('근처 장애인 화장실',r.name+' · 현재 위치 기준 가까운 순.',
   r.toilets.map(t=>`<div class="row">${ic('wc',24,1.6)}
      <div class="tx"><b>${t.n} · <span style="display:inline;font:600 15px var(--mono);color:var(--ink)">${t.dist}</span></b><span>${t.d}</span></div>
      <span class="val${t.ok?'':' w'}">${t.st}</span></div>`).join('')+
   (r.toiletNote?`<p class="sample">${r.toiletNote}</p>`:'')+`<div class="stack"><button class="btn pri" onclick="toast('가장 가까운 화장실로 길안내 시작')">가장 가까운 곳 길안내</button></div>`);
}
function discountSheet(){
  const r=R();
  sheet('장애인 할인 정보',r.name+' · 복지카드·장애인등록증 지참 기준.',
   r.discounts.map(d=>`<div class="row">${ic('tag',22,1.8)}<div class="tx"><b>${d.n}</b><span>${d.d}</span></div><span class="val">${d.v}</span></div>`).join('')+
   `<p class="sample">${r.discNote?r.discNote+' ':''}할인율은 지자체·시즌에 따라 바뀔 수 있어. 방문 전 확인을 권해.</p>`);
}
function companionSheet(){
  sheet('동행자 · 위치 공유','가족이나 활동지원사가 내 위치와 다음 일정을 볼 수 있어.',
   COMPANIONS.map(c=>`<div class="row">${ic('users',22,1.8)}<div class="tx"><b>${c.n}</b><span>${c.r}</span></div>
      <span class="val${c.on?'':' w'}">${c.on?'공유 중':'대기'}</span></div>`).join('')+
   `<div class="row"><div class="tx"><b>초대 코드</b><span>상대가 앱에서 코드를 입력하면 연결돼</span></div>
      <span class="val b" style="font-size:15px;letter-spacing:1px">ET-4K9P</span></div>
    <div class="stack">
      <button class="btn pri" onclick="toast('초대 링크를 복사했어')">초대 링크 보내기</button>
      <button class="btn line" onclick="toast('실시간 위치 공유를 중지했어')">위치 공유 중지</button>
    </div>`);
}
function sosSheet(){
  const r=R();
  sheet('긴급 도움','현재 위치와 다음 일정이 함께 전송돼.',
   `<div class="row" style="border:2px solid var(--sos)"><span style="color:var(--sos)">${ic('pin',22,1.9)}</span>
      <div class="tx"><b>현재 위치</b><span>${r.name} 일대 · GPS 수신 중</span></div></div>`+
   CONTACTS.map(c=>`<div class="row">${ic('user',22,1.8)}<div class="tx"><b>${c.n} · ${c.r}</b><span style="font-family:var(--mono)">${c.p}</span></div></div>`).join('')+
   `<div class="stack">
      <button class="btn sos" onclick="toast('비상 연락처 2명에게 위치를 전송했어')">${ic('sos',20,2)}비상 연락처에 위치 전송</button>
      <button class="btn sos-l" onclick="toast('119 연결 화면으로 이동')">${ic('phone',19,1.9)}119 신고</button>
      <button class="btn line" onclick="taxiSheet()">부르미 호출</button>
    </div>`);
}
function bookSheet(id,kind){
  const sp=(R().spots||[]).find(s=>s.id===id)||{name:'예약 가능 매장'};
  if(kind==='room'){
    sheet('배리어프리 객실 예약',sp.name,`
      <div class="row">${ic('bed',22,1.8)}<div class="tx"><b>객실 사양</b><span>출입문 폭 90cm · 침대 높이 45cm · 롤인 샤워 · 비상벨</span></div></div>
      <div class="row">${ic('cal',22,1.8)}<div class="tx"><b>체크인 · 체크아웃</b><span>${fmtS(S.start)} – ${fmtS(S.end)} · ${S.nDays-1}박</span></div><span class="val">예약 가능</span></div>
      <span class="flbl">객실 선택</span>
      <div class="slots">
        <button class="slot on" onclick="pickSlot(this)">롤인 샤워형</button>
        <button class="slot" onclick="pickSlot(this)">욕조형</button>
        <button class="slot off" disabled>트윈형</button>
      </div>
      <p class="hint">줄 그어진 객실은 해당 기간에 이미 찼어.</p>
      <div class="stack"><button class="btn pri" onclick="toast('객실 예약 요청을 보냈어')">예약 요청</button></div>`);
  }else{
    sheet('휠체어석 예약',sp.name,`
      <div class="row">${ic('seat',22,1.8)}<div class="tx"><b>테이블 정보</b><span>높이 72cm · 하부 여유 68cm · 통로 폭 95cm</span></div></div>
      <span class="flbl">시간 선택</span>
      <div class="slots">
        ${["11:30","12:00","12:30","13:00","13:30","14:00"].map((t,i)=>
          `<button class="slot t${i===3?' on':''}${i===1?' off':''}" ${i===1?'disabled':''} onclick="pickSlot(this)">${t}</button>`).join('')}
      </div>
      <p class="hint">줄 그어진 시간은 휠체어석이 모두 찼어.</p>
      <div class="stack"><button class="btn pri" onclick="toast('휠체어석 예약을 요청했어')">예약 요청</button></div>`);
  }
}
function pickSlot(el){el.parentElement.querySelectorAll('.slot').forEach(s=>s.classList.remove('on'));el.classList.add('on')}

/* ================= 탭 ================= */
function goTab(i){
  S.tab=i;
  ET_ROOT.querySelectorAll('.et .view').forEach((v,k)=>v.classList.toggle('on',k===i));
  ET_ROOT.querySelectorAll('.et .nav-b').forEach((b,k)=>b.classList.toggle('on',k===i));
  g('main').scrollTop=0;
  if(S.speaking) stopSpeak();
  if(i===2) renderReports();
  if(i===1){renderPlanBanner();setTimeout(()=>{if(!MAP)initMap();else mapResize()},60)}
  if(i===3){renderMe();renderMy()}
  if(i===0&&S.autoTts&&S.plan) setTimeout(speakRoute,350);
}
var tid;
function toast(m){
  const t=g('toast'); g('toastMsg').textContent=m;
  t.classList.add('on'); clearTimeout(tid);
  tid=setTimeout(()=>t.classList.remove('on'),2400);
}


var ONB=0;
function onbNext(){
  const sl=ET_ROOT.querySelectorAll('.onb-s');
  if(ONB>=sl.length-1){g('onb').classList.add('done');setTimeout(()=>{const o=g('onb');if(o)o.style.display='none'},400);return}
  sl[ONB].classList.remove('on');sl[ONB].classList.add('past');
  ONB++;sl[ONB].classList.add('on');
}
