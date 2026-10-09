import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

type CampaignContextType = {
  campaignSlug: string
  setCampaignSlug: (slug: string) => void
}

const CampaignContext = createContext<CampaignContextType | null>(null)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaignSlug, setCampaignSlug] = useState(() => {
    return localStorage.getItem('virtuz_admin_campaign') || 'default'
  })

  useEffect(() => {
    localStorage.setItem('virtuz_admin_campaign', campaignSlug)
  }, [campaignSlug])

  return (
    <CampaignContext.Provider value={{ campaignSlug, setCampaignSlug }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useAdminCampaign() {
  const context = useContext(CampaignContext)
  if (!context) throw new Error('useAdminCampaign must be used within CampaignProvider')
  return context
}
