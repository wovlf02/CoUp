import { useContext } from 'react';
import { SocketContext } from '@/components/providers/SocketProvider';

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
