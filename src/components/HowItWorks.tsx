import { useEffect, useRef, useState } from "react";
import { UserPlus, Search, MessageCircle, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description: "Register for free and create your detailed profile with photos and preferences.",
    color: "bg-primary",
  },
  {
    icon: Search,
    title: "Search Matches",
    description: "Browse through verified profiles and find compatible matches based on your criteria.",
    color: "bg-accent",
  },
  {
    icon: MessageCircle,
    title: "Connect & Chat",
    description: "Express interest and start conversations with potential life partners.",
    color: "bg-maroon",
  },
  {
    icon: Heart,
    title: "Find Love",
    description: "Meet, connect, and start your beautiful journey together with your perfect match.",
    color: "bg-primary",
  },
];

const HowItWorks = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-secondary/30 relative overflow-hidden" ref={sectionRef}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4 animate-fade-in-up">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg px-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Your journey to finding the perfect life partner in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isVisible = visibleCards.has(index);
            return (
              <Card 
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-index={index}
                className={`relative overflow-hidden transition-all duration-500 ${
                  isVisible 
                    ? "opacity-100 translate-y-0 scale-100" 
                    : "opacity-0 translate-y-8 scale-95"
                } hover:shadow-warm hover:-translate-y-2 hover:scale-105 group`}
                style={{ 
                  transitionDelay: isVisible ? `${index * 0.15}s` : "0s",
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4 relative z-10">
                  <div className={`${step.color} w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto shadow-soft transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg relative`}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    {/* Pulse effect */}
                    <div className={`absolute inset-0 rounded-full ${step.color} opacity-0 group-hover:opacity-30 group-hover:animate-ping`}></div>
                  </div>
                  
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-5xl font-bold text-muted/20 transition-all duration-300 group-hover:text-primary/30 group-hover:scale-110">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold transition-colors duration-300 group-hover:text-primary relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed relative z-10">
                    {step.description}
                  </p>
                  
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
