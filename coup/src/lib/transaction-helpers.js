/**
 * 트랜잭션 헬퍼 함수
 * @module lib/transaction-helpers
 */

import { PrismaClient } from '@prisma/client';
import { logStudyError } from './exceptions/study-errors.js';

const prisma = new PrismaClient();

/**
 * 스터디 생성 트랜잭션
 * 스터디 생성 + OWNER 멤버 자동 생성
 *
 * @param {Object} studyData - 스터디 데이터
 * @param {string} ownerId - 소유자 ID
 * @returns {Promise<Object>} { study, member }
 */
export async function createStudyWithOwner(studyData, ownerId) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 스터디 생성
      const study = await tx.study.create({
        data: {
          ...studyData,
          currentMembers: 1
        }
      });

      // 2. OWNER 멤버 생성
      const member = await tx.studyMember.create({
        data: {
          studyId: study.id,
          userId: ownerId,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date()
        }
      });

      return { study, member };
    });

    console.log('✅ [TRANSACTION] 스터디 생성 완료:', {
      studyId: result.study.id,
      ownerId,
      studyName: result.study.name
    });

    return result;
  } catch (error) {
    logStudyError('createStudyWithOwner', error, {
      studyName: studyData.name,
      ownerId
    });
    throw error;
  }
}

/**
 * 스터디 삭제 트랜잭션
 * 관련된 모든 데이터 삭제
 *
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object>} 삭제된 데이터 통계
 */
export async function deleteStudyWithRelations(studyId) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 삭제 순서: 자식 -> 부모

      // 1. 채팅 메시지 삭제
      const messagesDeleted = await tx.studyMessage.deleteMany({
        where: { studyId }
      });

      // 2. 파일 삭제
      const filesDeleted = await tx.studyFile.deleteMany({
        where: { studyId }
      });

      // 3. 할일 삭제
      const tasksDeleted = await tx.studyTask.deleteMany({
        where: { studyId }
      });

      // 4. 일정 삭제
      const eventsDeleted = await tx.studyEvent.deleteMany({
        where: { studyId }
      });

      // 5. 공지 삭제
      const noticesDeleted = await tx.studyNotice.deleteMany({
        where: { studyId }
      });

      // 6. 멤버 삭제
      const membersDeleted = await tx.studyMember.deleteMany({
        where: { studyId }
      });

      // 7. 가입 요청 삭제 (있는 경우)
      const joinRequestsDeleted = await tx.studyJoinRequest?.deleteMany({
        where: { studyId }
      }) || { count: 0 };

      // 8. 스터디 삭제
      const study = await tx.study.delete({
        where: { id: studyId }
      });

      return {
        study,
        deleted: {
          messages: messagesDeleted.count,
          files: filesDeleted.count,
          tasks: tasksDeleted.count,
          events: eventsDeleted.count,
          notices: noticesDeleted.count,
          members: membersDeleted.count,
          joinRequests: joinRequestsDeleted.count
        }
      };
    });

    console.log('✅ [TRANSACTION] 스터디 삭제 완료:', {
      studyId,
      studyName: result.study.name,
      deletedCounts: result.deleted
    });

    return result;
  } catch (error) {
    logStudyError('deleteStudyWithRelations', error, { studyId });
    throw error;
  }
}

/**
 * 가입 요청 승인 트랜잭션
 * 요청 삭제 + 멤버 생성 + 정원 업데이트
 *
 * @param {string} requestId - 가입 요청 ID
 * @param {Object} studyInfo - 스터디 정보 { id, currentMembers, maxMembers }
 * @returns {Promise<Object>} { member, study }
 */
