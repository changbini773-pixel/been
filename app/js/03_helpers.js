/* ============ js/03_helpers.js ============
   아이콘/셰브론 등 작은 헬퍼
*/
var g=id=>ET_ROOT.querySelector('#'+id);
var ic=(n,s=20,w=1.9,st='')=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${st?` style="${st}"`:''}><use href="#i-${n}"/></svg>`;
var chevR=(s=16)=>ic('chev',s,2.4,'transform:rotate(-90deg)');
var RTC={obstacle:['var(--cau)','#3A2900'],broken:['var(--sos)','#fff'],good:['var(--ok-bg)','var(--ok-ink)']};

var onbDots=i=>`<div class="onb-dots" aria-hidden="true">${[0,1,2].map(k=>`<i${k===i?' class="on"':''}></i>`).join('')}</div>`;
