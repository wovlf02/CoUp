/**
 * Group Business Exception
 *
 * @description
 * 그룹 비즈니스 로직 예외 처리 클래스 (17개 에러)
 * GROUP-058 ~ GROUP-076
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import GroupException from './GroupException.js';

export default class GroupBusinessException extends GroupException {
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message, code, statusCode, securityLevel, context);
    this.name = 'GroupBusinessException';
    this.category = 'business';
  }

  // ========================================
  // 그룹 존재 확인 (3개)
  // ========================================

  static groupNotFound(groupId) {
    return GroupException.groupNotFound(groupId);
  }

  static groupDeleted(groupId) {
    return GroupException.groupDeleted(groupId);
  }

  static privateGroupAccessDenied(groupId) {
    return GroupException.privateGroupAccessDenied(groupId);
  }

  // ========================================
  // 그룹 삭제 (4개)
  // ========================================

  static insufficientPermissionToDelete() {
    return GroupException.insufficientPermissionToDelete();
  }

  static cannotDeleteWithActiveMembers(memberCount) {
    return GroupException.cannotDeleteWithActiveMembers(memberCount);
  }

  static cannotDeleteWithActiveProjects(projectCount) {
    return GroupException.cannotDeleteWithActiveProjects(projectCount);
  }

  static groupDeletionFailed(reason) {
    return GroupException.groupDeletionFailed(reason);
  }

  // ========================================
  // 그룹 수정 (2개)
  // ========================================

  static groupStatusUpdateFailed(reason) {
    return GroupException.groupStatusUpdateFailed(reason);
  }

  static groupRecruitingClosed(groupId) {
    return GroupException.groupRecruitingClosed(groupId);
  }

  // ========================================
  // 가입 관리 (4개)
  // ========================================

  static groupNotJoinable(reason) {
    return GroupException.groupNotJoinable(reason);
  }

  static inviteOnlyGroup() {
    return GroupException.inviteOnlyGroup();
  }

  static duplicateJoinRequest() {
    return GroupException.duplicateJoinRequest();
  }

  static joinRequestPending() {
    return GroupException.joinRequestPending();
  }

  // ========================================
  // 탈퇴 관리 (3개)
  // ========================================

  static cannotLeaveWithActiveTasks(taskCount) {
    return GroupException.cannotLeaveWithActiveTasks(taskCount);
  }

  static leaveFailed(reason) {
    return GroupException.leaveFailed(reason);
  }

  static alreadyLeftGroup() {
    return GroupException.alreadyLeftGroup();
  }

  // ========================================
  // 기타 (2개)
  // ========================================

  static groupSuspended(groupId, reason) {
    return GroupException.groupSuspended(groupId, reason);
  }

  static databaseError(operation, details) {
    return GroupException.databaseError(operation, details);
  }
}

