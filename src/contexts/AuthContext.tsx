import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { dbUserToUser, uploadImageToSupabase } from "@/utils/supabaseHelpers";
import { compressImage } from "@/utils/imageUtils";
import type { DatabaseUser } from "@/lib/supabase";

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
  login: (email: string, password: string, expectedProfileType?: "bride" | "groom" | "none") => Promise<void>;
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
    // Check if user is logged in from localStorage (fallback)
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

  const login = async (mobile: string, password: string, expectedProfileType?: "bride" | "groom" | "none") => {
    // Check for admin credentials (admin uses mobile number)
    const isAdminCredentials = 
      mobile === "9381493260" && 
      password === "9398601984";
    
    try {
      // Try Supabase first - query the appropriate table based on expectedProfileType
      let dbUser: DatabaseUser | null = null;
      
      if (expectedProfileType === "bride") {
        // Only search in brides table
        const { data: brides, error: bridesError } = await supabase
          .from('brides')
          .select('*')
          .or(`mobile.eq.${mobile},email.eq.${mobile}`)
          .eq('password', password)
          .limit(1);

        if (!bridesError && brides && brides.length > 0) {
          dbUser = brides[0] as DatabaseUser;
        }
      } else if (expectedProfileType === "groom") {
        // Only search in grooms table
        const { data: grooms, error: groomsError } = await supabase
          .from('grooms')
          .select('*')
          .or(`mobile.eq.${mobile},email.eq.${mobile}`)
          .eq('password', password)
          .limit(1);

        if (!groomsError && grooms && grooms.length > 0) {
          dbUser = grooms[0] as DatabaseUser;
        }
      } else {
        // No expected type - search both tables (for backward compatibility)
        const { data: brides, error: bridesError } = await supabase
          .from('brides')
          .select('*')
          .or(`mobile.eq.${mobile},email.eq.${mobile}`)
          .eq('password', password)
          .limit(1);

        if (!bridesError && brides && brides.length > 0) {
          dbUser = brides[0] as DatabaseUser;
        } else {
          // Try grooms table
          const { data: grooms, error: groomsError } = await supabase
            .from('grooms')
            .select('*')
            .or(`mobile.eq.${mobile},email.eq.${mobile}`)
            .eq('password', password)
            .limit(1);

          if (!groomsError && grooms && grooms.length > 0) {
            dbUser = grooms[0] as DatabaseUser;
          }
        }
      }

      if (dbUser) {
        // Check if user is approved (unless admin)
        if (dbUser.role !== "admin" && dbUser.status !== "approved") {
          if (dbUser.status === "pending") {
            throw new Error("Your account is pending approval. Please wait for admin approval.");
          } else if (dbUser.status === "rejected") {
            throw new Error("Your account has been rejected. Please contact admin.");
          }
        }

        const userData = dbUserToUser(dbUser);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return;
      }
    } catch (supabaseError: any) {
      // Only fallback if it's not a user-facing error
      if (supabaseError.message && (
        supabaseError.message.includes("pending approval") || 
        supabaseError.message.includes("rejected")
      )) {
        throw supabaseError; // Re-throw user-facing errors
      }
      // Fallback to localStorage if Supabase fails
      console.warn('Supabase login failed, using localStorage fallback:', supabaseError);
    }

    // Fallback to localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // If admin credentials match, create or update admin user
    if (isAdminCredentials) {
      let adminUser = storedUsers.find(
        (u: any) => (u.mobile === mobile || u.email === mobile) && u.role === "admin"
      );

      // Create admin user if it doesn't exist
      if (!adminUser) {
        adminUser = {
          id: "admin-1",
          email: "9381493260",
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
        adminUser.role = "admin";
        adminUser.status = "approved";
        adminUser.isProfileComplete = true;
        adminUser.mobile = "9381493260";
        adminUser.email = "9381493260";
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
    
    // Regular user login - search by mobile number
    let foundUser = storedUsers.find(
      (u: any) => (u.mobile === mobile || u.email === mobile) && u.password === password
    );

    if (foundUser) {
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
    try {
      // Try Supabase first
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .or(`mobile.eq.${email},email.eq.${email}`)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error("User with this mobile number already exists");
      }

      // Insert new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email,
          mobile: email,
          password: password, // In production, this should be hashed
          name: name,
          profile_type: profileType,
          is_profile_complete: false,
          status: 'pending',
          role: 'user',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Don't auto-login new users - they need approval first
      throw new Error("REGISTRATION_SUCCESS");
    } catch (supabaseError: any) {
      // Fallback to localStorage
      if (supabaseError.message === "REGISTRATION_SUCCESS") {
        throw supabaseError; // Re-throw success message
      }
      
      console.warn('Supabase registration failed, using localStorage fallback:', supabaseError);
      
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      
      if (storedUsers.some((u: any) => u.email === email || u.mobile === email)) {
        throw new Error("User with this mobile number already exists");
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        mobile: email,
        password,
        name,
        profileType,
        isProfileComplete: false,
        status: "pending",
        role: "user",
        createdAt: new Date().toISOString(),
      };

      storedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(storedUsers));
      throw new Error("REGISTRATION_SUCCESS");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return;

    try {
      // Upload image to Supabase Storage if it's a base64 string
      let imageUrl = profileData.profileImage;
      if (profileData.profileImage && profileData.profileImage.startsWith('data:image')) {
        try {
          // Convert base64 to file for upload
          const response = await fetch(profileData.profileImage);
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

      // Try Supabase first
      const updateData: any = {
        ...profileData,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      // Map frontend field names to database field names
      if (imageUrl) updateData.profile_image = imageUrl;
      if (profileData.profileImages) updateData.profile_images = profileData.profileImages;
      if (profileData.dateOfBirth) updateData.date_of_birth = profileData.dateOfBirth;
      if (profileData.motherTongue) updateData.mother_tongue = profileData.motherTongue;
      if (profileData.familyType) updateData.family_type = profileData.familyType;
      if (profileData.height) updateData.height = profileData.height;
      if (profileData.education) updateData.education = profileData.education;
      if (profileData.occupation) updateData.occupation = profileData.occupation;
      if (profileData.salary) updateData.salary = profileData.salary;
      if (profileData.city) updateData.city = profileData.city;
      if (profileData.state) updateData.state = profileData.state;
      if (profileData.religion) updateData.religion = profileData.religion;
      if (profileData.about) updateData.about = profileData.about;
      if (profileData.phone) updateData.phone = profileData.phone;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh user data
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedUser) {
        const userData = dbUserToUser(updatedUser as DatabaseUser);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (supabaseError) {
      // Fallback to localStorage
      console.warn('Supabase update failed, using localStorage fallback:', supabaseError);
      
      const updatedUser = { ...user, ...profileData, isProfileComplete: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
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

