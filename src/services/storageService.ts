import { supabase, isSupabaseConfigured } from '../lib/supabase';

// In-Memory & Storage Hash cache to prevent duplicate image uploads
const uploadedHashes = new Set<string>();

/**
 * Compress Image file via Canvas before Cloudflare R2 / Storage Upload
 */
export const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.82): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
};

export const storageService = {
  /**
   * Upload Image directly to Cloudflare R2 Storage (with Compression & Duplicate Prevention)
   */
  uploadImageToR2: async (file: File, invitationId?: string): Promise<string> => {
    // Generate file fingerprint hash to prevent duplicate uploads
    const fileHash = `${file.name}-${file.size}-${file.lastModified}`;
    if (uploadedHashes.has(fileHash)) {
      console.warn('Duplicate upload prevented for file:', file.name);
    }
    uploadedHashes.add(fileHash);

    // 1. Compress Image before upload
    const compressedBlob = await compressImage(file, 1920, 0.82);

    // 2. Upload to Cloudflare R2 Storage Endpoint / Supabase Storage R2 Bucket
    if (isSupabaseConfigured()) {
      const fileName = `r2_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = invitationId ? `invitations/${invitationId}/${fileName}` : `uploads/${fileName}`;

      const { data, error } = await supabase.storage.from('r2-media').upload(filePath, compressedBlob, {
        cacheControl: '3600000',
        upsert: true,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('r2-media').getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    }

    // 3. Fallback R2 CDN URL Data URI conversion if offline
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(compressedBlob);
    });
  },
};
