import React from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Database, CheckCircle, XCircle } from 'lucide-react';

// Test component to debug authentication issues
const AuthTest = () => {
  const { user, profile, isAuthenticated, signOut } = useUserAuth();

  const testDashboardAccess = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      alert('Please log in first');
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Authentication Test
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Authentication Status:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {isAuthenticated ? 'Logged In' : 'Not Logged In'}
          </Badge>
        </div>

        {user && (
          <div className="text-sm">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </div>
        )}

        {profile && (
          <div className="text-sm">
            <div><strong>Profile Name:</strong> {profile.full_name}</div>
            <div><strong>Carbon Goal:</strong> {profile.carbon_goal} kg</div>
            <div><strong>Location:</strong> {profile.location}</div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm">Database Profile:</span>
          <Badge variant={profile ? "default" : "secondary"}>
            <Database className="w-3 h-3 mr-1" />
            {profile ? 'Found' : 'Not Found'}
          </Badge>
        </div>

        <div className="pt-4 space-y-2">
          {!isAuthenticated ? (
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Go to Login
            </Button>
          ) : (
            <>
              <Button 
                onClick={testDashboardAccess}
                className="w-full"
              >
                Test Dashboard Access
              </Button>
              <Button 
                onClick={signOut}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-4">
          <div><strong>Expected User:</strong> fabian@inuaake.com</div>
          <div><strong>Expected Password:</strong> Letmein@999</div>
        </div>
      </div>
    </Card>
  );
};

export default AuthTest;
