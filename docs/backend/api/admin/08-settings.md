# 시스템 설정 API

> **작성일**: 2025-11-26

---

## 1. 카테고리 목록

### `GET /api/admin/settings/categories`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat-1",
        "name": "프로그래밍",
        "emoji": "💻",
        "order": 1,
        "isActive": true,
        "studyCount": 80
      }
    ]
  }
}
```

---

## 2. 카테고리 생성

### `POST /api/admin/settings/categories`

#### Request Body
```json
{
  "name": "새 카테고리",
  "emoji": "🎨",
  "order": 7
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat-7",
      "name": "새 카테고리",
      "emoji": "🎨",
      "order": 7
    }
  },
  "message": "카테고리가 생성되었습니다."
}
```

---

## 3. 카테고리 수정

### `PATCH /api/admin/settings/categories/:id`

---

## 4. 카테고리 삭제

### `DELETE /api/admin/settings/categories/:id`

---

## 5. 시스템 설정 조회

### `GET /api/admin/settings/system`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "maxFileSize": 10485760,
    "maxStudyMembers": 100,
    "allowNewSignups": true
  }
}
```

---

## 6. 시스템 설정 변경

### `PATCH /api/admin/settings/system`

#### Request Body
```json
{
  "maxFileSize": 20971520,
  "maxStudyMembers": 150
}
```

---

**완료**: API 명세 전체 작성 완료

