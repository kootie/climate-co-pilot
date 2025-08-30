# EcoGuide AI - Supabase Content Management Setup

## Overview
This setup guide will help you configure Supabase as the backend for your EcoGuide AI content management system, allowing admin users to manage content for About, Blog, and Research pages.

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new account
2. Click "New Project" and choose your organization
3. Fill in your project details:
   - **Name**: `ecoguide-ai`
   - **Database Password**: Choose a secure password
   - **Region**: Select closest to your users
4. Wait for the project to be created (2-3 minutes)

### 2. Configure Environment Variables
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** 
   - **anon public key**
   - **service_role key** (keep this secret!)

3. Create a `.env.local` file in your project root:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL Editor and click **Run**
4. This will create all necessary tables, triggers, and sample data

### 4. Configure Authentication
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL: `http://localhost:8080`
3. In **Auth Providers**, ensure **Email** is enabled
4. Go to **Authentication** → **Users**
5. Click **Add User** and create an admin user:
   - **Email**: `admin@ecoguide.ai`
   - **Password**: `admin123`
   - **Email Confirm**: Yes
   - **Auto Confirm User**: Yes

### 5. Set Up Row Level Security (Optional but Recommended)
The schema already includes basic RLS policies, but you can customize them:

1. **Public Read Access**: Anyone can read published content
2. **Admin Write Access**: Only authenticated users can modify content
3. **Draft Content**: Only admins can see unpublished content

## 📚 Database Structure

### Tables Created:
- **`about_content`** - Hero, mission, values, team, stats content
- **`blog_posts`** - Blog articles with categories, authors, etc.
- **`research_papers`** - Academic papers with citations, DOI, etc.
- **`research_datasets`** - Open datasets with download info
- **`research_projects`** - Ongoing research projects with progress

### Key Features:
- **UUID Primary Keys** for all tables
- **Automatic Timestamps** (created_at, updated_at)
- **Row Level Security** for public read, admin write
- **Indexed Fields** for performance
- **JSON Arrays** for paper authors
- **Boolean Flags** for published/featured content

## 🔐 Admin Access

### Development Access:
- **Admin Login**: `http://localhost:8080/admin/login`
- **Admin Dashboard**: `http://localhost:8080/admin`
- **Default Credentials**: `admin@ecoguide.ai` / `admin123`

### Admin Features:
- **About Page Management**: Edit hero, mission, values, team, stats
- **Blog Management**: Create, edit, delete articles
- **Research Management**: Manage papers, datasets, projects
- **Draft/Publish Control**: Toggle content visibility
- **Real-time Updates**: Changes reflect immediately on frontend

## 🌐 Content Management

### About Page Sections:
- **Hero**: Main title and subtitle
- **Mission**: Mission statement and description
- **Values**: Core values and principles
- **Team**: Team member information
- **Stats**: Key statistics and metrics

### Blog Post Fields:
- Title, excerpt, full content
- Category, author, read time
- Publish date, featured flag
- Published status, image URL

### Research Content:
- **Papers**: Title, authors, journal, abstract, DOI
- **Datasets**: Name, description, format, license
- **Projects**: Title, description, progress, team

## 🛠️ Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access Admin Interface
1. Go to `http://localhost:8080/admin/login`
2. Login with admin credentials
3. Manage content through the dashboard

### 3. View Changes
- Changes made in admin dashboard appear immediately
- Public pages fetch data from Supabase
- No need to restart the development server

## 🔧 Customization

### Adding New Content Types:
1. **Create Database Table** in Supabase SQL Editor
2. **Add TypeScript Interface** in `src/types/content.ts`
3. **Create Manager Component** in `src/components/admin/`
4. **Add to Admin Dashboard** in `src/pages/AdminDashboard.tsx`

### Modifying Admin Access:
1. Update `checkAdminStatus()` in `src/contexts/AuthContext.tsx`
2. Add user metadata or create admin roles table
3. Update RLS policies in Supabase

### Adding File Uploads:
1. Enable **Storage** in Supabase dashboard
2. Create storage buckets for images/files
3. Add upload components to admin forms
4. Update database schemas to include file URLs

## 🚦 Production Deployment

### Environment Variables:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Security Checklist:
- [ ] Update RLS policies for production
- [ ] Remove default admin credentials
- [ ] Set up proper admin user management
- [ ] Configure CORS settings
- [ ] Enable email confirmations
- [ ] Set up backup procedures

## 📈 Next Steps

### Recommended Enhancements:
1. **Rich Text Editor** for blog content (TinyMCE, Quill)
2. **Image Upload** for blog posts and team photos
3. **SEO Management** with meta tags and descriptions
4. **Content Versioning** to track changes
5. **Multi-language Support** for international users
6. **Analytics Integration** to track content performance

### Advanced Features:
- Content scheduling and automation
- User roles and permissions
- Content approval workflows
- API endpoints for headless CMS usage
- Real-time collaboration tools

## 🆘 Troubleshooting

### Common Issues:

**1. Environment Variables Not Working**
- Ensure `.env.local` is in project root
- Restart development server after adding variables
- Check variable names start with `VITE_`

**2. Database Connection Errors**
- Verify Supabase URL and keys are correct
- Check project is not paused (free tier limitation)
- Ensure RLS policies allow access

**3. Authentication Issues**
- Confirm user exists in Supabase Auth
- Check email/password are correct
- Verify Site URL in Auth settings

**4. Content Not Displaying**
- Check published status in admin dashboard
- Verify RLS policies allow public read
- Look for JavaScript console errors

### Getting Help:
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review React Query integration for data fetching
- Check browser console for detailed error messages

## 📝 Sample Data

The setup includes sample content for all sections to help you get started:
- About page with mission and stats
- Sample blog posts in different categories
- Research papers with realistic academic data
- Datasets and projects for demonstration

You can modify or delete this sample data through the admin interface once you're ready to add your own content.

---

**Ready to start?** Follow the setup steps above and you'll have a fully functional content management system for your EcoGuide AI application!
