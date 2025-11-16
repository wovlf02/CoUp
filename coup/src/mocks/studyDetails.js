// 스터디 상세 정보 Mock 데이터

export const studyPreviewData = {
  1: {
    id: 1,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다. 백준, 프로그래머스 등 다양한 플랫폼의 문제를 다루며, 코드 리뷰를 통해 더 나은 풀이를 찾아갑니다.',
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    rating: 4.8,
    isRecruiting: true,
    members: { current: 12, max: 20 },
    activityFrequency: '매일',
    approvalType: 'auto', // 'auto' | 'manual'
    tags: ['알고리즘', '코딩테스트', '매일', '백준', '프로그래머스'],
    owner: {
      name: '김철수',
      role: 'OWNER',
      imageUrl: '/avatars/user1.jpg',
    },
    rules: [
      '매일 오전 9시까지 문제를 공유합니다.',
      '자신의 풀이를 반드시 커밋해야 합니다.',
      '다른 사람의 코드를 리뷰하고 피드백을 남깁니다.',
      '주 2회 이상 불참 시 경고를 받습니다.',
      '서로 존중하고 배려하는 분위기를 유지합니다.',
    ],
    curriculum: [
      { week: 1, topic: '기본 자료구조 (배열, 스택, 큐)' },
      { week: 2, topic: '정렬과 이진 탐색' },
      { week: 3, topic: '재귀와 백트래킹' },
      { week: 4, topic: '다이나믹 프로그래밍' },
      { week: 5, topic: '그래프 기초 (DFS, BFS)' },
      { week: 6, topic: '최단 경로 알고리즘' },
    ],
    schedule: {
      regular: [
        { day: '월-금', time: '09:00', activity: '문제 공유 및 풀이' },
        { day: '수', time: '20:00', activity: '주간 코드 리뷰 (화상)' },
        { day: '토', time: '14:00', activity: '모의 코딩테스트' },
      ],
    },
    recentNotices: [
      {
        id: 1,
        title: '이번 주 모의 코딩테스트 안내',
        date: '2025.11.15',
        isPinned: true,
      },
      {
        id: 2,
        title: '11월 3주차 문제 리스트',
        date: '2025.11.13',
        isPinned: false,
      },
    ],
    members: [
      { id: 1, name: '김철수', role: 'OWNER', imageUrl: '/avatars/user1.jpg' },
      { id: 2, name: '이영희', role: 'ADMIN', imageUrl: '/avatars/user2.jpg' },
      { id: 3, name: '박민수', role: 'MEMBER', imageUrl: '/avatars/user3.jpg' },
      { id: 4, name: '최지은', role: 'MEMBER', imageUrl: '/avatars/user4.jpg' },
      { id: 5, name: '정소현', role: 'MEMBER', imageUrl: '/avatars/user5.jpg' },
    ],
    stats: {
      totalProblems: 156,
      avgAttendance: 92,
      activeMembers: 12,
      completionRate: 87,
    },
  },
  2: {
    id: 2,
    emoji: '🎨',
    name: 'UI/UX 디자인 스터디',
    description: '실무 프로젝트를 통해 UI/UX 디자인 역량을 키우는 스터디입니다. Figma를 활용한 디자인 실습과 사용자 경험 개선에 대해 학습합니다.',
    category: '디자인',
    subCategory: 'UI/UX',
    rating: 4.6,
    isRecruiting: true,
    members: { current: 8, max: 15 },
    activityFrequency: '주 3회',
    approvalType: 'manual',
    tags: ['피그마', 'UI', 'UX', '프로토타입', '디자인시스템'],
    owner: {
      name: '이영희',
      role: 'OWNER',
      imageUrl: '/avatars/user2.jpg',
    },
    rules: [
      '주 3회 정기 모임에 참석합니다.',
      '매주 디자인 과제를 제출합니다.',
      '피드백은 건설적으로 제공합니다.',
      '디자인 시스템 가이드를 준수합니다.',
    ],
    curriculum: [
      { week: 1, topic: 'UI 기초 및 Figma 입문' },
      { week: 2, topic: '컴포넌트 및 디자인 시스템' },
      { week: 3, topic: '사용자 리서치 및 페르소나' },
      { week: 4, topic: '와이어프레임 및 프로토타입' },
      { week: 5, topic: '인터랙션 디자인' },
      { week: 6, topic: '실무 프로젝트 진행' },
    ],
    schedule: {
      regular: [
        { day: '화', time: '19:00', activity: '디자인 실습' },
        { day: '목', time: '19:00', activity: '피드백 세션' },
        { day: '토', time: '15:00', activity: '프로젝트 진행' },
      ],
    },
    recentNotices: [
      {
        id: 1,
        title: '이번 주 과제: 로그인 화면 디자인',
        date: '2025.11.14',
        isPinned: true,
      },
    ],
    members: [
      { id: 2, name: '이영희', role: 'OWNER', imageUrl: '/avatars/user2.jpg' },
      { id: 6, name: '강민지', role: 'ADMIN', imageUrl: '/avatars/user6.jpg' },
      { id: 7, name: '윤서준', role: 'MEMBER', imageUrl: '/avatars/user7.jpg' },
    ],
    stats: {
      totalProblems: 48,
      avgAttendance: 89,
      activeMembers: 8,
      completionRate: 91,
    },
  },
  3: {
    id: 3,
    emoji: '📱',
    name: '앱 개발 스터디',
    description: 'React Native로 모바일 앱을 함께 만들어요. 크로스 플랫폼 앱 개발의 기초부터 실전 배포까지 학습합니다.',
    category: '프로그래밍',
    subCategory: '모바일',
    rating: 4.9,
    isRecruiting: false,
    members: { current: 15, max: 15 },
    activityFrequency: '주 4회',
    approvalType: 'manual',
    tags: ['React Native', '앱개발', '크로스플랫폼', '모바일'],
    owner: {
      name: '박민수',
      role: 'OWNER',
      imageUrl: '/avatars/user3.jpg',
    },
    rules: [
      '주 4회 정기 모임 필수 참석',
      '코드 리뷰 적극 참여',
      '프로젝트 마일스톤 준수',
      '커뮤니케이션 활발히 하기',
    ],
    curriculum: [
      { week: 1, topic: 'React Native 환경 설정' },
      { week: 2, topic: '컴포넌트 및 스타일링' },
      { week: 3, topic: '네비게이션 및 라우팅' },
      { week: 4, topic: '상태 관리 (Redux/Context)' },
      { week: 5, topic: 'API 연동 및 데이터 관리' },
      { week: 6, topic: '네이티브 모듈 및 배포' },
    ],
    schedule: {
      regular: [
        { day: '월', time: '20:00', activity: '코드 리뷰' },
        { day: '화', time: '20:00', activity: '개발 실습' },
        { day: '목', time: '20:00', activity: '프로젝트 진행' },
        { day: '토', time: '14:00', activity: '스프린트 회고' },
      ],
    },
    recentNotices: [
      {
        id: 1,
        title: '프로젝트 1차 배포 완료',
        date: '2025.11.15',
        isPinned: true,
      },
    ],
    members: [
      { id: 3, name: '박민수', role: 'OWNER', imageUrl: '/avatars/user3.jpg' },
    ],
    stats: {
      totalProblems: 72,
      avgAttendance: 95,
      activeMembers: 15,
      completionRate: 88,
    },
  },
};

// 스터디 가입 데이터 추가
export const studyJoinData = {
  1: {
    id: 1,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    memberCount: 12,
    maxMembers: 20,
    autoApprove: true,
    rating: 4.8,
    reviewCount: 24,
    rules: [
      '매일 오전 9시까지 문제를 공유합니다.',
      '자신의 풀이를 반드시 커밋해야 합니다.',
      '다른 사람의 코드를 리뷰하고 피드백을 남깁니다.',
      '주 2회 이상 불참 시 경고를 받습니다.',
      '서로 존중하고 배려하는 분위기를 유지합니다.',
    ],
  },
};
