/* ============ js/08_spots.js ============
   편의 스팟 목록, 접근성 근거(eviHTML), 데이터 수집 현황 카드(dataNoteHTML)
*/
/* ================= 스팟 ================= */
function renderPlanBanner(){
  const el=g('planBanner');
  if(!S.plan){el.innerHTML='';return}
  el.innerHTML=`<div class="pbanner">
    <span class="lbl">담을 날짜를 고르고 아래에서 스팟을 추가해줘</span>
    <div class="r2"><div class="dchips">${S.plan.days.map((d,i)=>
      `<button class="dc${i===S.addDay?' on':''}" onclick="S.addDay=${i};renderPlanBanner();renderSpots()">${d.label} · ${d.stops.length}</button>`).join('')}</div>
    <button class="tbtn" onclick="goTab(0)">플랜 보기</button></div>
  </div>`;
}
function renderMineRow(){
  const m=M(S.mob),el=g('mineBox');
  if(S.mob==="선택 안 함"){el.innerHTML=`<p class="hint" style="margin:14px 2px 16px">이동 유형이 <b>선택 안 함</b>이라 모든 유형의 리뷰를 보여주고 있어. 위쪽 이동 유형 버튼에서 유형을 고르면 나와 같은 유형 리뷰만 걸러 볼 수 있어.</p>`;return}
  el.innerHTML=`<label class="mine-row">
    <span class="qi">${mobIc(m,20,1.8)}</span>
    <div class="tx"><div class="t">${m.n} 리뷰만 보기</div><div class="s">위에서 고른 이동 유형 기준</div></div>
    <span class="sw"><input type="checkbox" id="mineOnly" ${S.mineOnly?'checked':''} onchange="S.mineOnly=this.checked;renderSpots()"><i></i></span>
  </label>`;
}
function setF(k){S.filter=k;ET_ROOT.querySelectorAll('.fchip').forEach(c=>c.classList.toggle('on',c.dataset.f===k));renderSpots()}
function stars(n){return '★'.repeat(n)+'<span style="color:#D6D1C6">'+'★'.repeat(5-n)+'</span>'}
function renderSpots(){
  if(typeof renderAiEntry==='function')renderAiEntry();
  const r=R(),q=(g('q').value||'').trim(),free=S.mob==="선택 안 함",mineOnly=!free&&!!S.mineOnly;
  const list=(r.spots||[]).filter(s=>(S.filter==='all'||s.tags.includes(S.filter))&&(!q||s.name.includes(q)||s.cat.includes(q)));
  if(!list.length&&r.pending){g('spotList').innerHTML=pendingHTML(r);return}
  if(!list.length){g('spotList').innerHTML=`<div class="empty" style="margin-top:4px"><div class="ei">${ic('search',24,2)}</div><b>조건에 맞는 장소가 없어</b><p>필터를 줄이거나 다른 이름으로 검색해봐</p></div>`;return}
  const dn=r.pending&&!q?pendingHTML(r):r.dataNote&&S.filter==='all'&&!q?dataNoteHTML(r):(!r.real&&!r.empty?'<p class="sample" style="margin:0 0 12px">이 지역은 화면 시연용 예시 데이터야. 실데이터 수집 후 교체 예정.</p>':'');
  g('spotList').innerHTML=dn+list.map(s=>{
    const shown=mineOnly?s.rv.filter(v=>v.m===S.mob):s.rv,isOpen=!!S.open[s.id];
    const vis=isOpen?shown:shown.slice(0,1),mineCnt=s.rv.filter(v=>v.m===S.mob).length,added=inPlan(s.name);
    const ph=PHOTO[s.id];
    return `<div class="spot" id="card-${s.id}">
      ${(s.evi&&!ph)?'':`<div class="spot-ph${ph?' has':''}" id="ph-${s.id}" style="${ph?`background-image:url('${ph}')`:''}"><span class="ph-l">${GEO[s.id]&&GEO[s.id][3]?'주변 대표 사진':'장소 사진'}</span><span class="ph-c">사진: 위키백과</span></div>`}
      <div class="spot-hd">
        <div class="spot-top">
          <div style="min-width:0"><div class="spot-cat">${s.cat}</div><div class="spot-name">${s.name}</div><div class="spot-meta">${s.dist}</div></div>
          ${s.rate!=null?`<div class="rate"><b>${s.rate.toFixed(1)}</b><div class="stars">${stars(Math.round(s.rate))}</div><span>리뷰 ${s.cnt}</span></div>`:`<div class="verd v-${s.v}"><b>${s.v}</b><span>휠체어 판정</span></div>`}
        </div>
        <div class="badges">${s.badges.map(([t,l])=>`<span class="bdg ${t}">${t==='warn'?'! ':''}${l}</span>`).join('')}</div>
        <div class="acts">
          <button class="abtn ${added?'added':'pri'}" onclick="addToPlan('${s.id}')">${ic(added?'check':'plus',16,2.4)}${added?'담김':(S.plan?S.plan.days[S.addDay].label+'에 담기':'동선에 담기')}</button>
          ${s.book?`<button class="abtn" onclick="bookSheet('${s.id}','${s.book}')">${ic(s.book==='room'?'bed':'seat',17,1.9)}${s.book==='room'?'객실 예약':'좌석 예약'}</button>`:
            `<button class="abtn" onclick="toast('${s.name} 길안내 시작')">${ic('arrow',16,2.2)}길안내</button>`}
        </div>
      </div>
      ${s.evi?eviHTML(s):''}
      <div class="rv-wrap">
        <div class="rv-hd"><span class="t">사용자 리뷰</span><span>${free?'전체 유형 표시 중':S.mob+' '+mineCnt+'명'}</span></div>
        ${vis.length?vis.map(v=>rvHTML(v,s.id)).join(''):`<div class="no-rv">${S.mob} 사용자가 남긴 리뷰가 아직 없어.<br>첫 번째로 남겨볼래?</div>`}
        ${shown.length>1?`<button class="more" onclick="S.open['${s.id}']=!S.open['${s.id}'];renderSpots()">${isOpen?'리뷰 접기':'리뷰 '+(shown.length-1)+'개 더보기'}</button>`:''}
        <button class="more alt" onclick="reviewSheet('${s.id}')">${'리뷰 남기기'}</button>
      </div></div>`;
  }).join('');
  loadPhotos(list); if(MAP) drawMarkers();
}

