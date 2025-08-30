import React, { useEffect, useState } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Database, User, RefreshCw } from 'lucide-react';

const DashboardDebug = () => {
  const { user, profile, isAuthenticated, signOut } = useUserAuth();
  const [dbTest, setDbTest] = useState<{ status: string; message: string }>({ status: 'testing', message: 'Testing...' });
  const [carbonData, setCarbonData] = useState<{ status: string; count: number; message: string }>({ status: 'testing', count: 0, message: 'Testing...' });

  useEffect(() => {
    testDatabaseConnection();
    if (user) {
      testUserData();
    }
  }, [user]);

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        setDbTest({ status: 'error', message: `Database error: ${error.message}` });
      } else {
        setDbTest({ status: 'success', message: 'Database connection working' });
      }
    } catch (err) {
      setDbTest({ status: 'error', message: `Connection failed: ${err}` });
    }
  };

  const testUserData = async () => {
    if (!user) return;
    
    try {
      const { data, error, count } = await supabase
        .from('carbon_tracking')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) {
        setCarbonData({ status: 'error', count: 0, message: `User data error: ${error.message}` });
      } else {
        setCarbonData({ status: 'success', count: count || 0, message: `Found ${count || 0} carbon tracking entries` });
      }
    } catch (err) {
      setCarbonData({ status: 'error', count: 0, message: `Failed to fetch user data: ${err}` });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-800">Testing</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          Dashboard Loading Issue - Diagnostic
        </h2>

        {/* Authentication Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Authentication Status
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Login Status:</span>
                {isAuthenticated ? (
                  <Badge className="bg-green-100 text-green-800">✅ Logged In</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">❌ Not Logged In</Badge>
                )}
              </div>
              
              {user && (
                <>
                  <div className="text-sm">
                    <strong>User ID:</strong> {user.id}
                  </div>
                  <div className="text-sm">
                    <strong>Email:</strong> {user.email}
                  </div>
                </>
              )}
              
              {profile && (
                <>
                  <div className="text-sm">
                    <strong>Profile Name:</strong> {profile.full_name}
                  </div>
                  <div className="text-sm">
                    <strong>Carbon Goal:</strong> {profile.carbon_goal} kg
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Database Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Status
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Connection:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(dbTest.status)}
                  {getStatusBadge(dbTest.status)}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {dbTest.message}
              </div>
              
              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span>User Data:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(carbonData.status)}
                      {getStatusBadge(carbonData.status)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {carbonData.message}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Environment Status */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold">Environment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}
            </div>
            <div>
              <strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
            </div>
            <div>
              <strong>Inflection AI:</strong> {import.meta.env.VITE_INFLECTION_API_KEY ? '✅ Configured' : '❌ Missing'}
            </div>
            <div>
              <strong>Environment:</strong> {import.meta.env.MODE}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            🔄 Reload Page
          </Button>
          
          <Button onClick={() => testDatabaseConnection()} variant="outline">
            🧪 Test Database
          </Button>
          
          {user && (
            <Button onClick={() => testUserData()} variant="outline">
              👤 Test User Data
            </Button>
          )}
          
          {!isAuthenticated ? (
            <Button onClick={() => window.location.href = '/login'}>
              🔑 Go to Login
            </Button>
          ) : (
            <>
              <Button onClick={() => window.location.href = '/dashboard'}>
                📊 Try Dashboard Again
              </Button>
              <Button onClick={signOut} variant="destructive">
                🚪 Sign Out
              </Button>
            </>
          )}
        </div>

        {/* Quick Fixes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Fixes to Try:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Hard refresh the page (Ctrl+F5)</li>
            <li>2. Clear browser cache and cookies</li>
            <li>3. Try in incognito/private mode</li>
            <li>4. Check browser console for errors (F12)</li>
            <li>5. Make sure you're using the correct port from terminal</li>
          </ul>
        </div>

        {/* Expected Credentials */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Demo User Credentials:</h4>
          <div className="text-sm text-green-800">
            <div><strong>Email:</strong> fabian@inuaake.com</div>
            <div><strong>Password:</strong> Letmein@999</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardDebug;
