import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useCreateStudyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studyData) => {
      const { data } = await api.post('/studies', studyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyList']);
    },
  });
};

export const useUpdateStudyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studyId, studyData }) => {
      const { data } = await api.patch(`/studies/${studyId}`, studyData);
      return data;
    },
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries(['studyDetail', studyId]);
      queryClient.invalidateQueries(['studyList']);
    },
  });
};

export const useDeleteStudyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studyId) => {
      await api.delete(`/studies/${studyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyList']);
    },
  });
};

export const useJoinStudyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studyId) => {
      const { data } = await api.post(`/studies/${studyId}/join`);
      return data;
    },
    onSuccess: (_, studyId) => {
      queryClient.invalidateQueries(['studyDetail', studyId]);
      queryClient.invalidateQueries(['studyList']);
    },
  });
};

// Add more study-related mutations as needed
