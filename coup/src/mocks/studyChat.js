// 스터디 채팅 Mock 데이터

export const studyChatData = {
  1: {
    study: {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      role: 'OWNER',
    },
    messages: [
      {
        id: 1,
        type: 'system',
        content: '2025년 11월 6일',
        timestamp: new Date('2025-11-06T00:00:00'),
      },
      {
        id: 2,
        type: 'user',
        userId: 'user1',
        userName: '김철수',
        content: '오늘 문제 풀었어요?',
        timestamp: new Date('2025-11-06T10:30:00'),
        isMine: false,
      },
      {
        id: 3,
        type: 'user',
        userId: 'me',
        userName: '나',
        content: '네, 3문제 완료했습니다',
        timestamp: new Date('2025-11-06T10:31:00'),
        isMine: true,
        readers: ['user1', 'user2'],
      },
      {
        id: 4,
        type: 'user',
        userId: 'user2',
        userName: '이영희',
        content: '저도 2문제 풀었어요!',
        timestamp: new Date('2025-11-06T10:32:00'),
        isMine: false,
        hasFile: true,
        fileName: '풀이.pdf',
        fileSize: '1.2MB',
      },
      {
        id: 5,
        type: 'user',
        userId: 'user1',
        userName: '김철수',
        content: '좋아요! 파일 확인했습니다 👍',
        timestamp: new Date('2025-11-06T10:35:00'),
        isMine: false,
      },
    ],
    onlineMembers: [
      { id: 'user1', name: '김철수', role: 'OWNER', status: '채팅 중', lastSeen: '방금 전' },
      { id: 'user2', name: '이영희', role: 'ADMIN', status: '채팅 중', lastSeen: '1분 전' },
      { id: 'user3', name: '박민수', role: 'MEMBER', status: '채팅 중', lastSeen: '5분 전' },
    ],
  },
};

