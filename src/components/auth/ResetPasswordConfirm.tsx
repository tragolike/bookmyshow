
import { useEffect } from 'react';
import { TokenProcessingState, TokenErrorState } from './password-reset/TokenValidationState';
import { PasswordReset } from './password-reset/PasswordReset';
import { usePasswordReset } from '@/hooks/usePasswordReset';

const ResetPasswordConfirm = () => {
  const { 
    isSuccess, 
    setIsSuccess, 
    hasTokenError, 
    tokenProcessing, 
    initializeReset 
  } = usePasswordReset();

  useEffect(() => {
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
