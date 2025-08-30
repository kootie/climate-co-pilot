import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Car, Home, Utensils, Plane, TrendingDown, Leaf, Target, Users, Globe, LogIn } from "lucide-react";
// Using EcoGuide logo instead of separate carbon icon
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/contexts/UserAuthContext";

const PersonalTracker = () => {
  const { isAuthenticated } = useUserAuth()
  const [communityStats, setCommunityStats] = useState({
    total_users: 0,
    total_co2_tracked: 0,
    avg_monthly_reduction: 0,
    top_categories: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityStats()
  }, [])

  const fetchCommunityStats = async () => {
    try {
      const hasRealCredentials = 
        import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

      if (!hasRealCredentials) {
        // Use mock data if no Supabase
        setCommunityStats({
          total_users: 1247,
          total_co2_tracked: 15623.5,
          avg_monthly_reduction: 145.2,
          top_categories: [
            { category: 'transportation', total_co2: 8245.3 },
            { category: 'energy', total_co2: 4532.1 },
            { category: 'food', total_co2: 2846.1 }
          ]
        })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.rpc('get_public_tracking_stats')
      
      if (error) {
        console.warn('Could not fetch community stats:', error)
        // Fall back to mock data
        setCommunityStats({
          total_users: 1247,
          total_co2_tracked: 15623.5,
          avg_monthly_reduction: 145.2,
          top_categories: [
            { category: 'transportation', total_co2: 8245.3 },
            { category: 'energy', total_co2: 4532.1 },
            { category: 'food', total_co2: 2846.1 }
          ]
        })
      } else {
        setCommunityStats(data || {
          total_users: 0,
          total_co2_tracked: 0,
          avg_monthly_reduction: 0,
          top_categories: []
        })
      }
    } catch (error) {
      console.warn('Error fetching community stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const tips = [
    {
      title: "Switch to Matatus",
      impact: "0.3 tons CO₂/year",
      description: "In Nairobi, using public transport twice a week reduces emissions significantly"
    },
    {
      title: "Solar Water Heating",
      impact: "0.5 tons CO₂/year",
      description: "Solar heating systems reduce energy consumption and costs"
    },
    {
      title: "Local Food Choices",
      impact: "0.2 tons CO₂/year", 
      description: "Choosing locally grown food reduces transportation emissions"
    }
  ];

  const progressPercent = (communityStats.totalMembers / (communityStats.totalMembers + 100)) * 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation': return Car
      case 'energy': return Home
      case 'food': return Utensils
      default: return Globe
    }
  }

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
                    <div className="mb-6">
            <img
              src="/ecoguide.jpg"
              alt="EcoGuide AI - Community carbon footprint tracking"
              className="w-20 h-20 mx-auto mb-4 animate-float rounded-full object-cover border-4 border-primary/20"
            />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Community Impact Statistics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our community is making a difference in climate action and carbon reduction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Stats Overview */}
          <Card className="p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Community Impact</h3>
              <Badge variant="outline" className="text-primary border-primary">
                <Users className="w-4 h-4 mr-1" />
                Live Stats
              </Badge>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {loading ? '...' : communityStats.total_users.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Active Trackers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {loading ? '...' : `${communityStats.total_co2_tracked.toLocaleString()} kg`}
                </div>
                <p className="text-sm text-muted-foreground">CO₂ Tracked</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {loading ? '...' : `${communityStats.avg_monthly_reduction.toFixed(0)} kg`}
                </div>
                <p className="text-sm text-muted-foreground">Avg Monthly Reduction</p>
              </div>
            </div>

            {/* Top Categories */}
            {!loading && communityStats.top_categories.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Top Impact Categories</h4>
                {communityStats.top_categories.slice(0, 3).map((category: any, index: number) => {
                  const Icon = getCategoryIcon(category.category);
                  const percentage = (category.total_co2 / communityStats.total_co2_tracked) * 100;
                  const colors = ['bg-primary', 'bg-secondary', 'bg-accent'];
                  
                  return (
                    <div key={category.category} className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${colors[index]}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground capitalize">{category.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {category.total_co2.toFixed(0)} kg ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* User Action Section */}
          <div className="space-y-6">
            {isAuthenticated ? (
              <Card className="p-6 bg-gradient-forest text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Your Dashboard</h3>
                </div>
                <p className="text-white/90 mb-4">
                  Track your personal carbon footprint and set sustainability goals
                </p>
                <Button asChild variant="secondary" className="w-full bg-white/20 text-white hover:bg-white/30">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </Card>
            ) : (
              <Card className="p-6 bg-gradient-forest text-white">
                <div className="flex items-center gap-3 mb-4">
                  <LogIn className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Start Tracking</h3>
                </div>
                <p className="text-white/90 mb-4">
                  Join our community and start tracking your personal carbon footprint today
                </p>
                <Button asChild variant="secondary" className="w-full bg-white/20 text-white hover:bg-white/30">
                  <Link to="/login">Sign Up Free</Link>
                </Button>
              </Card>
            )}

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <Card key={index} className="p-4 hover:shadow-soft transition-all duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{tip.title}</h4>
                      <Badge variant="outline" className="text-primary border-primary">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {tip.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tip.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-6 bg-gradient-ocean text-white">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Offset Options</h3>
              </div>
              <p className="text-white/90 mb-4">
                Plant 23 trees to offset this month's emissions
              </p>
              <Button variant="secondary" className="w-full bg-white/20 text-white hover:bg-white/30">
                Find Projects
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalTracker;