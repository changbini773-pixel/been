# EasyTrip — Claude Code 인수인계 문서

> Claude Code는 이 파일을 먼저 읽는다. 전체 대화 이력은 `docs/HISTORY.md`.
> 사용자(Lee)는 한국어 반말·짧은 답을 선호하고, 무조건 맞다는 식의 답보다 비판적 검토를 원한다.

## 1. 프로젝트 한 줄
이동약자(휠체어·노약자·시각장애)를 위한 **무장애 여행 플래너**. 웹 후기를 AI로 읽어 장소별 접근성을
**근거 문장과 함께** 구조화하고, 같은 이동유형 기준으로 장소·동선을 추천한다.

- 대회: 제3회 미래융합인재 발굴 소프트웨어 챌린지 (경산이노베이션아카데미), 분야 **AI 및 빅데이터**
- 1차 서류 마감 ≈ 2026-10-07. 양식: `docs/참가신청서_양식.hwp`, 작성 초안: `docs/기획서_초안.md`
- 앱 이름은 미정 (후보: 나란히, 길벗, 결 — 상표 확인 전)

## 2. 폴더 구조
```
app/                 앱 소스 (단일 HTML을 역할별로 분리한 것) — app/README.md 참고
  index.html         브라우저로 바로 열림 (서버 불필요)
  build.py           → app/dist/EasyTrip.html 한 파일로 합침 (배포·아티팩트용)
  css/style.css, js/01~35_*.js, data/{regions_real,regions_base,images}.js
  js/36_kakao_map.js  편의 스팟 지도: 카카오맵(키는 브라우저 localStorage, 코드에 넣지 말 것) / 실패 시 SVG 간이 지도
  js/35_type_judg.js  v9 이동 유형 3종 판정(TYPE_JUDG)·유형 필터·유형별 동선
tools/               merge_types.js(노약자·시각 판정 CSV → js/35 병합), make_validation.js(정확도 검증 시트)
validation/          생성된 정확도 검증 시트·표본 CSV
pipeline/            데이터 생성 코드
  filter_match_signal.js   광고 필터 + 장소↔후기 매칭 + 접근성 신호 정규식 (브라우저 콘솔에서 __X 대상으로 실행했던 코드)
  INSTRUCTIONS.md          휠체어 AI 판정 지침 (서브에이전트용)
  INSTRUCTIONS_ELDER.md    노약자·시각장애 AI 판정 지침
  gen_regions_5cities.py   data/5cities/*.json → newreg.json (앱의 regions_real.js 원본). data/5cities 에서 실행
  gen_region_gyeongsan.py  경산 CSV → gs_region.js (앱의 regions_base.js 내 gyeongsan)
  photo_collector_page.js  카카오 이미지 검색 수집 페이지 (키는 사용자가 페이지에 직접 입력)
data/
  gyeongsan/         경산 OSM 접근성, AI 추출 47곳 CSV
  5cities/           경주·전주·강릉·서울(강북/강남)·부산 중간 산출물 (아래 3절)
  EasyTrip_5개도시_접근성_AI판정_387곳.csv   최종 데이터셋
tests/compare_render.py   Playwright 스모크 테스트 (CHROMIUM=브라우저경로 python3 tests/compare_render.py)
docs/                HISTORY.md(전체 이력), 기획서_초안.md, 참가신청서_양식.hwp
```

## 3. 데이터 파이프라인과 실제 수치 (기획서에 쓰는 숫자 — 바꾸면 기획서도 같이 수정)
| 단계 | 방법 | 5개 도시 결과 |
|---|---|---|
| 수집 | 카카오 Local 카테고리 API(장소) + Daum 블로그 검색 API(후기). 허브 반경 1.5km 표본 | 장소 10,196 / 후기 27,047 |
| 정제 | 광고어(체험단·원고료·협찬…), 전화번호, 해시태그 4개↑ 제거 | 23,351 (3,696건 제거) |
| 매칭 | 장소명 핵심어(3자↑, STOP 리스트, 지점명) ↔ 후기 | 1,550곳 |
| 신호 | POS/NEG 정규식 (경사로·엘리베이터·턱·장애인화장실…) | 702곳 → `signal_702.json` |
| AI 판정 | 서브에이전트 8개 병렬, `INSTRUCTIONS.md`. 판정(가능/부분/불가/미확인)·출처유형·원문 인용(≤40자) | `result_*.json` → `results_all.json` (702) |
| 검증 | 인용문이 원문에 정규화 부분문자열로 존재하는지 코드 검사 | 388 중 387 일치 → **387곳** |

