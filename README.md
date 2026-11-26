# notopened 1일 1상식 두뇌 퀴즈

설치나 회원가입 없이 브라우저에서 바로 5문항 상식 퀴즈를 풀고, 결과를 공유할 수 있는 정적 웹 앱입니다.

- 서비스 주소: https://not-opened.github.io/quiz/
- 공개 버전: v2.0 (재방문·주제 딥링크·패밀리 웹 연결)
- 제작: notopened AI ENTERPRISE

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 미풀이 우선 출제 | 같은 브라우저로 다시 오면 아직 풀지 않은 문항부터 5문항씩 출제합니다(`localStorage` 기록). |
| 30문항 순환 | 30문항을 모두 풀면 "모든 30문항 완주! 새 순환을 시작합니다" 안내와 함께 기록을 초기화하고 새 순환을 시작합니다. |
| 도전 기록 | 연속 도전 일수·누적 풀이·최고 점수를 메인과 결과 화면에 표시합니다. |
| 주제 딥링크 | `?cat=science`, `?cat=history`, `?cat=world`, `?cat=health`, `?cat=nature`, `?cat=life` 로 해당 주제 문항부터 시작합니다. |
| 다른 콘텐츠 연결 | 바둑·체스 한 수, 사주·꿈풀이·MBTI 궁합, YouTube 채널로 이어지는 링크를 제공합니다. |

## 구성

| 경로 | 설명 |
| --- | --- |
| `index.html` | 퀴즈 화면 (기록 요약·주제 선택·진행률·문항·결과·공유·패밀리 웹) |
| `privacy.html` | 개인정보처리방침 (`localStorage` 기록 범위 포함) |
| `src/app.js` | 출제·채점·기록 저장·주제 딥링크·결과 공유 로직 |
| `src/data.js` | 검증된 상식 문항 30개 데이터와 주제(`slug`) 정의 |
| `src/touchHandler.js` | 모바일 터치 피드백 처리 |
| `assets/css/style.css` | 화면 스타일 |
| `assets/og-image.png` | 공유용 미리보기 이미지 |
| `sitemap.xml` | 사이트맵 |
| `robots.txt` | 검색 로봇 안내 |
| `QA.md` | 공개 검사 항목과 실측 결과 |

빌드 과정이 없는 정적 사이트이며, `main` 브랜치 루트가 그대로 GitHub Pages로 게시됩니다. 외부 스크립트, 추적 도구, 광고 코드는 포함하지 않습니다.

## 문의

notopened AI ENTERPRISE 운영팀 — https://penta309.tistory.com
