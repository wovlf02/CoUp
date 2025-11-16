// 스터디 캘린더 Mock 데이터

export const studyCalendarData = {
  1: {
    study: {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      role: 'OWNER',
    },
    events: [
      {
        id: 1,
        title: '주간 회의',
        date: '2025-11-06',
        startTime: '14:00',
        endTime: '16:00',
        location: '온라인 (Zoom)',
        category: 'meeting',
        color: '#3b82f6',
        attendees: 12,
      },
      {
        id: 2,
        title: '코드 리뷰',
        date: '2025-11-06',
        startTime: '19:00',
        endTime: '20:00',
        location: '스터디룸 3층',
        category: 'study',
        color: '#10b981',
        attendees: 8,
      },
      {
        id: 3,
        title: '과제 마감',
        date: '2025-11-13',
        startTime: '23:59',
        endTime: '23:59',
        location: '-',
        category: 'assignment',
        color: '#ef4444',
        attendees: 20,
      },
    ],
  },
};

