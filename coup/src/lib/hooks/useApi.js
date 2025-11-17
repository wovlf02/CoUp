// src/lib/hooks/useApi.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/utils/apiClient'

// ============================================
// Dashboard
// ============================================
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard'),
  })
}

// ============================================
// Studies
// ============================================
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => api.get('/studies', params),
  })
}

export function useStudy(studyId) {
  return useQuery({
    queryKey: ['study', studyId],
    queryFn: () => api.get(`/studies/${studyId}`),
    enabled: !!studyId,
  })
}

export function useCreateStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post('/studies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studies'] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
    },
  })
}

export function useJoinStudy(studyId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post(`/studies/${studyId}/join`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study', studyId] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
    },
  })
}

// ============================================
// My Studies
// ============================================
export function useMyStudies(params = {}) {
  return useQuery({
    queryKey: ['my-studies', params],
    queryFn: () => api.get('/my-studies', params),
  })
}

// ============================================
// Notifications
// ============================================
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.get('/notifications', params),
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId) => api.post(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ============================================
// Tasks
// ============================================
export function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/tasks', params),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId) => api.patch(`/tasks/${taskId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ============================================
// Notices
// ============================================
export function useNotices(studyId, params = {}) {
  return useQuery({
    queryKey: ['notices', studyId, params],
    queryFn: () => api.get(`/studies/${studyId}/notices`, params),
    enabled: !!studyId,
  })
}

export function useCreateNotice(studyId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post(`/studies/${studyId}/notices`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices', studyId] })
    },
  })
}

// ============================================
// Calendar
// ============================================
export function useCalendar(studyId, params = {}) {
  return useQuery({
    queryKey: ['calendar', studyId, params],
    queryFn: () => api.get(`/studies/${studyId}/calendar`, params),
    enabled: !!studyId,
  })
}

export function useCreateEvent(studyId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post(`/studies/${studyId}/calendar`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', studyId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ============================================
// Chat
// ============================================
export function useChat(studyId, params = {}) {
  return useQuery({
    queryKey: ['chat', studyId, params],
    queryFn: () => api.get(`/studies/${studyId}/chat`, params),
    enabled: !!studyId,
    refetchInterval: 5000, // 5초마다 폴링
  })
}

export function useSendMessage(studyId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post(`/studies/${studyId}/chat`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', studyId] })
    },
  })
}

// ============================================
// Files
// ============================================
export function useFiles(studyId, params = {}) {
  return useQuery({
    queryKey: ['files', studyId, params],
    queryFn: () => api.get(`/studies/${studyId}/files`, params),
    enabled: !!studyId,
  })
}

export function useUploadFile(studyId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData) => api.upload(`/studies/${studyId}/files`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', studyId] })
    },
  })
}

// ============================================
// User
// ============================================
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me'),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.patch('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

// ============================================
// Admin
// ============================================
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
  })
}

export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => api.get('/admin/users', params),
  })
}

export function useAdminStudies(params = {}) {
  return useQuery({
    queryKey: ['admin-studies', params],
    queryFn: () => api.get('/admin/studies', params),
  })
}

