import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  TreePine, 
  Droplets, 
  TrendingDown, 
  AlertTriangle, 
  Satellite,
  RefreshCw,
  Brain,
  Activity,
  Thermometer,
  Wind,
  Leaf,
  CheckCircle,
  Layers
} from "lucide-react";
import { useSatelliteData } from "@/hooks/useSatelliteData";
import type { SatelliteDataPoint } from "@/lib/sentinelHub";

const MapView = () => {
  const [selectedLayer, setSelectedLayer] = useState<'satellite' | 'environmental' | 'ai-analysis'>('satellite')
  const [selectedPoint, setSelectedPoint] = useState<SatelliteDataPoint | null>(null)
  
  // Initialize satellite data hook with default center (Kenya)
  const {
    dataPoints,
    loading,
    error,
    mapCenter,
    setMapCenter,
    refreshData,
    environmentalStats
  } = useSatelliteData({ lat: -1.286389, lng: 36.817223, zoom: 6 })

  // Handle layer change with smooth transitions
  const handleLayerChange = (layer: 'satellite' | 'environmental' | 'ai-analysis') => {
    setSelectedLayer(layer)
    // Clear selected point when switching layers for better UX
    setSelectedPoint(null)
  }

  // Mock data as fallback (keeping existing data structure)
  const environmentalData = [
    {
      id: 1,
      location: "Mau Forest, Kenya",
      type: "Forest Loss",
      impact: "8 hectares lost",
      description: "About 10 football fields, mostly due to charcoal burning",
      severity: "high",
      coordinates: { lat: -0.5, lng: 35.5 }
    },
    {
      id: 2,
      location: "Lake Nakuru Region",
      type: "Water Stress",
      impact: "15% reduction",
      description: "Water levels dropping due to increased agricultural use",
      severity: "medium",
      coordinates: { lat: -0.3, lng: 36.1 }
    },
    {
      id: 3,
      location: "Aberdare Mountains",
      type: "Reforestation",
      impact: "+12 hectares",
      description: "Community tree planting initiative showing positive results",
      severity: "positive",
      coordinates: { lat: -0.4, lng: 36.7 }
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "positive": return "default";
      default: return "secondary";
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "Forest Loss": return <TreePine className="w-5 h-5" />;
      case "Water Stress": return <Droplets className="w-5 h-5" />;
      case "Reforestation": return <TreePine className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-earth">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center items-center gap-4">
            <Satellite className="w-12 h-12 text-primary" />
            {loading && <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />}
            <Brain className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            AI-Powered Satellite Monitoring
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time satellite data from Sentinel Hub combined with Inflection AI analysis 
            for intelligent environmental monitoring and climate insights.
          </p>
          
          {/* Data Status */}
          {error && (
            <Alert className="mt-6 max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error} - Using demo data for visualization.
              </AlertDescription>
            </Alert>
          )}
          
          {environmentalStats && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-primary">{environmentalStats.total_data_points || dataPoints.length}</div>
                <div className="text-sm text-muted-foreground">Data Points</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{environmentalStats.average_environmental_score || '72'}</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600">{environmentalStats.alerts_count || '3'}</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{dataPoints.length}</div>
                <div className="text-sm text-muted-foreground">Live Points</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Satellite Map Interface */}
          <Card className="p-8 bg-gradient-forest text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Satellite Map View</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {dataPoints.length} Points
                </Badge>
              </div>
            </div>
            
            {/* Layer Selection */}
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4" />
              <span className="text-sm">Layers:</span>
              {(['satellite', 'environmental', 'ai-analysis'] as const).map((layer) => (
                <Button
                  key={layer}
                  variant={selectedLayer === layer ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleLayerChange(layer)}
                  className={`text-xs transition-all duration-300 ${
                    selectedLayer === layer 
                      ? 'bg-white/20 text-white shadow-lg scale-105' 
                      : 'bg-white/10 hover:bg-white/20 hover:scale-102'
                  }`}
                >
                  {layer === 'satellite' && <Satellite className="w-3 h-3 mr-1" />}
                  {layer === 'environmental' && <TreePine className="w-3 h-3 mr-1" />}
                  {layer === 'ai-analysis' && <Brain className="w-3 h-3 mr-1" />}
                  {layer.replace('-', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
            
            {/* Layer-Specific Content */}
            <div className="mb-4">
              {selectedLayer === 'satellite' && (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <Satellite className="w-4 h-4" />
                    <span>Satellite View: High-resolution imagery from Sentinel satellites</span>
                  </div>
                </div>
              )}
              
              {selectedLayer === 'environmental' && (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <TreePine className="w-4 h-4" />
                    <span>Environmental Monitoring: Real-time climate and ecosystem data</span>
                  </div>
                </div>
              )}
              
              {selectedLayer === 'ai-analysis' && (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <Brain className="w-4 h-4" />
                    <span>AI Analysis: Inflection AI-powered insights and predictions</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Simulated Map Interface */}
            <div className="relative h-80 bg-white/10 rounded-lg border border-white/20 mb-6">
              <div className="absolute inset-4 bg-gradient-to-br from-primary-glow/30 to-secondary/30 rounded-lg">
                {/* Satellite Data Points with Layer-Specific Styling */}
                {(dataPoints.length > 0 ? dataPoints : environmentalData.map(data => ({
                  id: data.id.toString(),
                  location_name: data.location,
                  data_type: data.type.toLowerCase().replace(' ', '_'),
                  environmental_score: data.severity === 'high' ? 30 : data.severity === 'medium' ? 65 : 85,
                  risk_level: data.severity,
                  ai_insights: data.description
                }))).map((point, index) => {
                  // Layer-specific styling
                  let riskColor = 'bg-blue-500'
                  let icon = null
                  
                  if (selectedLayer === 'satellite') {
                    riskColor = {
                      critical: 'bg-red-600',
                      high: 'bg-red-500',
                      medium: 'bg-yellow-500',
                      low: 'bg-green-500'
                    }[point.risk_level] || 'bg-blue-500'
                    icon = <Satellite className="w-3 h-3 text-white absolute -top-1 -right-1" />
                  } else if (selectedLayer === 'environmental') {
                    riskColor = {
                      critical: 'bg-red-600',
                      high: 'bg-red-500',
                      medium: 'bg-yellow-500',
                      low: 'bg-green-500'
                    }[point.risk_level] || 'bg-blue-500'
                    icon = <TreePine className="w-3 h-3 text-white absolute -top-1 -right-1" />
                  } else if (selectedLayer === 'ai-analysis') {
                    riskColor = 'bg-purple-600'
                    icon = <Brain className="w-3 h-3 text-white absolute -top-1 -right-1" />
                  }
                  
                  return (
                    <div 
                      key={point.id}
                      className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse-glow cursor-pointer hover:scale-125 transition-transform ${riskColor}`}
                      style={{
                        top: `${15 + (index * 18) % 70}%`,
                        left: `${20 + (index * 25) % 60}%`
                      }}
                      title={`${point.location_name} - Score: ${point.environmental_score}`}
                      onClick={() => setSelectedPoint(selectedPoint?.id === point.id ? null : point)}
                    >
                      {icon}
                    </div>
                  )
                })}
                
                {/* Layer-Specific Overlay Information */}
                {selectedLayer === 'satellite' && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
                    <div>Sentinel-2 L1C</div>
                    <div>Cloud Cover: &lt;20%</div>
                    <div>Resolution: 10m</div>
                  </div>
                )}
                
                {selectedLayer === 'environmental' && (
                  <div className="absolute top-2 right-2 bg-green-600/80 text-white text-xs p-2 rounded">
                    <div>Environmental Score</div>
                    <div>Active Monitoring</div>
                    <div>Real-time Data</div>
                  </div>
                )}
                
                {selectedLayer === 'ai-analysis' && (
                  <div className="absolute bottom-2 left-2 bg-purple-600/80 text-white text-xs p-2 rounded">
                    <div>AI Analysis</div>
                    <div>Risk Assessment</div>
                    <div>Predictions</div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm text-white/90">
                    {selectedLayer === 'satellite' && 'Click markers to view satellite imagery and data'}
                    {selectedLayer === 'environmental' && 'Click markers to see environmental monitoring data'}
                    {selectedLayer === 'ai-analysis' && 'Click markers to view AI-powered insights and predictions'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full bg-white/20 text-white hover:bg-white/30"
            >
              Open Full Interactive Map
            </Button>
          </Card>

          {/* Satellite Data Analysis Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">
                {selectedLayer === 'satellite' && 'Satellite Data Analysis'}
                {selectedLayer === 'environmental' && 'Environmental Monitoring'}
                {selectedLayer === 'ai-analysis' && 'AI-Powered Insights'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {selectedLayer === 'satellite' && <Satellite className="w-4 h-4" />}
                {selectedLayer === 'environmental' && <TreePine className="w-4 h-4" />}
                {selectedLayer === 'ai-analysis' && <Brain className="w-4 h-4" />}
                <span>{dataPoints.length > 0 ? 'Live Data' : 'Demo Data'}</span>
              </div>
            </div>
            
            {/* Layer-Specific Summary */}
            <Card className="p-4 bg-muted/30">
              {selectedLayer === 'satellite' && (
                <div className="flex items-center gap-3">
                  <Satellite className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Satellite Coverage</h4>
                    <p className="text-sm text-muted-foreground">Sentinel-2 L1C data with 10m resolution</p>
                  </div>
                </div>
              )}
              
              {selectedLayer === 'environmental' && (
                <div className="flex items-center gap-3">
                  <TreePine className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Environmental Health</h4>
                    <p className="text-sm text-muted-foreground">Real-time ecosystem monitoring and assessment</p>
                  </div>
                </div>
              )}
              
              {selectedLayer === 'ai-analysis' && (
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">AI Intelligence</h4>
                    <p className="text-sm text-muted-foreground">Inflection AI-powered analysis and predictions</p>
                  </div>
                </div>
              )}
            </Card>
            
            {/* Selected Point Details */}
            {selectedPoint && (
              <Card className="p-6 border-2 border-primary/50 bg-primary/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {selectedLayer === 'satellite' && <Satellite className="w-5 h-5" />}
                      {selectedLayer === 'environmental' && <TreePine className="w-5 h-5" />}
                      {selectedLayer === 'ai-analysis' && <Brain className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedPoint.location_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{selectedPoint.data_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Badge variant={
                    selectedPoint.risk_level === 'critical' ? 'destructive' :
                    selectedPoint.risk_level === 'high' ? 'destructive' :
                    selectedPoint.risk_level === 'medium' ? 'secondary' : 'default'
                  }>
                    Score: {selectedPoint.environmental_score}/100
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Environmental Score</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedPoint.environmental_score} className="flex-1" />
                      <span className="font-bold text-lg">{selectedPoint.environmental_score}/100</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {selectedLayer === 'satellite' && 'Satellite Data'}
                      {selectedLayer === 'environmental' && 'Environmental Metrics'}
                      {selectedLayer === 'ai-analysis' && 'AI Insights'}
                    </span>
                    <p className="text-sm mt-1 bg-muted/50 rounded p-3">{selectedPoint.ai_insights}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    {selectedLayer === 'satellite' && (
                      <Button variant="outline" size="sm">
                        <Satellite className="w-4 h-4 mr-2" />
                        View Imagery
                      </Button>
                    )}
                    {selectedLayer === 'environmental' && (
                      <Button variant="outline" size="sm">
                        <TreePine className="w-4 h-4 mr-2" />
                        View Metrics
                      </Button>
                    )}
                    {selectedLayer === 'ai-analysis' && (
                      <Button variant="outline" size="sm">
                        <Brain className="w-4 h-4 mr-2" />
                        View Analysis
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPoint(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Recent Environmental Changes */}
            {(dataPoints.length > 0 ? dataPoints.slice(0, 3) : environmentalData).map((data, index) => {
              const isRealData = 'environmental_score' in data
              const displayData = isRealData ? {
                id: data.id,
                location: data.location_name,
                type: data.data_type.replace('_', ' '),
                impact: `Score: ${data.environmental_score}/100`,
                description: data.ai_insights,
                severity: data.risk_level,
                coordinates: { lat: data.latitude, lng: data.longitude }
              } : data

              return (
                <Card key={displayData.id} className="p-6 hover:shadow-soft transition-all duration-300 cursor-pointer"
                      onClick={() => isRealData && setSelectedPoint(data)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(displayData.type)}
                      <div>
                        <h4 className="font-semibold text-foreground">{displayData.location}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{displayData.type}</p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(displayData.severity) as any}>
                      {displayData.impact}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{displayData.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Lat: {displayData.coordinates.lat.toFixed(4)}, Lng: {displayData.coordinates.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRealData && (
                        <>
                          {selectedLayer === 'satellite' && <Satellite className="w-4 h-4 text-blue-600" />}
                          {selectedLayer === 'environmental' && <TreePine className="w-4 h-4 text-green-600" />}
                          {selectedLayer === 'ai-analysis' && <Brain className="w-4 h-4 text-purple-600" />}
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        {isRealData ? 
                          (selectedLayer === 'satellite' ? 'View Imagery' : 
                           selectedLayer === 'environmental' ? 'View Metrics' : 'AI Analysis') 
                          : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}

            {/* Layer-Specific Additional Features */}
            {selectedLayer === 'satellite' && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Satellite className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-semibold text-blue-900">Satellite Capabilities</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-800">Resolution</div>
                    <div className="text-blue-600">10m (Bands 2-4)</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-800">Coverage</div>
                    <div className="text-blue-600">Global</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-800">Frequency</div>
                    <div className="text-blue-600">5 days</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-800">Cloud Filter</div>
                    <div className="text-blue-600">&lt;20%</div>
                  </div>
                </div>
              </Card>
            )}

            {selectedLayer === 'environmental' && (
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <TreePine className="w-6 h-6 text-green-600" />
                  <h4 className="text-lg font-semibold text-green-900">Environmental Metrics</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800">Vegetation Health</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-20" />
                      <span className="text-green-600 font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-800">Air Quality</span>
                    <div className="flex items-center gap-2">
                      <Progress value={68} className="w-20" />
                      <span className="text-green-600 font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-800">Water Quality</span>
                    <div className="flex items-center gap-2">
                      <Progress value={82} className="w-20" />
                      <span className="text-green-600 font-medium">82%</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {selectedLayer === 'ai-analysis' && (
              <Card className="p-6 bg-purple-50 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-semibold text-purple-900">AI Intelligence</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-purple-800">Risk Assessment</div>
                    <div className="text-purple-600 text-sm">AI-powered environmental risk scoring</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-purple-800">Predictive Analysis</div>
                    <div className="text-purple-600 text-sm">Climate change impact forecasting</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-purple-800">Smart Recommendations</div>
                    <div className="text-purple-600 text-sm">Actionable environmental insights</div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-gradient-ocean text-white">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h4 className="text-lg font-semibold">Community Alert</h4>
              </div>
              <p className="mb-4">
                Forest loss in your region is 20% above normal. Consider supporting local reforestation efforts.
              </p>
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Find Local Projects
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapView;