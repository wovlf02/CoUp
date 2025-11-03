import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../index';

export const useChatMessages = (studyId) => {
  return useInfiniteQuery({
    queryKey: ['chatMessages', studyId],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/studies/${studyId}/messages`, {
        params: { cursor: pageParam, limit: 50 },
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!studyId,
  });
};
