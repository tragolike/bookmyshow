
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type SuccessStateProps = {
  isSuccess: boolean;
};

const SuccessState: React.FC<SuccessStateProps> = ({ isSuccess }) => {
  const navigate = useNavigate();
  
  if (!isSuccess) return null;
  
  return (
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
  );
};

export default SuccessState;
