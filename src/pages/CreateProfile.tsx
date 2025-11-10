import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Camera, Save, ArrowLeft, Edit } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { uploadImageToSupabase } from "@/utils/supabaseHelpers";
import { compressImage, validateImage } from "@/utils/imageUtils";
import { validateMinimumAge } from "@/utils/ageValidation";
import { supabase } from "@/lib/supabase";

// Create schema with age validation
const createProfileSchema = (profileType: "bride" | "groom") => z.object({
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const ageError = validateMinimumAge(date, profileType);
      return ageError === null;
    }, (date) => {
      const ageError = validateMinimumAge(date, profileType);
      return { message: ageError || "Invalid date of birth" };
    }),
  height: z.string().min(1, "Height is required"),
  education: z.string().min(1, "Education is required"),
  occupation: z.string().min(1, "Occupation is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  religion: z.string().min(1, "Religion is required"),
  motherTongue: z.string().min(1, "Mother tongue is required"),
  familyType: z.string().min(1, "Family type is required"),
  about: z.string().min(50, "Please write at least 50 characters about yourself"),
  phone: z.string().min(10, "Valid phone number is required"),
});

type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const profileSchema = createProfileSchema(user?.profileType || "bride");
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dateOfBirth: "",
      height: "",
      education: "",
      occupation: "",
      city: "",
      state: "",
      religion: "",
      motherTongue: "",
      familyType: "",
      about: "",
      phone: "",
    },
  });

  // Load existing profile data if profile is complete (edit mode)
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsLoadingProfile(true);
      try {
        // Try Supabase first
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && profileData) {
          // Check if profile is complete
          if (profileData.is_profile_complete) {
            setIsEditMode(true);
            
            // Pre-fill form with existing data
            form.reset({
              dateOfBirth: profileData.date_of_birth || "",
              height: profileData.height || "",
              education: profileData.education || "",
              occupation: profileData.occupation || "",
              city: profileData.city || "",
              state: profileData.state || "",
              religion: profileData.religion || "",
              motherTongue: profileData.mother_tongue || "",
              familyType: profileData.family_type || "",
              about: profileData.about || "",
              phone: profileData.phone || "",
            });

            // Set profile image if exists
            if (profileData.profile_image) {
              setProfileImage(profileData.profile_image);
            }
          }
        }
      } catch (err) {
        // Fallback to localStorage
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const userData = storedUsers.find((u: any) => u.id === user.id);
        
        if (userData && userData.isProfileComplete) {
          setIsEditMode(true);
          
          form.reset({
            dateOfBirth: userData.dateOfBirth || userData.date_of_birth || "",
            height: userData.height || "",
            education: userData.education || "",
            occupation: userData.occupation || "",
            city: userData.city || "",
            state: userData.state || "",
            religion: userData.religion || "",
            motherTongue: userData.motherTongue || userData.mother_tongue || "",
            familyType: userData.familyType || userData.family_type || "",
            about: userData.about || "",
            phone: userData.phone || "",
          });

          if (userData.profileImage || userData.profile_image) {
            setProfileImage(userData.profileImage || userData.profile_image);
          }
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image
      const validationError = validateImage(file, 20); // 20MB max
      if (validationError) {
        setError(validationError);
        e.target.value = ''; // Clear input
        return;
      }

      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result as string);
          setError(null); // Clear any previous errors
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setError(err.message || "Failed to load image preview");
        e.target.value = ''; // Clear input
      }
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = profileImage;

      // Upload image to Supabase Storage if it's a base64 string
      if (profileImage && profileImage.startsWith('data:image') && user) {
        try {
          // Convert base64 to file for upload
          const response = await fetch(profileImage);
          const blob = await response.blob();
          
          // Compress image before upload (auto-adjusts based on file size)
          const compressed = await compressImage(
            new File([blob], 'profile.jpg', { type: 'image/jpeg' })
          );
          
          // Convert compressed base64 back to file
          const compressedBlob = await fetch(compressed.data).then(r => r.blob());
          const compressedFile = new File([compressedBlob], 'profile.jpg', { type: 'image/jpeg' });
          
          // Upload to Supabase Storage
          imageUrl = await uploadImageToSupabase(compressedFile, user.id);
        } catch (uploadError: any) {
          console.warn('Failed to upload image to Supabase, using base64 fallback:', uploadError);
          // Keep base64 as fallback
        }
      }

      const profileData = {
        ...data,
        profileImage: imageUrl,
        createdAt: new Date().toISOString(),
      };
      
      await updateProfile(profileData);
      
      // Show success message and navigate
      if (isEditMode) {
        setError(null);
        // Small delay to show success
        setTimeout(() => {
          navigate("/browse");
        }, 500);
      } else {
        navigate("/browse"); // Go to browse profiles after profile creation
      }
    } catch (err: any) {
      console.error("Profile creation error:", err);
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
        <Header />
        <div className="container py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 shadow-warm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading profile...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <Header />
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="border-2 shadow-warm">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-display font-bold text-center">
                {isEditMode ? (
                  <>
                    <Edit className="inline-block mr-2 h-6 w-6" />
                    Edit Your Profile
                  </>
                ) : (
                  "Create Your Profile"
                )}
              </CardTitle>
              <CardDescription className="text-center text-base">
                {isEditMode 
                  ? "Update your profile information. All fields are required."
                  : "Help others find you by completing your profile. All fields are required."
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                      {error}
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
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Upload your profile photo (Recommended: Square image, at least 400x400px)
                    </p>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-12 text-base"
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - (user?.profileType === "bride" ? 18 : 21))).toISOString().split('T')[0]}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum age: {user?.profileType === "bride" ? "18" : "21"} years
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Height</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Education</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base">
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
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Occupation</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your occupation"
                                className="h-12 text-base"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
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
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your city"
                                className="h-12 text-base"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base">
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
                        control={form.control}
                        name="religion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Religion</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base">
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
                        control={form.control}
                        name="motherTongue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Mother Tongue</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base">
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
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="familyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Family Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
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
                    <h3 className="text-lg font-semibold border-b pb-2">About You</h3>
                    
                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">About Yourself</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself, your interests, hobbies, and what you're looking for in a life partner..."
                              className="min-h-[120px] text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Write at least 50 characters. This helps others get to know you better.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 h-12 text-base"
                      onClick={() => navigate("/")}
                    >
                      Skip for now
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="flex-1 h-12 text-base font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          {isEditMode ? "Update Profile" : "Save Profile"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
