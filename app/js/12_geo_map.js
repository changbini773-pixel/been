/* ============ js/12_geo_map.js ============
   좌표(GEO), 지도 초기화·마커, 지오코딩 (지도 화면은 32_map_svg.js가 덮어씀)
*/
/* ================= 지도 · 사진 ================= */
var GEO={g1:[35.8436,129.2856,'보문호'],g2:[35.8295,129.2280,'국립경주박물관'],g3:[35.7900,129.3320,'불국사'],g4:[35.8375,129.2100,'황리단길',1],g5:[35.8300,129.2150,'경주 교촌마을',1],g6:[35.8420,129.2880,'보문호',1],
 h1:[35.1587,129.1604,'해운대해수욕장'],h2:[35.1530,129.1520,'동백섬'],h3:[35.1627,129.1630,'해운대구',1],h4:[35.1600,129.1640,'해운대해수욕장',1],
 j1:[35.8153,127.1497,'경기전'],j2:[35.8100,127.1600,'국립무형유산원'],j3:[35.8134,127.1491,'전동성당'],j4:[35.8160,127.1520,'전주 한옥마을',1],j5:[35.8175,127.1535,'전주 한옥마을',1],
 s1:[37.5796,126.9770,'경복궁'],s2:[37.5760,126.9754,'국립고궁박물관'],s3:[37.5743,126.9853,'쌈지길'],s4:[37.5820,126.9815,'삼청동',1],s5:[37.5788,126.9800,'국립현대미술관 서울관'],s6:[37.5720,126.9860,'종로구',1],
 k1:[37.8055,128.9080,'경포해변'],k2:[37.7960,128.8980,'경포호'],k3:[37.7790,128.8780,'오죽헌'],k4:[37.7910,128.9140,'초당동',1],k5:[37.7720,128.9480,'안목해변'],k6:[37.8010,128.9070,'경포해변',1],
 y2:[35.89273,128.86246,null],y4:[35.89091,128.8563,null],y15:[35.8191,128.75548,null],y16:[35.81933,128.72761,null],y20:[35.83772,128.75322,null],y21:[35.83762,128.75386,null],y22:[35.81864,128.72626,null],y31:[35.90087,128.82391,null],y33:[35.82464,128.72899,null],y34:[35.81743,128.7231,null],y36:[35.83924,128.75656,null],y37:[35.91831,128.83098,null],y39:[35.82456,128.7285,null],y40:[35.91806,128.81924,null],y44:[35.9107,128.81585,null],y47:[35.83429,128.77141,null]};
