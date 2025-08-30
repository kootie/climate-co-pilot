-- Satellite Data Schema for Sentinel Hub Integration
-- Run this after ai_features_schema.sql

-- Create satellite_data_points table
CREATE TABLE satellite_data_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE NOT NULL, -- ID from Sentinel Hub or generated
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255),
    data_type VARCHAR(50) NOT NULL, -- 'deforestation', 'air_quality', 'temperature', 'vegetation', 'water_quality'
    satellite_source VARCHAR(100) NOT NULL, -- 'Sentinel-2', 'Landsat-8', etc.
    capture_date TIMESTAMP WITH TIME ZONE NOT NULL,
    analysis_data JSONB, -- Raw satellite analysis data
    ai_insights TEXT, -- AI-generated insights about this location
    environmental_score INTEGER CHECK (environmental_score >= 0 AND environmental_score <= 100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    image_url TEXT, -- URL to satellite image
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create satellite_imagery table for storing image metadata
CREATE TABLE satellite_imagery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bbox_min_lat DECIMAL(10, 8) NOT NULL,
    bbox_max_lat DECIMAL(10, 8) NOT NULL,
    bbox_min_lng DECIMAL(11, 8) NOT NULL,
    bbox_max_lng DECIMAL(11, 8) NOT NULL,
    image_url TEXT NOT NULL,
    satellite_source VARCHAR(100) NOT NULL,
    capture_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cloud_coverage DECIMAL(5, 2), -- Percentage
    resolution_meters INTEGER,
    ai_analysis TEXT, -- AI analysis of the entire image
    metadata JSONB, -- Additional metadata from Sentinel Hub
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create environmental_alerts table for tracking significant changes
CREATE TABLE environmental_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    satellite_point_id UUID REFERENCES satellite_data_points(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'deforestation_detected', 'air_quality_degraded', etc.
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    ai_recommendation TEXT, -- AI-generated recommendation for this alert
    coordinates_lat DECIMAL(10, 8) NOT NULL,
    coordinates_lng DECIMAL(11, 8) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create map_regions table for organizing data by geographic regions
CREATE TABLE map_regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon_coordinates JSONB NOT NULL, -- GeoJSON polygon
    region_type VARCHAR(50) NOT NULL, -- 'country', 'state', 'city', 'forest', 'ocean', etc.
    monitoring_priority INTEGER DEFAULT 1 CHECK (monitoring_priority >= 1 AND monitoring_priority <= 5),
    ai_summary TEXT, -- AI-generated summary of this region's environmental status
    last_analyzed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create satellite_api_usage table for tracking API usage
CREATE TABLE satellite_api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    api_service VARCHAR(100) NOT NULL, -- 'sentinel_hub', 'landsat', etc.
    endpoint VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'imagery', 'statistics', 'catalog', etc.
    bbox_coordinates JSONB, -- Bounding box of the request
    response_size_bytes INTEGER,
    processing_time_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    cost_credits DECIMAL(10, 4), -- API cost in credits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_satellite_data_points_coordinates ON satellite_data_points(latitude, longitude);
CREATE INDEX idx_satellite_data_points_data_type ON satellite_data_points(data_type);
CREATE INDEX idx_satellite_data_points_capture_date ON satellite_data_points(capture_date DESC);
CREATE INDEX idx_satellite_data_points_risk_level ON satellite_data_points(risk_level);
CREATE INDEX idx_satellite_data_points_environmental_score ON satellite_data_points(environmental_score);

CREATE INDEX idx_satellite_imagery_bbox ON satellite_imagery(bbox_min_lat, bbox_max_lat, bbox_min_lng, bbox_max_lng);
CREATE INDEX idx_satellite_imagery_capture_date ON satellite_imagery(capture_date DESC);
CREATE INDEX idx_satellite_imagery_source ON satellite_imagery(satellite_source);

CREATE INDEX idx_environmental_alerts_severity ON environmental_alerts(severity);
CREATE INDEX idx_environmental_alerts_coordinates ON environmental_alerts(coordinates_lat, coordinates_lng);
CREATE INDEX idx_environmental_alerts_detected_at ON environmental_alerts(detected_at DESC);
CREATE INDEX idx_environmental_alerts_acknowledged ON environmental_alerts(acknowledged);

CREATE INDEX idx_map_regions_type ON map_regions(region_type);
CREATE INDEX idx_map_regions_priority ON map_regions(monitoring_priority);

CREATE INDEX idx_satellite_api_usage_service ON satellite_api_usage(api_service);
CREATE INDEX idx_satellite_api_usage_created_at ON satellite_api_usage(created_at DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_map_regions_updated_at BEFORE UPDATE ON map_regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE satellite_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_imagery ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read satellite data points" ON satellite_data_points FOR SELECT USING (true);
CREATE POLICY "Admin manage satellite data points" ON satellite_data_points FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read satellite imagery" ON satellite_imagery FOR SELECT USING (true);
CREATE POLICY "Admin manage satellite imagery" ON satellite_imagery FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read environmental alerts" ON environmental_alerts FOR SELECT USING (true);
CREATE POLICY "Admin manage environmental alerts" ON environmental_alerts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read map regions" ON map_regions FOR SELECT USING (true);
CREATE POLICY "Admin manage map regions" ON map_regions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin read api usage" ON satellite_api_usage FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System insert api usage" ON satellite_api_usage FOR INSERT WITH CHECK (true);

-- Function to get environmental statistics for a region
CREATE OR REPLACE FUNCTION get_environmental_stats_for_region(
    min_lat DECIMAL,
    max_lat DECIMAL,
    min_lng DECIMAL,
    max_lng DECIMAL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_data_points', COUNT(*),
        'average_environmental_score', ROUND(AVG(environmental_score), 2),
        'risk_distribution', json_build_object(
            'low', COUNT(*) FILTER (WHERE risk_level = 'low'),
            'medium', COUNT(*) FILTER (WHERE risk_level = 'medium'),
            'high', COUNT(*) FILTER (WHERE risk_level = 'high'),
            'critical', COUNT(*) FILTER (WHERE risk_level = 'critical')
        ),
        'data_types', json_agg(DISTINCT data_type),
        'latest_capture', MAX(capture_date),
        'alerts_count', (
            SELECT COUNT(*) 
            FROM environmental_alerts ea 
            WHERE ea.coordinates_lat BETWEEN min_lat AND max_lat 
            AND ea.coordinates_lng BETWEEN min_lng AND max_lng
            AND ea.detected_at > NOW() - INTERVAL '30 days'
        )
    )
    FROM satellite_data_points
    WHERE latitude BETWEEN min_lat AND max_lat
    AND longitude BETWEEN min_lng AND max_lng
    INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent environmental alerts
CREATE OR REPLACE FUNCTION get_recent_environmental_alerts(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    id UUID,
    alert_type VARCHAR,
    severity VARCHAR,
    description TEXT,
    coordinates_lat DECIMAL,
    coordinates_lng DECIMAL,
    detected_at TIMESTAMP WITH TIME ZONE,
    acknowledged BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.id,
        ea.alert_type,
        ea.severity,
        ea.description,
        ea.coordinates_lat,
        ea.coordinates_lng,
        ea.detected_at,
        ea.acknowledged
    FROM environmental_alerts ea
    WHERE ea.detected_at > NOW() - INTERVAL '1 day' * days_back
    ORDER BY ea.detected_at DESC, ea.severity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
INSERT INTO map_regions (name, description, polygon_coordinates, region_type, monitoring_priority) VALUES
(
    'Global Overview',
    'Global environmental monitoring area covering major climate zones',
    '{"type": "Polygon", "coordinates": [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]}',
    'global',
    1
),
(
    'Amazon Rainforest',
    'Critical deforestation monitoring zone in the Amazon Basin',
    '{"type": "Polygon", "coordinates": [[[-70, -10], [-50, -10], [-50, 5], [-70, 5], [-70, -10]]]}',
    'forest',
    5
),
(
    'European Union',
    'Air quality and climate monitoring across EU member states',
    '{"type": "Polygon", "coordinates": [[[-10, 35], [30, 35], [30, 70], [-10, 70], [-10, 35]]]}',
    'region',
    3
);

-- Insert sample satellite data points
INSERT INTO satellite_data_points (
    external_id, latitude, longitude, location_name, data_type, satellite_source, 
    capture_date, analysis_data, ai_insights, environmental_score, risk_level
) VALUES
(
    'sample_amazon_1',
    -3.4653,
    -62.2159,
    'Amazon Basin - Manaus',
    'deforestation',
    'Sentinel-2',
    NOW() - INTERVAL '2 days',
    '{"vegetation_index": 75, "deforestation_rate": 0.02, "forest_cover": 85}',
    'This Amazon region shows stable forest cover with low deforestation activity. Vegetation index indicates healthy rainforest conditions.',
    82,
    'low'
),
(
    'sample_europe_1',
    48.8566,
    2.3522,
    'Paris, France',
    'air_quality',
    'Sentinel-5P',
    NOW() - INTERVAL '1 day',
    '{"no2_levels": 35, "pm25": 18, "ozone": 45}',
    'Urban air quality shows moderate levels with NO2 concentrations within acceptable limits for this metropolitan area.',
    68,
    'medium'
),
(
    'sample_arctic_1',
    71.0061,
    8.0253,
    'Svalbard, Norway',
    'temperature',
    'Sentinel-3',
    NOW() - INTERVAL '3 days',
    '{"surface_temp": -5.2, "ice_coverage": 78, "albedo": 0.85}',
    'Arctic monitoring shows concerning temperature trends with above-average warming. Ice coverage remains stable but requires continued monitoring.',
    45,
    'high'
);

-- Insert sample environmental alerts
INSERT INTO environmental_alerts (
    satellite_point_id, alert_type, severity, description, ai_recommendation,
    coordinates_lat, coordinates_lng, detected_at
) VALUES
(
    (SELECT id FROM satellite_data_points WHERE external_id = 'sample_arctic_1'),
    'temperature_anomaly',
    'high',
    'Unusual temperature increase detected in Arctic region',
    'Increase monitoring frequency and cross-reference with climate models. Consider issuing early warning for ice stability assessment.',
    71.0061,
    8.0253,
    NOW() - INTERVAL '6 hours'
);

-- Create a function to clean up old satellite data
CREATE OR REPLACE FUNCTION cleanup_old_satellite_data()
RETURNS void AS $$
BEGIN
    -- Delete data points older than 1 year
    DELETE FROM satellite_data_points 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Delete imagery older than 6 months
    DELETE FROM satellite_imagery 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Delete acknowledged alerts older than 3 months
    DELETE FROM environmental_alerts 
    WHERE acknowledged = true 
    AND acknowledged_at < NOW() - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
