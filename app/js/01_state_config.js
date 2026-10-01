/* ============ js/01_state_config.js ============
   앱 상태(S), 이동유형(MOBS), 필터·제보유형·연락처·동행자 등 설정값과 아이콘 SVG
*/
var ET_ICONS="<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><defs>\n<g id=\"i-wheel\"><circle cx=\"11\" cy=\"17\" r=\"5\"/><path d=\"M9 2.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z\"/><path d=\"M9 7v5h5l3 5\"/><path d=\"M17.5 13.5 21 13\"/></g>\n<g id=\"i-route\"><circle cx=\"6\" cy=\"19\" r=\"2.4\"/><circle cx=\"18\" cy=\"5\" r=\"2.4\"/><path d=\"M15.6 5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8.4\"/></g>\n<g id=\"i-map\"><path d=\"M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3z\"/><path d=\"M9 3v15M15 5.5v15\"/></g>\n<g id=\"i-chat\"><path d=\"M21 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-5.9A8 8 0 1 1 21 12z\"/></g>\n<g id=\"i-check\"><path d=\"m4.5 12.5 5 5 10-11\"/></g>\n<g id=\"i-alert\"><path d=\"M12 3.5 2.5 20h19L12 3.5z\"/><path d=\"M12 10v4.5M12 17.4v.2\"/></g>\n<g id=\"i-info\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5.5M12 7.8v.2\"/></g>\n<g id=\"i-taxi\"><path d=\"M3 17v-4.2L5 8h14l2 4.8V17\"/><path d=\"M3 17h18v2.5h-3V17M6 19.5V17\"/><circle cx=\"7.5\" cy=\"14.5\" r=\"1.2\"/><circle cx=\"16.5\" cy=\"14.5\" r=\"1.2\"/><path d=\"M9.5 8V5.5h5V8\"/></g>\n<g id=\"i-arrow\"><path d=\"M4 12h15M13.5 6.5 20 12l-6.5 5.5\"/></g>\n<g id=\"i-bolt\"><path d=\"M13 2.5 4.5 13.5H11l-1 8L19.5 10H13l0-7.5z\"/></g>\n<g id=\"i-cane\"><circle cx=\"13\" cy=\"4\" r=\"1.8\"/><path d=\"M13 6.5 10.5 12l3.5 2 2 7.5\"/><path d=\"M10.5 12 7 21.5\"/><path d=\"M18 11v7a2.5 2.5 0 0 1-5 0\"/></g>\n<g id=\"i-baby\"><path d=\"M4 12h15a7.5 7.5 0 0 1-15 0z\"/><path d=\"M11.5 12V4a7.5 7.5 0 0 1 7.5 8\"/><circle cx=\"7\" cy=\"20\" r=\"1.6\"/><circle cx=\"16\" cy=\"20\" r=\"1.6\"/></g>\n<g id=\"i-blind\"><circle cx=\"12\" cy=\"4\" r=\"1.8\"/><path d=\"M12 6.5v5l-3.5 4\"/><path d=\"M12 11.5 15 15l1 6.5\"/><path d=\"M8.5 15.5 7 21.5\"/><path d=\"M4 20 9.5 9\"/></g>\n<g id=\"i-free\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8.5 12h7\"/></g>\n<g id=\"i-pin\"><path d=\"M12 21.5s7-6.4 7-11.5a7 7 0 1 0-14 0c0 5.1 7 11.5 7 11.5z\"/><circle cx=\"12\" cy=\"10\" r=\"2.6\"/></g>\n<g id=\"i-plus\"><path d=\"M12 5v14M5 12h14\"/></g>\n<g id=\"i-x\"><path d=\"M6 6l12 12M18 6L6 18\"/></g>\n<g id=\"i-search\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m16.5 16.5 4 4\"/></g>\n<g id=\"i-thumb\"><path d=\"M7 21V10l4.5-7.5A2 2 0 0 1 14.5 4l-1 6h5.5a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 17.5 21H7z\"/><path d=\"M7 10H3v11h4\"/></g>\n<g id=\"i-chev\"><path d=\"m7 10 5 5 5-5\"/></g>\n<g id=\"i-sos\"><path d=\"M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19z\"/><path d=\"M12 7v5.5M12 16.2v.2\"/></g>\n<g id=\"i-wc\"><path d=\"M5 21v-6H3.5l2-6.5h3L10.5 15H9v6H5z\"/><circle cx=\"7\" cy=\"4\" r=\"1.7\"/><circle cx=\"17\" cy=\"4\" r=\"1.7\"/><path d=\"M14 21v-5h-1l1.5-7h5L21 16h-1v5h-6z\"/></g>\n<g id=\"i-users\"><circle cx=\"9\" cy=\"8\" r=\"3.3\"/><path d=\"M2.5 20a6.5 6.5 0 0 1 13 0\"/><path d=\"M16 5.2a3.3 3.3 0 0 1 0 5.6M17.5 14.6A6.5 6.5 0 0 1 21.5 20\"/></g>\n<g id=\"i-tag\"><path d=\"M3 12.5V4h8.5L21 13.5 13.5 21 3 12.5z\"/><circle cx=\"7.5\" cy=\"8\" r=\"1.4\"/></g>\n<g id=\"i-sun\"><circle cx=\"12\" cy=\"12\" r=\"4.2\"/><path d=\"M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8\"/></g>\n<g id=\"i-rain\"><path d=\"M7 15.5a4.5 4.5 0 0 1 .6-9A6 6 0 0 1 19 8.5a3.5 3.5 0 0 1-.5 7H7z\"/><path d=\"M8 18.5 7 21M13 18.5 12 21M18 18.5 17 21\"/></g>\n<g id=\"i-snow\"><path d=\"M7 15.5a4.5 4.5 0 0 1 .6-9A6 6 0 0 1 19 8.5a3.5 3.5 0 0 1-.5 7H7z\"/><path d=\"M8 19.2v.2M13 20.2v.2M17.5 19.2v.2\"/></g>\n<g id=\"i-speak\"><path d=\"M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5z\"/><path d=\"M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.3a8 8 0 0 1 0 11.4\"/></g>\n<g id=\"i-stop\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/></g>\n<g id=\"i-text\"><path d=\"M4 6h16M8 6v13M4 6V4h16v2\"/></g>\n<g id=\"i-seat\"><path d=\"M6 4h3v9h9v3H6V4z\"/><path d=\"M18 16v4M6 16v4\"/></g>\n<g id=\"i-bed\"><path d=\"M3 18v-9M3 13h18v5M21 18v-3\"/><path d=\"M7 13v-3h7a4 4 0 0 1 4 3\"/><circle cx=\"8.5\" cy=\"10.5\" r=\"0\"/></g>\n<g id=\"i-phone\"><path d=\"M8 3H4.5A1.5 1.5 0 0 0 3 4.7C3.4 13 11 20.6 19.3 21a1.5 1.5 0 0 0 1.7-1.5V16l-4.5-2-2.3 2.3a13 13 0 0 1-5.5-5.5L11 8.5 8 3z\"/></g>\n<g id=\"i-cal\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"16\" rx=\"2.5\"/><path d=\"M3.5 10h17M8 3v4M16 3v4\"/></g>\n<g id=\"i-pen\"><path d=\"M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4z\"/><path d=\"M14.5 6.5 17.5 9.5\"/></g>\n<g id=\"i-user\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/></g>\n</defs></svg>";
var MOBS=[
 {n:"휠체어",ic:"#i-wheel",d:"경사 8% 이하 · 충전소 경유 포함",
  cond:[["장애인 화장실",1],["엘리베이터",1],["충전 가능 지점",1]],c:"#1580B8",bg:"#EAF5FC",tc:"#0B6FA4"},
 {n:"노약자",ic:"#i-cane",d:"짧고 완만한 경로 · 엘리베이터 우선",
  cond:[["계단 구간 제외",1],["휴식 벤치",1],["엘리베이터",1]],c:"#0F9D58",bg:"#E9F7EF",tc:"#0B7A44"},
 {n:"시각장애 동반",ic:"#i-blind",d:"점자블록·음성 안내 우선",
  cond:[["점자블록 경로",1],["음성 안내 지점",1],["동반자 좌석",1]],c:"#5B4BB8",bg:"#EEEDFB",tc:"#3E3190"},
 {n:"선택 안 함",ic:"#i-free",d:"필터 없이 전체 정보 보기",
  cond:[["장애인 화장실",0],["엘리베이터",0],["전용 주차구역",0]],c:"#5E7C8E",bg:"#EDF2F6",tc:"#37576B"}
];
var M=n=>MOBS.find(m=>m.n===n)||MOBS[0];
/* 빠른 버튼 아이콘: QA_IMG(data/qa_icons.js)가 있으면 3D 이미지, 없으면 기존 선 아이콘 */
function qaIc(k,svg){return (typeof QA_IMG!=='undefined'&&QA_IMG[k])?'<img class="mobimg" src="'+QA_IMG[k]+'" alt="">':svg}
function mobIc(m,sz,sw){return MOB_IMG[m.n]?'<img class="mobimg" src="'+MOB_IMG[m.n]+'" alt="" width="'+sz+'" height="'+sz+'">':ic(m.ic.slice(3),sz,sw)}

