'use client'

import { useQuery } from '@tanstack/react-query'
import { User } from '@/types/auth'

// Since there's no API for users yet, we'll directly import the mock data.
// In a real app, this would be replaced with an API call.
import { mockUsers } from '@/lib/db/mock-users'

interface UseUsersOptions {
  // Add options like pagination, search, etc. if needed in the future
}

export function useUsers(options: UseUsersOptions = {}) {
  return useQuery({
    queryKey: ['users', options],
    queryFn: async (): Promise<User[]> => {
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return mockUsers
    },
    select: (data) => data,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async (): Promise<User | null> => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return mockUsers.find(user => user.id === id) || null
    },
    enabled: !!id,
  })
}
