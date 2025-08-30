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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  loading: boolean
  isAuthenticated: boolean
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Set up demo user immediately for testing
    const demoUser = {
      id: crypto.randomUUID(), // Use proper UUID generation
      email: 'fabian@inuaake.com',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    } as User

    const demoProfile = {
      id: demoUser.id, // Use the same UUID
      email: 'fabian@inuaake.com',
      full_name: 'Fabian Demo',
      carbon_goal: 2000,
      onboarded: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setUser(demoUser)
    setProfile(demoProfile)
    setLoading(false)

    // Try to get real session in background
    const checkRealAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!error && session?.user) {
          setSession(session)
          setUser(session.user)
          // Try to load real profile
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.log('Real auth check failed, staying in demo mode:', error)
      }
    }

    checkRealAuth()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Error loading user profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.warn('Error loading user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
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
      return { error: error as Error }
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
