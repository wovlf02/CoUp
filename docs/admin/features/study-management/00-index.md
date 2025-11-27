# 스터디 관리

> **폴더**: `features/study-management`

---

## 1. 개요

스터디 관리는 CoUp 플랫폼의 핵심인 '스터디'의 품질을 유지하고, 건전한 학습 환경을 조성하기 위한 관리 기능 모음입니다. 관리자는 이 기능을 통해 스터디의 상태를 모니터링하고, 문제가 있는 스터디를 제재하며, 우수한 스터디를 사용자들에게 추천할 수 있습니다.

본 문서는 스터디 관리 시스템의 전체적인 구조와 각 기능별 상세 명세를 다룹니다.

---

## 2. 문서 목차

1.  **[01-overview.md](01-overview.md)**
    - 스터디 관리 기능의 전체적인 개요, 데이터 모델, 관리자의 역할과 권한에 대해 설명합니다.

2.  **[02-list-api.md](02-list-api.md)**
    - 스터디 목록을 조회하는 API(`GET /api/admin/studies`)의 명세를 다룹니다. 검색, 필터링, 정렬, 탭 기능 등을 포함합니다.

3.  **[03-detail-api.md](03-detail-api.md)**
    - 특정 스터디의 상세 정보를 조회하는 API(`GET /api/admin/studies/:id`)의 명세를 다룹니다. 스터디 통계, 멤버 목록, 활동 이력 등을 포함합니다.

4.  **[04-quality-system.md](04-quality-system.md)**
    - 스터디의 '품질 점수'를 계산하는 알고리즘과, 이를 주기적으로 업데이트하는 크론 작업에 대해 설명합니다.

5.  **[05-featured-system.md](05-featured-system.md)**
    - 우수 스터디를 '추천 스터디'로 지정하는 조건과 관련 API(`POST /feature`) 명세를 다룹니다.

6.  **[06-moderation.md](06-moderation.md)**
    - 관리자가 스터디를 삭제하거나, 공개/비공개로 전환하고, 소유자 권한을 위임하는 등의 모더레이션 기능과 API를 설명합니다.

7.  **[07-analytics.md](07-analytics.md)**
    - 스터디 관련 통계(카테고리별 분포, 품질 분포 등)를 조회하고 분석하는 기능에 대해 설명합니다.

---

## 3. 빠른 참조

| 기능                   | 관련 API                                       | 상세 문서                               |
| ---------------------- | ---------------------------------------------- | --------------------------------------- |
| **목록 조회**          | `GET /api/admin/studies`                       | [02-list-api.md](02-list-api.md)        |
| **상세 조회**          | `GET /api/admin/studies/:id`                   | [03-detail-api.md](03-detail-api.md)    |
| **품질 점수 계산**     | (내부 로직, 크론 작업)                         | [04-quality-system.md](04-quality-system.md) |
| **추천 스터디 설정**   | `POST /api/admin/studies/:id/feature`          | [05-featured-system.md](05-featured-system.md) |
| **스터디 삭제**        | `DELETE /api/admin/studies/:id`                | [06-moderation.md](06-moderation.md)    |
| **공개/비공개 전환**   | `PATCH /api/admin/studies/:id/visibility`      | [06-moderation.md](06-moderation.md)    |
| **소유자 위임**        | `POST /api/admin/studies/:id/transfer-owner`   | [06-moderation.md](06-moderation.md)    |

---

**작성일**: 2025-11-28