export async function approveJoinRequestWithMember(requestId, studyInfo) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 가입 요청 조회
      const joinRequest = await tx.studyJoinRequest.findUnique({
        where: { id: requestId }
      });

      if (!joinRequest) {
        throw new Error('가입 요청을 찾을 수 없습니다');
      }

      // 2. 정원 확인
      if (studyInfo.currentMembers >= studyInfo.maxMembers) {
        throw new Error('정원이 마감되었습니다');
      }

      // 3. 기존 멤버십 확인 및 업데이트
      const existingMember = await tx.studyMember.findFirst({
        where: {
          studyId: studyInfo.id,
          userId: joinRequest.userId
        }
      });

      let member;
      if (existingMember) {
        // 기존 멤버십이 있으면 업데이트 (PENDING -> ACTIVE)
        member = await tx.studyMember.update({
          where: { id: existingMember.id },
          data: {
            status: 'ACTIVE',
            role: 'MEMBER',
            joinedAt: new Date()
          }
        });
      } else {
        // 새로운 멤버십 생성
        member = await tx.studyMember.create({
          data: {
            studyId: studyInfo.id,
            userId: joinRequest.userId,
            role: 'MEMBER',
            status: 'ACTIVE',
            joinedAt: new Date()
          }
        });
      }

      // 4. 가입 요청 삭제
      await tx.studyJoinRequest.delete({
        where: { id: requestId }
      });

      // 5. 스터디 멤버 수 증가
      const study = await tx.study.update({
        where: { id: studyInfo.id },
        data: {
          currentMembers: {
            increment: 1
          }
        }
      });

      return { member, study };
    });

    console.log('✅ [TRANSACTION] 가입 승인 완료:', {
      studyId: studyInfo.id,
      userId: result.member.userId,
      currentMembers: result.study.currentMembers
    });

    return result;
  } catch (error) {
    logStudyError('approveJoinRequestWithMember', error, {
      requestId,
      studyId: studyInfo.id
    });
    throw error;
  }
}

/**
 * 멤버 강퇴 트랜잭션
 * 멤버 상태 변경 + 정원 감소
 *
 * @param {string} memberId - 멤버 ID
 * @param {string} studyId - 스터디 ID
 * @param {string} reason - 강퇴 사유 (선택)
 * @returns {Promise<Object>} { member, study }
 */
export async function kickMemberWithUpdate(memberId, studyId, reason = null) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 멤버 상태를 KICKED로 변경
      const member = await tx.studyMember.update({
        where: { id: memberId },
        data: {
          status: 'KICKED',
          leftAt: new Date(),
          kickReason: reason
        }
      });

      // 2. 스터디 멤버 수 감소
      const study = await tx.study.update({
        where: { id: studyId },
        data: {
          currentMembers: {
            decrement: 1
          }
        }
      });

      return { member, study };
    });

    console.log('✅ [TRANSACTION] 멤버 강퇴 완료:', {
      studyId,
      memberId,
      currentMembers: result.study.currentMembers
    });

    return result;
  } catch (error) {
    logStudyError('kickMemberWithUpdate', error, {
      memberId,
      studyId
    });
    throw error;
  }
}

/**
 * 멤버 탈퇴 트랜잭션
 * 멤버 상태 변경 + 정원 감소
 *
 * @param {string} memberId - 멤버 ID
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object>} { member, study }
 */
export async function leaveMemberWithUpdate(memberId, studyId) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 멤버 상태를 LEFT로 변경
      const member = await tx.studyMember.update({
        where: { id: memberId },
        data: {
          status: 'LEFT',
          leftAt: new Date()
        }
      });

      // 2. 스터디 멤버 수 감소
      const study = await tx.study.update({
        where: { id: studyId },
        data: {
          currentMembers: {
            decrement: 1
          }
        }
      });

      return { member, study };
    });

    console.log('✅ [TRANSACTION] 멤버 탈퇴 완료:', {
      studyId,
      memberId,
      currentMembers: result.study.currentMembers
    });

    return result;
  } catch (error) {
    logStudyError('leaveMemberWithUpdate', error, {
      memberId,
      studyId
    });
    throw error;
  }
}

/**
 * 스터디 가입 트랜잭션 (자동 승인)
 * 멤버 생성 + 정원 증가
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {boolean} autoApprove - 자동 승인 여부
 * @returns {Promise<Object>} { member, study }
 */
