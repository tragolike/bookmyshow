
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAdmin(isUserAdmin(currentSession?.user?.email));
        setIsLoading(false);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      }
    );

    // Initial session fetch
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsAdmin(isUserAdmin(initialSession?.user?.email));

      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
      }
      
      setIsLoading(false);
    };

    initAuth();

    return () => subscription.unsubscribe();
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
