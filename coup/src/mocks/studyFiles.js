// 스터디 파일 관리 Mock 데이터

export const studyFilesData = {
  1: {
    study: {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      role: 'OWNER',
    },
    folders: [
      { id: 1, name: '과제', fileCount: 12, size: '2.5MB' },
      { id: 2, name: '참고자료', fileCount: 8, size: '5.2MB' },
      { id: 3, name: '회의록', fileCount: 5, size: '1.8MB' },
    ],
    files: [
      {
        id: 1,
        name: '알고리즘_문제집.pdf',
        type: 'pdf',
        size: '2.5MB',
        uploader: { name: '김철수', role: 'OWNER' },
        uploadedAt: '2시간 전',
        downloads: 15,
      },
      {
        id: 2,
        name: '회의_사진.jpg',
        type: 'image',
        size: '1.2MB',
        uploader: { name: '이영희', role: 'ADMIN' },
        uploadedAt: '1일 전',
        downloads: 8,
      },
      {
        id: 3,
        name: '면접_준비.xlsx',
        type: 'spreadsheet',
        size: '0.8MB',
        uploader: { name: '박민수', role: 'MEMBER' },
        uploadedAt: '3일 전',
        downloads: 12,
      },
      {
        id: 4,
        name: '코드리뷰_자료.zip',
        type: 'archive',
        size: '3.1MB',
        uploader: { name: '최지은', role: 'MEMBER' },
        uploadedAt: '1주 전',
        downloads: 5,
      },
    ],
  },
};

