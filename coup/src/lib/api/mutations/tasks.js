import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useCreateTaskMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData) => {
      const { data } = await api.post(`/studies/${studyId}/tasks`, taskData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyTasks', studyId]);
    },
  });
};

export const useUpdateTaskMutation = (studyId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData) => {
      const { data } = await api.patch(`/studies/${studyId}/tasks/${taskId}`, taskData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['taskDetail', studyId, taskId]);
      queryClient.invalidateQueries(['studyTasks', studyId]);
    },
  });
};

export const useDeleteTaskMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId) => {
      await api.delete(`/studies/${studyId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyTasks', studyId]);
    },
  });
};

// Add more task-related mutations as needed
