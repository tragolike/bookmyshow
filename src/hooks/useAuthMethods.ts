import { useState } from 'react';
import { supabase, isUserAdmin } from '@/integrations/supabase/client';
import { SignUpCredentials, UpdateProfileData } from '@/types/auth';
import { toast } from 'sonner';

export function useAuthMethods() {
  const [isLoading, setIsLoading] = useState(false);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Signed in successfully');
      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (credentials: SignUpCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { email, password, first_name, last_name } = credentials;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Account created successfully! Please check your email for confirmation.');
      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Failed to create account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Signed out successfully');
      return true;
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'An error occurred during sign out');
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const origin = window.location.origin;
      const resetUrl = `${origin}/reset-password-confirm`;
      
      console.log('Password reset redirect URL:', resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message || 'Failed to send reset email');
        return false;
      }
      
      toast.success('Password reset link sent to your email');
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'An error occurred during password reset');
      return false;
    }
  };
  
  // Update password (when already logged in)
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'Failed to update password');
        return false;
      }
      
      toast.success('Password updated successfully');
      return true;
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'An error occurred while updating password');
      return false;
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to update your profile');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'An error occurred while updating profile');
      return false;
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      console.log('Attempting to sign in with Google...');
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        return false;
      }
      
      console.log('Google authentication initiated:', data);
      return true;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'An error occurred during Google sign in');
      return false;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    signInWithGoogle,
    isLoading
  };
}
