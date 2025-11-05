// Initialize admin account if it doesn't exist
// This should be called once or can be done manually

export const initAdmin = () => {
  const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
  
  // Check if admin already exists
  const adminExists = storedUsers.some((u: any) => u.role === "admin");
  
  // Check if admin with specific credentials exists
  const specificAdminExists = storedUsers.some(
    (u: any) => (u.mobile === "9381493260" || u.email === "9381493260") && u.role === "admin"
  );
  
  if (!specificAdminExists) {
    const adminUser = {
      id: "admin-" + Date.now(),
      email: "9381493260", // Store mobile in email field for backward compatibility
      mobile: "9381493260",
      password: "9398601984", // In production, this should be hashed
      name: "Admin",
      profileType: "groom",
      isProfileComplete: true,
      status: "approved",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    
    storedUsers.push(adminUser);
    localStorage.setItem("users", JSON.stringify(storedUsers));
    
    return true;
  }
  
  // Remove old admin if exists (with old email)
  const oldAdminIndex = storedUsers.findIndex(
    (u: any) => u.email === "ugenderdharavath1@gmail.com" || u.email === "admin@banjaravivah.com"
  );
  if (oldAdminIndex !== -1) {
    storedUsers.splice(oldAdminIndex, 1);
    localStorage.setItem("users", JSON.stringify(storedUsers));
  }
  
  return false;
};

// Call this on app initialization
if (typeof window !== "undefined") {
  initAdmin();
}
