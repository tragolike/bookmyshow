
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type TokenProcessingProps = {
  isProcessing: boolean;
};

export const TokenProcessingState: React.FC<TokenProcessingProps> = ({ isProcessing }) => {
  if (!isProcessing) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">Validating your reset link</h2>
          <p className="text-gray-500">Please wait while we verify your password reset link...</p>
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-primary"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

type TokenErrorProps = {
  hasError: boolean;
};

export const TokenErrorState: React.FC<TokenErrorProps> = ({ hasError }) => {
  const navigate = useNavigate();
  
  if (!hasError) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600">
              The password reset link is invalid or has expired.
            </p>
          </div>
          
          <div className="bg-white p-8 shadow rounded-lg mt-8">
            <Alert className="bg-red-50 border-red-200 mb-6">
              <AlertDescription className="text-sm text-red-700">
                The password reset link you clicked is invalid or has expired. Please request a new password reset link.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/password-reset')}
              >
                Request New Reset Link
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ShowTix. All rights reserved.
      </footer>
    </div>
  );
};
