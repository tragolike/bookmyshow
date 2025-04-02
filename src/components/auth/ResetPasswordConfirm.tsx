
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, EyeOff, Eye, Check, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasTokenError, setHasTokenError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash parameter in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    console.log('Hash params:', { accessToken: !!accessToken, type });
    
    if (!accessToken || type !== 'recovery') {
      console.log('Invalid reset link - token missing or incorrect type');
      setHasTokenError(true);
      toast.error('Invalid or expired reset link');
      return;
    }
    
    console.log('Access token found in URL');
    // Set the access token for the session
    const setSession = async () => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });
        
        if (error) {
          console.error('Error setting session:', error);
          setHasTokenError(true);
          toast.error('Invalid or expired reset link');
        }
      } catch (err) {
        console.error('Exception setting session:', err);
        setHasTokenError(true);
        toast.error('Something went wrong processing your reset link');
      }
    };
    
    setSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message || 'Failed to reset password');
        return;
      }
      
      setIsSuccess(true);
      toast.success('Password reset successfully');
      
      // Clear the hash from the URL
      window.history.replaceState(null, '', window.location.pathname);
      
      // Wait 3 seconds before redirecting to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasTokenError) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Invalid Reset Link</h2>
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
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Set new password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose a new password for your account
            </p>
          </div>
          
          {isSuccess ? (
            <div className="bg-white p-8 shadow rounded-lg mt-8">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Password reset successful</h3>
              </div>
              
              <Alert className="bg-green-50 border-green-200 mb-6">
                <AlertDescription className="text-sm text-green-700">
                  Your password has been reset successfully. You will be redirected to the login page.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Go to login
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        placeholder="Enter your new password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        placeholder="Confirm your new password"
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
                      Reset Password
                    </Button>
                  </div>
                </form>
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

export default ResetPasswordConfirm;
