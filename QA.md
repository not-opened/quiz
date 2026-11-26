# QA — notopened 1일 1상식 두뇌 퀴즈 포털

- 대상 버전: v1.2.2-patch3 (화면 표기 v1.2.2)
- 서비스 주소: https://penta309.github.io/notopened-quiz/
- 검증 대상 사이트 커밋: `267844e04dbd520f3d727228c7d341f0db7c33f5` (main·gh-pages 동일)
- 검증 일시: 2026-11-26 09:21~09:23 KST
- 검증 환경: headless Chromium 159.0.8154.6, 모바일 390×844(터치·모바일 UA), 데스크톱 1280×800

## 검사 항목과 결과

| # | 검사 항목 | 방법 | 결과 |
| --- | --- | --- | --- |
| 1 | 첫 화면 응답 | `GET /` | PASS — HTTP 200, `text/html; charset=utf-8`, 9,571 bytes |
| 2 | 필수 파일 7종 응답 | 각 경로 `GET` | PASS — 7/7 HTTP 200 (index 9,571 / privacy 3,643 / style.css 8,486 / app.js 9,161 / data.js 18,980 / touchHandler 1,261 / .nojekyll 0 bytes) |
| 3 | 게시본 일치 | 라이브 `index.html` SHA-256 대조 | PASS — `e001f83c027729a1590c7060a3d0d109839ebb2cee02d4b99478f52a4a9d5f77` (로컬 원본과 동일) |
| 4 | 퀴즈 진행 | 5문항 선택 → 결과 화면 | PASS — 1/5~5/5 진행, 정답 해설 표시, 결과 3/5점·등급 표시 |
| 5 | 모바일 화면 (390px) | 390×844 렌더링 | PASS — 가로 스크롤 없음(`scrollWidth` 390), 화면 밖으로 넘친 요소 0 |
| 6 | 결과 공유 | 공유 버튼 클릭 후 공유 문구 확인 | PASS — 문구에 `https://penta309.github.io/notopened-quiz/` 포함, 복사 안내 표시 |
| 7 | 콘솔 오류 | 모바일·데스크톱 콘솔 수집 | PASS — error 0, warning 0, 페이지 예외 0 |
| 8 | 광고 자리 비노출 | `.ad-slot` 계산된 스타일 | PASS — 2개 모두 `display: none`, 0×0 |
| 9 | 광고·추적 코드 | 소스 내 `ins.adsbygoogle`·`data-ad-*`·외부 스크립트 | PASS — 0건, `/ads.txt` 404 |
| 10 | 외부 요청 | 페이지 로드 중 외부 도메인 요청 | PASS — 0건 |

## 비고

- 검사는 공개 주소 라이브 상태에서 실행했으며, 같은 검사를 배포 전 로컬 사본에서도 동일하게 통과했습니다.
- 실기기(휴대폰) 브라우저 확인은 포함하지 않았습니다.
