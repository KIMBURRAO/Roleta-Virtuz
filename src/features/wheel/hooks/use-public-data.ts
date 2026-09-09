import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPublicData, subscribeToPublicChanges } from '../../../services/api'

export const publicDataKey = ['public-data'] as const

export function usePublicData() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: publicDataKey, queryFn: fetchPublicData, staleTime: 20_000 })

  useEffect(() => subscribeToPublicChanges(() => {
    void queryClient.invalidateQueries({ queryKey: publicDataKey })
  }), [queryClient])

  return query
}
