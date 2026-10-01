/* ============ js/10_reports_me.js ============
   제보 탭, 내 정보 탭
*/
function renderReports(){
  g('repCnt').textContent='오늘 '+REPORTS.length+'건';
  g('repList').innerHTML=REPORTS.map(r=>{
    const m=M(r.m),on=!!S.helped['r'+r.id];
    return `<div class="rep">
      <div class="rep-head">${rtypeTag(r.ty)}<span class="rep-time">${r.d}</span></div>
      <div class="rep-loc">${ic('pin',18,2)}${r.loc}</div>
      <div class="rep-body">${r.t}</div>
      <div class="rep-who">
        <div class="av" style="background:${m.c}">${r.a.slice(0,1)}</div>
        <div class="rv-nm">${r.a}<span class="mob" style="background:${m.bg};color:${m.tc}">${r.m}</span></div>
      </div>
      <div class="rep-ft">
        <button class="help${on?' on':''}" aria-pressed="${on}" onclick="S.helped['r${r.id}']=!S.helped['r${r.id}'];renderReports()">${ic('thumb',15,1.9)}도움돼요 ${r.h+(on?1:0)}</button>
        ${(()=>{const p=planStopFor(r.loc);return p?`<button class="help" onclick="excludeStop(${p.d},${p.i})">${S.plan.days[p.d].label} 동선에서 제외</button>`:''})()}
      </div></div>`;
  }).join('');
}
function reportSheet(){
  sheet('지금 상황 제보하기','같은 길을 지날 사람들에게 바로 전달돼.',`
    <div class="fform">
      <label class="flbl" for="rLoc">장소</label><input id="rLoc" type="text" placeholder="예: 대릉원 정문 경사로">
      <label class="flbl" for="rTy">유형</label>
      <select id="rTy">
        <option value="obstacle">이동 장벽 (공사·계단·경사로 훼손)</option>
        <option value="broken">시설 고장 (엘리베이터·자동문·리프트)</option>
        <option value="good">개선됨 (턱 완화·시설 신설)</option>
      </select>
      <label class="flbl" for="rTxt">상세 내용</label>
      <textarea id="rTxt" rows="3" placeholder="어디가 어떻게 막혔는지, 우회로가 있는지 적어줘"></textarea>
      <div class="err" id="rErr">장소와 상세 내용을 모두 적어줘</div>
      <button class="btn pri" style="margin-top:18px" onclick="submitReport()">제보 등록</button>
    </div>`);
}
function submitReport(){
  const loc=g('rLoc').value.trim(),txt=g('rTxt').value.trim(),err=g('rErr');
  if(!loc||!txt){err.classList.add('on');return}
  err.classList.remove('on');
  REPORTS.unshift({id:Date.now(),a:"나",m:S.mob==="선택 안 함"?"휠체어":S.mob,ty:g('rTy').value,loc,d:"방금",h:0,t:txt,mine:1,region:R().name});
  renderReports(); renderMe(); renderMy(); closeSheet(); goTab(2);
  toast('제보를 등록했어. 마이페이지에서도 볼 수 있어');
}
function delReport(id){
  const i=REPORTS.findIndex(r=>r.id===id); if(i>=0)REPORTS.splice(i,1);
  renderReports(); renderMe(); renderMy(); toast('제보를 지웠어');
}

/* ================= 마이페이지 ================= */
function myReports(){return REPORTS.filter(r=>r.a==='나')}
function renderMe(){
  const m=M(S.mob),rv=S.myReviews,rp=myReports();
  const help=rv.reduce((a,r)=>a+r.h,0)+rp.reduce((a,r)=>a+r.h,0);
  g('meCard').innerHTML=`
    <div class="me-top">
      <div class="me-av" style="background:${m.c}">${mobIc(m,26,1.8)}</div>
      <div class="me-tx"><b>나</b><span>${m.n} · ${m.d}</span></div>
      <button class="mini" onclick="mobSheet()">유형 변경</button>
    </div>
    <div class="me-stats">
      <div><b>${rv.length}</b><span>내가 쓴 리뷰</span></div>
      <div><b>${rp.length}</b><span>내가 한 제보</span></div>
      <div><b>${help}</b><span>받은 도움돼요</span></div>
    </div>`;
}
function setMyTab(i){S.myTab=i;g('sg0').classList.toggle('on',i===0);g('sg1').classList.toggle('on',i===1);renderMy()}
function renderMy(){
  const el=g('myList');
  if(S.myTab===0){
    const rv=S.myReviews;
    if(!rv.length){el.innerHTML=`<div class="empty"><div class="ei">${ic('pen',24,1.8)}</div>
      <b>아직 쓴 리뷰가 없어</b><p>편의 스팟에서 다녀온 곳에<br>리뷰를 남기면 여기 모여</p>
      <button class="btn pri" onclick="goTab(1)">편의 스팟 열기</button></div>`;return}
    el.innerHTML=rv.map((r,i)=>`<div class="myc">
      <div class="myc-top"><div style="min-width:0"><b>${r.spotName}</b>
        <div class="meta">${r.regionName} · ${r.d} · <span style="color:var(--star)">${'★'.repeat(r.st)}</span></div></div>
        <button class="help del" onclick="delReview(${i})">삭제</button></div>
      <div class="bd">${r.t}</div></div>`).join('');
  }else{
    const rp=myReports();
    if(!rp.length){el.innerHTML=`<div class="empty"><div class="ei">${ic('chat',24,1.8)}</div>
      <b>아직 한 제보가 없어</b><p>공사·고장을 발견하면 제보해줘<br>다음 사람 동선에 바로 반영돼</p>
      <button class="btn pri" onclick="goTab(2)">제보하러 가기</button></div>`;return}
    el.innerHTML=rp.map(r=>`<div class="myc">
      <div class="myc-top"><div style="min-width:0"><b>${r.loc}</b>
        <div class="meta">${r.region||R().name} · ${r.d} · 도움돼요 ${r.h}</div></div>${rtypeTag(r.ty)}</div>
      <div class="bd">${r.t}</div>
      <div class="rep-ft"><button class="help del" onclick="delReport(${r.id})">삭제</button></div></div>`).join('');
  }
}
