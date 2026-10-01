/* ============ js/32_map_svg.js ============
   직접 그린 SVG 지도(한국 윤곽 + 핀)
*/
/* ================= 일러스트 지도 (외부 지도 타일 없이 동작) ================= */
var KR_OUT=[[38.6,128.35],[38.2,128.6],[37.75,128.9],[37.45,129.15],[37.05,129.4],[36.5,129.45],[36.0,129.57],[35.55,129.45],[35.1,129.1],[34.95,128.75],[34.85,128.4],[34.75,128.0],[34.65,127.7],[34.45,127.3],[34.3,126.6],[34.6,126.3],[35.0,126.35],[35.6,126.5],[36.0,126.65],[36.4,126.45],[36.9,126.2],[37.0,126.8],[37.45,126.6],[37.75,126.5],[37.95,126.7],[38.25,127.1],[38.3,127.6],[38.6,128.35]];
var IMAP={view:'region',sel:null,hit:null};
function vColor(v){return v==='가능'?'#2E9E62':v==='부분'?'#E0A400':v==='불가'?'#D2493D':'#2E8BC7'}
function mapPts(){const r=R();return (r.spots||[]).filter(s=>GEO[s.id]).map(s=>({s,lat:GEO[s.id][0],lng:GEO[s.id][1]}))}
function renderIMap(){
  const el=g('lmap');if(!el)return;const W=el.clientWidth||360,H=el.clientHeight||260,r=R();
  let pts=IMAP.view==='korea'?[]:mapPts(),b;
  if(IMAP.view==='korea'||(!pts.length&&!REG_GEO[S.region])){b={s:33.0,n:38.8,w:124.6,e:130.0};IMAP.view='korea'}
  else if(pts.length){const la=pts.map(p=>p.lat),lo=pts.map(p=>p.lng);b={s:Math.min(...la),n:Math.max(...la),w:Math.min(...lo),e:Math.max(...lo)};
    const pad=Math.max(.01,(b.n-b.s)*.18),padx=Math.max(.012,(b.e-b.w)*.18);b.s-=pad;b.n+=pad;b.w-=padx;b.e+=padx}
  else{const c=REG_GEO[S.region];b={s:c[0]-.06,n:c[0]+.06,w:c[1]-.08,e:c[1]+.08}}
  const kx=Math.cos((b.s+b.n)/2*Math.PI/180),sx=(b.e-b.w)*kx,sy=b.n-b.s,sc=Math.min(W/sx,H/sy);
  const ox=(W-sx*sc)/2,oy=(H-sy*sc)/2,X=lng=>ox+(lng-b.w)*kx*sc,Y=lat=>oy+(b.n-lat)*sc;
  const land=KR_OUT.map(([la,lo],i)=>(i?'L':'M')+X(lo).toFixed(1)+' '+Y(la).toFixed(1)).join(' ')+'Z';
  const jeju=`<ellipse cx="${X(126.55)}" cy="${Y(33.38)}" rx="${.36*kx*sc}" ry="${.15*sc}" fill="#CFE8C9"/>`;
  let pins='';
  if(IMAP.view==='korea'){
    const feats=[['gyeongsan','경산',0],['gyeongju','경주',1],['seoul_n','서울',-1,[37.55,126.99]],['bs_haeundae','부산',1,[35.16,129.06]],['jeonju','전주',1],['gangneung','강릉',1]];
    pins=feats.map(([k,lb,side,cc])=>{const c=cc||REG_GEO[k];if(!c||!REGIONS[k])return '';const on=k===S.region||(k==='seoul_n'&&/^seoul_/.test(S.region))||(k==='bs_haeundae'&&/^bs_/.test(S.region)),rr=REGIONS[k];
      const tx=X(c[1])+(side>0?11:side<0?-11:0),ty=Y(c[0])+(side===0?22:4);
      return `<g class="ipin" onclick="${k==='seoul_n'?"regionSheet();toggleGroup('seoul')":k==='bs_haeundae'?"regionSheet();toggleGroup('busan')":"setRegion('"+k+"')"}" style="cursor:pointer"><circle cx="${X(c[1])}" cy="${Y(c[0])}" r="${on?9:7}" fill="${rr.real?'#2E9E62':'#9AB3C4'}" stroke="#fff" stroke-width="2.5"/>
      <text x="${tx}" y="${ty}" text-anchor="${side>0?'start':side<0?'end':'middle'}" font-size="12" font-weight="700" fill="#24394A" paint-order="stroke" stroke="#fff" stroke-width="3">${lb}</text></g>`}).join('');
  }else{
    pins=pts.map((p,i)=>{const on=IMAP.sel===p.s.id;return `<g class="ipin${on?' on':''}" onclick="mapSel('${p.s.id}')" style="cursor:pointer"><circle cx="${X(p.lng)}" cy="${Y(p.lat)}" r="${on?10:7.5}" fill="${vColor(p.s.v)}" stroke="#fff" stroke-width="2.5"/></g>`}).join('');
  }
  let roads='';const v=hsh(S.region);for(let i=0;i<5;i++){const y=(H*(i+1)/6)+((v>>i)%20-10),x=(W*(i+1)/6)+((v>>(i+3))%24-12);
    roads+=`<path d="M0 ${y} Q${W/2} ${y+((v>>i)%30-15)} ${W} ${y+((v>>(i+1))%16-8)}" stroke="#fff" stroke-width="3" fill="none" opacity=".55"/><path d="M${x} 0 Q${x+((v>>i)%30-15)} ${H/2} ${x+((v>>(i+2))%20-10)} ${H}" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/>`}
  const sel=IMAP.sel&&(r.spots||[]).find(s=>s.id===IMAP.sel);
  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="imap-svg" role="img" aria-label="${r.name} 지도"><rect width="${W}" height="${H}" fill="#CFE7F3"/>
    <g class="imap-sea"><path d="M-40 ${H*.3} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/><path d="M-40 ${H*.75} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".45"/></g>
    <path d="${land}" fill="#DDEFD5" stroke="#B9D9B0" stroke-width="1.5"/>${jeju}
    ${IMAP.view==='korea'?'':`<g clip-path="none">${roads}</g>`}${pins}</svg>
    <div class="imap-leg">${IMAP.view==='korea'?'<span><i style="background:#2E9E62"></i>실데이터</span><span><i style="background:#9AB3C4"></i>수집 전·예시</span>':pts.length?'<span><i style="background:#2E9E62"></i>가능</span><span><i style="background:#E0A400"></i>부분</span><span><i style="background:#D2493D"></i>불가</span><span><i style="background:#2E8BC7"></i>기타</span>':'<span>좌표가 있는 장소가 아직 없어</span>'}</div>
    ${sel?`<div class="imap-pop"><b>${esc(sel.name)}</b><span>${esc(sel.cat)} · ${sel.rate!=null?'★'+sel.rate.toFixed(1):'휠체어 '+esc(sel.v)}</span><button onclick="goCard('${sel.id}')">카드 보기</button></div>`:''}`;
  g('mapRegBtn').textContent=r.name+' 보기';
}
function mapSel(id){IMAP.sel=IMAP.sel===id?null:id;renderIMap()}
initMap=function(){MAP={svg:1};MAP_MODE='s';IMAP.view='region';renderIMap();try{new ResizeObserver(()=>renderIMap()).observe(g('lmap'))}catch(e){}};
mapResize=function(){renderIMap()};
drawMarkers=function(){if(MAP)renderIMap()};
mapRegion=function(){IMAP.view='region';IMAP.sel=null;renderIMap();mapMsg('')};
mapKorea=function(){IMAP.view='korea';IMAP.sel=null;renderIMap();mapMsg('')};
ensureGeo=async function(){};
mapSearch=function(){const q=(g('q').value||'').trim();if(!q){toast('검색어를 입력해줘');return}
  const sp=(R().spots||[]).find(s=>s.name.includes(q));
  if(sp){IMAP.view='region';IMAP.sel=GEO[sp.id]?sp.id:null;renderIMap();if(!GEO[sp.id])goCard(sp.id);mapMsg(sp.name);return}
  const k=Object.keys(REG_ALIAS).find(k=>REGIONS[k]&&REG_ALIAS[k].some(a=>a===q||a.includes(q)));
  if(k){setRegion(k);return}
  mapMsg('');toast('"'+q+'"은 아직 등록된 장소가 아니야')};
