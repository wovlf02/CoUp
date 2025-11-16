// 스터디 화상회의 Mock 데이터

export const studyVideoCallData = {
  1: {
    study: {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      role: 'OWNER',
    },
    participants: [
      { id: 1, name: '김철수 (나)', role: 'OWNER', isMuted: false, isVideoOn: true, isSpeaking: true },
      { id: 2, name: '이영희', role: 'ADMIN', isMuted: false, isVideoOn: true, isSpeaking: false },
      { id: 3, name: '박민수', role: 'MEMBER', isMuted: true, isVideoOn: true, isSpeaking: false },
      { id: 4, name: '최지은', role: 'MEMBER', isMuted: false, isVideoOn: false, isSpeaking: false },
    ],
    callHistory: [
      {
        id: 1,
        date: '2025.11.05',
        duration: '1시간 23분',
        participantCount: 8,
      },
      {
        id: 2,
        date: '2025.11.02',
        duration: '2시간 15분',
        participantCount: 12,
      },
    ],
  },
};

