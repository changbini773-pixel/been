# EasyTrip — 무장애 여행 플래너 (경산시 공모전 · AI 및 빅데이터 부문)

## 폴더

| 경로 | 내용 |
|---|---|
| `app/` | 앱 소스 (역할별 분리, v9). `app/index.html`을 바로 열거나 `python3 app/build.py` → `app/dist/EasyTrip.html` 한 파일. 자세한 구조는 `app/README.md` |
| `pipeline/`, `data/` | 데이터 수집·판정 코드와 중간 산출물 (`CLAUDE.md` 3절) |
| `docs/` | 작업 이력, 기획서 초안, 참가신청서 양식 |
| `tests/compare_render.py` | Playwright 스모크 테스트 |
| `tools/merge_types.js` | 노약자·시각장애 판정 CSV를 검증해서 앱에 병합 |
| `tools/make_validation.js` | 정확도 검증 시트 생성 (무작위 30곳 / 판정별 전수) |
| `validation/` | 생성된 검증 시트와 표본 CSV |

## v9 변경 (2026-09-30)

코드는 `app/js/35_type_judg.js`에 있다.

- 장소마다 **휠체어 / 노약자 / 시각장애 동반** 판정을 따로 둔다 (`TYPE_JUDG`).
  - 휠체어는 기존 판정(`s.v`, `s.evi`)을 그대로 쓴다.
  - 노약자·시각장애 판정이 없으면 **미확인**으로 둔다. 휠체어 판정을 옮겨 쓰지 않는다.
- "(유형) 리뷰만 보기" → **"(유형)에 맞는 장소만 보기"**. 선택한 유형의 판정이 가능·부분인 곳만 걸러진다. 지도 핀 색도 유형 기준으로 바뀐다.
- 카드에 3종 판정 칩, 선택 유형의 근거 인용을 표시한다.
- AI 추천 동선을 유형별로 만든다. 노약자·시각장애는 해당 유형 판정만으로 구성하고, 데이터가 없으면 동선을 만들지 않는다.
- v5 때 시연용으로 지어낸 실시간 제보 3건(대릉원·불국사·황리단길)을 삭제했다.

## 노약자·시각장애 판정 넣기

```bash
node tools/merge_types.js app 노약자판정.csv 시각판정.csv --dry   # 미리보기
node tools/merge_types.js app 노약자판정.csv 시각판정.csv         # 병합 → app/js/35_type_judg.js
python3 app/build.py                                              # 배포용 한 파일 다시 만들기
```

CSV 열: `id`(또는 `name`+`region`), `type`, `verdict`, `source`, `quote`, `url`, `snippet`(선택).
`snippet`이 있으면 `quote`가 원문에 그대로 있는지 대조하고, 없으면 환각으로 보고 버린다.
앱에 없는 장소는 새로 만들지 않고 `merge_unmatched.csv`로 따로 뽑는다.

## 정확도 검증

```bash
node tools/make_validation.js app                 # 무작위 30곳 (시드 20260930)
node tools/make_validation.js app --verdict=불가   # 불가 27곳 전수
```

`validation/*.html`을 브라우저로 열고 원문 링크와 대조해서 답한다. 답은 그 브라우저에만 저장되고, **CSV 내보내기**로 결과를 받는다.

주의: 앱에 저장된 근거(`evi.t`)는 원문 그대로가 아니라 **요약문**이다. 원문 그대로의 인용 대조(387/388 일치)는 `EasyTrip_5개도시_접근성_AI판정_387곳.csv` 기준 수치다.
