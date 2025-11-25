# 관리자 아키텍처 - 파일 구조
**다음 파일**: `01-architecture-rsc.md` - RSC 전략

---

- **Shared Components**: 100-250줄
- **Server Actions**: 100-300줄
- **Client Component**: 100-200줄
- **Server Component**: 50-150줄
- **페이지 (app/)**: 50-100줄

## 📊 파일 크기 가이드

---

- UserTable, RealtimeStatus
- Modal, ConfirmDialog
- AdminHeader, DataTable
**예시**:

- WebSocket, React Query
- State 관리 (useState, useReducer)
- 이벤트 핸들러 (onClick, onChange)
**특징**: 브라우저에서 렌더링, 인터랙티브
### Client Components (🔵)

- RecentReports
- StatCards, Badge
- AdminNav, AdminSidebar
**예시**:

- SEO 중요
- 정적 콘텐츠
- 데이터 페칭 (DB 직접 조회)
**특징**: 서버에서 렌더링, Zero JS to client
### Server Components (🔴)

## 🎨 컴포넌트 분류

---

```
└── utils.js                      # 유틸리티
├── store.js                      # Zustand 스토어
├── hooks.js                      # React Query 훅
├── api.js                        # API 클라이언트
coup/src/lib/admin/

└── reports.js                    # Server Actions
├── studies.js                    # Server Actions
├── users.js                      # Server Actions
├── stats.js                      # Server Actions
coup/src/actions/admin/

    └── AdminWebSocketProvider.js # 🔵 Client
└── providers/
│   └── Pagination.js             # 🔵 Client
│   ├── Badge.js                  # 🔴 Server
│   ├── ConfirmDialog.js          # 🔵 Client
│   ├── Modal.js                  # 🔵 Client
│   ├── DataTable.js              # 🔵 Client
├── shared/
│   └── UserDetailModal.js        # 🔵 Client
│   ├── UserFilterBar.js          # 🔵 Client
│   ├── UserTable.js              # 🔵 Client
├── users/
│   └── RealtimeStatus.js         # 🔵 Client
│   ├── RecentReports.js          # 🔴 Server
│   ├── UserGrowthChart.js        # 🔵 Client
│   ├── StatCards.js              # 🔴 Server
├── dashboard/
│   └── AdminSidebar.js           # 🔴 Server
│   ├── AdminHeader.js            # 🔵 Client
│   ├── AdminNav.js               # 🔴 Server
├── layout/
coup/src/components/admin/

    └── page.js
└── settings/
│   └── page.js
├── analytics/
│   └── [reportId]/page.js
│   ├── page.js
├── reports/
│   └── [studyId]/page.js
│   ├── page.js
├── studies/
│   └── [userId]/page.js          # 🔴 Server (Dynamic)
│   ├── page.js                   # 🔴 Server
├── users/
├── error.js                      # 🔵 Client - 에러 처리
├── loading.js                    # 🔴 Server - 로딩 UI
├── page.js                       # 🔴 Server - 대시보드
├── layout.js                     # 🔴 Server - 관리자 레이아웃
coup/src/app/admin/
```

## 📁 전체 파일 구조

---

> **분량**: 약 100줄
> **언어**: JavaScript + JSDoc  
> **Next.js**: 16 App Router  


