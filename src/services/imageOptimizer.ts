/**
 * Multi-resolution image compression engine using HTML5 Canvas API.
 * Automatically generates 3 optimized image tiers:
 * - Thumbnail: 200px max dimension (used in Dashboard & Gallery grid thumbs)
 * - Medium: 800px max dimension (used in device preview pane & mobile website)
 * - Original: Compressed full resolution (used for high-DPI displays & downloads)
 */

export interface OptimizedImageResult {
  thumbnailUrl: string;
  mediumUrl: string;
  originalUrl: string;
}

const resizeFileToDataUrl = (file: File, maxDimension: number, quality: number = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP encoding first, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Lỗi khi đọc file ảnh!'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi khi nạp file ảnh!'));
    reader.readAsDataURL(file);
  });
};

export const imageOptimizer = {
  /**
   * Generates 3 compressed image tiers (Thumbnail 200px, Medium 800px, Original 1600px)
   */
  processImageTiers: async (file: File): Promise<OptimizedImageResult> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('File được chọn không phải là định dạng ảnh hợp lệ!');
    }

    try {
      const [thumbnailUrl, mediumUrl, originalUrl] = await Promise.all([
        resizeFileToDataUrl(file, 200, 0.8),
        resizeFileToDataUrl(file, 800, 0.85),
        resizeFileToDataUrl(file, 1600, 0.9),
      ]);

      return {
        thumbnailUrl,
        mediumUrl,
        originalUrl,
      };
    } catch (e) {
      // Fallback: Return raw data URL if canvas encoding fails
      const rawDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target?.result as string);
        reader.readAsDataURL(file);
      });

      return {
        thumbnailUrl: rawDataUrl,
        mediumUrl: rawDataUrl,
        originalUrl: rawDataUrl,
      };
    }
  },
};
