/* ============ js/09_reviews.js ============
   후기 작성·표시
*/
function rvHTML(r,sid){
  const m=M(r.m),key=sid+'_'+r.a+'_'+r.d,on=!!S.helped[key];
  return `<div class="rv">
    <div class="rv-top">
      <div class="av" style="background:${m.c}">${r.a.slice(0,1)}</div>
      <div class="rv-who"><div class="rv-nm">${r.a}<span class="mob" style="background:${m.bg};color:${m.tc}">${r.m}</span></div><div class="rv-dt">${r.d} 방문</div></div>
      <div class="rv-st">${stars(r.st)}</div></div>
    <div class="rv-body">${r.t}</div>
    <div class="rv-ft">
      <button class="help${on?' on':''}" aria-pressed="${on}" onclick="S.helped['${key}']=!S.helped['${key}'];renderSpots()">${ic('thumb',15,1.9)}도움돼요 ${r.h+(on?1:0)}</button>
      ${r.m===S.mob?`<span class="mine-tag">${ic('check',14,2.8)}나와 같은 이동유형</span>`:''}
    </div></div>`;
}

/* ================= 리뷰 쓰기 ================= */
var RVST=5;
function reviewSheet(id){
  const sp=R().spots.find(s=>s.id===id); if(!sp)return;
  RVST=5;
  sheet('리뷰 쓰기',sp.name+' · <b>'+S.mob+'</b> 기준으로 기록돼.',`
    <div class="fform">
      <span class="flbl">별점</span>
      <div class="strow" id="strow">${[1,2,3,4,5].map(i=>`<button class="stb on" onclick="setRvSt(${i})" aria-label="별 ${i}개">★</button>`).join('')}</div>
      <label class="flbl" for="rvTxt">내용</label>
      <textarea id="rvTxt" rows="4" placeholder="턱 높이, 경사, 화장실 위치처럼 다음 사람이 알아야 할 걸 적어주면 좋아"></textarea>
      <div class="err" id="rvErr">내용을 10자 이상 적어줘</div>
      <button class="btn pri" style="margin-top:18px" onclick="submitReview('${id}')">리뷰 등록</button>
    </div>`);
}
function setRvSt(n){RVST=n;ET_ROOT.querySelectorAll('#strow .stb').forEach((b,i)=>b.classList.toggle('on',i<n))}
function today(){const d=new Date();return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`}
function submitReview(id){
  const sp=R().spots.find(s=>s.id===id),t=g('rvTxt').value.trim(),err=g('rvErr');
  if(t.length<10){err.classList.add('on');return}
  err.classList.remove('on');
  const rec={a:"나",m:S.mob==="선택 안 함"?"휠체어":S.mob,d:today(),st:RVST,h:0,t};
  sp.rv.unshift(rec); sp.cnt++;
  S.myReviews.unshift({spotId:id,spotName:sp.name,region:S.region,regionName:R().name,...rec});
  closeSheet(); renderSpots(); renderMe(); renderMy();
  toast('리뷰를 남겼어. 마이페이지에서 볼 수 있어');
}
function delReview(i){
  const r=S.myReviews[i],reg=REGIONS[r.region],sp=(reg.spots||[]).find(s=>s.id===r.spotId);
  if(sp){const k=sp.rv.findIndex(v=>v.a==='나'&&v.t===r.t);if(k>=0){sp.rv.splice(k,1);sp.cnt--}}
  S.myReviews.splice(i,1);
  renderSpots(); renderMe(); renderMy(); toast('리뷰를 지웠어');
}

/* ================= 제보 ================= */
function rtypeTag(ty){const[lbl]=RTY[ty],[bg,tc]=RTC[ty];return `<span class="rtype" style="background:${bg};color:${tc}">${lbl}</span>`}
