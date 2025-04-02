
export const extractTokenFromURL = () => {
  try {
    console.log('Extracting token from URL...');
    console.log('Full URL:', window.location.href);
    
    // First try to get from hash (fragment)
    const hash = window.location.hash.substring(1);
    console.log('URL hash:', hash ? 'Found' : 'Not found');
    
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      console.log('Hash params:', { 
        accessToken: accessToken ? 'Found' : 'Not found', 
        type: type || 'Not found'
      });
      
      if (accessToken && type === 'recovery') {
        console.log('Found access token in hash');
        return accessToken;
      }
    }
    
    // If not in hash, try to get from query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get('access_token') || queryParams.get('token');
    const type = queryParams.get('type');
    
    console.log('Query params:', { 
      accessToken: accessToken ? 'Found' : 'Not found', 
      type: type || 'Not found'
    });
    
    if (accessToken && (type === 'recovery' || !type)) {
      console.log('Found access token in query parameters');
      return accessToken;
    }
    
    // Check full URL for token patterns
    const fullUrl = window.location.href;
    console.log('Checking full URL for token pattern');
    
    // Look for token=... or access_token=... pattern in the URL
    const tokenMatch = fullUrl.match(/[?&#](token|access_token)=([^&]+)/);
    if (tokenMatch && tokenMatch[2]) {
      console.log('Found token using regex pattern:', tokenMatch[2].substring(0, 10) + '...');
      return decodeURIComponent(tokenMatch[2]);
    }
    
    // Check for token in the pathname (for Supabase redirects that put the token in the path)
    const pathParts = window.location.pathname.split('/');
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] && pathParts[i].length > 30) {
        console.log('Found potential token in path:', pathParts[i].substring(0, 10) + '...');
        return pathParts[i];
      }
    }
    
    console.log('No token found in URL');
    return null;
  } catch (error) {
    console.error('Error extracting token from URL:', error);
    return null;
  }
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
