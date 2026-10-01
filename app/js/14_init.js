/* ============ js/14_init.js ============
   앱 초기화(etInit)와 커스텀 요소 등록
*/
/* ================= init ================= */
function etInit(){
  ONB=0; MAP=null; MINI=null; MINI_PIN=null; MAP_PENDING=null; MAP_MODE=null; MAP_LOADING=0; K_PINS=[]; K_POP=null; K_HIT=null;
  const m=g('main');let x0=null,y0=null;
  m.addEventListener('pointerdown',e=>{
    if(e.target.closest('.lmap,.qa,.days,.fchips,.slots,.dchips,.calg,input,select,textarea,button,label')){x0=null;return}
    x0=e.clientX;y0=e.clientY;
  });
  m.addEventListener('pointerup',e=>{
    if(x0===null)return;
    const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;
    if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4)return;
    const n=S.tab+(dx<0?1:-1); if(n<0||n>3)return; goTab(n);
  });
  g('fchips').innerHTML=FILTERS.map(([k,l])=>`<button class="fchip${k==='all'?' on':''}" data-f="${k}" onclick="setF('${k}')">${l}</button>`).join('');
  g('contactList').innerHTML=CONTACTS.map(c=>`
   <div class="person">${ic('user',21,1.8)}<div><div class="nm">${c.n} · ${c.r}</div><div class="rl" style="font-family:var(--mono)">${c.p}</div></div>
   <button class="mini" onclick="toast('${c.n}에게 위치를 보냈어')">위치 전송</button></div>`).join('');
  g('compList').innerHTML=COMPANIONS.map(c=>`
   <div class="person">${ic('users',21,1.8)}<div><div class="nm">${c.n}</div><div class="rl">${c.r}</div></div>
   <button class="mini" onclick="companionSheet()">${c.on?'관리':'다시 초대'}</button></div>`).join('');
  setMob("휠체어"); syncDate(); loadRegPhoto(); renderSpots(); renderReports(); renderMe(); renderMy();
}

var EasyTripApp=class extends HTMLElement{
  connectedCallback(){
    if(this._on){if(this._host){ET_ROOT=this._host}return} this._on=1;
    if(!document.getElementById('et-css')){const st=document.createElement('style');st.id='et-css';st.textContent=ET_CSS;document.head.appendChild(st)}
    const host=document.createElement('div');host.innerHTML=ET_ICONS+etShell();this.appendChild(host);this._host=host;
    const run=()=>{if(!this.isConnected)return;ET_ROOT=host;try{etInit()}catch(e){console.error('EasyTrip init',e)}};
    setTimeout(run,0);
  }
}
if(window.customElements&&!customElements.get('easy-trip')) customElements.define('easy-trip',EasyTripApp);


