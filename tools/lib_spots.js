'use strict';
/* app/easytrip.html 안의 실데이터 장소 목록을 읽는다 (NEWREG 줄 + gyeongsan 줄). */
function loadSpots(html) {
  const lines = html.split('\n');
  const out = [];
  const newreg = lines.find(l => l.startsWith('var NEWREG='));
  if (!newreg) throw new Error('NEWREG 줄을 찾지 못했어');
  const N = JSON.parse(newreg.slice('var NEWREG='.length).replace(/;\s*$/, ''));
  for (const [k, r] of Object.entries(N.regions)) for (const s of r.spots) out.push(Object.assign({ region: k, regionName: r.name }, s));
  const gs = lines.find(l => l.startsWith('gyeongsan:'));
  if (!gs) throw new Error('gyeongsan 줄을 찾지 못했어');
  const G = JSON.parse(gs.slice('gyeongsan:'.length).replace(/,\s*$/, ''));
  for (const s of G.spots) out.push(Object.assign({ region: 'gyeongsan', regionName: G.name }, s));
  return out;
}
module.exports = { loadSpots };
