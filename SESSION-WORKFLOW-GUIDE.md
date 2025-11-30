# CoUp 예외 처리 구현 - 세션 워크플로우 가이드

**작성일**: 2025-11-30  
**버전**: 1.0.0

---

## 📝 빠른 시작

### 문서 구조

```
C:\Project\CoUp\
├── EXCEPTION-IMPLEMENTATION-PROMPT.md    # 전체 프로젝트 개요 및 실행 프롬프트
├── SESSION-WORKFLOW-GUIDE.md             # 이 문서 (워크플로우 가이드)
└── docs\exception\
    └── NEXT-SESSION-PROMPT.md            # 단계별 참조용 프롬프트 모음
```

### ⚠️ 중요: 프롬프트 자동 업데이트 방식

**각 Step 완료 시 자동으로 진행되는 흐름:**

1. **AI가 완료 확인**
   - 현재 Step의 모든 작업 완료
   - 생성된 파일 목록 표시
   - PROGRESS-TRACKER.md 업데이트

2. **AI가 다음 Step 프롬프트 생성**
   - 현재 프롬프트와 동일한 상세도
   - 다음 단계의 구체적 작업 지시
   - 완료 조건 및 참조 문서 포함

3. **AI가 업데이트 지시**
   ```
   ✅ Step [N] 완료!
   
   EXCEPTION-IMPLEMENTATION-PROMPT.md의 '실행 명령' 섹션을
   아래 프롬프트로 업데이트해주세요:
   
   [새 프롬프트 전체 내용]
   ```

4. **사용자가 문서 업데이트**
   - EXCEPTION-IMPLEMENTATION-PROMPT.md 열기
   - "실행 명령" 섹션 프롬프트 교체
   - 저장

5. **새 세션 시작**
   - 업데이트된 프롬프트 복사
   - 새 채팅 세션에 붙여넣기

**핵심:** 항상 `EXCEPTION-IMPLEMENTATION-PROMPT.md`의 "실행 명령" 섹션 프롬프트를 사용합니다.

---

## 🚀 세션 진행 플로우

### 첫 시작 (Session 1)

**사용 문서**: `EXCEPTION-IMPLEMENTATION-PROMPT.md`

1. 파일 열기: `C:\Project\CoUp\EXCEPTION-IMPLEMENTATION-PROMPT.md`
2. "🎯 실행 명령" 섹션으로 이동
3. "프로젝트 시작 프롬프트 (Step 1)" 복사
4. 새 세션에 붙여넣기

**작업 내용**: 
- `docs/exception/implement/` 폴더 구조 생성
- 기본 문서 4개 작성 (README, TODO, GUIDE, TRACKER)
- 10개 영역 폴더 및 90개 템플릿 생성

**완료 확인**:
- [ ] `docs/exception/implement/` 폴더 존재
- [ ] 4개 기본 문서 생성
- [ ] 10개 영역 폴더 및 90개 템플릿 생성
- [ ] `PROGRESS-TRACKER.md`에 Step 1 완료 체크

---

### Session 2: auth 분석

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

1. 파일 열기: `C:\Project\CoUp\docs\exception\NEXT-SESSION-PROMPT.md`
2. "📋 Step 2: 영역별 분석 작업" 섹션으로 이동
3. "Step 2-1: auth 분석" 프롬프트 복사
4. 새 세션에 붙여넣기

**작업 내용**:
- `docs/exception/auth/` 문서 전체 분석
- `coup/src/app/(auth)/` 및 관련 코드 분석
- `implement/auth/ANALYSIS.md` 작성

**완료 확인**:
- [ ] `implement/auth/ANALYSIS.md` 생성
- [ ] 예외 코드 구현/미구현 분류
- [ ] 필요한 작업 목록 작성
- [ ] `PROGRESS-TRACKER.md` 업데이트

---

### Session 3-11: 나머지 영역 분석

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

각 영역마다 "Step 2-[N]" 프롬프트 사용:
- Session 3: dashboard
- Session 4: admin
- Session 5: studies
- Session 6: my-studies
- Session 7: chat
- Session 8: notifications
- Session 9: profile
- Session 10: settings
- Session 11: search

**작업 패턴**: Session 2와 동일 (영역명만 변경)

---

### Session 12: auth Phase 계획

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

1. "📋 Step 3: Phase별 구현 계획 수립" 섹션으로 이동
2. "Step 3-1: auth Phase 작성" 프롬프트 복사
3. 새 세션에 붙여넣기

**작업 내용**:
- `implement/auth/PHASE-01-CRITICAL.md` 작성
- `implement/auth/PHASE-02-HIGH.md` 작성
- `implement/auth/PHASE-03-MEDIUM.md` 작성
- `implement/auth/PHASE-04-LOW.md` 작성

**완료 확인**:
- [ ] 4개 Phase 문서 생성
- [ ] 각 예외별 상세 구현 계획 작성
- [ ] `PROGRESS-TRACKER.md` 업데이트

---

### Session 13-21: 나머지 영역 Phase 계획

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

각 영역마다 "Step 3-[N]" 프롬프트 사용:
- Session 13: dashboard
- Session 14: admin
- Session 15: studies
- Session 16: my-studies
- Session 17: chat
- Session 18: notifications
- Session 19: profile
- Session 20: settings
- Session 21: search

