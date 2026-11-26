# QA — notopened 1일 1상식 두뇌 퀴즈 포털

- 대상 버전: v3.0 (쿠팡 파트너스 다이나믹 배너·개인정보처리방침 정리·결과 버튼 위계·한국어 줄바꿈 보정)
- 서비스 주소: https://not-opened.github.io/quiz/
- 검증 대상 사이트 커밋: `d1e79aad487a9ad758cef59259320ff4f052f1b4` (main, GitHub Pages `built`, 2026-11-26 21:59 KST)
- 검증 일시: 2026-11-26 21:56~22:02 KST (라이브), 같은 코드로 로컬 320~1280px 폭 검사 병행
- 검증 환경: headless Chromium 159.0.8154.6 — 모바일 390×844(터치·모바일 UA), 폭 320/360/390/414/768/1280

## 검사 항목과 결과 (라이브 390px)

| # | 검사 항목 | 방법 | 결과 |
| --- | --- | --- | --- |
| 1 | 게시 상태 | GitHub Pages API + `GET /` | PASS — `status: built`, 배포 커밋 `d1e79aa`, HTTP 200 (`index`·`app.js`·`data.js`·`style.css`·`privacy` 모두 200) |
| 2 | 첫 5문항 풀이 | 5문항 선택 → 결과 화면 | PASS — 1/5~5/5 진행, 정답·해설 표시, 결과 점수·등급 표시 |
| 3 | 푼 문항 기록 | `localStorage['notopened.quiz.progress.v1']` | PASS — 문항 ID·`totalAnswered`·`streakDays` 저장 |
| 4 | 재방문 미풀이 우선 | 새로고침 후 5문항 확인 | PASS — 이미 푼 문항을 빼고 미풀이 문항만 출제, 기록 유지 |
| 5 | 다음 세트 연결 | 결과 화면 → `다음 미풀이 N문항 도전` | PASS — 남은 미풀이 수 표기, 미풀이 문항부터 새 세트 시작 |
| 6 | 30문항 순환 | 6세트(30문항) 연속 풀이 | PASS — `solved 30 / total 30`, 완주 배너 "모든 30문항 완주! 다음 세트에서 새 순환이 시작됩니다" |
| 7 | 새 순환 초기화 | 완주 후 `새 순환 시작하기` | PASS — `cycle 2`, `solved 0`부터 재집계, 누적 풀이 30 유지 |
| 8 | 주제 딥링크 | `?cat=history`·`?cat=science`·`?cat=world`·`?cat=nope` | PASS — 각 주제 문항만 출제(역사·문화 5, 과학·물리 8, 세계·지리 4), 잘못된 값은 전체로 대체 |
| 9 | 미풀이 수 표기 갱신 | 주제 화면에서 문제 풀이 후 필터 안내 확인 | PASS — `미풀이 N문항`이 답할 때마다 즉시 갱신(v3.0 수정) |
| 10 | 결과 공유 | `결과 복사 / 공유하기` 클릭 후 클립보드 읽기 | PASS — `[notopened 상식 퀴즈] 5문제 중 3문제를 맞췄습니다! … 도전하기 👉 https://not-opened.github.io/quiz/` |
| 11 | 주제 공유 URL | `?cat=` 진입 후 `SHARE_BASE_URL` 확인 | PASS — `https://not-opened.github.io/quiz/?cat=<주제>` (주제 없으면 기본 주소) |
| 12 | 2·3호 바로가기 | 결과 카드·푸터 링크 `href` | PASS — `not-opened.github.io/go-chess/`, `not-opened.github.io/fortune/` |
| 13 | 쿠팡 파트너스 배너 로드 | 하단 `#coupangSlot` iframe 확인 | PASS — `ads-partners.coupang.com/widgets.html?id=1059927…` iframe 680×140 생성, 화면 폭에 맞춰 축소 후 표시 |
| 14 | 배너 가로 오버플로 | 배너 포함 문서 폭 | PASS — iframe 356×73(390px 화면), `scrollWidth 390 = clientWidth 390` |
| 15 | 배너 미로드 시 숨김 | `onLoaded(hasAd)` 조건 처리 | PASS — 배너가 그려지기 전에는 `#affiliateSection`이 `hidden` |
| 16 | 공정위 필수 문구 | 하단 문구 검사 | PASS — "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다." |
| 17 | 개인정보처리방침 정합 | `privacy.html` 본문 | PASS — 3항 "제휴 배너(쿠팡 파트너스)" 신설(외부 도메인·쿠키 처리 주체 명시), "광고를 게재하지 않으며" 오표기 삭제, 푸터 고지 추가 |
| 18 | 애드센스 실광고 미삽입 | 소스 검사 | PASS — `adsbygoogle`·`ca-pub-`·`data-ad-*` 0건 |
| 19 | 외부 요청 범위 | 로드 중 요청 도메인 | PASS — `not-opened.github.io`, `ads-partners.coupang.com`(제휴 배너) 2곳뿐 |
| 20 | 가로 오버플로 (폭별) | 320/360/390/414/768/1280px | PASS — 전 폭 `scrollWidth = clientWidth`, 화면 밖으로 나간 요소 0 |
| 21 | 콘솔 오류 | 모바일 전 구간 수집 | PASS — error 0, 페이지 예외 0 |
| 22 | 결과 버튼 위계 | 결과 화면 렌더링 | PASS — 주 동작(다음 미풀이·새 순환)은 강조 버튼, `이번 세트 다시 도전하기`는 보조 스타일·다른 아이콘으로 분리 |
| 23 | 한국어 줄바꿈 | 390px 렌더링 | PASS — 문항·선택지·해설·완주 배너·푸터·공정위 문구에 `word-break: keep-all` 적용, 어절 중간 잘림 0 |

## 화면 캡처 (검증 시점 라이브, 390×844)

- `downloads/quiz-v3-live-390.png` — 첫 화면
- `downloads/quiz-v3-live-390-bottom.png` — 하단(제휴 배너·공정위 문구·푸터)
- `downloads/quiz-v3-live-390-complete.png` — 30문항 완주 배너
- `downloads/quiz-v3-live-390-cat.png` — `?cat=history` 진입
- `downloads/quiz-v3-live-390-privacy.png` — 개인정보처리방침

## 비고

- 자동 검사 35개 항목 모두 통과(PASS 35 / FAIL 0), 폭 검사 6종 통과, 심층 검사 11개 통과.
- 제휴 배너는 쿠팡 파트너스 위젯이 실제 광고를 그릴 때만 표시되며, 광고가 없거나 차단되면 영역째 숨겨집니다.
- `localStorage`를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 기록 저장만 건너뛰고 퀴즈는 정상 진행합니다.
- 실기기(휴대폰) 브라우저 확인은 포함하지 않았습니다.
