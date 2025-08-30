-- Create database schema for EcoGuide AI content management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create about_content table
CREATE TABLE about_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section VARCHAR(50) NOT NULL, -- 'hero', 'mission', 'values', 'team', 'stats'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blog_posts table
CREATE TABLE blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    read_time VARCHAR(20) NOT NULL,
    publish_date DATE NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create research_papers table
CREATE TABLE research_papers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    journal VARCHAR(200) NOT NULL,
    publish_date DATE NOT NULL,
    citations INTEGER DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    abstract TEXT NOT NULL,
    download_url TEXT,
    doi VARCHAR(100) NOT NULL,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create research_datasets table
CREATE TABLE research_datasets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    size VARCHAR(20) NOT NULL,
    format VARCHAR(100) NOT NULL,
    last_updated DATE NOT NULL,
    downloads INTEGER DEFAULT 0,
    license VARCHAR(50) NOT NULL,
    download_url TEXT,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create research_projects table
CREATE TABLE research_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
    team TEXT NOT NULL,
    expected_completion VARCHAR(20) NOT NULL,
    funding VARCHAR(20) NOT NULL,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON about_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_papers_updated_at BEFORE UPDATE ON research_papers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_datasets_updated_at BEFORE UPDATE ON research_datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_projects_updated_at BEFORE UPDATE ON research_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_about_content_section ON about_content(section);
CREATE INDEX idx_about_content_order ON about_content(order_index);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX idx_blog_posts_publish_date ON blog_posts(publish_date DESC);
CREATE INDEX idx_research_papers_category ON research_papers(category);
CREATE INDEX idx_research_papers_published ON research_papers(published);
CREATE INDEX idx_research_datasets_published ON research_datasets(published);
CREATE INDEX idx_research_projects_published ON research_projects(published);

-- Enable Row Level Security
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON about_content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Public read access" ON research_papers FOR SELECT USING (published = true);
CREATE POLICY "Public read access" ON research_datasets FOR SELECT USING (published = true);
CREATE POLICY "Public read access" ON research_projects FOR SELECT USING (published = true);

-- Create policies for authenticated admin users (you'll need to set up admin role)
-- For now, we'll use authenticated users for admin operations
CREATE POLICY "Admin full access" ON about_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON research_papers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON research_datasets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON research_projects FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data for About page
INSERT INTO about_content (section, title, content, order_index) VALUES
('hero', 'Main Title', 'About EcoGuide AI', 1),
('hero', 'Subtitle', 'We''re on a mission to democratize climate data and empower individuals to make meaningful environmental impact through AI-powered insights and community action.', 2),
('mission', 'Mission Title', 'Our Mission', 1),
('mission', 'Mission Content', 'Climate change is the defining challenge of our time, but individual action often feels disconnected from global impact. We bridge this gap by making complex environmental data accessible and actionable for everyone.', 2),
('stats', 'Data Points', '50M+', 1),
('stats', 'Active Users', '10K+', 2),
('stats', 'Carbon Reduction', '25%', 3),
('stats', 'Climate Awards', '5', 4);

-- Insert sample blog posts
INSERT INTO blog_posts (title, excerpt, content, category, author, read_time, publish_date, featured) VALUES
('Arctic Ice Melt Reaches Tipping Point: What the Latest Satellite Data Reveals', 'New analysis of satellite imagery shows accelerating ice loss in Greenland and Antarctica, with potential sea level implications for coastal cities worldwide.', 'Full article content here...', 'Climate Science', 'Dr. Sarah Chen', '8 min read', '2024-01-15', true),
('How AI is Revolutionizing Carbon Footprint Tracking', 'Machine learning algorithms are making it easier than ever to understand and reduce personal environmental impact.', 'Full article content here...', 'Technology', 'Marcus Rodriguez', '5 min read', '2024-01-12', false),
('Community Action: Local Solutions to Global Climate Challenges', 'Exploring successful grassroots initiatives that are making measurable environmental impact at the community level.', 'Full article content here...', 'Community', 'Aisha Patel', '6 min read', '2024-01-10', false);

-- Insert sample research papers
INSERT INTO research_papers (title, authors, journal, publish_date, citations, category, abstract, doi) VALUES
('Machine Learning Approaches to Climate Data Analysis: A Comprehensive Review', ARRAY['Dr. Sarah Chen', 'Marcus Rodriguez', 'Dr. James Liu'], 'Nature Climate Change', '2024-01-15', 127, 'AI & Climate', 'This comprehensive review examines the application of machine learning techniques in climate data analysis, covering recent advances in satellite data processing, predictive modeling, and anomaly detection in environmental datasets.', '10.1038/s41558-024-01234-5'),
('Satellite-Based Monitoring of Urban Heat Islands: Global Trends 2020-2024', ARRAY['Dr. Sarah Chen', 'Aisha Patel'], 'Remote Sensing of Environment', '2023-11-20', 89, 'Urban Climate', 'Analysis of satellite thermal imagery reveals increasing urban heat island effects across 50 major cities worldwide, with implications for energy consumption and public health.', '10.1016/j.rse.2023.113456');

-- Insert sample datasets
INSERT INTO research_datasets (name, description, size, format, last_updated, downloads, license) VALUES
('Global Forest Change Dataset 2024', 'Annual forest loss and gain data derived from satellite imagery', '2.3 GB', 'GeoTIFF, CSV', '2024-01-01', 1247, 'CC BY 4.0'),
('Urban Air Quality Index Database', 'Real-time air quality measurements from 200+ cities worldwide', '890 MB', 'JSON, CSV', '2024-01-15', 2156, 'CC BY 4.0');

-- Insert sample projects
INSERT INTO research_projects (title, description, progress, team, expected_completion, funding) VALUES
('AI-Powered Deforestation Detection', 'Real-time forest monitoring using satellite imagery and machine learning', 75, 'Dr. Sarah Chen, Marcus Rodriguez', 'Q2 2024', '$450K'),
('Community Carbon Tracking Platform', 'Scalable platform for neighborhood-level carbon footprint analysis', 60, 'Aisha Patel, Dr. Elena Vasquez', 'Q3 2024', '$320K');
