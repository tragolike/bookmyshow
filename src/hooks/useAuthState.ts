
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
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAdmin(isUserAdmin(currentSession?.user?.email));
        
        if (currentSession?.user) {
          // Use setTimeout to avoid deadlocks in Supabase auth callbacks
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
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
        setUser(initialSession?.user ?? null);
        setIsAdmin(isUserAdmin(initialSession?.user?.email));

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
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
