
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractTokenFromURL } from '@/components/auth/password-reset/utils';

export function usePasswordReset() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasTokenError, setHasTokenError] = useState(false);
  const [tokenProcessing, setTokenProcessing] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize password reset by extracting and validating token from URL
  const initializeReset = async () => {
    try {
      setTokenProcessing(true);
      console.log('Initializing password reset page');
      console.log('Current URL:', window.location.href);
      
      // Extract token from URL
      const accessToken = extractTokenFromURL();
      
      if (!accessToken) {
        console.log('No valid token found in URL');
        setHasTokenError(true);
        setTokenProcessing(false);
        return false;
      }
      
      console.log('Setting Supabase session with token:', accessToken.substring(0, 10) + '...');
      
      // Set the session with the access token
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });
      
      if (error) {
        console.error('Session error:', error);
        setHasTokenError(true);
        toast.error('Invalid or expired password reset link. Please request a new one.');
        return false;
      } else {
        console.log('Session set successfully');
        setTokenProcessing(false);
        return true;
      }
    } catch (err) {
      console.error('Error processing token:', err);
      setHasTokenError(true);
      toast.error('Error processing your reset link. Please try again or request a new link.');
      return false;
    } finally {
      setTokenProcessing(false);
    }
  };

  // Update password with new password
  const updatePassword = async (password: string) => {
    try {
      setIsUpdating(true);
      console.log('Attempting to update password');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'Failed to update password. Please try again.');
        return false;
      }
      
      console.log('Password updated successfully:', data);
      setIsSuccess(true);
      toast.success('Password updated successfully! You can now log in with your new password.');
      return true;
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'An error occurred while updating password. Please try again.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isSuccess,
    setIsSuccess,
    hasTokenError,
    tokenProcessing,
    isUpdating,
    initializeReset,
    updatePassword
  };
}
