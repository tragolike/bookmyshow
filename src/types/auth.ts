
import type { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<boolean>;
  updateProfile: (data: { first_name?: string; last_name?: string; phone_number?: string; avatar_url?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};
