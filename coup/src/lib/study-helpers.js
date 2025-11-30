/**
 * 스터디 관련 유틸리티 함수
 * @module lib/study-helpers
 */

import { STUDY_ERRORS, createStudyErrorResponse } from './exceptions/study-errors.js';

/**
 * 역할 계층 구조 정의
 * 숫자가 클수록 높은 권한
 */
const ROLE_HIERARCHY = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3
};

/**
 * 스터디 정원 확인
 * @param {Object} study - 스터디 객체
 * @returns {Object} { isFull: boolean, currentCount: number, maxMembers: number }
 */
export function checkStudyCapacity(study) {
  const currentCount = study.currentMembers || 0;
  const maxMembers = study.maxMembers || 50;

  return {
    isFull: currentCount >= maxMembers,
    currentCount,
    maxMembers,
    availableSlots: maxMembers - currentCount
  };
}

/**
 * 멤버 수정 권한 확인
 * @param {string} actorRole - 작업 수행자의 역할
 * @param {string} targetRole - 대상 멤버의 역할
 * @returns {boolean} 권한 여부
 */
export function canModifyMember(actorRole, targetRole) {
  const actorLevel = ROLE_HIERARCHY[actorRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

  // OWNER는 모든 멤버를 수정할 수 있음
  if (actorRole === 'OWNER') {
    return true;
  }

  // ADMIN은 MEMBER만 수정할 수 있음 (ADMIN, OWNER 불가)
  if (actorRole === 'ADMIN') {
    return targetRole === 'MEMBER';
  }

  // MEMBER는 아무도 수정할 수 없음
  return false;
}

/**
 * 역할 변경 권한 확인
 * @param {string} actorRole - 작업 수행자의 역할
 * @param {string} targetRole - 대상 멤버의 현재 역할
 * @param {string} newRole - 변경할 역할
 * @returns {Object} { canChange: boolean, reason?: string }
 */
export function canChangeRole(actorRole, targetRole, newRole) {
  // OWNER만 역할을 변경할 수 있음
  if (actorRole !== 'OWNER') {
    return {
      canChange: false,
      reason: '스터디장만 역할을 변경할 수 있습니다'
    };
  }

  // OWNER의 역할은 변경할 수 없음
  if (targetRole === 'OWNER') {
    return {
      canChange: false,
      reason: '스터디장의 역할은 변경할 수 없습니다'
    };
  }

  // 유효한 역할인지 확인 (OWNER 제외)
  if (newRole !== 'ADMIN' && newRole !== 'MEMBER') {
    return {
      canChange: false,
      reason: '역할은 ADMIN 또는 MEMBER만 가능합니다'
    };
  }

  return { canChange: true };
}

/**
 * 역할이 유효한지 확인
 * @param {string} role - 확인할 역할
 * @returns {boolean} 유효 여부
 */
export function isValidRole(role) {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(role);
}

/**
 * 멤버 상태가 유효한지 확인
 * @param {string} status - 확인할 상태
 * @returns {boolean} 유효 여부
 */
export function isValidMemberStatus(status) {
  return ['PENDING', 'ACTIVE', 'KICKED', 'LEFT'].includes(status);
}

/**
 * 스터디 가입 가능 여부 확인
 * @param {Object} study - 스터디 객체
 * @param {Object|null} existingMember - 기존 멤버 정보 (있는 경우)
 * @returns {Object} { canJoin: boolean, reason?: string }
 */
export function canJoinStudy(study, existingMember = null) {
  // 모집 중인지 확인
  if (!study.isRecruiting) {
    return {
      canJoin: false,
      reason: '현재 모집 중이 아닙니다',
      errorKey: 'STUDY_NOT_RECRUITING'
    };
  }

  // 정원 확인
  const capacity = checkStudyCapacity(study);
  if (capacity.isFull) {
    return {
      canJoin: false,
      reason: '정원이 마감되었습니다',
      errorKey: 'STUDY_FULL'
    };
  }

  // 기존 멤버십 확인
  if (existingMember) {
    if (existingMember.status === 'ACTIVE') {
      return {
        canJoin: false,
        reason: '이미 가입된 스터디입니다',
        errorKey: 'ALREADY_MEMBER'
      };
    }

    if (existingMember.status === 'PENDING') {
      return {
        canJoin: false,
        reason: '가입 승인 대기 중입니다',
        errorKey: 'PENDING_APPROVAL'
      };
    }

    if (existingMember.status === 'KICKED') {
      return {
        canJoin: false,
        reason: '강퇴된 스터디입니다. 스터디장에게 문의하세요',
        errorKey: 'KICKED_MEMBER'
      };
    }

    // LEFT 상태인 경우 재가입 쿨다운 확인
    if (existingMember.status === 'LEFT') {
      const cooldownDays = 7;
      const leftDate = new Date(existingMember.updatedAt);
      const now = new Date();
      const daysPassed = (now - leftDate) / (1000 * 60 * 60 * 24);

      if (daysPassed < cooldownDays) {
        return {
          canJoin: false,
          reason: `탈퇴 후 ${cooldownDays}일이 지나야 재가입할 수 있습니다`,
          errorKey: 'LEFT_MEMBER_COOLDOWN'
        };
      }
    }
  }

  return { canJoin: true };
}

/**
 * 멤버 강퇴 가능 여부 확인
 * @param {Object} actor - 작업 수행자 정보
 * @param {Object} target - 대상 멤버 정보
 * @returns {Object} { canKick: boolean, reason?: string }
 */
export function canKickMember(actor, target) {
  // 자기 자신은 강퇴할 수 없음
  if (actor.userId === target.userId) {
    return {
      canKick: false,
      reason: '자기 자신을 강퇴할 수 없습니다',
      errorKey: 'CANNOT_KICK_SELF'
    };
  }

  // OWNER는 강퇴할 수 없음
  if (target.role === 'OWNER') {
    return {
      canKick: false,
      reason: '스터디장을 강퇴할 수 없습니다',
      errorKey: 'CANNOT_KICK_OWNER'
    };
  }

  // 역할 계층 확인
  if (!canModifyMember(actor.role, target.role)) {
    return {
      canKick: false,
      reason: '권한이 부족합니다. 관리자는 다른 관리자를 강퇴할 수 없습니다',
      errorKey: 'CANNOT_KICK_ADMIN'
    };
  }

  return { canKick: true };
}

/**
 * 스터디 탈퇴 가능 여부 확인
 * @param {Object} member - 멤버 정보
 * @returns {Object} { canLeave: boolean, reason?: string }
 */
export function canLeaveStudy(member) {
  // OWNER는 탈퇴할 수 없음
  if (member.role === 'OWNER') {
    return {
      canLeave: false,
      reason: '스터디장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이전하세요',
      errorKey: 'OWNER_CANNOT_LEAVE'
    };
  }

  return { canLeave: true };
}

/**
 * 스터디 삭제 가능 여부 확인
 * @param {Object} member - 멤버 정보
 * @returns {Object} { canDelete: boolean, reason?: string }
 */
export function canDeleteStudy(member) {
  // OWNER만 삭제할 수 있음
  if (member.role !== 'OWNER') {
    return {
      canDelete: false,
      reason: '스터디장만 스터디를 삭제할 수 있습니다',
      errorKey: 'NOT_STUDY_OWNER'
    };
  }

  return { canDelete: true };
}

/**
 * 컨텐츠 수정 권한 확인 (공지, 파일, 할일 등)
 * @param {Object} member - 멤버 정보
 * @param {Object} content - 컨텐츠 정보
 * @returns {Object} { canModify: boolean, reason?: string }
 */
export function canModifyContent(member, content) {
  // OWNER와 ADMIN은 모든 컨텐츠 수정 가능
  if (member.role === 'OWNER' || member.role === 'ADMIN') {
    return { canModify: true };
  }

  // 일반 멤버는 자신이 작성한 컨텐츠만 수정 가능
  if (content.createdBy === member.userId) {
    return { canModify: true };
  }

  return {
    canModify: false,
    reason: '권한이 부족합니다',
    errorKey: 'INSUFFICIENT_PERMISSION'
  };
}

/**
 * 가입 요청 처리 권한 확인
 * @param {string} role - 멤버 역할
 * @returns {Object} { canProcess: boolean, reason?: string }
 */
export function canProcessJoinRequest(role) {
  // OWNER와 ADMIN만 가입 요청 처리 가능
  if (role === 'OWNER' || role === 'ADMIN') {
    return { canProcess: true };
  }

  return {
    canProcess: false,
    reason: '관리자 또는 스터디장만 가입 요청을 처리할 수 있습니다',
    errorKey: 'INSUFFICIENT_PERMISSION'
  };
}

/**
 * 스터디 설정 변경 권한 확인
 * @param {string} role - 멤버 역할
 * @returns {Object} { canChange: boolean, reason?: string }
 */
export function canChangeSettings(role) {
  // OWNER만 설정 변경 가능
  if (role === 'OWNER') {
    return { canChange: true };
  }

  return {
    canChange: false,
    reason: '스터디장만 설정을 변경할 수 있습니다',
    errorKey: 'NOT_STUDY_OWNER'
  };
}

/**
 * 역할 수준 비교
 * @param {string} role1 - 첫 번째 역할
 * @param {string} role2 - 두 번째 역할
 * @returns {number} role1이 더 높으면 양수, 같으면 0, 낮으면 음수
 */
export function compareRoles(role1, role2) {
  const level1 = ROLE_HIERARCHY[role1] || 0;
  const level2 = ROLE_HIERARCHY[role2] || 0;
  return level1 - level2;
}

/**
 * 멤버가 관리자 이상인지 확인
 * @param {string} role - 확인할 역할
 * @returns {boolean} 관리자 이상 여부
 */
export function isAdminOrOwner(role) {
  return role === 'ADMIN' || role === 'OWNER';
}

/**
 * 스터디 검색 쿼리 빌더
 * @param {Object} filters - 검색 필터
 * @returns {Object} Prisma where 쿼리
 */
export function buildStudySearchQuery(filters = {}) {
  const where = {};

  if (filters.keyword) {
    where.OR = [
      { name: { contains: filters.keyword } },
      { description: { contains: filters.keyword } }
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.isRecruiting !== undefined) {
    where.isRecruiting = filters.isRecruiting;
  }

  if (filters.minMembers) {
    where.currentMembers = {
      gte: parseInt(filters.minMembers)
    };
  }

  if (filters.maxMembers) {
    where.currentMembers = {
      ...where.currentMembers,
      lte: parseInt(filters.maxMembers)
    };
  }

  return where;
}

/**
 * 스터디 정렬 옵션 빌더
 * @param {string} sortBy - 정렬 기준
 * @param {string} order - 정렬 순서 (asc/desc)
 * @returns {Object} Prisma orderBy 쿼리
 */
export function buildStudySortQuery(sortBy = 'createdAt', order = 'desc') {
  const validSortFields = ['createdAt', 'updatedAt', 'name', 'currentMembers'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const direction = order === 'asc' ? 'asc' : 'desc';

  return { [field]: direction };
}

