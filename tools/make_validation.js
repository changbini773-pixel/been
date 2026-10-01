#!/usr/bin/env node
/*
 * 정확도 검증용 무작위 표본(기본 30곳)을 뽑아 검증 시트(HTML)와 표본 CSV를 만든다.
 *
 * 사용법: node tools/make_validation.js app [표본 수=30] [시드=20260930]
 *         node tools/make_validation.js app --verdict=불가   (그 판정 전체를 전수 검증)
 * 결과:   validation/정확도검증_30곳.html  (브라우저로 열어 사람이 원문과 대조)
 *         validation/정확도검증_30곳_표본.csv
 *
 * 같은 시드면 항상 같은 30곳이 나온다(재현 가능). 표본은 앱에 들어간 AI 판정 전체(경산 포함)에서 단순 무작위로 뽑는다.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadSpots, readApp } = require('./lib_spots');

const argv = process.argv.slice(2);
const only = (argv.find(a => a.startsWith('--verdict=')) || '').slice('--verdict='.length);
const [htmlPath, nArg, seedArg] = argv.filter(a => !a.startsWith('--'));
if (!htmlPath) { console.error('사용법: node tools/make_validation.js app [표본 수] [시드]'); process.exit(1); }
let N = parseInt(nArg || '30', 10);
const SEED = parseInt(seedArg || '20260930', 10);

/* 시드 고정 난수 (mulberry32) */
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const app = readApp(htmlPath);
const all = loadSpots(app.src).filter(s => s.evi && s.evi.u && /^https?:/.test(s.evi.u) && (!only || s.v === only));
if (only) N = all.length;
const r = rng(SEED);
const idx = all.map((_, i) => i);
for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
const sample = idx.slice(0, N).map((i, k) => {
  const s = all[i];
  return { no: k + 1, id: s.id, region: s.regionName, name: s.name, cat: s.cat, area: s.dist, v: s.v, src: s.evi.ty, t: s.evi.t, w: s.evi.w || '', u: s.evi.u };
});

const tag = only ? `${only}_전수${N}곳` : `${N}곳`;
const outDir = path.join(app.root, 'validation');
fs.mkdirSync(outDir, { recursive: true });
const q = x => '"' + String(x).replace(/"/g, '""') + '"';
fs.writeFileSync(path.join(outDir, `정확도검증_${tag}_표본.csv`),
  '﻿no,id,region,name,cat,area,verdict,source,ai_evidence,warning,url\n' +
  sample.map(s => [s.no, s.id, s.region, s.name, s.cat, s.area, s.v, s.src, s.t, s.w, s.u].map(q).join(',')).join('\n'));

const vc = sample.reduce((a, s) => (a[s.v] = (a[s.v] || 0) + 1, a), {});
const meta = { n: N, seed: SEED, only, pool: all.length, made: new Date().toISOString().slice(0, 10), vc };
const tpl = fs.readFileSync(path.join(__dirname, 'validation_template.html'), 'utf8');
const page = tpl.replace('/*DATA*/null', JSON.stringify({ meta, items: sample }).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(outDir, `정확도검증_${tag}.html`), page);
console.log(`${only ? only + ' 판정 전체' : '전체'} ${all.length}곳 중 ${N}곳 (시드 ${SEED}) · 판정 분포`, vc);
console.log('→', path.join(outDir, `정확도검증_${tag}.html`));
