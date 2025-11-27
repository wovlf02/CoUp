# 사용자 관리 - 나머지 문서 (간략 버전)

이 폴더의 나머지 문서들:

## 03-detail-api.md
- 사용자 상세 조회 API (`GET /api/admin/users/:id`)
- 활동 통계, 제재 이력, 신고 이력 포함

## 04-suspend-api.md
- 계정 정지 API (`POST /api/admin/users/:id/suspend`)
- 정지 해제 API (`POST /api/admin/users/:id/unsuspend`)
- 경고 발송 API (`POST /api/admin/users/:id/warn`)

## 05-sanction-system.md
- 3-Strike 제재 시스템
- 자동 제재 단계 계산
- 제재 이력 관리

## 06-function-restriction.md
- 기능 제한 시스템
- 제한 설정/해제 API
- 제한 검증 미들웨어

## 07-bulk-operations.md
- 일괄 정지, 일괄 메시지 발송
- CSV 내보내기/가져오기

## 08-notifications.md
- 이메일 알림, 인앱 알림
- 알림 템플릿

**참고**: 전체 내용이 필요하면 기존 `features/01-user-management.md` 파일 참조

