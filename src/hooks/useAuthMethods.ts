
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
      console.log('Attempting to sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message || 'Failed to sign in');
        return false;
      }
      
      console.log('Sign in successful:', data);
      
      // Check if user is admin
      const isAdmin = isUserAdmin(email);
      
      if (isAdmin) {
        toast.success('Welcome, admin! Redirecting to dashboard...');
      } else {
        toast.success('Signed in successfully');
      }
      
      return true;
    } catch (error: any) {
      console.error('Exception during sign in:', error);
      toast.error(error.message || 'An unexpected error occurred');
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
      console.log('Attempting to sign up with:', email);
      
      const { data, error } = await supabase.auth.signUp({
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
        console.error('Sign up error:', error);
        toast.error(error.message || 'Failed to create account');
        return false;
      }
      
      console.log('Sign up successful:', data);
      toast.success('Account created successfully! Please check your email for confirmation.');
      return true;
    } catch (error: any) {
      console.error('Exception during sign up:', error);
      toast.error(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Attempting to sign out');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message || 'Failed to sign out');
        return false;
      }

      console.log('Sign out successful');
      toast.success('Signed out successfully');
      return true;
    } catch (error: any) {
      console.error('Exception during sign out:', error);
      toast.error(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const origin = window.location.origin;
      const resetUrl = `${origin}/reset-password-confirm`;
      
      console.log('Password reset requested for:', email);
      console.log('Password reset redirect URL:', resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message || 'Failed to send reset email');
        return false;
      }
      
      console.log('Password reset email sent');
      toast.success('Password reset link sent to your email');
      return true;
    } catch (error: any) {
      console.error('Exception during password reset:', error);
      toast.error(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update password (when already logged in)
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to update password');
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'Failed to update password');
        return false;
      }
      
      console.log('Password updated successfully');
      toast.success('Password updated successfully');
      return true;
    } catch (error: any) {
      console.error('Exception during password update:', error);
      toast.error(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      console.log('Fetching current user');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        toast.error('You must be logged in to update your profile');
        return false;
      }

      console.log('Updating profile for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        toast.error(error.message || 'Failed to update profile');
        return false;
      }

      console.log('Profile updated successfully');
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Exception during profile update:', error);
      toast.error(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with Google');
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
      console.error('Exception during Google sign in:', error);
      toast.error(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
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
