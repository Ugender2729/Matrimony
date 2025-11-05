import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search } from "lucide-react";
import heroImage from "@/assets/hero-couple.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Happy Couple" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl space-y-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm">
            <Heart className="h-4 w-4 fill-current" />
            <span>India's Trusted Banjara Matrimony</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
            Find Your Perfect
            <span className="block text-yellow-300">Life Partner</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 animate-fade-in">
            Connecting Hearts, Upholding Tradition. Join thousands of Banjara families 
            finding their perfect match.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <h3 className="text-foreground font-semibold text-lg">Start Your Journey</h3>
            
            <div className="grid md:grid-cols-3 gap-3">
              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="I'm looking for" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bride">Bride</SelectItem>
                  <SelectItem value="groom">Groom</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-25">18-25 years</SelectItem>
                  <SelectItem value="26-30">26-30 years</SelectItem>
                  <SelectItem value="31-35">31-35 years</SelectItem>
                  <SelectItem value="36+">36+ years</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hindu">Hindu</SelectItem>
                  <SelectItem value="muslim">Muslim</SelectItem>
                  <SelectItem value="christian">Christian</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="hero" size="lg" className="flex-1">
                <Search className="mr-2 h-5 w-5" />
                Search Profiles
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Register Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
