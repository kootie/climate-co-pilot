import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CommunityStats {
  totalUsers: number
  totalCO2Tracked: number
  avgMonthlyReduction: number
  activeUsers: number
  totalActivities: number
  co2SavedThisMonth: number
  treesEquivalent: number
  weeklyGrowth: number
}

interface UserCarbonSummary {
  user_id: string
  email: string
  total_co2: number
  monthly_co2: number
  activity_count: number
  last_activity: string
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    totalCO2Tracked: 0,
    avgMonthlyReduction: 0,
    activeUsers: 0,
    totalActivities: 0,
    co2SavedThisMonth: 0,
    treesEquivalent: 0,
    weeklyGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCommunityStats() {
      try {
        // Check if we have real Supabase credentials
        const hasRealCredentials = 
          import.meta.env.VITE_SUPABASE_URL && 
          import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

        if (!hasRealCredentials) {
          // Return mock data if no real Supabase setup
          setStats({
            totalUsers: 1247,
            totalCO2Tracked: 15623.5,
            avgMonthlyReduction: 145,
            activeUsers: 892,
            totalActivities: 8543,
            co2SavedThisMonth: 342,
            treesEquivalent: 856,
            weeklyGrowth: 12
          })
          setLoading(false)
          return
        }

        // Fetch real community statistics
        const results = await Promise.allSettled([
          // Total users
          supabase
            .from('user_profiles')
            .select('id', { count: 'exact' }),

          // Total CO2 tracked (all time)
          supabase
            .from('carbon_tracking')
            .select('co2_emitted')
            .gte('co2_emitted', 0), // Only positive emissions (excluding negative values from recycling)

          // Monthly CO2 data for current month
          supabase
            .from('carbon_tracking')
            .select('co2_emitted, created_at')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .gte('co2_emitted', 0),

          // Active users (users with activity in last 30 days)
          supabase
            .from('carbon_tracking')
            .select('user_id')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

          // Total activities count
          supabase
            .from('carbon_tracking')
            .select('id', { count: 'exact' }),

          // Weekly growth data (users created in last 7 days vs previous 7 days)
          supabase
            .from('user_profiles')
            .select('created_at')
            .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        ])

        let calculatedStats: CommunityStats = {
          totalUsers: 0,
          totalCO2Tracked: 0,
          avgMonthlyReduction: 0,
          activeUsers: 0,
          totalActivities: 0,
          co2SavedThisMonth: 0,
          treesEquivalent: 0,
          weeklyGrowth: 0
        }

        // Process results
        if (results[0].status === 'fulfilled' && results[0].value.count !== null) {
          calculatedStats.totalUsers = results[0].value.count
        }

        if (results[1].status === 'fulfilled' && results[1].value.data) {
          calculatedStats.totalCO2Tracked = results[1].value.data
            .reduce((sum, record) => sum + (record.co2_emitted || 0), 0)
        }

        if (results[2].status === 'fulfilled' && results[2].value.data) {
          calculatedStats.co2SavedThisMonth = results[2].value.data
            .reduce((sum, record) => sum + (record.co2_emitted || 0), 0)
        }

        if (results[3].status === 'fulfilled' && results[3].value.data) {
          const uniqueUsers = new Set(results[3].value.data.map(record => record.user_id))
          calculatedStats.activeUsers = uniqueUsers.size
        }

        if (results[4].status === 'fulfilled' && results[4].value.count !== null) {
          calculatedStats.totalActivities = results[4].value.count
        }

        // Calculate weekly growth
        if (results[5].status === 'fulfilled' && results[5].value.data) {
          const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          
          const lastWeekUsers = results[5].value.data.filter(
            user => new Date(user.created_at) >= oneWeekAgo
          ).length
          
          const previousWeekUsers = results[5].value.data.filter(
            user => new Date(user.created_at) >= twoWeeksAgo && new Date(user.created_at) < oneWeekAgo
          ).length
          
          if (previousWeekUsers > 0) {
            calculatedStats.weeklyGrowth = Math.round(
              ((lastWeekUsers - previousWeekUsers) / previousWeekUsers) * 100
            )
          }
        }

        // Calculate derived metrics
        if (calculatedStats.totalUsers > 0) {
          calculatedStats.avgMonthlyReduction = Math.round(
            calculatedStats.co2SavedThisMonth / calculatedStats.totalUsers
          )
        }

        // Calculate trees equivalent (1 tree absorbs ~22 kg CO2 per year, so ~1.83 kg per month)
        calculatedStats.treesEquivalent = Math.round(calculatedStats.co2SavedThisMonth / 1.83)

        setStats(calculatedStats)

      } catch (err: any) {
        console.warn('Community stats fetch error:', err.message)
        setError(err.message)
        
        // Fallback to enhanced mock data based on Fabian's data
        setStats({
          totalUsers: 1247,
          totalCO2Tracked: 15623.5,
          avgMonthlyReduction: 145,
          activeUsers: 892,
          totalActivities: 8543,
          co2SavedThisMonth: 342,
          treesEquivalent: 856,
          weeklyGrowth: 12
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityStats()
  }, [])

  return { stats, loading, error }
}

// Hook for fetching user carbon summaries for leaderboards
export function useUserCarbonSummaries(limit: number = 10) {
  const [summaries, setSummaries] = useState<UserCarbonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserSummaries() {
      try {
        const hasRealCredentials = 
          import.meta.env.VITE_SUPABASE_URL && 
          import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

        if (!hasRealCredentials) {
          // Mock leaderboard data
          setSummaries([
            {
              user_id: '1',
              email: 'fabian@inuaake.com',
              total_co2: 847.5,
              monthly_co2: 847.5,
              activity_count: 45,
              last_activity: new Date().toISOString()
            },
            {
              user_id: '2', 
              email: 'anna.schmidt@example.com',
              total_co2: 623.2,
              monthly_co2: 623.2,
              activity_count: 38,
              last_activity: new Date(Date.now() - 86400000).toISOString()
            },
            {
              user_id: '3',
              email: 'max.mueller@example.com', 
              total_co2: 756.8,
              monthly_co2: 756.8,
              activity_count: 42,
              last_activity: new Date(Date.now() - 2 * 86400000).toISOString()
            }
          ])
          setLoading(false)
          return
        }

        // Fetch real user summaries with aggregated carbon data
        const { data, error } = await supabase
          .rpc('get_user_carbon_summaries', { summary_limit: limit })

        if (error) throw error

        setSummaries(data || [])

      } catch (err: any) {
        console.warn('User summaries fetch error:', err.message)
        setError(err.message)
        setSummaries([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserSummaries()
  }, [limit])

  return { summaries, loading, error }
}