- 387곳 판정: 가능 341 / 부분 23 / 불가 23. '가능' 중 147곳(43%)은 업체 표기만. '불가' 23 중 22는 방문 후기.
- 경산(별도 수집): 장소 765, 블로그 1,843, OSM 18 → AI 판정 47곳 (가능 37 / 부분 5 / 불가 4 / 미확인 1). OSM과 겹친 곳 1곳.
  - ⚠ 앱 '데이터 수집 현황' 카드는 hit 38(≈5%), 기획서는 47곳(≈6%) — 기준 불일치, 제출 전 통일 필요.
- 원본 후기 27k건 전체는 컨테이너로 옮기지 않았다(브라우저 IndexedDB에만 있었음). 남아 있는 것은 702곳의 스니펫(`signal_702.json`, `chunk_*.json`).
- 5개 도시 수집기 페이지 코드는 보존되지 않았다. 재수집이 필요하면 위 표의 설계대로 다시 작성 (dapi.kakao.com 오리진에서 실행해야 CORS 없이 fetch 가능, 진행분은 IndexedDB에 저장).

### 노약자·시각장애 판정 (진행 중)
- `elder_*.json` (8개, 702곳): 노약자 가능 351 / 부분 52 / 불가 33 / 미확인 266. 시각 거의 전부 미확인(가능 5).
- 시각/노약자 키워드 후보 701곳 재판정: `vchunk_0..5.json` 입력 → `velder_0,1,3,5.json` 완료(467곳), **`velder_2`, `velder_4` 미완료**(rate limit으로 중단).
- 두 결과 모두 **인용문 원문 대조 검증을 아직 안 했다.** 앱에 반영 전 검증 필수.

## 4. 남은 작업 (우선순위)
1. `velder_2`, `velder_4` 판정 마저 돌리기 (`INSTRUCTIONS_ELDER.md`, 입력 vchunk_2/4) → elder+velder 병합 → 인용 검증
2. 검증된 노약자·시각 판정을 CSV로 만들어 `node tools/merge_types.js app 판정.csv` 로 병합 (→ `js/35_type_judg.js`의 TYPE_JUDG). 지금은 비어 있어 전 지역이 '미확인'
3. ~~"(내 유형)에 맞는 장소만 보기" 필터~~ — v9에서 완료 (`js/35_type_judg.js`)
4. ~~AI 추천 동선 이동유형별~~ — v9에서 완료 (`js/35_type_judg.js`). 데이터가 없는 유형은 동선을 만들지 않음
5. 정확도 검증: 무작위 30곳 사람 대조표 → 정밀도 수치를 기획서에 추가
6. 기획서: 참가 동기/활동 배경, 작품 구상도(파이프라인 흐름도) 작성
7. (선택) 공공데이터 결합: BF인증 15014781, 공중화장실 15012892, 관광공사 무장애 15101897

## 5. 작업 규칙
- **추정 금지**: 판정은 원문 근거가 있을 때만. 근거 없으면 '미확인'. 코드로 인용 검증까지 해야 반영.
- **수치는 파일에서 다시 계산**해서 쓰고, 바꾸면 `docs/기획서_초안.md`도 수정.
- **API 키를 코드·문서·커밋에 넣지 말 것.** 카카오 REST 키는 사용자가 수집 페이지 입력칸에 직접 넣는다. (예전 키가 한 번 노출됐으니 대회 후 재발급 권장. 예전 단일 HTML 산출물에는 키가 남아 있을 수 있음)
- regions_real.js 는 newreg.json 을 `var NEWREG=...` 로 감싼 것. 재생성 후 app/data/regions_real.js 갱신.
- 앱 수정 후: `python3 app/build.py` → Playwright로 열어 콘솔 오류 0 확인. 화면 흐름(지역 전환, 편의 스팟, AI 추천 동선) 직접 클릭 테스트.
- claude.ai 아티팩트 환경은 외부 이미지·타일·fetch가 CSP로 막힘 → 이미지는 base64, 지도는 자체 SVG 유지.
- AI 기능(`js/20_ai.js`)은 claude.ai 아티팩트의 `sample` capability 전용. 로컬에선 데모 결과로 동작.
- 기존 아티팩트: https://claude.ai/artifact/92XNAkZroCvAk2f5ET4ZjU (Claude 앱 세션에서만 갱신 가능)
