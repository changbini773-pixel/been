/* ============ js/36_kakao_map.js ============
   편의 스팟 탭의 지도를 실제 카카오맵으로 보여준다(대한민국 범위 안으로 제한).
   - 카카오 JavaScript 키는 코드에 넣지 않는다. 지도 아래 "카카오 지도 연결" 버튼으로 넣으면 이 브라우저(localStorage)에만 저장된다.
     (개발 중에는 페이지보다 먼저 로드되는 스크립트에서 window.ET_KAKAO_KEY 로 줘도 된다)
   - 카카오 SDK는 카카오 개발자 콘솔에 등록한 http(s) 주소에서만 동작한다. file:// 이나 미등록 주소, 키가 없거나 응답이 없으면
     32_map_svg.js 의 간이 SVG 지도로 그대로 보여준다.
   - 핀 색은 선택한 이동 유형의 판정(가능/부분/불가/기타)이고, 유형 필터(35_type_judg.js의 mapPts)를 따른다.
*/
var KM={key:'',legend:null,sig:'',pend:null,dog:0};
var KR_BOUNDS=[32.8,124.3,38.9,132.2];            // [남,서,북,동] 대한민국 범위(제주·울릉·독도 포함해 여유 있게)
var KM_LS='et_kakao_key';

function kmKey(){
  var k=(window.ET_KAKAO_KEY||'');
  if(!k){try{k=localStorage.getItem(KM_LS)||''}catch(e){}}
  return String(k).trim();
}
function kmInKorea(lat,lng){return lat>=KR_BOUNDS[0]&&lat<=KR_BOUNDS[2]&&lng>=KR_BOUNDS[1]&&lng<=KR_BOUNDS[3]}
function kmLoad(key){return new Promise(function(res){
  if(window.kakao&&kakao.maps&&kakao.maps.LatLng)return res(true);
  var done=0,fin=function(v){if(!done){done=1;res(v)}};
  var sc=document.createElement('script');sc.async=true;
  sc.src='https://dapi.kakao.com/v2/maps/sdk.js?appkey='+encodeURIComponent(key)+'&autoload=false&libraries=services';
  sc.onload=function(){try{kakao.maps.load(function(){fin(true)})}catch(e){fin(false)}};
  sc.onerror=function(){fin(false)};
  document.head.appendChild(sc);setTimeout(function(){fin(false)},10000);
})}

/* 지도 아래 안내 문구·버튼 */
function kmUi(state,why){
  var b=g('kmBtn');if(b){b.hidden=state==='on';b.textContent=state==='fail'?'카카오 지도 다시 연결':'카카오 지도 연결'}
  if(state==='fail'||state==='nokey')mapMsg(why||'');
}
function kmSheet(){
  var cur=kmKey();
  sheet('카카오 지도 연결','실제 카카오맵을 쓰려면 카카오 개발자 키가 필요해.',
   '<div class="kmform">'+
   '<p>1. <b>developers.kakao.com</b> → 내 애플리케이션 → 앱 키에서 <b>JavaScript 키</b>를 복사해.</p>'+
   '<p>2. 같은 앱의 <b>플랫폼(Web) 사이트 도메인</b>에 이 앱을 여는 주소를 등록해. (예: <code>http://localhost:8000</code>)<br>그리고 <b>카카오맵 사용 설정</b>이 켜져 있어야 해. 메뉴 이름은 콘솔 업데이트로 바뀔 수 있어.</p>'+
   '<p>3. 아래에 붙여 넣고 저장해. 키는 <b>이 브라우저에만</b> 저장되고 코드·깃에는 들어가지 않아.</p>'+
   '<input id="kmKey" type="password" autocomplete="off" spellcheck="false" placeholder="JavaScript 키" value="'+esc(cur)+'">'+
   '<div class="kmrow"><button class="btn dark" onclick="kmSaveKey()">저장하고 지도 켜기</button>'+(cur?'<button class="btn" onclick="kmClearKey()">키 지우기</button>':'')+'</div>'+
   '<p class="kmnote">※ <code>file://</code> 로 열면 카카오 지도는 동작하지 않아. <code>python3 -m http.server 8000</code> 처럼 서버로 열고 <code>http://localhost:8000</code> 을 등록해.</p></div>');
}
function kmSaveKey(){
  var v=(g('kmKey').value||'').trim();if(!v){toast('키를 입력해 줘');return}
  try{localStorage.setItem(KM_LS,v)}catch(e){}
  kmReset();closeSheet();toast('키를 저장했어. 카카오 지도를 불러올게');
}
function kmClearKey(){try{localStorage.removeItem(KM_LS)}catch(e){}kmReset();closeSheet();toast('키를 지웠어')}
/* 지도를 처음부터 다시 만든다(키를 바꿨을 때) */
function kmReset(){
  KM.key='';KM.sig='';K_PINS.forEach(function(o){o.setMap(null)});K_PINS=[];
  if(K_POP){K_POP.setMap(null);K_POP=null}if(K_HIT){K_HIT.setMap(null);K_HIT=null}
  MAP=null;MAP_MODE=null;MAP_LOADING=0;KM.legend=null;
  var el=g('lmap');if(el)el.innerHTML='';
  initMap();
}

