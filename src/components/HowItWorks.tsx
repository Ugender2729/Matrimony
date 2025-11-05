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
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Your journey to finding the perfect life partner in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden hover:shadow-warm transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-soft`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="absolute top-4 right-4 text-5xl font-bold text-muted/20">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
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
