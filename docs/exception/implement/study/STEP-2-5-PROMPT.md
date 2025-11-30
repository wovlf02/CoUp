# CoUp 예외 처리 - Step 2-5 프롬프트

안녕하세요! CoUp 예외 처리 구현 Step 2-5를 시작합니다.

**목표**: study 영역의 Important 예외 처리 구현 (파일 보안 강화)

**프로젝트 정보**:
- Next.js 16 App Router 기반
- JavaScript (ES6+) 전용
- Prisma ORM 사용

**이전 완료**: 
- Step 2-4 (study 영역 Critical 구현) ✅ ⭐ 완료!
  - Part 1: 6개 유틸리티 파일 생성 (4,516줄)
  - Part 2: 7개 API 라우트 예외 처리 적용
  - 25개 Critical 예외 처리 구현
  - 구현률: 29% → 50%

**현재 작업**: Step 2-5 - 파일 보안 및 XSS 방어

**참조 문서**:
- `docs/exception/implement/study/STEP-2-4-COMPLETE-REPORT.md`
- `docs/exception/implement/study/ANALYSIS.md`

---

## 작업 내용

### 1. sanitize-html 설치 (5분)
```bash
cd coup
npm install sanitize-html
```

### 2. 파일 업로드 보안 강화

`coup/src/lib/file-upload-helpers.js` 개선

위험한 확장자 차단, 이중 확장자 검증, NULL 바이트/경로 순회 공격 방어 추가

### 3. 공지 XSS 방어

`coup/src/lib/validators/study-validation.js`의 validateNotice에 XSS 검증 추가

### 4. 공지 API에 sanitize 적용

`coup/src/app/api/studies/[id]/notices/route.js`에 sanitize-html 적용

### 5. 검색어 sanitization

`coup/src/app/api/studies/route.js` GET 핸들러에 검색어 특수문자 제거

---

## 완료 조건
- [ ] sanitize-html 설치
- [ ] 파일 보안 강화
- [ ] XSS 방어 추가
- [ ] 컴파일 에러 없음
- [ ] STEP-2-5-REPORT.md 작성

화이팅! 🚀
