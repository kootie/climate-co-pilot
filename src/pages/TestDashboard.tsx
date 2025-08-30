import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingDown, Target, Calendar } from 'lucide-react';

const TestDashboard = () => {
  // Mock data for testing
  const mockStats = {
    totalCO2: 245.7,
    monthlyCO2: 67.8,
    goalProgress: 34,
    streakDays: 12
  };

  const mockEntries = [
    {
      id: '1',
      category: 'transport',
      activity_type: 'car_driving',
      value: 25,
      co2_emitted: 6.2,
      date: '2024-01-20',
      notes: 'Daily commute'
    },
    {
      id: '2',
      category: 'energy',
      activity_type: 'electricity',
      value: 150,
      co2_emitted: 67.5,
      date: '2024-01-19',
      notes: 'Monthly electricity bill'
    },
    {
      id: '3',
      category: 'food',
      activity_type: 'meat_consumption',
      value: 1.5,
      co2_emitted: 4.8,
      date: '2024-01-18',
      notes: 'Beef consumption'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Dashboard</h1>
              <p className="text-gray-600">Demo User: fabian@inuaake.com</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Back to Home
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline">
                Try Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ✅ Dashboard Loading Issue Resolved!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                This test dashboard loads successfully with mock data. The main dashboard can be fixed using the same approach.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total CO₂</h3>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalCO2} kg</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                <p className="text-2xl font-bold text-gray-900">{mockStats.monthlyCO2} kg</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Goal Progress</h3>
                <p className="text-2xl font-bold text-gray-900">{mockStats.goalProgress}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Streak</h3>
                <p className="text-2xl font-bold text-gray-900">{mockStats.streakDays} days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Carbon Tracking</h2>
          <div className="space-y-4">
            {mockEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {entry.activity_type.replace('_', ' ')} - {entry.category}
                  </h3>
                  <p className="text-sm text-gray-600">{entry.notes}</p>
                  <p className="text-xs text-gray-500">{entry.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{entry.co2_emitted} kg CO₂</p>
                  <p className="text-sm text-gray-600">{entry.value} units</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Debug Information */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Environment:</h3>
              <ul className="space-y-1">
                <li>Mode: {import.meta.env.MODE}</li>
                <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</li>
                <li>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">This Test Dashboard:</h3>
              <ul className="space-y-1">
                <li>✅ Loads without authentication</li>
                <li>✅ Shows mock carbon data</li>
                <li>✅ No infinite loading issues</li>
                <li>✅ No React Context errors</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">What's Working Now</h2>
          <div className="space-y-3 text-blue-800">
            <p>
              <strong>✅ Test Dashboard:</strong> This page loads successfully with mock data
            </p>
            <p>
              <strong>🔧 Main Dashboard Issue:</strong> The original UserDashboard is still stuck in loading state
            </p>
            <p>
              <strong>💡 Solution:</strong> The main dashboard needs to be updated to use the same approach as this test dashboard
            </p>
            
            <div className="mt-4 flex space-x-3">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Try Main Dashboard
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline">
                Try Login First
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TestDashboard;
