/* ============ js/31_regions_install.js ============
   data/regions_real.js 의 실데이터를 REGIONS·GEO에 등록
*/
(function(){
  Object.keys(REGIONS).filter(k=>/^bs_/.test(k)).forEach(k=>{delete REGIONS[k];delete REG_ALIAS[k];delete REG_GEO[k]});
  Object.assign(GEO,NEWREG.geo);
  Object.entries(NEWREG.regions).forEach(([k,r])=>{REGIONS[k]=r;REG_GEO[k]=[r._c[0],r._c[1],12]});
  BUSAN_G=[{"k": "bs_nampo", "name": "남포·원도심", "en": "Nampo", "gus": ["중구"], "hubs": [], "c": [35.1007, 129.0313]}, {"k": "bs_songdo", "name": "송도·영도", "en": "Songdo · Yeongdo", "gus": ["서구", "영도구"], "hubs": [], "c": [35.0788, 129.0329]}, {"k": "bs_seomyeon", "name": "서면·부산역", "en": "Seomyeon", "gus": ["부산진구", "동구"], "hubs": [], "c": [35.129, 129.0465]}, {"k": "bs_gwangan", "name": "광안리·대연", "en": "Gwangalli", "gus": ["수영구", "남구"], "hubs": [], "c": [35.1455, 129.1097]}, {"k": "bs_haeundae", "name": "해운대·기장", "en": "Haeundae · Gijang", "gus": ["해운대구", "기장군"], "hubs": [], "c": [35.1973, 129.1835]}, {"k": "bs_dongnae", "name": "동래·연제·금정", "en": "Dongnae", "gus": ["동래구", "연제구", "금정구"], "hubs": [], "c": [35.2024, 129.0846]}, {"k": "bs_west", "name": "서부산", "en": "West Busan", "gus": ["사하구", "사상구", "북구", "강서구"], "hubs": [], "c": [35.1439, 128.9555]}];
  BUSAN_G.forEach(x=>{REG_ALIAS[x.k]=['부산','Busan'].concat(x.gus)});
  REG_ALIAS.gyeongju=['경주','경북'];REG_ALIAS.jeonju=['전주','한옥마을'];REG_ALIAS.gangneung=['강릉','강원'];
  REG_RECENT=REG_RECENT.filter(k=>REGIONS[k]||String(k).startsWith('c:'));
})();