export async function joinStudyWithMember(studyId, userId, autoApprove = true) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 기존 멤버십 확인
      const existingMember = await tx.studyMember.findFirst({
        where: {
          studyId,
          userId
        }
      });

      let member;
      const memberData = {
        role: 'MEMBER',
        status: autoApprove ? 'ACTIVE' : 'PENDING',
        joinedAt: autoApprove ? new Date() : null
      };

      if (existingMember) {
        // 기존 멤버십 업데이트
        member = await tx.studyMember.update({
          where: { id: existingMember.id },
          data: memberData
        });
      } else {
        // 새로운 멤버십 생성
        member = await tx.studyMember.create({
          data: {
            studyId,
            userId,
            ...memberData
          }
        });
      }

      // 2. 자동 승인인 경우 멤버 수 증가
      let study;
      if (autoApprove) {
        study = await tx.study.update({
          where: { id: studyId },
          data: {
            currentMembers: {
              increment: 1
            }
          }
        });
      } else {
        study = await tx.study.findUnique({
          where: { id: studyId }
        });
      }

      return { member, study };
    });

    console.log('✅ [TRANSACTION] 스터디 가입 완료:', {
      studyId,
      userId,
      autoApprove,
      status: result.member.status
    });

    return result;
  } catch (error) {
    logStudyError('joinStudyWithMember', error, {
      studyId,
      userId,
      autoApprove
    });
    throw error;
  }
}

/**
 * 스터디 업데이트 (정원 변경 시 검증 포함)
 *
 * @param {string} studyId - 스터디 ID
 * @param {Object} updateData - 업데이트 데이터
 * @returns {Promise<Object>} 업데이트된 스터디
 */
export async function updateStudyWithValidation(studyId, updateData) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 현재 스터디 조회
      const currentStudy = await tx.study.findUnique({
        where: { id: studyId }
      });

      if (!currentStudy) {
        throw new Error('스터디를 찾을 수 없습니다');
      }

      // 2. maxMembers 변경 시 검증
      if (updateData.maxMembers !== undefined) {
        if (updateData.maxMembers < currentStudy.currentMembers) {
          throw new Error(
            `최대 인원은 현재 멤버 수(${currentStudy.currentMembers}명)보다 작을 수 없습니다`
          );
        }
      }

      // 3. 스터디 업데이트
      const study = await tx.study.update({
        where: { id: studyId },
        data: updateData
      });

      return study;
    });

    console.log('✅ [TRANSACTION] 스터디 업데이트 완료:', {
      studyId,
      updatedFields: Object.keys(updateData)
    });

    return result;
  } catch (error) {
    logStudyError('updateStudyWithValidation', error, {
      studyId,
      updateData
    });
    throw error;
  }
}

/**
 * 역할 변경 트랜잭션 (검증 포함)
 *
 * @param {string} memberId - 멤버 ID
 * @param {string} newRole - 새 역할
 * @param {string} currentRole - 현재 역할 (검증용)
 * @returns {Promise<Object>} 업데이트된 멤버
 */
export async function changeRoleWithValidation(memberId, newRole, currentRole) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 현재 멤버 조회
      const member = await tx.studyMember.findUnique({
        where: { id: memberId }
      });

      if (!member) {
        throw new Error('멤버를 찾을 수 없습니다');
      }

      // 2. OWNER 역할 변경 방지
      if (member.role === 'OWNER') {
        throw new Error('스터디장의 역할은 변경할 수 없습니다');
      }

      // 3. 유효한 역할인지 확인
      if (!['ADMIN', 'MEMBER'].includes(newRole)) {
        throw new Error('역할은 ADMIN 또는 MEMBER만 가능합니다');
      }

      // 4. 역할 변경
      const updatedMember = await tx.studyMember.update({
        where: { id: memberId },
        data: { role: newRole }
      });

      return updatedMember;
    });

    console.log('✅ [TRANSACTION] 역할 변경 완료:', {
      memberId,
      oldRole: currentRole,
      newRole
    });

    return result;
  } catch (error) {
    logStudyError('changeRoleWithValidation', error, {
      memberId,
      newRole,
      currentRole
    });
    throw error;
  }
}

/**
 * 트랜잭션 재시도 래퍼
 * 동시성 오류 발생 시 자동 재시도
 *
 * @param {Function} transactionFn - 트랜잭션 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @returns {Promise<any>} 트랜잭션 결과
 */
export async function retryTransaction(transactionFn, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transactionFn();
    } catch (error) {
      lastError = error;

      // P2034: 트랜잭션 충돌 (재시도 가능)
      if (error.code === 'P2034' && attempt < maxRetries) {
        console.warn(`⚠️ [TRANSACTION] 재시도 ${attempt}/${maxRetries}:`, error.message);
        // 지수 백오프
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

