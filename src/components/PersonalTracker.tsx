import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingDown, 
  Target, 
  Calendar, 
  Activity,
  Plus,
  ArrowRight,
  Leaf,
  Zap,
  Car,
  Utensils,
  Home,
  ShoppingBag
} from 'lucide-react'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { supabase } from '@/lib/supabase'

interface CarbonEntry {
  id: string
  category: string
  activity_type: string
  value?: number
  amount?: number
  unit?: string
  co2_kg?: number
  co2_emitted?: number
  description?: string
  notes?: string
  date_recorded?: string
  date?: string
  user_id?: string
}

interface UserStats {
  total_co2: number
  monthly_co2: number
  goal_progress: number
  streak_days: number
  top_category: string
  recent_activities: string[]
}

const PersonalTracker = () => {
  const { user, profile, isAuthenticated } = useUserAuth()
  const [entries, setEntries] = useState<CarbonEntry[]>([])
  const [stats, setStats] = useState<UserStats>({
    total_co2: 0,
    monthly_co2: 0,
    goal_progress: 0,
    streak_days: 0,
    top_category: 'transportation',
    recent_activities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch carbon tracking entries from database
      const { data: entriesData, error: entriesError } = await supabase
        .from('carbon_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10)

      if (entriesError) {
        console.warn('Carbon tracking error:', entriesError.message)
        setEntries([])
      } else {
        setEntries(entriesData || [])
      }

      // Calculate stats from real data
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalCo2 = (entriesData || []).reduce((sum, entry) => sum + (entry.co2_emitted || entry.co2_kg || 0), 0)
      const monthlyCo2 = (entriesData || []).filter(entry => new Date(entry.date) >= currentMonth)
        .reduce((sum, entry) => sum + (entry.co2_emitted || entry.co2_kg || 0), 0)

      const monthlyGoal = (profile?.carbon_goal || 2000) / 12
      const goalProgress = (monthlyCo2 / monthlyGoal) * 100

      // Calculate top category
      const categoryTotals: Record<string, number> = {}
      entriesData?.forEach(entry => {
        const category = entry.category
        categoryTotals[category] = (categoryTotals[category] || 0) + (entry.co2_emitted || entry.co2_kg || 0)
      })
      
      const topCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'transportation'

      // Get recent activities
      const recentActivities = entriesData?.slice(0, 3).map(entry => 
        `${entry.activity_type} (${entry.category})`
      ) || []

      setStats({
        total_co2: totalCo2,
        monthly_co2: monthlyCo2,
        goal_progress: Math.min(goalProgress, 100),
        streak_days: 7, // Calculate actual streak later
        top_category: topCategory,
        recent_activities: recentActivities
      })

    } catch (error) {
      console.error('Error fetching user data:', error)
      setEntries([])
      setStats({
        total_co2: 0,
        monthly_co2: 0,
        goal_progress: 0,
        streak_days: 0,
        top_category: 'transportation',
        recent_activities: []
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transportation': return <Car className="w-4 h-4" />
      case 'energy': return <Zap className="w-4 h-4" />
      case 'food': return <Utensils className="w-4 h-4" />
      case 'waste': return <ShoppingBag className="w-4 h-4" />
      case 'home': return <Home className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transportation': return 'bg-blue-100 text-blue-800'
      case 'energy': return 'bg-yellow-100 text-yellow-800'
      case 'food': return 'bg-green-100 text-green-800'
      case 'waste': return 'bg-purple-100 text-purple-800'
      case 'home': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="py-16 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Personal Carbon Tracker</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Track your carbon footprint and get personalized insights
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Start Tracking Today</h3>
            <p className="text-blue-800 mb-4">
              Sign in to access your personal carbon tracker and start monitoring your environmental impact.
            </p>
            <Button asChild className="w-full">
              <a href="/login">Sign In to Track</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-16 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Personal Carbon Tracker</h2>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-muted/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Personal Carbon Tracker</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Welcome back, {profile?.full_name || user?.email}! Here's your environmental impact overview.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.total_co2.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Total CO₂ (kg)</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.monthly_co2.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">This Month (kg)</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.goal_progress.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Goal Progress</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.streak_days}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
        </div>

        {/* Goal Progress */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Carbon Goal</h3>
            <Badge variant="outline">{profile?.carbon_goal || 2000} kg/year</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {stats.monthly_co2.toFixed(1)} kg</span>
              <span>Goal: {((profile?.carbon_goal || 2000) / 12).toFixed(1)} kg</span>
            </div>
            <Progress value={stats.goal_progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {stats.goal_progress >= 100 
                ? 'You\'ve exceeded your monthly goal! Great job!' 
                : `You're ${((profile?.carbon_goal || 2000) / 12 - stats.monthly_co2).toFixed(1)} kg away from your monthly goal.`
              }
            </p>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            {entries.length > 0 ? (
              <div className="space-y-3">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(entry.category)}
                      <div>
                        <div className="font-medium">{entry.activity_type}</div>
                        <Badge variant="outline" className={getCategoryColor(entry.category)}>
                          {entry.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{(entry.co2_emitted || entry.co2_kg || 0).toFixed(1)} kg</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.date || entry.date_recorded || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activities tracked yet</p>
                <p className="text-sm">Start tracking your carbon footprint!</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Impact Category</h3>
            <div className="text-center py-8">
              {getCategoryIcon(stats.top_category)}
              <div className="text-2xl font-bold mt-2 capitalize">{stats.top_category}</div>
              <p className="text-muted-foreground mt-2">
                This is your highest emission category. Focus on reducing activities in this area for maximum impact.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Activity
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Full Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Button asChild size="lg" className="bg-gradient-forest text-white">
            <a href="/dashboard">
              Go to Full Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PersonalTracker