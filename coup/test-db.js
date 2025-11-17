// test-db.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing database connection...\n')

  try {
    // 사용자 조회
    const users = await prisma.user.findMany()
    console.log('✅ Users:', users.length)

    // 스터디 조회
    const studies = await prisma.study.findMany()
    console.log('✅ Studies:', studies.length)

    // 스터디 멤버 조회
    const members = await prisma.studyMember.findMany({
      include: {
        user: { select: { name: true, email: true } },
        study: { select: { name: true } },
      },
    })
    console.log('✅ Study Members:', members.length)

    // 공지사항 조회
    const notices = await prisma.notice.findMany()
    console.log('✅ Notices:', notices.length)

    // 할일 조회
    const tasks = await prisma.task.findMany()
    console.log('✅ Tasks:', tasks.length)

    // 알림 조회
    const notifications = await prisma.notification.findMany()
    console.log('✅ Notifications:', notifications.length)

    console.log('\n📊 Sample Data:')
    console.log('\nFirst User:')
    console.log('  Email:', users[0].email)
    console.log('  Name:', users[0].name)
    console.log('  Role:', users[0].role)

    console.log('\nFirst Study:')
    console.log('  Name:', studies[0].name)
    console.log('  Emoji:', studies[0].emoji)
    console.log('  Category:', studies[0].category)
    console.log('  Members:', studies[0].maxMembers)

    console.log('\nFirst Member:')
    console.log('  User:', members[0].user.name)
    console.log('  Study:', members[0].study.name)
    console.log('  Role:', members[0].role)

    console.log('\n🎉 Database connection successful!')
    console.log('✅ All tables are working correctly!\n')

  } catch (error) {
    console.error('❌ Database connection error:')
    console.error(error.message)
    process.exit(1)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })

