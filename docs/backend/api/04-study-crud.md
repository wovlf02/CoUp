# 스터디 핵심 API 명세 - Part 1: CRUD

## 📋 개요
- **Base URL**: `/api/studies`
- **총 엔드포인트**: 13개
- **인증**: 대부분 필요, 목록/상세는 조건부

---

## 📚 1. 스터디 목록 조회
**GET** `/api/studies`

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | 카테고리 필터 (`프로그래밍`, `취업` 등) |
| `search` | string | - | 제목/설명 검색 |
| `isRecruiting` | boolean | - | 모집 중 필터 |
| `sortBy` | string | `latest` | `latest`, `popular`, `rating` |
| `page` | number | `1` | 페이지 번호 |
| `limit` | number | `12` | 페이지당 개수 |

### Example Request
```
GET /api/studies?category=프로그래밍&isRecruiting=true&sortBy=popular&page=1&limit=12
```

### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "study-1",
      "name": "알고리즘 마스터 스터디",
      "emoji": "💻",
      "description": "매일 알고리즘 문제를 풀고 서로의 풀이를 공유합니다",
      "category": "프로그래밍",
      "subCategory": "알고리즘/코테",
      "tags": ["알고리즘", "코딩테스트", "백준"],
      "maxMembers": 20,
      "currentMembers": 15,
      "isRecruiting": true,
      "rating": 4.8,
      "reviewCount": 15,
      "owner": {
        "id": "user-1",
        "name": "김민준",
        "avatar": "https://..."
      },
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "totalPages": 4
  }
}
```

### 정렬 옵션
- **latest**: 최신 생성순
- **popular**: 멤버 수 많은 순
- **rating**: 평점 높은 순

---

## 📝 2. 스터디 생성
**POST** `/api/studies`

🔒 **인증 필요**

### Request Body
```json
{
  "name": "TypeScript 심화 스터디",
  "emoji": "📘",
  "description": "TypeScript 고급 타입 시스템을 학습합니다",
  "category": "프로그래밍",
  "subCategory": "프론트엔드",
  "maxMembers": 15,
  "isPublic": true,
  "autoApprove": false,
  "tags": ["TypeScript", "타입", "고급"]
}
```

### Validation
- `name`: 2-50자, 필수
- `emoji`: 이모지 1개, 선택 (기본값: 📚)
- `description`: 10-500자, 필수
- `category`: 필수
- `maxMembers`: 5-100, 선택 (기본값: 20)
- `isPublic`: 선택 (기본값: true)
- `autoApprove`: 선택 (기본값: false)
- `tags`: 배열, 최대 5개

### Response (201)
```json
{
  "success": true,
  "message": "스터디가 생성되었습니다",
  "data": {
    "id": "new-study-id",
    "name": "TypeScript 심화 스터디",
    "emoji": "📘",
    // ... 전체 스터디 정보
    "inviteCode": "ABC123" // 자동 생성
  }
}
```

### 자동 처리
1. `inviteCode` 자동 생성 (6자리)
2. 생성자를 OWNER로 자동 추가
3. `isRecruiting` = true (기본값)

---

## 🔍 3. 스터디 상세 조회
**GET** `/api/studies/[id]`

### Response (200) - 비멤버
```json
{
  "success": true,
  "data": {
    "id": "study-1",
    "name": "알고리즘 마스터 스터디",
    "emoji": "💻",
    "description": "...",
    "category": "프로그래밍",
    "subCategory": "알고리즘/코테",
    "tags": ["알고리즘", "코딩테스트"],
    "maxMembers": 20,
    "currentMembers": 15,
    "isPublic": true,
    "isRecruiting": true,
    "rating": 4.8,
    "reviewCount": 15,
    "owner": {
      "id": "user-1",
      "name": "김민준",
      "avatar": "https://..."
    },
    "createdAt": "2025-10-01T10:00:00.000Z",
    "isMember": false,
    "myRole": null
  }
}
```

### Response (200) - 멤버
```json
{
  "success": true,
  "data": {
    // ... 위 정보 +
    "isMember": true,
    "myRole": "MEMBER",
    "inviteCode": "ABC123",
    "autoApprove": false,
    "members": [
      {
        "id": "member-1",
        "role": "OWNER",
        "user": {
          "id": "user-1",
          "name": "김민준",
          "avatar": "https://..."
        },
        "joinedAt": "2025-10-01T10:00:00.000Z"
      }
      // ... 전체 멤버
    ],
    "counts": {
      "notices": 12,
      "files": 8
    }
  }
}
```

### 정보 제한
- **비멤버**: 기본 정보만
- **멤버**: 초대 코드, 멤버 목록, 상세 통계 포함

---

## ✏️ 4. 스터디 수정
**PATCH** `/api/studies/[id]`

🔒 **OWNER만 가능**

### Request Body
```json
{
  "name": "알고리즘 고급 스터디",
  "description": "수정된 설명...",
  "maxMembers": 25,
  "isRecruiting": false,
  "tags": ["알고리즘", "고급", "PS"]
}
```

### 수정 가능 필드
- `name`, `emoji`, `description`
- `category`, `subCategory`
- `maxMembers`
- `isPublic`, `autoApprove`, `isRecruiting`
- `tags`

### 수정 불가 필드
- `id`, `ownerId`, `inviteCode`
- `createdAt`, `rating`, `reviewCount`

### Response (200)
```json
{
  "success": true,
  "message": "스터디 정보가 수정되었습니다",
  "data": {
    // 수정된 스터디 정보
  }
}
```

---

## 🗑️ 5. 스터디 삭제
**DELETE** `/api/studies/[id]`

🔒 **OWNER만 가능**

### Response (200)
```json
{
  "success": true,
  "message": "스터디가 삭제되었습니다"
}
```

### CASCADE 삭제
스터디 삭제 시 자동으로 함께 삭제:
- StudyMember (멤버십)
- Notice (공지사항)
- Event (일정)
- File (파일)
- Message (채팅 메시지)

---

## 🎨 카테고리 목록

### 메인 카테고리
```javascript
[
  '프로그래밍',
  '취업',
  '어학',
  '자격증',
  '독서',
  '취미',
  '운동',
  '기타'
]
```

### 서브 카테고리 예시
```javascript
{
  '프로그래밍': [
    '알고리즘/코테',
    '프론트엔드',
    '백엔드',
    'AI/ML',
    '앱 개발',
    'CS'
  ],
  '어학': [
    '영어',
    '일본어',
    '중국어',
    '기타'
  ]
}
```

---

## 📊 검색 알고리즘

### 검색 우선순위
1. 제목 완전 일치
2. 제목 부분 일치
3. 설명 부분 일치
4. 태그 일치

### 검색 쿼리
```javascript
where: {
  OR: [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { tags: { has: search } }
  ]
}
```

---

## 📝 Client Usage 예시

### 스터디 목록
```javascript
import { useStudies } from '@/lib/hooks/useApi'

function StudiesPage() {
  const [filters, setFilters] = useState({
    category: '',
    isRecruiting: true,
    sortBy: 'latest'
  })

  const { data, isLoading } = useStudies(filters)

  return (
    <div>
      <Filters filters={filters} onChange={setFilters} />
      <StudyGrid studies={data.data} />
      <Pagination {...data.pagination} />
    </div>
  )
}
```

### 스터디 생성
```javascript
import { useCreateStudy } from '@/lib/hooks/useApi'

function CreateStudyPage() {
  const createStudy = useCreateStudy()

  const handleSubmit = async (formData) => {
    try {
      const result = await createStudy.mutateAsync(formData)
      router.push(`/my-studies/${result.data.id}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return <StudyForm onSubmit={handleSubmit} />
}
```

---

**최종 업데이트**: 2025-11-18  
**다음 파일**: [04-study-members.md](./04-study-members.md) (멤버 관리)

