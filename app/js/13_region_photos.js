/* ============ js/13_region_photos.js ============
   지역 대표 사진 로딩, 일정에 장소 추가/제외
*/
var REG_PH={gyeongju:['첨성대','Cheomseongdae'],haeundae:['해운대해수욕장','Haeundae_Beach'],jeonju:['전주 한옥마을','Jeonju_Hanok_Village'],jongno:['경복궁','Gyeongbokgung'],gangneung:['경포대','Gyeongpodae'],gyeongsan:['반곡지','Gyeongsan']};
var REG_PHOTO={};
var LANDMARK={"서울특별시":"경복궁","부산광역시":"해운대해수욕장","대구광역시":"팔공산","인천광역시":"인천대교","광주광역시":"무등산","대전광역시":"한밭수목원","울산광역시":"대왕암공원","세종특별자치시":"세종호수공원","수원시":"수원 화성","성남시":"남한산성","고양시":"일산호수공원","용인시":"한국민속촌","부천시":"원미산","안산시":"대부도","안양시":"안양예술공원","남양주시":"수종사","화성시":"융건릉","평택시":"평택호","의정부시":"도봉산","시흥시":"오이도","파주시":"임진각","김포시":"애기봉","광명시":"광명동굴","광주시":"남한산성","군포시":"수리산","하남시":"미사리 조정경기장","오산시":"물향기수목원","이천시":"설봉공원","안성시":"안성팜랜드","의왕시":"왕송호수","양주시":"회암사지","구리시":"동구릉","포천시":"산정호수","동두천시":"소요산","과천시":"서울대공원","여주시":"신륵사","양평군":"두물머리","가평군":"남이섬","연천군":"전곡리 유적","춘천시":"소양강댐","원주시":"치악산","동해시":"무릉계곡","태백시":"태백산","속초시":"설악산","삼척시":"환선굴","홍천군":"수타사","횡성군":"횡성호","영월군":"청령포","평창군":"오대산","정선군":"화암동굴","철원군":"고석정","화천군":"파로호","양구군":"두타연","인제군":"백담사","고성군@강원특별자치도":"화진포","양양군":"낙산사","청주시":"상당산성","충주시":"탄금대","제천시":"의림지","보은군":"법주사","옥천군":"대청호","영동군":"월류봉","증평군":"좌구산","진천군":"진천 농다리","괴산군":"화양구곡","단양군":"도담삼봉","천안시":"독립기념관","공주시":"공산성","보령시":"대천해수욕장","아산시":"현충사","서산시":"해미읍성","논산시":"관촉사","계룡시":"계룡산","당진시":"왜목마을","금산군":"칠백의총","부여군":"정림사지","서천군":"국립생태원","청양군":"칠갑산","홍성군":"홍주읍성","예산군":"수덕사","태안군":"안면도","군산시":"선유도","익산시":"미륵사지","정읍시":"내장산","남원시":"광한루","김제시":"벽골제","완주군":"대둔산","진안군":"마이산","무주군":"덕유산","장수군":"장안산","임실군":"옥정호","순창군":"강천산","고창군":"고창읍성","부안군":"채석강","목포시":"유달산","여수시":"오동도","순천시":"순천만","나주시":"금성관","광양시":"섬진강","담양군":"죽녹원","곡성군":"섬진강 기차마을","구례군":"화엄사","고흥군":"나로우주센터","화순군":"운주사","장흥군":"천관산","강진군":"다산초당","해남군":"대흥사","영암군":"월출산","무안군":"회산백련지","영광군":"불갑사","장성군":"백양사","완도군":"청산도","진도군":"진도대교","신안군":"증도","포항시":"호미곶","김천시":"직지사","안동시":"안동 하회마을","구미시":"금오산","영주시":"부석사","영천시":"보현산천문대","상주시":"경천대","문경시":"문경새재","의성군":"고운사","청송군":"주왕산","영양군":"일월산","영덕군":"강구항","청도군":"운문사","고령군":"고령 지산동 고분군","성주군":"가야산","칠곡군":"가산산성","예천군":"회룡포","봉화군":"청량산","울진군":"불영사","울릉군":"울릉도","창원시":"주남저수지","진주시":"진주성","통영시":"미륵산","사천시":"삼천포대교","김해시":"수로왕릉","밀양시":"영남루","거제시":"해금강","양산시":"통도사","의령군":"한우산","함안군":"함안 말이산 고분군","창녕군":"우포늪","고성군@경상남도":"상족암","남해군":"보리암","하동군":"쌍계사","산청군":"지리산","함양군":"상림","거창군":"수승대","합천군":"해인사","제주시":"한라산","서귀포시":"성산일출봉"};
var MINI=null,MINI_PIN=null;
async function loadRegPhoto(){
  const el=g('regPh');if(!el||!window.L)return;
  el.style.backgroundImage='';
  if(!MINI||!el.contains(MINI.getContainer())){
    const d=document.createElement('div');d.style.cssText='position:absolute;inset:0;pointer-events:none;background:#E8EEF2';el.appendChild(d);
    MINI=L.map(d,{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,tap:false,zoomSnap:0.5}).setView([36.2,127.9],6);
    L.tileLayer(location.protocol==='file:'?'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}':'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(MINI);
    new ResizeObserver(()=>MINI&&MINI.invalidateSize()).observe(d);MINI_PIN=null;
  }
  const k=S.region;if(!REG_GEO[k])await ensureGeo(k);if(S.region!==k)return;
  const p=REG_GEO[k];if(!p)return;
  MINI.invalidateSize();MINI.setView([p[0],p[1]],6.5,{animate:false});
  const ic=L.divIcon({className:'',html:PIN_RED.replace('width="22" height="22"','width="30" height="30"'),iconSize:[30,30],iconAnchor:[15,28]});
  if(MINI_PIN)MINI_PIN.setLatLng([p[0],p[1]]);else MINI_PIN=L.marker([p[0],p[1]],{icon:ic,interactive:false}).addTo(MINI);
}
function planStopFor(loc){
  if(!S.plan||!loc)return null;
  for(let d=0;d<S.plan.days.length;d++){const st=S.plan.days[d].stops;
    for(let i=0;i<st.length;i++){const k=st[i].n.split(/[ ·(]/)[0];if(k.length>=2&&loc.includes(k))return {d,i}}}
  return null;
}
function excludeStop(d,i){const n=S.plan.days[d].stops[i].n;removeStop(d,i);renderReports();toast(n+'을 동선에서 뺐어')}
