// scripts/create-admin.js
/**
 * 관리자 계정 생성 스크립트
 *
 * 사용법:
 * node scripts/create-admin.js <email> [ADMIN|SYSTEM_ADMIN]
 *
 * 예시:
 * node scripts/create-admin.js admin@coup.com ADMIN
 * node scripts/create-admin.js superadmin@coup.com SYSTEM_ADMIN
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.error('❌ 사용법: node scripts/create-admin.js <email> [ADMIN|SYSTEM_ADMIN]')
    process.exit(1)
  }

  const email = args[0]
  const role = args[1] || 'ADMIN'

  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(role)) {
    console.error('❌ 역할은 ADMIN 또는 SYSTEM_ADMIN이어야 합니다')
    process.exit(1)
  }

  try {
    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // 기존 사용자의 역할 업데이트
      const updated = await prisma.user.update({
        where: { email },
        data: { role }
      })
      console.log('✅ 기존 사용자의 역할이 업데이트되었습니다:')
      console.log(`   이메일: ${updated.email}`)
      console.log(`   이름: ${updated.name}`)
      console.log(`   역할: ${updated.role}`)
    } else {
      // 새 관리자 계정 생성
      const password = 'admin1234' // 기본 비밀번호
      const hashedPassword = await bcrypt.hash(password, 10)

      const newAdmin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: role === 'SYSTEM_ADMIN' ? '시스템 관리자' : '관리자',
          role,
          status: 'ACTIVE'
        }
      })

      console.log('✅ 새 관리자 계정이 생성되었습니다:')
      console.log(`   이메일: ${newAdmin.email}`)
      console.log(`   비밀번호: ${password} (로그인 후 변경하세요!)`)
      console.log(`   역할: ${newAdmin.role}`)
    }

    // 관리자 통계
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    console.log('\n📊 전체 관리자 통계:')
    stats.forEach(stat => {
      if (stat.role !== 'USER') {
        console.log(`   ${stat.role}: ${stat._count}명`)
      }
    })

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

