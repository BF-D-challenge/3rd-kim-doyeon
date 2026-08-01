# 모디 디자인 시스템

> Claude Code가 이 프로젝트의 UI를 만들거나 수정할 때 **반드시** 따르는 규칙.
> 값을 하드코딩하지 말고 항상 토큰을 사용한다.
> 규칙에 없는 값이 필요하면 먼저 "기존 토큰으로 되나"를 확인하고, 정말 필요할 때만 토큰을 추가한 뒤 이 문서를 업데이트한다.

---

## 0. 컨텍스트

- **프로덕트**: 이벤트 초대장 웹앱 (생일·집들이·술약속·놀러가기)
- **유저**: 20-30대 IT/스타트업 직장인. **토스에 익숙한 한국 모바일 유저**
- **1순위 뷰포트**: 375~430px 모바일 웹. 데스크탑은 `max-w-md` 중앙 정렬로 처리 (현재 컨벤션 유지)
- **스택**: Next.js 14 App Router · Tailwind 3 · shadcn/ui(Radix + CVA) · Supabase

### 레퍼런스 원칙

토스를 참조하되 **시각 스타일이 아니라 인터랙션 문법**만 빌린다.

| 빌린다 | 빌리지 않는다 |
|---|---|
| 하단 고정 단일 CTA | 토스 블루(#3182F6) 등 브랜드 컬러 |
| 한 화면 한 태스크 | Toss Product Sans / Tossface (라이선스 없음) |
| 문장체 카피 ("얼마를 보낼까요?") | 네이티브 전제의 과한 모션 |
| 입력 중 인라인 검증 | 금융 앱 특유의 신뢰 시그널 (오인 리스크) |

Apple HIG에서 가져오는 건 두 개뿐: **터치 타겟 44px**, **safe-area-inset**.

### 모디의 톤

- UI 카피는 "진지한 척 → 반전 유머" 밈 톤 (`.claude/CLAUDE.md` 규칙)
- 단, **유머는 카피에만.** 레이아웃·간격·상태 처리는 지루할 만큼 일관되게 간다.
  재미는 콘텐츠에서 나오고, 구조가 흔들리면 그냥 조잡해 보인다.
- 게스트 RSVP 무마찰 원칙(가입·앱설치·전화번호 없음)은 UI에서도 깨지 않는다.
  게스트 플로우에 로그인 유도 배너/모달을 넣지 않는다.

---

## 1. 토큰

### 1-1. 색

**shadcn HSL 변수 컨벤션을 유지한다.** `app/globals.css`의 `:root`에 `H S% L%` 형식으로 선언하고,
`tailwind.config.ts`에서 `hsl(var(--x))`로 매핑한다. 이 구조를 갈아엎지 말 것.

컴포넌트에서는 **semantic 유틸리티만** 쓴다: `bg-primary`, `text-muted-foreground`, `border-border` 등.
`text-[#e11d48]`, `bg-gray-100` 같은 raw 값 / 팔레트 직접 참조 금지.

**테마 accent 처리 (모디 고유)**

`lib/themes.ts`의 `accent`는 이벤트 테마별 강조색이고 semantic 토큰과 별개 계층이다.
- 테마 accent는 **초대장 콘텐츠 영역**(히어로, confetti, 테마 뱃지)에서만 쓴다
- 앱 크롬(헤더, 하단 네비, 시스템 버튼, 에러 메시지)은 **항상 semantic 토큰**을 쓴다
- 이 경계를 넘나들면 화면마다 primary가 달라 보여서 위계가 무너진다

**규칙**
- 화면당 **primary 액션 1개**. 강조색 남발 금지
- 본문 대비율 4.5:1 이상, 22px+ 큰 텍스트 3:1 이상 (WCAG AA)
- 색만으로 상태를 표현하지 않는다. 항상 아이콘 또는 텍스트를 동반
- 그라디언트 위 텍스트는 흰색 + 최소 40% 오버레이 또는 text-shadow로 대비 확보

### 1-2. 타이포그래피

**폰트: Pretendard (한글 본문 기본)**

> ⚠️ 현재 `app/layout.tsx`는 Geist를 `--font-sans`로 로드한다.
> **Geist에는 한글 글리프가 없다.** 한글은 전부 fallback으로 떨어지고,
> fallback 1순위인 Apple SD Gothic Neo는 macOS/iOS에만 존재한다.
> → 안드로이드·윈도우 유저는 완전히 다른 폰트로 본다. 반드시 고쳐야 한다.

목표 스택:
```
--font-sans: Pretendard Variable, Pretendard, system-ui, sans-serif
--font-display: Geist   /* 라틴 숫자·영문 표기에만 선택적으로 */
```

**스케일** — 아래 6단계가 전부. 새로 만들지 않는다.

| 용도 | Tailwind | px | weight |
|---|---|---|---|
| 화면 헤드라인 (1화면 1개) | `text-[28px] leading-[1.35]` | 28 | 700 |
| 섹션 제목 | `text-[22px] leading-snug` | 22 | 700 |
| 카드 제목 | `text-lg` | 18 | 600 |
| **본문 (기본값)** | `text-base` | 16 | 400 |
| 보조 설명 · 헬퍼 | `text-sm` | 14 | 400 |
| 뱃지 · 메타 | `text-[13px]` | 13 | 500 |

**규칙**
- **`text-xs`(12px) 이하 금지.** 현재 코드에 33곳 있고 `text-[10px]`도 2곳 있다 → 13px 이상으로 올린다
- 한글은 `break-keep`(= `word-break: keep-all`) 적용. 어절 중간에서 끊지 않는다
- 본문 `leading-relaxed`, 헤드라인 `leading-snug`

### 1-3. 간격

**4px 배수(Tailwind 기본 스케일)만 사용한다.** `p-[13px]` 같은 임의값 금지.

- 화면 좌우 패딩: `px-5` (20px). 현재 `px-5`/`px-6`이 섞여 있으니 **`px-5`로 통일**
- 섹션 간: `mt-8` 이상
- 관련 요소끼리는 `gap-2`, 그룹이 다르면 `gap-6` 이상 — 근접성으로 그루핑을 표현한다

### 1-4. Radius

`--radius: 0.75rem` (12px) 유지. shadcn 파생 스케일을 그대로 쓴다.

| 토큰 | px | 용도 |
|---|---|---|
| `rounded-sm` | 8 | 뱃지, 작은 버튼 |
| `rounded-md` | 10 | 인풋, 기본 버튼 |
| `rounded-lg` | 12 | 카드 |
| `rounded-2xl` | 16 | 바텀시트, 모달, 히어로 카드 |
| `rounded-full` | — | 아바타, 칩 |

이 5개 밖으로 나가지 않는다.

### 1-5. 모션

3단계만. 400ms 초과 금지 — 느린 건 고급스러운 게 아니라 답답한 것이다.

| 토큰 | duration | 용도 |
|---|---|---|
| `duration-150` | 150ms | hover, 색 변화, 토글 |
| `duration-200` | 200ms | 드롭다운, 아코디언, 페이드 |
| `duration-300` | 300ms | 바텀시트, 페이지 전환 |

- easing은 Tailwind `ease-out` 기본값 사용
- `prefers-reduced-motion: reduce` 대응 필수. 특히 `EffectLayer`의 confetti / `modi-rise` /
  `modi-twinkle` / `modi-pulse-ring` 애니메이션은 이 조건에서 **꺼야 한다**
- 장식용 애니메이션은 접근성 옵션 하나로 전부 끌 수 있어야 한다

### 1-6. Elevation

기본은 `border`로 구분하고, **떠 있는 요소에만** 그림자를 쓴다.

- `shadow-sm` — 카드
- `shadow-md` — 드롭다운, 토스트
- `shadow-[0_-4px_20px_rgba(0,0,0,.08)]` — 하단 고정 바 (위로 뜨는 그림자)

---

## 2. 모바일 웹 필수 규칙 — 협상 불가

새 화면·컴포넌트마다 확인한다.

### 2-1. Safe area

하단 고정 요소는 반드시 safe-area를 반영한다. 안 하면 iPhone 홈 인디케이터에 가려진다.

```tsx
// app/create/page.tsx 의 sticky bottom nav 등
className="sticky bottom-0 pb-[calc(1rem+env(safe-area-inset-bottom))]"
```

> 현재 코드베이스에 `env(safe-area-inset-*)` 사용처가 **0곳**이다.

### 2-2. 뷰포트 높이

`min-h-screen`(100vh) 대신 **`min-h-dvh`**를 쓴다.
iOS Safari에서 주소창 때문에 100vh가 실제 화면보다 커서 하단이 잘린다.

> 현재 6곳이 전부 `min-h-screen`이다.

### 2-3. 터치 타겟

모든 인터랙티브 요소 최소 **44×44px**.

> shadcn 기본 버튼이 `h-10`(40px), `size="lg"`도 `h-11`(44px)이다.
> `components/ui/button.tsx`의 size 스케일을 `default: h-11`, `lg: h-12`, `icon: h-11 w-11`로 올린다.
> 시각적으로 작아야 하는 요소는 `before:absolute before:-inset-2`로 히트영역만 넓힌다.

### 2-4. iOS 입력 확대 방지

`input` / `textarea` / `select`의 font-size는 **16px 이상**. 미만이면 포커스 시 iOS가 화면을 확대한다.

### 2-5. 키보드

입력 화면에서 가상 키보드가 CTA를 가리지 않게 한다. 긴 폼은 포커스된 필드로 스크롤.

### 2-6. 스크롤

모달·바텀시트 열릴 때 body 스크롤 잠금 + `overscroll-behavior: contain`.

---

## 3. 인터랙션 문법

### 3-1. 하단 고정 CTA

- 주요 액션은 화면 하단 고정, **full-width, 1개만**
- 보조 액션은 텍스트 버튼으로 CTA 위 또는 헤더 우측에
- 버튼 높이 52px (`h-13` 상당 → `h-[52px]`), `rounded-md`
- `create` 플로우의 "다음"은 이 패턴을 따른다

### 3-2. 한 화면 한 태스크

- 입력 필드를 한 번에 5개 이상 노출하지 않는다
- 긴 폼은 스텝으로 쪼개고 진행 상태를 표시
- **브라우저 뒤로가기 = 이전 스텝.** history state와 플로우 스텝을 일치시킨다
  (현재 `create` 플로우는 내부 state로만 단계를 관리한다 → 뒤로가기 시 전체 이탈)

### 3-3. 카피

- 라벨형 명사 대신 문장형 질문: "장소" ❌ → "어디서 모일까요?" ✅
- 헤드라인은 좌측 정렬, 최대 2줄
- 에러는 **원인 + 해결 방법**을 함께:
  "오류가 발생했습니다" ❌ → "링크가 만료됐어요. 다시 받으시겠어요?" ✅
- 밈 톤은 헤드라인·힌트·빈 상태에만. **에러 문구는 농담하지 않는다**

### 3-4. 검증 피드백

- 제출 후가 아니라 **입력 중 / blur 시점**에 검증
- 에러는 필드 바로 아래 `text-destructive` + 아이콘
- 에러 발생 시 해당 필드로 스크롤 + 포커스 이동

---

## 4. 4가지 State — 모든 화면·컴포넌트 필수

아래 4개가 **전부** 설계되지 않으면 완성이 아니다.

| State | 요구사항 |
|---|---|
| **Default** | 기본 표시 |
| **Loading** | 스피너보다 **스켈레톤** 우선. 300ms 이상 걸릴 때만 표시(그 이하는 깜빡임만 유발). 버튼은 로딩 중 `disabled` + 스피너 + 문구 유지(레이아웃 점프 금지) |
| **Empty** | 회색 박스 금지. ① 왜 비었는지 ② 다음에 뭘 하면 되는지(액션 버튼) 둘 다 포함. 초대장 목록 / RSVP 0명 상태가 여기 해당 |
| **Error** | 무슨 일이 났는지 + 재시도 버튼. **네트워크 에러 / 검증 에러 / 인증 만료를 구분**해서 처리 |

인터랙티브 요소는 추가로 `hover / active / focus-visible / disabled` 4종 시각 상태를 갖는다.
**모바일에서도 active(pressed) 피드백은 필수** — 눌린 게 안 보이면 유저는 두 번 누른다.
`active:scale-[0.98] transition-transform duration-150` 정도면 충분하다.

### 인증 만료는 별도 취급

Supabase magic link는 만료 시 `emailRedirectTo` 주소로 이런 해시를 붙여 돌려보낸다:

```
/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

랜딩 페이지는 이 해시를 읽어서 **"링크가 만료됐어요 / 다시 받기"** UI를 띄워야 한다.
해시를 지우고(`history.replaceState`) 깨끗한 URL로 정리하는 것까지 포함한다.

---

## 5. 접근성 최소선

- 모든 인터랙티브 요소에 `focus-visible:ring-2 focus-visible:ring-ring`.
  절대 `outline-none`만 단독으로 두지 않는다 (shadcn 컴포넌트는 이미 지켜져 있으니 커스텀 요소만 확인)
- **아이콘 단독 버튼에 `aria-label` 필수** — 현재 전체 코드에 4개뿐이다
- `<div onClick>` 금지. `<button>` / `<a>` 시맨틱 태그를 쓴다
- 모달·바텀시트: focus trap + ESC 닫기 + 닫은 뒤 트리거로 포커스 복귀
- 폼은 `<label htmlFor>` 연결 (shadcn `Label` 사용)
- 장식용 아이콘·이펙트는 `aria-hidden="true"`

---

## 6. 작업 방식

- **수정 단위를 좁게.** "전체 리디자인" 한 덩어리 대신 "버튼 pressed 상태" 같은 작은 diff로 커밋
- 토큰을 바꿀 땐 개별 화면을 손대지 말고 **`globals.css` / `tailwind.config.ts`만** 수정한다
- 새 컴포넌트를 만들기 전에 `components/ui/`의 기존 조합으로 되는지 확인한다
- shadcn 컴포넌트는 되도록 `className`으로 확장하고, 원본 variant 구조는 유지한다
- 기능을 추가하기 전에 **"이거 없애면 안 되나"**를 먼저 검토한다

---

## 7. 리뷰 체크리스트

화면 하나를 끝냈다고 생각될 때 돌린다. (`/design-review` 스킬이 이 목록을 사용한다)

**Critical**
- [ ] 한글이 Pretendard로 렌더되는가 (Geist fallback에 의존하지 않는가)
- [ ] 하단 고정 요소에 `env(safe-area-inset-bottom)`이 적용됐는가
- [ ] 터치 타겟이 전부 44px 이상인가
- [ ] input font-size가 16px 이상인가
- [ ] Loading / Empty / Error state가 설계됐는가

**Should fix**
- [ ] `min-h-screen` 대신 `min-h-dvh`를 쓰는가
- [ ] `text-xs` 이하가 없는가
- [ ] raw hex / 임의 px 값이 없는가 (semantic 토큰만)
- [ ] 아이콘 단독 버튼에 `aria-label`이 있는가
- [ ] active(pressed) 피드백이 있는가
- [ ] 375px 폭에서 가로 스크롤이 생기지 않는가
- [ ] 텍스트 대비율 4.5:1 이상인가
- [ ] 에러 문구가 원인과 해결책을 모두 말하는가

**Nice to have**
- [ ] `prefers-reduced-motion` 대응이 됐는가
- [ ] 한글에 `break-keep`이 적용됐는가
- [ ] 브라우저 뒤로가기가 이전 스텝으로 가는가
- [ ] 화면당 primary 액션이 1개인가
