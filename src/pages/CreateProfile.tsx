import { useState } from "react";
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
import { Upload, Camera, Save, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const profileSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
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

type ProfileFormValues = z.infer<typeof profileSchema>;

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const profileData = {
        ...data,
        profileImage,
        createdAt: new Date().toISOString(),
      };
      updateProfile(profileData);
      navigate("/browse"); // Go to browse profiles after profile creation
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
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
                Create Your Profile
              </CardTitle>
              <CardDescription className="text-center text-base">
                Help others find you by completing your profile. All fields are required.
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
                                {...field}
                              />
                            </FormControl>
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
                          Save Profile
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
