// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed...')

  // 기존 데이터 삭제 (개발용)
  await prisma.notification.deleteMany()
  await prisma.task.deleteMany()
  await prisma.event.deleteMany()
  await prisma.file.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.studyMember.deleteMany()
  await prisma.study.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('password123', 10)

  // ============================================
  // 사용자 생성 (10명)
  // ============================================
  const users = []
  
  const user1 = await prisma.user.create({
    data: {
      email: 'kim@example.com',
      password: hashedPassword,
      name: '김민준',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
      bio: '백엔드 개발자입니다. 알고리즘과 클린 코드에 관심이 많습니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user1)

  const user2 = await prisma.user.create({
    data: {
      email: 'lee@example.com',
      password: hashedPassword,
      name: '이서연',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee',
      bio: '프론트엔드 개발자입니다. React와 TypeScript를 좋아합니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user2)

  const user3 = await prisma.user.create({
    data: {
      email: 'park@example.com',
      password: hashedPassword,
      name: '박준혁',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=park',
      bio: '풀스택 개발자 지망생입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user3)

  const user4 = await prisma.user.create({
    data: {
      email: 'choi@example.com',
      password: hashedPassword,
      name: '최지우',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=choi',
      bio: '취업 준비 중입니다. 함께 성장해요!',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user4)

  const user5 = await prisma.user.create({
    data: {
      email: 'jung@example.com',
      password: hashedPassword,
      name: '정수아',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jung',
      bio: '디자이너에서 개발자로 전향 중입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user5)

  const user6 = await prisma.user.create({
    data: {
      email: 'kang@example.com',
      password: hashedPassword,
      name: '강태양',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kang',
      bio: '데이터 분석가입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user6)

  const user7 = await prisma.user.create({
    data: {
      email: 'han@example.com',
      password: hashedPassword,
      name: '한유진',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=han',
      bio: 'AI/ML에 관심이 많습니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user7)

  const user8 = await prisma.user.create({
    data: {
      email: 'yoon@example.com',
      password: hashedPassword,
      name: '윤서준',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoon',
      bio: '게임 개발자 지망생입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user8)

  const user9 = await prisma.user.create({
    data: {
      email: 'lim@example.com',
      password: hashedPassword,
      name: '임하은',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lim',
      bio: '모바일 앱 개발자입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })
  users.push(user9)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '관리자',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'CoUp 관리자입니다.',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log(`✅ Users created: ${users.length + 1} users`)

  // ============================================
  // 스터디 생성 (8개 - 다양한 카테고리)
  // ============================================
  const studies = []

  const study1 = await prisma.study.create({
    data: {
      ownerId: user1.id,
      name: '알고리즘 마스터 스터디',
      emoji: '💻',
      description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다. 백준, 프로그래머스 문제를 중심으로 진행합니다.',
      category: '프로그래밍',
      subCategory: '알고리즘/코테',
      maxMembers: 20,
      isPublic: true,
      autoApprove: false,
      isRecruiting: true,
      rating: 4.8,
      reviewCount: 15,
      tags: ['알고리즘', '코딩테스트', '매일', '백준', '프로그래머스'],
    },
  })
  studies.push(study1)

  const study2 = await prisma.study.create({
    data: {
      ownerId: user2.id,
      name: '취업 준비 스터디',
      emoji: '💼',
      description: '함께 이력서와 면접을 준비하는 스터디입니다. 매주 모의 면접을 진행합니다.',
      category: '취업',
      subCategory: '면접준비',
      maxMembers: 15,
      isPublic: true,
      autoApprove: true,
      isRecruiting: true,
      rating: 4.5,
      reviewCount: 8,
      tags: ['취업', '면접', '자소서', '이력서'],
    },
  })
  studies.push(study2)

  const study3 = await prisma.study.create({
    data: {
      ownerId: user3.id,
      name: 'React 심화 스터디',
      emoji: '⚛️',
      description: 'React 고급 패턴과 최신 기술을 학습합니다. Next.js, TypeScript도 다룹니다.',
      category: '프로그래밍',
      subCategory: '프론트엔드',
      maxMembers: 12,
      isPublic: true,
      autoApprove: false,
      isRecruiting: true,
      rating: 4.9,
      reviewCount: 20,
      tags: ['React', 'Next.js', 'TypeScript', '프론트엔드'],
    },
  })
  studies.push(study3)

  const study4 = await prisma.study.create({
    data: {
      ownerId: user4.id,
      name: '토익 900점 달성',
      emoji: '📚',
      description: '3개월 안에 토익 900점을 목표로 합니다. 매일 학습 인증!',
      category: '어학',
      subCategory: '영어',
      maxMembers: 20,
      isPublic: true,
      autoApprove: true,
      isRecruiting: true,
      rating: 4.6,
      reviewCount: 12,
      tags: ['토익', '영어', '매일학습', '인증'],
    },
  })
  studies.push(study4)

  const study5 = await prisma.study.create({
    data: {
      ownerId: user5.id,
      name: 'CS 기초 다지기',
      emoji: '🖥️',
      description: '컴퓨터 공학 기초를 탄탄하게! 운영체제, 네트워크, 데이터베이스를 학습합니다.',
      category: '프로그래밍',
      subCategory: 'CS',
      maxMembers: 15,
      isPublic: true,
      autoApprove: false,
      isRecruiting: true,
      rating: 4.7,
      reviewCount: 10,
      tags: ['CS', '운영체제', '네트워크', '데이터베이스'],
    },
  })
  studies.push(study5)

  const study6 = await prisma.study.create({
    data: {
      ownerId: user6.id,
      name: '독서 모임 - 개발자의 글쓰기',
      emoji: '📖',
      description: '개발 관련 책을 읽고 토론하는 모임입니다.',
      category: '독서',
      subCategory: '개발서적',
      maxMembers: 10,
      isPublic: true,
      autoApprove: true,
      isRecruiting: true,
      rating: 4.4,
      reviewCount: 6,
      tags: ['독서', '개발서적', '토론'],
    },
  })
  studies.push(study6)

  const study7 = await prisma.study.create({
    data: {
      ownerId: user7.id,
      name: '머신러닝 스터디',
      emoji: '🤖',
      description: '머신러닝 기초부터 실전 프로젝트까지!',
      category: '프로그래밍',
      subCategory: 'AI/ML',
      maxMembers: 12,
      isPublic: true,
      autoApprove: false,
      isRecruiting: true,
      rating: 4.8,
      reviewCount: 14,
      tags: ['머신러닝', 'AI', 'Python', '프로젝트'],
    },
  })
  studies.push(study7)

  const study8 = await prisma.study.create({
    data: {
      ownerId: user8.id,
      name: '아침 운동 모임',
      emoji: '🏃',
      description: '아침 6시, 함께 운동해요!',
      category: '취미',
      subCategory: '운동',
      maxMembers: 8,
      isPublic: true,
      autoApprove: true,
      isRecruiting: true,
      rating: 4.3,
      reviewCount: 5,
      tags: ['운동', '아침', '건강'],
    },
  })
  studies.push(study8)

  console.log(`✅ Studies created: ${studies.length} studies`)

  // ============================================
  // 스터디 멤버 생성 (user1이 여러 스터디 참여)
  // ============================================
  const memberData = [
    // Study 1 - 알고리즘 (4명)
    { studyId: study1.id, userId: user1.id, role: 'OWNER', status: 'ACTIVE', introduction: '스터디장입니다!', level: '상급' },
    { studyId: study1.id, userId: user2.id, role: 'ADMIN', status: 'ACTIVE', introduction: '열심히 하겠습니다!', level: '중급' },
    { studyId: study1.id, userId: user3.id, role: 'MEMBER', status: 'ACTIVE', introduction: '잘 부탁드립니다', level: '초급' },
    { studyId: study1.id, userId: user4.id, role: 'MEMBER', status: 'ACTIVE', introduction: '화이팅!', level: '중급' },
    
    // Study 2 - 취업 (5명, user1 포함)
    { studyId: study2.id, userId: user2.id, role: 'OWNER', status: 'ACTIVE', introduction: '취준 스터디장', level: '중급' },
    { studyId: study2.id, userId: user1.id, role: 'MEMBER', status: 'ACTIVE', introduction: '이직 준비 중', level: '중급' },
    { studyId: study2.id, userId: user4.id, role: 'MEMBER', status: 'ACTIVE', introduction: '첫 취업 준비', level: '초급' },
    { studyId: study2.id, userId: user5.id, role: 'MEMBER', status: 'ACTIVE', introduction: '전직 준비', level: '초급' },
    { studyId: study2.id, userId: user6.id, role: 'MEMBER', status: 'PENDING', introduction: '가입 신청합니다', level: '초급' },
    
    // Study 3 - React (user1 포함)
    { studyId: study3.id, userId: user3.id, role: 'OWNER', status: 'ACTIVE', introduction: 'React 전문가', level: '상급' },
    { studyId: study3.id, userId: user1.id, role: 'MEMBER', status: 'ACTIVE', introduction: 'React 배우고 싶습니다', level: '중급' },
    { studyId: study3.id, userId: user2.id, role: 'MEMBER', status: 'ACTIVE', introduction: 'Next.js 마스터하기', level: '중급' },
    
    // Study 4 - 토익 (user1 포함)
    { studyId: study4.id, userId: user4.id, role: 'OWNER', status: 'ACTIVE', introduction: '함께 목표 달성!', level: '중급' },
    { studyId: study4.id, userId: user1.id, role: 'MEMBER', status: 'ACTIVE', introduction: '영어 공부 시작', level: '초급' },
    { studyId: study4.id, userId: user5.id, role: 'MEMBER', status: 'ACTIVE', introduction: '900점 가자!', level: '중급' },
    
    // Study 5 - CS (user1 포함)
    { studyId: study5.id, userId: user5.id, role: 'OWNER', status: 'ACTIVE', introduction: 'CS 기초 정리', level: '중급' },
    { studyId: study5.id, userId: user1.id, role: 'ADMIN', status: 'ACTIVE', introduction: 'CS 함께 공부해요', level: '중급' },
    { studyId: study5.id, userId: user7.id, role: 'MEMBER', status: 'ACTIVE', introduction: '기초부터 차근차근', level: '초급' },
    
    // Study 6 - 독서 (user1 포함)
    { studyId: study6.id, userId: user6.id, role: 'OWNER', status: 'ACTIVE', introduction: '독서 모임장', level: '상급' },
    { studyId: study6.id, userId: user1.id, role: 'MEMBER', status: 'ACTIVE', introduction: '책 좋아합니다', level: '중급' },
    
    // Study 7 - ML
    { studyId: study7.id, userId: user7.id, role: 'OWNER', status: 'ACTIVE', introduction: 'ML 연구자', level: '상급' },
    { studyId: study7.id, userId: user8.id, role: 'MEMBER', status: 'ACTIVE', introduction: 'AI 배우고 싶어요', level: '초급' },
    
    // Study 8 - 운동
    { studyId: study8.id, userId: user8.id, role: 'OWNER', status: 'ACTIVE', introduction: '아침형 인간', level: '중급' },
    { studyId: study8.id, userId: user9.id, role: 'MEMBER', status: 'ACTIVE', introduction: '건강 챙기기', level: '초급' },
  ]

  for (const data of memberData) {
    await prisma.studyMember.create({
      data: {
        ...data,
        approvedAt: data.status === 'ACTIVE' ? new Date() : null,
      }
    })
  }

  console.log(`✅ Study members created: ${memberData.length} memberships`)

  // ============================================
  // 공지사항 생성 (각 스터디마다)
  // ============================================
  const notices = []
  
  // Study 1 공지
  await prisma.notice.create({
    data: {
      studyId: study1.id,
      authorId: user1.id,
      title: '📢 스터디 규칙 안내',
      content: `안녕하세요! 스터디 규칙을 안내드립니다.

1. 매일 1문제씩 풀고 코드를 공유해주세요
2. 주 1회 온라인 모임 참석 필수
3. 질문은 언제든 환영합니다!

함께 성장하는 스터디가 되었으면 좋겠습니다 😊`,
      isPinned: true,
      isImportant: true,
      views: 25,
    },
  })

  await prisma.notice.create({
    data: {
      studyId: study1.id,
      authorId: user1.id,
      title: '이번 주 학습 내용',
      content: '이번 주는 동적 프로그래밍(DP) 문제를 집중적으로 풀어봅시다!',
      isPinned: false,
      isImportant: false,
      views: 12,
    },
  })

  // Study 2 공지
  await prisma.notice.create({
    data: {
      studyId: study2.id,
      authorId: user2.id,
      title: '이번 주 모의 면접 일정',
      content: '이번 주 토요일 오후 2시에 모의 면접을 진행합니다. 참여해주세요!',
      isPinned: true,
      isImportant: true,
      views: 18,
    },
  })

  // Study 3 공지
  await prisma.notice.create({
    data: {
      studyId: study3.id,
      authorId: user3.id,
      title: 'Next.js 14 새 기능 소개',
      content: 'Server Actions와 새로운 캐싱 전략에 대해 알아봅시다.',
      isPinned: false,
      isImportant: false,
      views: 15,
    },
  })

  console.log('✅ Notices created')

  // ============================================
  // 할일 생성 (user1의 할일 - 15개)
  // ============================================
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const tasks = [
    // 미완료 할일 (10개)
    { studyId: study1.id, userId: user1.id, title: '백준 1234번 풀이', description: 'DP 문제', status: 'TODO', priority: 'HIGH', dueDate: tomorrow, completed: false },
    { studyId: study1.id, userId: user1.id, title: '프로그래머스 Level 2', description: '3개 문제 풀기', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: nextWeek, completed: false },
    { studyId: study2.id, userId: user1.id, title: '이력서 수정', description: '프로젝트 경험 추가', status: 'TODO', priority: 'HIGH', dueDate: tomorrow, completed: false },
    { studyId: study2.id, userId: user1.id, title: '자기소개서 작성', description: '기업 지원용', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: today, completed: false },
    { studyId: study3.id, userId: user1.id, title: 'React 프로젝트 리팩토링', description: 'Hooks 최적화', status: 'TODO', priority: 'MEDIUM', dueDate: nextWeek, completed: false },
    { studyId: study4.id, userId: user1.id, title: '토익 RC 100문제', description: '오늘 학습량', status: 'TODO', priority: 'HIGH', dueDate: today, completed: false },
    { studyId: study5.id, userId: user1.id, title: '운영체제 복습', description: '프로세스와 스레드', status: 'TODO', priority: 'MEDIUM', dueDate: nextWeek, completed: false },
    { studyId: null, userId: user1.id, title: '개인 블로그 포스팅', description: '이번 주 학습 내용 정리', status: 'TODO', priority: 'LOW', dueDate: nextWeek, completed: false },
    { studyId: study1.id, userId: user1.id, title: '알고리즘 개념 정리', description: '그래프 알고리즘', status: 'REVIEW', priority: 'MEDIUM', dueDate: nextWeek, completed: false },
    { studyId: study6.id, userId: user1.id, title: '클린 코드 3장 읽기', description: '함수 챕터', status: 'TODO', priority: 'LOW', dueDate: nextWeek, completed: false },
    
    // 완료한 할일 (5개 - 이번 달)
    { studyId: study1.id, userId: user1.id, title: '백준 5678번 완료', description: 'DFS 문제', status: 'DONE', priority: 'MEDIUM', completed: true, completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { studyId: study2.id, userId: user1.id, title: '포트폴리오 업데이트', description: '최신 프로젝트 추가', status: 'DONE', priority: 'HIGH', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { studyId: study3.id, userId: user1.id, title: 'Next.js 튜토리얼', description: '공식 문서 완주', status: 'DONE', priority: 'MEDIUM', completed: true, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { studyId: study4.id, userId: user1.id, title: '토익 모의고사', description: '1회 풀이', status: 'DONE', priority: 'HIGH', completed: true, completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { studyId: study5.id, userId: user1.id, title: '네트워크 프로토콜 학습', description: 'TCP/IP', status: 'DONE', priority: 'MEDIUM', completed: true, completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  ]

  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  console.log(`✅ Tasks created: ${tasks.length} tasks (10 pending, 5 completed)`)

  // ============================================
  // 캘린더 일정 생성 (다가오는 일정)
  // ============================================
  const events = [
    {
      studyId: study1.id,
      createdById: user1.id,
      title: '주간 알고리즘 스터디',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 내일
      startTime: '19:00',
      endTime: '21:00',
      location: 'Zoom',
      color: '#6366F1',
    },
    {
      studyId: study2.id,
      createdById: user2.id,
      title: '모의 면접',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
      startTime: '14:00',
      endTime: '16:00',
      location: 'Google Meet',
      color: '#10B981',
    },
    {
      studyId: study3.id,
      createdById: user3.id,
      title: 'React 프로젝트 리뷰',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
      startTime: '20:00',
      endTime: '22:00',
      location: 'Discord',
      color: '#F59E0B',
    },
    {
      studyId: study4.id,
      createdById: user4.id,
      title: '토익 모의고사',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
      startTime: '10:00',
      endTime: '12:00',
      location: '스터디룸',
      color: '#EF4444',
    },
    {
      studyId: study5.id,
      createdById: user5.id,
      title: 'CS 스터디 세션',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
      startTime: '19:30',
      endTime: '21:30',
      location: 'Zoom',
      color: '#8B5CF6',
    },
  ]

  for (const event of events) {
    await prisma.event.create({ data: event })
  }

  console.log(`✅ Events created: ${events.length} upcoming events`)

  // ============================================
  // 알림 생성 (20개 - 다양한 타입)
  // ============================================
  const notifications = [
    // 읽지 않은 알림 (10개)
    { userId: user1.id, type: 'JOIN_APPROVED', studyId: study3.id, studyName: study3.name, studyEmoji: study3.emoji, message: 'React 심화 스터디 가입이 승인되었습니다', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 1000) },
    { userId: user1.id, type: 'NOTICE', studyId: study1.id, studyName: study1.name, studyEmoji: study1.emoji, message: '새 공지사항: 이번 주 학습 내용', isRead: false, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'EVENT', studyId: study1.id, studyName: study1.name, studyEmoji: study1.emoji, message: '내일 주간 알고리즘 스터디가 있습니다', isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'TASK', studyId: study2.id, studyName: study2.name, studyEmoji: study2.emoji, message: '자기소개서 작성 마감일이 오늘입니다', isRead: false, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'CHAT', studyId: study3.id, studyName: study3.name, studyEmoji: study3.emoji, message: '이서연님이 메시지를 보냈습니다', isRead: false, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'MEMBER', studyId: study5.id, studyName: study5.name, studyEmoji: study5.emoji, message: '강태양님이 스터디에 가입했습니다', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'FILE', studyId: study1.id, studyName: study1.name, studyEmoji: study1.emoji, message: '새 파일이 업로드되었습니다', isRead: false, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'NOTICE', studyId: study2.id, studyName: study2.name, studyEmoji: study2.emoji, message: '새 공지사항: 이번 주 모의 면접 일정', isRead: false, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'TASK', studyId: study4.id, studyName: study4.name, studyEmoji: study4.emoji, message: '토익 RC 100문제 할일이 생성되었습니다', isRead: false, createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'EVENT', studyId: study2.id, studyName: study2.name, studyEmoji: study2.emoji, message: '모레 모의 면접이 예정되어 있습니다', isRead: false, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    
    // 읽은 알림 (10개)
    { userId: user1.id, type: 'JOIN_APPROVED', studyId: study4.id, studyName: study4.name, studyEmoji: study4.emoji, message: '토익 900점 달성 가입이 승인되었습니다', isRead: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'NOTICE', studyId: study3.id, studyName: study3.name, studyEmoji: study3.emoji, message: '새 공지사항: Next.js 14 새 기능 소개', isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'CHAT', studyId: study1.id, studyName: study1.name, studyEmoji: study1.emoji, message: '박준혁님이 메시지를 보냈습니다', isRead: true, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'TASK', studyId: study1.id, studyName: study1.name, studyEmoji: study1.emoji, message: '백준 5678번 완료를 완료하셨습니다', isRead: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'MEMBER', studyId: study6.id, studyName: study6.name, studyEmoji: study6.emoji, message: '독서 모임에 가입하셨습니다', isRead: true, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'JOIN_APPROVED', studyId: study5.id, studyName: study5.name, studyEmoji: study5.emoji, message: 'CS 기초 다지기 가입이 승인되었습니다', isRead: true, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'EVENT', studyId: study5.id, studyName: study5.name, studyEmoji: study5.emoji, message: 'CS 스터디 세션이 예정되어 있습니다', isRead: true, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'TASK', studyId: study3.id, studyName: study3.name, studyEmoji: study3.emoji, message: 'Next.js 튜토리얼을 완료하셨습니다', isRead: true, createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'NOTICE', studyId: study1.id, studyName: study1.name, studyEmoji: study1.emoji, message: '새 공지사항: 스터디 규칙 안내', isRead: true, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { userId: user1.id, type: 'JOIN_APPROVED', studyId: study2.id, studyName: study2.name, studyEmoji: study2.emoji, message: '취업 준비 스터디 가입이 승인되었습니다', isRead: true, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification })
  }

  console.log(`✅ Notifications created: ${notifications.length} notifications (10 unread, 10 read)`)

  // ============================================
  // 채팅 메시지 생성
  // ============================================
  const messages = [
    { studyId: study1.id, userId: user1.id, content: '안녕하세요! 스터디에 오신 것을 환영합니다 😊', readers: [user1.id, user2.id, user3.id] },
    { studyId: study1.id, userId: user2.id, content: '감사합니다! 열심히 하겠습니다 🔥', readers: [user1.id, user2.id] },
    { studyId: study1.id, userId: user3.id, content: '잘 부탁드립니다!', readers: [user1.id] },
    { studyId: study2.id, userId: user2.id, content: '이번 주 모의 면접 준비해주세요~', readers: [user1.id, user2.id] },
    { studyId: study2.id, userId: user1.id, content: '네 알겠습니다!', readers: [user1.id] },
    { studyId: study3.id, userId: user3.id, content: 'Next.js 14 정말 좋네요', readers: [user1.id, user3.id] },
    { studyId: study3.id, userId: user1.id, content: 'Server Actions 사용해보셨나요?', readers: [user1.id] },
  ]

  for (const message of messages) {
    await prisma.message.create({ data: message })
  }

  console.log(`✅ Messages created: ${messages.length} messages`)

  console.log('\n🎉 Comprehensive seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Users: 10 (9 regular + 1 admin)`)
  console.log(`  - Studies: 8 (다양한 카테고리)`)
  console.log(`  - Study Members: ${memberData.length} (user1은 6개 스터디 참여)`)
  console.log(`  - Notices: 4`)
  console.log(`  - Tasks: ${tasks.length} (10 pending, 5 completed this month)`)
  console.log(`  - Events: ${events.length} (다가오는 일정)`)
  console.log(`  - Notifications: ${notifications.length} (10 unread, 10 read)`)
  console.log(`  - Messages: ${messages.length}`)
  console.log('\n✅ You can now login with:')
  console.log('  Email: kim@example.com')
  console.log('  Password: password123')
  console.log('\n📈 Dashboard will show:')
  console.log('  - 6 active studies')
  console.log('  - 10 pending tasks')
  console.log('  - 10 unread notifications')
  console.log('  - 5 completed tasks this month')
  console.log('  - Recent activities and upcoming events')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
