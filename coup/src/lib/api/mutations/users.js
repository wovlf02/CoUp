import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useUpdateUserProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.patch('/users/me', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userSession']);
      queryClient.invalidateQueries(['userProfile']);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/users/me');
    },
    onSuccess: () => {
      // Invalidate all queries and potentially redirect to login
      queryClient.clear();
      // window.location.href = '/login'; // Example redirection
    },
  });
};

// Add more user-related mutations as needed
