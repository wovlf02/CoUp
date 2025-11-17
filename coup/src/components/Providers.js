// src/components/Providers.js
'use client'

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        cacheTime: 5 * 60 * 1000, // 5분
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  )
}

