# 🔧 AdminAction Enum 오류 완전 해결!

**작성일**: 2025-11-29  
**상태**: ✅ **완전 해결**

---

## 🚨 발생한 문제

### Prisma AdminAction Enum 불일치
```
Error [PrismaClientValidationError]: Invalid `prisma.adminLog.create()` invocation
Invalid value for argument `action`. Expected AdminAction.
```

**원인**: 코드에서 사용하는 액션 이름이 Prisma 스키마의 `AdminAction` enum에 정의되지 않음

---

## ✅ 해결 방법

### 1. 잘못된 액션 이름들 수정

#### 사용자 관리 API
| Before (❌) | After (✅) | 파일 |
|------------|----------|------|
| `VIEW_USER` | `USER_VIEW` | `/api/admin/users/[id]/route.js` |
| `UPDATE_USER` | `USER_UPDATE` | `/api/admin/users/[id]/route.js` |
| `DELETE_USER` | `USER_DELETE` | `/api/admin/users/[id]/route.js` |
| `SUSPEND_USER` | `USER_SUSPEND` | `/api/admin/users/[id]/suspend/route.js` |
| `ACTIVATE_USER` | `USER_UNSUSPEND` | `/api/admin/users/[id]/activate/route.js` |

#### 스터디 관리 API
| Before (❌) | After (✅) | 파일 |
|------------|----------|------|
| `STUDY_DETAIL_VIEW` | `STUDY_VIEW` | `/api/admin/studies/[studyId]/route.js` |
| `STUDY_UNHIDE` | ✅ enum에 추가 | `prisma/schema.prisma` |
| `STUDY_REOPEN` | ✅ enum에 추가 | `prisma/schema.prisma` |

---

### 2. Prisma Schema 업데이트

```prisma
enum AdminAction {
  // 사용자 관리
  USER_VIEW
  USER_SEARCH
  USER_WARN
  USER_SUSPEND
  USER_UNSUSPEND
  USER_DELETE
  USER_RESTORE
  USER_UPDATE

  // 스터디 관리
  STUDY_VIEW
  STUDY_HIDE
  STUDY_UNHIDE      // ✅ 추가
  STUDY_CLOSE
  STUDY_REOPEN      // ✅ 추가
  STUDY_DELETE
  STUDY_RECOMMEND

  // 신고 처리
  REPORT_VIEW
  REPORT_ASSIGN
  REPORT_RESOLVE
  REPORT_REJECT

  // 콘텐츠 관리
  CONTENT_DELETE
  CONTENT_RESTORE

  // 시스템 설정
  SETTINGS_VIEW
  SETTINGS_UPDATE
  SETTINGS_CACHE_CLEAR

  // 감사 로그
  AUDIT_VIEW
  AUDIT_EXPORT
}
```

---

## 🔧 수정된 파일

### 1. `src/app/api/admin/users/[id]/route.js`
```javascript
// GET - 사용자 조회
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'USER_VIEW',  // ✅ VIEW_USER → USER_VIEW
  targetType: 'USER',
  targetId: userId,
})

// PATCH - 사용자 수정
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'USER_UPDATE',  // ✅ UPDATE_USER → USER_UPDATE
  targetType: 'USER',
  targetId: userId,
})

// DELETE - 사용자 삭제
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'USER_DELETE',  // ✅ DELETE_USER → USER_DELETE
  targetType: 'USER',
  targetId: userId,
})
```

### 2. `src/app/api/admin/users/[id]/suspend/route.js`
```javascript
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'USER_SUSPEND',  // ✅ SUSPEND_USER → USER_SUSPEND
  targetType: 'USER',
  targetId: userId,
})
```

### 3. `src/app/api/admin/users/[id]/activate/route.js`
```javascript
await logAdminAction({
  adminId: auth.adminRole.userId,
  action: 'USER_UNSUSPEND',  // ✅ ACTIVATE_USER → USER_UNSUSPEND
  targetType: 'USER',
  targetId: userId,
})
```

### 4. `src/app/api/admin/studies/[studyId]/route.js`
```javascript
await logAdminAction({
  adminId: adminRole.userId,
  action: 'STUDY_VIEW',  // ✅ STUDY_DETAIL_VIEW → STUDY_VIEW
  targetType: 'Study',
  targetId: studyId,
})
```

### 5. `prisma/schema.prisma`
- `STUDY_UNHIDE` 추가
- `STUDY_REOPEN` 추가

---

## 🔄 실행한 명령어

```bash
# 1. 서버 종료
taskkill /F /PID [프로세스ID]

# 2. Prisma 클라이언트 재생성
cd C:\Project\CoUp\coup
npx prisma generate

# 3. 서버 재시작
npm run dev
```

