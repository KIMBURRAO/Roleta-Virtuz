import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPublicData, subscribeToPublicChanges } from '../../../services/api'

export const publicDataKey = ['public-data'] as const

export function usePublicData(campaignSlug = 'default') {
  const queryClient = useQueryClient()
  const queryKey = [...publicDataKey, campaignSlug]
  const query = useQuery({ queryKey, queryFn: () => fetchPublicData(campaignSlug), staleTime: 20_000 })

  useEffect(() => subscribeToPublicChanges(() => {
    void queryClient.invalidateQueries({ queryKey })
  }), [queryClient, queryKey])

  return query
}
