import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId) => {
      await api.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });
};

// Add more notification-related mutations as needed
