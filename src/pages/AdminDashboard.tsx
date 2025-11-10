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
import { Shield, Check, X, User, Mail, Calendar, LogOut, UserPlus, Copy, Upload, Camera, Save, Trash2, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { uploadImageToSupabase } from "@/utils/supabaseHelpers";
import { compressImage, validateImage } from "@/utils/imageUtils";
import { validateMinimumAge } from "@/utils/ageValidation";

interface PendingUser {
  id: string;
  email: string;
  name: string;
  profileType: "bride" | "groom";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  password?: string;
  profileImage?: string;
}

const createProfileSchema = z.object({
  // Account Info
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string()
    .min(10, "Mobile number must be exactly 10 digits")
    .max(10, "Mobile number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Mobile number must start with 6, 7, 8, or 9 and be 10 digits"),
  password: z.string().optional(),
  profileType: z.enum(["bride", "groom"], {
    required_error: "Please select profile type",
  }),
  phone: z.string().min(10, "Valid phone number is required"),
  
  // Personal Information
  dateOfBirth: z.string()
    .min(1, "Date of birth is required"),
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
}).superRefine((data, ctx) => {
  // Validate minimum age using both fields safely
  if (!data.profileType || !data.dateOfBirth) return;
  const ageError = validateMinimumAge(data.dateOfBirth, data.profileType);
  if (ageError) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ageError,
      path: ["dateOfBirth"],
    });
  }
  // Validate password - required for new profiles, optional for edits
  // We'll handle this in the component since we can't access editingUserId here
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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const createProfileForm = useForm<CreateProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: "",
      mobile: "",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validationError = validateImage(file, 20); // 20MB max
    if (validationError) {
      createProfileForm.setError("root", { message: validationError });
      e.target.value = ''; // Clear input
      return;
    }

    try {
      // For now, convert to base64 for preview
      // Will upload to Supabase when profile is saved
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        createProfileForm.clearErrors("root"); // Clear any previous errors
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing image:", error);
      createProfileForm.setError("root", { 
        message: `Failed to process image: ${error.message}` 
      });
      e.target.value = ''; // Clear input
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      // Try Supabase first
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (users && users.length > 0) {
        // Convert database format to frontend format
        const formattedUsers = users.map((u: any) => ({
          id: u.id,
          email: u.email || u.mobile,
          name: u.name,
          profileType: u.profile_type,
          status: u.status,
          createdAt: u.created_at,
          mobile: u.mobile,
          profileImage: u.profile_image,
        }));

        setPendingUsers(formattedUsers.filter((u: any) => u.status === "pending"));
        setApprovedUsers(formattedUsers.filter((u: any) => u.status === "approved"));
        setRejectedUsers(formattedUsers.filter((u: any) => u.status === "rejected"));
        return;
      }
    } catch (supabaseError) {
      console.warn('Supabase loadUsers failed, using localStorage fallback:', supabaseError);
    }

    // Fallback to localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const users = storedUsers.filter((u: any) => u.role !== "admin").map((u: any) => ({
      id: u.id,
      email: u.email || u.mobile,
      name: u.name,
      profileType: u.profileType || u.profile_type,
      status: u.status,
      createdAt: u.createdAt || u.created_at,
      mobile: u.mobile,
      profileImage: u.profileImage || u.profile_image,
    }));
    
    setPendingUsers(users.filter((u: any) => u.status === "pending"));
    setApprovedUsers(users.filter((u: any) => u.status === "approved"));
    setRejectedUsers(users.filter((u: any) => u.status === "rejected"));
  };

  const updateUserStatus = async (userId: string, status: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      // Try Supabase first
      const { error } = await supabase
        .from('users')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
    } catch (supabaseError) {
      console.warn('Supabase updateUserStatus failed, using localStorage fallback:', supabaseError);
      
      // Fallback to localStorage
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = storedUsers.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        storedUsers[userIndex].status = status;
        storedUsers[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem("users", JSON.stringify(storedUsers));
        loadUsers();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Try Supabase first
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
    } catch (supabaseError) {
      console.warn('Supabase deleteUser failed, using localStorage fallback:', supabaseError);
      
      // Fallback to localStorage
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const filteredUsers = storedUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(filteredUsers));
      loadUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const editUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Try Supabase first - check both tables
      let userData: any = null;
      
      // Try brides table first
      const { data: brideData, error: brideError } = await supabase
        .from('brides')
        .select('*')
        .eq('id', userId)
        .single();

      if (!brideError && brideData) {
        userData = brideData;
      } else {
        // Try grooms table
        const { data: groomData, error: groomError } = await supabase
          .from('grooms')
          .select('*')
          .eq('id', userId)
          .single();

        if (!groomError && groomData) {
          userData = groomData;
        }
      }

      if (userData) {
        // Pre-fill form with user data
        createProfileForm.reset({
          name: userData.name || "",
          mobile: userData.mobile || userData.email || "",
          password: "", // Don't pre-fill password
          profileType: userData.profile_type || undefined,
          phone: userData.phone || "",
          dateOfBirth: userData.date_of_birth || "",
          height: userData.height || "",
          education: userData.education || "",
          occupation: userData.occupation || "",
          salary: userData.salary || "",
          city: userData.city || "",
          state: userData.state || "",
          religion: userData.religion || "",
          motherTongue: userData.mother_tongue || "",
          familyType: userData.family_type || "",
          about: userData.about || "",
        });

        // Set profile image if exists
        if (userData.profile_image) {
          setProfileImage(userData.profile_image);
        } else {
          setProfileImage(null);
        }

        setEditingUserId(userId);
        setCreateProfileOpen(true);
        setIsLoading(false);
        return;
      }
    } catch (supabaseError) {
      console.warn('Supabase editUser failed, using localStorage fallback:', supabaseError);
    }

    // Fallback to localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = storedUsers.find((u: any) => u.id === userId);
    
    if (userData) {
      createProfileForm.reset({
        name: userData.name || "",
        mobile: userData.mobile || userData.email || "",
        password: "", // Don't pre-fill password
        profileType: userData.profileType || undefined,
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth || userData.date_of_birth || "",
        height: userData.height || "",
        education: userData.education || "",
        occupation: userData.occupation || "",
        salary: userData.salary || "",
        city: userData.city || "",
        state: userData.state || "",
        religion: userData.religion || "",
        motherTongue: userData.motherTongue || userData.mother_tongue || "",
        familyType: userData.familyType || userData.family_type || "",
        about: userData.about || "",
      });

      if (userData.profileImage || userData.profile_image) {
        setProfileImage(userData.profileImage || userData.profile_image);
      } else {
        setProfileImage(null);
      }

      setEditingUserId(userId);
      setCreateProfileOpen(true);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onCreateProfile = async (data: CreateProfileFormValues) => {
    setIsLoading(true);
    try {
      const isEditMode = editingUserId !== null;
      
      // Validate image is required for new profiles
      if (!isEditMode && !profileImage) {
        createProfileForm.setError("root", { message: "Profile image is required. Please upload an image." });
        setIsLoading(false);
        return;
      }
      
      // Validate password for new profiles
      if (!isEditMode && (!data.password || data.password.trim() === "")) {
        createProfileForm.setError("password", { message: "Password is required for new profiles" });
        setIsLoading(false);
        return;
      }
      
      if (data.password && data.password.trim() !== "" && data.password.length < 6) {
        createProfileForm.setError("password", { message: "Password must be at least 6 characters" });
        setIsLoading(false);
        return;
      }

      const tableName = data.profileType === 'bride' ? 'brides' : 'grooms';

      // Prepare user data for Supabase (without image first)
      const userData: any = {
        email: data.mobile,
        mobile: data.mobile,
        name: data.name,
        profile_type: data.profileType,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        height: data.height,
        education: data.education,
        occupation: data.occupation,
        salary: data.salary,
        city: data.city,
        state: data.state,
        religion: data.religion,
        mother_tongue: data.motherTongue,
        family_type: data.familyType,
        about: data.about,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      // Only include password if it's provided (for new users or password updates)
      if (data.password && data.password.trim() !== "") {
        userData.password = data.password;
      }

      // Only include these fields for new users
      if (!isEditMode) {
        userData.status = 'approved' as const;
        userData.role = 'user' as const;
        userData.created_by = 'admin';
        userData.created_by_admin = user?.id || 'admin';
      }

      try {
        if (isEditMode) {
          // Update existing user
          const { error: updateError } = await supabase
            .from(tableName)
            .update(userData)
            .eq('id', editingUserId);

          if (updateError) throw updateError;

          // Step 2: Upload/update image if provided
          let imageUrl = profileImage;
          if (profileImage && profileImage.startsWith('data:image')) {
            try {
              // Convert base64 to file for upload
              const response = await fetch(profileImage);
              const blob = await response.blob();
              const originalFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
              
              // Compress image before upload
              const compressed = await compressImage(originalFile);
              
              // Convert compressed base64 back to file
              const compressedBlob = await fetch(compressed.data).then(r => r.blob());
              const compressedFile = new File([compressedBlob], 'profile.jpg', { type: 'image/jpeg' });
              
              // Upload with user ID
              imageUrl = await uploadImageToSupabase(compressedFile, editingUserId);
              
              // Update user with image URL
              const { error: imageUpdateError } = await supabase
                .from(tableName)
                .update({ profile_image: imageUrl })
                .eq('id', editingUserId);

              if (imageUpdateError) {
                console.warn('Failed to update user with image URL:', imageUpdateError);
              }
            } catch (uploadError: any) {
              console.warn('Failed to upload image, user updated without image:', uploadError);
            }
          } else if (profileImage && !profileImage.startsWith('data:image')) {
            // Image is already a URL, just update it
            const { error: imageUpdateError } = await supabase
              .from(tableName)
              .update({ profile_image: profileImage })
              .eq('id', editingUserId);

            if (imageUpdateError) {
              console.warn('Failed to update user with image URL:', imageUpdateError);
            }
          }

          // Reload users and close dialog
          await loadUsers();
          createProfileForm.reset();
          setProfileImage(null);
          setEditingUserId(null);
          setCreateProfileOpen(false);
          return;
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from(tableName)
            .insert(userData)
            .select()
            .single();

          if (insertError) throw insertError;

          // Step 2: Upload image if provided (now we have the real user ID)
          let imageUrl = profileImage;
          if (profileImage && profileImage.startsWith('data:image') && newUser?.id) {
            try {
              // Convert base64 to file for upload
              const response = await fetch(profileImage);
              const blob = await response.blob();
              const originalFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
              
              // Compress image before upload (auto-adjusts based on file size)
              const compressed = await compressImage(originalFile);
              
              // Convert compressed base64 back to file
              const compressedBlob = await fetch(compressed.data).then(r => r.blob());
              const compressedFile = new File([compressedBlob], 'profile.jpg', { type: 'image/jpeg' });
              
              // Upload with real user ID
              imageUrl = await uploadImageToSupabase(compressedFile, newUser.id);
              
              // Step 3: Update user with image URL in the same base table
              const { error: imageUpdateError } = await supabase
                .from(tableName)
                .update({ profile_image: imageUrl })
                .eq('id', newUser.id);

              if (imageUpdateError) {
                console.warn('Failed to update user with image URL:', imageUpdateError);
                // Continue anyway - user is created, just without image
              }
            } catch (uploadError: any) {
              console.warn('Failed to upload image, user created without image:', uploadError);
              // Continue anyway - user is created, just without image
            }
          }

          // Show credentials to admin
          setShowCredentials({ email: data.mobile, password: data.password });
          createProfileForm.reset();
          setProfileImage(null);
          setEditingUserId(null);
          setCreateProfileOpen(false);
          await loadUsers();
        }
      } catch (supabaseError: any) {
        console.warn('Supabase createProfile failed, using localStorage fallback:', supabaseError);
        
        // Fallback to localStorage
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        
        if (storedUsers.some((u: any) => u.mobile === data.mobile || u.email === data.mobile)) {
          createProfileForm.setError("mobile", { message: "User with this mobile number already exists" });
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          ...userData,
          profileType: data.profileType,
          profileImage: profileImage || null,
          isProfileComplete: true,
          status: "approved",
          role: "user",
          createdAt: new Date().toISOString(),
        };

        storedUsers.push(newUser);
        localStorage.setItem("users", JSON.stringify(storedUsers));
        
        setShowCredentials({ email: data.mobile, password: data.password });
        createProfileForm.reset();
        setProfileImage(null);
        setCreateProfileOpen(false);
        loadUsers();
      }
    } catch (error: any) {
      console.error("Error creating profile:", error);
      createProfileForm.setError("root", { 
        message: error.message || "Failed to create profile. Please try again." 
      });
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

  const UserCard = ({ user: userData, onApprove, onReject, onDelete, onEdit }: { 
    user: PendingUser; 
    onApprove: () => void; 
    onReject: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
  }) => (
    <Card className="border-2">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-2 border-primary/20 relative">
              {userData.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt={userData.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-icon')) {
                      const iconWrapper = document.createElement('div');
                      iconWrapper.className = 'fallback-icon absolute inset-0 flex items-center justify-center';
                      iconWrapper.innerHTML = '<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                      parent.appendChild(iconWrapper);
                    }
                  }}
                />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
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
        {userData.status === "approved" && (onDelete || onEdit) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="default"
                size="sm"
                className="flex-1"
                disabled={isLoading}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="destructive"
                size="sm"
                className={onEdit ? "flex-1" : "w-full"}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
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
            <Dialog 
              open={createProfileOpen} 
              onOpenChange={(open) => {
                setCreateProfileOpen(open);
                if (!open) {
                  // Reset editing state when dialog closes
                  setEditingUserId(null);
                  createProfileForm.reset();
                  setProfileImage(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Bride/Groom Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {editingUserId ? "Edit Profile" : "Create Complete Profile"}
                  </DialogTitle>
                  <DialogDescription>
                    Create a complete profile for a bride or groom with all background information
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <Form {...createProfileForm}>
                    <form onSubmit={createProfileForm.handleSubmit(onCreateProfile)} className="space-y-6 py-4">
                      {createProfileForm.formState.errors.root && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                          {createProfileForm.formState.errors.root.message}
                        </div>
                      )}
                      
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
                          {!editingUserId ? (
                            <>
                              <span className="text-destructive font-semibold">*</span> Upload profile photo (Required - Recommended: Square image, at least 400x400px)
                            </>
                          ) : (
                            "Upload profile photo (Recommended: Square image, at least 400x400px)"
                          )}
                        </p>
                        {!editingUserId && !profileImage && (
                          <p className="text-xs text-destructive text-center">
                            Profile image is required
                          </p>
                        )}
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
                             name="mobile"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Mobile Number *</FormLabel>
                                 <FormControl>
                                   <Input
                                     type="tel"
                                     placeholder="Enter 10-digit mobile number"
                                     maxLength={10}
                                     {...field}
                                     onChange={(e) => {
                                       const value = e.target.value.replace(/\D/g, ''); // Only numbers
                                       // Only allow if first digit is 6, 7, 8, or 9
                                       if (value === '' || /^[6-9]/.test(value)) {
                                         field.onChange(value);
                                       }
                                     }}
                                   />
                                 </FormControl>
                                 <FormMessage />
                                 <p className="text-xs text-muted-foreground">
                                   Mobile number must start with 6, 7, 8, or 9
                                 </p>
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
                                <FormLabel>Password {!editingUserId && "*"}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={editingUserId ? "Leave blank to keep current password" : "Enter password (min. 6 characters)"} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  {editingUserId 
                                    ? "Leave blank to keep the current password unchanged" 
                                    : "This password will be shared with the user for login"}
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
                  <label className="text-sm font-semibold text-muted-foreground">Mobile Number:</label>
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
                      onEdit={() => editUser(userData.id)}
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
