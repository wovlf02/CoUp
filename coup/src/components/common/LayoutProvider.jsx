import React from 'react';
import AuthProvider from '@/components/providers/AuthProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import SocketProvider from '@/components/providers/SocketProvider';

function LayoutProvider({ children }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

export default LayoutProvider;
