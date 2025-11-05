import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { Heart, UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpg";
import Header from "@/components/Header";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string()
    .min(10, "Mobile number must be exactly 10 digits")
    .max(10, "Mobile number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Mobile number must start with 6, 7, 8, or 9 and be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  profileType: z.enum(["bride", "groom"], {
    required_error: "Please select whether you are a bride or groom",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      profileType: undefined,
    },
  });

  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Use mobile number as email identifier for backward compatibility
      await registerUser(data.mobile, data.password, data.name, data.profileType);
      // Registration successful - user needs admin approval
      setSuccess(true);
      form.reset();
    } catch (err: any) {
      if (err.message === "REGISTRATION_SUCCESS") {
        setSuccess(true);
        form.reset();
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background relative">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
        <img 
          src={logo} 
          alt="BanjaraVivah" 
          className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] object-contain"
        />
      </div>
      
      <Header />
      <div className="container py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="border-2 shadow-warm">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img src={logo} alt="BanjaraVivah" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-primary" />
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-display font-bold">Create Your Account</CardTitle>
                <CardDescription className="text-base mt-2">
                  Join thousands of Banjara families finding their perfect match
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {success && (
                    <div className="bg-green-50 text-green-800 text-sm p-4 rounded-lg border border-green-200">
                      <div className="font-semibold mb-2">Registration Submitted Successfully!</div>
                      <p className="text-sm">
                        Your registration has been submitted and is pending admin approval. 
                        You will be notified once your account is approved. 
                        Please check back later or contact admin for status updates.
                      </p>
                    </div>
                  )}
                  {error && !success && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="profileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">I am a</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select your profile type" />
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
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
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
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter your 10-digit mobile number"
                            className="h-12 text-base"
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Mobile number must start with 6, 7, 8, or 9
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password (min. 6 characters)"
                              className="h-12 text-base pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter your password"
                              className="h-12 text-base pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoading || success}
                  >
                    {isLoading ? (
                      "Submitting..."
                    ) : success ? (
                      "Submitted ✓"
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
                {success && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <Link to="/" className="text-primary font-semibold hover:underline">
                      Return to Home
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
