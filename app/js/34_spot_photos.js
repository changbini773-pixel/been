/* ============ js/34_spot_photos.js ============
   장소 사진 표시(사진 없으면 카테고리 일러스트), 실데이터 지역 전용 버튼 처리
*/
var GS_AREA=[[/진량|대구대/,'대구대학교','주변 대표 사진'],[/와촌|갓바위/,'관봉 석조여래좌상','주변 대표 사진'],[/남산면/,'반곡지','주변 대표 사진'],[/경산역|중앙동|사정동|경산 시내/,'경산역','주변 대표 사진']];
function spotPhoto(s){
  if(IMGS[s.name])return [IMGS[s.name],'장소 사진','위키백과'];
  if(SPOTPH[s.id])return [SPOTPH[s.id].d,'','',1];   // 130x86 썸네일: 라벨·출처 문구 없이, 늘리지 않고 작게 보여준다(4번째 값=저해상도)
  if(s.ph&&IMGS[s.ph[0]])return [IMGS[s.ph[0]],s.ph[1]];
  if(GEO[s.id]&&GEO[s.id][2]&&IMGS[GEO[s.id][2]])return [IMGS[GEO[s.id][2]],GEO[s.id][3]?'주변 대표 사진':'장소 사진'];
  if(s.evi){const area=s.dist||'';for(const [re,t,l] of GS_AREA)if(re.test(area)&&IMGS[t])return [IMGS[t],l];
    if(/경산시청|시청/.test(s.name)&&IMGS['경산시'])return [IMGS['경산시'],'장소 사진']}
  return null}
/* 사진이 깨지면 카테고리 일러스트로 바꾼다 */
function phBroken(img){const ph=img.parentNode,card=ph&&ph.parentNode;if(!card)return;
  const s=(R().spots||[]).find(x=>x.id===card.id.replace('card-',''));if(!s)return;
  ph.className='spot-ph has art';ph.style.backgroundImage='';ph.innerHTML=catArt(s)+`<span class="ph-l">${catKo(s)}</span>`}
var _renderSpots1=renderSpots;
renderSpots=function(){_renderSpots1();
  document.querySelectorAll('#spotList .spot').forEach(card=>{const id=card.id.replace('card-',''),s=(R().spots||[]).find(x=>x.id===id);if(!s)return;
    let ph=card.querySelector('.spot-ph');if(!ph){ph=document.createElement('div');card.insertBefore(ph,card.firstChild)}
    const p=spotPhoto(s);
    if(p){ph.className='spot-ph has fit';ph.style.backgroundImage="url('"+p[0]+"')";
      ph.innerHTML=`<img class="ph-img${p[3]?' low':''}" src="${p[0]}" alt="${esc(s.name)}" onerror="phBroken(this)">`
        +(p[1]&&p[1]!=='장소 사진'?`<span class="ph-l" style="display:block">${p[1]}</span>`:'')
        +(p[2]?`<span class="ph-c" style="display:block">사진: ${esc(p[2])}</span>`:'')}
    else{ph.className='spot-ph has art';ph.style.backgroundImage='';ph.innerHTML=catArt(s)+`<span class="ph-l">${catKo(s)}</span>`}});
  if(MAP)renderIMap();
};
loadPhotos=function(){};

/* ================= 실데이터 지역만 화장실·할인 표시 ================= */
function syncRealOnly(){}
var _toiletSheet0=toiletSheet,_discountSheet0=discountSheet;
function notYet(t,what){const r=R();sheet(t,r.name+' · '+(r.pending?'실데이터 수집 대기':'실데이터 미수집 지역'),`<div class="empty" style="margin-top:4px"><div class="ei">${ic(what==='화장실'?'wc':'tag',24,1.8)}</div><b>아직 ${what} 정보가 없어</b><p>실제로 데이터를 모은 지역(현재 경산)만 ${what} 정보를 보여줘. 이 지역은 수집이 끝나면 채워져.</p></div>`)}
toiletSheet=function(){R().real?_toiletSheet0():notYet('근처 장애인 화장실','화장실')};
discountSheet=function(){R().real?_discountSheet0():notYet('장애인 할인 정보','할인')};
var _setRegion2=setRegion;setRegion=function(k){IMAP.sel=null;_setRegion2(k);syncRealOnly()};
try{syncRealOnly();renderSpots()}catch(e){console.warn(e)}


