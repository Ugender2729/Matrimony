import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  profileType: "bride" | "groom";
  isProfileComplete: boolean;
  status: "pending" | "approved" | "rejected";
  role?: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, profileType: "bride" | "groom") => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Verify user still exists and is approved
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = storedUsers.find((u: any) => u.id === userData.id);
      if (foundUser && (foundUser.role === "admin" || foundUser.status === "approved")) {
        setUser({
          ...userData,
          status: foundUser.status || "pending",
          role: foundUser.role || "user",
        });
      } else {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (mobile: string, password: string) => {
    // In a real app, this would be an API call
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check for admin credentials (admin uses mobile number)
    const isAdminCredentials = 
      mobile === "9381493260" && 
      password === "9398601984";
    
    // If admin credentials match, create or update admin user
    if (isAdminCredentials) {
      let adminUser = storedUsers.find(
        (u: any) => (u.mobile === mobile || u.email === mobile) && u.role === "admin"
      );

      // Create admin user if it doesn't exist
      if (!adminUser) {
        adminUser = {
          id: "admin-1",
          email: "9381493260", // Store mobile in email field for backward compatibility
          mobile: "9381493260",
          password: "9398601984",
          name: "Admin",
          profileType: "groom",
          isProfileComplete: true,
          status: "approved",
          role: "admin",
          createdAt: new Date().toISOString(),
        };
        storedUsers.push(adminUser);
        localStorage.setItem("users", JSON.stringify(storedUsers));
      } else {
        // Ensure admin user has correct role and status
        adminUser.role = "admin";
        adminUser.status = "approved";
        adminUser.isProfileComplete = true;
        adminUser.mobile = "9381493260";
        adminUser.email = "9381493260"; // Update email field for backward compatibility
        const userIndex = storedUsers.findIndex((u: any) => u.id === adminUser.id);
        if (userIndex !== -1) {
          storedUsers[userIndex] = adminUser;
          localStorage.setItem("users", JSON.stringify(storedUsers));
        }
      }

      const userData: User = {
        id: adminUser.id,
        email: adminUser.email || adminUser.mobile,
        name: adminUser.name,
        profileType: adminUser.profileType,
        isProfileComplete: adminUser.isProfileComplete || true,
        status: "approved" as const,
        role: "admin",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return;
    }
    
    // Regular user login - search by mobile number (stored in email or mobile field)
    let foundUser = storedUsers.find(
      (u: any) => (u.mobile === mobile || u.email === mobile) && u.password === password
    );

    if (foundUser) {
      // Check if user is approved (unless admin)
      if (foundUser.role !== "admin" && foundUser.status !== "approved") {
        if (foundUser.status === "pending") {
          throw new Error("Your account is pending approval. Please wait for admin approval.");
        } else if (foundUser.status === "rejected") {
          throw new Error("Your account has been rejected. Please contact admin.");
        }
      }

      const userData = {
        id: foundUser.id,
        email: foundUser.email || foundUser.mobile,
        name: foundUser.name,
        profileType: foundUser.profileType,
        isProfileComplete: foundUser.isProfileComplete || false,
        status: foundUser.status || "pending",
        role: foundUser.role || "user",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      throw new Error("Invalid mobile number or password");
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    profileType: "bride" | "groom"
  ) => {
    // In a real app, this would be an API call
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if user already exists (by mobile/email)
    if (storedUsers.some((u: any) => u.email === email || u.mobile === email)) {
      throw new Error("User with this mobile number already exists");
    }

    const newUser = {
      id: Date.now().toString(),
      email, // Storing mobile number in email field for backward compatibility
      mobile: email, // Also store in mobile field
      password, // In production, this should be hashed
      name,
      profileType,
      isProfileComplete: false,
      status: "pending", // New users need admin approval
      role: "user",
      createdAt: new Date().toISOString(),
    };

    storedUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(storedUsers));

    // Don't auto-login new users - they need approval first
    // Show success message instead
    throw new Error("REGISTRATION_SUCCESS");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = (profileData: any) => {
    if (user) {
      const updatedUser = { ...user, ...profileData, isProfileComplete: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Also update in users array
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...profileData, isProfileComplete: true };
        localStorage.setItem("users", JSON.stringify(storedUsers));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

