// src/lib/hooks/useApi.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authApi,
  userApi,
  dashboardApi,
  studyApi,
  chatApi,
  noticeApi,
  fileApi,
  calendarApi,
  taskApi,
  notificationApi,
  adminApi,
} from '@/lib/api'

// ==================== 사용자 ====================
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMe(),
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => userApi.getStats(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'me'])
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => userApi.changePassword(data),
  })
}

export function useSearchUsers(query) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => userApi.search(query),
    enabled: !!query.q,
  })
}

export function useUser(userId) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
  })
}

// ==================== 대시보드 ====================
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getData(),
  })
}

export function useMyStudies(params = {}) {
  return useQuery({
    queryKey: ['my-studies', params],
    queryFn: () => dashboardApi.getMyStudies(params),
  })
}

// ==================== 스터디 ====================
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => studyApi.getList(params),
  })
}

export function useStudy(id) {
  return useQuery({
    queryKey: ['studies', id],
    queryFn: () => studyApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => studyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useUpdateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => studyApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.id])
      queryClient.invalidateQueries(['studies'])
    },
  })
}

export function useDeleteStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => studyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useJoinStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => studyApi.join(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.id])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useLeaveStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => studyApi.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

// ==================== 스터디 멤버 ====================
export function useStudyMembers(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'members', params],
    queryFn: () => studyApi.getMembers(studyId, params),
    enabled: !!studyId,
  })
}

export function useJoinRequests(studyId) {
  return useQuery({
    queryKey: ['studies', studyId, 'join-requests'],
    queryFn: () => studyApi.getJoinRequests(studyId),
    enabled: !!studyId,
  })
}

export function useApproveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => studyApi.approveMember(studyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useRejectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => studyApi.rejectMember(studyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useKickMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => studyApi.kickMember(studyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
    },
  })
}

export function useChangeMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId, role }) => studyApi.changeMemberRole(studyId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
    },
  })
}

// ==================== 채팅 ====================
export function useMessages(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', params],
    queryFn: () => chatApi.getMessages(studyId, params),
    enabled: !!studyId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => chatApi.sendMessage(studyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, messageId }) => chatApi.deleteMessage(studyId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}

export function useSearchMessages(studyId, params) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', 'search', params],
    queryFn: () => chatApi.search(studyId, params),
    enabled: !!studyId && !!params.q,
  })
}

// ==================== 공지사항 ====================
export function useNotices(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', params],
    queryFn: () => noticeApi.getList(studyId, params),
    enabled: !!studyId,
  })
}

export function useNotice(studyId, noticeId) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', noticeId],
    queryFn: () => noticeApi.getById(studyId, noticeId),
    enabled: !!studyId && !!noticeId,
  })
}

export function useCreateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => noticeApi.create(studyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}

export function useUpdateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId, data }) => noticeApi.update(studyId, noticeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices', variables.noticeId])
    },
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => noticeApi.delete(studyId, noticeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}

export function useTogglePinNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => noticeApi.togglePin(studyId, noticeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}

// ==================== 파일 ====================
export function useFiles(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'files', params],
    queryFn: () => fileApi.getList(studyId, params),
    enabled: !!studyId,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, formData }) => fileApi.upload(studyId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, fileId }) => fileApi.delete(studyId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}

// ==================== 캘린더 ====================
export function useEvents(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'calendar', params],
    queryFn: () => calendarApi.getEvents(studyId, params),
    enabled: !!studyId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => calendarApi.createEvent(studyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId, data }) => calendarApi.updateEvent(studyId, eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId }) => calendarApi.deleteEvent(studyId, eventId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

// ==================== 할일 ====================
export function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getList(params),
  })
}

export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['tasks', variables.id])
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => taskApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => taskApi.getStats(),
  })
}

// ==================== 알림 ====================
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.getList(params),
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}

// ==================== 관리자 ====================
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
  })
}

export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  })
}

export function useAdminUser(id) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.suspendUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
    },
  })
}

export function useRestoreUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
    },
  })
}

export function useAdminStudies(params = {}) {
  return useQuery({
    queryKey: ['admin', 'studies', params],
    queryFn: () => adminApi.getStudies(params),
  })
}

export function useAdminDeleteStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminApi.deleteStudy(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'studies'])
    },
  })
}

export function useAdminReports(params = {}) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  })
}

export function useAdminReport(id) {
  return useQuery({
    queryKey: ['admin', 'reports', id],
    queryFn: () => adminApi.getReport(id),
    enabled: !!id,
  })
}

export function useProcessReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.processReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'reports'])
    },
  })
}
