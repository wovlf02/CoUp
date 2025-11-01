import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useStudyTasks = (studyId, params) => {
  return useQuery({
    queryKey: ['studyTasks', studyId, params],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/tasks`, { params });
      return data;
    },
    enabled: !!studyId,
  });
};

export const useTaskDetail = (studyId, taskId) => {
  return useQuery({
    queryKey: ['taskDetail', studyId, taskId],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/tasks/${taskId}`);
      return data;
    },
    enabled: !!studyId && !!taskId,
  });
};

// Add more task-related queries as needed
