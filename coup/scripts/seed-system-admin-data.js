// scripts/seed-system-admin-data.js
/**
 * SYSTEM_ADMIN 전용 기능에 필요한 기본 데이터 시드
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedSystemAdminData() {
  console.log('🌱 SYSTEM_ADMIN 데이터 시드 시작...\n')

  try {
    // 1. 시스템 설정 시드
    console.log('⚙️  시스템 설정 생성 중...')
    const systemSettings = [
      // 회원가입 설정
      { key: 'emailVerificationRequired', value: 'true', type: 'BOOLEAN', description: '이메일 인증 필수 여부' },
      { key: 'approvalRequired', value: 'false', type: 'BOOLEAN', description: '회원가입 승인 제도 활성화' },
      { key: 'emailDomainRestriction', value: 'BLACKLIST', type: 'STRING', description: '이메일 도메인 제한 (NONE/WHITELIST/BLACKLIST)' },
      { key: 'emailDomainBlacklist', value: JSON.stringify(['tempmail.com', 'throwaway.email', 'guerrillamail.com']), type: 'JSON', description: '차단할 이메일 도메인 목록' },
      { key: 'minimumAge', value: '14', type: 'NUMBER', description: '최소 가입 연령' },
      { key: 'allowGoogleLogin', value: 'true', type: 'BOOLEAN', description: 'Google 로그인 허용' },
      { key: 'allowGithubLogin', value: 'true', type: 'BOOLEAN', description: 'GitHub 로그인 허용' },

      // 스터디 생성 제한
      { key: 'minimumAccountAge', value: '3', type: 'NUMBER', description: '스터디 생성 최소 가입 기간(일)' },
      { key: 'maxStudiesPerUser', value: '5', type: 'NUMBER', description: '사용자당 최대 스터디 생성 개수' },
      { key: 'studyApprovalRequired', value: 'false', type: 'BOOLEAN', description: '스터디 생성 승인 제도' },

      // 파일 업로드 제한
      { key: 'maxFileSize', value: '50', type: 'NUMBER', description: '일반 파일 최대 크기(MB)' },
      { key: 'maxImageSize', value: '5', type: 'NUMBER', description: '이미지 최대 크기(MB)' },
      { key: 'maxProfileImageSize', value: '2', type: 'NUMBER', description: '프로필 이미지 최대 크기(MB)' },
      { key: 'allowedExtensions', value: JSON.stringify(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'png', 'gif', 'zip', 'rar']), type: 'JSON', description: '허용 파일 확장자' },
      { key: 'blockedExtensions', value: JSON.stringify(['exe', 'bat', 'sh', 'cmd', 'vbs']), type: 'JSON', description: '차단 파일 확장자' },
      { key: 'virusScanEnabled', value: 'true', type: 'BOOLEAN', description: '바이러스 스캔 활성화' },

      // 콘텐츠 필터링
      { key: 'autoFilterEnabled', value: 'true', type: 'BOOLEAN', description: '자동 필터링 활성화' },
      { key: 'filterStrength', value: 'MEDIUM', type: 'STRING', description: '필터링 강도 (LOW/MEDIUM/HIGH)' },
      { key: 'bannedWords', value: JSON.stringify([]), type: 'JSON', description: '금지어 목록 (보안상 마스킹)' },

      // 알림 설정
      { key: 'emailNotificationsEnabled', value: 'true', type: 'BOOLEAN', description: '이메일 알림 활성화' },
      { key: 'pushNotificationsEnabled', value: 'true', type: 'BOOLEAN', description: '푸시 알림 활성화' },
    ]

    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      })
    }
    console.log(`   ✅ ${systemSettings.length}개 설정 생성 완료`)

    // 2. 이메일 템플릿 시드
    console.log('\n📧 이메일 템플릿 생성 중...')
    const emailTemplates = [
      {
        name: 'welcome',
        type: 'AUTH',
        subject: 'CoUp에 오신 것을 환영합니다! 🎉',
        body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>환영합니다!</h1>
    </div>
    <div class="content">
      <p>안녕하세요, <strong>{{userName}}</strong>님!</p>
      <p>CoUp 커뮤니티에 가입해주셔서 감사합니다.</p>
      <p>이제 다양한 스터디 그룹에 참여하고, 함께 성장하는 즐거움을 경험하세요!</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{dashboardLink}}" class="button">대시보드 둘러보기</a>
      </p>
      <p>궁금한 점이 있으시면 언제든 문의해주세요.</p>
      <p>감사합니다,<br>CoUp 팀</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['userName', 'email', 'dashboardLink'],
        isActive: true
      },
      {
        name: 'email_verification',
        type: 'AUTH',
        subject: 'CoUp 이메일 주소를 인증해주세요 ✉️',
        body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; }
    .warning { color: #EF4444; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>이메일 인증</h1>
    </div>
    <div class="content">
      <p>안녕하세요, <strong>{{userName}}</strong>님!</p>
      <p>아래 버튼을 클릭하여 이메일 주소를 인증해주세요.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{verificationLink}}" class="button">이메일 인증하기</a>
      </p>
      <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
      <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
        {{verificationLink}}
      </p>
      <p class="warning">⚠️ 본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
      <p>감사합니다,<br>CoUp 팀</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['userName', 'email', 'verificationLink'],
        isActive: true
      },
      {
        name: 'password_reset',
        type: 'AUTH',
        subject: 'CoUp 비밀번호 재설정 🔒',
        body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 6px; }
    .warning { color: #EF4444; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>비밀번호 재설정</h1>
    </div>
    <div class="content">
      <p>안녕하세요, <strong>{{userName}}</strong>님!</p>
      <p>비밀번호 재설정 요청을 받았습니다.</p>
      <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{resetLink}}" class="button">비밀번호 재설정</a>
      </p>
      <p>이 링크는 <strong>1시간</strong> 동안 유효합니다.</p>
      <p class="warning">⚠️ 본인이 요청하지 않았다면 즉시 고객센터에 문의하세요!</p>
      <p>감사합니다,<br>CoUp 팀</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['userName', 'email', 'resetLink'],
        isActive: true
      },
      {
        name: 'sanction_warning',
        type: 'SANCTION',
        subject: '[CoUp] 경고 알림 ⚠️',
        body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .warning-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ 경고</h1>
    </div>
    <div class="content">
      <p>안녕하세요, <strong>{{userName}}</strong>님!</p>
      <p>귀하의 계정에 경고가 부여되었습니다.</p>
      <div class="warning-box">
        <strong>사유:</strong><br>
        {{reason}}
      </div>
      <p>현재 누적 경고: <strong>{{warningCount}}</strong>회</p>
      <p>⚠️ 경고가 3회 누적되면 계정이 정지될 수 있습니다.</p>
      <p>커뮤니티 가이드라인을 준수해주시기 바랍니다.</p>
      <p>감사합니다,<br>CoUp 운영팀</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['userName', 'reason', 'warningCount'],
        isActive: true
      },
      {
        name: 'sanction_suspend',
        type: 'SANCTION',
        subject: '[CoUp] 계정 정지 알림 🚫',
        body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .danger-box { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚫 계정 정지</h1>
    </div>
    <div class="content">
      <p>안녕하세요, <strong>{{userName}}</strong>님!</p>
      <p>귀하의 계정이 정지되었습니다.</p>
      <div class="danger-box">
        <strong>정지 사유:</strong><br>
        {{reason}}
        <br><br>
        <strong>정지 기간:</strong> {{duration}}<br>
        <strong>정지 해제일:</strong> {{suspendedUntil}}
      </div>
      <p>정지 기간 동안 계정 로그인이 제한됩니다.</p>
      <p>이의가 있으신 경우 고객센터로 문의해주세요.</p>
      <p>감사합니다,<br>CoUp 운영팀</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['userName', 'reason', 'duration', 'suspendedUntil'],
        isActive: true
      },
      {
        name: 'system_notice',
        type: 'SYSTEM',
        subject: '[CoUp] {{noticeTitle}}',
        body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6366F1; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 공지사항</h1>
    </div>
    <div class="content">
      <h2>{{noticeTitle}}</h2>
      <div>{{noticeContent}}</div>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        발송일: {{sentAt}}
      </p>
      <p>감사합니다,<br>CoUp 운영팀</p>
    </div>
  </div>
</body>
</html>`,
        variables: ['noticeTitle', 'noticeContent', 'sentAt'],
        isActive: true
      }
    ]

    for (const template of emailTemplates) {
      await prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template
      })
    }
    console.log(`   ✅ ${emailTemplates.length}개 템플릿 생성 완료`)

    console.log('\n✅ SYSTEM_ADMIN 데이터 시드 완료!\n')
    console.log('💡 다음 단계:')
    console.log('   1. 개발 서버 재시작')
    console.log('   2. /admin/settings 페이지에서 설정 확인')
    console.log('   3. node scripts/check-admin-data.js 실행하여 검증\n')

  } catch (error) {
    console.error('❌ 시드 실패:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedSystemAdminData()

