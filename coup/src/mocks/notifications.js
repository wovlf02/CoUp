// Mock 알림 데이터

export const notifications = [
  {
    id: 1,
    type: 'JOIN_APPROVED',
    title: '코딩테스트 마스터 스터디',
    message: '가입이 승인되었습니다',
    studyId: 1,
    studyName: '코딩테스트 마스터 스터디',
    studyEmoji: '💻',
    isRead: false,
    createdAt: '2024-11-09T13:00:00',
    data: { studyId: 1 },
  },
  {
    id: 2,
    type: 'NOTICE',
    title: '알고리즘 마스터 스터디',
    message: '"이번 주 일정 안내" 공지가 등록되었습니다',
    studyId: 1,
    studyName: '알고리즘 마스터 스터디',
    studyEmoji: '💻',
    isRead: false,
    createdAt: '2024-11-09T10:00:00',
    data: { studyId: 1, noticeId: 1 },
  },
  {
    id: 3,
    type: 'FILE',
    title: '취업 준비 스터디',
    message: '이영희님이 "자소서_템플릿.pdf"를 업로드했습니다',
    studyId: 2,
    studyName: '취업 준비 스터디',
    studyEmoji: '📝',
    isRead: true,
    createdAt: '2024-11-08T09:00:00',
    data: { studyId: 2 },
  },
  {
    id: 4,
    type: 'EVENT',
    title: '영어 회화 스터디',
    message: '"주간 회의" 일정이 내일 오후 2시로 예정되어 있습니다',
    studyId: 3,
    studyName: '영어 회화 스터디',
    studyEmoji: '🌍',
    isRead: true,
    createdAt: '2024-11-08T08:00:00',
    data: { studyId: 3, eventId: 1 },
  },
  {
    id: 5,
    type: 'TASK',
    title: '알고리즘 마스터 스터디',
    message: '"백준 1234번 풀이" 할 일이 추가되었습니다',
    studyId: 1,
    studyName: '알고리즘 마스터 스터디',
    studyEmoji: '💻',
    isRead: true,
    createdAt: '2024-11-07T09:00:00',
    data: { studyId: 1, taskId: 1 },
  },
]

export const notificationStats = {
  today: 3,
  thisWeek: 12,
  unread: 2,
  total: 48,
  byType: {
    NOTICE: 4,
    FILE: 3,
    EVENT: 2,
    TASK: 2,
    MEMBER: 1,
    JOIN_APPROVED: 0,
    KICK: 0,
  },
  byStudy: {
    1: { name: '알고리즘 마스터', emoji: '💻', count: 5 },
    2: { name: '취업 준비', emoji: '📝', count: 4 },
    3: { name: '영어 회화', emoji: '🌍', count: 3 },
  },
}

export const notificationSettings = {
  sound: true,
  vibration: true,
  email: false,
}

