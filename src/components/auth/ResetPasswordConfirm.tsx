
import { useState, useEffect } from 'react';
import { TokenProcessingState, TokenErrorState } from './password-reset/TokenValidationState';
import { PasswordReset } from './password-reset/PasswordReset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractTokenFromURL } from './password-reset/utils';

const ResetPasswordConfirm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasTokenError, setHasTokenError] = useState(false);
  const [tokenProcessing, setTokenProcessing] = useState(true);

  useEffect(() => {
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
          return;
        }
        
        console.log('Setting Supabase session with token');
        // Set the session with the access token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });
        
        if (error) {
          console.error('Session error:', error);
          setHasTokenError(true);
          toast.error('Invalid or expired password reset link');
        } else {
          console.log('Session set successfully');
        }
      } catch (err) {
        console.error('Error processing token:', err);
        setHasTokenError(true);
        toast.error('Error processing your reset link');
      } finally {
        setTokenProcessing(false);
      }
    };
    
    initializeReset();
  }, []);

  // Show loading state while processing token
  if (tokenProcessing) {
    return <TokenProcessingState isProcessing={tokenProcessing} />;
  }

  // Show error state if token is invalid
  if (hasTokenError) {
    return <TokenErrorState hasError={hasTokenError} />;
  }

  // Show the password reset form
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <PasswordReset isSuccess={isSuccess} setIsSuccess={setIsSuccess} />
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ShowTix. All rights reserved.
      </footer>
    </div>
  );
};

export default ResetPasswordConfirm;
