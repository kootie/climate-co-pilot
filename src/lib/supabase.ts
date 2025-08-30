import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// For development, we'll use placeholder values if env vars are not set
// You'll need to set up proper Supabase credentials as per SUPABASE_SETUP.md

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      about_content: {
        Row: {
          id: string
          section: string
          title: string
          content: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: string
          title: string
          content: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          title?: string
          content?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
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
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          content: string
          category: string
          author: string
          read_time: string
          publish_date: string
          featured?: boolean
          published?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string
          content?: string
          category?: string
          author?: string
          read_time?: string
          publish_date?: string
          featured?: boolean
          published?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      research_papers: {
        Row: {
          id: string
          title: string
          authors: string[]
          journal: string
          publish_date: string
          citations: number
          category: string
          abstract: string
          download_url: string | null
          doi: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          authors: string[]
          journal: string
          publish_date: string
          citations?: number
          category: string
          abstract: string
          download_url?: string | null
          doi: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          authors?: string[]
          journal?: string
          publish_date?: string
          citations?: number
          category?: string
          abstract?: string
          download_url?: string | null
          doi?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      research_datasets: {
        Row: {
          id: string
          name: string
          description: string
          size: string
          format: string
          last_updated: string
          downloads: number
          license: string
          download_url: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          size: string
          format: string
          last_updated: string
          downloads?: number
          license: string
          download_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          size?: string
          format?: string
          last_updated?: string
          downloads?: number
          license?: string
          download_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      research_projects: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          description: string
          progress: number
          team: string
          expected_completion: string
          funding: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          progress?: number
          team?: string
          expected_completion?: string
          funding?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
