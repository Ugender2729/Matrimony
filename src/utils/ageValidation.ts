/**
 * Age validation utilities
 */

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validate minimum age based on profile type
 * @param dateOfBirth - Date of birth string (YYYY-MM-DD)
 * @param profileType - "bride" or "groom"
 * @returns Error message if invalid, null if valid
 */
export const validateMinimumAge = (
  dateOfBirth: string,
  profileType: "bride" | "groom"
): string | null => {
  if (!dateOfBirth) {
    return "Date of birth is required";
  }

  const age = calculateAge(dateOfBirth);
  const minAge = profileType === "bride" ? 18 : 21;
  
  if (age < minAge) {
    return `Minimum age for ${profileType === "bride" ? "brides" : "grooms"} is ${minAge} years. You are currently ${age} years old.`;
  }

  return null;
};




