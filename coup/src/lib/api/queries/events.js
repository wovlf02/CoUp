import { useQuery } from '@tanstack/react-query';
import api from '../index';

export const useStudyEvents = (studyId, params) => {
  return useQuery({
    queryKey: ['studyEvents', studyId, params],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/events`, { params });
      return data;
    },
    enabled: !!studyId,
  });
};

export const useEventDetail = (studyId, eventId) => {
  return useQuery({
    queryKey: ['eventDetail', studyId, eventId],
    queryFn: async () => {
      const { data } = await api.get(`/studies/${studyId}/events/${eventId}`);
      return data;
    },
    enabled: !!studyId && !!eventId,
  });
};

// Add more event-related queries as needed
