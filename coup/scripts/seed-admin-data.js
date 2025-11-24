// scripts/seed-admin-data.js
// 관리자 페이지를 위한 실제 데이터 삽입 스크립트

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 관리자 페이지 데이터 시딩 시작...')

  try {
    // 1. 기존 데이터 확인
    const existingUsersCount = await prisma.user.count()
    console.log(`📊 기존 사용자 수: ${existingUsersCount}`)

    // 2. 관리자 계정 생성/확인
    const adminEmail = 'admin@coup.com'
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin1234', 10)
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: '시스템 관리자',
          role: 'ADMIN',
          status: 'ACTIVE',
          provider: 'CREDENTIALS',
          avatar: null,
          bio: '시스템 관리자 계정입니다.',
          lastLoginAt: new Date()
        }
      })
      console.log('✅ 관리자 계정 생성:', admin.email)
    } else {
      console.log('✅ 관리자 계정 존재:', admin.email)
    }

    // 3. 테스트 사용자 생성 (20명)
    console.log('\n👥 테스트 사용자 생성 중...')
    const testUsers = []
    const names = [
      '김철수', '이영희', '박민수', '정지훈', '최서연',
      '강동원', '한지민', '윤시윤', '송중기', '김태희',
      '이민호', '전지현', '박보검', '수지', '아이유',
      '강하늘', '박신혜', '김수현', '배수지', '임윤아'
    ]

    for (let i = 0; i < 20; i++) {
      const email = `user${i + 1}@coup.com`
      const existing = await prisma.user.findUnique({ where: { email } })

      if (!existing) {
        const hashedPassword = await bcrypt.hash('user1234', 10)
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: names[i],
            role: 'USER',
            status: i < 18 ? 'ACTIVE' : (i === 18 ? 'SUSPENDED' : 'DELETED'),
            provider: i % 3 === 0 ? 'GOOGLE' : (i % 3 === 1 ? 'GITHUB' : 'CREDENTIALS'),
            suspendedUntil: i === 18 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
            suspendReason: i === 18 ? '스팸 신고 누적' : null,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 지난 30일 내
            lastLoginAt: i < 15 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null // 일부만 최근 로그인
          }
        })
        testUsers.push(user)
        console.log(`  ✓ ${user.name} (${user.email})`)
      } else {
        testUsers.push(existing)
        console.log(`  ○ ${existing.name} (이미 존재)`)
      }
    }

    // 4. 스터디 생성 (15개)
    console.log('\n📚 테스트 스터디 생성 중...')
    const studyData = [
      { name: 'React 마스터하기', emoji: '⚛️', category: 'development', description: 'React 심화 학습 스터디', tags: ['React', 'Frontend', 'JavaScript'] },
      { name: 'Python 알고리즘', emoji: '🐍', category: 'development', description: '코딩테스트 준비', tags: ['Python', 'Algorithm', 'Coding Test'] },
      { name: '토익 900+ 달성', emoji: '📖', category: 'language', description: '토익 고득점 목표', tags: ['TOEIC', 'English', 'Study'] },
      { name: 'UI/UX 디자인 스터디', emoji: '🎨', category: 'design', description: 'Figma로 배우는 디자인', tags: ['Design', 'Figma', 'UI/UX'] },
      { name: '데이터 사이언스 입문', emoji: '📊', category: 'development', description: '데이터 분석 기초', tags: ['Data Science', 'Python', 'Analysis'] },
      { name: '일본어 회화 모임', emoji: '🗣️', category: 'language', description: '매주 일본어 회화 연습', tags: ['Japanese', 'Conversation', 'JLPT'] },
      { name: 'Node.js 백엔드', emoji: '🚀', category: 'development', description: 'Node.js와 Express', tags: ['Node.js', 'Backend', 'API'] },
      { name: '독서 토론 클럽', emoji: '📚', category: 'hobby', description: '매주 책 읽고 토론', tags: ['Reading', 'Book', 'Discussion'] },
      { name: '운동 메이트', emoji: '💪', category: 'hobby', description: '헬스 같이 다니실 분', tags: ['Exercise', 'Health', 'Gym'] },
      { name: '중국어 HSK 준비', emoji: '🇨🇳', category: 'language', description: 'HSK 5급 목표', tags: ['Chinese', 'HSK', 'Language'] },
      { name: 'AWS 자격증 스터디', emoji: '☁️', category: 'development', description: 'AWS SAA 취득 목표', tags: ['AWS', 'Cloud', 'Certificate'] },
      { name: '사진 촬영 동호회', emoji: '📷', category: 'hobby', description: '주말 출사 모임', tags: ['Photography', 'Camera', 'Hobby'] },
      { name: 'SQL 데이터베이스', emoji: '💾', category: 'development', description: 'SQL 쿼리 마스터', tags: ['SQL', 'Database', 'Query'] },
      { name: '영어 회화 프리토킹', emoji: '🗨️', category: 'language', description: '영어 실력 향상', tags: ['English', 'Speaking', 'Conversation'] },
      { name: 'Vue.js 프로젝트', emoji: '💚', category: 'development', description: 'Vue 3 실전 프로젝트', tags: ['Vue', 'Frontend', 'Project'] }
    ]

    const studies = []
    for (let i = 0; i < studyData.length; i++) {
      const owner = testUsers[i % testUsers.length]
      const data = studyData[i]

      const existing = await prisma.study.findFirst({
        where: { name: data.name }
      })

      if (!existing) {
        const study = await prisma.study.create({
          data: {
            ...data,
            ownerId: owner.id,
            maxMembers: 10 + Math.floor(Math.random() * 20),
            isPublic: i < 12, // 일부는 비공개
            isRecruiting: i < 10, // 일부는 모집 종료
            rating: 3 + Math.random() * 2, // 3.0 ~ 5.0
            reviewCount: Math.floor(Math.random() * 20),
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // 지난 60일 내
          }
        })
        studies.push(study)

        // 스터디 멤버 추가 (오너)
        await prisma.studyMember.create({
          data: {
            studyId: study.id,
            userId: owner.id,
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: study.createdAt,
            approvedAt: study.createdAt
          }
        })

        // 추가 멤버 3-7명
        const memberCount = 3 + Math.floor(Math.random() * 5)
        const memberIds = testUsers
          .filter(u => u.id !== owner.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, memberCount)
          .map(u => u.id)

        for (const userId of memberIds) {
          await prisma.studyMember.create({
            data: {
              studyId: study.id,
              userId,
              role: 'MEMBER',
              status: Math.random() > 0.1 ? 'ACTIVE' : 'PENDING',
              joinedAt: new Date(study.createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000),
              approvedAt: Math.random() > 0.1 ? new Date(study.createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : null
            }
          })
        }

        console.log(`  ✓ ${study.emoji} ${study.name} (멤버 ${memberCount + 1}명)`)
      } else {
        studies.push(existing)
        console.log(`  ○ ${existing.emoji} ${existing.name} (이미 존재)`)
      }
    }

    // 5. 신고 데이터 생성 (10건)
    console.log('\n⚠️  테스트 신고 데이터 생성 중...')
    const reportTypes = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER']
    const targetTypes = ['USER', 'STUDY', 'MESSAGE']
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

    for (let i = 0; i < 10; i++) {
      const reporter = testUsers[i % testUsers.length]
      const targetType = targetTypes[i % targetTypes.length]
      let targetId, targetName

      if (targetType === 'USER') {
        const target = testUsers[(i + 5) % testUsers.length]
        targetId = target.id
        targetName = target.name
      } else if (targetType === 'STUDY') {
        const target = studies[i % studies.length]
        targetId = target.id
        targetName = target.name
      } else {
        // MESSAGE는 임시 ID 사용
        targetId = `msg-${i + 1}`
        targetName = `테스트 메시지 ${i + 1}`
      }

      const existing = await prisma.report.findFirst({
        where: {
          reporterId: reporter.id,
          targetId
        }
      })

      if (!existing) {
        const report = await prisma.report.create({
          data: {
            reporterId: reporter.id,
            targetType,
            targetId,
            targetName,
            type: reportTypes[i % reportTypes.length],
            reason: `${reportTypes[i % reportTypes.length]} 유형의 테스트 신고입니다. ${i + 1}번째 신고 내용.`,
            status: i < 5 ? 'PENDING' : statuses[i % statuses.length],
            priority: i < 2 ? 'URGENT' : (i < 5 ? 'HIGH' : priorities[i % priorities.length]),
            processedBy: i >= 5 ? admin.id : null,
            processedAt: i >= 5 ? new Date() : null,
            resolution: i >= 5 ? '검토 완료 및 조치함' : null,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // 지난 7일 내
          }
        })
        console.log(`  ✓ 신고 #${i + 1}: ${report.type} (${report.priority})`)
      } else {
        console.log(`  ○ 신고 #${i + 1} (이미 존재)`)
      }
    }

    // 6. 알림 데이터 생성 (각 사용자당 3-5개)
    console.log('\n🔔 테스트 알림 데이터 생성 중...')
    const notificationTypes = ['JOIN_APPROVED', 'NOTICE', 'FILE', 'EVENT', 'TASK', 'MEMBER', 'CHAT']

    for (const user of testUsers.slice(0, 10)) { // 처음 10명만
      const count = 3 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const study = studies[Math.floor(Math.random() * studies.length)]
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
            studyId: study.id,
            studyName: study.name,
            studyEmoji: study.emoji,
            message: `${study.name}에서 새로운 활동이 있습니다.`,
            isRead: Math.random() > 0.5,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // 지난 1일 내
          }
        })
      }
      console.log(`  ✓ ${user.name}에게 ${count}개 알림 생성`)
    }

    // 7. 할일 데이터 생성
    console.log('\n✅ 테스트 할일 데이터 생성 중...')
    const taskStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

    for (const user of testUsers.slice(0, 10)) {
      const taskCount = 2 + Math.floor(Math.random() * 4)
      for (let i = 0; i < taskCount; i++) {
        const study = i % 2 === 0 ? studies[Math.floor(Math.random() * studies.length)] : null
        await prisma.task.create({
          data: {
            userId: user.id,
            studyId: study?.id,
            title: `${user.name}의 할일 ${i + 1}`,
            description: `할일 설명 ${i + 1}`,
            status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            completed: Math.random() > 0.5,
            completedAt: Math.random() > 0.5 ? new Date() : null,
            dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // 앞으로 14일 내
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }
        })
      }
      console.log(`  ✓ ${user.name}: ${taskCount}개 할일 생성`)
    }

    // 8. 시스템 설정 데이터
    console.log('\n⚙️  시스템 설정 데이터 생성 중...')
    const settings = [
      { key: 'site_name', value: 'CoUp', type: 'STRING' },
      { key: 'max_study_members', value: '50', type: 'NUMBER' },
      { key: 'allow_signup', value: 'true', type: 'BOOLEAN' },
      { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' },
      { key: 'max_file_size', value: '10485760', type: 'NUMBER' }, // 10MB
    ]

    for (const setting of settings) {
      const existing = await prisma.setting.findUnique({ where: { key: setting.key } })
      if (!existing) {
        await prisma.setting.create({ data: setting })
        console.log(`  ✓ ${setting.key}: ${setting.value}`)
      } else {
        console.log(`  ○ ${setting.key} (이미 존재)`)
      }
    }

    // 최종 통계
    console.log('\n📊 최종 데이터 통계:')
    const finalStats = {
      users: await prisma.user.count(),
      studies: await prisma.study.count(),
      reports: await prisma.report.count(),
      notifications: await prisma.notification.count(),
      tasks: await prisma.task.count(),
      settings: await prisma.setting.count()
    }

    console.log(`  👥 사용자: ${finalStats.users}명`)
    console.log(`  📚 스터디: ${finalStats.studies}개`)
    console.log(`  ⚠️  신고: ${finalStats.reports}건`)
    console.log(`  🔔 알림: ${finalStats.notifications}개`)
    console.log(`  ✅ 할일: ${finalStats.tasks}개`)
    console.log(`  ⚙️  설정: ${finalStats.settings}개`)

    console.log('\n✅ 데이터 시딩 완료!')
    console.log('\n📝 관리자 로그인 정보:')
    console.log(`  이메일: admin@coup.com`)
    console.log(`  비밀번호: admin1234`)

  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

