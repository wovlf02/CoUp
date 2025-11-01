import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useStudyFiles = (studyId, params) => {
  return useQuery({
    queryKey: ['studyFiles', studyId, params],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/files`, { params });
      return data;
    },
    enabled: !!studyId,
  });
};

// Add more file-related queries as needed
