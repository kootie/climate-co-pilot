import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  ExternalLink,
  Star,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AIResearchInsight {
  id: string
  title: string
  summary: string
  category: string
  impact_data: string
  source_type: string
  credibility_score: number
  featured: boolean
  created_at: string
}

const AIResearchInsights = () => {
  const [insights, setInsights] = useState<AIResearchInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResearchInsights()
  }, [])

  const fetchResearchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('ai_research_insights')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('credibility_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setInsights(data || [])
    } catch (err: any) {
      console.error('Error fetching research insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transportation': return 'bg-blue-100 text-blue-800'
      case 'energy': return 'bg-yellow-100 text-yellow-800'
      case 'food': return 'bg-green-100 text-green-800'
      case 'waste': return 'bg-purple-100 text-purple-800'
      case 'consumption': return 'bg-pink-100 text-pink-800'
      case 'policy': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'study': return '🔬'
      case 'report': return '📊'
      case 'analysis': return '📈'
      default: return '📄'
    }
  }

  const getCredibilityStars = (score: number) => {
    const stars = Math.round(score / 2) // Convert 10-point scale to 5-star
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
        <p className="text-muted-foreground">Loading AI research insights...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading research insights: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={fetchResearchInsights}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Research Insights</h2>
          <p className="text-muted-foreground">Latest climate science and carbon reduction research</p>
        </div>
      </div>

      {/* Featured Insights */}
      {insights.filter(insight => insight.featured).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Research
          </h3>
          <div className="grid gap-6">
            {insights.filter(insight => insight.featured).map((insight) => (
              <Card key={insight.id} className="p-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getSourceIcon(insight.source_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(insight.category)}>
                          {insight.category}
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getCredibilityStars(insight.credibility_score)}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-foreground mb-3">
                        {insight.title}
                      </h4>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {insight.summary}
                      </p>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Impact Data</span>
                        </div>
                        <p className="text-sm text-blue-700">{insight.impact_data}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Insights */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Research Insights
        </h3>
        <div className="grid gap-4">
          {insights.filter(insight => !insight.featured).map((insight) => (
            <Card key={insight.id} className="p-4 hover:shadow-soft transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="text-xl">{getSourceIcon(insight.source_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(insight.category)}>
                      {insight.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.source_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Score: {insight.credibility_score}/10
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-foreground mb-2">
                    {insight.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {insight.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {insight.impact_data}
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Learn More
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Attribution */}
      <Card className="p-4 bg-gradient-to-r from-purple/5 to-blue/5 border-purple/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Powered by Inflection AI
            </p>
            <p className="text-xs text-muted-foreground">
              Research insights generated and analyzed using advanced AI to help you make informed climate decisions
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AIResearchInsights
