// scripts/check-admin-data.js
/**
 * 관리자 페이지에 필요한 데이터 확인 스크립트
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdminData() {
  try {
    console.log('🔍 관리자 데이터 확인 중...\n')

    // 1. 관리자 계정 확인
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SYSTEM_ADMIN'] }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    })

    console.log('👥 관리자 계정:')
    if (admins.length === 0) {
      console.log('   ⚠️  관리자 계정이 없습니다!')
      console.log('   💡 다음 명령어로 관리자를 생성하세요:')
      console.log('      node scripts/create-admin.js admin@coup.com ADMIN')
    } else {
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role}) [${admin.status}]`)
      })
    }

    // 2. 사용자 통계
    const userStats = {
      total: await prisma.user.count({ where: { status: { not: 'DELETED' } } }),
      active: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      suspended: await prisma.user.count({ where: { status: 'SUSPENDED' } })
    }

    console.log('\n📊 사용자 통계:')
    console.log(`   전체: ${userStats.total}명`)
    console.log(`   활성: ${userStats.active}명`)
    console.log(`   정지: ${userStats.suspended}명`)

    // 3. 스터디 통계
    const studyCount = await prisma.study.count()
    console.log('\n📚 스터디 통계:')
    console.log(`   전체: ${studyCount}개`)

    // 4. Report 테이블 확인
    try {
      const reportCount = await prisma.report.count()
      const pendingReports = await prisma.report.count({
        where: { status: 'PENDING' }
      })
      console.log('\n🚨 신고 통계:')
      console.log(`   전체: ${reportCount}건`)
      console.log(`   미처리: ${pendingReports}건`)
    } catch (error) {
      console.log('\n⚠️  Report 테이블 접근 실패:')
      console.log(`   ${error.message}`)
      console.log('   💡 Prisma 마이그레이션이 필요할 수 있습니다.')
    }

    // 5. Sanction 테이블 확인
    try {
      const sanctionCount = await prisma.sanction.count()
      const sanctionsByType = await prisma.sanction.groupBy({
        by: ['type'],
        _count: true
      })
      console.log('\n⚖️  제재 기록:')
      console.log(`   전체: ${sanctionCount}건`)
      sanctionsByType.forEach(item => {
        console.log(`   - ${item.type}: ${item._count}건`)
      })
    } catch (error) {
      console.log('\n⚠️  Sanction 테이블 접근 실패:')
      console.log(`   ${error.message}`)
      console.log('   💡 Prisma 마이그레이션이 필요할 수 있습니다.')
    }

    // 6. SystemSetting 테이블 확인 (SYSTEM_ADMIN 전용)
    try {
      const settingsCount = await prisma.systemSetting.count()
      console.log('\n⚙️  시스템 설정:')
      if (settingsCount === 0) {
        console.log('   ⚠️  시스템 설정이 없습니다!')
        console.log('   💡 기본 설정 데이터를 추가해야 합니다.')
      } else {
        console.log(`   전체: ${settingsCount}개 설정`)
        const sampleSettings = await prisma.systemSetting.findMany({
          take: 5,
          select: { key: true, value: true }
        })
        sampleSettings.forEach(s => {
          console.log(`   - ${s.key}: ${s.value}`)
        })
      }
    } catch (error) {
      console.log('\n⚠️  SystemSetting 테이블 접근 실패:')
      console.log(`   ${error.message}`)
      console.log('   💡 SystemSetting 테이블이 없습니다. 스키마에 추가 필요!')
    }

    // 7. AdminLog 테이블 확인 (SYSTEM_ADMIN 전용)
    try {
      const logCount = await prisma.adminLog.count()
      console.log('\n📋 관리자 활동 로그:')
      console.log(`   전체: ${logCount}건`)
      if (logCount > 0) {
        const recentLogs = await prisma.adminLog.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            action: true,
            createdAt: true
          }
        })
        console.log('   최근 활동:')
        recentLogs.forEach(log => {
          console.log(`   - ${log.action} (${log.createdAt.toLocaleDateString()})`)
        })
      }
    } catch (error) {
      console.log('\n⚠️  AdminLog 테이블 접근 실패:')
      console.log(`   ${error.message}`)
      console.log('   💡 AdminLog 테이블이 없습니다. 스키마에 추가 필요!')
    }

    // 8. EmailTemplate 테이블 확인 (SYSTEM_ADMIN 전용)
    try {
      const templateCount = await prisma.emailTemplate.count()
      console.log('\n📧 이메일 템플릿:')
      if (templateCount === 0) {
        console.log('   ⚠️  이메일 템플릿이 없습니다!')
        console.log('   💡 기본 템플릿을 추가해야 합니다.')
      } else {
        console.log(`   전체: ${templateCount}개 템플릿`)
        const templates = await prisma.emailTemplate.findMany({
          select: { name: true, subject: true }
        })
        templates.forEach(t => {
          console.log(`   - ${t.name}: ${t.subject}`)
        })
      }
    } catch (error) {
      console.log('\n⚠️  EmailTemplate 테이블 접근 실패:')
      console.log(`   ${error.message}`)
      console.log('   💡 EmailTemplate 테이블이 없습니다. 스키마에 추가 필요!')
    }

    // 9. FunctionRestriction 테이블 확인
    try {
      const restrictionCount = await prisma.functionRestriction.count()
      console.log('\n🚫 기능 제한:')
      console.log(`   전체: ${restrictionCount}건`)
    } catch (error) {
      console.log('\n⚠️  FunctionRestriction 테이블 접근 실패:')
      console.log(`   ${error.message}`)
    }

    // 10. SYSTEM_ADMIN 전용 기능 목록
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 SYSTEM_ADMIN 전용 기능 체크리스트:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const systemAdminFeatures = [
      { name: '시스템 설정 관리', table: 'SystemSetting', implemented: false },
      { name: '이메일 템플릿 관리', table: 'EmailTemplate', implemented: false },
      { name: '관리자 권한 관리', api: '/api/admin/manage-admins', implemented: false },
      { name: '관리자 활동 로그', table: 'AdminLog', implemented: false },
      { name: '데이터 익스포트', api: '/api/admin/export', implemented: false },
      { name: '사용자 완전 삭제', api: '/api/admin/users/[id]/delete', implemented: false },
      { name: '감사 로그 조회', api: '/api/admin/audit-logs', implemented: false },
      { name: '플랫폼 통계 (고급)', api: '/api/admin/analytics', implemented: false },
    ]

    systemAdminFeatures.forEach((feature, idx) => {
      const status = feature.implemented ? '✅' : '⚠️'
      console.log(`${status} ${idx + 1}. ${feature.name}`)
      if (feature.table) {
        console.log(`   └─ 테이블: ${feature.table}`)
      }
      if (feature.api) {
        console.log(`   └─ API: ${feature.api}`)
      }
    })

    console.log('\n✅ 데이터 확인 완료!\n')

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminData()

