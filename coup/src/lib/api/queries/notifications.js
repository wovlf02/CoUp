import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useNotifications = (params) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params });
      return data;
    },
  });
};

// Add more notification-related queries as needed
