// Mock 사용자 데이터

export const currentUser = {
  id: 1,
  name: '김철수',
  email: 'kim@example.com',
  imageUrl: null, // 또는 '/avatars/1.png'
  bio: '안녕하세요! 백엔드 개발자입니다.\n알고리즘과 시스템 설계에 관심이 많습니다.',
  provider: 'GOOGLE', // GOOGLE, EMAIL
  createdAt: '2024-11-01T09:00:00',
}

export const userStudies = [
  {
    id: 1,
    name: '코딩테스트 마스터 스터디',
    emoji: '💻',
    role: 'OWNER',
    memberCount: 12,
    lastActivityAt: '2024-11-09T09:00:00',
  },
  {
    id: 2,
    name: '취업 준비 스터디',
    emoji: '📝',
    role: 'MEMBER',
    memberCount: 8,
    lastActivityAt: '2024-11-09T07:00:00',
  },
  {
    id: 3,
    name: '영어 회화 스터디',
    emoji: '🌍',
    role: 'ADMIN',
    memberCount: 15,
    lastActivityAt: '2024-11-08T09:00:00',
  },
  {
    id: 4,
    name: '운동 루틴 스터디',
    emoji: '💪',
    role: 'MEMBER',
    memberCount: 5,
    lastActivityAt: '2024-11-07T09:00:00',
  },
]

export const userStats = {
  thisWeek: {
    completedTasks: 8,
    createdNotices: 3,
    uploadedFiles: 5,
    chatMessages: 42,
  },
  total: {
    studyCount: 4,
    completedTasks: 48,
    averageAttendance: 85,
    joinedDays: 9,
  },
  badges: [
    {
      id: 'study-master',
      icon: '🥇',
      name: '스터디 마스터',
      description: '4개 참여',
      unlocked: true,
    },
    {
      id: 'streak-7',
      icon: '🔥',
      name: '연속 출석 7일',
      description: '7일 연속 활동',
      unlocked: true,
    },
    {
      id: 'task-master',
      icon: '⭐',
      name: '할 일 완료왕',
      description: '48개 완료',
      unlocked: true,
    },
  ],
}

