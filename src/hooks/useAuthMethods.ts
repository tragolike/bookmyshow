import { useNavigate } from 'react-router-dom';
import { supabase, db, isUserAdmin } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuthMethods(fetchProfile: (userId: string) => Promise<void>) {
  const navigate = useNavigate();

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email });
      
      // Normalize email to lowercase to prevent case sensitivity issues
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log('Normalized email:', normalizedEmail);
      console.log('Password length:', password.length);
      
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: normalizedEmail, 
        password 
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message || 'Invalid login credentials');
        return false;
      }

      console.log('Sign in successful, user data:', data.user);
      
      // Check if the user is an admin based on their email
      const isAdminUser = isUserAdmin(normalizedEmail);
      
      console.log('Is admin user?', isAdminUser, 'Email:', normalizedEmail);
      
      toast.success('Signed in successfully');
      
      // Redirect admins to admin dashboard, regular users to home
      if (isAdminUser) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'An error occurred during sign in');
      return false;
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
        return false;
      }

      toast.success('Account created successfully. Please verify your email.');
      navigate('/login');
      return true;
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'An error occurred during sign up');
      return false;
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
      navigate('/');
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
      // Use the full absolute URL (including http/https)
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
  const updateProfile = async (data: { first_name?: string; last_name?: string; phone_number?: string; avatar_url?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to update your profile');
        return false;
      }

      const { error } = await db.profiles()
        .update(data)
        .eq('id', user.id);

      if (error) {
        toast.error(error.message);
        return false;
      }

      await fetchProfile(user.id);
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
      // The redirect to Google happens automatically
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
    signInWithGoogle
  };
}
