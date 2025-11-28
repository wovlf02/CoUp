# CoUp 관리자 시스템 운영 매뉴얼

**버전**: 1.0.0  
**최종 업데이트**: 2025-11-29

---

## 📚 목차

1. [일일 운영](#일일-운영)
2. [주간 운영](#주간-운영)
3. [월간 운영](#월간-운영)
4. [신고 처리 가이드](#신고-처리-가이드)
5. [사용자 제재 가이드](#사용자-제재-가이드)
6. [비상 대응](#비상-대응)
7. [데이터 백업](#데이터-백업)
8. [보안 관리](#보안-관리)

---

## 📅 일일 운영

### 아침 점검 (09:00)

#### 1. 시스템 상태 확인
```bash
# 서버 상태
curl https://your-domain.com/api/health

# 데이터베이스 연결
npx prisma db pull

# 디스크 용량
df -h
```

**정상 기준**:
- ✅ API 응답 < 500ms
- ✅ 데이터베이스 연결 성공
- ✅ 디스크 사용률 < 80%

#### 2. 대시보드 확인

**체크리스트**:
- [ ] 신규 가입자 수 (정상 범위: 10-50명/일)
- [ ] 활성 사용자 수 (정상 범위: 70-85%)
- [ ] 대기 중인 신고 (목표: < 10건)
- [ ] 시스템 에러 로그 (목표: 0건)

**비정상 징후**:
- ⚠️ 급격한 가입자 증가 (스팸 계정 의심)
- ⚠️ 신고 급증 (악성 사용자 활동)
- ⚠️ 서버 응답 지연 (성능 문제)

#### 3. 신고 검토

1. **긴급 신고 우선 처리**
   - 우선순위: URGENT, HIGH
   - 유형: HARASSMENT, ILLEGAL_CONTENT
   - 목표: 1시간 이내 처리

2. **대기 중인 신고 확인**
   - 신고 목록 조회
   - 담당자 미배정 신고 확인
   - 자동 또는 수동 배정

**신고 처리 순서**:
```
1. URGENT (즉시)
2. HIGH (1시간 이내)
3. MEDIUM (4시간 이내)
4. LOW (24시간 이내)
```

### 점심 점검 (12:00)

#### 1. 통계 확인
- 오전 활동 통계
- API 응답 시간
- 에러 발생 건수

#### 2. 신고 진행 상황
- 처리 중인 신고 확인
- 미처리 신고 재확인
- 복잡한 케이스 협의

### 저녁 점검 (18:00)

#### 1. 일일 통계 확인
```
📊 오늘의 통계
- 신규 가입: 32명
- 활성 사용자: 1,245명 (78%)
- 신규 스터디: 8개
- 처리한 신고: 12건
```

#### 2. 이슈 정리
- 발생한 문제 기록
- 처리 내역 문서화
- 내일 할 일 정리

#### 3. 로그 검토
```bash
# 에러 로그 확인
grep "ERROR" logs/error.log | tail -20

# 관리자 로그 확인
# 대시보드에서 오늘의 관리자 활동 조회
```

---

## 📆 주간 운영

### 월요일: 주간 계획

#### 1. 지난 주 리뷰
- 통계 분석 (가입자, 활동, 신고)
- 주요 이슈 정리
- 개선 사항 도출

#### 2. 이번 주 목표 설정
```markdown
## 이번 주 목표 (2025-11-29 ~ 12-05)

### 신고 처리
- [ ] 대기 중인 신고 0건 달성
- [ ] 평균 처리 시간 < 2시간

### 사용자 관리
- [ ] 정지 해제 요청 검토 (5건)
- [ ] 악성 사용자 모니터링

### 시스템 개선
- [ ] 설정 최적화
- [ ] 성능 점검
```

### 수요일: 중간 점검

#### 1. 진행 상황 확인
- 주간 목표 달성률
- 신고 처리 현황
- 시스템 안정성

#### 2. 데이터 정리
```sql
-- 오래된 알림 삭제 (30일 이상)
DELETE FROM "Notification" 
WHERE "createdAt" < NOW() - INTERVAL '30 days';

-- 만료된 경고 정리
UPDATE "Warning" 
SET "isActive" = false 
WHERE "expiresAt" < NOW();
```

### 금요일: 주간 마무리

#### 1. 통계 보고서 작성
```markdown
# 주간 보고서 (2025-11-29 ~ 12-05)

## 사용자
- 신규 가입: 234명 (전주 대비 +12%)
- 활성 사용자: 1,450명 (78%)
- 탈퇴: 8명

## 스터디
- 신규 생성: 45개
- 종료: 12개
- 평균 멤버 수: 8.3명

## 신고
- 접수: 56건
- 처리: 52건
- 대기: 4건
- 평균 처리 시간: 1.8시간

## 제재
- 경고: 18건
- 정지: 5건
- 영구 정지: 1건

## 주요 이슈
1. 스팸 계정 대량 발견 (15개 계정 정지)
2. 특정 스터디에서 신고 집중 (조사 진행 중)

## 다음 주 계획
- 스팸 방지 강화
- 신고 프로세스 개선
```

#### 2. 백업 확인
```bash
# 데이터베이스 백업 상태 확인
ls -lh backups/

# 최신 백업 테스트
pg_restore --list backups/latest.dump
```

---

## 📊 월간 운영

### 월초 (1-5일): 전월 분석

#### 1. 월간 통계 분석
```sql
-- 월간 가입자 추이
SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) 
FROM "User" 
WHERE "createdAt" >= NOW() - INTERVAL '12 months'
GROUP BY month 
ORDER BY month;

-- 월간 스터디 생성
SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) 
FROM "Study" 
WHERE "createdAt" >= NOW() - INTERVAL '12 months'
GROUP BY month 
ORDER BY month;
```

#### 2. 성장률 계산
```
사용자 증가율 = (이번 달 - 지난 달) / 지난 달 × 100
스터디 증가율 = (이번 달 - 지난 달) / 지난 달 × 100
활성 비율 = 활성 사용자 / 전체 사용자 × 100
```

#### 3. 월간 보고서 작성
- 전체 통계 요약
- 주요 지표 분석
- 이슈 및 대응
- 다음 달 계획

### 월중 (15일): 정기 점검

#### 1. 시스템 점검
```bash
# 서버 리소스 사용량
top
htop

# 디스크 사용량
df -h
du -sh /var/lib/postgresql/data

# 메모리 사용량
free -h
```

#### 2. 데이터베이스 최적화
```sql
-- 인덱스 재구성
REINDEX DATABASE coup;

-- 통계 업데이트
ANALYZE;

-- 불필요한 데이터 정리
VACUUM;
```

#### 3. 보안 점검
- 관리자 계정 점검
- 비정상 로그인 시도 확인
- 권한 설정 검토

### 월말 (25-31일): 다음 달 준비

#### 1. 시스템 업데이트
```bash
# 의존성 업데이트
npm update
npm audit fix

# Prisma 업데이트
npx prisma migrate dev
```

#### 2. 설정 검토
- 시스템 설정 최적화
- 제재 정책 검토
- 신고 처리 기준 업데이트

#### 3. 백업 정리
```bash
# 오래된 백업 삭제 (90일 이상)
find backups/ -name "*.dump" -mtime +90 -delete

# 백업 상태 확인
ls -lh backups/ | tail -10
```

---

## 🚨 신고 처리 가이드

### 신고 접수 시

#### 1. 신고 검토
```markdown
✅ 확인 사항
- [ ] 신고 내용 정확성
- [ ] 증거 자료 충분성
- [ ] 유사 신고 이력
- [ ] 신고자 신뢰도
```

#### 2. 우선순위 판단
| 우선순위 | 유형 | 처리 시간 |
|---------|------|----------|
| URGENT | 불법, 위협, 개인정보 유출 | 즉시 |
| HIGH | 욕설, 괴롭힘, 스팸 | 1시간 |
| MEDIUM | 부적절한 콘텐츠, 저작권 | 4시간 |
| LOW | 기타 | 24시간 |

#### 3. 담당자 배정
```javascript
// 자동 배정 기준
1. 현재 처리 중인 신고가 가장 적은 관리자
2. 해당 유형 전문 관리자 (있는 경우)
3. 마지막 활동 시간이 가장 최근인 관리자
```

### 신고 조사

#### 1. 증거 수집
```markdown
📋 수집 항목
- [ ] 신고 대상의 활동 이력
- [ ] 관련 메시지/콘텐츠
- [ ] 다른 사용자 신고 이력
- [ ] 스크린샷/증거 자료
```

#### 2. 대상자 조사
```sql
-- 사용자 활동 이력
SELECT * FROM "User" WHERE id = 'target-user-id';

-- 경고 이력
SELECT * FROM "Warning" WHERE "userId" = 'target-user-id';

-- 제재 이력
SELECT * FROM "Sanction" WHERE "userId" = 'target-user-id';

-- 신고 받은 이력
SELECT * FROM "Report" WHERE "targetId" = 'target-user-id';
```

#### 3. 판단 기준
```markdown
### 승인 (APPROVE)
- 명백한 규정 위반
- 충분한 증거
- 반복적인 위반

### 거부 (REJECT)
- 증거 불충분
- 규정 위반 아님
- 신고자 악용

### 보류 (HOLD)
- 추가 조사 필요
- 판단 어려움
- 관련자 의견 필요
```

### 처리 조치

#### 1. 조치 선택
| 위반 정도 | 1차 | 2차 | 3차 | 4차 |
|---------|-----|-----|-----|-----|
| 경미 | 경고 | 경고 | 3일 정지 | 7일 정지 |
| 보통 | 경고 | 3일 정지 | 7일 정지 | 30일 정지 |
| 심각 | 7일 정지 | 30일 정지 | 영구 정지 | - |
| 치명 | 영구 정지 | - | - | - |

#### 2. 처리 사유 작성
```markdown
✅ 좋은 사유
"반복적인 욕설 사용으로 다른 사용자에게 불쾌감을 주었으며, 
이전에도 2회 경고를 받은 이력이 있어 3일 정지 조치합니다."

❌ 나쁜 사유
"욕설 사용"
"규정 위반"
```

#### 3. 연계 조치
```markdown
신고 승인 시 가능한 조치:
- [ ] 경고 부여
- [ ] 사용자 정지
- [ ] 콘텐츠 삭제
- [ ] 스터디 숨김
- [ ] 스터디 강제 종료
```

### 처리 완료

#### 1. 알림 발송
- 신고자: 처리 완료 알림
- 대상자: 조치 내용 알림
- 관련자: 필요시 안내

#### 2. 문서화
```markdown
# 신고 처리 기록

**신고 ID**: RPT-2025-11-001
**신고자**: user@example.com
**대상**: target@example.com
**유형**: 욕설 (HARASSMENT)
**판단**: 승인
**조치**: 3일 정지
**사유**: 반복적인 욕설 사용 (2회 경고 이력)
**처리자**: admin@example.com
**처리 시간**: 45분
```

---

## 👤 사용자 제재 가이드

### 경고 (Warning)

#### 발급 기준
- 1차 위반 (경미한 경우)
- 교육적 목적
- 반성 가능성 있음

#### 절차
1. 위반 내용 확인
2. 증거 자료 첨부
3. 경고 사유 작성 (구체적으로)
4. 심각도 선택 (MINOR/NORMAL/SERIOUS/CRITICAL)
5. 발급 및 알림

#### 효과
- 사용자 프로필에 기록
- 누적 시 제재 강화
- 유효기간 설정 가능

### 정지 (Suspension)

#### 정지 기간
- 1일: 경미한 위반
- 3일: 일반 위반
- 7일: 심각한 위반
- 30일: 매우 심각한 위반
- 영구: 반복적/치명적 위반

#### 정지 효과
```markdown
정지 중 제한:
- ❌ 로그인 불가
- ❌ 스터디 활동 불가
- ❌ 메시지 발송 불가
- ❌ 콘텐츠 생성 불가

정지 후:
- ✅ 모든 기능 복구
- ⚠️ 제재 이력 유지
```

#### 정지 해제 요청 처리
```markdown
검토 사항:
- [ ] 정지 기간 준수
- [ ] 반성 여부 확인
- [ ] 재발 가능성 평가
- [ ] 이전 제재 이력

승인 조건:
- 정지 기간 만료
- 진정한 반성 표현
- 재발 위험 낮음

거부 조건:
- 정지 기간 미달
- 반성 없음
- 추가 위반 발견
```

### 영구 정지 (Permanent Ban)

#### 발급 기준
- 반복적인 심각한 위반 (3회 이상)
- 불법 행위
- 서비스 악용
- 다중 계정으로 제재 회피

#### 절차
1. 충분한 증거 수집
2. 다른 관리자와 협의
3. 최종 판단 (SUPER_ADMIN)
4. 영구 정지 처리
5. 관련 계정 조사

#### 주의사항
- ⚠️ 신중하게 결정
- ⚠️ 충분한 증거 필요
- ⚠️ 복구 불가능
- ⚠️ 법적 문제 가능성

---

## 🚨 비상 대응

### 서버 다운

#### 1. 즉시 조치
```bash
# 서버 상태 확인
systemctl status coup-app

# 재시작
systemctl restart coup-app

# 로그 확인
journalctl -u coup-app -f
```

#### 2. 원인 파악
- CPU/메모리 과부하
- 데이터베이스 연결 실패
- 네트워크 문제
- 코드 에러

#### 3. 복구
```bash
# 백업에서 복구
pg_restore -d coup backups/latest.dump

# 애플리케이션 재배포
vercel --prod
```

### 데이터베이스 장애

#### 1. 연결 확인
```bash
# 데이터베이스 접속 테스트
psql -U coup -d coup -h localhost

# 연결 수 확인
SELECT count(*) FROM pg_stat_activity;
```

#### 2. 장애 복구
```sql
-- 연결 끊기
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'coup' AND pid <> pg_backend_pid();

-- 데이터베이스 재시작
\q
sudo systemctl restart postgresql
```

### 보안 침해

#### 1. 즉시 조치
```markdown
1. 의심되는 계정 즉시 정지
2. 관리자 비밀번호 변경
3. API 키 교체
4. 로그 백업
5. 관련 당국 신고 (필요시)
```

#### 2. 조사
```sql
-- 의심스러운 로그인
SELECT * FROM "AdminLog" 
WHERE "ipAddress" NOT IN ('known-ips')
AND "createdAt" > NOW() - INTERVAL '24 hours';

-- 비정상 활동
SELECT * FROM "AdminLog" 
WHERE "action" IN ('USER_DELETE', 'SETTINGS_UPDATE')
AND "createdAt" > NOW() - INTERVAL '24 hours';
```

#### 3. 복구
- 손상된 데이터 복구
- 보안 설정 강화
- 2단계 인증 활성화
- 접근 제어 강화

### 대량 스팸

#### 1. 탐지
```sql
-- 짧은 시간 내 대량 가입
SELECT DATE(created_at), COUNT(*) 
FROM "User" 
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at);

-- 의심스러운 패턴
SELECT "provider", COUNT(*) 
FROM "User" 
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY "provider";
```

#### 2. 조치
```sql
-- 스팸 계정 일괄 정지
UPDATE "User" 
SET "status" = 'SUSPENDED',
    "suspendReason" = '스팸 계정 의심'
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
AND "provider" = 'CREDENTIALS'
AND "name" LIKE '%spam%';
```

#### 3. 예방
- 회원가입 제한 강화
- CAPTCHA 추가
- 이메일 인증 필수
- IP 기반 제한

---

## 💾 데이터 백업

### 자동 백업 설정

#### cron 작업 (Linux)
```bash
# crontab -e

# 매일 새벽 2시 백업
0 2 * * * /path/to/backup-script.sh

# backup-script.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U coup coup > /backups/coup_$DATE.dump
# 7일 이상 된 백업 삭제
find /backups -name "*.dump" -mtime +7 -delete
```

### 수동 백업

```bash
# 전체 백업
pg_dump -U coup -F c coup > coup_backup_$(date +%Y%m%d).dump

# 특정 테이블만
pg_dump -U coup -t User -t Study coup > users_studies.dump

# 압축 백업
pg_dump -U coup coup | gzip > coup_backup.sql.gz
```

### 백업 복구

```bash
# 전체 복구
pg_restore -U coup -d coup -c coup_backup.dump

# 특정 테이블만
pg_restore -U coup -d coup -t User coup_backup.dump

# 새 데이터베이스로
createdb coup_restore
pg_restore -U coup -d coup_restore coup_backup.dump
```

### 백업 테스트

```bash
# 매월 1회 백업 복구 테스트
# 테스트 데이터베이스에 복구
createdb coup_test
pg_restore -U coup -d coup_test backups/latest.dump

# 데이터 확인
psql -U coup -d coup_test -c "SELECT COUNT(*) FROM \"User\";"

# 테스트 DB 삭제
dropdb coup_test
```

---

## 🔒 보안 관리

### 관리자 계정 관리

#### 1. 계정 생성
```javascript
// 최소 권한 원칙
// 필요한 권한만 부여

VIEWER → 조회만
MODERATOR → 콘텐츠 관리
ADMIN → 사용자 관리
SUPER_ADMIN → 모든 권한
```

#### 2. 정기 점검
```sql
-- 관리자 목록
SELECT u.email, ar.role, ar."grantedAt"
FROM "User" u
JOIN "AdminRole" ar ON u.id = ar."userId"
ORDER BY ar."grantedAt" DESC;

-- 오래 사용하지 않은 계정
SELECT u.email, u."lastLoginAt"
FROM "User" u
JOIN "AdminRole" ar ON u.id = ar."userId"
WHERE u."lastLoginAt" < NOW() - INTERVAL '30 days';
```

#### 3. 권한 회수
```sql
-- 관리자 권한 제거
DELETE FROM "AdminRole" WHERE "userId" = 'user-id';

-- 계정 비활성화
UPDATE "User" 
SET "status" = 'SUSPENDED' 
WHERE id = 'user-id';
```

### 보안 설정

#### 1. 비밀번호 정책
```javascript
// 시스템 설정에서 관리
{
  "min_password_length": 8,
  "require_special_char": true,
  "require_number": true,
  "password_expiry_days": 90
}
```

#### 2. 세션 관리
```javascript
// next-auth 설정
{
  "maxAge": 30 * 24 * 60 * 60, // 30일
  "updateAge": 24 * 60 * 60,    // 24시간마다 갱신
}
```

#### 3. IP 화이트리스트 (선택사항)
```javascript
// middleware.js
const allowedIPs = [
  '1.2.3.4',
  '5.6.7.8'
]

if (!allowedIPs.includes(clientIP)) {
  return new Response('Forbidden', { status: 403 })
}
```

---

## 📞 지원 연락처

### 긴급 연락처
- **시스템 관리자**: admin@coup.com
- **개발팀**: dev@coup.com
- **보안팀**: security@coup.com

### 업무 시간
- 평일: 09:00 - 18:00
- 주말: 비상 대응만
- 공휴일: 비상 대응만

---

**다음 업데이트**: 매월 1일

