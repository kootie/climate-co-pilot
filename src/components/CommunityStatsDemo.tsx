import React from 'react';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Demo component to test the community stats hook
const CommunityStatsDemo = () => {
  const { stats, loading, error } = useCommunityStats();

  if (error) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Stats</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Community Stats Debug</h3>
        <Badge variant={loading ? "secondary" : "default"}>
          {loading ? "Loading..." : "Live Data"}
        </Badge>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div><strong>Total Users:</strong> {stats.totalUsers.toLocaleString()}</div>
          <div><strong>Active Trackers:</strong> {stats.activeUsers.toLocaleString()}</div>
          <div><strong>Total CO₂ Tracked:</strong> {stats.totalCO2Tracked.toFixed(1)} kg</div>
          <div><strong>Avg Monthly Reduction:</strong> {stats.avgMonthlyReduction} kg</div>
          <div><strong>Total Activities:</strong> {stats.totalActivities.toLocaleString()}</div>
          <div><strong>CO₂ This Month:</strong> {stats.co2SavedThisMonth.toFixed(1)} kg</div>
          <div><strong>Trees Equivalent:</strong> {stats.treesEquivalent.toLocaleString()}</div>
          <div><strong>Weekly Growth:</strong> {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}%</div>
        </div>
      )}
    </Card>
  );
};

export default CommunityStatsDemo;
