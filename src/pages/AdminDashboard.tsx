import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  LogOut, 
  FileText, 
  BookOpen, 
  Microscope,
  Users,
  Database,
  BarChart3,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AboutContentManager from '@/components/admin/AboutContentManager'
import BlogManager from '@/components/admin/BlogManager'
import ResearchManager from '@/components/admin/ResearchManager'

const AdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('about')

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">EcoGuide AI Admin</h1>
                <p className="text-sm text-muted-foreground">Content Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Content Management</h2>
          <p className="text-muted-foreground">
            Manage all content for About, Blog, and Research pages
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              About Page
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Microscope className="w-4 h-4" />
              Research
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">About Page Content</h3>
                  <p className="text-muted-foreground">Manage hero, mission, values, team, and stats sections</p>
                </div>
              </div>
              <AboutContentManager />
            </Card>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Blog Posts Management</h3>
                  <p className="text-muted-foreground">Create, edit, and manage blog articles</p>
                </div>
              </div>
              <BlogManager />
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Microscope className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Research Content</h3>
                  <p className="text-muted-foreground">Manage papers, datasets, and projects</p>
                </div>
              </div>
              <ResearchManager />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AdminDashboard
