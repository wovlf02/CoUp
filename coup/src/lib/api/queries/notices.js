import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useNotices = (studyId, params) => {
  return useQuery({
    queryKey: ['notices', studyId, params],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/notices`, { params });
      return data;
    },
    enabled: !!studyId,
  });
};

export const useNoticeDetail = (studyId, noticeId) => {
  return useQuery({
    queryKey: ['noticeDetail', studyId, noticeId],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/notices/${noticeId}`);
      return data;
    },
    enabled: !!studyId && !!noticeId,
  });
};

// Add more notice-related queries as needed
