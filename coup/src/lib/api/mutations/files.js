import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';

export const useUploadFileMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileData) => {
      // Assuming fileData is FormData for file uploads
      const { data } = await api.post(`/studies/${studyId}/files`, fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyFiles', studyId]);
    },
  });
};

export const useDeleteFileMutation = (studyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId) => {
      await api.delete(`/studies/${studyId}/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyFiles', studyId]);
    },
  });
};

// Add more file-related mutations as needed
