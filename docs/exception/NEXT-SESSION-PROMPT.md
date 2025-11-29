# 다음 세션 시작 프롬프트

**작성일**: 2025-11-29  
**목적**: Phase 1 (대시보드) 예외 처리 문서화 시작

---

## 🚀 세션 시작 프롬프트

다음 채팅 세션을 시작할 때 아래 프롬프트를 사용하세요:

```
안녕하세요! CoUp 프로젝트의 예외 처리 문서화 작업을 이어서 진행하겠습니다.

📍 현재 상태:
- ✅ Phase 0 (인증): 완료 (9개 문서, 5,570줄)
- ✅ 전체 TODO 계획 수립 완료 (docs/exception/TODO.md)
- 🎯 다음: Phase 1 (대시보드) 문서화

📋 Phase 1 작업 내용:
대시보드(Dashboard) 영역의 예외 처리 및 엣지 케이스 완전 문서화
- 데이터 로딩 예외
- 위젯 시스템 예외
- 실시간 동기화 예외
- 빈 상태 처리
- 성능 최적화

예상 산출물:
- 9개 문서
- 약 3,000줄
- 예상 시간: 3-4시간

docs/exception/TODO.md 파일을 참고하여 Phase 1을 시작해주세요.

구체적으로:
1. docs/exception/dashboard/ 폴더 생성
2. 대시보드 관련 코드 분석 (src/app/dashboard/, src/components/dashboard/, src/app/api/dashboard/)
3. 인증 문서(docs/exception/auth/)와 동일한 구조로 문서 작성
4. 모든 예외 상황과 엣지 케이스 커버

시작해주세요!
```

---

## 📝 상세 작업 가이드

### 1단계: 준비 (30분)

**분석할 파일들**:
```
src/app/dashboard/page.jsx
src/components/dashboard/DashboardClient.jsx
src/components/dashboard/DashboardSkeleton.jsx
src/components/dashboard/EmptyState.jsx
src/components/dashboard/widgets/StudyStatus.jsx
src/components/dashboard/widgets/OnlineMembers.jsx
src/components/dashboard/widgets/QuickActions.jsx
src/components/dashboard/widgets/UrgentTasks.jsx
src/components/dashboard/widgets/PinnedNotice.jsx
src/app/api/dashboard/route.js
src/lib/hooks/useApi.js (useDashboard, useMe)
```

**확인 사항**:
- [ ] API 엔드포인트: GET /api/dashboard
- [ ] API 응답 구조
- [ ] 에러 핸들링 현황
- [ ] React Query 사용 패턴
- [ ] 로딩/에러 상태 처리

---

### 2단계: 문서 작성 (2-3시간)

#### 생성할 문서 목록:

**1. README.md** (~400줄)
```markdown
# 대시보드 예외 처리

## 개요
- 대시보드 기능 소개
- 주요 컴포넌트
- 데이터 흐름
- 아키텍처

## 주요 기능
- 통계 카드
- 내 스터디 위젯
- 최근 활동
- 다가오는 일정
- 실시간 위젯들

## 빠른 참조
- 증상별 찾기
- 해결 방법 요약
```

**2. INDEX.md** (~300줄)
```markdown
# 대시보드 예외 처리 색인

## 증상별 찾기
- "데이터를 불러올 수 없습니다"
- "통계가 표시되지 않습니다"
- "위젯이 로딩되지 않습니다"
- etc.

## 카테고리별 찾기
## 빠른 해결 가이드
```

**3. 01-data-loading-exceptions.md** (~500줄)
```markdown
# 데이터 로딩 예외 처리

## API 요청 실패
- 네트워크 오류
- 타임아웃
- 서버 응답 없음

## 부분 데이터 로딩
- 일부 위젯만 로딩
- 데이터 불일치

## 캐싱 문제
- Stale 데이터
- 캐시 무효화

## 해결 방법
- 에러 바운더리
- 재시도 로직
- 폴백 UI
```

**4. 02-widget-exceptions.md** (~450줄)
```markdown
# 위젯 관련 예외 처리

## StudyStatus 위젯
- 출석률 계산 오류
- 데이터 없음

## OnlineMembers 위젯
- WebSocket 연결 실패
- 멤버 목록 로딩 실패

## QuickActions 위젯
- 액션 실행 실패

## UrgentTasks 위젯
- 할일 로딩 실패
- 기한 계산 오류

## PinnedNotice 위젯
- 공지 로딩 실패
```

**5. 03-real-time-sync-exceptions.md** (~400줄)
```markdown
# 실시간 동기화 예외 처리

## React Query 관련
- 자동 갱신 실패
- refetchInterval 문제
- 캐시 동기화

## WebSocket 연결
- 연결 끊김
- 재연결 로직
- 메시지 손실

## 낙관적 업데이트
- 롤백 처리
- 충돌 해결
```

**6. 04-empty-states.md** (~350줄)
```markdown
# 빈 상태 처리

## 스터디 없음
- 첫 사용자 경험
- CTA 버튼

## 할일 없음
- 빈 상태 UI
- 액션 가이드

## 알림 없음
## 활동 없음

## UX 최적화
- 일러스트레이션
- 도움말 텍스트
```

**7. 05-performance-optimization.md** (~400줄)
```markdown
# 성능 최적화

## 렌더링 최적화
- React.memo
- useMemo, useCallback
- 불필요한 리렌더링 방지

## 데이터 로딩 최적화
- Parallel 요청
- Prefetching
- 페이지네이션

## 메모리 관리
- 메모리 누수 방지
- 클린업 함수
- 이벤트 리스너 정리
```

