import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Database, ExternalLink, Settings } from "lucide-react"

const SupabaseSetupMessage = () => {
  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Database Setup Required</h2>
        <p className="text-muted-foreground">
          To use the content management features, you need to set up your Supabase database.
        </p>
      </div>

      <Alert className="mb-6">
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Setup:</strong> Follow the step-by-step guide in SUPABASE_SETUP.md to configure your database and enable content management.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">What you'll get after setup:</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Dynamic content management for About, Blog, and Research pages</li>
          <li>Admin dashboard to create, edit, and delete content</li>
          <li>User authentication and role-based access control</li>
          <li>Real-time updates without needing to redeploy</li>
          <li>Secure database with Row Level Security policies</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button className="bg-gradient-forest text-white" asChild>
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Create Supabase Account
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://github.com/supabase/supabase" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Documentation
          </a>
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Environment Setup:</h4>
        <p className="text-sm text-muted-foreground mb-2">
          After creating your Supabase project, add these to your <code>.env.local</code> file:
        </p>
        <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
      </div>
    </Card>
  )
}

export default SupabaseSetupMessage
