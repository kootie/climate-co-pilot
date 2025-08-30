import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, TreePine, TrendingUp, Award, Target, Activity, BarChart3 } from "lucide-react";
import heroEarth from "@/assets/hero-earth.jpg";
import { useCommunityStats, useUserCarbonSummaries } from "@/hooks/useCommunityStats";
import { Skeleton } from "@/components/ui/skeleton";

const CommunityDashboard = () => {
  const { stats: communityStats, loading: statsLoading, error: statsError } = useCommunityStats();
  const { summaries: userSummaries, loading: summariesLoading } = useUserCarbonSummaries(5);

  const leaderboard = [
    { name: "Green Warriors Nairobi", members: 89, co2Saved: 45, rank: 1 },
    { name: "Eco Champions Mombasa", members: 72, co2Saved: 38, rank: 2 },
    { name: "Climate Action Kisumu", members: 61, co2Saved: 32, rank: 3 },
    { name: "Your Community", members: 34, co2Saved: 18, rank: 7 }
  ];

  const achievements = [
    { title: "First Steps", description: "Joined EcoGuide AI", icon: Target, unlocked: true },
    { title: "Carbon Conscious", description: "Tracked 30 days", icon: TrendingUp, unlocked: true },
    { title: "Community Builder", description: "Invited 5 friends", icon: Users, unlocked: false },
    { title: "Climate Champion", description: "Saved 50 tons CO₂", icon: Trophy, unlocked: false }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-earth">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Community Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how your actions connect to global trends and inspire meaningful change together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Community Stats */}
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-forest text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Community Impact</h3>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Live Stats
                </Badge>
              </div>
              
              {statsLoading ? (
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
                      <Skeleton className="h-4 w-20 mx-auto bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                      <Activity className="w-6 h-6" />
                      {communityStats.activeUsers.toLocaleString()}
                    </div>
                    <p className="text-white/80">Active Trackers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      {(communityStats.totalCO2Tracked / 1000).toFixed(1)} k
                    </div>
                    <p className="text-white/80">kg CO₂ Tracked</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      {communityStats.avgMonthlyReduction}
                    </div>
                    <p className="text-white/80">kg Avg Monthly Reduction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 text-accent flex items-center justify-center gap-2">
                      <TreePine className="w-6 h-6" />
                      {communityStats.treesEquivalent.toLocaleString()}
                    </div>
                    <p className="text-white/80">Trees Equivalent</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                {statsLoading ? (
                  <Skeleton className="h-4 w-full bg-white/20" />
                ) : (
                  <div className="text-center text-white/90">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="font-semibold">Total Users:</span> {communityStats.totalUsers.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Weekly Growth:</span> 
                        <span className={`ml-1 ${communityStats.weeklyGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {communityStats.weeklyGrowth >= 0 ? '+' : ''}{communityStats.weeklyGrowth}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/70">
                      Total activities logged: {communityStats.totalActivities.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Your Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className={`flex items-center gap-4 p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-muted/50 border-muted opacity-60'
                    }`}>
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Award className="w-5 h-5 text-accent" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Dashboard Preview & Leaderboard */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Global Climate Dashboard</h3>
              <div className="relative mb-4">
                <img 
                  src={heroEarth} 
                  alt="Environmental data dashboard showing global climate metrics"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end">
                  <p className="text-white p-4 text-sm">
                    Real-time global environmental data and trends
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-destructive">-2.3%</div>
                  <p className="text-xs text-muted-foreground">Global Forest Cover</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">+15%</div>
                  <p className="text-xs text-muted-foreground">Renewable Energy</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Top Carbon Trackers</h3>
              <div className="space-y-3">
                {summariesLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                ) : userSummaries.length > 0 ? (
                  userSummaries.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.email === 'fabian@inuaake.com'; // This would come from auth context in real app
                    return (
                      <div 
                        key={user.user_id} 
                        className={`flex items-center gap-4 p-3 rounded-lg border ${
                          isCurrentUser 
                            ? 'bg-primary/10 border-primary/20' 
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          rank <= 3 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {user.full_name || user.email.split('@')[0]}
                            {isCurrentUser && <span className="text-xs text-primary ml-2">(You)</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(user.monthly_co2)} kg CO₂ • {user.activity_count} activities
                          </div>
                        </div>
                        {rank <= 3 && <Trophy className="w-5 h-5 text-accent" />}
                      </div>
                    );
                  })
                ) : (
                  // Fallback to mock leaderboard if no real data
                  leaderboard.map((community) => (
                    <div 
                      key={community.rank} 
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        community.name === 'Your Community' 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        community.rank <= 3 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {community.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{community.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {community.members} members • {community.co2Saved} tons saved
                        </div>
                      </div>
                      {community.rank <= 3 && <Trophy className="w-5 h-5 text-accent" />}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 p-4 bg-gradient-ocean text-white rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Weekly Challenge</span>
                </div>
                <p className="text-white/90 mb-3">
                  Reduce transport emissions by 20% this week
                </p>
                <div className="flex items-center justify-between">
                  <Progress value={65} className="flex-1 mr-3 h-2" />
                  <span className="text-sm">65%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityDashboard;