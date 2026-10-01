/* ============ js/15_boot.js ============
   앱을 #et-mount에 마운트하고 CSS를 주입
*/
(function(){
  var host=document.getElementById('et-mount');
  if(!document.getElementById('et-css')){var st=document.createElement('style');st.id='et-css';st.textContent=ET_CSS;document.head.appendChild(st)}
  host.innerHTML=ET_ICONS+etShell();
  ET_ROOT=host;
  etInit();
})();

