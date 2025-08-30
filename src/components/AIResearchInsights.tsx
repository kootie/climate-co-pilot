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
import { inflectionAI } from '@/lib/inflectionAI'

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

interface AIInsightData {
  title: string
  summary: string
  category: string
  impact_data: string
  source_type: string
  credibility_score: number
}

const AIResearchInsights = () => {
  const [insights, setInsights] = useState<AIResearchInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    generateResearchInsights()
  }, [])

  const generateResearchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      // Generate research insights using Inflection AI
      const aiInsights = await inflectionAI.generateResearchData()
      
      // Transform AI data to match our interface
      const transformedInsights: AIResearchInsight[] = aiInsights.map((insight: AIInsightData, index: number) => ({
        id: `ai_insight_${index}`,
        title: insight.title,
        summary: insight.summary,
        category: insight.category,
        impact_data: insight.impact_data,
        source_type: insight.source_type,
        credibility_score: insight.credibility_score,
        featured: index < 2, // First 2 insights are featured
        created_at: new Date().toISOString()
      }))

      setInsights(transformedInsights)
    } catch (err: unknown) {
      console.error('Error generating research insights:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate research insights'
      setError(errorMessage)
      
      // Fallback to sample insights if AI generation fails
      setInsights([
        {
          id: 'fallback_1',
          title: 'Electric Vehicle Adoption Accelerates Carbon Reduction in Transportation Sector',
          summary: 'Recent analysis shows that electric vehicle adoption has reached a tipping point, with EVs now responsible for 14% of global car sales in 2023. The research indicates that personal transportation electrification can reduce individual carbon footprints by 40-60% depending on local electricity grid composition.',
          category: 'transportation',
          impact_data: '40-60% reduction in transport emissions, 14% global EV market share',
          source_type: 'analysis',
          credibility_score: 8,
          featured: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'fallback_2',
          title: 'Plant-Based Diet Transition Shows Significant Climate Impact',
          summary: 'Comprehensive studies demonstrate that shifting from meat-heavy diets to plant-based alternatives can reduce individual carbon footprints by 20-30%. This includes both direct agricultural emissions and the broader environmental impact of livestock production.',
          category: 'food',
          impact_data: '20-30% reduction in dietary carbon footprint',
          source_type: 'study',
          credibility_score: 9,
          featured: true,
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setGenerating(true)
    await generateResearchInsights()
    setGenerating(false)
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
        <p className="text-muted-foreground">
          {generating ? 'Generating new AI research insights...' : 'Loading AI research insights...'}
        </p>
        {generating && (
          <div className="mt-4 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Inflection AI is creating fresh insights...
          </div>
        )}
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
            onClick={handleRefresh}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Research Insights</h2>
            <p className="text-muted-foreground">Latest climate science and carbon reduction research</p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={generating}
          variant="outline"
          size="sm"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Insights
            </>
          )}
        </Button>
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