/* 초기화: 간이 지도를 먼저 보여주고, 카카오가 준비되면 바꿔 끼운다 */
var _kmSvg={init:initMap,render:renderIMap,draw:drawMarkers,region:mapRegion,korea:mapKorea,resize:mapResize,search:mapSearch};
initMap=function(){
  if(MAP||MAP_LOADING)return;
  _kmSvg.init();
  var key=kmKey();
  if(!key){kmUi('nokey','');return}
  if(location.protocol==='file:'){kmUi('fail','카카오 지도는 file:// 로는 안 열려. 서버로 열어 줘');return}
  KM.key=key;MAP_LOADING=1;
  kmLoad(key).then(function(ok){
    MAP_LOADING=0;if(KM.key!==key)return;
    if(ok){try{kmBuild();return}catch(e){console.warn('kakao',e)}}
    kmFallback('카카오 지도를 불러오지 못했어 · 키·도메인 확인');
  });
};
function kmFallback(why){
  if(MAP_MODE==='k'){K_PINS.forEach(function(o){o.setMap(null)});K_PINS=[];if(K_POP){K_POP.setMap(null);K_POP=null}}
  var el=g('lmap');if(el)el.innerHTML='';
  KM.legend=null;KM.sig='';MAP={svg:1};MAP_MODE='s';IMAP.view='region';_kmSvg.render();kmUi('fail',why);
}
function kmBuild(){
  var el=g('lmap');if(!el)return;
  el.innerHTML='';
  var c=REG_GEO[S.region]||[36.2,127.9,6];
  MAP=new kakao.maps.Map(el,{center:new kakao.maps.LatLng(c[0],c[1]),level:zl(c[2])});MAP_MODE='k';
  MAP.setMinLevel(1);MAP.setMaxLevel(14);
  MAP.addControl(new kakao.maps.ZoomControl(),kakao.maps.ControlPosition.RIGHT);
  /* 대한민국 밖으로 끌어가면 되돌린다 */
  kakao.maps.event.addListener(MAP,'dragend',kmClamp);
  kakao.maps.event.addListener(MAP,'zoom_changed',function(){setTimeout(kmClamp,50)});
  kakao.maps.event.addListener(MAP,'click',function(){if(K_POP){K_POP.setMap(null);K_POP=null}});
  try{new ResizeObserver(function(){if(MAP_MODE==='k'&&mapVisible())MAP.relayout()}).observe(el)}catch(e){}
  /* 타일이 안 오면(키·도메인 불일치) 간이 지도로 되돌린다 */
  var ok=0,tries=0;
  kakao.maps.event.addListener(MAP,'tilesloaded',function(){ok=1});
  (function dog(){setTimeout(function(){if(ok||MAP_MODE!=='k')return;if(!mapVisible()&&++tries<20)return dog();
    kmFallback('카카오 지도가 응답하지 않아 · 키·등록 도메인·카카오맵 사용 설정 확인')},8000)})();
  KM.sig='';kmUi('on');
  kmDraw();kmRegion();
}
function kmClamp(){
  if(MAP_MODE!=='k')return;
  var c=MAP.getCenter(),la=Math.min(KR_BOUNDS[2],Math.max(KR_BOUNDS[0],c.getLat())),lo=Math.min(KR_BOUNDS[3],Math.max(KR_BOUNDS[1],c.getLng()));
  if(la!==c.getLat()||lo!==c.getLng())MAP.panTo(new kakao.maps.LatLng(la,lo));
}

