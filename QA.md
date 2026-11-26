# QA — notopened 1일 1상식 두뇌 퀴즈 포털

- 대상 버전: v2.0 (미풀이 우선 출제·30문항 순환·주제 딥링크·패밀리 웹 연결)
- 서비스 주소: https://not-opened.github.io/quiz/
- 검증 대상 사이트 커밋: `8a3736f958ce5f2d257175357df0a33f5a7bdf37` (main, GitHub Pages `built`)
- 검증 일시: 2026-11-26 20:58~21:05 KST
- 검증 환경: headless Chromium 159.0.8154.6 — 모바일 390×844(터치·모바일 UA), 데스크톱 1280×800

## 검사 항목과 결과

| # | 검사 항목 | 방법 | 결과 |
| --- | --- | --- | --- |
| 1 | 게시 상태 | GitHub Pages API + `GET /` | PASS — `status: built`, HTTP 200 (`index`, `app.js`, `data.js`, `style.css`, `privacy` 모두 200) |
| 2 | 첫 5문항 풀이 | 5문항 선택 → 결과 화면 | PASS — 1/5~5/5 진행, 정답·해설 표시, 결과 `1 / 5 점` |
| 3 | 푼 문항 기록 | `localStorage['notopened.quiz.progress.v1']` | PASS — 5문항 ID 저장, `streakDays 1`, `totalAnswered 5` |
| 4 | 재방문 미풀이 우선 | 새로고침 후 5문항 확인 | PASS — 이미 푼 문항과 겹치지 않는 미풀이 문항 출제(기록 유지) |
| 5 | 다음 세트 연결 | 결과 화면 → 다음 세트 버튼 | PASS — 미풀이 문항부터 새 세트 시작, 문항이 화면 안으로 스크롤 |
| 6 | 30문항 순환 | 6세트(30문항) 연속 풀이 | PASS — 30문항 모두 중복 0, 완주 배너 "모든 30문항 완주!" 표시 |
| 7 | 새 순환 초기화 | 완주 후 다음 세트 클릭 | PASS — 토스트 "모든 30문항 완주! 새 순환을 시작합니다", `cycle 2`, solved 0부터 재집계, 누적 풀이 30 유지 |
| 8 | 주제 딥링크 | `?cat=history`, `?cat=world`, `?cat=unknown` | PASS — 역사·문화 5문항만 출제(`/ 5 점`), 세계·지리 4문항만 출제(`/ 4 점`), 잘못된 값은 전체 문항으로 대체 |
| 9 | 내부 문구 비노출 | 본문 텍스트 검사 | PASS — `v1.2.2`·`AdSense`·`Responsive Unit`·`출시 예정` 0건 |
| 10 | 패밀리 웹 연결 | 하단 카드 `href` | PASS — 웹 2호 `not-opened.github.io/go-chess/`, 웹 3호 `not-opened.github.io/fortune/` (둘 다 HTTP 200) |
| 11 | 모바일 화면 (390px) | 390×844 렌더링 | PASS — 가로 스크롤 없음(`scrollWidth` 390) |
| 12 | 데스크톱 화면 (1280px) | 1280×800 렌더링 | PASS — `scrollWidth` 1280, 레이아웃 유지 |
| 13 | 콘솔 오류 | 모바일·데스크톱 콘솔 수집 | PASS — error 0, 페이지 예외 0 |
| 14 | 외부 요청 | 로드 중 요청 도메인 | PASS — `not-opened.github.io` 단일 |
| 15 | 광고·추적 코드 | 소스 검사 | PASS — `ins.adsbygoogle`·`data-ad-*`·외부 스크립트 0건, 광고 슬롯 빈 상태로 숨김 |
| 16 | 공유 문구 | `SHARE_BASE_URL` | PASS — `https://not-opened.github.io/quiz/` (주제 진입 시 해당 `?cat=` 포함) |

## 화면 캡처 (검증 시점 라이브)

- `quiz-v2-live-390-main.png` — 첫 화면(모바일)
- `quiz-v2-live-390-result.png` — 결과 화면(누적 기록 포함)
- `quiz-v2-live-390-complete.png` — 30문항 완주 배너
- `quiz-v2-live-390-cat.png` — `?cat=history` 진입
- `quiz-v2-live-390-world.png` — `?cat=world` 4문항 세트
- `quiz-v2-live-1280-main.png` — 데스크톱 첫 화면

## 비고

- 자동 검사 34개 항목 모두 통과(PASS 34 / FAIL 0).
- `localStorage`를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 기록 저장만 건너뛰고 퀴즈는 정상 진행합니다.
- 실기기(휴대폰) 브라우저 확인은 포함하지 않았습니다.
