import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, ArrowLeft, Heart, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpg";
import Header from "@/components/Header";

const loginSchema = z.object({
  mobile: z.string()
    .min(10, "Mobile number must be exactly 10 digits")
    .max(10, "Mobile number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Mobile number must start with 6, 7, 8, or 9 and be 10 digits"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["bride", "groom", "none"], {
    required_error: "Please select user type",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: "",
      password: "",
      userType: "none",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // If admin login (userType is "none"), proceed with normal login
      if (data.userType === "none") {
        await login(data.mobile, data.password);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Check if user is admin
        if (user.role === "admin") {
          navigate("/admin/dashboard");
          return;
        } else {
          setError("Invalid admin credentials");
          return;
        }
      }

      // For bride/groom login, validate userType matches profile
      await login(data.mobile, data.password, data.userType);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Verify profileType matches selected userType
      if (user.profileType !== data.userType) {
        setError(`This account is registered as a ${user.profileType}, not a ${data.userType}. Please select the correct option.`);
        return;
      }
      
      // Check if user is admin
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.isProfileComplete) {
        navigate("/browse"); // Go to browse profiles page
      } else {
        navigate("/profile/create"); // Complete profile first
      }
    } catch (err: any) {
      setError(err.message || "Invalid mobile number or password");
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
                    <LogIn className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-display font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-base mt-2">
                  Sign in to your account to continue your journey
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">I am a</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bride">Bride</SelectItem>
                            <SelectItem value="groom">Groom</SelectItem>
                            <SelectItem value="none">None (Admin)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select "None" for admin login
                        </FormDescription>
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
                              placeholder="Enter your password"
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

                  <div className="flex items-center justify-between">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Signing in..."
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-semibold hover:underline">
                    Register for free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
