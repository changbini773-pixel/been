#!/usr/bin/env node
/*
 * 노약자·시각장애 판정 CSV를 앱(app/easytrip.html)의 TYPE_JUDG 에 병합한다.
 *
 * 사용법:
 *   node tools/merge_types.js app/easytrip.html 노약자판정.csv [시각판정.csv ...] [--dry]
 *
 * CSV 열(헤더 이름은 아래 별칭 중 아무거나):
 *   id        장소 id (gyeongju_1, y3 …)                  — 없으면 name(+region)으로 찾음
 *   name      장소 이름                                     (place, 장소, 장소명)
 *   region    지역 키나 이름 (gyeongju / 경주 / 부산 …)      (city, 도시, 지역) — 선택
 *   type      노약자 | 시각장애 동반 (elder, visual, blind도 됨)  (유형, 이동유형)
 *   verdict   가능 | 부분 | 불가 | 미확인                     (판정, v)
 *   source    방문 | 표기 | 공식안내                          (출처, src)
 *   quote     원문 인용(40자 이내)                           (인용, 근거, evidence)
 *   url       대표 출처 링크                                 (link, 출처링크)
 *   snippet   quote를 뽑은 원문(선택). 있으면 quote가 원문에 그대로 있는지 대조해서 없으면 버림
 *
 * 규칙:
 *   - 앱에 없는 장소는 새로 만들지 않고 unmatched 로 보고한다(좌표·분류 없이 지어내지 않기 위해).
 *   - snippet 이 있는데 quote 가 원문에 없으면 환각으로 보고 버린다.
 *   - 판정이 '미확인'/'판단불가'인 행은 넣지 않는다(기본값이 미확인).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const files = args.filter(a => a !== '--dry');
if (files.length < 2) {
  console.error('사용법: node tools/merge_types.js app/easytrip.html 판정.csv [판정2.csv ...] [--dry]');
  process.exit(1);
}
const htmlPath = files[0];
const csvPaths = files.slice(1);

/* ---------- CSV ---------- */
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(x => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some(x => x !== '')) rows.push(row);
  const head = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}
const ALIAS = {
  id: ['id', 'spot_id', 'spotid'],
  name: ['name', 'place', '장소', '장소명', '이름'],
  region: ['region', 'region_key', 'city', '도시', '지역'],
  type: ['type', '유형', '이동유형', 'mob'],
  verdict: ['verdict', '판정', 'v'],
  source: ['source', '출처', 'src'],
  quote: ['quote', '인용', '근거', 'evidence'],
  url: ['url', 'link', '출처링크', 'u'],
  snippet: ['snippet', '원문', 'text'],
};
function pick(row, key) {
  for (const a of ALIAS[key]) {
    const hit = Object.keys(row).find(k => k.toLowerCase() === a.toLowerCase());
    if (hit && row[hit] !== '') return row[hit];
  }
  return '';
}
function normType(t) {
  t = t.trim().toLowerCase();
  if (/노약|elder|senior|old/.test(t)) return '노약자';
  if (/시각|visual|blind/.test(t)) return '시각장애 동반';
  if (/휠체어|wheel/.test(t)) return '휠체어';
  return '';
}
function normVerdict(v) {
  v = v.trim();
  if (/^가능|yes|ok/i.test(v)) return '가능';
  if (/^부분|partial/i.test(v)) return '부분';
  if (/^불가|no\b|impossible/i.test(v)) return '불가';
  return '미확인';
}
function normSource(s) {
  if (/방문|visit/i.test(s)) return '방문 후기';
  if (/공식|official/i.test(s)) return '공식 안내';
  if (/표기|업체|listing/i.test(s)) return '업체 표기';
  return s;
}
const squash = s => String(s).replace(/\s+/g, '').toLowerCase();

/* ---------- 앱에서 장소 목록 읽기 ---------- */
const html = fs.readFileSync(htmlPath, 'utf8');
const spots = require('./lib_spots').loadSpots(html);
const byId = new Map(spots.map(s => [s.id, s]));

