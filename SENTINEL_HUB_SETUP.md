# Sentinel Hub API Integration Setup

## Overview

This guide walks you through setting up the [Sentinel Hub API](https://www.sentinel-hub.com/develop/api/) integration for real-time satellite data monitoring in EcoGuide AI.

## What is Sentinel Hub?

Sentinel Hub provides access to satellite imagery and data from:
- **Sentinel-2**: High-resolution optical imagery (10-60m resolution)
- **Sentinel-3**: Land and ocean monitoring
- **Sentinel-5P**: Atmospheric monitoring
- **Landsat 8**: Historical and current land observation
- **MODIS**: Global environmental monitoring

## Features Integrated

### 🛰️ **Satellite Data Processing**
- Real-time environmental monitoring points
- Air quality, vegetation, deforestation, and temperature analysis
- Risk level assessment (Low, Medium, High, Critical)

### 🤖 **AI-Powered Analysis**
- Inflection AI integration for location-specific insights
- Environmental score calculation (1-100)
- Automated risk assessment and recommendations

### 📊 **Database Storage**
- Satellite data points with coordinates and analysis
- Environmental alerts and notifications
- Regional statistics and monitoring

## Setup Instructions

### 1. Create Sentinel Hub Account

1. Visit [Sentinel Hub](https://www.sentinel-hub.com/)
2. Click **"Sign Up"** or **"Try for Free"**
3. Create your account and verify email
4. Access your [Dashboard](https://apps.sentinel-hub.com/dashboard/)

### 2. Get API Credentials

1. In your Sentinel Hub Dashboard:
   - Go to **"User Settings"** → **"OAuth clients"**
   - Click **"+ New OAuth Client"**
   - Name: `EcoGuide AI Integration`
   - Grant Type: `Client Credentials`
   - Click **"Create"**

2. Copy your credentials:
   - **Client ID**: Your unique client identifier
   - **Client Secret**: Your secret key (keep this secure!)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Sentinel Hub API Credentials
VITE_SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id_here
VITE_SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret_here

# Existing credentials
VITE_SUPABASE_URL=https://vnbvtpsfjfyglvoqavhp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnZ0cHNmamZ5Z2x2b3FhdmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzkyMzcsImV4cCI6MjA3MjExNTIzN30.RqtFwB8GNOwR1dJ82BgrrGwiC0-DsutTGkdRNmICUkw
VITE_INFLECTION_API_KEY=0ypaDqccUBexBG9wsX1UH4zJzzd3SQnspqLMN7FP8oQ
```

### 4. Set Up Database Schema

Run the satellite data schema in your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Create a **New Query**
4. Copy and paste the entire contents of `database/satellite_data_schema.sql`
5. Click **"Run"**

This creates tables for:
- `satellite_data_points` - Environmental monitoring data
- `satellite_imagery` - Image metadata and URLs  
- `environmental_alerts` - Automated risk notifications
- `map_regions` - Geographic area organization
- `satellite_api_usage` - API usage tracking

### 5. Restart Development Server

```bash
npm run dev
```

## How It Works

### 🔄 **Data Flow**

1. **Map Interaction**: User navigates to different regions
2. **API Request**: Sentinel Hub fetches satellite data for the area
3. **AI Analysis**: Inflection AI analyzes environmental patterns
4. **Database Storage**: Results cached in Supabase for quick access
5. **Visualization**: Real-time updates in the map interface

### 📍 **Map Features**

- **Interactive Points**: Click satellite data points for detailed analysis
- **Layer Selection**: Toggle between satellite, environmental, and AI analysis views
- **Real-time Updates**: Refresh button fetches latest satellite data
- **Risk Visualization**: Color-coded risk levels with legend

### 🧠 **AI Integration**

Each satellite data point includes:
- **Environmental Score**: 1-100 assessment of environmental health
- **Risk Level**: Automated classification (Low/Medium/High/Critical)
- **AI Insights**: Natural language analysis of the location
- **Recommendations**: Suggested actions based on the data

## API Usage & Limits

### Free Tier Includes:
- **5,000 requests/month**
- **Basic processing units**
- **Standard resolution imagery**

### Usage Optimization:
- Data is cached in the database to reduce API calls
- Fallback mock data when API limits are reached
- Intelligent request batching for efficiency

## Troubleshooting

### Common Issues:

1. **"Sentinel Hub credentials not configured"**
   - Verify `.env.local` file exists with correct credentials
   - Restart development server after adding credentials

2. **"Authentication failed: 401"**
   - Check if Client ID and Client Secret are correct
   - Ensure OAuth client is active in Sentinel Hub dashboard

3. **"No satellite data available"**
   - API might be at usage limit
   - Application will use intelligent mock data as fallback

4. **"Database table not found"**
   - Run the `satellite_data_schema.sql` in Supabase
   - Ensure all tables are created successfully

### Check Integration Status:

Visit your app and look for the **App Status** component at the bottom of the homepage:
- ✅ **Sentinel Hub: Configured** - Integration working
- ⚠️ **Sentinel Hub: Not Setup** - Needs configuration

## Advanced Features

### Custom Data Processing

The integration supports:
- **Custom evalscripts** for specific analysis
- **Multi-temporal analysis** for change detection  
- **Statistical API** for area-based calculations
- **Batch processing** for large-scale analysis

### Supported Data Collections

- `sentinel-2-l1c` - Raw Sentinel-2 data
- `sentinel-2-l2a` - Atmosphere-corrected Sentinel-2
- `sentinel-3-olci` - Ocean and land color data
- `sentinel-5p-l2` - Atmospheric monitoring
- `landsat-8-l1c` - Landsat historical data

## Support

- **Sentinel Hub Documentation**: https://www.sentinel-hub.com/develop/api/
- **Community Forum**: https://forum.sentinel-hub.com/
- **API Status**: https://status.sentinel-hub.com/

## Next Steps

1. **Explore the Map**: Navigate to different regions and click data points
2. **Check Alerts**: Monitor environmental alerts in the dashboard
3. **Analyze Trends**: Use AI insights for environmental decision-making
4. **Scale Up**: Consider premium plans for higher usage limits

---

🚀 **Your satellite monitoring system is now powered by real data from space!**
