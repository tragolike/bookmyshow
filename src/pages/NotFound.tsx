
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import MainNavigation from '@/components/MainNavigation';

const NotFound = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleReturnHome = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`text-center ${isMobile ? 'w-full' : 'max-w-md'}`}>
          <h1 className="text-9xl font-bold text-[#ff3366] mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-6">Page not found</h2>
          <p className="text-gray-400 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <Button 
            onClick={handleReturnHome}
            className="flex items-center justify-center gap-2 px-8 py-6 rounded-full text-lg bg-[#ff3366] hover:bg-[#ff3366]/90 w-full md:w-auto"
            size="lg"
          >
            <Home className="h-5 w-5" />
            Return to Home
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation at bottom */}
      {isMobile && (
        <div className="mt-auto">
          <MainNavigation />
        </div>
      )}
    </div>
  );
};

export default NotFound;
