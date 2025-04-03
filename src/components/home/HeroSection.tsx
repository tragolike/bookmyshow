import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, getHeroSlides } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
}

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const navigate = useNavigate();

  // Fetch slides from database
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // Fetch slides with the improved getHeroSlides function
        const { data, error } = await getHeroSlides(true, true); // skipCache=true, activeOnly=true
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log('Loaded hero slides:', data);
          setSlides(data);
        } else {
          // No active slides found, use defaults
          console.log('No active slides found, using defaults');
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        // Fallback to default slides on error
        setSlides(defaultSlides);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, slides.length, currentSlide]);

  // Handle navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    // Pause autoplay briefly when manually navigating
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  
  const handleBookNowClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    // Check if the link is a relative path or external URL
    if (link.startsWith('http')) {
      // External URL - let the default behavior handle it
      return;
    }
    
    e.preventDefault();
    
    // Handle navigation for internal links
    try {
      navigate(link);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Unable to navigate to the requested page');
      navigate('/');
    }
  };

  // Default slides for fallback
  const defaultSlides = [
    {
      id: '1',
      title: 'Kolkata Knight Riders vs Royal Challengers Bengaluru',
      subtitle: 'The Champions are back! The IPL 2025 season opener',
      image_url: '/lovable-uploads/933af9b9-e587-4f31-9e71-7474b68aa224.png',
      link: '/events/kkr-vs-rcb',
      sort_order: 1,
      is_active: true
    },
    {
      id: '2',
      title: 'Latest Movies & Exclusive Premieres',
      subtitle: 'Book tickets for the hottest new releases',
      image_url: '/lovable-uploads/1934f56d-2445-4eff-bdcb-1dd1e3d45e75.png',
      link: '/movies',
      sort_order: 2,
      is_active: true
    },
    {
      id: '3',
      title: 'Live Concert Experiences',
      subtitle: 'Don\'t miss out on your favorite artists',
      image_url: '/lovable-uploads/0717f399-6c25-40d2-ab0c-e8dce44e2e91.png',
      link: '/live-events',
      sort_order: 3,
      is_active: true
    }
  ];

  // Use fetched slides or fallback to defaults if none are found
  const displaySlides = slides.length > 0 ? slides : defaultSlides;

  if (isLoading) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (displaySlides.length === 0) {
    return null; // Don't render anything if no slides
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Slides */}
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              console.error(`Failed to load image: ${slide.image_url}`);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 md:px-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-xl text-white mb-8 max-w-3xl">
                {slide.subtitle}
              </p>
            )}
            <Link 
              to={slide.link}
              onClick={(e) => handleBookNowClick(e, slide.link)}
              className="inline-flex items-center justify-center gap-2 bg-[#ff2366] hover:bg-[#e01f59] text-white px-6 py-3 rounded-full transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots navigation */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
            {displaySlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  index === currentSlide
                    ? "bg-white scale-100"
                    : "bg-white/50 scale-75 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSection;
