
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isUserAdmin } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch the user profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile data:', data);
      setProfile(data);
    } catch (error) {
      console.error('Exception fetching profile:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    setIsLoading(true);
    
    // Set up auth state listener first to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        
        if (currentUser?.email) {
          const adminStatus = isUserAdmin(currentUser.email);
          console.log('User admin status:', adminStatus);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
        
        if (currentUser) {
          // Use setTimeout to avoid deadlocks in Supabase auth callbacks
          setTimeout(() => {
            fetchProfile(currentUser.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Initial session fetch
    const initAuth = async () => {
      try {
        console.log('Initializing auth state');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession ? 'exists' : 'null');
        
        setSession(initialSession);
        const initialUser = initialSession?.user ?? null;
        setUser(initialUser);
        
        if (initialUser?.email) {
          const adminStatus = isUserAdmin(initialUser.email);
          console.log('Initial user admin status:', adminStatus);
          setIsAdmin(adminStatus);
        }

        if (initialUser) {
          await fetchProfile(initialUser.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    fetchProfile
  };
}
