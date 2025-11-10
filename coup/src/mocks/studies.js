// 스터디 관련 Mock 데이터

export const mockStudies = [
  {
    id: 1,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.',
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    members: { current: 12, max: 20 },
    tags: ['알고리즘', '코딩테스트', '매일'],
    rating: 4.8,
    isRecruiting: true,
    owner: '김철수',
    createdAt: '2024-10-01',
  },
  {
    id: 2,
    emoji: '🎨',
    name: 'UI/UX 디자인 스터디',
    description: '실무 프로젝트를 통해 UI/UX 디자인 역량을 키우는 스터디',
    category: '디자인',
    subCategory: 'UI/UX',
    members: { current: 8, max: 15 },
    tags: ['피그마', 'UI', 'UX'],
    rating: 4.6,
    isRecruiting: true,
    owner: '이영희',
    createdAt: '2024-10-05',
  },
  {
    id: 3,
    emoji: '📱',
    name: '앱 개발 스터디',
    description: 'React Native로 모바일 앱을 함께 만들어요',
    category: '프로그래밍',
    subCategory: '모바일',
    members: { current: 15, max: 15 },
    tags: ['React Native', '앱개발'],
    rating: 4.9,
    isRecruiting: false,
    owner: '박민수',
    createdAt: '2024-09-20',
  },
  {
    id: 4,
    emoji: '💼',
    name: '취업 준비 스터디',
    description: '함께 이력서와 면접을 준비하는 스터디',
    category: '취업',
    subCategory: '면접준비',
    members: { current: 10, max: 15 },
    tags: ['취업', '면접', '자소서'],
    rating: 4.7,
    isRecruiting: true,
    owner: '최지훈',
    createdAt: '2024-10-10',
  },
  {
    id: 5,
    emoji: '🌐',
    name: '영어 회화 스터디',
    description: '주 3회 화상으로 영어 회화 연습',
    category: '어학',
    subCategory: '영어',
    members: { current: 10, max: 15 },
    tags: ['영어', '회화', '화상'],
    rating: 4.5,
    isRecruiting: true,
    owner: '정수진',
    createdAt: '2024-10-08',
  },
  {
    id: 6,
    emoji: '📊',
    name: '데이터 분석 스터디',
    description: 'Python을 활용한 데이터 분석 및 시각화',
    category: '프로그래밍',
    subCategory: '데이터분석',
    members: { current: 6, max: 12 },
    tags: ['Python', '데이터분석', 'Pandas'],
    rating: 4.6,
    isRecruiting: true,
    owner: '강민지',
    createdAt: '2024-10-12',
  },
];

export const mockMyStudies = [
  {
    id: 1,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디',
    role: 'OWNER',
    members: { current: 12, max: 20 },
    lastActivity: '1시간 전',
    newMessages: 5,
    newNotices: 2,
  },
  {
    id: 2,
    emoji: '🎨',
    name: 'UI/UX 디자인 스터디',
    description: '실무 프로젝트를 통해 UI/UX 디자인 역량을 키우는 스터디',
    role: 'ADMIN',
    members: { current: 8, max: 15 },
    lastActivity: '3시간 전',
    newMessages: 0,
    newNotices: 0,
  },
  {
    id: 3,
    emoji: '🌐',
    name: '영어 회화 스터디',
    description: '주 3회 화상으로 영어 회화 연습',
    role: 'MEMBER',
    members: { current: 10, max: 15 },
    lastActivity: '1일 전',
    newMessages: 3,
    newNotices: 1,
  },
];

export const categories = [
  { id: 'all', label: '전체', icon: '📚' },
  { id: 'programming', label: '프로그래밍', icon: '💻' },
  { id: 'design', label: '디자인', icon: '🎨' },
  { id: 'language', label: '어학', icon: '🌐' },
  { id: 'career', label: '취업', icon: '💼' },
  { id: 'certificate', label: '자격증', icon: '📜' },
  { id: 'exercise', label: '운동', icon: '🏃' },
  { id: 'reading', label: '독서', icon: '📖' },
];

export const popularStudies = [
  { id: 1, name: '알고리즘 정복', category: '프로그래밍', members: { current: 15, max: 20 } },
  { id: 2, name: '면접 대비 스터디', category: '취업준비', members: { current: 18, max: 20 } },
  { id: 3, name: '영어 회화 모임', category: '어학', members: { current: 12, max: 15 } },
];

export const studyStats = {
  activeStudies: 1234,
  totalMembers: 5678,
  todayCreated: 12,
};

export const studyTips = [
  {
    title: '명확한 목표 설정',
    description: '3개월 안에 알고리즘 100문제',
  },
  {
    title: '정기적인 모임',
    description: '주 2-3회 고정 일정',
  },
  {
    title: '작은 그룹 유지',
    description: '5-10명이 가장 효과적',
  },
];

export const urgentTasks = [
  {
    id: 1,
    studyName: '알고리즘',
    title: '백준 1234번',
    dDay: 1,
    date: '2025-11-11',
  },
  {
    id: 2,
    studyName: '취업준비',
    title: '자소서 1차 작성',
    dDay: 2,
    date: '2025-11-12',
  },
  {
    id: 3,
    studyName: '알고리즘',
    title: '코드 리뷰 준비',
    dDay: 3,
    date: '2025-11-13',
  },
];

export const upcomingEvents = [
  {
    id: 1,
    studyName: '알고리즘',
    title: '주간 회의',
    date: '2025-11-11',
    time: '14:00',
    dDay: 1,
  },
  {
    id: 2,
    studyName: '취업준비',
    title: '모의 면접',
    date: '2025-11-12',
    time: '20:00',
    dDay: 2,
  },
  {
    id: 3,
    studyName: '영어회화',
    title: '과제 제출',
    date: '2025-11-14',
    time: '23:59',
    dDay: 4,
  },
];

export const myActivitySummary = {
  totalStudies: 4,
  managingStudies: 1,
  unreadMessages: 7,
  newNotices: 2,
  newFiles: 3,
  weeklyAttendance: { current: 5, total: 7 },
  completedTasks: 12,
  chatMessages: 42,
};

