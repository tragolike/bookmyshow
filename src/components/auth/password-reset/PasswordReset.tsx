
import React from 'react';
import PasswordResetForm from './PasswordResetForm';
import SuccessState from './SuccessState';

type PasswordResetProps = {
  isSuccess: boolean;
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PasswordReset: React.FC<PasswordResetProps> = ({ isSuccess, setIsSuccess }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Set new password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose a new password for your account
        </p>
      </div>
      
      {isSuccess ? (
        <SuccessState isSuccess={isSuccess} />
      ) : (
        <PasswordResetForm isSuccess={isSuccess} setIsSuccess={setIsSuccess} />
      )}
    </div>
  );
};

export default PasswordReset;
