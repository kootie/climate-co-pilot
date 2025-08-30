import { useState, useEffect, useCallback } from 'react'
import { sentinelHub, type SatelliteDataPoint, type BoundingBox } from '@/lib/sentinelHub'
import { supabase } from '@/lib/supabase'

interface MapCenter {
  lat: number
  lng: number
  zoom: number
}

interface SatelliteHook {
  dataPoints: SatelliteDataPoint[]
  loading: boolean
  error: string | null
  mapCenter: MapCenter
  setMapCenter: (center: MapCenter) => void
  refreshData: () => Promise<void>
  getImageryForArea: (bbox: BoundingBox) => Promise<string | null>
  environmentalStats: any
}

export function useSatelliteData(initialCenter: MapCenter = { lat: 0, lng: 0, zoom: 2 }): SatelliteHook {
  const [dataPoints, setDataPoints] = useState<SatelliteDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<MapCenter>(initialCenter)
  const [environmentalStats, setEnvironmentalStats] = useState(null)

  // Calculate bounding box from map center and zoom
  const calculateBoundingBox = useCallback((center: MapCenter): BoundingBox => {
    const zoomFactor = Math.pow(2, 10 - center.zoom) // Adjust area based on zoom
    const latOffset = zoomFactor * 0.5
    const lngOffset = zoomFactor * 0.5

    return {
      minLat: center.lat - latOffset,
      maxLat: center.lat + latOffset,
      minLng: center.lng - lngOffset,
      maxLng: center.lng + lngOffset
    }
  }, [])

  // Fetch satellite data for current view
  const fetchSatelliteData = useCallback(async (center: MapCenter) => {
    setLoading(true)
    setError(null)

    try {
      const bbox = calculateBoundingBox(center)
      
      // Check if we have real Supabase credentials
      const hasRealCredentials =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

      let points: SatelliteDataPoint[] = []

      if (hasRealCredentials) {
        // Try to get data from database first
        const { data: dbPoints, error: dbError } = await supabase
          .from('satellite_data_points')
          .select('*')
          .gte('latitude', bbox.minLat)
          .lte('latitude', bbox.maxLat)
          .gte('longitude', bbox.minLng)
          .lte('longitude', bbox.maxLng)
          .order('capture_date', { ascending: false })
          .limit(100)

        if (dbError) {
          console.warn('Database query failed, using Sentinel Hub API:', dbError)
        } else if (dbPoints && dbPoints.length > 0) {
          // Convert database format to our interface
          points = dbPoints.map(point => ({
            id: point.external_id,
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            location_name: point.location_name,
            data_type: point.data_type,
            satellite_source: point.satellite_source,
            capture_date: point.capture_date,
            analysis_data: point.analysis_data,
            ai_insights: point.ai_insights,
            environmental_score: point.environmental_score,
            risk_level: point.risk_level,
            image_url: point.image_url
          }))

          // Get environmental stats for the region
          const { data: stats } = await supabase
            .rpc('get_environmental_stats_for_region', {
              min_lat: bbox.minLat,
              max_lat: bbox.maxLat,
              min_lng: bbox.minLng,
              max_lng: bbox.maxLng
            })

          setEnvironmentalStats(stats)
        }
      }

      // If no data from database, fetch from Sentinel Hub API
      if (points.length === 0) {
        console.log('Fetching fresh data from Sentinel Hub API...')
        points = await sentinelHub.getEnvironmentalDataPoints(bbox)

        // Store new data in database if available
        if (hasRealCredentials && points.length > 0) {
          const dbInserts = points.map(point => ({
            external_id: point.id,
            latitude: point.latitude,
            longitude: point.longitude,
            location_name: point.location_name,
            data_type: point.data_type,
            satellite_source: point.satellite_source,
            capture_date: point.capture_date,
            analysis_data: point.analysis_data,
            ai_insights: point.ai_insights,
            environmental_score: point.environmental_score,
            risk_level: point.risk_level,
            image_url: point.image_url
          }))

          await supabase
            .from('satellite_data_points')
            .upsert(dbInserts, { onConflict: 'external_id' })
        }
      }

      setDataPoints(points)
    } catch (err: any) {
      console.error('Error fetching satellite data:', err)
      setError(err.message || 'Failed to fetch satellite data')
      
      // Fallback to mock data
      setDataPoints([
        {
          id: 'fallback_1',
          latitude: center.lat,
          longitude: center.lng,
          location_name: 'Demo Location',
          data_type: 'vegetation',
          satellite_source: 'Sentinel-2',
          capture_date: new Date().toISOString(),
          analysis_data: {
            vegetation_index: 75,
            air_quality_index: 68,
            water_quality: 82,
            deforestation_risk: 12
          },
          ai_insights: 'This location shows moderate environmental health with stable vegetation patterns.',
          environmental_score: 72,
          risk_level: 'medium'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [calculateBoundingBox])

  // Get satellite imagery for a specific area
  const getImageryForArea = useCallback(async (bbox: BoundingBox): Promise<string | null> => {
    try {
      console.log('Requesting satellite imagery for area:', bbox)
      
      // Check if we have Sentinel Hub credentials
      const hasCredentials = import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID
      
      if (!hasCredentials) {
        console.log('No Sentinel Hub credentials - using OGC API for basic access')
        // The sentinelHub service will automatically fall back to OGC API
      } else {
        console.log('Using authenticated Sentinel Hub Process API')
      }

      // Get imagery (will automatically use OGC API if no credentials)
      const imageryUrl = await sentinelHub.getSatelliteImagery(bbox)
      console.log('Satellite imagery URL:', imageryUrl)
      return imageryUrl
    } catch (error) {
      console.error('Error fetching satellite imagery:', error)
      // Return a placeholder satellite image URL as final fallback
      return `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=512&h=512&fit=crop&q=80`
    }
  }, [])

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await fetchSatelliteData(mapCenter)
  }, [mapCenter, fetchSatelliteData])

  // Fetch data when map center changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSatelliteData(mapCenter)
    }, 500) // Debounce map movements

    return () => clearTimeout(debounceTimer)
  }, [mapCenter, fetchSatelliteData])

  return {
    dataPoints,
    loading,
    error,
    mapCenter,
    setMapCenter,
    refreshData,
    getImageryForArea,
    environmentalStats
  }
}
