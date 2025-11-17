// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

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

  // 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      email: 'kim@example.com',
      password: hashedPassword,
      name: '김민준',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
      bio: '안녕하세요! 백엔드 개발자입니다.',
      role: 'USER',
      status: 'ACTIVE',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'lee@example.com',
      password: hashedPassword,
      name: '이서연',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee',
      bio: '프론트엔드 개발자입니다 :)',
      role: 'USER',
      status: 'ACTIVE',
    },
  })

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

  console.log('✅ Users created:', user1.email, user2.email, admin.email)

  // 스터디 생성
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

  console.log('✅ Studies created:', study1.name, study2.name)

  // 스터디 멤버 생성
  await prisma.studyMember.create({
    data: {
      studyId: study1.id,
      userId: user1.id,
      role: 'OWNER',
      status: 'ACTIVE',
      approvedAt: new Date(),
      introduction: '스터디장입니다!',
      motivation: '함께 성장하기 위해',
      level: '상급',
    },
  })

  await prisma.studyMember.create({
    data: {
      studyId: study1.id,
      userId: user2.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      approvedAt: new Date(),
      introduction: '열심히 하겠습니다!',
      motivation: '알고리즘 실력 향상',
      level: '중급',
    },
  })

  await prisma.studyMember.create({
    data: {
      studyId: study2.id,
      userId: user2.id,
      role: 'OWNER',
      status: 'ACTIVE',
      approvedAt: new Date(),
      introduction: '취준 스터디장입니다',
      motivation: '함께 취업 성공하기',
      level: '초급',
    },
  })

  await prisma.studyMember.create({
    data: {
      studyId: study2.id,
      userId: user1.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      approvedAt: new Date(),
      introduction: '이직 준비 중입니다',
      motivation: '면접 스킬 향상',
      level: '중급',
    },
  })

  console.log('✅ Study members created')

  // 공지사항 생성
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

  console.log('✅ Notices created')

  // 할일 생성
  await prisma.task.create({
    data: {
      studyId: study1.id,
      userId: user1.id,
      title: '백준 1234번 풀이',
      description: '백준 1234번 문제를 풀고 코드를 공유해주세요',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
      completed: false,
    },
  })

  await prisma.task.create({
    data: {
      studyId: study1.id,
      userId: user2.id,
      title: '프로그래머스 Level 2 문제',
      description: '프로그래머스 Level 2 문제 3개 풀기',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      completed: false,
    },
  })

  await prisma.task.create({
    data: {
      studyId: study2.id,
      userId: user1.id,
      title: '자기소개서 작성',
      description: '기업 지원을 위한 자기소개서 초안 작성',
      status: 'DONE',
      priority: 'HIGH',
      completed: true,
      completedAt: new Date(),
    },
  })

  console.log('✅ Tasks created')

  // 캘린더 일정 생성
  await prisma.event.create({
    data: {
      studyId: study1.id,
      createdById: user1.id,
      title: '주간 알고리즘 스터디',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '19:00',
      endTime: '21:00',
      location: 'Zoom',
      color: '#6366F1',
    },
  })

  await prisma.event.create({
    data: {
      studyId: study2.id,
      createdById: user2.id,
      title: '모의 면접',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Google Meet',
      color: '#10B981',
    },
  })

  console.log('✅ Events created')

  // 알림 생성
  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: 'JOIN_APPROVED',
      studyId: study1.id,
      studyName: study1.name,
      studyEmoji: study1.emoji,
      message: '알고리즘 마스터 스터디 가입이 승인되었습니다',
      isRead: false,
    },
  })

  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: 'NOTICE',
      studyId: study1.id,
      studyName: study1.name,
      studyEmoji: study1.emoji,
      message: '새 공지사항: 스터디 규칙 안내',
      isRead: false,
    },
  })

  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'TASK',
      studyId: study1.id,
      studyName: study1.name,
      studyEmoji: study1.emoji,
      message: '새로운 할일이 배정되었습니다',
      isRead: true,
    },
  })

  console.log('✅ Notifications created')

  // 채팅 메시지 생성
  await prisma.message.create({
    data: {
      studyId: study1.id,
      userId: user1.id,
      content: '안녕하세요! 스터디에 오신 것을 환영합니다 😊',
      readers: [user1.id, user2.id],
    },
  })

  await prisma.message.create({
    data: {
      studyId: study1.id,
      userId: user2.id,
      content: '감사합니다! 열심히 하겠습니다 🔥',
      readers: [user1.id, user2.id],
    },
  })

  console.log('✅ Messages created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Users: 3 (2 regular + 1 admin)`)
  console.log(`  - Studies: 2`)
  console.log(`  - Study Members: 4`)
  console.log(`  - Notices: 2`)
  console.log(`  - Tasks: 3`)
  console.log(`  - Events: 2`)
  console.log(`  - Notifications: 3`)
  console.log(`  - Messages: 2`)
  console.log('\n✅ You can now login with:')
  console.log('  Email: kim@example.com')
  console.log('  Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

