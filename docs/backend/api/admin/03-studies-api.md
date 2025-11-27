# 스터디 관리 API

> **Base URL**: `/api/admin/studies`

## 엔드포인트

### 1. 스터디 목록
```
GET /api/admin/studies
```

### 2. 스터디 상세
```
GET /api/admin/studies/:studyId
```

### 3. 스터디 숨김
```
POST /api/admin/studies/:studyId/hide
```

### 4. 스터디 종료
```
POST /api/admin/studies/:studyId/close
```

### 5. 추천 스터디 지정
```
POST /api/admin/studies/:studyId/recommend
```

### 6. 콘텐츠 삭제
```
DELETE /api/admin/studies/:studyId/messages/:messageId
DELETE /api/admin/studies/:studyId/files/:fileId
```
