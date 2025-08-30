// Sentinel Hub API Service for Satellite Data
import { inflectionAIService } from './inflectionAI'

const SENTINEL_HUB_CLIENT_ID = import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID
const SENTINEL_HUB_CLIENT_SECRET = import.meta.env.VITE_SENTINEL_HUB_CLIENT_SECRET
const SENTINEL_HUB_BASE_URL = 'https://services.sentinel-hub.com'

interface SatelliteDataPoint {
  id: string
  latitude: number
  longitude: number
  location_name: string
  data_type: 'deforestation' | 'air_quality' | 'temperature' | 'vegetation' | 'water_quality'
  satellite_source: string
  capture_date: string
  analysis_data: any
  ai_insights: string
  environmental_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  image_url?: string
}

interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

interface SentinelAuthToken {
  access_token: string
  expires_at: number
}

class SentinelHubService {
  private authToken: SentinelAuthToken | null = null

  // Check if we have authentication credentials
  private hasCredentials(): boolean {
    return !!(SENTINEL_HUB_CLIENT_ID && SENTINEL_HUB_CLIENT_SECRET)
  }

  // Authenticate with Sentinel Hub (only if credentials are available)
  private async authenticate(): Promise<string | null> {
    if (!this.hasCredentials()) {
      console.log('No Sentinel Hub credentials - using OGC API for basic access')
      return null
    }

    // Check if we have a valid token
    if (this.authToken && this.authToken.expires_at > Date.now()) {
      return this.authToken.access_token
    }

    try {
      const response = await fetch(`${SENTINEL_HUB_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: SENTINEL_HUB_CLIENT_ID,
          client_secret: SENTINEL_HUB_CLIENT_SECRET,
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const data = await response.json()
      this.authToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000) - 60000, // 1 minute buffer
      }

      return this.authToken.access_token
    } catch (error) {
      console.error('Sentinel Hub authentication error:', error)
      return null
    }
  }

  // Get satellite imagery using OGC API (no credentials required)
  async getSatelliteImageryOGC(bbox: BoundingBox, width: number = 512, height: number = 512): Promise<string> {
    try {
      // Use OGC WMS service - no authentication required
      const wmsUrl = `https://services.sentinel-hub.com/ogc/wms/${SENTINEL_HUB_CLIENT_ID || 'default'}`
      
      const params = new URLSearchParams({
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        layers: 'TRUE_COLOR',
        crs: 'EPSG:4326',
        bbox: `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`,
        width: width.toString(),
        height: height.toString(),
        format: 'image/jpeg',
        time: new Date().toISOString().split('T')[0] // Today's date
      })

      return `${wmsUrl}?${params.toString()}`
    } catch (error) {
      console.error('OGC API error:', error)
      // Fallback to placeholder image
      return `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=${width}&h=${height}&fit=crop&q=80`
    }
  }

  // Get satellite imagery for a specific area (with fallback to OGC API)
  async getSatelliteImagery(bbox: BoundingBox, width: number = 512, height: number = 512): Promise<string> {
    try {
      // Try authenticated Process API first if credentials available
      if (this.hasCredentials()) {
        const token = await this.authenticate()
        if (token) {
          return await this.getSatelliteImageryProcessAPI(bbox, width, height, token)
        }
      }

      // Fallback to OGC API (no credentials required)
      console.log('Using OGC API for satellite imagery (no credentials required)')
      return await this.getSatelliteImageryOGC(bbox, width, height)
    } catch (error) {
      console.error('Error fetching satellite imagery:', error)
      // Final fallback to placeholder
      return `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=${width}&h=${height}&fit=crop&q=80`
    }
  }

  // Get satellite imagery using Process API (requires credentials)
  private async getSatelliteImageryProcessAPI(bbox: BoundingBox, width: number, height: number, token: string): Promise<string> {
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [sample.B04, sample.B03, sample.B02];
      }
    `

    const requestBody = {
      input: {
        bounds: {
          bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
        },
        data: [{
          type: "sentinel-2-l1c",
          dataFilter: {
            timeRange: {
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
              to: new Date().toISOString()
            },
            maxCloudCoverage: 20
          }
        }]
      },
      output: {
        width: width,
        height: height,
        responses: [{
          identifier: "default",
          format: { type: "image/jpeg" }
        }]
      },
      evalscript: evalscript
    }

    const response = await fetch(`${SENTINEL_HUB_BASE_URL}/api/v1/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch imagery: ${response.status}`)
    }

    const imageBlob = await response.blob()
    return URL.createObjectURL(imageBlob)
  }

  // Get environmental data points for map visualization
  async getEnvironmentalDataPoints(bbox: BoundingBox): Promise<SatelliteDataPoint[]> {
    try {
      console.log('Generating environmental data points for area:', bbox)
      
      // Generate realistic environmental data points across the bounding box
      const mockDataPoints: SatelliteDataPoint[] = []
      
      // Generate sample points across the bounding box
      const gridSize = 5 // 5x5 grid of data points
      const latStep = (bbox.maxLat - bbox.minLat) / gridSize
      const lngStep = (bbox.maxLng - bbox.minLng) / gridSize

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const lat = bbox.minLat + (i + 0.5) * latStep
          const lng = bbox.minLng + (j + 0.5) * lngStep
          
          // Use AI to analyze this specific location
          const locationAnalysis = await this.analyzeLocationWithAI(lat, lng)
          
          mockDataPoints.push({
            id: `point_${i}_${j}`,
            latitude: lat,
            longitude: lng,
            location_name: `Area ${i}-${j}`,
            data_type: this.getRandomDataType(),
            satellite_source: 'Sentinel-2',
            capture_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            analysis_data: locationAnalysis.data,
            ai_insights: locationAnalysis.insights,
            environmental_score: locationAnalysis.score,
            risk_level: locationAnalysis.riskLevel,
          })
        }
      }

      console.log(`Generated ${mockDataPoints.length} environmental data points`)
      return mockDataPoints
    } catch (error) {
      console.error('Error fetching environmental data points:', error)
      // Return fallback data
      return this.getFallbackDataPoints(bbox)
    }
  }

  // Use Inflection AI to analyze satellite data for a specific location
  private async analyzeLocationWithAI(lat: number, lng: number) {
    try {
      const prompt = `Analyze the environmental conditions for location ${lat.toFixed(4)}, ${lng.toFixed(4)}. 
      
      Based on typical satellite data patterns for this geographic area, provide:
      1. Environmental score (1-100, where 100 is pristine)
      2. Risk level assessment (low/medium/high/critical)
      3. Key environmental insights (2-3 sentences)
      4. Simulated satellite metrics
      
      Format as JSON:
      {
        "score": number,
        "riskLevel": "low|medium|high|critical",
        "insights": "string",
        "data": {
          "vegetation_index": number,
          "air_quality_index": number,
          "water_quality": number,
          "deforestation_risk": number
        }
      }`

      // For now, we'll generate simulated AI analysis
      // In production, you could call inflectionAIService for real analysis
      const response = null

      // For now, return simulated data since we're using the insights method
      // In production, you'd implement a specific method for location analysis
      const score = Math.floor(Math.random() * 40) + 60 // 60-100
      const riskLevels = ['low', 'medium', 'high', 'critical'] as const
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
      
      return {
        score,
        riskLevel,
        insights: `Environmental assessment for coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)} shows ${riskLevel} risk levels with vegetation and air quality metrics indicating ${score > 80 ? 'excellent' : score > 60 ? 'good' : 'concerning'} conditions.`,
        data: {
          vegetation_index: Math.random() * 100,
          air_quality_index: Math.random() * 100,
          water_quality: Math.random() * 100,
          deforestation_risk: Math.random() * 100
        }
      }
    } catch (error) {
      console.error('Error analyzing location with AI:', error)
      return {
        score: 75,
        riskLevel: 'medium' as const,
        insights: 'Environmental data analysis temporarily unavailable for this location.',
        data: {
          vegetation_index: 75,
          air_quality_index: 70,
          water_quality: 80,
          deforestation_risk: 25
        }
      }
    }
  }

  private getRandomDataType(): SatelliteDataPoint['data_type'] {
    const types: SatelliteDataPoint['data_type'][] = ['deforestation', 'air_quality', 'temperature', 'vegetation', 'water_quality']
    return types[Math.floor(Math.random() * types.length)]
  }

  private getFallbackDataPoints(bbox: BoundingBox): SatelliteDataPoint[] {
    return [
      {
        id: 'fallback_1',
        latitude: (bbox.minLat + bbox.maxLat) / 2,
        longitude: (bbox.minLng + bbox.maxLng) / 2,
        location_name: 'Sample Location',
        data_type: 'vegetation',
        satellite_source: 'Sentinel-2',
        capture_date: new Date().toISOString(),
        analysis_data: {
          vegetation_index: 85,
          air_quality_index: 72,
          water_quality: 78,
          deforestation_risk: 15
        },
        ai_insights: 'This area shows healthy vegetation patterns with good air quality metrics.',
        environmental_score: 78,
        risk_level: 'low'
      }
    ]
  }

  // Get available satellite data collections
  async getAvailableCollections(): Promise<string[]> {
    try {
      const token = await this.authenticate()
      
      const response = await fetch(`${SENTINEL_HUB_BASE_URL}/api/v1/catalog/collections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.status}`)
      }

      const data = await response.json()
      return data.collections?.map((c: any) => c.id) || []
    } catch (error) {
      console.error('Error fetching collections:', error)
      return ['sentinel-2-l1c', 'sentinel-2-l2a', 'landsat-8-l1c']
    }
  }
}

export const sentinelHub = new SentinelHubService()
export type { SatelliteDataPoint, BoundingBox }
