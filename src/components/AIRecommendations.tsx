import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  Target,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react'
import { useAIRecommendations } from '@/hooks/useAIRecommendations'
import { supabase } from '@/lib/supabase'
import { useUserAuth } from '@/contexts/UserAuthContext'
import type { AIRecommendation } from '@/lib/inflectionAI'

const AIRecommendations = () => {
  const { user } = useUserAuth()
  const { recommendations, insights, loading, error, generateRecommendations, hasRecommendations } = useAIRecommendations()
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null)
  const [expandedRec, setExpandedRec] = useState<string | null>(null)

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation': return '🚗'
      case 'energy': return '⚡'
      case 'food': return '🍽️'
      case 'waste': return '♻️'
      case 'consumption': return '🛍️'
      default: return '🌱'
    }
  }

  const handleFeedback = async (recommendationId: string, feedbackType: string) => {
    if (!user) return
    
    setFeedbackLoading(recommendationId)
    
    try {
      await supabase.from('user_recommendation_feedback').insert({
        user_id: user.id,
        recommendation_id: recommendationId,
        feedback_type: feedbackType
      })
      
      // Show success feedback briefly
      setTimeout(() => setFeedbackLoading(null), 1000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setFeedbackLoading(null)
    }
  }

  if (loading && !hasRecommendations) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Generating Your Personal Recommendations</h3>
        <p className="text-muted-foreground mb-4">Our AI is analyzing your carbon footprint data...</p>
        <Progress value={65} className="w-32 mx-auto" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={generateRecommendations}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {insights && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your Carbon Footprint Analysis
              </h3>
              <p className="text-muted-foreground leading-relaxed">{insights}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">AI-Powered Recommendations</h2>
          {hasRecommendations && (
            <Badge className="bg-primary/10 text-primary">
              {recommendations.length} personalized tips
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={generateRecommendations}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      {/* Recommendations Grid */}
      {hasRecommendations && (
        <div className="grid gap-6">
          {recommendations.map((recommendation: AIRecommendation, index: number) => (
            <Card key={recommendation.id} className="p-6 hover:shadow-soft transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl">
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {recommendation.title}
                      </h3>
                      {index === 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Top Pick
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getImpactColor(recommendation.impact_level)}>
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {recommendation.impact_level} impact
                      </Badge>
                      <Badge variant="outline" className={getDifficultyColor(recommendation.difficulty)}>
                        {recommendation.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Target className="w-3 h-3 mr-1" />
                        {recommendation.estimated_savings_kg} kg CO₂/month
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {recommendation.timeline}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {recommendation.description}
                    </p>

                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Why this matters for you:</strong> {recommendation.personalized_reason}
                      </p>
                    </div>

                    {/* Action Steps */}
                    {expandedRec === recommendation.id && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-foreground mb-3">Action Steps:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                          {recommendation.action_steps.map((step: string, stepIndex: number) => (
                            <li key={stepIndex} className="text-sm text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedRec(expandedRec === recommendation.id ? null : recommendation.id)}
                >
                  {expandedRec === recommendation.id ? 'Hide' : 'Show'} Action Steps
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(recommendation.id, 'helpful')}
                    disabled={feedbackLoading === recommendation.id}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Helpful
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(recommendation.id, 'completed')}
                    disabled={feedbackLoading === recommendation.id}
                    className="flex items-center gap-1 bg-green-50 hover:bg-green-100"
                  >
                    <CheckCircle className="w-3 h-3" />
                    I'll Try This
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(recommendation.id, 'not_helpful')}
                    disabled={feedbackLoading === recommendation.id}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {feedbackLoading === recommendation.id && (
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Thanks for your feedback!
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!hasRecommendations && !loading && (
        <Card className="p-8 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Track some carbon activities first, then generate personalized AI recommendations.
          </p>
          <Button onClick={generateRecommendations} className="bg-gradient-forest text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </Card>
      )}
    </div>
  )
}

export default AIRecommendations
