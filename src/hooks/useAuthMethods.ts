
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export function useAuthMethods(fetchProfile: (userId: string) => Promise<void>) {
  const navigate = useNavigate();

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Check if the user is an admin after successful login
      const isAdminUser = email.includes('admin@');
      
      toast.success('Signed in successfully');
      
      // Redirect admins to admin dashboard, regular users to home
      if (isAdminUser) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Account created successfully. Please verify your email.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign out');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during password reset');
    }
  };

  // Update profile
  const updateProfile = async (data: { first_name?: string; last_name?: string; phone_number?: string; avatar_url?: string }) => {
    try {
      const currentUser = supabase.auth.getUser().then(({ data }) => data.user);
      const user = await currentUser;
      
      if (!user) {
        toast.error('You must be logged in to update your profile');
        return;
      }

      const { error } = await db.profiles()
        .update(data)
        .eq('id', user.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      await fetchProfile(user.id);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating profile');
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };
}