function findSpot(row) {
  const id = pick(row, 'id');
  if (id && byId.has(id)) return { hit: byId.get(id) };
  const name = squash(pick(row, 'name'));
  if (!name) return { why: 'id·name 없음' };
  const reg = squash(pick(row, 'region'));
  let cand = spots.filter(s => squash(s.name) === name);
  if (reg) cand = cand.filter(s => squash(s.region) === reg || squash(s.regionName).includes(reg) || reg.includes(squash(s.regionName).replace(/부산|서울/, '')));
  if (cand.length === 1) return { hit: cand[0] };
  if (cand.length > 1) return { why: '이름이 같은 장소가 ' + cand.length + '곳 (region 열 필요)' };
  return { why: '앱에 없는 장소' };
}

/* ---------- 병합 ---------- */
const block = html.match(/\/\*TYPE_JUDG_START\*\/var TYPE_JUDG=(.*?);var TYPE_META=(.*?);\/\*TYPE_JUDG_END\*\//);
if (!block) throw new Error('TYPE_JUDG 마커를 찾지 못했어 (v9 스크립트가 있는지 확인)');
const J = JSON.parse(block[1]);
const META = JSON.parse(block[2]);
const report = { rows: 0, merged: 0, skippedUnknown: 0, dropped: [], unmatched: [], noSnippet: 0, byType: {} };

for (const p of csvPaths) {
  const rows = parseCSV(fs.readFileSync(p, 'utf8'));
  for (const row of rows) {
    report.rows++;
    const type = normType(pick(row, 'type'));
    if (!type || type === '휠체어') { report.dropped.push([p, pick(row, 'name'), 'type 없음/휠체어(휠체어는 기존 판정 사용)']); continue; }
    const v = normVerdict(pick(row, 'verdict'));
    if (v === '미확인') { report.skippedUnknown++; continue; }
    const quote = pick(row, 'quote');
    const snip = pick(row, 'snippet');
    if (!quote) { report.dropped.push([p, pick(row, 'name'), '인용 없음']); continue; }
    if (snip) {
      if (!squash(snip).includes(squash(quote))) { report.dropped.push([p, pick(row, 'name'), '인용이 원문에 없음(환각)']); continue; }
    } else report.noSnippet++;
    const f = findSpot(row);
    if (!f.hit) { report.unmatched.push([p, pick(row, 'name'), pick(row, 'region'), f.why]); continue; }
    J[f.hit.id] = J[f.hit.id] || {};
    J[f.hit.id][type] = { v, src: normSource(pick(row, 'source')), q: quote.slice(0, 60), u: pick(row, 'url') };
    report.merged++;
    report.byType[type] = report.byType[type] || { '가능': 0, '부분': 0, '불가': 0 };
    report.byType[type][v]++;
  }
}
for (const t of Object.keys(report.byType)) {
  META[t] = { n: Object.values(J).filter(x => x[t]).length, at: new Date().toISOString().slice(0, 10) };
}

console.log(`행 ${report.rows} · 병합 ${report.merged} · 미확인 건너뜀 ${report.skippedUnknown} · 버림 ${report.dropped.length} · 앱에 없는 장소 ${report.unmatched.length}`);
for (const [t, c] of Object.entries(report.byType)) console.log(`  ${t}: 가능 ${c['가능']} / 부분 ${c['부분']} / 불가 ${c['불가']}`);
if (report.noSnippet) console.log(`  주의: 원문(snippet) 없이 들어온 행 ${report.noSnippet}개는 인용 대조를 못 했어`);
if (report.dropped.length) console.log('버린 행(앞 10개):', report.dropped.slice(0, 10));

const outDir = path.join(path.dirname(csvPaths[0]));
if (report.unmatched.length) {
  const f = path.join(outDir, 'merge_unmatched.csv');
  fs.writeFileSync(f, '﻿file,name,region,why\n' + report.unmatched.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n'));
  console.log('앱에 없는 장소 목록 →', f);
}
if (dry) { console.log('--dry: 파일은 바꾸지 않았어'); process.exit(0); }
const out = html.replace(block[0], `/*TYPE_JUDG_START*/var TYPE_JUDG=${JSON.stringify(J)};var TYPE_META=${JSON.stringify(META)};/*TYPE_JUDG_END*/`);
fs.writeFileSync(htmlPath, out);
console.log('병합 완료 →', htmlPath);