**작업 패턴**: Session 12와 동일 (영역명만 변경)

---

### Session 22: TODO 리스트 생성

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

1. "📋 Step 4: TODO 리스트 생성" 섹션으로 이동
2. "Step 4" 프롬프트 복사
3. 새 세션에 붙여넣기

**작업 내용**:
- 10개 영역별 `TODO.md` 작성
- `implement/TODO.md` 통합
- 우선순위 및 마일스톤 설정

**완료 확인**:
- [ ] 11개 TODO.md 생성 (10개 영역 + 1개 통합)
- [ ] 우선순위 설정
- [ ] 마일스톤 4개 설정
- [ ] `PROGRESS-TRACKER.md` 업데이트

---

### Session 23+: 실제 코드 구현

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

#### Session 23: auth Critical 구현

1. "📋 Step 5: 실제 코드 구현" 섹션으로 이동
2. "Step 5-1: auth Critical" 프롬프트 복사
3. 새 세션에 붙여넣기

**작업 내용**:
- `implement/auth/PHASE-01-CRITICAL.md`의 예외 구현
- 유틸리티 함수 생성
- 테스트 작성
- 문서 업데이트

#### 이후 세션들

각 영역/심각도 조합마다 새 세션:
- Critical: auth → admin → dashboard → ... (10개 영역)
- High: auth → admin → dashboard → ... (10개 영역)
- Medium: auth → admin → dashboard → ... (10개 영역)
- Low: auth → admin → dashboard → ... (10개 영역)

**프롬프트**: "Step 5-[N]" 사용 (영역/심각도 변경)

---

### Session N-2: 테스트 및 검증

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

1. "📋 Step 6: 테스트 및 검증" 섹션으로 이동
2. "Step 6" 프롬프트 복사
3. 새 세션에 붙여넣기

**작업 내용**:
- 통합 테스트 작성
- E2E 테스트 작성
- 테스트 커버리지 확인 (목표: 90%)
- 성능/보안 테스트

---

### Session N-1: 문서화 및 배포

**사용 문서**: `docs/exception/NEXT-SESSION-PROMPT.md`

1. "📋 Step 7: 문서화 및 배포" 섹션으로 이동
2. "Step 7" 프롬프트 복사
3. 새 세션에 붙여넣기

**작업 내용**:
- API 문서 업데이트
- README 업데이트
- 배포 가이드 작성
- 최종 보고서 작성

---

## 📊 진행 상황 추적

### PROGRESS-TRACKER.md 사용

각 세션 완료 후:
1. `docs/exception/implement/PROGRESS-TRACKER.md` 열기
2. 완료한 Step 체크
3. 완료 날짜 기록
4. 다음 Step 확인

### 진행률 계산

```
전체 진행률 = (완료된 예외 / 1,020) × 100%
```

---

## ✅ 체크리스트

### 준비 단계
- [ ] 프로젝트 구조 이해
- [ ] 문서 검토 완료
- [ ] 개발 환경 설정

### 문서화 단계
- [ ] Step 1: 구조 생성 (1 session)
- [ ] Step 2: 영역 분석 (10 sessions)
- [ ] Step 3: Phase 계획 (10 sessions)
- [ ] Step 4: TODO 생성 (1 session)

### 구현 단계
- [ ] Step 5: Critical 구현 (~10 sessions)
- [ ] Step 5: High 구현 (~15 sessions)
- [ ] Step 5: Medium 구현 (~20 sessions)
- [ ] Step 5: Low 구현 (~10 sessions)

### 완료 단계
- [ ] Step 6: 테스트/검증 (2-3 sessions)
- [ ] Step 7: 문서화/배포 (1-2 sessions)

**예상 총 세션 수**: 80-100 sessions

---

## 🎯 팁 & 주의사항

### 세션 시작 시
1. 이전 세션 완료 내역 확인
2. `PROGRESS-TRACKER.md` 확인
3. 해당 Step 프롬프트 정확히 복사

### 세션 중
1. 문서 참조 링크 적극 활용
2. 코드 패턴 일관성 유지
3. 테스트 꼭 작성

### 세션 종료 시
1. 완료 조건 모두 체크
2. `PROGRESS-TRACKER.md` 업데이트
3. 다음 세션 프롬프트 확인

### 세션 간 연속성
- 각 세션은 독립적이지만 누적됨
- 이전 결과물 항상 참조
- 패턴과 구조 일관성 유지

---

## 📞 도움말

### 막혔을 때
1. 해당 영역의 `ANALYSIS.md` 재확인
2. `docs/exception/[영역]/` 예외 문서 참조
3. `EXCEPTION-IMPLEMENTATION-PROMPT.md`의 코드 패턴 참조

### 진행 상황 확인
- `implement/PROGRESS-TRACKER.md`
- `implement/TODO.md`
- 각 영역의 `CODE-CHANGES.md`

### 참조 문서
- **전체 개요**: `EXCEPTION-IMPLEMENTATION-PROMPT.md`
- **단계별 가이드**: `docs/exception/NEXT-SESSION-PROMPT.md`
- **이 문서**: `SESSION-WORKFLOW-GUIDE.md`

---

**작성자**: GitHub Copilot  
**최종 수정**: 2025-11-30  

**Happy Coding! 🎉**

