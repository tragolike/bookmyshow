
export const extractTokenFromURL = () => {
  // First try to get from hash (fragment)
  const hash = window.location.hash.substring(1);
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    console.log('Hash params:', { accessToken: !!accessToken, type });
    
    if (accessToken && type === 'recovery') {
      return accessToken;
    }
  }
  
  // If not in hash, try to get from query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const accessToken = queryParams.get('access_token') || queryParams.get('token');
  const type = queryParams.get('type');
  
  console.log('Query params:', { accessToken: !!accessToken, type });
  
  if (accessToken && (type === 'recovery' || !type)) {
    return accessToken;
  }
  
  return null;
};

// Add additional utility functions for password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
};

export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
