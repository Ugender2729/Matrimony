import { Button } from "@/components/ui/button";
import { Heart, Menu, User } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BanjaraVivah" className="h-12 w-12 rounded-full object-cover" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            BanjaraVivah
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#home" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </a>
          <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
            How It Works
          </a>
          <a href="#success-stories" className="text-sm font-medium transition-colors hover:text-primary">
            Success Stories
          </a>
          <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <User className="mr-2 h-4 w-4" />
            Login
          </Button>
          <Button variant="hero" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Register Free
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
