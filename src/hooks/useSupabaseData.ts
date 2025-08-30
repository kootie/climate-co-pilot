import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseData<T>(
  table: string,
  select: string = '*',
  orderBy?: { column: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if we have real Supabase credentials
        const hasRealCredentials = 
          import.meta.env.VITE_SUPABASE_URL && 
          import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

        if (!hasRealCredentials) {
          // Return empty data if no real Supabase setup
          setData([])
          setLoading(false)
          return
        }

        let query = supabase.from(table).select(select)
        
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
        }

        const { data: result, error } = await query

        if (error) {
          throw error
        }

        setData(result || [])
      } catch (err: any) {
        console.warn(`Supabase fetch error for ${table}:`, err.message)
        setError(err.message)
        setData([]) // Fallback to empty data
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table, select, orderBy?.column, orderBy?.ascending])

  return { data, loading, error }
}
