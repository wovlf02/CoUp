import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useCreateNoticeMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noticeData) => {
      const { data } = await api.post(`/studies/${studyId}/notices`, noticeData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notices', studyId]);
    },
  });
};

export const useUpdateNoticeMutation = (studyId, noticeId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noticeData) => {
      const { data } = await api.patch(`/studies/${studyId}/notices/${noticeId}`, noticeData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['noticeDetail', studyId, noticeId]);
      queryClient.invalidateQueries(['notices', studyId]);
    },
  });
};

export const useDeleteNoticeMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noticeId) => {
      await api.delete(`/studies/${studyId}/notices/${noticeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notices', studyId]);
    },
  });
};

// Add more notice-related mutations as needed
