
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuthMethods(fetchProfile: (userId: string) => Promise<void>) {
  const navigate = useNavigate();

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });

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
      console.error('Sign in error:', error);
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
      console.error('Sign up error:', error);
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
      console.error('Sign out error:', error);
      toast.error(error.message || 'An error occurred during sign out');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      // Use explicit URL with origin for complete path
      const origin = window.location.origin;
      const resetUrl = `${origin}/reset-password-confirm`;
      console.log('Reset password redirect URL:', resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'An error occurred during password reset');
    }
  };

  // Update profile
  const updateProfile = async (data: { first_name?: string; last_name?: string; phone_number?: string; avatar_url?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
      console.error('Profile update error:', error);
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
