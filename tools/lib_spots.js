'use strict';
const fs = require('fs');
const path = require('path');

/* 앱 위치(app 폴더 또는 예전 단일 HTML)에서 장소 데이터 원문, TYPE_JUDG 가 든 파일, 저장소 루트를 찾는다. */
function readApp(p) {
  if (fs.statSync(p).isDirectory()) return {
    src: ['data/regions_real.js', 'data/regions_base.js'].map(f => fs.readFileSync(path.join(p, f), 'utf8')).join('\n'),
    judgPath: path.join(p, 'js', '35_type_judg.js'),
    root: path.resolve(p, '..'),
  };
  return { src: fs.readFileSync(p, 'utf8'), judgPath: p, root: path.resolve(path.dirname(p), '..') };
}

/* 앱 소스 안의 실데이터 장소 목록을 읽는다 (NEWREG 줄 + gyeongsan 줄). */
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
module.exports = { loadSpots, readApp };
