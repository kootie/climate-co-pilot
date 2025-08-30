// Content Management Types

export interface AboutContent {
  id: string
  section: 'hero' | 'mission' | 'values' | 'team' | 'stats'
  title: string
  content: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  read_time: string
  publish_date: string
  featured: boolean
  published: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  journal: string
  publish_date: string
  citations: number
  category: string
  abstract: string
  download_url?: string
  doi: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface ResearchDataset {
  id: string
  name: string
  description: string
  size: string
  format: string
  last_updated: string
  downloads: number
  license: string
  download_url?: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface ResearchProject {
  id: string
  title: string
  description: string
  progress: number
  team: string
  expected_completion: string
  funding: string
  published: boolean
  created_at: string
  updated_at: string
}

// Form types for admin interface
export interface BlogPostForm {
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  read_time: string
  publish_date: string
  featured: boolean
  published: boolean
  image_url?: string
}

export interface ResearchPaperForm {
  title: string
  authors: string[]
  journal: string
  publish_date: string
  citations: number
  category: string
  abstract: string
  download_url?: string
  doi: string
  published: boolean
}

export interface AboutContentForm {
  section: 'hero' | 'mission' | 'values' | 'team' | 'stats'
  title: string
  content: string
  order_index: number
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}
