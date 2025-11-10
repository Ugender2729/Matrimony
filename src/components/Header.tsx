import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Menu, User, LogOut, UserCircle, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 sm:h-20 md:h-24 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img src={logo} alt="BanjaraVivah" className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-primary/20" />
          <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            BanjaraVivah
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <a href="#home" className="text-base lg:text-lg font-medium transition-colors hover:text-primary">
            Home
          </a>
          <a href="#how-it-works" className="text-base lg:text-lg font-medium transition-colors hover:text-primary">
            How It Works
          </a>
          <a href="#success-stories" className="text-base lg:text-lg font-medium transition-colors hover:text-primary">
            Success Stories
          </a>
          <a href="#features" className="text-base lg:text-lg font-medium transition-colors hover:text-primary">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex h-9 md:h-10 text-sm md:text-base">
                    <UserCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    {user?.name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-primary mt-1 capitalize">{user?.profileType}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user?.isProfileComplete ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/browse">
                          <Heart className="mr-2 h-4 w-4" />
                          Browse Profiles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile/create">
                          <UserCircle className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile/create">
                          <UserCircle className="mr-2 h-4 w-4" />
                          Complete Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                <UserCircle className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden md:flex h-9 md:h-10 text-sm md:text-base" asChild>
                <Link to="/login">
                  <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Login
                </Link>
              </Button>
              <Button variant="hero" size="sm" className="text-sm sm:text-base px-4 sm:px-5 h-9 sm:h-10 md:h-11" asChild>
                <Link to="/register">
                  <Heart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Register Free</span>
                  <span className="sm:hidden">Register</span>
                </Link>
              </Button>
            </>
          )}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <img src={logo} alt="BanjaraVivah" className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-primary/20" />
                  <span className="text-xl sm:text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                    BanjaraVivah
                  </span>
                </div>
                
                <nav className="flex flex-col gap-4">
                  <SheetClose asChild>
                    <a href="#home" className="text-lg font-medium transition-colors hover:text-primary py-3">
                      Home
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#how-it-works" className="text-lg font-medium transition-colors hover:text-primary py-3">
                      How It Works
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#success-stories" className="text-lg font-medium transition-colors hover:text-primary py-3">
                      Success Stories
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#features" className="text-lg font-medium transition-colors hover:text-primary py-3">
                      Features
                    </a>
                  </SheetClose>
                </nav>

                <div className="flex flex-col gap-3 pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <div className="px-2 py-2 border rounded-lg">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      {!user?.isProfileComplete && (
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full" asChild>
                            <Link to="/profile/create">
                              <UserCircle className="mr-2 h-4 w-4" />
                              Complete Profile
                            </Link>
                          </Button>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/login">
                            <User className="mr-2 h-4 w-4" />
                            Login
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="hero" className="w-full" asChild>
                          <Link to="/register">
                            <Heart className="mr-2 h-4 w-4" />
                            Register Free
                          </Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
