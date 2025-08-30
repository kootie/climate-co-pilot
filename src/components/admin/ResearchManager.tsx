import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Save, X, FileText, Database, BarChart3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ResearchPaper, ResearchDataset, ResearchProject } from '@/types/content'

const ResearchManager = () => {
  const [activeTab, setActiveTab] = useState('papers')
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [datasets, setDatasets] = useState<ResearchDataset[]>([])
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Paper form state
  const [editingPaper, setEditingPaper] = useState<string | null>(null)
  const [addingPaper, setAddingPaper] = useState(false)
  const [paperForm, setPaperForm] = useState({
    title: '', authors: [''], journal: '', publish_date: '',
    citations: 0, category: '', abstract: '', download_url: '', doi: '', published: true
  })

  // Dataset form state
  const [editingDataset, setEditingDataset] = useState<string | null>(null)
  const [addingDataset, setAddingDataset] = useState(false)
  const [datasetForm, setDatasetForm] = useState({
    name: '', description: '', size: '', format: '', last_updated: '',
    downloads: 0, license: '', download_url: '', published: true
  })

  // Project form state
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [addingProject, setAddingProject] = useState(false)
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', progress: 0, team: '',
    expected_completion: '', funding: '', published: true
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [papersRes, datasetsRes, projectsRes] = await Promise.all([
        supabase.from('research_papers').select('*').order('publish_date', { ascending: false }),
        supabase.from('research_datasets').select('*').order('last_updated', { ascending: false }),
        supabase.from('research_projects').select('*').order('created_at', { ascending: false })
      ])

      if (papersRes.error) throw papersRes.error
      if (datasetsRes.error) throw datasetsRes.error
      if (projectsRes.error) throw projectsRes.error

      setPapers(papersRes.data || [])
      setDatasets(datasetsRes.data || [])
      setProjects(projectsRes.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Paper management functions
  const handleSavePaper = async () => {
    try {
      setError('')
      const data = {
        ...paperForm,
        authors: paperForm.authors.filter(author => author.trim() !== '')
      }

      if (editingPaper) {
        const { error } = await supabase
          .from('research_papers')
          .update(data)
          .eq('id', editingPaper)
        if (error) throw error
        setSuccess('Research paper updated successfully!')
      } else {
        const { error } = await supabase
          .from('research_papers')
          .insert(data)
        if (error) throw error
        setSuccess('Research paper created successfully!')
      }

      setEditingPaper(null)
      setAddingPaper(false)
      resetPaperForm()
      fetchAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEditPaper = (paper: ResearchPaper) => {
    setPaperForm({
      title: paper.title,
      authors: paper.authors,
      journal: paper.journal,
      publish_date: paper.publish_date,
      citations: paper.citations,
      category: paper.category,
      abstract: paper.abstract,
      download_url: paper.download_url || '',
      doi: paper.doi,
      published: paper.published
    })
    setEditingPaper(paper.id)
  }

  const handleDeletePaper = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research paper?')) return
    try {
      const { error } = await supabase.from('research_papers').delete().eq('id', id)
      if (error) throw error
      setSuccess('Research paper deleted successfully!')
      fetchAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetPaperForm = () => {
    setPaperForm({
      title: '', authors: [''], journal: '', publish_date: '',
      citations: 0, category: '', abstract: '', download_url: '', doi: '', published: true
    })
  }

  // Dataset management functions
  const handleSaveDataset = async () => {
    try {
      setError('')
      if (editingDataset) {
        const { error } = await supabase
          .from('research_datasets')
          .update(datasetForm)
          .eq('id', editingDataset)
        if (error) throw error
        setSuccess('Dataset updated successfully!')
      } else {
        const { error } = await supabase
          .from('research_datasets')
          .insert(datasetForm)
        if (error) throw error
        setSuccess('Dataset created successfully!')
      }

      setEditingDataset(null)
      setAddingDataset(false)
      resetDatasetForm()
      fetchAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetDatasetForm = () => {
    setDatasetForm({
      name: '', description: '', size: '', format: '', last_updated: '',
      downloads: 0, license: '', download_url: '', published: true
    })
  }

  // Project management functions
  const handleSaveProject = async () => {
    try {
      setError('')
      if (editingProject) {
        const { error } = await supabase
          .from('research_projects')
          .update(projectForm)
          .eq('id', editingProject)
        if (error) throw error
        setSuccess('Project updated successfully!')
      } else {
        const { error } = await supabase
          .from('research_projects')
          .insert(projectForm)
        if (error) throw error
        setSuccess('Project created successfully!')
      }

      setEditingProject(null)
      setAddingProject(false)
      resetProjectForm()
      fetchAllData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetProjectForm = () => {
    setProjectForm({
      title: '', description: '', progress: 0, team: '',
      expected_completion: '', funding: '', published: true
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading research content...</div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="papers" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Papers ({papers.length})
          </TabsTrigger>
          <TabsTrigger value="datasets" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Datasets ({datasets.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Projects ({projects.length})
          </TabsTrigger>
        </TabsList>

        {/* Research Papers Tab */}
        <TabsContent value="papers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Research Papers</h4>
            <Button onClick={() => setAddingPaper(true)} className="bg-gradient-forest text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Paper
            </Button>
          </div>

          {(addingPaper || editingPaper) && (
            <Card className="p-6 border-2 border-primary/20">
              <h5 className="text-lg font-medium mb-4">
                {editingPaper ? 'Edit Paper' : 'Add New Paper'}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={paperForm.title}
                    onChange={(e) => setPaperForm({...paperForm, title: e.target.value})}
                    placeholder="Paper title..."
                  />
                </div>

                <div>
                  <Label>Journal</Label>
                  <Input
                    value={paperForm.journal}
                    onChange={(e) => setPaperForm({...paperForm, journal: e.target.value})}
                    placeholder="Journal name..."
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Input
                    value={paperForm.category}
                    onChange={(e) => setPaperForm({...paperForm, category: e.target.value})}
                    placeholder="Research category..."
                  />
                </div>

                <div>
                  <Label>Publish Date</Label>
                  <Input
                    type="date"
                    value={paperForm.publish_date}
                    onChange={(e) => setPaperForm({...paperForm, publish_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Citations</Label>
                  <Input
                    type="number"
                    value={paperForm.citations}
                    onChange={(e) => setPaperForm({...paperForm, citations: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label>DOI</Label>
                  <Input
                    value={paperForm.doi}
                    onChange={(e) => setPaperForm({...paperForm, doi: e.target.value})}
                    placeholder="DOI..."
                  />
                </div>

                <div>
                  <Label>Download URL (optional)</Label>
                  <Input
                    value={paperForm.download_url}
                    onChange={(e) => setPaperForm({...paperForm, download_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label>Authors (one per line)</Label>
                <Textarea
                  value={paperForm.authors.join('\n')}
                  onChange={(e) => setPaperForm({...paperForm, authors: e.target.value.split('\n')})}
                  placeholder="Author 1&#10;Author 2&#10;Author 3"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <Label>Abstract</Label>
                <Textarea
                  value={paperForm.abstract}
                  onChange={(e) => setPaperForm({...paperForm, abstract: e.target.value})}
                  placeholder="Paper abstract..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={paperForm.published}
                  onCheckedChange={(checked) => setPaperForm({...paperForm, published: checked})}
                />
                <Label>Published</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSavePaper} className="bg-gradient-forest text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setEditingPaper(null); setAddingPaper(false); resetPaperForm() }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {papers.map((paper) => (
              <Card key={paper.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{paper.category}</Badge>
                      <Badge variant="secondary">{paper.citations} citations</Badge>
                      {!paper.published && <Badge variant="destructive">Draft</Badge>}
                    </div>
                    <h5 className="font-bold mb-2">{paper.title}</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      {paper.authors.join(', ')} • {paper.journal} • {paper.publish_date}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{paper.abstract}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditPaper(paper)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePaper(paper.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Similar structure for datasets and projects tabs would go here */}
        <TabsContent value="datasets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Research Datasets</h4>
            <Button onClick={() => setAddingDataset(true)} className="bg-gradient-forest text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Dataset
            </Button>
          </div>
          {/* Dataset management UI would go here - similar structure to papers */}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Research Projects</h4>
            <Button onClick={() => setAddingProject(true)} className="bg-gradient-forest text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
          {/* Project management UI would go here - similar structure to papers */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ResearchManager
