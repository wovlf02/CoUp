# CoUp 관리자 기능 예외 처리 전체 색인

**작성일**: 2025-11-29  
**버전**: 1.0.0  
**총 예외 코드**: 150+

---

## 📋 목차

1. [색인 사용 방법](#색인-사용-방법)
2. [예외 코드 체계](#예외-코드-체계)
3. [카테고리별 색인](#카테고리별-색인)
4. [심각도별 색인](#심각도별-색인)
5. [빈도별 색인](#빈도별-색인)
6. [전체 알파벳 순](#전체-알파벳-순)

---

## 색인 사용 방법

### 예외 코드 찾기

1. **카테고리로 찾기**: 어떤 영역의 예외인지 알 때
2. **심각도로 찾기**: 얼마나 긴급한지에 따라
3. **빈도로 찾기**: 자주 발생하는 것부터
4. **알파벳으로 찾기**: 코드를 알 때

### 예외 코드 형식

```
ADM-[CATEGORY]-[NUMBER]

ADM: Admin (관리자)
CATEGORY: 카테고리 (3자)
NUMBER: 일련번호 (001-999)

예: ADM-USR-001 (관리자 > 사용자 > 001번)
```

---

## 예외 코드 체계

### 카테고리 코드

| 코드 | 카테고리 | 설명 |
|------|----------|------|
| **USR** | User Management | 사용자 관리 |
| **STD** | Study Management | 스터디 관리 |
| **RPT** | Report Handling | 신고 처리 |
| **ANL** | Analytics | 통계 및 분석 |
| **SET** | Settings | 시스템 설정 |
| **LOG** | Audit Logs | 로그 관리 |
| **PRM** | Permissions | 권한 관리 |
| **EDG** | Edge Cases | 엣지 케이스 |

### 심각도 레벨

- 🔴 **Critical**: 즉시 해결 필요, 시스템 장애
- 🟠 **High**: 빠른 해결 필요, 기능 제한
- 🟡 **Medium**: 계획된 해결, 불편함
- 🟢 **Low**: 개선 권장, 영향 미미

---

## 카테고리별 색인

### 1. 사용자 관리 (USR) - 25개

#### 권한 및 인증 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-USR-001 | 관리자 권한 없음 | 🔴 | 높음 | 01-user-management.md#권한-검증 |
| ADM-USR-002 | 세션 만료 | 🟠 | 높음 | 01-user-management.md#세션-관리 |
| ADM-USR-003 | 자기 자신 수정 시도 | 🟡 | 중간 | 01-user-management.md#자가-수정-방지 |
| ADM-USR-004 | 다른 관리자 수정 권한 없음 | 🟠 | 낮음 | 01-user-management.md#관리자-간-권한 |
| ADM-USR-005 | IP 제한 위반 | 🔴 | 낮음 | 07-permissions-rbac.md#ip-제한 |

#### 사용자 조회 (011-020)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-USR-011 | 사용자 목록 조회 실패 | 🟠 | 중간 | 01-user-management.md#목록-조회 |
| ADM-USR-012 | 사용자 상세 조회 실패 | 🟠 | 중간 | 01-user-management.md#상세-조회 |
| ADM-USR-013 | 존재하지 않는 사용자 | 🟡 | 높음 | 01-user-management.md#사용자-없음 |
| ADM-USR-014 | 삭제된 사용자 접근 | 🟡 | 중간 | 01-user-management.md#삭제된-사용자 |
| ADM-USR-015 | 대량 사용자 조회 타임아웃 | 🟠 | 낮음 | 01-user-management.md#성능-문제 |
| ADM-USR-016 | 필터 조건 오류 | 🟡 | 중간 | 01-user-management.md#필터링 |
| ADM-USR-017 | 정렬 조건 오류 | 🟢 | 낮음 | 01-user-management.md#정렬 |
| ADM-USR-018 | 페이지네이션 범위 초과 | 🟢 | 중간 | 01-user-management.md#페이지네이션 |

#### 사용자 상태 변경 (021-030)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-USR-021 | 사용자 정지 실패 | 🟠 | 중간 | 01-user-management.md#정지 |
| ADM-USR-022 | 이미 정지된 사용자 | 🟡 | 높음 | 01-user-management.md#중복-정지 |
| ADM-USR-023 | 사용자 활성화 실패 | 🟠 | 중간 | 01-user-management.md#활성화 |
| ADM-USR-024 | 이미 활성화된 사용자 | 🟡 | 높음 | 01-user-management.md#중복-활성화 |
| ADM-USR-025 | 사용자 삭제 실패 | 🟠 | 낮음 | 01-user-management.md#삭제 |
| ADM-USR-026 | 마지막 관리자 삭제 시도 | 🔴 | 낮음 | 01-user-management.md#마지막-관리자 |
| ADM-USR-027 | 외래 키 제약 위반 | 🟠 | 중간 | 01-user-management.md#외래-키 |
| ADM-USR-028 | 상태 전이 규칙 위반 | 🟡 | 낮음 | 01-user-management.md#상태-전이 |

---

### 2. 스터디 관리 (STD) - 20개

#### 스터디 조회 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-STD-001 | 스터디 목록 조회 실패 | 🟠 | 중간 | 02-study-management.md#목록-조회 |
| ADM-STD-002 | 스터디 상세 조회 실패 | 🟠 | 중간 | 02-study-management.md#상세-조회 |
| ADM-STD-003 | 존재하지 않는 스터디 | 🟡 | 높음 | 02-study-management.md#스터디-없음 |
| ADM-STD-004 | 삭제된 스터디 접근 | 🟡 | 중간 | 02-study-management.md#삭제된-스터디 |
| ADM-STD-005 | 카테고리 필터 오류 | 🟡 | 낮음 | 02-study-management.md#필터링 |
| ADM-STD-006 | 멤버 수 계산 오류 | 🟢 | 낮음 | 02-study-management.md#집계-오류 |

#### 스터디 상태 변경 (011-020)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-STD-011 | 스터디 강제 종료 실패 | 🟠 | 낮음 | 02-study-management.md#강제-종료 |
| ADM-STD-012 | 이미 종료된 스터디 | 🟡 | 중간 | 02-study-management.md#중복-종료 |
| ADM-STD-013 | 활성 멤버 있는 스터디 종료 | 🟠 | 낮음 | 02-study-management.md#멤버-존재 |
| ADM-STD-014 | 스터디 숨기기 실패 | 🟡 | 낮음 | 02-study-management.md#숨기기 |
| ADM-STD-015 | 이미 숨겨진 스터디 | 🟡 | 중간 | 02-study-management.md#중복-숨김 |
| ADM-STD-016 | 스터디 삭제 실패 | 🟠 | 낮음 | 02-study-management.md#삭제 |
| ADM-STD-017 | 연관 데이터 삭제 실패 | 🟠 | 낮음 | 02-study-management.md#연관-데이터 |
| ADM-STD-018 | 멤버 통보 실패 | 🟡 | 중간 | 02-study-management.md#알림-전송 |
| ADM-STD-019 | 스터디 소유자 변경 실패 | 🟡 | 낮음 | 02-study-management.md#소유자-변경 |
| ADM-STD-020 | 스터디 데이터 불일치 | 🟠 | 낮음 | 02-study-management.md#데이터-무결성 |

---

### 3. 신고 처리 (RPT) - 25개

#### 신고 조회 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-RPT-001 | 신고 목록 조회 실패 | 🟠 | 중간 | 03-report-handling.md#목록-조회 |
| ADM-RPT-002 | 신고 상세 조회 실패 | 🟠 | 중간 | 03-report-handling.md#상세-조회 |
| ADM-RPT-003 | 존재하지 않는 신고 | 🟡 | 높음 | 03-report-handling.md#신고-없음 |
| ADM-RPT-004 | 신고 대상 삭제됨 | 🟡 | 중간 | 03-report-handling.md#대상-삭제 |
| ADM-RPT-005 | 신고자 삭제됨 | 🟢 | 낮음 | 03-report-handling.md#신고자-삭제 |
| ADM-RPT-006 | 우선순위 필터 오류 | 🟡 | 낮음 | 03-report-handling.md#필터링 |
| ADM-RPT-007 | 상태 필터 오류 | 🟡 | 낮음 | 03-report-handling.md#필터링 |

#### 신고 처리 (011-020)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-RPT-011 | 신고 처리 실패 | 🟠 | 중간 | 03-report-handling.md#처리 |
| ADM-RPT-012 | 이미 처리된 신고 | 🟡 | 높음 | 03-report-handling.md#중복-처리 |
| ADM-RPT-013 | 동시 처리 충돌 | 🟠 | 낮음 | 03-report-handling.md#동시성 |
| ADM-RPT-014 | 처리 권한 없음 | 🟠 | 낮음 | 03-report-handling.md#권한 |
| ADM-RPT-015 | 처리 사유 누락 | 🟡 | 중간 | 03-report-handling.md#검증 |
| ADM-RPT-016 | 잘못된 처리 결과 | 🟡 | 낮음 | 03-report-handling.md#검증 |
| ADM-RPT-017 | 신고 할당 실패 | 🟡 | 낮음 | 03-report-handling.md#할당 |
| ADM-RPT-018 | 신고 재할당 실패 | 🟡 | 낮음 | 03-report-handling.md#재할당 |

#### 제재 조치 (021-030)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-RPT-021 | 경고 발송 실패 | 🟠 | 중간 | 03-report-handling.md#경고 |
| ADM-RPT-022 | 정지 처리 실패 | 🟠 | 중간 | 03-report-handling.md#정지 |
| ADM-RPT-023 | 제재 이력 기록 실패 | 🟠 | 낮음 | 03-report-handling.md#이력 |
| ADM-RPT-024 | 제재 기간 계산 오류 | 🟡 | 낮음 | 03-report-handling.md#기간-계산 |
| ADM-RPT-025 | 알림 전송 실패 | 🟡 | 중간 | 03-report-handling.md#알림 |

---

### 4. 통계 및 분석 (ANL) - 20개

#### 데이터 조회 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-ANL-001 | 전체 통계 조회 실패 | 🟠 | 중간 | 04-analytics-stats.md#전체-통계 |
| ADM-ANL-002 | 사용자 분석 조회 실패 | 🟠 | 중간 | 04-analytics-stats.md#사용자-분석 |
| ADM-ANL-003 | 스터디 분석 조회 실패 | 🟠 | 중간 | 04-analytics-stats.md#스터디-분석 |
| ADM-ANL-004 | 쿼리 타임아웃 | 🔴 | 높음 | 04-analytics-stats.md#타임아웃 |
| ADM-ANL-005 | 날짜 범위 오류 | 🟡 | 중간 | 04-analytics-stats.md#날짜-범위 |
| ADM-ANL-006 | 잘못된 날짜 형식 | 🟡 | 중간 | 04-analytics-stats.md#날짜-검증 |
| ADM-ANL-007 | 미래 날짜 입력 | 🟢 | 낮음 | 04-analytics-stats.md#날짜-검증 |

#### 집계 및 계산 (011-020)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-ANL-011 | 집계 계산 오류 | 🟠 | 낮음 | 04-analytics-stats.md#집계-오류 |
| ADM-ANL-012 | 0으로 나누기 오류 | 🟡 | 낮음 | 04-analytics-stats.md#수학-오류 |
| ADM-ANL-013 | 성장률 계산 오류 | 🟡 | 낮음 | 04-analytics-stats.md#성장률 |
| ADM-ANL-014 | 백분율 계산 오류 | 🟡 | 낮음 | 04-analytics-stats.md#백분율 |
| ADM-ANL-015 | 차트 데이터 생성 실패 | 🟡 | 중간 | 04-analytics-stats.md#차트 |
| ADM-ANL-016 | 빈 데이터 처리 오류 | 🟢 | 중간 | 04-analytics-stats.md#빈-데이터 |
| ADM-ANL-017 | 캐시 불일치 | 🟡 | 중간 | 04-analytics-stats.md#캐시 |
| ADM-ANL-018 | 캐시 만료 | 🟢 | 높음 | 04-analytics-stats.md#캐시 |
| ADM-ANL-019 | 메모리 부족 | 🔴 | 낮음 | 04-analytics-stats.md#메모리 |
| ADM-ANL-020 | 대량 데이터 처리 실패 | 🟠 | 낮음 | 04-analytics-stats.md#대량-데이터 |

---

### 5. 시스템 설정 (SET) - 20개

#### 설정 조회 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-SET-001 | 설정 조회 실패 | 🔴 | 중간 | 05-system-settings.md#조회 |
| ADM-SET-002 | 설정 캐시 오류 | 🟠 | 낮음 | 05-system-settings.md#캐시 |
| ADM-SET-003 | 설정 키 없음 | 🟡 | 중간 | 05-system-settings.md#키-없음 |
| ADM-SET-004 | 설정 파싱 오류 | 🟡 | 낮음 | 05-system-settings.md#파싱 |
| ADM-SET-005 | JSON 파싱 실패 | 🟡 | 낮음 | 05-system-settings.md#json |

#### 설정 업데이트 (011-020)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-SET-011 | 설정 업데이트 실패 | 🔴 | 낮음 | 05-system-settings.md#업데이트 |
| ADM-SET-012 | 유효하지 않은 설정 값 | 🟠 | 중간 | 05-system-settings.md#검증 |
| ADM-SET-013 | 타입 불일치 | 🟠 | 중간 | 05-system-settings.md#타입 |
| ADM-SET-014 | 범위 초과 | 🟡 | 낮음 | 05-system-settings.md#범위 |
| ADM-SET-015 | 순환 의존성 | 🟠 | 낮음 | 05-system-settings.md#의존성 |
| ADM-SET-016 | 설정 충돌 | 🟠 | 낮음 | 05-system-settings.md#충돌 |
| ADM-SET-017 | 캐시 무효화 실패 | 🟡 | 중간 | 05-system-settings.md#캐시-무효화 |
| ADM-SET-018 | 설정 이력 기록 실패 | 🟡 | 낮음 | 05-system-settings.md#이력 |
| ADM-SET-019 | 롤백 실패 | 🔴 | 낮음 | 05-system-settings.md#롤백 |
| ADM-SET-020 | 캐시 클리어 실패 | 🟡 | 낮음 | 05-system-settings.md#캐시-클리어 |

---

### 6. 로그 관리 (LOG) - 15개

#### 로그 조회 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-LOG-001 | 로그 조회 실패 | 🟠 | 중간 | 06-audit-logs.md#조회 |
| ADM-LOG-002 | 로그 필터링 오류 | 🟡 | 중간 | 06-audit-logs.md#필터링 |
| ADM-LOG-003 | 날짜 범위 오류 | 🟡 | 중간 | 06-audit-logs.md#날짜-범위 |
| ADM-LOG-004 | 대량 로그 조회 타임아웃 | 🟠 | 높음 | 06-audit-logs.md#타임아웃 |
| ADM-LOG-005 | 로그 내보내기 실패 | 🟡 | 낮음 | 06-audit-logs.md#내보내기 |
| ADM-LOG-006 | CSV 생성 오류 | 🟡 | 낮음 | 06-audit-logs.md#csv |

#### 로그 기록 (011-015)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-LOG-011 | 로그 기록 실패 | 🟠 | 중간 | 06-audit-logs.md#기록 |
| ADM-LOG-012 | 로그 데이터 검증 실패 | 🟡 | 낮음 | 06-audit-logs.md#검증 |
| ADM-LOG-013 | 민감 정보 마스킹 실패 | 🔴 | 낮음 | 06-audit-logs.md#마스킹 |
| ADM-LOG-014 | 로그 용량 초과 | 🟠 | 낮음 | 06-audit-logs.md#용량 |
| ADM-LOG-015 | 로그 보관 정책 오류 | 🟡 | 낮음 | 06-audit-logs.md#보관-정책 |

---

### 7. 권한 관리 (PRM) - 20개

#### 권한 검증 (001-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-PRM-001 | 권한 확인 실패 | 🔴 | 중간 | 07-permissions-rbac.md#권한-확인 |
| ADM-PRM-002 | 권한 부족 | 🟠 | 높음 | 07-permissions-rbac.md#권한-부족 |
| ADM-PRM-003 | 역할 없음 | 🔴 | 낮음 | 07-permissions-rbac.md#역할-없음 |
| ADM-PRM-004 | 유효하지 않은 권한 | 🟡 | 낮음 | 07-permissions-rbac.md#유효하지-않은-권한 |
| ADM-PRM-005 | 권한 상속 오류 | 🟠 | 낮음 | 07-permissions-rbac.md#상속 |
| ADM-PRM-006 | 순환 권한 참조 | 🟠 | 낮음 | 07-permissions-rbac.md#순환-참조 |

#### 세션 관리 (011-015)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-PRM-011 | 세션 없음 | 🔴 | 높음 | 07-permissions-rbac.md#세션-없음 |
| ADM-PRM-012 | 세션 만료 | 🟠 | 높음 | 07-permissions-rbac.md#세션-만료 |
| ADM-PRM-013 | 세션 검증 실패 | 🟠 | 중간 | 07-permissions-rbac.md#세션-검증 |
| ADM-PRM-014 | 다중 세션 충돌 | 🟡 | 낮음 | 07-permissions-rbac.md#다중-세션 |
| ADM-PRM-015 | 세션 갱신 실패 | 🟡 | 중간 | 07-permissions-rbac.md#세션-갱신 |

#### 역할 관리 (016-020)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-PRM-016 | 역할 생성 실패 | 🟠 | 낮음 | 07-permissions-rbac.md#역할-생성 |
| ADM-PRM-017 | 역할 수정 실패 | 🟠 | 낮음 | 07-permissions-rbac.md#역할-수정 |
| ADM-PRM-018 | 역할 삭제 실패 | 🟠 | 낮음 | 07-permissions-rbac.md#역할-삭제 |
| ADM-PRM-019 | 역할 할당 실패 | 🟠 | 낮음 | 07-permissions-rbac.md#역할-할당 |
| ADM-PRM-020 | 역할 변경 후 권한 불일치 | 🟡 | 낮음 | 07-permissions-rbac.md#역할-변경 |

---

### 8. 엣지 케이스 (EDG) - 15개

#### 극한 상황 (001-005)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-EDG-001 | 대량 데이터 처리 실패 | 🔴 | 낮음 | 08-edge-cases.md#대량-데이터 |
| ADM-EDG-002 | 동시 접속 과부하 | 🔴 | 낮음 | 08-edge-cases.md#동시-접속 |
| ADM-EDG-003 | 메모리 부족 | 🔴 | 낮음 | 08-edge-cases.md#메모리 |
| ADM-EDG-004 | CPU 과부하 | 🔴 | 낮음 | 08-edge-cases.md#cpu |
| ADM-EDG-005 | 디스크 공간 부족 | 🔴 | 낮음 | 08-edge-cases.md#디스크 |

#### 동시성 문제 (006-010)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-EDG-006 | 데드락 발생 | 🔴 | 낮음 | 08-edge-cases.md#데드락 |
| ADM-EDG-007 | 레이스 컨디션 | 🟠 | 낮음 | 08-edge-cases.md#레이스-컨디션 |
| ADM-EDG-008 | 낙관적 락 실패 | 🟡 | 중간 | 08-edge-cases.md#낙관적-락 |
| ADM-EDG-009 | 비관적 락 타임아웃 | 🟠 | 낮음 | 08-edge-cases.md#비관적-락 |
| ADM-EDG-010 | 트랜잭션 충돌 | 🟠 | 낮음 | 08-edge-cases.md#트랜잭션 |

#### 외부 서비스 (011-015)
| 코드 | 설명 | 심각도 | 빈도 | 문서 |
|------|------|--------|------|------|
| ADM-EDG-011 | 데이터베이스 연결 실패 | 🔴 | 낮음 | 08-edge-cases.md#db-연결 |
| ADM-EDG-012 | Redis 연결 실패 | 🟠 | 낮음 | 08-edge-cases.md#redis |
| ADM-EDG-013 | 이메일 서비스 실패 | 🟡 | 중간 | 08-edge-cases.md#이메일 |
| ADM-EDG-014 | 파일 스토리지 실패 | 🟠 | 낮음 | 08-edge-cases.md#스토리지 |
| ADM-EDG-015 | 외부 API 타임아웃 | 🟡 | 중간 | 08-edge-cases.md#외부-api |

---

## 심각도별 색인

### 🔴 Critical (즉시 해결 필요) - 15개

| 코드 | 설명 | 카테고리 | 문서 |
|------|------|----------|------|
| ADM-USR-001 | 관리자 권한 없음 | USR | 01-user-management.md |
| ADM-USR-005 | IP 제한 위반 | USR | 07-permissions-rbac.md |
| ADM-USR-026 | 마지막 관리자 삭제 시도 | USR | 01-user-management.md |
| ADM-ANL-004 | 쿼리 타임아웃 | ANL | 04-analytics-stats.md |
| ADM-ANL-019 | 메모리 부족 | ANL | 04-analytics-stats.md |
| ADM-SET-001 | 설정 조회 실패 | SET | 05-system-settings.md |
| ADM-SET-011 | 설정 업데이트 실패 | SET | 05-system-settings.md |
| ADM-SET-019 | 롤백 실패 | SET | 05-system-settings.md |
| ADM-LOG-013 | 민감 정보 마스킹 실패 | LOG | 06-audit-logs.md |
| ADM-PRM-001 | 권한 확인 실패 | PRM | 07-permissions-rbac.md |
| ADM-PRM-003 | 역할 없음 | PRM | 07-permissions-rbac.md |
| ADM-PRM-011 | 세션 없음 | PRM | 07-permissions-rbac.md |
| ADM-EDG-001 | 대량 데이터 처리 실패 | EDG | 08-edge-cases.md |
| ADM-EDG-002 | 동시 접속 과부하 | EDG | 08-edge-cases.md |
| ADM-EDG-011 | 데이터베이스 연결 실패 | EDG | 08-edge-cases.md |

### 🟠 High (빠른 해결 필요) - 45개

주요 항목만 표시:

| 코드 | 설명 | 카테고리 |
|------|------|----------|
| ADM-USR-002 | 세션 만료 | USR |
| ADM-USR-011 | 사용자 목록 조회 실패 | USR |
| ADM-USR-021 | 사용자 정지 실패 | USR |
| ADM-STD-001 | 스터디 목록 조회 실패 | STD |
| ADM-STD-011 | 스터디 강제 종료 실패 | STD |
| ADM-RPT-001 | 신고 목록 조회 실패 | RPT |
| ADM-RPT-011 | 신고 처리 실패 | RPT |
| ADM-ANL-001 | 전체 통계 조회 실패 | ANL |
| ADM-LOG-001 | 로그 조회 실패 | LOG |
| ADM-PRM-002 | 권한 부족 | PRM |

### 🟡 Medium (계획된 해결) - 60개

### 🟢 Low (개선 권장) - 30개

---

## 빈도별 색인

### 높음 (자주 발생) - 15개

| 코드 | 설명 | 대응 방법 |
|------|------|-----------|
| ADM-USR-001 | 관리자 권한 없음 | 권한 체크 + 안내 |
| ADM-USR-002 | 세션 만료 | 자동 재로그인 |
| ADM-USR-013 | 존재하지 않는 사용자 | 404 + 목록 갱신 |
| ADM-USR-022 | 이미 정지된 사용자 | 현재 상태 표시 |
| ADM-STD-003 | 존재하지 않는 스터디 | 404 + 목록 갱신 |
| ADM-RPT-003 | 존재하지 않는 신고 | 404 + 목록 갱신 |
| ADM-RPT-012 | 이미 처리된 신고 | 현재 상태 표시 |
| ADM-ANL-004 | 쿼리 타임아웃 | 캐시 + 페이지네이션 |
| ADM-ANL-018 | 캐시 만료 | 자동 재생성 |
| ADM-LOG-004 | 대량 로그 조회 타임아웃 | 페이지네이션 강제 |
| ADM-PRM-002 | 권한 부족 | 권한 안내 |
| ADM-PRM-011 | 세션 없음 | 로그인 리다이렉트 |
| ADM-PRM-012 | 세션 만료 | 재로그인 |

---

## 전체 알파벳 순

```
ADM-ANL-001: 전체 통계 조회 실패
ADM-ANL-002: 사용자 분석 조회 실패
ADM-ANL-003: 스터디 분석 조회 실패
ADM-ANL-004: 쿼리 타임아웃
ADM-ANL-005: 날짜 범위 오류
...
(150+ 예외 코드)
```

---

## 사용 예제

### 1. 문제 진단

```javascript
// 로그에서 예외 코드 확인
console.error('[ADM-USR-013] 존재하지 않는 사용자')

// INDEX.md에서 코드 검색
// → 01-user-management.md#사용자-없음 참조
```

### 2. 에러 핸들링

```javascript
try {
  await suspendUser(userId)
} catch (error) {
  if (error.code === 'P2025') {
    // ADM-USR-013: 존재하지 않는 사용자
    toast.error('사용자를 찾을 수 없습니다')
    router.push('/admin/users')
  } else if (error.message.includes('already suspended')) {
    // ADM-USR-022: 이미 정지된 사용자
    toast.info('이미 정지된 사용자입니다')
    fetchUser() // 현재 상태 다시 가져오기
  }
}
```

### 3. 모니터링

```javascript
// 심각도별 알림 설정
const ALERT_THRESHOLDS = {
  CRITICAL: 1,  // 1회 발생 시 즉시 알림
  HIGH: 5,      // 5분에 5회 이상
  MEDIUM: 20,   // 1시간에 20회 이상
  LOW: 100,     // 1일에 100회 이상
}

// 빈도별 대시보드
// - 높음: 실시간 모니터링
// - 중간: 1시간 단위 확인
// - 낮음: 1일 단위 확인
```

---

## 업데이트 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-11-29 | 1.0.0 | 초기 색인 작성 (150+ 예외) |

---

**다음 문서**: [사용자 관리 예외 처리](./01-user-management.md)

