# Inflection AI Integration Guide
## How Inflection AI Powers Climate Intelligence in EcoGuide AI

**Version 1.0 | January 2025**

---

## Table of Contents

1. [Overview](#overview)
2. [Integration Architecture](#integration-architecture)
3. [API Implementation](#api-implementation)
4. [Use Cases & Applications](#use-cases--applications)
5. [Prompt Engineering](#prompt-engineering)
6. [Data Flow & Processing](#data-flow--processing)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling & Fallbacks](#error-handling--fallbacks)
9. [Security & Privacy](#security--privacy)
10. [Testing & Validation](#testing--validation)
11. [Cost Optimization](#cost-optimization)
12. [Future Enhancements](#future-enhancements)

---

## Overview

Inflection AI serves as the intelligent backbone of EcoGuide AI, transforming complex environmental data into actionable insights through advanced natural language processing. This integration enables the platform to provide personalized carbon reduction recommendations, analyze satellite data patterns, and generate research insights that bridge the gap between scientific data and user understanding.

### Key Capabilities

- **Natural Language Generation**: Convert technical satellite data into human-readable insights
- **Personalized Recommendations**: Generate custom carbon reduction strategies based on user behavior
- **Research Synthesis**: Automatically create climate research summaries and insights
- **Environmental Analysis**: Interpret satellite imagery and environmental metrics
- **Conversational Intelligence**: Provide interactive climate coaching and guidance

### Integration Benefits

- **Accessibility**: Makes complex environmental data understandable to general users
- **Personalization**: Tailors recommendations to individual carbon footprints and goals
- **Scalability**: Handles analysis for thousands of users simultaneously
- **Accuracy**: Maintains scientific rigor while improving readability
- **Engagement**: Increases user interaction through natural language interfaces

## Integration Architecture

### System Overview

```typescript
// Core Integration Pattern
interface InflectionAIIntegration {
  // Data Input Processing
  processUserData(userProfile: UserCarbonProfile): ProcessedData
  processSatelliteData(coordinates: Coordinates): EnvironmentalData
  
  // AI Analysis
  generateRecommendations(data: ProcessedData): AIRecommendation[]
  analyzeEnvironmentalData(data: EnvironmentalData): EnvironmentalInsight
  
  // Response Processing
  formatResponse(analysis: AIAnalysis): UserFriendlyResponse
  cacheResults(response: UserFriendlyResponse): void
}
```

### Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                      │
├─────────────────────────────────────────────────────────────┤
│  Personal Tracker │ Map Analysis │ Research Hub │ Dashboard │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│                   AI Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│           InflectionAIService (Main Interface)              │
├─────────────────────────────────────────────────────────────┤
│  Recommendation │ Environmental │ Research │ Location      │
│     Engine      │   Analysis    │ Generator│ Assessment     │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│                 External AI Service                         │
├─────────────────────────────────────────────────────────────┤
│                 Inflection AI API                           │
│              (inflection-2.5 model)                         │
└─────────────────────────────────────────────────────────────┘
```

## API Implementation

### Core Service Class

```typescript
// src/lib/inflectionAI.ts
class InflectionAIService {
  private readonly apiKey: string
  private readonly baseUrl: string = 'https://api.inflection.ai/v1/chat/completions'
  private readonly defaultModel: string = 'inflection-2.5'

  constructor() {
    this.apiKey = import.meta.env.VITE_INFLECTION_API_KEY
    if (!this.apiKey) {
      throw new Error('Inflection AI API key not configured')
    }
  }

  /**
   * Core API request method with error handling and retries
   */
  private async makeRequest(
    messages: ChatMessage[], 
    options: RequestOptions = {}
  ): Promise<string> {
    const {
      maxTokens = 1500,
      temperature = 0.7,
      retryCount = 3,
      timeout = 30000
    } = options

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.defaultModel,
            messages,
            max_tokens: maxTokens,
            temperature,
          }),
          signal: AbortSignal.timeout(timeout)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new APIError(response.status, errorData.error?.message)
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || ''

      } catch (error) {
        if (attempt === retryCount) throw error
        await this.exponentialBackoff(attempt)
      }
    }
  }

  /**
   * Exponential backoff for retries
   */
  private async exponentialBackoff(attempt: number): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}
```

### Request/Response Interfaces

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface RequestOptions {
  maxTokens?: number
  temperature?: number
  retryCount?: number
  timeout?: number
}

interface UserCarbonProfile {
  monthly_co2: number
  top_categories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  recent_activities: Array<{
    category: string
    activity_type: string
    co2_emitted: number
    date: string
  }>
  goals: {
    target: number
    current: number
    timeline: string
  }
  demographics?: {
    location?: string
    household_size?: number
    income_bracket?: string
  }
}

interface AIRecommendation {
  id: string
  action: string
  description: string
  impact_kg_co2: number
  difficulty: 'easy' | 'medium' | 'hard'
  timeline: string
  steps: string[]
  category: string
  cost_estimate?: string
  savings_estimate?: string
}
```

## Use Cases & Applications

### 1. Personal Carbon Recommendations

**Purpose**: Generate personalized action plans for carbon footprint reduction

**Implementation**:
```typescript
async generateCarbonRecommendations(
  userProfile: UserCarbonProfile
): Promise<AIRecommendation[]> {
  const systemPrompt = `You are an expert climate scientist and sustainability coach. 
  Generate personalized carbon reduction recommendations based on user data.`

  const userPrompt = this.buildCarbonAnalysisPrompt(userProfile)

  const response = await this.makeRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { maxTokens: 2000, temperature: 0.6 })

  return this.parseRecommendations(response)
}

private buildCarbonAnalysisPrompt(profile: UserCarbonProfile): string {
  return `
    Analyze this user's carbon footprint and provide 3-5 actionable recommendations:

    Current Profile:
    - Monthly CO2 emissions: ${profile.monthly_co2} kg
    - Top emission categories: ${profile.top_categories.map(c => 
      `${c.category}: ${c.amount} kg (${c.percentage}%)`).join(', ')}
    - Recent activities: ${profile.recent_activities.slice(0, 5).map(a => 
      `${a.activity_type} (${a.co2_emitted} kg)`).join(', ')}
    - Goal: Reduce to ${profile.goals.target} kg by ${profile.goals.timeline}
    
    Please provide recommendations in this JSON format:
    {
      "recommendations": [
        {
          "action": "Clear action title",
          "description": "Detailed explanation of the action",
          "impact_kg_co2": number,
          "difficulty": "easy|medium|hard",
          "timeline": "timeframe for implementation",
          "steps": ["step1", "step2", "step3"],
          "category": "transportation|energy|food|waste|other"
        }
      ],
      "insights": "Overall analysis of user's carbon profile and improvement potential"
    }
  `
}
```

**Example Request/Response**:
```json
// Input
{
  "monthly_co2": 850,
  "top_categories": [
    { "category": "transportation", "amount": 425, "percentage": 50 },
    { "category": "energy", "amount": 255, "percentage": 30 }
  ],
  "goals": { "target": 600, "timeline": "6 months" }
}

// Output
{
  "recommendations": [
    {
      "action": "Switch to public transportation 3 days per week",
      "description": "Replace car commutes with public transit to reduce transportation emissions by 40%",
      "impact_kg_co2": 170,
      "difficulty": "medium",
      "timeline": "2-4 weeks",
      "steps": [
        "Research local transit routes",
        "Purchase monthly transit pass",
        "Plan commute schedule",
        "Start with 2 days per week, increase gradually"
      ],
      "category": "transportation"
    }
  ]
}
```

### 2. Environmental Data Analysis

**Purpose**: Convert satellite data into understandable environmental insights

**Implementation**:
```typescript
async analyzeEnvironmentalLocation(
  coordinates: { lat: number, lng: number },
  satelliteMetrics: SatelliteMetrics
): Promise<EnvironmentalInsight> {
  const systemPrompt = `You are an environmental scientist specializing in 
  satellite data interpretation. Analyze environmental conditions and provide 
  clear, actionable insights for the general public.`

  const analysisPrompt = `
    Analyze environmental data for location ${coordinates.lat}, ${coordinates.lng}:

    Satellite Metrics:
    - Vegetation Index (NDVI): ${satelliteMetrics.vegetation_index} (-1 to 1 scale)
    - Air Quality Index: ${satelliteMetrics.air_quality_index} (0-500 scale)
    - Surface Temperature: ${satelliteMetrics.surface_temperature}°C
    - Deforestation Risk: ${satelliteMetrics.deforestation_risk}% (0-100 scale)
    - Water Quality: ${satelliteMetrics.water_quality}/100

    Provide analysis in JSON format:
    {
      "environmental_score": number (1-100),
      "risk_level": "low|medium|high|critical",
      "summary": "Brief overview of environmental conditions",
      "detailed_analysis": "Comprehensive explanation of each metric",
      "recommendations": ["action1", "action2", "action3"],
      "trends": "Analysis of recent changes or patterns"
    }
  `

  const response = await this.makeRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: analysisPrompt }
  ], { maxTokens: 1800, temperature: 0.5 })

  return this.parseEnvironmentalAnalysis(response)
}
```

### 3. Research Insight Generation

**Purpose**: Create digestible climate research summaries and insights

**Implementation**:
```typescript
async generateResearchInsights(
  category: string,
  targetAudience: 'general' | 'technical' = 'general'
): Promise<ResearchInsight[]> {
  const systemPrompt = `You are a climate researcher and science communicator. 
  Generate engaging, accurate research insights about ${category} for a 
  ${targetAudience} audience.`

  const researchPrompt = `
    Generate 3-5 research insights about ${category} that are:
    1. Based on current scientific understanding
    2. Relevant to climate action
    3. Actionable for individuals or communities
    4. Properly contextualized with impact data

    Format as JSON:
    {
      "insights": [
        {
          "title": "Compelling research finding",
          "summary": "2-3 sentence explanation",
          "impact_data": "Quantified impact information",
          "category": "${category}",
          "source_type": "study|report|analysis",
          "credibility_score": number (1-10),
          "actionable_takeaway": "What people can do with this information"
        }
      ]
    }
  `

  const response = await this.makeRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: researchPrompt }
  ], { maxTokens: 2500, temperature: 0.8 })

  return this.parseResearchInsights(response)
}
```

## Prompt Engineering

### Best Practices

**1. System Prompts**:
```typescript
const SYSTEM_PROMPTS = {
  CARBON_COACH: `You are an expert sustainability coach with deep knowledge of 
    carbon footprint reduction strategies. Your responses should be:
    - Scientifically accurate and evidence-based
    - Practical and achievable for everyday people
    - Encouraging and motivational
    - Specific with quantified impact estimates`,

  ENVIRONMENTAL_ANALYST: `You are an environmental scientist specializing in 
    satellite data interpretation and climate analysis. Provide:
    - Clear explanations of complex environmental data
    - Context about what measurements mean for local communities
    - Risk assessments based on scientific thresholds
    - Actionable recommendations for environmental protection`,

  RESEARCH_SYNTHESIZER: `You are a climate research specialist who translates 
    complex scientific studies into accessible insights. Focus on:
    - Accurate representation of scientific findings
    - Clear communication for non-experts
    - Practical implications and applications
    - Appropriate uncertainty and confidence levels`
}
```

**2. Structured Output Prompts**:
```typescript
const generateStructuredPrompt = (
  category: string, 
  data: any, 
  outputSchema: string
): string => {
  return `
    ${getContextualBackground(category)}

    Input Data:
    ${JSON.stringify(data, null, 2)}

    Please analyze this data and respond in the following JSON format:
    ${outputSchema}

    Guidelines:
    - Ensure all numeric values are realistic and based on scientific data
    - Keep explanations clear and jargon-free
    - Include specific, actionable recommendations
    - Maintain a encouraging but realistic tone
    - Cite confidence levels where appropriate
  `
}
```

**3. Few-Shot Examples**:
```typescript
const buildFewShotPrompt = (examples: Example[], newInput: any): string => {
  const exampleText = examples.map(ex => `
    Input: ${JSON.stringify(ex.input)}
    Output: ${JSON.stringify(ex.output)}
  `).join('\n\n')

  return `
    Here are examples of the desired analysis format:
    
    ${exampleText}
    
    Now analyze this new input:
    ${JSON.stringify(newInput)}
  `
}
```

### Prompt Optimization Strategies

**Temperature Settings**:
- **Creative Content (Research)**: 0.7-0.9 for diverse insights
- **Factual Analysis (Data)**: 0.3-0.5 for consistency
- **Recommendations**: 0.6-0.7 for balanced creativity and accuracy

**Token Management**:
```typescript
const calculateOptimalTokens = (promptLength: number, expectedOutput: string): number => {
  const promptTokens = Math.ceil(promptLength / 4) // Rough estimation
  const outputTokens = {
    'short_recommendation': 300,
    'detailed_analysis': 800,
    'research_summary': 600,
    'location_insight': 400
  }
  
  return promptTokens + (outputTokens[expectedOutput] || 500)
}
```

## Data Flow & Processing

### Request Processing Pipeline

```typescript
class AIRequestProcessor {
  async processRequest(
    type: 'recommendation' | 'analysis' | 'research',
    input: any
  ): Promise<ProcessedResponse> {
    
    // 1. Input Validation
    const validatedInput = await this.validateInput(type, input)
    
    // 2. Cache Check
    const cacheKey = this.generateCacheKey(type, validatedInput)
    const cached = await this.checkCache(cacheKey)
    if (cached) return cached
    
    // 3. Prompt Generation
    const prompt = await this.generatePrompt(type, validatedInput)
    
    // 4. AI Request
    const aiResponse = await this.makeAIRequest(prompt)
    
    // 5. Response Processing
    const processed = await this.processResponse(aiResponse, type)
    
    // 6. Quality Validation
    const validated = await this.validateResponse(processed)
    
    // 7. Cache Storage
    await this.cacheResponse(cacheKey, validated)
    
    // 8. Usage Tracking
    await this.trackUsage(type, prompt.length, aiResponse.length)
    
    return validated
  }
}
```

### Response Processing

```typescript
class ResponseProcessor {
  async parseJSONResponse(response: string): Promise<any> {
    // Extract JSON from response text
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                     response.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new ProcessingError('No JSON found in response')
    }

    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
      return this.validateResponseStructure(parsed)
    } catch (error) {
      throw new ProcessingError('Invalid JSON in response', error)
    }
  }

  async validateResponseStructure(data: any): Promise<any> {
    const schemas = {
      recommendation: recommendationSchema,
      analysis: analysisSchema,
      research: researchSchema
    }

    // Implement JSON schema validation
    const isValid = await this.validateAgainstSchema(data, schemas[data.type])
    if (!isValid) {
      throw new ValidationError('Response does not match expected schema')
    }

    return data
  }
}
```

### Database Integration

```typescript
// Store AI responses for caching and analysis
interface AIResponse {
  id: string
  request_type: string
  input_hash: string
  prompt_used: string
  ai_response: any
  processed_output: any
  response_time_ms: number
  token_usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  quality_score?: number
  user_feedback?: 'helpful' | 'not_helpful'
  created_at: Date
}

// Database operations
async storeAIResponse(response: AIResponse): Promise<void> {
  await supabase.from('ai_responses').insert({
    request_type: response.request_type,
    input_hash: response.input_hash,
    processed_output: response.processed_output,
    response_time_ms: response.response_time_ms,
    token_usage: response.token_usage
  })
}

async getCachedResponse(inputHash: string): Promise<AIResponse | null> {
  const { data } = await supabase
    .from('ai_responses')
    .select('processed_output')
    .eq('input_hash', inputHash)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24h cache
    .single()
  
  return data?.processed_output || null
}
```

## Performance Optimization

### Caching Strategy

```typescript
class AICache {
  private memoryCache = new Map<string, CacheEntry>()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours

  async get(key: string): Promise<any | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data
    }

    // Check database cache
    const dbEntry = await this.getFromDatabase(key)
    if (dbEntry && !this.isExpired(dbEntry)) {
      // Update memory cache
      this.memoryCache.set(key, dbEntry)
      return dbEntry.data
    }

    return null
  }

  async set(key: string, data: any): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now()
    }

    // Store in memory
    this.memoryCache.set(key, entry)

    // Store in database for persistence
    await this.storeInDatabase(key, entry)
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.TTL
  }
}
```

### Request Batching

```typescript
class RequestBatcher {
  private readonly batchSize = 5
  private readonly batchWindow = 1000 // 1 second
  private pendingRequests: PendingRequest[] = []
  private batchTimer?: NodeJS.Timeout

  async enqueueRequest(request: AIRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({
        request,
        resolve,
        reject,
        timestamp: Date.now()
      })

      if (this.pendingRequests.length >= this.batchSize) {
        this.processBatch()
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.processBatch(), this.batchWindow)
      }
    })
  }

  private async processBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
    }

    const batch = this.pendingRequests.splice(0, this.batchSize)
    if (batch.length === 0) return

    try {
      const results = await this.executeBatch(batch.map(b => b.request))
      batch.forEach((item, index) => {
        item.resolve(results[index])
      })
    } catch (error) {
      batch.forEach(item => item.reject(error))
    }
  }
}
```

## Error Handling & Fallbacks

### Error Types and Responses

```typescript
class AIErrorHandler {
  async handleError(error: Error, context: RequestContext): Promise<FallbackResponse> {
    switch (error.constructor) {
      case APIRateLimitError:
        return this.handleRateLimit(context)
      
      case APIQuotaExceededError:
        return this.handleQuotaExceeded(context)
      
      case InvalidResponseError:
        return this.handleInvalidResponse(context)
      
      case NetworkTimeoutError:
        return this.handleTimeout(context)
      
      default:
        return this.handleGenericError(error, context)
    }
  }

  private async handleRateLimit(context: RequestContext): Promise<FallbackResponse> {
    // Use cached response if available
    const cached = await this.getCachedSimilarResponse(context)
    if (cached) return cached

    // Queue for later processing
    await this.queueForRetry(context, 60000) // 1 minute delay

    // Return generic fallback
    return this.getGenericFallback(context.type)
  }

  private getGenericFallback(type: string): FallbackResponse {
    const fallbacks = {
      recommendation: {
        recommendations: [
          {
            action: "Reduce energy consumption",
            description: "Turn off lights and electronics when not in use to save energy and reduce carbon emissions.",
            impact_kg_co2: 25,
            difficulty: "easy",
            timeline: "immediate",
            steps: ["Audit your home for energy waste", "Create an energy-saving routine", "Track your progress"],
            category: "energy"
          }
        ],
        insights: "Focus on easy wins like energy conservation and sustainable transportation choices."
      },
      analysis: {
        environmental_score: 70,
        risk_level: "medium",
        summary: "Environmental conditions require monitoring. Consider local conservation efforts.",
        recommendations: ["Support local environmental initiatives", "Monitor air quality regularly"]
      }
    }

    return {
      data: fallbacks[type] || fallbacks.recommendation,
      source: 'fallback',
      confidence: 'low'
    }
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private threshold = 5,
    private timeout = 60000,
    private resetTimeout = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }
}
```

## Security & Privacy

### API Key Management

```typescript
class SecureAPIKeyManager {
  private readonly keyRotationInterval = 30 * 24 * 60 * 60 * 1000 // 30 days
  
  async getAPIKey(): Promise<string> {
    const key = import.meta.env.VITE_INFLECTION_API_KEY
    
    if (!key) {
      throw new SecurityError('API key not configured')
    }

    // Validate key format
    if (!this.isValidKeyFormat(key)) {
      throw new SecurityError('Invalid API key format')
    }

    return key
  }

  private isValidKeyFormat(key: string): boolean {
    // Implement key format validation
    return /^[A-Za-z0-9_-]{40,}$/.test(key)
  }

  async rotateKeyIfNeeded(): Promise<void> {
    const lastRotation = await this.getLastRotationTime()
    if (Date.now() - lastRotation > this.keyRotationInterval) {
      await this.requestKeyRotation()
    }
  }
}
```

### Data Privacy Protection

```typescript
class PrivacyProtector {
  async sanitizeUserData(data: UserCarbonProfile): Promise<SanitizedProfile> {
    return {
      // Keep only necessary data for AI analysis
      monthly_co2: data.monthly_co2,
      top_categories: data.top_categories.map(cat => ({
        category: cat.category,
        percentage: cat.percentage
        // Remove absolute amounts that might reveal personal details
      })),
      goal_ratio: data.goals.current / data.goals.target,
      // Remove personally identifiable information
      location_type: this.getLocationTypeOnly(data.demographics?.location),
      household_size_bracket: this.getBracketOnly(data.demographics?.household_size)
    }
  }

  private getLocationTypeOnly(location?: string): string {
    // Return only general location type, not specific location
    if (!location) return 'unknown'
    
    const urbanKeywords = ['city', 'urban', 'metro']
    const ruralKeywords = ['rural', 'countryside', 'village']
    
    const lower = location.toLowerCase()
    if (urbanKeywords.some(keyword => lower.includes(keyword))) return 'urban'
    if (ruralKeywords.some(keyword => lower.includes(keyword))) return 'rural'
    return 'suburban'
  }
}
```

## Testing & Validation

### Unit Testing AI Responses

```typescript
describe('InflectionAIService', () => {
  let aiService: InflectionAIService
  let mockFetch: jest.Mock

  beforeEach(() => {
    mockFetch = jest.fn()
    global.fetch = mockFetch
    aiService = new InflectionAIService()
  })

  describe('generateCarbonRecommendations', () => {
    it('should return valid recommendations for typical user profile', async () => {
      const mockProfile: UserCarbonProfile = {
        monthly_co2: 850,
        top_categories: [
          { category: 'transportation', amount: 425, percentage: 50 }
        ],
        recent_activities: [],
        goals: { target: 600, current: 850, timeline: '6 months' }
      }

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [{
                action: "Use public transportation",
                description: "Reduce car usage by taking public transport",
                impact_kg_co2: 170,
                difficulty: "medium",
                timeline: "2-4 weeks",
                steps: ["Research routes", "Buy pass", "Start using"],
                category: "transportation"
              }]
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await aiService.generateCarbonRecommendations(mockProfile)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        action: expect.any(String),
        impact_kg_co2: expect.any(Number),
        difficulty: expect.stringMatching(/^(easy|medium|hard)$/),
        category: expect.any(String)
      })
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        aiService.generateCarbonRecommendations(mockProfile)
      ).rejects.toThrow('Network error')
    })
  })
})
```

### Response Quality Validation

```typescript
class ResponseQualityValidator {
  async validateRecommendations(recommendations: AIRecommendation[]): Promise<ValidationResult> {
    const issues: ValidationIssue[] = []

    for (const rec of recommendations) {
      // Check for realistic impact values
      if (rec.impact_kg_co2 < 0 || rec.impact_kg_co2 > 1000) {
        issues.push({
          type: 'unrealistic_impact',
          recommendation_id: rec.id,
          value: rec.impact_kg_co2
        })
      }

      // Validate difficulty levels
      if (!['easy', 'medium', 'hard'].includes(rec.difficulty)) {
        issues.push({
          type: 'invalid_difficulty',
          recommendation_id: rec.id,
          value: rec.difficulty
        })
      }

      // Check for actionable steps
      if (!rec.steps || rec.steps.length === 0) {
        issues.push({
          type: 'missing_steps',
          recommendation_id: rec.id
        })
      }

      // Validate category
      const validCategories = ['transportation', 'energy', 'food', 'waste', 'other']
      if (!validCategories.includes(rec.category)) {
        issues.push({
          type: 'invalid_category',
          recommendation_id: rec.id,
          value: rec.category
        })
      }
    }

    return {
      isValid: issues.length === 0,
      score: this.calculateQualityScore(recommendations, issues),
      issues
    }
  }

  private calculateQualityScore(
    recommendations: AIRecommendation[], 
    issues: ValidationIssue[]
  ): number {
    const baseScore = 100
    const penaltyPerIssue = 10
    const minScore = 0

    return Math.max(minScore, baseScore - (issues.length * penaltyPerIssue))
  }
}
```

### Integration Testing

```typescript
describe('AI Integration E2E', () => {
  it('should complete full recommendation workflow', async () => {
    // 1. Create test user profile
    const userProfile = await createTestUserProfile()

    // 2. Generate recommendations
    const recommendations = await aiService.generateCarbonRecommendations(userProfile)

    // 3. Validate response structure
    expect(recommendations).toBeInstanceOf(Array)
    expect(recommendations.length).toBeGreaterThan(0)

    // 4. Check database storage
    const stored = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .single()

    expect(stored.data).toBeTruthy()

    // 5. Verify cache functionality
    const cached = await aiService.generateCarbonRecommendations(userProfile)
    expect(cached).toEqual(recommendations)

    // 6. Test user feedback integration
    await aiService.recordFeedback(recommendations[0].id, 'helpful')
    
    const feedback = await supabase
      .from('user_recommendation_feedback')
      .select('*')
      .eq('recommendation_id', recommendations[0].id)
      .single()

    expect(feedback.data.feedback_type).toBe('helpful')
  })
})
```

## Cost Optimization

### Token Usage Monitoring

```typescript
class TokenUsageMonitor {
  private readonly costPerToken = 0.00001 // Example pricing
  private monthlyBudget = 1000 // $1000 per month
  private usageTracking = new Map<string, UsageStats>()

  async trackUsage(
    requestType: string,
    promptTokens: number,
    completionTokens: number
  ): Promise<void> {
    const totalTokens = promptTokens + completionTokens
    const cost = totalTokens * this.costPerToken

    const stats = this.usageTracking.get(requestType) || {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageTokensPerRequest: 0
    }

    stats.totalRequests++
    stats.totalTokens += totalTokens
    stats.totalCost += cost
    stats.averageTokensPerRequest = stats.totalTokens / stats.totalRequests

    this.usageTracking.set(requestType, stats)

    // Store in database for persistent tracking
    await this.storeUsageStats(requestType, {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost,
      timestamp: new Date()
    })

    // Check budget limits
    await this.checkBudgetLimits()
  }

  async checkBudgetLimits(): Promise<void> {
    const monthlyUsage = await this.getMonthlyUsage()
    
    if (monthlyUsage.totalCost > this.monthlyBudget * 0.9) {
      await this.notifyBudgetWarning(monthlyUsage)
    }

    if (monthlyUsage.totalCost > this.monthlyBudget) {
      await this.enableCostSavingMode()
    }
  }

  private async enableCostSavingMode(): Promise<void> {
    // Implement cost-saving strategies
    // - Increase cache TTL
    // - Reduce max_tokens for requests
    // - Use more aggressive fallbacks
    // - Batch more requests
  }
}
```

### Request Optimization

```typescript
class RequestOptimizer {
  optimizePrompt(prompt: string, targetTokens: number): string {
    // Remove unnecessary whitespace
    let optimized = prompt.replace(/\s+/g, ' ').trim()

    // Estimate current token count
    const currentTokens = this.estimateTokens(optimized)

    if (currentTokens > targetTokens) {
      // Aggressive optimization needed
      optimized = this.compressPrompt(optimized, targetTokens)
    }

    return optimized
  }

  private compressPrompt(prompt: string, targetTokens: number): string {
    const sections = prompt.split('\n\n')
    const essentialSections = sections.filter(section => 
      this.isEssentialSection(section)
    )

    let compressed = essentialSections.join('\n\n')
    
    if (this.estimateTokens(compressed) > targetTokens) {
      // Further compression needed
      compressed = this.abbreviateContent(compressed, targetTokens)
    }

    return compressed
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 4 characters per token
    return Math.ceil(text.length / 4)
  }

  async selectOptimalModel(requestType: string, complexity: number): Promise<string> {
    const models = {
      'simple': { name: 'inflection-2.5', costMultiplier: 1.0 },
      'complex': { name: 'inflection-2.5', costMultiplier: 1.0 }
    }

    // For now, using single model, but this allows for future model selection
    return models.simple.name
  }
}
```

## Future Enhancements

### 1. Advanced AI Capabilities

**Multimodal Integration**:
```typescript
// Future: Combine text and image analysis
interface MultimodalRequest {
  text_data: UserCarbonProfile
  satellite_images: ImageData[]
  context: EnvironmentalContext
}

async analyzeMultimodal(request: MultimodalRequest): Promise<EnhancedInsight> {
  // Process both text and image data for richer insights
  const textAnalysis = await this.analyzeTextData(request.text_data)
  const imageAnalysis = await this.analyzeSatelliteImages(request.satellite_images)
  
  return this.combineAnalyses(textAnalysis, imageAnalysis, request.context)
}
```

**Adaptive Learning**:
```typescript
// Learn from user feedback to improve recommendations
class AdaptiveLearningEngine {
  async updateModelFromFeedback(
    recommendations: AIRecommendation[],
    feedback: UserFeedback[]
  ): Promise<void> {
    const trainingData = this.prepareFeedbackData(recommendations, feedback)
    await this.finetunePrrompts(trainingData)
  }

  private async finetunePrrompts(data: TrainingData[]): Promise<void> {
    // Implement prompt optimization based on feedback patterns
    const patterns = this.analyzeFeedbackPatterns(data)
    this.updatePromptTemplates(patterns)
  }
}
```

### 2. Real-Time Processing

**Streaming Responses**:
```typescript
// Stream AI responses for better user experience
async generateStreamingRecommendations(
  userProfile: UserCarbonProfile
): Promise<AsyncIterable<Partial<AIRecommendation>>> {
  const stream = await this.makeStreamingRequest(userProfile)
  
  for await (const chunk of stream) {
    const parsed = this.parseStreamChunk(chunk)
    if (parsed) yield parsed
  }
}
```

### 3. Collaborative Intelligence

**Community-Driven Insights**:
```typescript
interface CommunityInsight {
  location: string
  collective_actions: string[]
  impact_data: CommunityImpactData
  ai_analysis: string
  validation_score: number
}

async generateCommunityInsights(
  location: string,
  communityData: CommunityData[]
): Promise<CommunityInsight> {
  // Analyze aggregated community data while preserving privacy
  const aggregatedData = this.anonymizeAndAggregate(communityData)
  return this.analyzeCommunityPatterns(location, aggregatedData)
}
```

---

## Conclusion

The Inflection AI integration in EcoGuide AI demonstrates how advanced language models can bridge the gap between complex environmental data and actionable user insights. Through careful prompt engineering, robust error handling, and intelligent caching strategies, the system provides personalized climate recommendations while maintaining performance and cost efficiency.

The modular architecture ensures that AI capabilities can evolve with improving models and changing requirements, while the comprehensive testing and monitoring infrastructure provides confidence in system reliability and output quality.

This integration serves as a foundation for future enhancements in multimodal analysis, adaptive learning, and community-driven climate intelligence, positioning EcoGuide AI at the forefront of AI-powered environmental action platforms.

---

**Next Steps:**
1. Implement advanced caching strategies for improved performance
2. Develop custom fine-tuning based on user feedback patterns
3. Integrate additional AI providers for redundancy and comparison
4. Expand prompt templates for specialized use cases
5. Implement real-time streaming for better user experience

For questions or contributions to the AI integration, please contact the development team or create an issue in the project repository.
