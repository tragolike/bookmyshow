
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the full absolute URL for redirect
      const origin = window.location.origin;
      const redirectTo = `${origin}/reset-password-confirm`;
      
      console.log('Requesting password reset with redirect to:', redirectTo);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      
      if (error) {
        console.error('Password reset request error:', error);
        toast.error(error.message || 'Failed to send reset email');
        return;
      }
      
      console.log('Password reset email sent successfully');
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast.error(error.message || 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          
          {isSuccess ? (
            <div className="bg-white p-8 shadow rounded-lg mt-8">
              <Alert className="bg-green-50 border-green-200 mb-6">
                <AlertDescription className="text-sm text-green-700">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your email.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-gray-600 mb-6">
                If you don't see the email in your inbox, please check your spam folder. The link will expire in 24 hours.
              </p>
              
              <div className="flex flex-col space-y-4">
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full flex justify-center items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to login
                </Button>
                
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-500 text-center"
                >
                  Try with a different email
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="primary"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send reset link'
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => navigate('/login')}
                    variant="link"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Back to login
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ShowTix. All rights reserved.
      </footer>
    </div>
  );
};

export default PasswordReset;