/* 핀 + 범례 */
function kmPopHTML(s,hint){
  var v=s.rate!=null?'★'+s.rate.toFixed(1):(curType&&curType()&&curType()!=='휠체어'?mvShort(curType())+' ':'휠체어 ')+esc(s.v||'미확인');
  return '<b>'+esc(s.name)+'</b>'+esc(s.cat||'')+' · '+v+(hint?'<br><small>'+esc(hint)+'</small>':'')+'<br><button onclick="goCard(\''+esc(s.id)+'\')">카드 보기</button>';
}
function kmShowPop(lat,lng,html){
  if(K_POP)K_POP.setMap(null);
  var d=document.createElement('div');d.className='kpop kmpop';d.innerHTML=html;
  K_POP=new kakao.maps.CustomOverlay({position:new kakao.maps.LatLng(lat,lng),content:d,yAnchor:1,xAnchor:.5,zIndex:6,clickable:true});K_POP.setMap(MAP);
}
function kmDraw(){
  if(MAP_MODE!=='k')return;
  var pts=mapPts(),sig=S.region+'|'+(curType?curType():'')+'|'+pts.map(function(p){return p.s.id+p.s.v}).join(',');
  if(sig===KM.sig)return;KM.sig=sig;
  K_PINS.forEach(function(o){o.setMap(null)});K_PINS=[];if(K_POP){K_POP.setMap(null);K_POP=null}
  pts.forEach(function(p){
    var d=document.createElement('div');d.className='kmk';d.style.background=vColor(p.s.v);d.title=p.s.name;
    d.onclick=function(){kmShowPop(p.lat,p.lng,kmPopHTML(p.s))};
    var o=new kakao.maps.CustomOverlay({position:new kakao.maps.LatLng(p.lat,p.lng),content:d,yAnchor:.5,xAnchor:.5,zIndex:3,clickable:true});
    o.setMap(MAP);K_PINS.push(o);
  });
  var leg=KM.legend;
  if(!leg){leg=KM.legend=document.createElement('div');leg.className='imap-leg kmleg';g('lmap').appendChild(leg)}
  leg.innerHTML=pts.length?'<span><i style="background:#2E9E62"></i>가능</span><span><i style="background:#E0A400"></i>부분</span><span><i style="background:#D2493D"></i>불가</span><span><i style="background:#2E8BC7"></i>기타</span>':'<span>좌표가 있는 장소가 아직 없어</span>';
  g('mapRegBtn').textContent=R().name+' 보기';
}

/* 화면 이동 (지도가 안 보이는 탭이면 보일 때까지 미룬다) */
function kmView(kind){
  if(MAP_MODE!=='k')return;
  if(!mapVisible()){KM.pend=kind;return}
  KM.pend=null;MAP.relayout();
  if(kind==='korea'){MAP.setBounds(new kakao.maps.LatLngBounds(new kakao.maps.LatLng(33.0,125.0),new kakao.maps.LatLng(38.7,130.0)));return}   // 남한 본토+제주
  var pts=mapPts();
  if(pts.length){
    var b=new kakao.maps.LatLngBounds();pts.forEach(function(p){b.extend(new kakao.maps.LatLng(p.lat,p.lng))});
    MAP.setBounds(b,36,36,36,36);
    if(MAP.getLevel()<3)MAP.setLevel(3);            // 장소가 한두 곳일 때 너무 확대되지 않게
  }else{var r=REG_GEO[S.region];if(r){MAP.setCenter(new kakao.maps.LatLng(r[0],r[1]));MAP.setLevel(zl(r[2]))}}
}
function kmRegion(){kmView('region')}

/* 기존 지도 함수를 카카오 모드에 맞게 바꿔치기. 카카오가 아니면 원래(SVG) 동작 */
renderIMap=function(){MAP_MODE==='k'?kmDraw():_kmSvg.render()};
drawMarkers=function(){if(MAP)MAP_MODE==='k'?kmDraw():_kmSvg.draw()};
mapRegion=function(){if(MAP_MODE==='k'){kmDraw();mapMsg('');kmView('region')}else _kmSvg.region()};
mapKorea=function(){if(MAP_MODE==='k'){mapMsg('');kmView('korea')}else _kmSvg.korea()};
mapResize=function(){
  if(MAP_MODE!=='k')return _kmSvg.resize();
  try{MAP.relayout();if(KM.pend)kmView(KM.pend)}catch(e){console.warn(e)}
};
mapSearch=function(){
  if(MAP_MODE!=='k')return _kmSvg.search();
  var q=(g('q').value||'').trim();if(!q){toast('검색어를 입력해줘');return}
  var sp=mapPts().find(function(p){return p.s.name.includes(q)});
  if(sp){var ll=new kakao.maps.LatLng(sp.lat,sp.lng);MAP.setCenter(ll);MAP.setLevel(3);kmShowPop(sp.lat,sp.lng,kmPopHTML(sp.s));mapMsg(sp.s.name);return}
  var k=Object.keys(REG_ALIAS).find(function(k){return REGIONS[k]&&REG_ALIAS[k].some(function(a){return a===q||a.includes(q)})});
  if(k){setRegion(k);return}
  if(!(kakao.maps.services&&kakao.maps.services.Places)){toast('장소 검색을 쓸 수 없어');return}
  mapMsg('찾는 중…');
  kSearch(q).then(function(hit){
    if(!hit||!kmInKorea(hit.lat,hit.lng)){mapMsg('');toast('"'+q+'"을 대한민국 안에서 찾지 못했어');return}
    var ll=new kakao.maps.LatLng(hit.lat,hit.lng);MAP.setCenter(ll);MAP.setLevel(3);
    hitMarker(hit.lat,hit.lng,esc(hit.nm));mapMsg(hit.nm);
  }).catch(function(){mapMsg('');toast('검색 서버에 연결하지 못했어')});
};
