
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Info, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('ritikpaswal79984@gmail.com');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    if (user && isAdmin) {
      console.log('User already logged in as admin, redirecting to admin dashboard');
      navigate('/admin', { replace: true });
    } else if (user && !isAdmin) {
      console.log('User logged in but not admin, redirecting to home');
      navigate('/', { replace: true });
      toast.error('You do not have admin privileges');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      console.log('Admin login attempt:', { email });
      const success = await signIn(email, password);
      
      if (success) {
        // Redirect will happen in the useEffect when user state updates
        console.log('Login successful, waiting for admin check and redirect...');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error('Failed to log in. Please check your credentials.');
    }
  };

  // If already logged in, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2">Redirecting...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access the admin panel
            </p>
          </div>
          
          <div className="mt-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm text-blue-700">
                Use <strong>ritikpaswal79984@gmail.com</strong> with your password to access the admin panel.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="ritikpaswal79984@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/password-reset" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </Link>
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
                    Sign in to Admin Panel
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <a href="/" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Return to main website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ShowTix Admin Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
