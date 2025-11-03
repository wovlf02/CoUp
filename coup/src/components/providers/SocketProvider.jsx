import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSession } from 'next-auth/react'; // Import useSession

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { data: session, status } = useSession(); // Get session

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) { // Only connect if authenticated and token exists
      const newSocket = io(process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'http://localhost:8081', { // Use 8081 as default
        auth: {
          token: session.accessToken, // Pass the JWT token
        },
      });
      setSocket(newSocket);

      return () => newSocket.close();
    } else if (status === 'unauthenticated') {
      // If unauthenticated, ensure no socket connection is active
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [session, status]); // Re-run effect when session or status changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