function eviHTML(s){const e=s.evi;
  return `<div class="evi"><div class="evi-hd"><span class="t">수집 근거 · AI 추출</span><span>${e.ty} · 블로그 ${e.n}건</span></div>
    <p class="evi-b">${e.t}${e.w?`<br><span class="evi-w">주의 · ${e.w}</span>`:''}</p>
    <div class="evi-ft">${e.osm?'<span class="bdg info">OSM 휠체어 정보와 일치</span>':''}<a href="${e.u}" target="_blank" rel="noopener">대표 출처 보기 ↗</a></div>
    <p class="evi-n">원문을 그대로 싣지 않고 접근성 관련 사실만 요약했어. 실제 사용자 리뷰가 쌓이면 이 근거보다 우선 표시돼.</p></div>`}
function dataNoteHTML(r){const d=r.dataNote,v=d.verd;
  return `<div class="dnote"><div class="dn-k">실데이터 · ${d.src}</div>
    <div class="dn-big"><b>${d.hit}<small>/${d.total}</small></b><span>${d.noAll!=null?'접근성이 확인된 장소는':'접근성 언급이 있는 장소는'} <b>${(d.hit/d.total*100).toFixed(1)}%</b>뿐이야</span></div>
    <div class="dn-rows">${d.rows.map(([k,h,t])=>`<div class="dn-r"><span>${k}</span><i style="width:${Math.max(2,h/t*100*4)}%"></i><b>${h}/${t}</b></div>`).join('')}</div>
    <div class="dn-v"><span class="vs v-가능">가능 ${v['가능']}</span><span class="vs v-부분">부분 ${v['부분']}</span><span class="vs v-불가">불가 ${v['불가']}</span><span class="vs v-미확인">미확인 ${v['미확인']}</span><em>AI 추출 ${d.places}곳</em></div>
    <p>${d.noAll!=null?(d.noAll?`‘불가’ 판정 ${d.noAll}곳 중 ${d.noVisit}곳이 방문 후기에서 나왔어. 업체 표기만으로는 못 가는 곳을 알기 어려워.`:'이 지역에서는 ‘불가’ 판정이 아직 없어.'):`‘불가’ 판정 ${v['불가']}곳은 모두 방문 후기에서만 나왔어. 업체 표기에는 ‘불가’가 한 번도 없어.`}</p></div>`}
