import { useEffect, useRef, useState } from "react";
import { Shield, Users, Verified, HeartHandshake, Phone, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "100% Verified Profiles",
    description: "Every profile is manually verified to ensure authenticity and safety.",
  },
  {
    icon: Users,
    title: "Lakhs of Members",
    description: "Join a thriving community of Banjara families seeking perfect matches.",
  },
  {
    icon: Verified,
    title: "Privacy Protected",
    description: "Your personal information is secure with our advanced privacy controls.",
  },
  {
    icon: HeartHandshake,
    title: "Success Stories",
    description: "Thousands of happy couples found their soulmates through our platform.",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Our dedicated team is always here to help you in your journey.",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description: "Bank-level security ensures your data is always protected.",
  },
];

const Features = () => {
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
        threshold: 0.1,
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
    <section
      id="features"
      ref={sectionRef}
      className="relative py-12 sm:py-16 md:py-20 overflow-hidden parallax-section bg-matrimony-parallax"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" />
      <div className="container px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4 animate-fade-in-up text-white">
            Why Choose Us
          </h2>
          <p className="text-white/80 text-base sm:text-lg px-4 animate-fade-in-up">
            Trusted by thousands of families for genuine matrimonial services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards.has(index);
            return (
              <Card
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-index={index}
                className={`border border-white/10 transition-all duration-500 bg-background/90 backdrop-blur-sm ${
                  isVisible 
                    ? "opacity-100 translate-y-0 scale-100" 
                    : "opacity-0 translate-y-8 scale-95"
                } hover:border-primary hover:shadow-warm hover:-translate-y-2 hover:scale-105`}
              >
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
