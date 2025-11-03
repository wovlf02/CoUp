import { useSocket as useSocketContext } from '@/components/providers/SocketProvider';

export const useSocket = () => {
  return useSocketContext();
};
