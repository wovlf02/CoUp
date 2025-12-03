/**
 * Group Permission Exception
 *
 * @description
 * 그룹 권한 예외 처리 클래스 (10개 에러)
 * GROUP-021, GROUP-022, GROUP-023, GROUP-025, GROUP-041, GROUP-054, GROUP-060, GROUP-061, GROUP-065
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import GroupException from './GroupException.js';

export default class GroupPermissionException extends GroupException {
  constructor(message, code, statusCode = 403, securityLevel = 'critical', context = {}) {
    super(message, code, statusCode, securityLevel, context);
    this.name = 'GroupPermissionException';
    this.category = 'permission';
  }

  // ========================================
  // CRUD 권한 (5개)
  // ========================================

  static insufficientPermissionToCreate() {
    return GroupException.insufficientPermissionToCreate();
  }

  static insufficientPermissionToUpdate() {
    return GroupException.insufficientPermissionToUpdate();
  }

  static insufficientPermissionToDelete() {
    return GroupException.insufficientPermissionToDelete();
  }

  static insufficientPermissionToView() {
    return GroupException.insufficientPermissionToView();
  }

  static ownerCannotLeave() {
    return GroupException.ownerCannotLeave();
  }

  // ========================================
  // 멤버 관리 권한 (3개)
  // ========================================

  static insufficientPermissionToAddMember() {
    return GroupException.insufficientPermissionToAddMember();
  }

  static insufficientPermissionToRemoveMember() {
    return GroupException.insufficientPermissionToRemoveMember();
  }

  static insufficientPermissionToChangeRole() {
    return GroupException.insufficientPermissionToChangeRole();
  }

  // ========================================
  // 초대 권한 (2개)
  // ========================================

  static insufficientPermissionToInvite() {
    return GroupException.insufficientPermissionToInvite();
  }

  static insufficientPermissionToCancelInvite() {
    return GroupException.insufficientPermissionToCancelInvite();
  }
}

