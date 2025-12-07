# 보안 체크 보고서 - GitHub Public 전환

**작성일**: 2025년 12월 7일  
**목적**: Private 저장소를 Public으로 전환하기 전 민감 정보 점검 및 조치

---

## 📋 요약

| 항목 | 발견 | 조치 완료 |
|------|------|-----------|
| 환경 변수 파일 (.env) | 3개 | ✅ |
| 로그 파일 | 4개 | ✅ |
| 사용자 업로드 파일 | 폴더 전체 | ✅ |
| .gitignore 업데이트 | 필요 | ✅ |

---

## 🚨 발견된 민감 정보

### 1. coup/.env
**위험도: 높음** ⚠️

| 항목 | 민감 정보 | 위험 수준 |
|------|----------|-----------|
| DATABASE_URL | 실제 DB 비밀번호 (`elskvhfh12`) | 높음 |
| NAVER_SMTP_USER | 실제 이메일 주소 (`nskfn02@naver.com`) | 높음 |
| NAVER_SMTP_PASSWORD | SMTP 앱 비밀번호 (`96PSS3Z7YUHU`) | **매우 높음** |

### 2. coup/.env.local
**위험도: 높음** ⚠️

| 항목 | 민감 정보 | 위험 수준 |
|------|----------|-----------|
| DATABASE_URL | 실제 DB 비밀번호 (`elskvhfh12`) | 높음 |

### 3. signaling-server/.env
**위험도: 낮음** ✅

- localhost 설정만 포함
- 실제 자격 증명 없음

### 4. 로그 파일
**위험도: 낮음**

- `coup/logs/combined.log`
- `coup/logs/error.log`
- `coup/seed-reports.log`
- `coup/test-calendar.log`
- `coup/test-group-results.log`

로그에 민감한 정보는 없으나, 서버 내부 정보 노출 가능성

### 5. 사용자 업로드 파일
**위험도: 중간**

- `coup/public/uploads/` - 사용자 아바타 및 파일
- 개인정보(프로필 사진 등) 포함 가능

### 6. 테스트 비밀번호 (seed.js, scripts/)
**위험도: 낮음**

- `password123`, `Admin123!`, `User123!` 등
- 테스트 목적으로 명시되어 있어 무방

---

## ✅ 수행한 조치

### 1. 백업 생성
모든 민감 파일을 `backup/` 폴더에 백업:

```
backup/
├── coup/
│   ├── .env (원본 - 실제 비밀번호 포함)
│   ├── .env.local (원본 - 실제 비밀번호 포함)
│   ├── logs/
│   │   ├── combined.log
│   │   └── error.log
│   ├── seed-reports.log
│   ├── test-calendar.log
│   ├── test-group-results.log
│   └── public/
│       └── uploads/ (전체 복��)
└── signaling-server/
    └── .env
```

### 2. 환�� 변수 파일 수정
민감 정보를 예시값으로 교체:

- `coup/.env` - 모든 비밀번호/이메일을 플레이스홀더로 교체
- `coup/.env.local` - 모든 비밀번호를 플레이스홀더로 교체
- `coup/.env.example` - 새로 생성 (개발자 가이드용)

### 3. .gitignore 업데이트
루트 `.gitignore`에 다음 패턴 추가:

- `.env*` (모든 환경 변수 파일)
- `backup/` (백업 폴더)
- `*.log` (모든 로그 파일)
- `**/uploads/` (업로드 폴더)

### 4. 파일 삭제
- 로그 파일 전체 삭제 (`.gitkeep`으로 폴더 유지)
- 업로드 폴더 내용 삭제 (`.gitkeep`으로 폴더 유지)

---

## ⚠️ 추가 권장 조치

### 1. SMTP 비밀번호 즉시 재발급 필요
네이버 SMTP 앱 비밀번호 (`96PSS3Z7YUHU`)가 노출되었습니다.

**조치 방법:**
1. 네이버 > 내정보 > 보안설정
2. 2단계 인증 > 애플리케이션 비밀번호 관리
3. 기존 비밀번호 삭제 후 새로 발급

### 2. Git 히스토리 정리 (선택사항)
`.env` 파일이 과거에 커밋된 적이 있다면, Git 히스토리에서도 제거 필요:

```bash
# BFG Repo-Cleaner 사용 (권장)
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### 3. 데이터베이스 비밀번호 변경
`elskvhfh12` 비밀번호가 노출되었으므로, 로컬 개발 환경에서도 변경 권장

---

## 📁 파일 변경 내역

| 파일 경로 | 조치 |
|----------|------|
| `coup/.env` | 민감 정보 → 플레이스홀더로 교체 |
| `coup/.env.local` | 민감 정보 → 플레이스홀더로 교체 |
| `coup/.env.example` | 새로 생성 (템플릿) |
| `.gitignore` | 보안 규칙 추가 |
| `coup/logs/*` | 삭제됨, .gitkeep 추가 |
| `coup/public/uploads/*` | 삭제됨, .gitkeep 추가 |
| `backup/` | 모든 원본 파일 백업 |

---

## ✅ Public 전환 체크리스트

- [x] `.env` 파일에서 실제 비밀번호 제거
- [x] `.env.local` 파일에서 실제 비밀번호 제거
- [x] `.env.example` 템플릿 생성
- [x] `.gitignore` 업데이트
- [x] 로그 파일 삭제
- [x] 업로드 파일 삭제
- [x] 백업 생성
- [ ] SMTP 비밀번호 재발급 (수동 필요)
- [ ] Git 히스토리 정리 (선택사항)
- [ ] DB 비밀번호 변경 (권장)

---

**결론**: 위 조치를 완료한 후 GitHub Public 전환이 안전합니다.
단, SMTP 비밀번호는 반드시 재발급하세요.
