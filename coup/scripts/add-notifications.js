require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // kim@example.com 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: 'kim@example.com' }
    });

    if (!user) {
      console.log('kim@example.com 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('사용자 찾음:', user.id, user.name);

    // 사용자가 소속한 스터디 찾기
    const memberships = await prisma.studyMember.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        study: true
      }
    });

    if (memberships.length === 0) {
      console.log('소속된 스터디가 없습니다.');
      return;
    }

    console.log('소속 스터디:', memberships.map(m => m.study.name).join(', '));

    // 스터디별로 알림 생성
    const notificationsData = [];

    memberships.forEach((membership, index) => {
      const study = membership.study;

      // 각 스터디마다 다양한 알림 추가
      if (index === 0) {
        notificationsData.push({
          userId: user.id,
          type: 'NOTICE',
          message: '새로운 공지사항이 등록되었습니다.',
          studyId: study.id,
          studyName: study.name,
          studyEmoji: study.emoji,
          isRead: false
        });
      }

      if (index === 1 || memberships.length === 1) {
        notificationsData.push({
          userId: user.id,
          type: 'TASK',
          message: '새로운 과제가 등록되었습니다: Chapter 5 복습',
          studyId: study.id,
          studyName: study.name,
          studyEmoji: study.emoji,
          isRead: false
        });
      }

      if (index === 2 || memberships.length <= 2) {
        notificationsData.push({
          userId: user.id,
          type: 'EVENT',
          message: '내일 오후 7시에 정기 모임이 있습니다.',
          studyId: study.id,
          studyName: study.name,
          studyEmoji: study.emoji,
          isRead: false
        });
      }

      notificationsData.push({
        userId: user.id,
        type: 'MEMBER',
        message: '새로운 멤버가 스터디에 참여했습니다.',
        studyId: study.id,
        studyName: study.name,
        studyEmoji: study.emoji,
        isRead: true
      });
    });

    // 알림 생성
    const notifications = await prisma.notification.createMany({
      data: notificationsData
    });

    console.log('알림 생성 완료:', notifications.count, '개');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

