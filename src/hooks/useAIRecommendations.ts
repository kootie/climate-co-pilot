import { useState, useEffect } from 'react'
import { inflectionAI, type AIRecommendation, type UserCarbonProfile } from '@/lib/inflectionAI'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { supabase } from '@/lib/supabase'

interface CarbonEntry {
  category: string
  co2_kg: number
  // date_recorded: string  // Disabled - column doesn't exist in database
  date: string  // Use date column instead
  activity_type: string
}

export function useAIRecommendations() {
  const { user, profile } = useUserAuth()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [insights, setInsights] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendations = async () => {
    if (!user || !profile) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch user's carbon tracking data
      const { data: entries, error: fetchError } = await supabase
        .from('carbon_tracking')
        .select('category, co2_kg, date, activity_type')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      // Calculate user profile for AI
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const recentEntries = (entries || []) as CarbonEntry[]
      const monthlyEntries = recentEntries.filter(
        entry => new Date(entry.date) >= currentMonth
      )

      const monthlyCo2 = monthlyEntries.reduce((sum, entry) => sum + entry.co2_kg, 0)
      
      // Group by category
      const categoryTotals = recentEntries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.co2_kg
        return acc
      }, {} as Record<string, number>)

      const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      const recentActivities = recentEntries
        .slice(0, 10)
        .map(entry => `${entry.activity_type} (${entry.category})`)

      const userCarbonProfile: UserCarbonProfile = {
        monthly_co2: monthlyCo2,
        top_categories: topCategories,
        location: profile.location,
        recent_activities: recentActivities,
        carbon_goal: profile.carbon_goal
      }

      // Generate AI recommendations and insights
      const [aiRecommendations, aiInsights] = await Promise.all([
        inflectionAI.generatePersonalizedRecommendations(userCarbonProfile),
        inflectionAI.generateCarbonInsights(userCarbonProfile)
      ])

      setRecommendations(aiRecommendations)
      setInsights(aiInsights)

      // Store recommendations in database for caching
      if (aiRecommendations.length > 0) {
        await supabase
          .from('ai_recommendations')
          .upsert({
            user_id: user.id,
            recommendations: aiRecommendations,
            insights: aiInsights,
            generated_at: new Date().toISOString(),
            profile_snapshot: userCarbonProfile
          })
      }

    } catch (err: any) {
      console.error('Error generating AI recommendations:', err)
      setError(err.message || 'Failed to generate recommendations')
    } finally {
      setLoading(false)
    }
  }

  // Load cached recommendations on mount
  useEffect(() => {
    const loadCachedRecommendations = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('ai_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          const generatedAt = new Date(data.generated_at)
          const now = new Date()
          const hoursSinceGenerated = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60)

          // Use cached recommendations if less than 24 hours old
          if (hoursSinceGenerated < 24) {
            setRecommendations(data.recommendations || [])
            setInsights(data.insights || '')
            return
          }
        }

        // Generate new recommendations if no cache or cache is old
        generateRecommendations()
      } catch (err) {
        console.error('Error loading cached recommendations:', err)
        // If cache fails, try to generate new ones
        generateRecommendations()
      }
    }

    loadCachedRecommendations()
  }, [user, profile])

  return {
    recommendations,
    insights,
    loading,
    error,
    generateRecommendations,
    hasRecommendations: recommendations.length > 0
  }
}
