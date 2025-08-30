import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Save, X, Calendar, Clock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BlogPost, BlogPostForm } from '@/types/content'

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<BlogPostForm>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    read_time: '',
    publish_date: new Date().toISOString().split('T')[0],
    featured: false,
    published: true,
    image_url: ''
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false })

      if (error) throw error
      setPosts(data || [])
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
          .from('blog_posts')
          .update({
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            author: formData.author,
            read_time: formData.read_time,
            publish_date: formData.publish_date,
            featured: formData.featured,
            published: formData.published,
            image_url: formData.image_url || null
          })
          .eq('id', editing)

        if (error) throw error
        setSuccess('Blog post updated successfully!')
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            author: formData.author,
            read_time: formData.read_time,
            publish_date: formData.publish_date,
            featured: formData.featured,
            published: formData.published,
            image_url: formData.image_url || null
          })

        if (error) throw error
        setSuccess('Blog post created successfully!')
      }

      setEditing(null)
      setAdding(false)
      resetForm()
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author,
      read_time: post.read_time,
      publish_date: post.publish_date,
      featured: post.featured,
      published: post.published,
      image_url: post.image_url || ''
    })
    setEditing(post.id)
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccess('Blog post deleted successfully!')
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      author: '',
      read_time: '',
      publish_date: new Date().toISOString().split('T')[0],
      featured: false,
      published: true,
      image_url: ''
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setAdding(false)
    resetForm()
  }

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>
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
        <h3 className="text-lg font-semibold">Blog Posts ({posts.length})</h3>
        <Button onClick={() => setAdding(true)} className="bg-gradient-forest text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Blog Post
        </Button>
      </div>

      {(adding || editing) && (
        <Card className="p-6 border-2 border-primary/20">
          <h4 className="text-lg font-medium mb-4">
            {editing ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter blog post title..."
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Climate Science, Technology..."
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                placeholder="Author name..."
              />
            </div>

            <div>
              <Label htmlFor="read_time">Read Time</Label>
              <Input
                id="read_time"
                value={formData.read_time}
                onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                placeholder="e.g., 5 min read"
              />
            </div>

            <div>
              <Label htmlFor="publish_date">Publish Date</Label>
              <Input
                id="publish_date"
                type="date"
                value={formData.publish_date}
                onChange={(e) => setFormData({...formData, publish_date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              placeholder="Brief description of the article..."
              rows={3}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Full article content..."
              rows={8}
            />
          </div>

          <div className="flex items-center space-x-8 mb-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
              />
              <Label htmlFor="featured">Featured Article</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({...formData, published: checked})}
              />
              <Label htmlFor="published">Published</Label>
            </div>
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

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No blog posts found.</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                    {post.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
                    {!post.published && <Badge variant="destructive">Draft</Badge>}
                  </div>
                  
                  <h4 className="font-bold text-lg text-foreground mb-2">{post.title}</h4>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.publish_date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.read_time}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default BlogManager