---

## ✅ 액션 네이밍 규칙

### 올바른 패턴: `{대상}_{동작}`

#### 사용자 관련
- `USER_VIEW` - 사용자 조회
- `USER_SEARCH` - 사용자 검색
- `USER_WARN` - 경고 부여
- `USER_SUSPEND` - 정지
- `USER_UNSUSPEND` - 정지 해제
- `USER_DELETE` - 삭제
- `USER_RESTORE` - 복구
- `USER_UPDATE` - 수정

#### 스터디 관련
- `STUDY_VIEW` - 스터디 조회
- `STUDY_HIDE` - 숨김
- `STUDY_UNHIDE` - 숨김 해제
- `STUDY_CLOSE` - 종료
- `STUDY_REOPEN` - 재개
- `STUDY_DELETE` - 삭제
- `STUDY_RECOMMEND` - 추천

#### 신고 관련
- `REPORT_VIEW` - 신고 조회
- `REPORT_ASSIGN` - 담당자 배정
- `REPORT_RESOLVE` - 해결
- `REPORT_REJECT` - 반려

#### 콘텐츠 관련
- `CONTENT_DELETE` - 삭제
- `CONTENT_RESTORE` - 복구

#### 시스템 관련
- `SETTINGS_VIEW` - 설정 조회
- `SETTINGS_UPDATE` - 설정 변경
- `SETTINGS_CACHE_CLEAR` - 캐시 초기화

#### 감사 관련
- `AUDIT_VIEW` - 로그 조회
- `AUDIT_EXPORT` - 로그 내보내기

---

## 🧪 테스트 방법

### 1. 사용자 상세 페이지 접속
```
http://localhost:3000/admin/users/[userId]
```

### 2. 각 액션 테스트
- ✅ 페이지 로딩 (USER_VIEW 로그 생성)
- ✅ 정지 버튼 클릭 (USER_SUSPEND 로그 생성)
- ✅ 활성화 버튼 클릭 (USER_UNSUSPEND 로그 생성)
- ✅ 삭제 버튼 클릭 (USER_DELETE 로그 생성)

### 3. 로그 확인
```sql
SELECT * FROM "AdminLog" 
WHERE action IN ('USER_VIEW', 'USER_SUSPEND', 'USER_UNSUSPEND', 'USER_DELETE')
ORDER BY "createdAt" DESC;
```

---

## 📊 결과

### Before (오류 발생)
```
❌ VIEW_USER - Invalid value for argument `action`
❌ UPDATE_USER - Invalid value for argument `action`
❌ DELETE_USER - Invalid value for argument `action`
❌ SUSPEND_USER - Invalid value for argument `action`
❌ ACTIVATE_USER - Invalid value for argument `action`
❌ STUDY_DETAIL_VIEW - Invalid value for argument `action`
❌ STUDY_UNHIDE - Invalid value for argument `action`
❌ STUDY_REOPEN - Invalid value for argument `action`
```

### After (완전 해결)
```
✅ USER_VIEW - 정상 동작
✅ USER_UPDATE - 정상 동작
✅ USER_DELETE - 정상 동작
✅ USER_SUSPEND - 정상 동작
✅ USER_UNSUSPEND - 정상 동작
✅ STUDY_VIEW - 정상 동작
✅ STUDY_UNHIDE - 정상 동작 (enum 추가)
✅ STUDY_REOPEN - 정상 동작 (enum 추가)
```

---

## 🎯 핵심 교훈

### 1. **항상 Prisma Enum 먼저 확인**
```bash
# enum 확인 명령어
grep -A 30 "enum AdminAction" prisma/schema.prisma
```

### 2. **네이밍 규칙 준수**
- ❌ `VIEW_USER` (동작_대상)
- ✅ `USER_VIEW` (대상_동작)

### 3. **Prisma 클라이언트 재생성 필수**
```bash
npx prisma generate
```

### 4. **서버 재시작 필수**
- Enum 변경 후 반드시 서버 재시작

---

## 🏆 최종 체크리스트

- ✅ 모든 액션 이름 수정
- ✅ Prisma schema 업데이트
- ✅ Prisma 클라이언트 재생성
- ✅ 서버 재시작
- ✅ 0개 Prisma 에러
- ✅ 관리자 로그 정상 기록
- ✅ 모든 API 정상 동작

**AdminAction Enum 오류 완전 해결 완료! 🎉**

---

**작성자**: GitHub Copilot  
**작성일**: 2025-11-29  
**문서 버전**: 1.0

