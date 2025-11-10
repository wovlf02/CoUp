# 스터디 설정 (Study Settings)

> **화면 ID**: `STUDY-SETTINGS-01`  
> **라우트**: `/my-studies/[studyId]/settings`  
> **목적**: 스터디 정보 및 설정 관리  
> **접근 권한**: OWNER, ADMIN (일부 기능은 OWNER만)  
> **렌더링**: CSR

---

## 🎯 화면 목적

**"스터디 전체 관리 허브"**
- 스터디 기본 정보 수정
- 멤버 권한 관리 및 강퇴
- 공개 설정 변경
- 스터디 삭제 (OWNER만)
- 위험한 작업은 확인 절차 필수

---

## 📐 레이아웃 구조 (FHD 최적화)

```
┌─────┬──────────────────────────────────────────────────────┬──────────────────┐
│     │ [개요] [채팅] [공지] [파일] [캘린더] [할일] [화상] [설정]│                  │
│ Nav ├──────────────────────────────────────────────────────┤  설정 가이드     │
│ 12% │ ⚙️ 스터디 설정                           [OWNER]     │  (30%)           │
│     │                                                      │                  │
│     │ [기본 정보] [멤버 관리] [공개 설정] [위험 구역]       │  ⚠️ 주의사항    │
│     ├──────────────────────────────────────────────────────┤  변경사항은      │
│     │                                                      │  즉시 반영됩니다  │
│     │ ┌────────────────────────────────────────────────┐  │                  │
│ 🏠 │ │ 📝 기본 정보                                   │  │  💡 권한 안내    │
│ 🔍 │ │                                                │  │  OWNER:          │
│ 👥 │ │  스터디 이름 *                                 │  │  • 모든 설정     │
│ 📋 │ │  ┌──────────────────────────────────────────┐  │  │  • 멤버 관리     │
│ 🔔 │ │  │ 알고리즘 마스터 스터디                    │  │  │  • 스터디 삭제   │
│ 👤 │ │  └──────────────────────────────────────────┘  │  │                  │
│     │ │  2-50자                                        │  │  ADMIN:          │
│     │ │                                                │  │  • 기본 정보     │
│     │ │  카테고리                                      │  │  • 멤버 관리     │
│     │ │  [프로그래밍 ▼] [알고리즘/코테 ▼]             │  │  • 공개 설정     │
│     │ │                                                │  │                  │
│     │ │  스터디 소개                                   │  │  📊 통계         │
│     │ │  ┌──────────────────────────────────────────┐  │  │  총 멤버: 12명   │
│     │ │  │ 매일 아침 알고리즘 문제를 풀고...         │  │  │  OWNER: 1        │
│     │ │  │                                           │  │  │  ADMIN: 2        │
│     │ │  └──────────────────────────────────────────┘  │  │  MEMBER: 9       │
│     │ │  10-500자 (현재: 45자)                         │  │                  │
│     │ │                                                │  │  🔄 최근 변경    │
│     │ │  태그                                          │  │  11/5 김철수     │
│     │ │  #알고리즘 × #코테 × [+ 추가]                 │  │  멤버 역할 변경  │
│     │ │                                                │  │                  │
│     │ │  [취소]  [변경사항 저장]                       │  │  🔒 보안         │
│     │ └────────────────────────────────────────────────┘  │  2단계 인증 권장 │
│     │                                                      │                  │
└─────┴──────────────────────────────────────────────────────┴──────────────────┘
```

**레이아웃 비율** (해상도별 자동 조정):

### 🖥️ FHD (1920px) - 기본 기준
- 좌측 네비게이션: **12%** (min: 200px, max: 240px)
- 설정 영역: **58%** (min: 900px, max: 1200px)
- 우측 가이드: **30%** (min: 260px, max: 320px)
- 갭(여백): **2%**

### 🖥️ QHD (2560px) - 고해상도
- 좌측 네비게이션: **10%** (min: 240px, max: 280px)
- 설정 영역: **60%** (min: 1200px, max: 1600px)
- 우측 가이드: **28%** (min: 320px, max: 400px)
- 갭(여백): **2%**

### 🖥️ 4K (3840px) - 초고해상도
- 좌측 네비게이션: **8%** (min: 280px, max: 320px)
- 설정 영역: **62%** (min: 1600px, max: 2200px)
- 우측 가이드: **28%** (min: 400px, max: 500px)
- 갭(여백): **2%**

### 📱 반응형 브레이크포인트
- **Desktop Small (1440px)**: 15% / 55% / 28%
- **Tablet (1024px)**: 5% / 65% / 28%
- **Mobile (<768px)**: 100% 단일 컬럼

---

## 📐 CSS Grid 구현 예시

```css
/* 글로벌 CSS 변수 정의 */
:root {
  /* FHD 기본값 */
  --nav-width: 12%;
  --content-width: 58%;
  --widget-width: 30%;
  --gap-size: 2%;
  
  /* 최소/최대 제약 */
  --nav-min: 200px;
  --nav-max: 240px;
  --content-min: 900px;
  --content-max: 1200px;
  --widget-min: 260px;
  --widget-max: 320px;
}

/* QHD 해상도 (2560px 이상) */
@media (min-width: 2560px) {
  :root {
    --nav-width: 10%;
    --content-width: 60%;
    --widget-width: 28%;
    --nav-min: 240px;
    --nav-max: 280px;
    --content-min: 1200px;
    --content-max: 1600px;
    --widget-min: 320px;
    --widget-max: 400px;
  }
}

/* 4K 해상도 (3840px 이상) */
@media (min-width: 3840px) {
  :root {
    --nav-width: 8%;
    --content-width: 62%;
    --widget-width: 28%;
    --nav-min: 280px;
    --nav-max: 320px;
    --content-min: 1600px;
    --content-max: 2200px;
    --widget-min: 400px;
    --widget-max: 500px;
  }
}

/* Desktop Small */
@media (max-width: 1680px) {
  :root {
    --nav-width: 15%;
    --content-width: 55%;
    --widget-width: 28%;
  }
}

/* Tablet */
@media (max-width: 1279px) {
  :root {
    --nav-width: 5%;
    --content-width: 65%;
    --widget-width: 28%;
    --nav-min: 60px;
    --nav-max: 80px;
  }
}

/* 메인 레이아웃 */
.settings-layout {
  display: grid;
  grid-template-columns: 
    minmax(var(--nav-min), var(--nav-width))
    minmax(var(--content-min), var(--content-width))
    minmax(var(--widget-min), var(--widget-width));
  gap: var(--gap-size);
  width: 100%;
  max-width: 100vw;
  padding: 0 1%;
}

/* Mobile */
@media (max-width: 767px) {
  .settings-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .guide-widgets {
    order: 3;
    margin-top: 24px;
    width: 100%;
  }
}
```

