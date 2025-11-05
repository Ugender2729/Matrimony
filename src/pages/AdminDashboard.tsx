import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Check, X, User, Mail, Calendar, LogOut, UserPlus, Copy, Upload, Camera, Save, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface PendingUser {
  id: string;
  email: string;
  name: string;
  profileType: "bride" | "groom";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  password?: string;
}

const createProfileSchema = z.object({
  // Account Info
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileType: z.enum(["bride", "groom"], {
    required_error: "Please select profile type",
  }),
  phone: z.string().min(10, "Valid phone number is required"),
  
  // Personal Information
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  height: z.string().min(1, "Height is required"),
  
  // Education & Career
  education: z.string().min(1, "Education is required"),
  occupation: z.string().min(1, "Occupation is required"),
  salary: z.string().min(1, "Salary is required"),
  
  // Location
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  
  // Family & Background
  religion: z.string().min(1, "Religion is required"),
  motherTongue: z.string().min(1, "Mother tongue is required"),
  familyType: z.string().min(1, "Family type is required"),
  
  // Additional Details
  about: z.string().min(50, "Please write at least 50 characters about the person"),
});

type CreateProfileFormValues = z.infer<typeof createProfileSchema>;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<PendingUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState<{ email: string; password: string } | null>(null);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const createProfileForm = useForm<CreateProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      profileType: undefined,
      phone: "",
      dateOfBirth: "",
      height: "",
      education: "",
      occupation: "",
      salary: "",
      city: "",
      state: "",
      religion: "",
      motherTongue: "",
      familyType: "",
      about: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const users = storedUsers.filter((u: any) => u.role !== "admin");
    
    setPendingUsers(users.filter((u: any) => u.status === "pending"));
    setApprovedUsers(users.filter((u: any) => u.status === "approved"));
    setRejectedUsers(users.filter((u: any) => u.status === "rejected"));
  };

  const updateUserStatus = (userId: string, status: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = storedUsers.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        storedUsers[userIndex].status = status;
        storedUsers[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem("users", JSON.stringify(storedUsers));
        loadUsers(); // Reload the list
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const filteredUsers = storedUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(filteredUsers));
      loadUsers(); // Reload the list
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onCreateProfile = async (data: CreateProfileFormValues) => {
    setIsLoading(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if user already exists
      if (storedUsers.some((u: any) => u.email === data.email)) {
        createProfileForm.setError("email", { message: "User with this email already exists" });
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email: data.email,
        password: data.password, // In production, this should be hashed
        name: data.name,
        profileType: data.profileType,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        height: data.height,
        education: data.education,
        occupation: data.occupation,
        salary: data.salary,
        city: data.city,
        state: data.state,
        religion: data.religion,
        motherTongue: data.motherTongue,
        familyType: data.familyType,
        about: data.about,
        profileImage: profileImage,
        isProfileComplete: true, // Admin-created profiles are complete
        status: "approved", // Admin-created accounts are automatically approved
        role: "user",
        createdAt: new Date().toISOString(),
        createdBy: "admin",
        createdByAdmin: user?.id || "admin",
      };

      storedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(storedUsers));
      
      // Show credentials to admin
      setShowCredentials({ email: data.email, password: data.password });
      createProfileForm.reset();
      setProfileImage(null);
      setCreateProfileOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isAdmin) {
    return null;
  }

  const UserCard = ({ user: userData, onApprove, onReject, onDelete }: { 
    user: PendingUser; 
    onApprove: () => void; 
    onReject: () => void;
    onDelete?: () => void;
  }) => (
    <Card className="border-2">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{userData.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {userData.email}
              </p>
            </div>
          </div>
          <Badge variant={userData.status === "approved" ? "default" : userData.status === "rejected" ? "destructive" : "secondary"}>
            {userData.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Profile Type:</span>
            <Badge variant="outline" className="capitalize">{userData.profileType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Registered: {new Date(userData.createdAt).toLocaleDateString()}
          </div>
        </div>

        {userData.status === "pending" && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onApprove}
              variant="default"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={onReject}
              variant="destructive"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
        {userData.status === "approved" && onDelete && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </div>
        )}
        {userData.status === "rejected" && onDelete && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onApprove}
              variant="default"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <Header />
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage user registrations and approvals</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{pendingUsers.length}</div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
                <p className="text-sm text-muted-foreground">Approved Users</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{rejectedUsers.length}</div>
                <p className="text-sm text-muted-foreground">Rejected Users</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex justify-end">
            <Dialog open={createProfileOpen} onOpenChange={setCreateProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Bride/Groom Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create Complete Profile</DialogTitle>
                  <DialogDescription>
                    Create a complete profile for a bride or groom with all background information
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <Form {...createProfileForm}>
                    <form onSubmit={createProfileForm.handleSubmit(onCreateProfile)} className="space-y-6 py-4">
                      {/* Profile Image Upload */}
                      <div className="flex flex-col items-center space-y-4 py-4 border-b">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary">
                            {profileImage ? (
                              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          <label
                            htmlFor="profile-image-admin"
                            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            <input
                              id="profile-image-admin"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              title="Upload profile image"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          Upload profile photo (Recommended: Square image, at least 400x400px)
                        </p>
                      </div>

                      {/* Account Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Account Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={createProfileForm.control}
                            name="profileType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select profile type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="bride">Bride</SelectItem>
                                    <SelectItem value="groom">Groom</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createProfileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={createProfileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createProfileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={createProfileForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password *</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter password (min. 6 characters)" {...field} />
                              </FormControl>
                              <FormDescription>
                                This password will be shared with the user for login
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={createProfileForm.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createProfileForm.control}
                            name="height"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select height" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="4'6&quot;">4'6"</SelectItem>
                                    <SelectItem value="4'7&quot;">4'7"</SelectItem>
                                    <SelectItem value="4'8&quot;">4'8"</SelectItem>
                                    <SelectItem value="4'9&quot;">4'9"</SelectItem>
                                    <SelectItem value="4'10&quot;">4'10"</SelectItem>
                                    <SelectItem value="4'11&quot;">4'11"</SelectItem>
                                    <SelectItem value="5'0&quot;">5'0"</SelectItem>
                                    <SelectItem value="5'1&quot;">5'1"</SelectItem>
                                    <SelectItem value="5'2&quot;">5'2"</SelectItem>
                                    <SelectItem value="5'3&quot;">5'3"</SelectItem>
                                    <SelectItem value="5'4&quot;">5'4"</SelectItem>
                                    <SelectItem value="5'5&quot;">5'5"</SelectItem>
                                    <SelectItem value="5'6&quot;">5'6"</SelectItem>
                                    <SelectItem value="5'7&quot;">5'7"</SelectItem>
                                    <SelectItem value="5'8&quot;">5'8"</SelectItem>
                                    <SelectItem value="5'9&quot;">5'9"</SelectItem>
                                    <SelectItem value="5'10&quot;">5'10"</SelectItem>
                                    <SelectItem value="5'11&quot;">5'11"</SelectItem>
                                    <SelectItem value="6'0&quot;">6'0"</SelectItem>
                                    <SelectItem value="6'1&quot;">6'1"</SelectItem>
                                    <SelectItem value="6'2&quot;">6'2"</SelectItem>
                                    <SelectItem value="6'3&quot;">6'3"</SelectItem>
                                    <SelectItem value="6'4&quot;">6'4"</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Education & Career */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Education & Career</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={createProfileForm.control}
                            name="education"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Education *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select education" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="10th Pass">10th Pass</SelectItem>
                                    <SelectItem value="12th Pass">12th Pass</SelectItem>
                                    <SelectItem value="Diploma">Diploma</SelectItem>
                                    <SelectItem value="Graduate">Graduate</SelectItem>
                                    <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                                    <SelectItem value="PhD">PhD</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createProfileForm.control}
                            name="occupation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Occupation/Profession *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Software Engineer, Doctor, Teacher" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={createProfileForm.control}
                          name="salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Salary *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select salary range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Below 2 Lakhs">Below 2 Lakhs</SelectItem>
                                  <SelectItem value="2-5 Lakhs">2-5 Lakhs</SelectItem>
                                  <SelectItem value="5-10 Lakhs">5-10 Lakhs</SelectItem>
                                  <SelectItem value="10-20 Lakhs">10-20 Lakhs</SelectItem>
                                  <SelectItem value="20-50 Lakhs">20-50 Lakhs</SelectItem>
                                  <SelectItem value="Above 50 Lakhs">Above 50 Lakhs</SelectItem>
                                  <SelectItem value="Not Disclosed">Not Disclosed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={createProfileForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createProfileForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                    <SelectItem value="Telangana">Telangana</SelectItem>
                                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Family & Background */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Family & Background</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={createProfileForm.control}
                            name="religion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Religion *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select religion" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Hindu">Hindu</SelectItem>
                                    <SelectItem value="Muslim">Muslim</SelectItem>
                                    <SelectItem value="Christian">Christian</SelectItem>
                                    <SelectItem value="Sikh">Sikh</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createProfileForm.control}
                            name="motherTongue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mother Tongue *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select mother tongue" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="Telugu">Telugu</SelectItem>
                                    <SelectItem value="Kannada">Kannada</SelectItem>
                                    <SelectItem value="Marathi">Marathi</SelectItem>
                                    <SelectItem value="Tamil">Tamil</SelectItem>
                                    <SelectItem value="Gujarati">Gujarati</SelectItem>
                                    <SelectItem value="Rajasthani">Rajasthani</SelectItem>
                                    <SelectItem value="Bengali">Bengali</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={createProfileForm.control}
                          name="familyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Family Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select family type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Nuclear">Nuclear</SelectItem>
                                  <SelectItem value="Joint">Joint</SelectItem>
                                  <SelectItem value="Extended">Extended</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* About */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">About</h3>
                        
                        <FormField
                          control={createProfileForm.control}
                          name="about"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>About & Background *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Write about the person, their background, interests, hobbies, family, and what they're looking for in a life partner..."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Write at least 50 characters. This helps others get to know them better.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-4 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setCreateProfileOpen(false);
                            createProfileForm.reset();
                            setProfileImage(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="hero"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            "Creating..."
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Create Complete Profile
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {showCredentials && (
            <Card className="mb-6 border-2 border-primary">
              <CardHeader>
                <CardTitle>Account Created Successfully!</CardTitle>
                <CardDescription>Share these credentials with the user:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Email:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={showCredentials.email} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(showCredentials.email)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Password:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={showCredentials.password} readOnly className="font-mono" type="password" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(showCredentials.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCredentials(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="approved" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                All Users ({approvedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingUsers.length === 0 ? (
                <Card className="border-2">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No pending registrations</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingUsers.map((userData) => (
                    <UserCard
                      key={userData.id}
                      user={userData}
                      onApprove={() => updateUserStatus(userData.id, "approved")}
                      onReject={() => updateUserStatus(userData.id, "rejected")}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {approvedUsers.length === 0 ? (
                <Card className="border-2">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No approved users yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedUsers.map((userData) => (
                    <UserCard
                      key={userData.id}
                      user={userData}
                      onApprove={() => {}}
                      onReject={() => {}}
                      onDelete={() => deleteUser(userData.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejectedUsers.length === 0 ? (
                <Card className="border-2">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No rejected users</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rejectedUsers.map((userData) => (
                    <UserCard
                      key={userData.id}
                      user={userData}
                      onApprove={() => updateUserStatus(userData.id, "approved")}
                      onReject={() => {}}
                      onDelete={() => deleteUser(userData.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
