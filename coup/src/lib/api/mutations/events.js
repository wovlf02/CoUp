import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useCreateEventMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData) => {
      const { data } = await api.post(`/studies/${studyId}/events`, eventData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyEvents', studyId]);
    },
  });
};

export const useUpdateEventMutation = (studyId, eventId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData) => {
      const { data } = await api.patch(`/studies/${studyId}/events/${eventId}`, eventData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventDetail', studyId, eventId]);
      queryClient.invalidateQueries(['studyEvents', studyId]);
    },
  });
};

export const useDeleteEventMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId) => {
      await api.delete(`/studies/${studyId}/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyEvents', studyId]);
    },
  });
};

// Add more event-related mutations as needed
