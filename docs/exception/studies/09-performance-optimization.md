# 성능 최적화

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🟡 중간

---

## 📋 목차

- [쿼리 최적화](#쿼리-최적화)
- [N+1 문제 해결](#n1-문제-해결)
- [렌더링 최적화](#렌더링-최적화)
- [이미지 최적화](#이미지-최적화)

---

## 쿼리 최적화

### ✅ include vs select

```javascript
// ❌ 나쁜 예: 모든 필드 가져오기
const study = await prisma.study.findUnique({
  where: { id },
  include: {
    owner: true,
    members: true
  }
})

// ✅ 좋은 예: 필요한 필드만
const study = await prisma.study.findUnique({
  where: { id },
  include: {
    owner: {
      select: {
        id: true,
        name: true,
        avatar: true
      }
    },
    _count: {
      select: {
        members: {
          where: { status: 'ACTIVE' }
        }
      }
    }
  }
})
```

---

## N+1 문제 해결

### ✅ include로 한번에 가져오기

```javascript
// ❌ N+1 문제
const studies = await prisma.study.findMany()

for (const study of studies) {
  // 각 스터디마다 쿼리 실행!
  study.owner = await prisma.user.findUnique({
    where: { id: study.ownerId }
  })
}

// ✅ 해결
const studies = await prisma.study.findMany({
  include: {
    owner: {
      select: {
        id: true,
        name: true,
        avatar: true
      }
    },
    _count: {
      select: {
        members: { where: { status: 'ACTIVE' } }
      }
    }
  }
})
```

---

## 렌더링 최적화

### ✅ React.memo

```javascript
// src/components/studies/StudyCard.jsx
import { memo } from 'react'

const StudyCard = memo(function StudyCard({ study }) {
  return (
    <div className="study-card">
      <h3>{study.name}</h3>
      <p>{study.description}</p>
      <span>{study.currentMembers}/{study.maxMembers}명</span>
    </div>
  )
})

export default StudyCard
```

### ✅ useMemo / useCallback

```javascript
function StudiesList({ studies }) {
  const [search, setSearch] = useState('')

  // 필터링 결과 메모이제이션
  const filteredStudies = useMemo(() => {
    return studies.filter(study =>
      study.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [studies, search])

  // 콜백 메모이제이션
  const handleSearch = useCallback((e) => {
    setSearch(e.target.value)
  }, [])

  return (
    <div>
      <input value={search} onChange={handleSearch} />
      {filteredStudies.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}
```

---

## 이미지 최적화

### ✅ Next.js Image 컴포넌트

```javascript
import Image from 'next/image'

function StudyCard({ study }) {
  return (
    <div className="study-card">
      <Image
        src={study.image || '/default-study.png'}
        alt={study.name}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL="data:image/png;base64,..."
      />
      <h3>{study.name}</h3>
    </div>
  )
}
```

---

**다음 문서**: [모범 사례](./99-best-practices.md)

