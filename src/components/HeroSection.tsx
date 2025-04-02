
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0.6); // Default to 60%
  
  // Fetch hero slides from database
  const { data: heroSlidesData, isLoading, error } = useQuery({
    queryKey: ['heroSlides'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
          
        if (error) throw error;
        return data as HeroSlide[];
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        // Fallback to default slides
        return [
          {
            id: '1',
            title: "Kolkata Knight Riders vs Royal Challengers Bengaluru",
            subtitle: "The Champions are back! The IPL 2025 season opener",
            image_url: "/lovable-uploads/933af9b9-e587-4f31-9e71-7474b68aa224.png",
            link: "/events/kkr-vs-rcb",
            sort_order: 1,
            is_active: true
          },
          {
            id: '2',
            title: "Latest Movies & Exclusive Premieres",
            subtitle: "Book tickets for the hottest new releases",
            image_url: "/lovable-uploads/1934f56d-2445-4eff-bdcb-1dd1e3d45e75.png",
            link: "/movies",
            sort_order: 2,
            is_active: true
          },
          {
            id: '3',
            title: "Live Concert Experiences",
            subtitle: "Don't miss out on your favorite artists",
            image_url: "/lovable-uploads/0717f399-6c25-40d2-ab0c-e8dce44e2e91.png",
            link: "/events/concerts",
            sort_order: 3,
            is_active: true
          }
        ];
      }
    },
    refetchOnMount: true,
    staleTime: 60000 // 1 minute
  });
  
  const slides = heroSlidesData || [];
  
  // Fetch overlay opacity from database
  useEffect(() => {
    const fetchOverlayOpacity = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_overlay_opacity')
          .single();
        
        if (error) {
          console.error('Error fetching overlay opacity:', error);
          return;
        }
        
        if (data) {
          // Convert percentage to decimal (e.g., 60% -> 0.6)
          setOverlayOpacity(parseInt(data.value) / 100);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchOverlayOpacity();
  }, []);
  
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);
  
  if (slides.length === 0) {
    return null; // Don't render if there are no slides
  }
  
  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Hero Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div 
              className="absolute inset-0 z-10" 
              style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
            />
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-20">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {slides[currentSlide]?.title}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {slides[currentSlide]?.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="w-full pl-10 py-3 px-4 bg-white/90 backdrop-blur-sm text-book-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-book-primary"
                placeholder="Search for movies, events, plays..."
              />
            </div>
            
            <Link
              to={slides[currentSlide]?.link}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Indicators */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? "w-8 bg-book-primary" : "bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
