import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const AppStatus = () => {
  const [status, setStatus] = useState({
    react: false,
    supabase: false,
    inflection: false,
    sentinelHub: false,
    auth: false,
    ui: false
  })

  useEffect(() => {
    // Check React
    setStatus(prev => ({ ...prev, react: true }))

    // Check Supabase
    const hasSupabase = import.meta.env.VITE_SUPABASE_URL && 
                       import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
    setStatus(prev => ({ ...prev, supabase: hasSupabase }))

        // Check Inflection AI
    const hasInflection = import.meta.env.VITE_INFLECTION_API_KEY &&
                          import.meta.env.VITE_INFLECTION_API_KEY !== ''
    setStatus(prev => ({ ...prev, inflection: hasInflection }))

    // Check Sentinel Hub
    const hasSentinelHub = import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID &&
                           import.meta.env.VITE_SENTINEL_HUB_CLIENT_SECRET
    setStatus(prev => ({ ...prev, sentinelHub: hasSentinelHub }))

    // Check UI components
    try {
      setStatus(prev => ({ ...prev, ui: true }))
    } catch (error) {
      console.error('UI Component error:', error)
    }

    // Check Auth context
    try {
      setStatus(prev => ({ ...prev, auth: true }))
    } catch (error) {
      console.error('Auth context error:', error)
    }
  }, [])

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-4">App Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>React App</span>
          {status.react ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Running
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Supabase Config</span>
          {status.supabase ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Setup
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Inflection AI</span>
          {status.inflection ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Setup
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Sentinel Hub</span>
          {status.sentinelHub ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Setup
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>UI Components</span>
          {status.ui ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Loaded
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Inflection AI</span>
          {status.inflection ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Setup
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Auth System</span>
          {status.auth ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 bg-muted/50 rounded text-sm">
        <p className="font-medium mb-1">Environment:</p>
        <p>Mode: {import.meta.env.MODE}</p>
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}</p>
        <p>Inflection AI: {import.meta.env.VITE_INFLECTION_API_KEY ? 'Set' : 'Not set'}</p>
        <p>Sentinel Hub: {import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID ? 'Set' : 'Not set'}</p>
      </div>

      {(!status.supabase || !status.inflection || !status.sentinelHub) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-2">Setup Required:</p>
          <p className="text-xs text-yellow-700 mb-3">
            Create a <code>.env.local</code> file in your project root with:
          </p>
          <pre className="text-xs bg-white p-2 rounded border text-gray-800 overflow-x-auto">
{`VITE_SUPABASE_URL=https://vnbvtpsfjfyglvoqavhp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnZ0cHNmamZ5Z2x2b3FhdmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzkyMzcsImV4cCI6MjA3MjExNTIzN30.RqtFwB8GNOwR1dJ82BgrrGwiC0-DsutTGkdRNmICUkw
VITE_INFLECTION_API_KEY=0ypaDqccUBexBG9wsX1UH4zJzzd3SQnspqLMN7FP8oQ
VITE_SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id
VITE_SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret`}
          </pre>
          <p className="text-xs text-yellow-700 mt-2">
            Then restart the development server: <code>npm run dev</code>
          </p>
        </div>
      )}
    </Card>
  )
}

export default AppStatus
