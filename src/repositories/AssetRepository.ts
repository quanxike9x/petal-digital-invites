import { supabase } from '../lib/supabase';
import { type StorageProvider, SupabaseStorageProvider } from '../providers/StorageProvider';

export type AssetType = 'image' | 'gallery' | 'music' | 'video' | 'svg' | 'icon';
export type AssetFolder = 'All' | 'Wedding' | 'Background' | 'Gallery' | 'Music' | 'Icons' | 'Custom';

/**
 * STANDARDIZED ASSET RECORD SCHEMA (DATABASE & REPOSITORY)
 * Stores provider, bucket, path instead of hardcoding raw URLs.
 */
export interface AssetRecord {
  id: string;
  name: string;
  type: AssetType;
  provider: string; // 'supabase' | 'r2' | 's3' | 'cdn'
  bucket: string;
  path: string;
  thumbnail?: string;
  size?: number;
  mime_type?: string;
  folder?: string;
  created_at?: string;
  uploaded_by?: string;
}

const TABLE_NAME = 'assets';
const BUCKET_NAME = 'template-assets';
const LOCAL_STORAGE_KEY = 'pudwedding_media_assets_v2';

// In-memory Asset Cache for synchronous ultra-fast URL resolution in Renderer!
const assetCache = new Map<string, AssetRecord>();

// Preset default assets for instant demonstratable showcase
const PRESET_DEFAULT_ASSETS: AssetRecord[] = [
  {
    id: 'ast-wedding-1',
    name: 'Lễ Thành Hôn Banner',
    type: 'image',
    provider: 'supabase',
    bucket: BUCKET_NAME,
    path: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    folder: 'Wedding',
    size: 245000,
    mime_type: 'image/jpeg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ast-wedding-2',
    name: 'Cô Dâu & Chú Rể Avatar',
    type: 'image',
    provider: 'supabase',
    bucket: BUCKET_NAME,
    path: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
    thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=400',
    folder: 'Wedding',
    size: 180000,
    mime_type: 'image/jpeg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ast-bg-1',
    name: 'Phông Nền Hoa Hồng Vintage',
    type: 'image',
    provider: 'supabase',
    bucket: BUCKET_NAME,
    path: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400',
    folder: 'Background',
    size: 320000,
    mime_type: 'image/jpeg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ast-gallery-1',
    name: 'Album Ảnh Cưới Studio',
    type: 'image',
    provider: 'supabase',
    bucket: BUCKET_NAME,
    path: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400',
    folder: 'Gallery',
    size: 410000,
    mime_type: 'image/jpeg',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ast-music-1',
    name: 'Nhạc Nền I Do - 911',
    type: 'music',
    provider: 'supabase',
    bucket: BUCKET_NAME,
    path: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    thumbnail: '',
    folder: 'Music',
    size: 3500000,
    mime_type: 'audio/mpeg',
    created_at: new Date().toISOString(),
  },
];

// Populate initial cache with default presets
PRESET_DEFAULT_ASSETS.forEach((a) => assetCache.set(a.id, a));

/**
 * REPOSITORY PATTERN: ASSET REPOSITORY (MEDIA LIBRARY)
 * Sole interface resolving assetId -> StorageProvider -> Public URL.
 */
export class AssetRepository {
  private static activeStorageProvider: StorageProvider = new SupabaseStorageProvider();

  /**
   * Switch Storage Provider dynamically (e.g. Supabase, Cloudflare R2, S3, CDN)
   */
  static setStorageProvider(provider: StorageProvider): void {
    console.log(`[AssetRepository] Switched StorageProvider to: "${provider.name}"`);
    this.activeStorageProvider = provider;
  }

  /**
   * RESOLVE URL FROM ASSET ID OR RAW URL
   * Flow: Component (assetId) -> AssetRepository.resolveUrl() -> StorageProvider -> Public URL -> Renderer
   */
  static resolveUrl(assetIdOrUrl?: string): string {
    if (!assetIdOrUrl) return '';

    // If it's already an absolute URL or blob, return directly
    if (
      assetIdOrUrl.startsWith('http://') ||
      assetIdOrUrl.startsWith('https://') ||
      assetIdOrUrl.startsWith('blob:') ||
      assetIdOrUrl.startsWith('data:')
    ) {
      return assetIdOrUrl;
    }

    // Lookup in Cache
    const cachedAsset = assetCache.get(assetIdOrUrl);
    if (cachedAsset) {
      return this.activeStorageProvider.getPublicUrl(cachedAsset.path, cachedAsset.bucket);
    }

    // Fallback: return raw input string
    return assetIdOrUrl;
  }

