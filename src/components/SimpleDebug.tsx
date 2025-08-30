import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const SimpleDebug = () => {
  return (
    <Card className="p-6 bg-red-50 border-red-200">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold text-red-800">Context Provider Issue Detected</h2>
      </div>
      
      <div className="space-y-3 text-red-700">
        <p>
          <strong>Error:</strong> "useUserAuth must be used within a UserAuthProvider"
        </p>
        <p>
          <strong>Cause:</strong> Components are trying to access UserAuth context before providers are ready.
        </p>
        
        <div className="mt-4 p-3 bg-white rounded border">
          <h3 className="font-semibold mb-2">Environment Check:</h3>
          <div className="text-sm space-y-1">
            <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}</div>
            <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}</div>
            <div>Environment: {import.meta.env.MODE}</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Quick Fix Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>The authentication context providers need to be properly set up</li>
            <li>Components are trying to access auth context too early</li>
            <li>Try visiting <code className="bg-white px-1 rounded">/dashboard</code> directly</li>
            <li>Clear browser cache and refresh the page</li>
          </ol>
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <a 
            href="/test-dashboard" 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold"
          >
            ✨ Try Test Dashboard
          </a>
          <a 
            href="/dashboard" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Main Dashboard
          </a>
          <a 
            href="/login" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Login
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SimpleDebug;
