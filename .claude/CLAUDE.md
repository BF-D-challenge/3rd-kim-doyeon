# 모디(Modi) — Claude Code 프로젝트 가이드

이 저장소에서 작업할 때 참고할 맥락과 규칙입니다.

## 프로젝트

- **무엇**: 감각 있는 이벤트 초대장 웹앱 (코드네임 모디/Modi). 초대·RSVP 집계·공유를 한 곳에서.
- **타겟**: 20-30대 IT/스타트업 직장인 호스트 (생일·집들이·회식·소모임).
- **PRD**: `prds/모디-prd.md` — 기능/스코프는 항상 이 문서를 기준으로.
- **단계**: BF.D 4주 챌린지. 현재는 기획(PRD) 단계, 이후 주차별로 구현.

## 스택

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres · Auth) — 핵심 테이블: `events`, `rsvps` (PRD 4장 데이터 초안 참고)
- 카카오톡 공유 SDK (썸네일 카드 미리보기 필수)
- 나중에 필요할 환경변수(코드 붙일 때 `.env.local`에): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_KAKAO_JS_KEY`. 실제 값은 절대 커밋 금지.
- 배포: 아직 미정. 개발 진행하며 사용자가 직접 정한다 (Vercel 미확정). 임의로 배포 도구를 추가하지 말 것.

## 코딩 규칙

- 게스트 RSVP는 **가입·앱설치·전화번호 없이** 이름만으로. 이 무마찰 원칙을 깨지 말 것.
- 컴포넌트/유틸은 기존 파일 컨벤션(네이밍·주석 밀도)을 따라간다.
- 문구·UI 카피는 "진지한 척 → 반전 유머" 밈 톤 유지.

## Git 워크플로우

- 커밋 author는 **개인 계정 `kimdoyeunn`** 으로 고정
  (`user.email = 265686303+kimdoyeunn@users.noreply.github.com`).
  ⚠️ 회사 이메일(`@business-canvas.com`)로 커밋하지 말 것.
- 기본 브랜치 `main`. remote `origin` → BF-D-challenge/3rd-kim-doyeon.
- 사용자가 "올려줘/커밋해줘" 하면: 변경 확인 → 커밋 → `git push`.
- **커밋 메시지: 평범한 한국어로 간결하게.** `chore:`/`feat:` 같은 conventional-commit 접두어 쓰지 말 것. "무엇을 삭제/제거했다" 같은 과정 흔적보다 결과 중심으로.
- `.env`·키·토큰 등 민감 파일은 절대 커밋하지 않는다 (`.gitignore` + `.claude/settings.json` 보안 규칙).

## 보안

- `.claude/settings.json`에 비밀값 읽기/위험 명령 차단 규칙이 있음. 유지할 것.
