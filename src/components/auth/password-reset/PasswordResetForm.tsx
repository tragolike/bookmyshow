
import { useState, useEffect } from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePasswordReset } from '@/hooks/usePasswordReset';

type PasswordResetFormProps = {
  isSuccess: boolean;
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>;
};

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ isSuccess, setIsSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { updatePassword, isUpdating } = usePasswordReset();
  
  const validatePasswords = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    // Use the updatePassword function from the hook
    await updatePassword(password);
  };
  
  if (isSuccess) return null;
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 shadow rounded-lg">
      <div className="space-y-4">
        <div>
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative mt-1">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <div>
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative mt-1">
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="pr-10"
            />
          </div>
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium py-1">
            {error}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PasswordResetForm;
