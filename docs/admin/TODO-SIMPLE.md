# CoUp 관리자 시스템 - 간단 TODO

> **빠른 체크리스트** | 전체 버전: `IMPLEMENTATION-TODO.md`

---

## 🚀 Quick Start (첫 주)

### 필수 설정
- [ ] Redis 설정 (Upstash)
- [ ] 혐오발언 감정분석 모델 준비
- [ ] 환경 변수 추가 (`.env`)

### 데이터베이스
- [ ] Prisma 스키마 4개 모델 추가 (AdminLog, SystemSetting, Sanction, FunctionRestriction)
- [ ] 마이그레이션 실행

### 기본 인증
- [ ] `middleware.js`에 관리자 권한 체크
- [ ] `lib/adminAuth.js` 생성

---

## 📊 Phase 1: 기본 (Week 1-2)

### Week 1
- [ ] 관리자 레이아웃 (`app/admin/layout.tsx`)
- [ ] 사이드바 + 헤더
- [ ] 감사 로그 시스템 (`lib/admin/auditLog.ts`)

### Week 2
- [ ] 대시보드 페이지 (`app/admin/dashboard/page.tsx`)
- [ ] 4개 통계 카드
- [ ] 활동 그래프 (Recharts)

---

## 👥 Phase 2: 핵심 (Week 3-4)

### Week 3: 사용자 관리
- [ ] 사용자 목록 페이지 + API
- [ ] 검색 & 필터
- [ ] 사용자 상세 페이지
- [ ] 정지/해제 기능

### Week 4: 신고 관리
- [ ] 신고 목록 + 상세 페이지
- [ ] 우선순위 자동 계산
- [ ] 신고 처리 기능
- [ ] 담당자 할당

---

## 📚 Phase 3: 확장 (Week 5-6)

### Week 5: 스터디
- [ ] 스터디 목록 + 상세
- [ ] 품질 점수 계산 로직
- [ ] 추천 스터디 설정

### Week 6: 모더레이션
- [ ] 혐오발언 감정분석 모델 통합
- [ ] 욕설 필터 시스템
- [ ] VirusTotal API 통합 (선택)
- [ ] 메시지/파일 삭제

---

## 📈 Phase 4: 분석 (Week 7-8)

### Week 7: 통계
- [ ] 분석 대시보드
- [ ] 사용자/스터디 통계
- [ ] 코호트 분석
- [ ] 일일 집계 크론

### Week 8: 설정
- [ ] 감사 로그 조회 (SYSTEM_ADMIN)
- [ ] 시스템 설정 UI
- [ ] 관리자 임명/해임
- [ ] 백업 기능

---

## ⚡ Phase 5: 최적화 (Week 9-10)

### Week 9: 자동화
- [ ] AI 자동 모더레이션
- [ ] 3-Strike 자동 제재
- [ ] 실시간 알림 (Slack)
- [ ] 이메일 템플릿

### Week 10: 성능
- [ ] Redis 캐싱 적용
- [ ] DB 인덱스 추가
- [ ] Dynamic Import
- [ ] Web Vitals 측정

---

## 🎯 5대 마일스톤

1. **Week 2**: ✅ 대시보드 작동
2. **Week 4**: ✅ 사용자 & 신고 관리
3. **Week 6**: ✅ 스터디 & 모더레이션
4. **Week 8**: ✅ 분석 & 설정
5. **Week 10**: ✅ 자동화 & 최적화

---

## 📦 필수 라이브러리

```bash
npm install ioredis recharts
npm install react-email @react-email/components resend
npm install lodash-es date-fns
```

---

## 🔑 외부 서비스

- [ ] Redis (Upstash)
- [ ] 혐오발언 감정분석 모델 (자체)
- [ ] VirusTotal API (선택)
- [ ] Resend (이메일)
- [ ] Slack Webhook (선택)

---

## 📊 진행률

```
Week  1-2: [                    ] 0%
Week  3-4: [                    ] 0%
Week  5-6: [                    ] 0%
Week  7-8: [                    ] 0%
Week  9-10: [                    ] 0%

전체: [                    ] 0%
```

---

**전체 상세 TODO**: `IMPLEMENTATION-TODO.md` 참고

