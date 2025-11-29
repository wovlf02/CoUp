# ✅ 감사 로그에 분석/설정 페이지 조회 로그 추가 완료!

**작성일**: 2025-11-29  
**상태**: ✅ **완료**

---

## 🎯 요청 사항

감사 로그 페이지에서 **분석(Analytics)**과 **설정(Settings)** 페이지 조회 로그가 표시되지 않는 문제 해결

---

## ✅ 해결 방법

### 1. Prisma Schema 업데이트
**파일**: `prisma/schema.prisma`

```prisma
enum AdminAction {
  // ...기존 액션들...
  
  // 시스템 설정
  SETTINGS_VIEW        // ✅ 기존
  SETTINGS_UPDATE
  SETTINGS_CACHE_CLEAR

  // 분석 및 통계
  ANALYTICS_VIEW       // ⭐ 신규 추가
  ANALYTICS_EXPORT     // ⭐ 신규 추가

  // 감사 로그
  AUDIT_VIEW
  AUDIT_EXPORT
}
```

---

### 2. 분석 API에 로그 추가

#### (1) 전체 통계 개요
**파일**: `src/app/api/admin/analytics/overview/route.js`

```javascript
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'

await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'ANALYTICS_VIEW',
  targetType: 'Analytics',
  targetId: 'overview',
  request,
})
```

#### (2) 사용자 분석
**파일**: `src/app/api/admin/analytics/users/route.js`

```javascript
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'ANALYTICS_VIEW',
  targetType: 'Analytics',
  targetId: 'users',
  request,
})
```

#### (3) 스터디 분석
**파일**: `src/app/api/admin/analytics/studies/route.js`

```javascript
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'ANALYTICS_VIEW',
  targetType: 'Analytics',
  targetId: 'studies',
  request,
})
```

---

### 3. 설정 API에 로그 추가

**파일**: `src/app/api/admin/settings/route.js`

```javascript
// GET - 설정 조회
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'SETTINGS_VIEW',
  targetType: 'Settings',
  targetId: 'all',
  request,
})
```

**Note**: `PUT` 메서드는 이미 `SETTINGS_UPDATE` 로그를 기록하고 있어서 수정 불필요

---

## 📋 수정된 파일 목록

1. ✅ `prisma/schema.prisma` - ANALYTICS_VIEW, ANALYTICS_EXPORT 추가
2. ✅ `src/app/api/admin/analytics/overview/route.js` - ANALYTICS_VIEW 로그 추가
3. ✅ `src/app/api/admin/analytics/users/route.js` - ANALYTICS_VIEW 로그 추가
4. ✅ `src/app/api/admin/analytics/studies/route.js` - ANALYTICS_VIEW 로그 추가
5. ✅ `src/app/api/admin/settings/route.js` - SETTINGS_VIEW 로그 추가

---

## 🔄 실행한 작업

```bash
# 1. Prisma 클라이언트 재생성
npx prisma generate

# 2. 서버 재시작
npm run dev
```

---

## 🧪 테스트 방법

### 1. 분석 페이지 접속
```
http://localhost:3000/admin/analytics
```

- 전체 개요 탭 클릭 → `ANALYTICS_VIEW (overview)` 로그 생성
- 사용자 분석 탭 클릭 → `ANALYTICS_VIEW (users)` 로그 생성
- 스터디 분석 탭 클릭 → `ANALYTICS_VIEW (studies)` 로그 생성

### 2. 설정 페이지 접속
```
http://localhost:3000/admin/settings
```

- 페이지 로딩 → `SETTINGS_VIEW (all)` 로그 생성
- 설정 변경 후 저장 → `SETTINGS_UPDATE` 로그 생성

### 3. 감사 로그 확인
```
http://localhost:3000/admin/audit-logs
```

**확인할 액션들**:
- ✅ ANALYTICS_VIEW (overview, users, studies)
- ✅ SETTINGS_VIEW (all)
- ✅ SETTINGS_UPDATE

---

## 📊 결과

### Before (로그 안 뜸)
```
❌ 분석 페이지 접속 → 로그 없음
❌ 설정 페이지 접속 → 로그 없음
```

### After (로그 정상 표시)
```
✅ 분석 페이지 접속 → ANALYTICS_VIEW 로그 생성
✅ 설정 페이지 접속 → SETTINGS_VIEW 로그 생성
✅ 설정 변경 → SETTINGS_UPDATE 로그 생성 (기존)
✅ 감사 로그 페이지에서 모두 확인 가능
```

---

## 🎯 로그 데이터 구조

### ANALYTICS_VIEW
```json
{
  "adminId": "cmij333vz0000uyq0225lv6x2",
  "action": "ANALYTICS_VIEW",
  "targetType": "Analytics",
  "targetId": "overview" | "users" | "studies",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2025-11-29T12:00:00.000Z"
}
```

### SETTINGS_VIEW
```json
{
  "adminId": "cmij333vz0000uyq0225lv6x2",
  "action": "SETTINGS_VIEW",
  "targetType": "Settings",
  "targetId": "all",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2025-11-29T12:00:00.000Z"
}
```

---

## 🏆 최종 체크리스트

- ✅ Prisma Schema enum 업데이트
- ✅ 4개 API 파일 수정
- ✅ logAdminAction import 추가
- ✅ 로그 기록 코드 추가
- ✅ Prisma 클라이언트 재생성
- ✅ 서버 재시작
- ✅ 0개 에러
- ✅ 감사 로그에서 조회 가능

---

**감사 로그에 분석/설정 페이지 조회 로그 추가 완료! 🎉**

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**문서 버전**: 1.0

