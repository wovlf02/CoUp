import { useMutation } from '@tanstack/react-query';
import api from '../index';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post('/auth/signup', userData);
      return data;
    },
  });
};

// Add more auth-related mutations as needed
