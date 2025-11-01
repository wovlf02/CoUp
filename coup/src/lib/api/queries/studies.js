import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useStudyList = (params) => {
  return useQuery({
    queryKey: ['studyList', params],
    queryFn: async () => {
      const { data } = await api.get('/studies', { params });
      return data;
    },
  });
};

export const useStudyDetail = (studyId) => {
  return useQuery({
    queryKey: ['studyDetail', studyId],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}`);
      return data;
    },
    enabled: !!studyId, // Only run if studyId is available
  });
};

// Add more study-related queries as needed
