/* ============ js/33_category_art.js ============
   장소 카테고리별 일러스트
*/
/* ================= 장소 카드 그림 (분류별 일러스트) ================= */
function catArt(s){
  const r=R(),th=r.theme||'default',cat=(s.cat||'')+' '+(s.tags||[]).join(' ');
  const pal={gyeongsan:['#FFEBDD','#E6F4EA'],gyeongju:['#FFE4D0','#FFF2E4'],seoul:['#DCEBFF','#F1F7FF'],busan:['#D3EEFF','#EFFAFF'],jeonju:['#FCE6E9','#FFF6F4'],gangneung:['#D8F3EE','#F2FFFB']}[th]||['#E3EEF5','#F7FBFD'];
  const v=hsh(s.id),W=400,H=156;let obj='';
  if(/카페/.test(cat)){obj=`<g transform="translate(170 40)"><path d="M0 30 h60 v34 a26 26 0 0 1 -26 26 h-8 a26 26 0 0 1 -26 -26z" fill="#fff"/><path d="M60 40 h8 a12 12 0 0 1 0 24 h-8" stroke="#fff" stroke-width="7" fill="none"/><rect x="-10" y="88" width="80" height="8" rx="4" fill="#fff" opacity=".9"/><path d="M8 34 h44 v6 h-44z" fill="#B98A5E"/>
    ${[14,30,46].map((x,i)=>`<path class="st-steam" style="animation-delay:${i*.5}s" d="M${x} 22 q-6 -8 0 -16 q6 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}</g>`}
  else if(/식당|주점/.test(cat)){obj=`<g transform="translate(150 46)"><path d="M0 40 h100 a50 44 0 0 1 -100 0z" fill="#fff"/><ellipse cx="50" cy="40" rx="50" ry="8" fill="#F3C98B"/><path d="M78 -6 L110 38 M90 -10 L118 34" stroke="#8A5A3A" stroke-width="4" stroke-linecap="round"/>
    ${[24,50,76].map((x,i)=>`<path class="st-steam" style="animation-delay:${i*.4}s" d="M${x} 26 q-6 -8 0 -16 q6 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}</g>`}
  else if(/숙소|숙박|stay/.test(cat)){obj=`<g transform="translate(150 34)"><rect x="0" y="10" width="100" height="100" rx="8" fill="#fff"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${14+c*28}" y="${22+r*26}" width="16" height="14" rx="3" fill="${(r+c+v)%3?'#CFE3F2':'#FFD98A'}"/>`).join('')).join('')}</g>`}
  else if(/교통/.test(cat)){obj=`<g transform="translate(120 50)"><rect x="0" y="0" width="160" height="62" rx="18" fill="#fff"/><rect x="16" y="14" width="30" height="20" rx="4" fill="#CFE3F2"/><rect x="56" y="14" width="30" height="20" rx="4" fill="#CFE3F2"/><rect x="96" y="14" width="30" height="20" rx="4" fill="#CFE3F2"/><rect x="0" y="44" width="160" height="6" fill="#2E8BC7"/><circle cx="36" cy="70" r="8" fill="#5A6B78"/><circle cx="124" cy="70" r="8" fill="#5A6B78"/><rect x="-100" y="80" width="400" height="4" fill="#fff" opacity=".8"/></g>`}
  else if(/문화|영화|교육/.test(cat)){obj=`<g transform="translate(140 30)"><path d="M0 40 L60 10 L120 40z" fill="#fff"/><rect x="6" y="40" width="108" height="10" fill="#fff"/>${[0,1,2,3].map(i=>`<rect x="${14+i*26}" y="52" width="12" height="46" fill="#fff" opacity=".92"/>`).join('')}<rect x="0" y="98" width="120" height="10" rx="3" fill="#fff"/></g>`}
  else if(/생활|여가/.test(cat)){obj=`<g transform="translate(150 40)"><path d="M0 44 L50 6 L100 44 V106 H0z" fill="#fff"/><rect x="38" y="66" width="24" height="40" rx="4" fill="#CFE3F2"/><rect x="12" y="54" width="18" height="16" rx="3" fill="#FFD98A"/><rect x="70" y="54" width="18" height="16" rx="3" fill="#FFD98A"/></g>`}
  else {obj=`<path d="M0 118 Q100 80 200 110 T400 104 V156 H0Z" fill="#fff" opacity=".7"/>${[90,200,310].map((x,i)=>`<g class="st-sway" style="transform-origin:${x}px 120px;animation-delay:${i*.5}s"><rect x="${x-3}" y="84" width="6" height="36" fill="#9A7050"/><circle cx="${x}" cy="76" r="${20-i%2*4}" fill="#8FCB9B"/></g>`).join('')}`}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#cg)"/>
    <circle cx="${40+v%60}" cy="${36+v%20}" r="${24+v%10}" fill="#fff" opacity=".35"/><circle cx="${330+v%40}" cy="${110-v%30}" r="${34+v%14}" fill="#fff" opacity=".3"/>${obj}</svg>`;
}
function catKo(s){const c=s.cat||'';return /카페/.test(c)?'카페':/식당/.test(c)?'식당':/주점/.test(c)?'주점':/숙/.test(c)?'숙소':/교통/.test(c)?'교통':/문화|영화/.test(c)?'문화':/교육/.test(c)?'교육':/생활|여가/.test(c)?'생활':'관광'}
