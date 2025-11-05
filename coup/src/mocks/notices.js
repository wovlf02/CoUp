// Mock 공지사항 데이터

export const mockNotices = [
  {
    id: 1,
    title: '이번 주 스터디 일정 안내',
    content: `## 이번 주 일정

- **월요일**: 알고리즘 문제 풀이
- **수요일**: 코드 리뷰
- **금요일**: 모의 코딩테스트

모두 참여 부탁드립니다! 🙏

### 준비사항
1. 백준 문제 3개 이상 풀고 오기
2. 자신의 코드 GitHub에 올리기
3. 코드 리뷰 준비

질문 있으시면 댓글 남겨주세요!`,
    authorId: 1,
    authorName: '김철수',
    authorImage: null,
    studyId: 1,
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: '알고리즘 문제 추천 목록',
    content: `# 이번 주 추천 문제

## 난이도: 중

1. **[백준 1920] 수 찾기**
   - 이진 탐색 기초
   - 예상 소요 시간: 30분

2. **[백준 2805] 나무 자르기**
   - 파라메트릭 서치
   - 예상 소요 시간: 1시간

3. **[백준 1654] 랜선 자르기**
   - 이진 탐색 응용
   - 예상 소요 시간: 45분

\`\`\`python
# 이진 탐색 템플릿
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
\`\`\`

화이팅! 💪`,
    authorId: 2,
    authorName: '이영희',
    authorImage: null,
    studyId: 1,
    isPinned: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: '참고 자료 공유',
    content: `## 유용한 학습 자료

### 알고리즘 개념 정리
- [바킹독의 실전 알고리즘](https://blog.encrypted.gg/category/%EA%B0%95%EC%A2%8C/%EC%8B%A4%EC%A0%84%20%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)
- [Visualgo - 알고리즘 시각화](https://visualgo.net/)

### 코딩테스트 준비
- [프로그래머스](https://programmers.co.kr/)
- [백준](https://www.acmicpc.net/)
- [LeetCode](https://leetcode.com/)

### 추천 도서
1. 📘 **종만북** - 프로그래밍 대회에서 배우는 알고리즘 문제해결전략
2. 📕 **이것이 취업을 위한 코딩 테스트다**

다들 열심히 하시는 것 같아서 도움 될만한 자료 공유합니다!`,
    authorId: 3,
    authorName: '박민수',
    authorImage: null,
    studyId: 1,
    isPinned: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: '스터디 규칙 안내',
    content: `# 📋 스터디 규칙

## 출석 체크
- 매주 월/수/금 오후 8시
- 3회 이상 불참 시 경고
- 사전 공지 없이 5회 불참 시 강퇴

## 과제 제출
- 매주 일요일 자정까지
- GitHub 링크로 제출
- 미제출 2회 시 경고

## 코드 리뷰
- 최소 2명 이상의 코드 리뷰 필수
- 건설적인 피드백 부탁드립니다

## 커뮤니케이션
- 질문은 언제든 환영
- 답변은 24시간 내에
- 존중하는 태도로 소통

위 규칙을 지켜주시기 바랍니다! 😊`,
    authorId: 1,
    authorName: '김철수',
    authorImage: null,
    studyId: 1,
    isPinned: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    title: '다음 주 모의 코딩테스트 안내',
    content: `## 🎯 모의 코딩테스트

### 일시
- **날짜**: 2025년 11월 12일 (금)
- **시간**: 오후 8시 ~ 10시 (2시간)

### 플랫폼
- 프로그래머스 (레벨 2~3)

### 진행 방식
1. 문제 3개 출제
2. 각자 풀이 후 제출
3. 풀이 공유 및 피드백

### 주의사항
- 시간 엄수
- 검색 금지 (알고리즘 개념 제외)
- 솔직하게 참여

다들 준비 잘 해서 좋은 결과 있기를 바랍니다! 🚀`,
    authorId: 2,
    authorName: '이영희',
    authorImage: null,
    studyId: 1,
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
]

// 스터디별 공지사항 필터링
export const getNoticesByStudyId = (studyId) => {
  return mockNotices
    .filter(notice => notice.studyId === studyId)
    .sort((a, b) => {
      // 고정 공지가 먼저
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      // 그 다음은 최신순
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
}

// 공지사항 단일 조회
export const getNoticeById = (noticeId) => {
  return mockNotices.find(notice => notice.id === noticeId)
}

// 공지사항 생성
export const createNotice = (studyId, data) => {
  const newNotice = {
    id: mockNotices.length + 1,
    title: data.title,
    content: data.content,
    authorId: 1, // 현재 사용자 (임시)
    authorName: '김철수',
    authorImage: null,
    studyId,
    isPinned: data.isPinned || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  mockNotices.push(newNotice)
  return newNotice
}

// 공지사항 수정
export const updateNotice = (noticeId, data) => {
  const index = mockNotices.findIndex(notice => notice.id === noticeId)
  if (index === -1) return null

  mockNotices[index] = {
    ...mockNotices[index],
    ...data,
    updatedAt: new Date().toISOString()
  }
  return mockNotices[index]
}

// 공지사항 삭제
export const deleteNotice = (noticeId) => {
  const index = mockNotices.findIndex(notice => notice.id === noticeId)
  if (index === -1) return false

  mockNotices.splice(index, 1)
  return true
}

