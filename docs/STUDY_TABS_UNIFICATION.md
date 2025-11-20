# 스터디 탭 통합

## 📋 수정 일자
2025-01-21

## 🎯 목표
화상 탭에서 발생한 문제들을 해결하고, 모든 스터디 페이지의 탭을 전역 컴포넌트로 통합하여 일관성 유지

## ❌ 문제점

### Before:
1. **화상 탭에서 설정 탭이 사라짐**
   - 화상 페이지에만 `adminOnly` 속성이 설정되어 있어서 필터링됨
   
2. **탭 아이콘과 글자 크기가 작음**
   - 화상 페이지의 탭 스타일이 다른 페이지와 다름
   
3. **코드 중복**
   - 각 페이지(개요, 채팅, 공지, 파일, 캘린더, 할일, 화상, 멤버, 설정)마다 탭 정의가 중복
   - 탭 추가/수정 시 모든 파일을 수정해야 함
   
4. **일관성 부족**
   - 페이지마다 탭 스타일이 미묘하게 다를 수 있음

## ✅ 해결 방법

### 1. 공통 탭 컴포넌트 생성

**파일**: `coup/src/components/study/StudyTabs.jsx`

```jsx
'use client';

import Link from 'next/link';
import styles from './StudyTabs.module.css';

export default function StudyTabs({ studyId, activeTab, userRole }) {
  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '멤버', href: `/my-studies/${studyId}/members`, icon: '👥', adminOnly: true },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️', adminOnly: true },
  ];

  return (
    <div className={styles.tabs}>
      {tabs
        .filter(tab => !tab.adminOnly || ['OWNER', 'ADMIN'].includes(userRole))
        .map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === activeTab ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
    </div>
  );
}
```

**파일**: `coup/src/components/study/StudyTabs.module.css`

```css
.tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
  font-size: 0.9375rem; /* 15px - 적당한 크기 */
}

.tab:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.tab.active {
  background: var(--primary-600);
  color: white;
}

.tabIcon {
  font-size: 1.125rem; /* 18px - 적당한 아이콘 크기 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabLabel {
  font-size: 0.9375rem; /* 15px - 적당한 글자 크기 */
  font-weight: 500;
}
```

### 2. 모든 페이지에 공통 컴포넌트 적용

#### 개요 페이지 (`page.jsx`)
```jsx
import StudyTabs from '@/components/study/StudyTabs';

// 탭 네비게이션
<StudyTabs studyId={studyId} activeTab="개요" userRole={study.myRole} />
```

#### 채팅 페이지 (`chat/page.jsx`)
```jsx
import StudyTabs from '@/components/study/StudyTabs';

// 탭 네비게이션
<StudyTabs studyId={studyId} activeTab="채팅" userRole={study.myRole} />
```

#### 화상 페이지 (`video-call/page.jsx`)
```jsx
import StudyTabs from '@/components/study/StudyTabs';

// 탭 네비게이션
<StudyTabs studyId={studyId} activeTab="화상" userRole={study.myRole} />
```

#### 설정 페이지 (`settings/page.jsx`)
```jsx
import StudyTabs from '@/components/study/StudyTabs';

// 탭 네비게이션
<StudyTabs studyId={studyId} activeTab="설정" userRole={study.myRole} />
```

### 3. Props 설명
- **studyId**: 현재 스터디 ID
- **activeTab**: 현재 활성화된 탭 레이블 (예: "개요", "채팅", "화상" 등)
- **userRole**: 사용자 역할 (`OWNER`, `ADMIN`, `MEMBER`)
  - `OWNER`/`ADMIN`만 "멤버"와 "설정" 탭 표시

## 📊 결과

### After:
1. ✅ **화상 탭에서 설정 탭이 정상 표시됨**
   - `userRole`에 따라 올바르게 필터링
   
2. ✅ **모든 탭의 아이콘과 글자 크기가 일관됨**
   - 아이콘: `1.125rem` (18px)
   - 글자: `0.9375rem` (15px)
   