var S={mob:"휠체어",region:"gyeongsan",
  start:"2026-10-15",end:"2026-10-17",nDays:3,
  plan:null,day:0,addDay:0,openStop:{},
  filter:"all",open:{},helped:{},tab:0,myTab:0,
  big:false,autoTts:false,speaking:false,wx:{},myReviews:[]};
var R=()=>REGIONS[S.region];

var WX={
 clear:{ic:"#i-sun",t:"맑음 · 최고 21°C",p:"노면 상태 양호. 예정 동선 그대로 진행해도 좋아."},
 rain:{ic:"#i-rain",t:"비 · 시간당 3mm",p:"경사로·보도블록 미끄러움 주의. 흙길 구간은 우회를 권해."},
 snow:{ic:"#i-snow",t:"눈 · 적설 2cm",p:"경사 구간 결빙 위험. 실내 위주로 동선을 줄이는 걸 권해."}};

var FILTERS=[["all","전체"],["place","관광지"],["food","식당"],["stay","숙소"],
               ["step0","턱 0cm"],["toilet","장애인 화장실"],["charge","전동 충전"],["discount","할인 있음"],["visit","방문 확인"],["no","못 가는 곳"]];

var REPORTS=[
 {id:1,a:"바퀴로간다",m:"휠체어",ty:"obstacle",loc:"대릉원 정문 경사로",d:"12분 전",h:9,
  t:"정문 경사로가 공사 가림막으로 막혀 있습니다. 측면 2번 출입구로 돌아가야 해요."},
 {id:2,a:"느린여행",m:"노약자",ty:"broken",loc:"불국사 주차장 자동문",d:"1시간 전",h:14,
  t:"장애인 화장실 자동문이 수동으로만 열립니다. 혼자서는 힘들어요."},
 {id:3,a:"전동스쿠터맨",m:"휠체어",ty:"good",loc:"황리단길 메인거리",d:"3시간 전",h:31,
  t:"인도 턱 완화 공사가 끝났습니다. 이제 휠체어도 턱 없이 진입 가능해요."}];
var RTY={obstacle:["이동 장벽","--warn-bg","--warn-ink"],broken:["시설 고장","--sos-bg","--sos"],good:["개선됨","--ok-bg","--ok-ink"]};

var CONTACTS=[{n:"김○○",r:"어머니",p:"010-****-1234"},{n:"박○○",r:"활동지원사",p:"010-****-5678"}];
var COMPANIONS=[{n:"김○○",r:"동행 · 위치 공유 중",on:1},{n:"이○○",r:"초대 대기 중",on:0}];

/* ================= helpers ================= */
var ET_ROOT=document;
