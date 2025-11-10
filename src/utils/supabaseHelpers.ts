import { supabase } from '@/lib/supabase';
import type { DatabaseUser } from '@/lib/supabase';

/**
 * Convert Supabase database user to frontend User format
 */
export const dbUserToUser = (dbUser: DatabaseUser) => ({
  id: dbUser.id,
  email: dbUser.email || dbUser.mobile,
  name: dbUser.name,
  profileType: dbUser.profile_type,
  isProfileComplete: dbUser.is_profile_complete,
  status: dbUser.status,
  role: dbUser.role || 'user',
  mobile: dbUser.mobile,
});

/**
 * Upload image to Supabase Storage
 */
export const uploadImageToSupabase = async (
  file: File,
  userId: string,
  folder: string = 'profiles'
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Compress image before upload (optional - you can use the imageUtils)
  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImageFromSupabase = async (imageUrl: string): Promise<void> => {
  // Extract file path from URL
  const urlParts = imageUrl.split('/profile-images/');
  if (urlParts.length !== 2) {
    throw new Error('Invalid image URL');
  }

  const filePath = `profiles/${urlParts[1]}`;

  const { error } = await supabase.storage
    .from('profile-images')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Supabase Storage
 */
export const uploadMultipleImagesToSupabase = async (
  files: File[],
  userId: string,
  folder: string = 'profiles'
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}-${index}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    return supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
  });

  const results = await Promise.all(uploadPromises);

  // Check for errors
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    throw new Error(`Failed to upload ${errors.length} image(s)`);
  }

  // Get public URLs
  const urls = results.map((result, index) => {
    const fileExt = files[index].name.split('.').pop();
    const fileName = `${userId}-${Date.now()}-${index}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return publicUrl;
  });

  return urls;
};