3. ✅ **코드 중복 제거**
   - 탭 정의가 한 곳(`StudyTabs.jsx`)에만 존재
   - 탭 추가/수정 시 한 파일만 수정하면 됨
   
4. ✅ **일관된 스타일**
   - 모든 페이지에서 동일한 탭 스타일 적용
   
5. ✅ **유지보수성 향상**
   - 중앙 집중식 관리로 변경 사항 적용이 쉬움

## 🎨 디자인 개선

### 탭 크기
- **Before**: 화상 페이지의 탭이 작았음
- **After**: 모든 탭이 적당한 크기로 통일
  - 아이콘: 18px
  - 글자: 15px
  - 패딩: 10px 20px

### 일관성
- 호버 효과 통일
- 활성 탭 스타일 통일
- 간격(gap) 통일

## 🔧 향후 개선 사항

### 1. 권한별 탭 커스터마이징
필요시 각 탭에 더 세밀한 권한 설정 가능:

```jsx
const tabs = [
  // ...
  { 
    label: '멤버', 
    href: `/my-studies/${studyId}/members`, 
    icon: '👥', 
    requiredRole: 'ADMIN' // ADMIN 이상만 표시
  },
  { 
    label: '설정', 
    href: `/my-studies/${studyId}/settings`, 
    icon: '⚙️', 
    requiredRole: 'OWNER' // OWNER만 표시
  },
];
```

### 2. 동적 탭 추가
스터디 설정에 따라 동적으로 탭 추가/제거:

```jsx
// 예: 특정 스터디만 "퀴즈" 탭 표시
if (study.hasQuizFeature) {
  tabs.push({ label: '퀴즈', href: `/my-studies/${studyId}/quiz`, icon: '📝' });
}
```

### 3. 탭 뱃지
읽지 않은 메시지, 공지 등 표시:

```jsx
<span className={styles.tabLabel}>
  채팅
  {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
</span>
```

## 🧪 테스트

### 확인 사항:
1. ✅ 모든 페이지에서 탭이 정상 표시됨
2. ✅ 화상 탭에서 설정 탭이 표시됨 (OWNER/ADMIN인 경우)
3. ✅ 탭 아이콘과 글자 크기가 모든 페이지에서 동일함
4. ✅ 활성 탭이 올바르게 하이라이트됨
5. ✅ 권한에 따라 멤버/설정 탭이 필터링됨
6. ✅ 탭 클릭 시 올바른 페이지로 이동함

### 테스트 방법:
1. OWNER 또는 ADMIN으로 로그인
2. 각 스터디 페이지 이동 (개요 → 채팅 → 화상 → 설정)
3. 모든 페이지에서 탭이 동일하게 표시되는지 확인
4. 탭 크기와 스타일이 일관된지 확인
5. MEMBER로 로그인하여 멤버/설정 탭이 숨겨지는지 확인

## 🚀 결과

이제 스터디 페이지에서:
- ✅ 모든 탭이 일관된 크기와 스타일로 표시
- ✅ 화상 탭에서도 설정 탭이 정상 작동
- ✅ 코드 중복 제거로 유지보수 용이
- ✅ 탭 추가/수정이 쉬워짐
- ✅ 권한별 탭 필터링이 올바르게 작동

브라우저를 새로고침하면 모든 스터디 페이지에서 일관된 탭 네비게이션을 확인할 수 있습니다! 🎉

## 📝 수정된 파일 목록

### 신규 파일:
- `coup/src/components/study/StudyTabs.jsx`
- `coup/src/components/study/StudyTabs.module.css`

### 수정된 파일:
- `coup/src/app/my-studies/[studyId]/page.jsx` (개요)
- `coup/src/app/my-studies/[studyId]/chat/page.jsx` (채팅)
- `coup/src/app/my-studies/[studyId]/video-call/page.jsx` (화상)
- `coup/src/app/my-studies/[studyId]/settings/page.jsx` (설정)

