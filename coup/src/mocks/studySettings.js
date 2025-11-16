// 스터디 설정 Mock 데이터

export const studySettingsData = {
  1: {
    study: {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      role: 'OWNER',
    },
    formData: {
      name: '알고리즘 마스터 스터디',
      category: '프로그래밍',
      subCategory: '알고리즘/코테',
      description: '매일 아침 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.',
      tags: ['알고리즘', '코테', '백준'],
      maxMembers: 20,
      isPublic: true,
      autoApprove: false,
    },
    members: [
      { id: 1, name: '김철수', role: 'OWNER', joinedAt: '2024.10.01' },
      { id: 2, name: '이영희', role: 'ADMIN', joinedAt: '2024.10.02' },
      { id: 3, name: '박민수', role: 'MEMBER', joinedAt: '2024.10.05' },
      { id: 4, name: '최지은', role: 'MEMBER', joinedAt: '2024.10.08' },
      { id: 5, name: '정소현', role: 'MEMBER', joinedAt: '2024.10.12' },
    ],
  },
};

export const studyCategories = {
  '프로그래밍': ['알고리즘/코테', '웹개발', '앱개발', '게임개발', '기타'],
  '디자인': ['UI/UX', '그래픽', '영상', '3D', '기타'],
  '어학': ['영어', '중국어', '일본어', '기타'],
  '취업': ['자소서', '면접', '포트폴리오', '기타'],
  '자격증': ['정보처리기사', '토익', '토스', '기타'],
};

