// src/lib/hooks/useApi.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// ==================== 사용자 ====================
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.get('/api/auth/me'),
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => api.get('/api/user/stats'),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/api/user/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'me'])
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => api.put('/api/user/password', data),
  })
}

export function useSearchUsers(query) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => api.get('/api/users/search', { q: query }),
    enabled: !!query,
  })
}

export function useUser(userId) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.get(`/api/users/${userId}`),
    enabled: !!userId,
  })
}

// ==================== 대시보드 ====================
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
  })
}

export function useMyStudies(params = {}) {
  return useQuery({
    queryKey: ['my-studies', params],
    queryFn: () => api.get('/api/my-studies', params),
  })
}

// ==================== 스터디 ====================
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => api.get('/api/studies', params),
  })
}

export function useStudy(id) {
  return useQuery({
    queryKey: ['studies', id],
    queryFn: () => api.get(`/api/studies/${id}`),
    enabled: !!id,
  })
}

export function useCreateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/studies', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useUpdateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/studies/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.id])
      queryClient.invalidateQueries(['studies'])
    },
  })
}

export function useDeleteStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/studies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useJoinStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/api/studies/${id}/join`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.id])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useLeaveStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/studies/${id}/leave`),
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
    queryFn: () => api.get(`/api/studies/${studyId}/members`, params),
    enabled: !!studyId,
  })
}

export function useJoinRequests(studyId) {
  return useQuery({
    queryKey: ['studies', studyId, 'join-requests'],
    queryFn: () => api.get(`/api/studies/${studyId}/join-requests`),
    enabled: !!studyId,
  })
}

export function useApproveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => api.post(`/api/studies/${studyId}/members/${userId}/approve`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useRejectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => api.post(`/api/studies/${studyId}/members/${userId}/reject`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useKickMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => api.post(`/api/studies/${studyId}/members/${userId}/kick`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
    },
  })
}

export function useChangeMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, memberId, role }) => api.patch(`/api/studies/${studyId}/members/${memberId}`, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
    },
  })
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, requestId }) => api.post(`/api/studies/${studyId}/join-requests/${requestId}/approve`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, requestId, reason }) => api.post(`/api/studies/${studyId}/join-requests/${requestId}/reject`, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

// ==================== 채팅 ====================
export function useMessages(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat`, params),
    enabled: !!studyId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/chat`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, messageId }) => api.delete(`/api/studies/${studyId}/chat/${messageId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}

export function useSearchMessages(studyId, params) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', 'search', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat/search`, params),
    enabled: !!studyId && !!params.q,
  })
}

// ==================== 공지사항 ====================
export function useNotices(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', params],
    queryFn: () => api.get(`/api/studies/${studyId}/notices`, params),
    enabled: !!studyId,
  })
}

export function useNotice(studyId, noticeId) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', noticeId],
    queryFn: () => api.get(`/api/studies/${studyId}/notices/${noticeId}`),
    enabled: !!studyId && !!noticeId,
  })
}

export function useCreateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/notices`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}

export function useUpdateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId, data }) => api.put(`/api/studies/${studyId}/notices/${noticeId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices', variables.noticeId])
    },
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => api.delete(`/api/studies/${studyId}/notices/${noticeId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}

export function useTogglePinNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => api.post(`/api/studies/${studyId}/notices/${noticeId}/toggle-pin`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}

// ==================== 파일 ====================
export function useFiles(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'files', params],
    queryFn: () => api.get(`/api/studies/${studyId}/files`, params),
    enabled: !!studyId,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, formData }) => api.post(`/api/studies/${studyId}/files`, formData, { headers: {} }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, fileId }) => api.delete(`/api/studies/${studyId}/files/${fileId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}

// ==================== 캘린더 ====================
export function useEvents(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'calendar', params],
    queryFn: () => api.get(`/api/studies/${studyId}/calendar`, params),
    enabled: !!studyId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/calendar`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId, data }) => api.put(`/api/studies/${studyId}/calendar/${eventId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId }) => api.delete(`/api/studies/${studyId}/calendar/${eventId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

// ==================== 할일 ====================
export function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/api/tasks', params),
  })
}

export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get(`/api/tasks/${id}`),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/tasks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['tasks', variables.id])
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/tasks/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

// ==================== 스터디 할일 ====================
export function useStudyTasks(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'tasks', params],
    queryFn: () => api.get(`/api/studies/${studyId}/tasks`, params),
    enabled: !!studyId,
  })
}

export function useCreateStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/tasks`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}

export function useUpdateStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, taskId, data }) => api.put(`/api/studies/${studyId}/tasks/${taskId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}

export function useDeleteStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, taskId }) => api.delete(`/api/studies/${studyId}/tasks/${taskId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => api.get('/api/tasks/stats'),
  })
}

// ==================== 알림 ====================
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.get('/api/notifications', params),
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}
