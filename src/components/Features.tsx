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
  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-muted-foreground text-lg">
            Trusted by thousands of families for genuine matrimonial services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-warm animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
