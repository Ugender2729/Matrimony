import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-couple.jpg";

const carouselImages = [
  heroImage,
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
];

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Happy couple celebrating"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-2xl space-y-4 sm:space-y-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
            <span>India's Trusted Banjara Matrimony</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight animate-fade-in">
            Find Your Perfect
            <span className="block text-white drop-shadow-lg">Life Partner</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/90 animate-fade-in">
            Connecting Hearts, Upholding Tradition. Join thousands of Banjara families 
            finding their perfect match.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 animate-fade-in">
            <h3 className="text-foreground font-display font-bold text-lg sm:text-xl">Start Your Journey</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-primary block">I'm looking for</label>
                <Select>
                  <SelectTrigger className="bg-background h-11 sm:h-12 text-sm sm:text-base font-medium border-2 border-border hover:border-primary focus:border-primary transition-colors w-full text-foreground">
                    <SelectValue placeholder="Select option" className="text-foreground" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 z-50">
                    <SelectItem value="bride" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Bride</SelectItem>
                    <SelectItem value="groom" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Groom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-primary block">Age</label>
                <Select>
                  <SelectTrigger className="bg-background h-11 sm:h-12 text-sm sm:text-base font-medium border-2 border-border hover:border-primary focus:border-primary transition-colors w-full text-foreground">
                    <SelectValue placeholder="Select age" className="text-foreground" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 z-50">
                    <SelectItem value="18-25" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">18-25 years</SelectItem>
                    <SelectItem value="26-30" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">26-30 years</SelectItem>
                    <SelectItem value="31-35" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">31-35 years</SelectItem>
                    <SelectItem value="36+" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">36+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                <label className="text-xs sm:text-sm font-semibold text-primary block">Religion</label>
                <Select>
                  <SelectTrigger className="bg-background h-11 sm:h-12 text-sm sm:text-base font-medium border-2 border-border hover:border-primary focus:border-primary transition-colors w-full text-foreground">
                    <SelectValue placeholder="Select religion" className="text-foreground" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 z-50">
                    <SelectItem value="hindu" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Hindu</SelectItem>
                    <SelectItem value="muslim" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Muslim</SelectItem>
                    <SelectItem value="christian" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Christian</SelectItem>
                    <SelectItem value="sikh" className="text-sm sm:text-base font-medium text-foreground hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Sikh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto" asChild>
                  <Link to="/register">
                    Register Free
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentImage(index)}
              className={`h-2.5 w-2.5 rounded-full border border-white transition-all ${
                index === currentImage ? "bg-white w-6" : "bg-white/30 hover:bg-white/70"
              }`}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