  /**
   * Get single Asset record by ID
   */
  static async getAssetById(id: string): Promise<AssetRecord | null> {
    if (assetCache.has(id)) {
      return assetCache.get(id)!;
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const record = data as AssetRecord;
        assetCache.set(record.id, record);
        return record;
      }
    } catch {
      // Ignore
    }

    return null;
  }

  /**
   * Fetch asset records from Supabase Database with pagination & filter support
   */
  static async getAssets(folder?: string, search?: string): Promise<AssetRecord[]> {
    console.log(`[AssetRepository] GET ASSETS: folder="${folder}", search="${search}"`);
    let assets: AssetRecord[] = [];

    try {
      let query = supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
      if (folder && folder !== 'All') {
        query = query.eq('folder', folder);
      }
      if (search && search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        assets = data as AssetRecord[];
        assets.forEach((a) => assetCache.set(a.id, a));
      }
    } catch {
      // Fall through
    }

    // LocalStorage Fallback & Presets Sync
    try {
      const storedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      const localAssets: AssetRecord[] = storedStr ? JSON.parse(storedStr) : PRESET_DEFAULT_ASSETS;

      if (assets.length === 0) {
        assets = localAssets;
      } else {
        const existingIds = new Set(assets.map((a) => a.id));
        localAssets.forEach((la) => {
          if (!existingIds.has(la.id)) {
            assets.push(la);
          }
        });
      }
      assets.forEach((a) => assetCache.set(a.id, a));
    } catch {
      if (assets.length === 0) assets = PRESET_DEFAULT_ASSETS;
    }

    // Filter folder & search locally if needed
    if (folder && folder !== 'All') {
      assets = assets.filter((a) => a.folder === folder);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      assets = assets.filter((a) => a.name.toLowerCase().includes(q));
    }

    return assets;
  }

  /**
   * Upload file to Storage & Insert standardized record into Database
   */
  static async uploadAsset(file: File, folder: string = 'Wedding'): Promise<AssetRecord> {
    console.log(`[AssetRepository] UPLOADING FILE: ${file.name}, size: ${file.size}, folder: ${folder}`);

    let assetType: AssetType = 'image';
    if (file.type.startsWith('audio/')) assetType = 'music';
    else if (file.type.startsWith('video/')) assetType = 'video';
    else if (file.type.includes('svg')) assetType = 'svg';

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${folder.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    let publicUrl = '';

    // 1. Upload to Supabase Storage
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        publicUrl = this.activeStorageProvider.getPublicUrl(filePath, BUCKET_NAME);
      }
    } catch (err) {
      console.warn('[AssetRepository] Supabase Storage upload failed, creating object URL fallback:', err);
    }

    if (!publicUrl) {
      publicUrl = URL.createObjectURL(file);
    }

    const newRecord: AssetRecord = {
      id: `ast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: assetType,
      provider: this.activeStorageProvider.name,
      bucket: BUCKET_NAME,
      path: filePath,
      thumbnail: assetType === 'image' ? publicUrl : '',
      size: file.size,
      mime_type: file.type,
      folder,
      created_at: new Date().toISOString(),
    };

    // Cache record
    assetCache.set(newRecord.id, newRecord);

    // 2. Insert into Database
    try {
      await supabase.from(TABLE_NAME).insert(newRecord);
    } catch {
      // Ignore
    }

    this.syncLocalStorage(newRecord);
    return newRecord;
  }

  /**
   * Delete asset record from Database & Storage
   */
  static async deleteAsset(id: string): Promise<boolean> {
    console.log(`[AssetRepository] DELETE ASSET: id="${id}"`);
    assetCache.delete(id);

    try {
      await supabase.from(TABLE_NAME).delete().eq('id', id);
    } catch {
      // Ignore
    }

    try {
      const storedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedStr) {
        const assets: AssetRecord[] = JSON.parse(storedStr);
        const filtered = assets.filter((a) => a.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {
      // Ignore
    }

    return true;
  }

  private static syncLocalStorage(record: AssetRecord): void {
    try {
      const storedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      const assets: AssetRecord[] = storedStr ? JSON.parse(storedStr) : PRESET_DEFAULT_ASSETS;
      assets.unshift(record);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assets));
    } catch {
      // Ignore
    }
  }
}
