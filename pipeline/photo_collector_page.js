document.title='EasyTrip 사진 찾기';
document.body.innerHTML=`<div style="font-family:system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 16px;line-height:1.6;color:#eee">
<h2 style="margin:0 0 6px">EasyTrip 장소 사진 찾기 (434곳)</h2>
<p style="color:#aaa;margin:0 0 14px">카카오 이미지 검색 API로 장소마다 대표 사진 1장을 찾아. 키를 붙여 넣고 버튼을 한 번 누르면 돼. 3~5분 걸려. 진행분은 저장돼서 창이 닫혀도 이어서 할 수 있어.</p>
<input id="k2" type="password" placeholder="REST API 키" style="width:100%;padding:12px;font-size:16px;border:1.5px solid #999;border-radius:10px;box-sizing:border-box">
<button id="go3" style="margin-top:10px;width:100%;padding:14px;font-size:17px;font-weight:700;border:0;border-radius:10px;background:#1B6FB0;color:#fff">사진 찾기 시작</button>
<div style="height:10px;background:#444;border-radius:5px;margin-top:14px;overflow:hidden"><i id="fill3" style="display:block;height:100%;width:0;background:#1B6FB0"></i></div>
<pre id="log3" style="white-space:pre-wrap;background:#f5f5f5;color:#222;padding:12px;border-radius:10px;margin-top:12px;min-height:80px;font-size:13px"></pre></div>`;
const T=__TARGETS__;
const log=m=>{const l=document.getElementById('log3');l.textContent=(m+'\n'+l.textContent).slice(0,3000)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dbp=new Promise((res,rej)=>{const r=indexedDB.open('easytrip_ph',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const idbGet=async k=>{const db=await dbp;return new Promise(r=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(undefined)})};
const idbSet=async(k,v)=>{const db=await dbp;return new Promise(r=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>r(true);t.onerror=()=>r(false)})};
window.__PH={T,res:{},i:0,running:false,done:false,cors:{ok:0,fail:0}};
(async()=>{const s=await idbGet('ph');if(s){__PH.res=s.res;__PH.i=s.i;__PH.done=s.done;log('이전 진행분 '+s.i+'/'+T.length+' 불러옴')}})();
async function toData(u){const r=await fetch(u);if(!r.ok)throw new Error(r.status);const b=await r.blob();const bm=await createImageBitmap(b);const w=Math.min(360,bm.width),h=Math.round(bm.height*w/bm.width);const c=document.createElement('canvas');c.width=w;c.height=Math.min(h,Math.round(w*0.66));c.getContext('2d').drawImage(bm,0,(c.height-h)/2,w,h);return c.toDataURL('image/jpeg',0.6)}
document.getElementById('go3').onclick=async()=>{
  if(__PH.running)return;const inp=document.getElementById('k2'),key=inp.value.trim();if(!key){log('키를 먼저 붙여넣어줘');return}
  inp.value='';inp.disabled=true;__PH.running=true;const btn=document.getElementById('go3');btn.textContent='찾는 중…';
  const H={headers:{Authorization:'KakaoAK '+key}};
  try{
    while(__PH.i<T.length){const [id,name,city,unit]=T[__PH.i];
      const q=city+' '+name;
      const r=await fetch('/v2/search/image?query='+encodeURIComponent(q)+'&size=5&sort=accuracy',H);const j=await r.json();
      if(!r.ok)throw new Error(r.status+' '+(j.message||''));
      const d=(j.documents||[])[0];
      if(d){let data=null;try{data=await toData(d.thumbnail_url);__PH.cors.ok++}catch(e){__PH.cors.fail++}
        __PH.res[id]={q,thumb:d.thumbnail_url,img:d.image_url,site:d.display_sitename,doc:d.doc_url,w:d.width,h:d.height,data}}
      else __PH.res[id]={q,none:1};
      __PH.i++;if(__PH.i%10===0){await idbSet('ph',{res:__PH.res,i:__PH.i,done:false});log(__PH.i+'/'+T.length+' · 변환 성공 '+__PH.cors.ok+' / 실패 '+__PH.cors.fail)}
      document.getElementById('fill3').style.width=(__PH.i/T.length*100).toFixed(1)+'%';await sleep(60)}
    __PH.done=true;await idbSet('ph',{res:__PH.res,i:__PH.i,done:true});
  }catch(e){log('오류: '+e.message+' (저장됨, 다시 누르면 이어서)');inp.disabled=false;btn.textContent='이어서 찾기';__PH.running=false;return}
  __PH.running=false;btn.textContent='완료';log('끝. '+Object.keys(__PH.res).length+'곳 · 변환 성공 '+__PH.cors.ok+' / 실패 '+__PH.cors.fail+'. Claude에게 "됐어"라고 말해줘.')};
'ready '+T.length