var WIKI_EN={g1:'Bomun_Lake',g2:'Gyeongju_National_Museum',g3:'Bulguksa',g4:'Hwangnidan-gil',g5:'Gyochon_Traditional_Village',g6:'Bomun_Lake',h1:'Haeundae_Beach',h2:'Dongbaekseom',h3:'Haeundae_District',h4:'Haeundae_Beach',j1:'Gyeonggijeon',j2:'National_Intangible_Heritage_Center',j3:'Jeondong_Cathedral',j4:'Jeonju_Hanok_Village',j5:'Jeonju_Hanok_Village',s1:'Gyeongbokgung',s2:'National_Palace_Museum_of_Korea',s3:'Ssamziegil',s4:'Samcheong-dong',s5:'National_Museum_of_Modern_and_Contemporary_Art',s6:'Jongno_District',k1:'Gyeongpo_Beach',k2:'Gyeongpoho',k3:'Ojukheon',k4:'Gyeongpo_Beach',k5:'Anmok_Beach',k6:'Gyeongpo_Beach',y1:'Gyeongsan',y2:'Gyeongsan',y3:'Gyeongsan',y4:'Gyeongsan',y5:'Gyeongsan',y6:'Gyeongsan'};
var REG_GEO={gyeongju:[35.8350,129.2450,12],haeundae:[35.1590,129.1590,14],jeonju:[35.8150,127.1530,15],jongno:[37.5730,126.9794,14],gangneung:[37.7519,128.8761,12],gyeongsan:[35.8150,128.7500,12]};
var REG_ALIAS={gyeongju:['경주','경상북도','경북'],haeundae:['해운대','부산'],jeonju:['전주','한옥마을','전북'],jongno:['종로','서울'],gangneung:['강릉','강원'],gyeongsan:['경산']};
var PHOTO={},PHOTO_TRY={},MAP=null,MAP_LAYER=null,MAP_HIT=null;
async function wikiImg(lang,title){
  try{const r=await fetch('https://'+lang+'.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(title));if(!r.ok)return null;
    const j=await r.json();return (j.thumbnail&&j.thumbnail.source)||(j.originalimage&&j.originalimage.source)||null}catch(e){return null}
}
function loadPhotos(list){
  list.forEach(async s=>{
    if(PHOTO[s.id]||PHOTO_TRY[s.id]||!GEO[s.id]||!GEO[s.id][2])return; PHOTO_TRY[s.id]=1;
    let u=await wikiImg('ko',GEO[s.id][2]); if(!u&&WIKI_EN[s.id]) u=await wikiImg('en',WIKI_EN[s.id]);
    if(!u)return;
    u=u.replace(/\/(\d+)px-/,'/500px-').replace('//thumb.wikimedia.org/','//upload.wikimedia.org/');
    PHOTO[s.id]=u;
    const el=g('ph-'+s.id); if(el){el.style.backgroundImage="url('"+u+"')";el.classList.add('has')}
  });
}
var KAKAO_KEY='',MAP_MODE=null,MAP_LOADING=0,K_PINS=[],K_POP=null,K_HIT=null;
function loadKakao(){return new Promise(res=>{
  if(window.kakao&&kakao.maps&&kakao.maps.LatLng)return res(true);
  if(location.protocol==='file:')return res(false);
  let done=0;const fin=v=>{if(!done){done=1;res(v)}};
  const sc=document.createElement('script');
  sc.src='https://dapi.kakao.com/v2/maps/sdk.js?appkey='+KAKAO_KEY+'&autoload=false&libraries=services';
  sc.onload=()=>{try{kakao.maps.load(()=>fin(true))}catch(e){fin(false)}};
  sc.onerror=()=>fin(false);document.head.appendChild(sc);setTimeout(()=>fin(false),6000);
})}
async function initMap(){
  if(MAP||MAP_LOADING)return;MAP_LOADING=1;
  const ok=await loadKakao();MAP_LOADING=0;if(MAP)return;
  if(ok){try{initKakao();return}catch(e){console.warn('kakao',e);MAP=null}}
  initLeaflet();
}
function initKakao(){
  const el=g('lmap');
  MAP=new kakao.maps.Map(el,{center:new kakao.maps.LatLng(36.2,127.9),level:13});MAP_MODE='k';
  MAP.setMinLevel(1);MAP.setMaxLevel(13);
  MAP.addControl(new kakao.maps.ZoomControl(),kakao.maps.ControlPosition.RIGHT);
  kakao.maps.event.addListener(MAP,'dragend',()=>{const c=MAP.getCenter(),la=Math.min(38.9,Math.max(32.8,c.getLat())),lo=Math.min(132.2,Math.max(124.3,c.getLng()));if(la!==c.getLat()||lo!==c.getLng())MAP.panTo(new kakao.maps.LatLng(la,lo))});
  kakao.maps.event.addListener(MAP,'click',()=>{if(K_POP){K_POP.setMap(null);K_POP=null}});
  new ResizeObserver(()=>MAP&&MAP.relayout()).observe(el);
  drawMarkers();
}
function initLeaflet(){
  if(MAP||!window.L)return; MAP_MODE='l';
  const KR=L.latLngBounds([32.8,124.3],[38.9,132.2]);
  MAP=L.map(g('lmap'),{zoomControl:true,attributionControl:false,minZoom:6,maxZoom:19,maxBounds:KR.pad(0.05),maxBoundsViscosity:1,worldCopyJump:false,zoomSnap:1,bounceAtZoomLimits:false}).setView([36.2,127.9],6);
  const OSM='https://tile.openstreetmap.org/{z}/{x}/{y}.png',ESRI='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
  const srcs=location.protocol==='file:'?[ESRI,OSM]:[OSM,ESRI];
  let si=0,errs=0,tl=L.tileLayer(srcs[0],{minZoom:6,maxZoom:19,maxNativeZoom:location.protocol==='file:'?17:19,bounds:KR,noWrap:true,keepBuffer:4,updateWhenZooming:false}).addTo(MAP);
  tl.on('tileerror',()=>{if(++errs>6&&si<srcs.length-1){errs=0;si++;tl.setUrl(srcs[si])}});
  tl.on('tileload',()=>{errs=0});
  new ResizeObserver(()=>MAP&&MAP.invalidateSize()).observe(g('lmap'));
  MAP_LAYER=L.layerGroup().addTo(MAP);
  drawMarkers();
}
function mapResize(){if(!MAP)return;try{if(MAP_MODE==='k')MAP.relayout();else MAP.invalidateSize();
  if(MAP_PENDING&&mapVisible()){const p=MAP_PENDING;MAP_PENDING=null;if(MAP_MODE==='k'){MAP.setCenter(new kakao.maps.LatLng(p[0],p[1]));MAP.setLevel(zl(p[2]))}else MAP.setView([p[0],p[1]],p[2],{animate:false})}}catch(e){console.warn(e)}}
function zl(z){return Math.max(1,Math.min(13,19-z))}
var MAP_PENDING=null;
function mapVisible(){const el=g('lmap');return !!(el&&el.offsetWidth>0&&el.offsetHeight>0)}
function mapFly(lat,lng,z){if(!MAP)return;if(!mapVisible()){MAP_PENDING=[lat,lng,z];return}
  if(MAP_MODE==='k'){const ll=new kakao.maps.LatLng(lat,lng);MAP.setCenter(ll);MAP.setLevel(zl(z),{anchor:ll,animate:{duration:300}})}else MAP.flyTo([lat,lng],z,{duration:.9})}
function kPop(lat,lng,html){if(K_POP)K_POP.setMap(null);const d=document.createElement('div');d.className='kpop';d.innerHTML=html;
  K_POP=new kakao.maps.CustomOverlay({position:new kakao.maps.LatLng(lat,lng),content:d,yAnchor:1,xAnchor:.5,zIndex:5,clickable:true});K_POP.setMap(MAP)}
function kPin(lat,lng,hit,html){const d=document.createElement('div');d.className='kpin-w';d.innerHTML='<div class="pin'+(hit?' hit':'')+'"></div>';d.onclick=()=>kPop(lat,lng,html);
  const o=new kakao.maps.CustomOverlay({position:new kakao.maps.LatLng(lat,lng),content:d,yAnchor:1,xAnchor:.5,zIndex:3,clickable:true});o.setMap(MAP);return o}
function spotPopHTML(s){return '<b>'+s.name+'</b>'+s.cat+' · '+(s.rate!=null?'★'+s.rate.toFixed(1):'휠체어 '+s.v)+'<br><button onclick="goCard(\''+s.id+'\')">카드 보기</button>'}
function pinIcon(hit){return L.divIcon({className:'',html:'<div class="pin'+(hit?' hit':'')+'"></div>',iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-28]})}
function drawMarkers(){
  if(!MAP)return;
  if(MAP_MODE==='k'){K_PINS.forEach(o=>o.setMap(null));K_PINS=[];if(K_POP){K_POP.setMap(null);K_POP=null}
    (R().spots||[]).forEach(s=>{const p=GEO[s.id];if(p)K_PINS.push(kPin(p[0],p[1],0,spotPopHTML(s)))})}
  else{MAP_LAYER.clearLayers();
    (R().spots||[]).forEach(s=>{const p=GEO[s.id];if(!p)return;L.marker([p[0],p[1]],{icon:pinIcon()}).addTo(MAP_LAYER).bindPopup(spotPopHTML(s))})}
  g('mapRegBtn').textContent=R().name+' 보기';
}
function goCard(id){const c=g('card-'+id),m=g('main');if(!c)return;m.scrollTo({top:c.offsetTop-12,behavior:'smooth'})}
function mapMsg(t){g('mapMsg').textContent=t}
function mapKorea(){if(!MAP)return;mapFly(36.2,127.9,6);mapMsg('')}
function mapRegion(){if(!MAP)return;const r=REG_GEO[S.region];if(!r){ensureGeo(S.region).then(()=>REG_GEO[S.region]&&mapRegion());return}mapFly(r[0],r[1],r[2]);mapMsg('')}
function hitMarker(lat,lng,label){const h='<b>'+label+'</b>';
  if(MAP_MODE==='k'){if(K_HIT)K_HIT.setMap(null);K_HIT=kPin(lat,lng,1,h);kPop(lat,lng,h);return}
  if(MAP_HIT)MAP.removeLayer(MAP_HIT);MAP_HIT=L.marker([lat,lng],{icon:pinIcon(1)}).addTo(MAP).bindPopup(h).openPopup()}