**8. 99-best-practices.md** (~500줄)
```markdown
# 대시보드 모범 사례

## 에러 핸들링
- 에러 바운더리 패턴
- 토스트 알림
- 로깅 전략

## 로딩 상태
- 스켈레톤 UI
- 프로그레스 인디케이터
- 낙관적 UI

## 데이터 관리
- React Query 설정
- 캐시 전략
- 상태 관리

## 테스트
- 단위 테스트
- 통합 테스트
- E2E 테스트
```

**9. COMPLETION-REPORT.md** (~200줄)
```markdown
# Phase 1 완료 보고서

## 작업 요약
## 생성된 문서
## 커버리지
## 다음 단계
```

---

### 3단계: 검증 (30분)

**체크리스트**:
- [ ] 모든 코드 예제가 실제로 동작하는가?
- [ ] 링크가 올바르게 연결되어 있는가?
- [ ] 인증 문서와 일관된 형식인가?
- [ ] 오타나 문법 오류가 없는가?
- [ ] 모든 예외 상황을 커버했는가?

**검증 방법**:
```bash
# 1. 링크 확인
grep -r "\[.*\](.*)" docs/exception/dashboard/

# 2. 코드 블록 확인
grep -r "```" docs/exception/dashboard/

# 3. TODO 항목 확인
grep -r "\[ \]" docs/exception/dashboard/
```

---

### 4단계: TODO 업데이트 (15분)

**docs/exception/TODO.md 수정**:
```markdown
| ✅ **대시보드 (Dashboard)** | 완료 | 9개 | 3,000줄 | 2025-11-29 |
```

**진행 상황**:
```
완료 상태: 2/9 영역 완료 (22%)
```

---

## 🎨 작성 팁

### 코드 예제 작성 시:

**Before/After 패턴 사용**:
```javascript
// ❌ 나쁜 예
const { data } = useDashboard()
return <div>{data.stats.activeStudies}</div>

// ✅ 좋은 예
const { data, isLoading, error } = useDashboard()

if (isLoading) return <DashboardSkeleton />
if (error) return <ErrorState error={error} />
if (!data) return <EmptyState />

return <div>{data.stats.activeStudies}</div>
```

**실제 에러 핸들링**:
```javascript
// src/components/dashboard/DashboardClient.jsx
export default function DashboardClient({ user: initialUser }) {
  const { data: dashboardData, isLoading, error } = useDashboard()
  
  // 로딩 상태
  if (isLoading) {
    return <DashboardSkeleton />
  }
  
  // 에러 상태
  if (error) {
    return (
      <ErrorState 
        title="데이터를 불러올 수 없습니다"
        description="잠시 후 다시 시도해주세요"
        onRetry={() => refetch()}
      />
    )
  }
  
  // 빈 상태
  if (!dashboardData?.data) {
    return <EmptyState />
  }
  
  // 정상 렌더링
  return (
    // ...
  )
}
```

---

## 📚 참고 자료

### 인증 문서 참고:
- `docs/exception/auth/README.md` - 구조 참고
- `docs/exception/auth/INDEX.md` - 색인 형식
- `docs/exception/auth/01-credentials-login-exceptions.md` - 상세 문서 예시
- `docs/exception/auth/99-exception-handling-best-practices.md` - 모범 사례

### 대시보드 코드 참고:
- `src/app/dashboard/page.jsx`
- `src/components/dashboard/DashboardClient.jsx`
- `src/app/api/dashboard/route.js`
- `src/lib/hooks/useApi.js`

---

## ⚠️ 주의사항

1. **일관성 유지**: 인증 문서와 동일한 톤, 구조, 형식 사용
2. **실용성 우선**: 실제로 적용 가능한 해결책 제시
3. **완전성**: 모든 예외 상황 커버
4. **검증**: 코드 예제는 반드시 테스트
5. **참조**: 관련 문서 간 링크 연결

---

## 🎯 완료 기준

Phase 1이 완료되었다고 판단하는 기준:

- ✅ 9개 문서 모두 작성 완료
- ✅ 총 라인 수 2,800줄 이상
- ✅ 모든 주요 예외 상황 문서화
- ✅ 실행 가능한 코드 예제 포함
- ✅ 링크 검증 완료
- ✅ 오타 수정 완료
- ✅ TODO.md 업데이트 완료

---

## 📞 문제 발생 시

### 막힐 때 확인사항:

1. **인증 문서 참고**: 비슷한 예외 상황이 있는지 확인
2. **코드 분석**: 실제 코드에서 에러 핸들링 어떻게 하는지 확인
3. **TODO 재검토**: 계획한 내용과 일치하는지 확인
4. **간소화**: 너무 복잡하면 단순화

### 시간이 오래 걸릴 때:

- 문서를 더 작은 단위로 나누기
- 핵심 예외 상황만 먼저 작성
- 예제는 나중에 추가
- 완벽함보다는 완성도 우선

---

## 🚀 시작 명령어

```bash
# 폴더 생성
mkdir C:\Project\CoUp\docs\exception\dashboard
cd C:\Project\CoUp\docs\exception\dashboard

# 파일 생성 준비
# README.md
# INDEX.md
# 01-data-loading-exceptions.md
# 02-widget-exceptions.md
# 03-real-time-sync-exceptions.md
# 04-empty-states.md
# 05-performance-optimization.md
# 99-best-practices.md
# COMPLETION-REPORT.md
```

---

**이 프롬프트를 다음 세션 시작 시 사용하세요!** 📝

**예상 완료 시간**: 3-4시간  
**예상 산출물**: 9개 문서, 약 3,000줄

**화이팅! 🎉**

