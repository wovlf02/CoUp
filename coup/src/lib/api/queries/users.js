import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

// Add more user-related queries as needed