function kSearch(q){return new Promise(res=>{const ST=kakao.maps.services.Status;
  new kakao.maps.services.Places().keywordSearch(q,(d,st)=>{if(st===ST.OK&&d.length)return res({lat:+d[0].y,lng:+d[0].x,nm:d[0].place_name});
    new kakao.maps.services.Geocoder().addressSearch(q,(d2,st2)=>{if(st2===ST.OK&&d2.length)res({lat:+d2[0].y,lng:+d2[0].x,nm:d2[0].address_name});else res(null)})})})}
function addrVariants(q){
  q=q.replace(/\s+/g,' ').replace(/\(.*?\)/g,'').trim();
  const v=[q];
  const noDetail=q.replace(/\s*\d+층.*$|\s*\d+호.*$|,.*$/,'').trim(); if(noDetail!==q)v.push(noDetail);
  const m=noDetail.match(/^(.*?(?:로|길|대로))\s*(\d+(?:-\d+)?)$/);
  if(m){v.push(m[1]+' '+m[2].split('-')[0]);v.push({road:m[1],approx:1})}
  const m2=noDetail.match(/^(.*?(?:동|리|가))\s*(?:산\s*)?\d+(?:-\d+)?$/); if(m2)v.push({road:m2[1],approx:1});
  return v;
}
async function nomi(q){const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=kr&accept-language=ko&addressdetails=0&q='+encodeURIComponent(q));const j=await r.json();return j.length?{lat:+j[0].lat,lng:+j[0].lon,nm:j[0].display_name.split(',')[0]}:null}
async function photon(q){const r=await fetch('https://photon.komoot.io/api/?limit=1&bbox=124.3,32.8,132.2,38.9&q='+encodeURIComponent(q));const j=await r.json();const f=j.features&&j.features[0];if(!f)return null;const p=f.properties||{};return {lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0],nm:[p.name,p.street,p.housenumber].filter(Boolean).join(' ')||q}}
async function freeGeocode(q){
  for(const v of addrVariants(q)){
    const t=typeof v==='string'?v:v.road, ap=typeof v==='string'?0:1;
    for(const fn of [nomi,photon]){try{const h=await fn(t);if(h){if(ap){h.approx=1;h.z=15}if(t!==q&&!ap)h.nm=q;return h}}catch(e){}}
  }
  return null;
}
async function mapSearch(){
  const q=(g('q').value||'').trim(); if(!q){toast('검색어를 입력해줘');return}
  if(!MAP){toast('지도를 불러오는 중이야');return}
  for(const k of Object.keys(REGIONS)){const sp=(REGIONS[k].spots||[]).find(s=>s.name.includes(q)||q.includes(s.name));
    if(sp&&GEO[sp.id]){const p=GEO[sp.id];mapFly(p[0],p[1],16);
      setTimeout(()=>{if(k===S.region){if(MAP_MODE==='k')kPop(p[0],p[1],spotPopHTML(sp));else MAP_LAYER.eachLayer(m=>{const ll=m.getLatLng();if(ll.lat===p[0]&&ll.lng===p[1])m.openPopup()})}else hitMarker(p[0],p[1],sp.name)},MAP_MODE==='k'?350:950);
      mapMsg(sp.name+(k===S.region?'':' · '+REGIONS[k].name));return}}
  for(const k of Object.keys(REG_ALIAS)){if(REG_ALIAS[k].some(a=>q===a||q===a+'시'||q===REGIONS[k].name)){const r=REG_GEO[k];mapFly(r[0],r[1],r[2]);mapMsg(REGIONS[k].name);return}}
  mapMsg('찾는 중…');
  try{let hit=null;
    if(MAP_MODE==='k') hit=await kSearch(q);
    else hit=await freeGeocode(q);
    if(!hit){mapMsg('');toast('"'+q+'"을 찾지 못했어');return}
    mapFly(hit.lat,hit.lng,hit.z||16);setTimeout(()=>hitMarker(hit.lat,hit.lng,hit.nm),MAP_MODE==='k'?350:950);mapMsg(hit.approx?hit.nm+' · 근처까지 찾았어':hit.nm);
  }catch(e){mapMsg('');toast('검색 서버에 연결하지 못했어')}
}
