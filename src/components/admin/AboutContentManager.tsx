import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AboutContent, AboutContentForm } from '@/types/content'
import SupabaseSetupMessage from '@/components/SupabaseSetupMessage'

const AboutContentManager = () => {
  const [content, setContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<AboutContentForm>({
    section: 'hero',
    title: '',
    content: '',
    order_index: 0
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const hasRealCredentials = 
        import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

      if (!hasRealCredentials) {
        setError('Supabase not configured. Please set up your Supabase project and credentials.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) throw error
      setContent(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setError('')
      
      if (editing) {
        const { error } = await supabase
          .from('about_content')
          .update({
            section: formData.section,
            title: formData.title,
            content: formData.content,
            order_index: formData.order_index
          })
          .eq('id', editing)

        if (error) throw error
        setSuccess('Content updated successfully!')
      } else {
        const { error } = await supabase
          .from('about_content')
          .insert({
            section: formData.section,
            title: formData.title,
            content: formData.content,
            order_index: formData.order_index
          })

        if (error) throw error
        setSuccess('Content added successfully!')
      }

      setEditing(null)
      setAdding(false)
      resetForm()
      fetchContent()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = (item: AboutContent) => {
    setFormData({
      section: item.section,
      title: item.title,
      content: item.content,
      order_index: item.order_index
    })
    setEditing(item.id)
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const { error } = await supabase
        .from('about_content')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccess('Content deleted successfully!')
      fetchContent()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      section: 'hero',
      title: '',
      content: '',
      order_index: 0
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setAdding(false)
    resetForm()
  }

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, AboutContent[]>)

  if (loading) {
    return <div className="text-center py-8">Loading content...</div>
  }

  // Show setup message if Supabase not configured
  const hasRealCredentials = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

  if (!hasRealCredentials) {
    return <SupabaseSetupMessage />
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">About Page Content</h3>
        <Button onClick={() => setAdding(true)} className="bg-gradient-forest text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {(adding || editing) && (
        <Card className="p-6 border-2 border-primary/20">
          <h4 className="text-lg font-medium mb-4">
            {editing ? 'Edit Content' : 'Add New Content'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={formData.section} onValueChange={(value: any) => setFormData({...formData, section: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="mission">Mission</SelectItem>
                  <SelectItem value="values">Values</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="stats">Stats</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="order">Order Index</Label>
              <Input
                id="order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter title..."
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Enter content..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-gradient-forest text-white">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {Object.entries(groupedContent).map(([section, items]) => (
          <TabsContent key={section} value={section} className="space-y-4">
            {items.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No content found for this section.</p>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.section}</Badge>
                        <Badge variant="secondary">Order: {item.order_index}</Badge>
                      </div>
                      <h4 className="font-medium text-foreground mb-2">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default AboutContentManager
