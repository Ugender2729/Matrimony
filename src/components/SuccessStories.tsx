import { Card, CardContent } from "@/components/ui/card";
import { Quote, Heart } from "lucide-react";

const stories = [
  {
    name: "Priya & Rahul",
    location: "Mumbai, Maharashtra",
    story: "We found each other on BanjaraVivah and it's been a beautiful journey. The platform made it so easy to connect with like-minded people from our community.",
    date: "Married in 2023",
  },
  {
    name: "Anjali & Vikram",
    location: "Bangalore, Karnataka",
    story: "After months of searching, we finally found our perfect match. The verification process gave us confidence, and now we're happily married!",
    date: "Married in 2024",
  },
  {
    name: "Neha & Arjun",
    location: "Delhi, NCR",
    story: "BanjaraVivah helped us find true love while respecting our traditions and values. We couldn't be happier with our decision.",
    date: "Married in 2023",
  },
];

const SuccessStories = () => {
  return (
    <section id="success-stories" className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <Heart className="h-12 w-12 mx-auto mb-4 text-primary fill-primary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground text-lg">
            Real love stories from couples who found their perfect match
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden hover:shadow-warm transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-4">
                <Quote className="h-8 w-8 text-primary/30" />
                
                <p className="text-muted-foreground italic">{story.story}</p>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-lg bg-gradient-primary bg-clip-text text-transparent">
                    {story.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{story.location}</p>
                  <p className="text-sm text-primary font-medium mt-1">{story.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
