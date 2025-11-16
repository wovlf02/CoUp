// 대시보드 Mock 데이터

export const dashboardData = {
  user: {
    name: '김민준',
    avatar: null,
  },
  stats: [
    { icon: '📚', label: '참여 스터디', value: 4, color: 'blue' },
    { icon: '📢', label: '새 공지', value: 3, color: 'green' },
    { icon: '✅', label: '할 일', value: 5, color: 'orange' },
    { icon: '📅', label: '다가올 일정', value: 2, color: 'purple' },
  ],
  myStudies: [
    {
      id: 1,
      emoji: '📚',
      name: '코딩테스트 스터디',
      members: 12,
      role: 'OWNER',
      lastActivity: '1시간 전',
    },
    {
      id: 2,
      emoji: '💼',
      name: '취업 준비 스터디',
      members: 8,
      role: 'MEMBER',
      lastActivity: '3시간 전',
    },
    {
      id: 3,
      emoji: '📘',
      name: '영어 회화 스터디',
      members: 15,
      role: 'ADMIN',
      lastActivity: '5시간 전',
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: '공지',
      badge: 'notice',
      study: '코딩테스트 스터디',
      content: '이번 주 일정 공지',
      time: '2시간 전',
    },
    {
      id: 2,
      type: '할일',
      badge: 'task',
      study: '취업 준비 스터디',
      content: '자소서 1차 작성 완료',
      time: '3시간 전',
    },
    {
      id: 3,
      type: '파일',
      badge: 'file',
      study: '영어 스터디',
      content: '단어장.pdf 업로드됨',
      time: '5시간 전',
    },
    {
      id: 4,
      type: '채팅',
      badge: 'chat',
      study: '코딩테스트 스터디',
      content: '김철수: 오늘 저녁 회의 참석 가능...',
      time: '6시간 전',
    },
    {
      id: 5,
      type: '일정',
      badge: 'calendar',
      study: '취업 준비 스터디',
      content: '모의면접 (내일 오후 2시)',
      time: '1일 전',
    },
  ],
  todayTasks: [
    {
      id: 1,
      text: '백준 1234번 풀이',
      meta: '코딩테스트 • D-day',
    },
    {
      id: 2,
      text: '자소서 1차 작성',
      meta: '취업준비 • D-1',
    },
    {
      id: 3,
      text: '영어 단어 100개 암기',
      meta: '영어회화 • D-day',
    },
  ],
  upcomingEvents: [
    {
      id: 1,
      title: '주간 회의',
      study: '코딩테스트',
      day: '오늘',
      time: '14:00',
    },
    {
      id: 2,
      title: '모의 면접',
      study: '취업준비',
      day: '내일',
      time: '20:00',
    },
    {
      id: 3,
      title: '과제 제출',
      study: '영어회화',
      day: '11/11',
      time: '23:59',
    },
  ],
  studyStatus: {
    totalStudies: 4,
    ownerStudies: 1,
    weeklyAttendance: '5/7일',
    completedTasks: 12,
  },
};
// 스터디 상세 정보 Mock 데이터

export const studyPreviewData = {
  1: {
    id: 1,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다. 초보자부터 고급자까지 모두 환영합니다!',
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    tags: ['알고리즘', '코딩테스트', '매일', '백준'],
    owner: {
      name: '김철수',
      imageUrl: null,
    },
    members: {
      current: 12,
      max: 20,
    },
    rating: 4.8,
    isRecruiting: true,
    isPublic: true,
    approvalType: 'manual',
    activityFrequency: '매일',
    createdAt: '2024-10-01',
    recentNotices: [
      { id: 1, title: '이번 주 일정 안내', createdAt: '2시간 전', isPinned: true },
      { id: 2, title: '참고 자료 공유', createdAt: '1일 전', isPinned: false },
    ],
    topMembers: [
      { id: 1, name: '김철수', role: 'OWNER', imageUrl: null },
      { id: 2, name: '이영희', role: 'ADMIN', imageUrl: null },
      { id: 3, name: '박민수', role: 'MEMBER', imageUrl: null },
      { id: 4, name: '최지은', role: 'MEMBER', imageUrl: null },
      { id: 5, name: '정소현', role: 'MEMBER', imageUrl: null },
    ],
    rules: [
      '무단 지각/결석 3회 시 퇴출',
      '과제 미제출 시 사유 공유 필수',
      '서로 존중하는 태도',
    ],
  },
};

export const studyJoinData = {
  1: {
    id: 1,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    memberCount: 12,
    maxMembers: 20,
    category: '프로그래밍',
    autoApprove: true,
    rating: 4.8,
    reviewCount: 24,
    rules: [
      '매일 오전 9시까지 문제 풀이 제출',
      '주 1회 코드 리뷰 참여 필수',
      '결석 시 사전 공지',
      '서로 존중하는 태도',
      '학습 자료 적극 공유',
    ],
  },
};

export const myStudyDashboard = {
  1: {
    study: {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      role: 'OWNER',
      members: { current: 12, max: 20 },
    },
    weeklyActivity: {
      attendance: 85,
      attendanceCount: '10/12명',
      taskCompletion: 60,
      taskCount: '12/20개',
      messages: 127,
      notices: 3,
      files: 5,
    },
    recentNotices: [
      { id: 1, title: '이번 주 일정 안내', author: '김철수', time: '2시간 전' },
      { id: 2, title: '참고 자료 공유', author: '이영희', time: '1일 전' },
      { id: 3, title: '스터디 규칙 안내', author: '김철수', time: '3일 전' },
    ],
    recentFiles: [
      { id: 1, name: '알고리즘_문제집.pdf', size: '2.5MB', uploader: '김철수' },
      { id: 2, name: '면접_준비.xlsx', size: '1.2MB', uploader: '이영희' },
      { id: 3, name: '코드리뷰.zip', size: '3.1MB', uploader: '박민수' },
    ],
    upcomingEvents: [
      { id: 1, title: '주간 회의', date: '11/7 (목) 14:00', dday: 'D-1' },
      { id: 2, title: '과제 제출', date: '11/10 (일) 23:59', dday: 'D-4' },
      { id: 3, title: '모의 코딩테스트', date: '11/13 (수) 20:00', dday: 'D-7' },
    ],
    urgentTasks: [
      { id: 1, title: '백준 1234번 풀이', dday: 'D-1', date: '11/7' },
      { id: 2, title: '코드 리뷰 준비', dday: 'D-2', date: '11/8' },
      { id: 3, title: '자소서 1차 작성', dday: 'D-3', date: '11/9' },
    ],
  },
};
