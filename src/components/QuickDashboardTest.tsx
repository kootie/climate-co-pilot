import React, { useEffect, useState } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';

const QuickDashboardTest = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { user, profile, isAuthenticated, loading: authLoading } = useUserAuth();

  useEffect(() => {
    const addDebug = (message: string) => {
      setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };

    addDebug('Component mounted');
    addDebug(`Auth loading: ${authLoading}`);
    addDebug(`Is authenticated: ${isAuthenticated}`);
    addDebug(`User exists: ${!!user}`);
    addDebug(`Profile exists: ${!!profile}`);
    
    if (user) {
      addDebug(`User ID: ${user.id}`);
      addDebug(`User email: ${user.email}`);
    }
    
    if (profile) {
      addDebug(`Profile name: ${profile.full_name}`);
    }
  }, [user, profile, isAuthenticated, authLoading]);

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 my-4">
      <h3 className="font-bold text-lg mb-3">🔍 Quick Dashboard Debug</h3>
      
      <div className="space-y-1 text-sm font-mono">
        {debugInfo.map((info, idx) => (
          <div key={idx} className="bg-white p-1 rounded">
            {info}
          </div>
        ))}
      </div>

      {!authLoading && !isAuthenticated && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
          <p className="font-semibold text-red-800">❌ Not authenticated</p>
          <p className="text-red-700">This explains the infinite loading!</p>
          <a href="/login" className="text-blue-600 underline">Go to Login</a>
        </div>
      )}

      {!authLoading && isAuthenticated && user && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
          <p className="font-semibold text-green-800">✅ Authenticated successfully</p>
          <p className="text-green-700">Dashboard should work now!</p>
          <a href="/dashboard" className="text-blue-600 underline">Try Dashboard</a>
        </div>
      )}

      {authLoading && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded">
          <p className="font-semibold text-blue-800">⏳ Still checking authentication...</p>
          <p className="text-blue-700">This might be the issue if it takes too long</p>
        </div>
      )}
    </div>
  );
};

export default QuickDashboardTest;
