import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useUserSession = () => {
  return useQuery({
    queryKey: ['userSession'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Add more auth-related queries as needed
