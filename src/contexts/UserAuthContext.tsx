import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  location?: string
  carbon_goal: number
  onboarded: boolean
  created_at: string
  updated_at: string
}

interface UserAuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  loading: boolean
  isAuthenticated: boolean
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we have real Supabase credentials
    const hasRealCredentials = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!hasRealCredentials) {
      console.warn('No Supabase credentials found - running in demo mode')
      setLoading(false)
      // Set demo user for testing when no credentials
      setUser({
        id: 'demo-user-id',
        email: 'fabian@inuaake.com',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated'
      } as User)
      setProfile({
        id: 'demo-user-id',
        email: 'fabian@inuaake.com',
        full_name: 'Fabian Demo',
        carbon_goal: 2000,
        onboarded: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    }).catch((error) => {
      console.warn('Supabase auth error:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await createUserProfile(userId)
      } else if (error) {
        throw error
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: user?.email || '',
          carbon_goal: 2000.00,
          onboarded: false
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const hasRealCredentials = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!hasRealCredentials) {
      return { error: new Error('Supabase not configured. Please set up your Supabase credentials.') }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (!error && data.user) {
        // Create profile after successful signup
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          carbon_goal: 2000.00,
          onboarded: false
        })
      }
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const hasRealCredentials = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!hasRealCredentials) {
      // Demo mode - allow login with demo credentials
      if (email === 'fabian@inuaake.com' && password === 'Letmein@999') {
        setUser({
          id: 'demo-user-id',
          email: 'fabian@inuaake.com',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated'
        } as User)
        setProfile({
          id: 'demo-user-id',
          email: 'fabian@inuaake.com',
          full_name: 'Fabian Demo',
          carbon_goal: 2000,
          onboarded: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        return { error: null }
      } else {
        return { error: new Error('Demo mode: Use fabian@inuaake.com / Letmein@999') }
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    const hasRealCredentials = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (hasRealCredentials) {
      await supabase.auth.signOut()
    } else {
      // Demo mode - just clear the state
      setUser(null)
      setProfile(null)
      setSession(null)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loading,
    isAuthenticated: !!user,
  }

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}
