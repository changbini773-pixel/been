/* ============ js/02_shell_markup.js ============
   화면 전체 HTML 뼈대(etShell) — 탭·시트·온보딩 등 마크업. 화면 구조를 바꾸려면 여기
*/
function etShell(){return `
<div class="et"><div class="phone">
 <div class="onb" id="onb" aria-label="EasyTrip 소개">
  <div class="onb-s s1 on" data-i="0">
   <img class="o1t" src="${ONB_IMG[0]}" alt="EasyTrip. 누구나, 어디든, 편안하게. 접근 가능한 여행지 검색, 휠체어 이동 경로 안내, 장애인 친화적 숙소 추천, 이동 지원 서비스 연계">
   <img class="o1p" src="${ONB_IMG[1]}" alt="">
   <div class="onb-pn p1"><button class="onb-go" onclick="onbNext()">지금 시작하기<span>→</span></button>${onbDots(0)}</div>
  </div>
  <div class="onb-s s2" data-i="1">
   <img class="o2" src="${ONB_IMG[2]}" alt="이동이 편리한 여행을 위한 맞춤 경로">
   <div class="onb-pn p2">${onbDots(1)}<button class="onb-nx" onclick="onbNext()">다음<span>→</span></button></div>
  </div>
  <div class="onb-s s2" data-i="2">
   <img class="o2" src="${ONB_IMG[3]}" alt="더 안전하고, 더 편리한 여행을 위해">
   <div class="onb-pn p2">${onbDots(2)}<button class="onb-nx" onclick="onbNext()">다음<span>→</span></button></div>
  </div>
 </div>
 <div class="hd">
  <div class="hd-top">
   <div class="wm">Easy<i>Trip</i></div>
   <button class="hbtn" id="btnBig" onclick="toggleBig()" aria-label="큰 글씨 모드" aria-pressed="false"><span style="font-size:17px">가</span><span style="font-size:17px;font-weight:800">+</span></button>
   <button class="hbtn sos" onclick="sosSheet()" aria-label="긴급 도움">${ic('sos',18,2.2)}SOS</button>
  </div>
  <button class="mobbar" onclick="mobSheet()" aria-label="이동 유형 변경">
   <span class="ic" id="brandIc">${mobIc(M('휠체어'),22)}</span>
   <span class="tx"><b id="brandSub">휠체어</b><small id="brandDesc">경사 8% 이하 · 충전소 경유 포함</small></span>
   <span class="ch">바꾸기${chevR(15)}</span>
  </button>
 </div>
 <main id="main">
  <section class="view on" id="v0">
   <div class="ticket">
    <button class="tk-top" onclick="regionSheet()">
     <span class="tx"><span class="tk-reg" id="regName">경산</span><span class="tk-sub" id="regSub">경상북도</span><span class="tk-chg">지역 변경${chevR(16)}</span></span>
     <span class="tk-ph" id="regPh"><span id="regPhL">첨성대</span></span>
    </button>
    <div class="perf"></div>
    <button class="tk-dates" onclick="openCal()" aria-label="여행 기간 변경">
     <span class="tk-d"><span class="lbl">출발</span><b id="fStart">—</b><span id="fStartW"></span></span>
     <span class="tk-n" id="dRange"></span>
     <span class="tk-d r"><span class="lbl">도착</span><b id="fEnd">—</b><span id="fEndW"></span></span>
    </button>
    <div class="tk-stats" id="statRow" style="display:none">
     <div class="tk-stat"><b id="stN">—</b><span>방문 스팟</span></div>
     <div class="tk-stat w"><b id="stW">—</b><span>주의 구간</span></div>
     <div class="tk-stat"><b id="stD">—</b><span>할인 가능</span></div>
    </div>
   </div>
   <button class="btn dark" style="margin-top:14px" onclick="taxiSheet()">${ic('taxi',21,1.8)}부르미 호출</button>
   <div class="qa">
    <button class="qbtn" onclick="toiletSheet()"><span class="qi">${qaIc('wc',ic('wc',22,1.7))}</span>근처 화장실</button>
    <button class="qbtn" onclick="discountSheet()"><span class="qi">${qaIc('tag',ic('tag',21,1.8))}</span>할인 정보</button>
    <button class="qbtn" onclick="companionSheet()"><span class="qi">${qaIc('users',ic('users',21,1.8))}</span>동행자</button>
   </div>
   <div id="routeArea"></div>
  </section>

  <section class="view" id="v1">
   <h2 class="pg-t">편의 스팟</h2>
   <div id="planBanner"></div>
   <button class="toilet-btn" onclick="toiletSheet()">
    <span class="qi">${ic('wc',23,1.7)}</span>
    <span class="tx"><b>근처 장애인 화장실 바로 찾기</b><span>현재 위치 기준 가까운 순 · 개방 여부 표시</span></span>
    ${chevR(20)}
   </button>
   <div id="aiEntry"></div>
   <div class="mapc">
    <div class="search">${ic('search',18,2.2)}<input id="q" type="search" enterkeyhint="search" placeholder="장소·지역 검색 (예: 불국사, 강릉)" oninput="renderSpots()" onkeydown="if(event.key==='Enter'){event.preventDefault();mapSearch()}" aria-label="장소 검색"><button class="srch-go" onclick="mapSearch()">이동</button></div>
    <div class="lmap" id="lmap" aria-label="대한민국 지도"></div>
    <div class="map-ft"><button class="mini" onclick="mapKorea()">전국 보기</button><button class="mini" onclick="mapRegion()" id="mapRegBtn">현재 지역</button><button class="mini" id="kmBtn" onclick="kmSheet()" hidden>카카오 지도 연결</button><span id="mapMsg"></span></div>
   </div>
   <div class="fchips" id="fchips"></div>
   <div id="mineBox"></div>
   <div id="spotList"></div>
  </section>

  <section class="view" id="v2">
   <h2 class="pg-t">현장 제보<span id="repCnt"></span></h2>
   <button class="btn pri" onclick="reportSheet()">${ic('plus',20,2.4)}지금 상황 제보하기</button>
   <p class="hint" style="margin-bottom:18px">공사·고장은 동선에서 자동으로 빠지고, 개선 제보는 다음 추천에 반영돼.</p>
   <div id="repList"></div>
  </section>

  <section class="view" id="v3">
   <h2 class="pg-t">마이페이지</h2>
   <div class="me" id="meCard"></div>
   <div class="seg">
    <button class="sgb on" id="sg0" onclick="setMyTab(0)">내가 쓴 리뷰</button>
    <button class="sgb" id="sg1" onclick="setMyTab(1)">내가 한 제보</button>
   </div>
   <div id="myList"></div>
   <div class="sec-t">화면 · 안내 설정</div>
   <label class="toggle-row">
    <div><div class="tr-l">${ic('text',20)}큰 글씨 모드</div><div class="sub">본문 글자를 약 20% 키워</div></div>
    <span class="sw"><input type="checkbox" id="swBig" onchange="toggleBig()"><i></i></span>
   </label>
   <label class="toggle-row">
    <div><div class="tr-l">${ic('speak',20)}화면 진입 시 자동 읽기</div><div class="sub">플랜 탭을 열 때 동선을 바로 읽어줘</div></div>
    <span class="sw"><input type="checkbox" id="swAuto" onchange="S.autoTts=this.checked;toast(this.checked?'자동 읽기를 켰어':'자동 읽기를 껐어')"><i></i></span>
   </label>
   <div class="sec-t">필수 조건</div>
   <div id="condBox"></div>
   <div class="sec-t">비상 연락처</div>
   <div class="crd"><div id="contactList"></div><button class="mini full" onclick="toast('연락처 추가 화면으로 이동')">+ 연락처 추가</button></div>
   <div class="sec-t">동행자</div>
   <div class="crd"><div id="compList"></div><button class="mini full" onclick="companionSheet()">동행자 초대 · 위치 공유</button></div>
   <p class="hint" style="margin-bottom:10px">이동 유형을 바꾸면 경사·턱 기준과 리뷰 정렬이 함께 바뀌어.</p>
  </section>
 </main>

 <nav>
  <button class="nav-b on" onclick="goTab(0)">${ic('route',23,1.8)}여행 플랜</button>
  <button class="nav-b" onclick="goTab(1)">${ic('map',23,1.8)}편의 스팟</button>
  <button class="nav-b" onclick="goTab(2)">${ic('chat',23,1.8)}실시간 제보</button>
  <button class="nav-b" onclick="goTab(3)">${ic('user',23,1.8)}마이페이지</button>
 </nav>

 <div class="sheet-bg" id="sheetBg" onclick="if(event.target===this)closeSheet()">
  <div class="sheet" id="sheetEl" role="dialog" aria-modal="true">
   <div class="grab"></div>
   <div class="sh-hd"><div style="flex:1;min-width:0"><h3 id="shTitle"></h3><p class="sub" id="shSub"></p></div>
    <button class="navb" onclick="closeSheet()" aria-label="닫기">${ic('x',18,2.4)}</button></div>
   <div id="shBody"></div>
  </div>
 </div>
 <div id="toast">${ic('check',18,2.8)}<span id="toastMsg"></span></div>
</div></div>`}
