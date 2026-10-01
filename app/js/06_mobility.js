/* ============ js/06_mobility.js ============
   이동유형 선택(휠체어/노약자/시각장애)
*/
function setMob(name,fromSheet){
  const changed=S.mob!==name;
  S.mob=name; const m=M(name);
  g('brandIc').innerHTML=mobIc(m,22);
  g('brandSub').textContent=name;
  g('brandDesc').textContent=m.d;
  g('condBox').innerHTML=m.cond.map(([c,on])=>`
    <label class="toggle-row">
      <div><div class="tr-l">${ic('check',20,2.2)}${c}</div><div class="sub">켜면 조건을 만족하는 장소만 추천에 들어가</div></div>
      <span class="sw"><input type="checkbox" ${on?'checked':''} onchange="toast('조건을 바꿨어')"><i></i></span>
    </label>`).join('');
  if(name==="시각장애 동반"&&!S.autoTts){S.autoTts=true;g('swAuto').checked=true}
  S.open={};
  renderMineRow(); renderSpots(); renderMe(); renderRouteArea();
  if(fromSheet) closeSheet();
  if(changed) toast(name==="선택 안 함"?'필터를 껐어. 모든 정보를 그대로 보여줄게':name+' 기준으로 바꿨어');
}
function mobSheet(){
  sheet('이동 유형 선택','선택한 유형에 맞춰 리뷰 필터와 추천 기준이 바뀌어. 고르기 애매하면 <b>선택 안 함</b>으로 두고 전체 정보를 봐도 돼.',
   MOBS.map(m=>`
    <button class="mo${m.n===S.mob?' on':''}" onclick="setMob('${m.n}',true)">
      <span class="mo-ic">${mobIc(m,22,1.8)}</span>
      <span class="mo-tx"><b>${m.n}</b><span>${m.d}</span></span>
      <span class="mo-ck">${ic('check',22,2.8)}</span>
    </button>`).join(''));
}
