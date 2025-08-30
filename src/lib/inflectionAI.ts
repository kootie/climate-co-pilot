// Inflection AI Service for Carbon Reduction Recommendations
import { supabase } from './supabase'

const INFLECTION_API_KEY = import.meta.env.VITE_INFLECTION_API_KEY
const INFLECTION_API_URL = 'https://api.inflection.ai/v1/chat/completions'

interface UserCarbonProfile {
  monthly_co2: number
  top_categories: { category: string; amount: number }[]
  location?: string
  recent_activities: string[]
  carbon_goal: number
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  category: string
  impact_level: 'low' | 'medium' | 'high'
  estimated_savings_kg: number
  difficulty: 'easy' | 'medium' | 'hard'
  personalized_reason: string
  action_steps: string[]
  timeline: string
}

interface ResearchInsight {
  title: string
  summary: string
  category: string
  impact_data: string
  source_type: 'study' | 'report' | 'analysis'
  credibility_score: number
}

class InflectionAIService {
  private async makeRequest(messages: any[], max_tokens: number = 1500) {
    if (!INFLECTION_API_KEY) {
      throw new Error('Inflection AI API key not configured. Please set VITE_INFLECTION_API_KEY in your environment variables.')
    }

    try {
      const response = await fetch(INFLECTION_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${INFLECTION_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'inflection-2.5',
          messages: messages,
          max_tokens: max_tokens,
          temperature: 0.7,
          top_p: 0.9,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Inflection AI API Error:', response.status, errorText)
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error calling Inflection AI:', error)
      throw error
    }
  }

  async generatePersonalizedRecommendations(userProfile: UserCarbonProfile): Promise<AIRecommendation[]> {
    const prompt = `You are an expert climate scientist and carbon footprint advisor. Analyze this user's carbon profile and provide 5 highly personalized, actionable recommendations to reduce their carbon footprint.

User Profile:
- Monthly CO2: ${userProfile.monthly_co2} kg
- Carbon Goal: ${userProfile.carbon_goal} kg/year
- Top emission categories: ${userProfile.top_categories.map(c => `${c.category}: ${c.amount} kg`).join(', ')}
- Location: ${userProfile.location || 'Not specified'}
- Recent activities: ${userProfile.recent_activities.join(', ')}

For each recommendation, provide:
1. A clear, actionable title
2. Detailed description explaining WHY this matters for this specific user
3. Category (transportation, energy, food, waste, consumption)
4. Impact level (low/medium/high)
5. Estimated CO2 savings in kg per month
6. Difficulty (easy/medium/hard)
7. Personalized reason based on their data
8. 3-4 specific action steps
9. Realistic timeline

Format as JSON array with this structure:
[{
  "title": "string",
  "description": "string", 
  "category": "string",
  "impact_level": "string",
  "estimated_savings_kg": number,
  "difficulty": "string",
  "personalized_reason": "string",
  "action_steps": ["step1", "step2", "step3"],
  "timeline": "string"
}]

Focus on recommendations that directly address their highest emission categories and are achievable given their current patterns.`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a world-class environmental scientist specializing in personal carbon footprint reduction. Provide evidence-based, personalized recommendations that are specific, actionable, and impactful.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 2000)

      // Parse the JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI')
      }

      const recommendations = JSON.parse(jsonMatch[0])
      
      // Add unique IDs and ensure data quality
      return recommendations.map((rec: any, index: number) => ({
        id: `ai-rec-${Date.now()}-${index}`,
        ...rec,
        estimated_savings_kg: Number(rec.estimated_savings_kg) || 0,
      }))
    } catch (error) {
      console.error('Error generating recommendations:', error)
      // Return fallback recommendations if AI fails
      return this.getFallbackRecommendations(userProfile)
    }
  }

  async generateCarbonInsights(userProfile: UserCarbonProfile): Promise<string> {
    const prompt = `Analyze this user's carbon footprint data and provide personalized insights:

Monthly CO2: ${userProfile.monthly_co2} kg
Annual Goal: ${userProfile.carbon_goal} kg
Top Categories: ${userProfile.top_categories.map(c => `${c.category}: ${c.amount} kg`).join(', ')}

Provide:
1. How they compare to global/national averages
2. Their biggest improvement opportunities 
3. Positive reinforcement for good habits
4. Specific next steps to reach their goal

Keep it encouraging but honest, 2-3 paragraphs max.`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an encouraging climate coach. Provide personalized, motivating insights about carbon footprint progress.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 800)

      return response
    } catch (error) {
      console.error('Error generating insights:', error)
      return `Based on your current tracking of ${userProfile.monthly_co2} kg CO₂ per month, you're making great progress toward your annual goal of ${userProfile.carbon_goal} kg. Your largest impact areas are ${userProfile.top_categories.map(c => c.category).join(' and ')}, which presents excellent opportunities for reduction. Keep tracking consistently - small changes in these areas can lead to significant improvements!`
    }
  }

  async generateResearchData(): Promise<ResearchInsight[]> {
    const prompt = `Generate 5 high-quality climate research insights that would be valuable for a carbon tracking application database. Each should be:

1. Based on real, recent research trends in climate science
2. Actionable for individual carbon footprint reduction
3. Include specific data/statistics
4. Cover different aspects: transportation, energy, food, technology, policy

For each insight, provide:
- Title (research paper style)
- Summary (150-200 words)
- Category
- Impact data (specific numbers/percentages)
- Source type (study/report/analysis)
- Credibility score (1-10)

Format as JSON array:
[{
  "title": "string",
  "summary": "string",
  "category": "string", 
  "impact_data": "string",
  "source_type": "string",
  "credibility_score": number
}]

Focus on research that translates to actionable insights for personal carbon reduction.`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a climate research analyst. Generate research insights based on current scientific consensus and recent studies in climate action and carbon reduction.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 2500)

      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error generating research data:', error)
      return this.getFallbackResearchData()
    }
  }

  private getFallbackRecommendations(userProfile: UserCarbonProfile): AIRecommendation[] {
    const topCategory = userProfile.top_categories[0]?.category || 'transportation'
    
    const fallbacks: Record<string, AIRecommendation> = {
      transportation: {
        id: 'fallback-transport',
        title: 'Optimize Your Transportation Mix',
        description: 'Based on your transportation emissions, switching to public transit or cycling for 2-3 trips per week could significantly reduce your carbon footprint.',
        category: 'transportation',
        impact_level: 'high',
        estimated_savings_kg: 15,
        difficulty: 'medium',
        personalized_reason: 'Transportation is your highest emission category',
        action_steps: ['Track current transportation patterns', 'Identify 2-3 regular trips suitable for alternatives', 'Try public transit or cycling for one week', 'Measure and compare results'],
        timeline: '2-4 weeks'
      },
      energy: {
        id: 'fallback-energy',
        title: 'Smart Energy Management',
        description: 'Your energy usage presents opportunities for reduction through smart scheduling and efficiency improvements.',
        category: 'energy',
        impact_level: 'medium',
        estimated_savings_kg: 12,
        difficulty: 'easy',
        personalized_reason: 'Energy is a significant part of your carbon footprint',
        action_steps: ['Audit current energy usage', 'Set programmable thermostat', 'Switch to LED bulbs', 'Unplug devices when not in use'],
        timeline: '1-2 weeks'
      }
    }

    return [fallbacks[topCategory] || fallbacks.transportation]
  }

  private getFallbackResearchData(): ResearchInsight[] {
    return [
      {
        title: "Electric Vehicle Adoption Accelerates Carbon Reduction in Transportation Sector",
        summary: "Recent analysis shows that electric vehicle adoption has reached a tipping point, with EVs now responsible for 14% of global car sales in 2023. The research indicates that personal transportation electrification can reduce individual carbon footprints by 40-60% depending on local electricity grid composition.",
        category: "transportation",
        impact_data: "40-60% reduction in transport emissions, 14% global EV market share",
        source_type: "analysis",
        credibility_score: 8
      }
    ]
  }
}

export const inflectionAI = new InflectionAIService()
export type { AIRecommendation, ResearchInsight, UserCarbonProfile }
