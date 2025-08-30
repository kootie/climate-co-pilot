    import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  LogOut, 
  Plus,
  Car,
  Zap,
  UtensilsCrossed,
  Trash2,
  ShoppingBag,
  Target,
  TrendingDown,
  Calendar,
  Award,
  Settings,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import AIRecommendations from '@/components/AIRecommendations'

interface CarbonEntry {
  id: string
  category: string
  activity_type: string
  // Support both old and new property names
  amount?: number
  value?: number
  unit?: string
  co2_kg?: number
  co2_emitted?: number
  description?: string
  notes?: string
  // date_recorded?: string  // Disabled - column doesn't exist in database
  date?: string
  user_id?: string
}

interface UserStats {
  total_co2: number
  monthly_co2: number
  goal_progress: number
  streak_days: number
}

const UserDashboard = () => {
  const { user, profile, signOut, isAuthenticated } = useUserAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [entries, setEntries] = useState<CarbonEntry[]>([])
  const [stats, setStats] = useState<UserStats>({ total_co2: 0, monthly_co2: 0, goal_progress: 0, streak_days: 0 })
  const [loading, setLoading] = useState(true)
  
  // New entry form
  const [newEntry, setNewEntry] = useState({
    category: '',
    activity_type: '',
    amount: '',
    unit: '',
    description: '',
    date: new Date().toISOString().split('T')[0]  // Use date instead of date_recorded
  })

  // CO2 calculation factors (kg CO2 per unit)
  const co2Factors: Record<string, Record<string, number>> = {
    transportation: {
      'car_gasoline_mile': 0.411,
      'car_electric_mile': 0.123,
      'bus_mile': 0.105,
      'train_mile': 0.062,
      'flight_domestic_mile': 0.223,
      'flight_international_mile': 0.298
    },
    energy: {
      'electricity_kwh': 0.453,
      'natural_gas_therm': 5.3,
      'heating_oil_gallon': 10.15
    },
    food: {
      'beef_meal': 6.61,
      'pork_meal': 2.45,
      'chicken_meal': 1.57,
      'fish_meal': 1.24,
      'vegetarian_meal': 0.38,
      'vegan_meal': 0.16
    },
    waste: {
      'landfill_kg': 0.5,
      'recycling_kg': 0.1,
      'compost_kg': 0.05
    },
    consumption: {
      'clothing_item': 8.5,
      'electronics_item': 85.0,
      'book_item': 2.71
    }
  }

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    if (user) {
      fetchUserData()
    } else {
      // If no user after 5 seconds, stop loading
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    
    try {
      // Fetch carbon tracking entries from real database
      const { data: entriesData, error: entriesError } = await supabase
        .from('carbon_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50)

      if (entriesError) {
        console.warn('Carbon tracking error:', entriesError.message)
        setEntries([])
      } else {
        setEntries(entriesData || [])
      }

      // Calculate stats from real data
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const totalCo2 = (entriesData || []).reduce((sum, entry) => sum + (entry.co2_emitted || 0), 0)
      const monthlyCo2 = (entriesData || [])
        .filter(entry => new Date(entry.date) >= currentMonth)
        .reduce((sum, entry) => sum + (entry.co2_emitted || 0), 0)
      
      const monthlyGoal = (profile?.carbon_goal || 2000) / 12
      const goalProgress = (monthlyCo2 / monthlyGoal) * 100

      setStats({
        total_co2: totalCo2,
        monthly_co2: monthlyCo2,
        goal_progress: Math.min(goalProgress, 100),
        streak_days: 7 // Calculate actual streak later
      })

    } catch (error) {
      console.error('Error fetching user data:', error)
      setEntries([])
      setStats({
        total_co2: 0,
        monthly_co2: 0,
        goal_progress: 0,
        streak_days: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateCO2 = (category: string, activityType: string, amount: number) => {
    const factor = co2Factors[category]?.[activityType] || 1
    return amount * factor
  }

  const handleAddEntry = async () => {
    if (!user || !newEntry.category || !newEntry.activity_type || !newEntry.amount) return

    try {
      const amount = parseFloat(newEntry.amount)
      const co2_emitted = calculateCO2(newEntry.category, newEntry.activity_type, amount)

      // Insert into real database
      const { data, error } = await supabase
        .from('carbon_tracking')
        .insert({
          user_id: user.id,
          category: newEntry.category,
          activity_type: newEntry.activity_type,
          value: amount,
          co2_emitted: co2_emitted,
          notes: newEntry.description,
          date: newEntry.date
        })
        .select()

      if (error) throw error

      console.log('Entry added successfully:', data)

      // Reset form and refresh data
      setNewEntry({
        category: '',
        activity_type: '',
        amount: '',
        unit: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchUserData()

    } catch (error) {
      console.error('Error adding entry:', error)
    }
  }

  const getDefaultUnit = (category: string, activityType: string) => {
    if (category === 'transportation') return 'miles'
    if (category === 'energy') return activityType.includes('kwh') ? 'kWh' : 'therm'
    if (category === 'food') return 'meals'
    if (category === 'waste') return 'kg'
    if (category === 'consumption') return 'items'
    return 'units'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation': return <Car className="w-4 h-4" />
      case 'energy': return <Zap className="w-4 h-4" />
      case 'food': return <UtensilsCrossed className="w-4 h-4" />
      case 'waste': return <Trash2 className="w-4 h-4" />
      case 'consumption': return <ShoppingBag className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
      <div className="text-center">Loading your dashboard...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navigation />
      
      {/* Header */}
      <header className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name || 'Climate Hero'}!</h1>
              <p className="text-muted-foreground">Track your environmental impact and achieve your sustainability goals</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Monthly CO₂</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.monthly_co2.toFixed(1)} kg</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-secondary" />
                <h3 className="font-semibold">Goal Progress</h3>
              </div>
              <div className="mb-2">
                <Progress value={stats.goal_progress} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">{stats.goal_progress.toFixed(0)}% of monthly goal</p>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-accent" />
                <h3 className="font-semibold">Tracking Streak</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.streak_days}</p>
              <p className="text-sm text-muted-foreground">Days in a row</p>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-primary-glow" />
                <h3 className="font-semibold">Total Tracked</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.total_co2.toFixed(1)} kg</p>
              <p className="text-sm text-muted-foreground">All time CO₂</p>
            </Card>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              AI Tips
            </TabsTrigger>
            <TabsTrigger value="track">Track Activity</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(entry.category)}
                        <div>
                          <p className="font-medium">{entry.activity_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.value || entry.amount} units • {entry.date}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {(entry.co2_emitted || entry.co2_kg || 0).toFixed(1)} kg CO₂
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(
                    entries
                      .filter(entry => new Date(entry.date).getMonth() === new Date().getMonth())
                      .reduce((acc, entry) => {
                        acc[entry.category] = (acc[entry.category] || 0) + (entry.co2_emitted || entry.co2_kg || 0)
                        return acc
                      }, {} as Record<string, number>)
                  ).map(([category, co2]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category}</span>
                      </div>
                      <span className="font-medium">{co2.toFixed(1)} kg</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <AIRecommendations />
          </TabsContent>

          <TabsContent value="track" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newEntry.category} onValueChange={(value) => setNewEntry({...newEntry, category: value, activity_type: ''})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="waste">Waste</SelectItem>
                      <SelectItem value="consumption">Consumption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Activity Type</Label>
                  <Select value={newEntry.activity_type} onValueChange={(value) => setNewEntry({...newEntry, activity_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {newEntry.category && Object.keys(co2Factors[newEntry.category] || {}).map((activity) => (
                        <SelectItem key={activity} value={activity}>
                          {activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Add notes about this activity"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                />
              </div>

              <Button onClick={handleAddEntry} className="bg-gradient-forest text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Activity History</h3>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getCategoryIcon(entry.category)}
                      <div>
                        <p className="font-medium capitalize">{entry.activity_type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.value || entry.amount} units • {entry.date}
                        </p>
                        {(entry.notes || entry.description) && (
                          <p className="text-sm text-muted-foreground italic">{entry.notes || entry.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {(entry.co2_emitted || entry.co2_kg || 0).toFixed(2)} kg CO₂
                      </Badge>
                      <p className="text-sm text-muted-foreground capitalize mt-1">{entry.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserDashboard
