
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-9xl font-bold text-[#ff2366] mb-4 animate-bounce">404</div>
          <h1 className="text-3xl font-bold mb-4">Page not found</h1>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-[#ff2366] hover:bg-[#e01f59] text-white px-6 py-3 rounded-full transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
