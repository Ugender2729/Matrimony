import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { User, Search, MapPin, Calendar, GraduationCap, Briefcase, Heart, Filter } from "lucide-react";
import Header from "@/components/Header";

interface Profile {
  id: string;
  name: string;
  email: string;
  profileType: "bride" | "groom";
  profileImage?: string;
  dateOfBirth?: string;
  height?: string;
  education?: string;
  occupation?: string;
  city?: string;
  state?: string;
  religion?: string;
  motherTongue?: string;
  about?: string;
  isProfileComplete: boolean;
}

const BrowseProfiles = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    state: "",
    religion: "",
    education: "",
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    // Load all approved users
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Filter: Show only opposite gender profiles (grooms see brides, brides see grooms)
    const oppositeGender = user.profileType === "bride" ? "groom" : "bride";
    const oppositeProfiles = storedUsers.filter(
      (u: any) => 
        u.role !== "admin" && 
        u.status === "approved" && 
        u.profileType === oppositeGender &&
        u.isProfileComplete === true &&
        u.id !== user.id
    );

    // Convert to Profile format
    const profileList: Profile[] = oppositeProfiles.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      profileType: u.profileType,
      profileImage: u.profileImage,
      dateOfBirth: u.dateOfBirth,
      height: u.height,
      education: u.education,
      occupation: u.occupation,
      city: u.city,
      state: u.state,
      religion: u.religion,
      motherTongue: u.motherTongue,
      about: u.about,
      isProfileComplete: u.isProfileComplete,
    }));

    setProfiles(profileList);
    setFilteredProfiles(profileList);
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    let filtered = [...profiles];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.state) {
      filtered = filtered.filter((p) => p.state === filters.state);
    }
    if (filters.religion) {
      filtered = filtered.filter((p) => p.religion === filters.religion);
    }
    if (filters.education) {
      filtered = filtered.filter((p) => p.education === filters.education);
    }

    setFilteredProfiles(filtered);
  }, [searchTerm, filters, profiles]);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!user) {
    return null;
  }

  const states = Array.from(new Set(profiles.map((p) => p.state).filter(Boolean)));
  const religions = Array.from(new Set(profiles.map((p) => p.religion).filter(Boolean)));
  const educations = Array.from(new Set(profiles.map((p) => p.education).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <Header />
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
              Browse {user.profileType === "bride" ? "Grooms" : "Brides"}
            </h1>
            <p className="text-muted-foreground">
              {user.profileType === "bride" 
                ? "Find your perfect match from verified groom profiles" 
                : "Find your perfect match from verified bride profiles"}
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 border-2">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, city, or state..."
                      className="pl-10 h-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All States</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.religion} onValueChange={(value) => setFilters({ ...filters, religion: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Religions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Religions</SelectItem>
                      {religions.map((religion) => (
                        <SelectItem key={religion} value={religion}>
                          {religion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.education} onValueChange={(value) => setFilters({ ...filters, education: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Education</SelectItem>
                      {educations.map((edu) => (
                        <SelectItem key={edu} value={edu}>
                          {edu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(filters.state || filters.religion || filters.education) && (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ state: "", religion: "", education: "" })}
                    className="w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProfiles.length} of {profiles.length} profiles
            </p>
          </div>

          {/* Profiles Grid */}
          {filteredProfiles.length === 0 ? (
            <Card className="border-2">
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No profiles found</h3>
                <p className="text-muted-foreground">
                  {profiles.length === 0
                    ? `No ${user.profileType === "bride" ? "groom" : "bride"} profiles available yet. Check back later!`
                    : "Try adjusting your search or filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="border-2 hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-4 border-primary shadow-lg relative">
                          {profile.profileImage ? (
                            <img
                              src={profile.profileImage}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-16 w-16 text-white" />
                          )}
                        </div>
                        <Badge className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary text-white capitalize px-2 py-0.5">
                          {profile.profileType}
                        </Badge>
                      </div>

                      {/* Name and Basic Info */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-bold">{profile.name}</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {profile.dateOfBirth && calculateAge(profile.dateOfBirth) && (
                            <Badge variant="outline">{calculateAge(profile.dateOfBirth)} years</Badge>
                          )}
                          {profile.height && (
                            <Badge variant="outline">{profile.height}</Badge>
                          )}
                          {profile.city && profile.state && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {profile.city}, {profile.state}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="w-full space-y-2 text-sm text-left">
                        {profile.education && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GraduationCap className="h-4 w-4" />
                            <span>{profile.education}</span>
                          </div>
                        )}
                        {profile.occupation && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{profile.occupation}</span>
                          </div>
                        )}
                        {profile.religion && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Religion:</span>
                            <span className="text-muted-foreground">{profile.religion}</span>
                          </div>
                        )}
                        {profile.motherTongue && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Mother Tongue:</span>
                            <span className="text-muted-foreground">{profile.motherTongue}</span>
                          </div>
                        )}
                      </div>

                      {/* About */}
                      {profile.about && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {profile.about}
                        </p>
                      )}

                      {/* Action Button */}
                      <Button variant="hero" className="w-full" onClick={() => navigate(`/profile/${profile.id}`)}>
                        <Heart className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseProfiles;

