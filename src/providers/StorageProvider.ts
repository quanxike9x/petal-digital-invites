import { supabase } from '../lib/supabase';

/**
 * STORAGE PROVIDER INTERFACE
 * Abstraction layer separating Storage Providers (Supabase, Cloudflare R2, AWS S3, Custom CDN)
 * Strict TypeScript (Zero Any)
 */
export interface StorageProvider {
  name: string;
  getPublicUrl(path: string, bucket?: string): string;
  getOptimizedImageUrl?(path: string, options?: { width?: number; format?: 'webp' | 'avif' }): string;
}

/**
 * SUPABASE STORAGE PROVIDER IMPLEMENTATION
 */
export class SupabaseStorageProvider implements StorageProvider {
  name = 'supabase';
  private defaultBucket = 'template-assets';

  getPublicUrl(path: string, bucket: string = this.defaultBucket): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path; // Fallback for raw URLs
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  getOptimizedImageUrl(path: string, options?: { width?: number; format?: 'webp' | 'avif' }): string {
    const rawUrl = this.getPublicUrl(path);
    if (!options) return rawUrl;
    const widthParam = options.width ? `?w=${options.width}` : '';
    const formatParam = options.format ? `&fmt=${options.format}` : '';
    return `${rawUrl}${widthParam}${formatParam}`;
  }
}

/**
 * CLOUDFLARE R2 STORAGE PROVIDER (PREPARED FOR FUTURE MIGRATION)
 * When migrating to Cloudflare R2, simply set active StorageProvider to CloudflareR2StorageProvider!
 * ZERO TEMPLATE OR COMPONENT CODE CHANGES REQUIRED.
 */
export class CloudflareR2StorageProvider implements StorageProvider {
  name = 'r2';
  private customDomain: string;

  constructor(customDomain: string = 'https://assets.pudwedding.shop') {
    this.customDomain = customDomain;
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.customDomain}/${cleanPath}`;
  }

  getOptimizedImageUrl(path: string, options?: { width?: number; format?: 'webp' | 'avif' }): string {
    const baseUrl = this.getPublicUrl(path);
    if (!options) return baseUrl;
    const widthParam = options.width ? `?width=${options.width}` : '';
    const formatParam = options.format ? `&format=${options.format}` : '';
    return `${baseUrl}${widthParam}${formatParam}`;
  }
}

/**
 * CDN STORAGE PROVIDER (PREPARED FOR FUTURE CDN & IMAGE OPTIMIZATION)
 */
export class CDNStorageProvider implements StorageProvider {
  name = 'cdn';
  private cdnBaseUrl: string;

  constructor(cdnBaseUrl: string = 'https://cdn.pudwedding.shop') {
    this.cdnBaseUrl = cdnBaseUrl;
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.cdnBaseUrl}/${cleanPath}`;
  }

  getOptimizedImageUrl(path: string, options?: { width?: number; format?: 'webp' | 'avif' }): string {
    const baseUrl = this.getPublicUrl(path);
    const fmt = options?.format || 'webp';
    const w = options?.width || 800;
    return `${baseUrl}?w=${w}&fmt=${fmt}&q=85`;
  }
}
