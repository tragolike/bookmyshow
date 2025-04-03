
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const NotFound = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleReturnHome = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className={`text-center ${isMobile ? 'w-full' : 'max-w-md'}`}>
        <h1 className="text-8xl font-bold text-book-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6">Page not found</h2>
        <p className="text-gray-400 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Button 
          onClick={handleReturnHome}
          className="flex items-center justify-center gap-2 px-8 py-6 rounded-full text-lg bg-book-primary hover:bg-book-primary/90"
          size="lg"
        >
          <Home className="h-5 w-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
