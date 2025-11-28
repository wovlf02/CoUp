# 사용자 상세 페이지
- Dynamic Import로 모달 지연 로딩
- 액션은 Client Component
- 각 탭은 별도 컴포넌트로 분리 (~150줄)
- Server Component로 초기 데이터 로딩

## 최적화

```
}
  )
    </div>
      <ActionPanel user={user} />
      
      </Tabs>
        </Tab>
          <SanctionHistory userId={user.id} />
        <Tab label="제재 이력">
        </Tab>
          <UserActivity userId={user.id} />
        <Tab label="활동 내역">
      <Tabs>
      
      <UserProfile user={user} />
    <div className={styles.userDetail}>
  return (
  
  const user = await getUserDetail(params.userId)
export default async function UserDetailPage({ params }) {
// page.jsx
```jsx

## 구현 예시

- 비밀번호 초기화
- 계정 삭제
- 계정 정지/해제
- 경고 발급
### 3. 빠른 액션

- **신고 이력**: 신고한/받은 신고
- **제재 이력**: 경고, 정지 기록
- **참여 스터디**: 소유/참여 스터디 목록
- **활동 내역**: 최근 활동 타임라인
- **기본 정보**: 프로필 및 통계
### 2. 탭 구조

- 통계 (스터디, 메시지, 활동)
- 계정 상태
- 아바타 이미지
- 기본 정보 (이름, 이메일, 가입일)
### 1. 사용자 프로필

## 주요 기능

```
    └── ActionPanel.jsx        # 액션 패널 (~100줄)
    ├── SanctionHistory.jsx    # 제재 이력 (~120줄)
    ├── UserActivity.jsx       # 활동 내역 (~150줄)
    ├── UserProfile.jsx        # 프로필 영역 (~100줄)
└── _components/
├── loading.jsx
├── page.jsx                    # 상세 페이지 (~150줄)
src/app/admin/users/[userId]/
```

## 📁 파일 구조

> 개별 사용자의 상세 정보 및 관리


