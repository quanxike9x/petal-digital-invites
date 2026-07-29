export type Role = 'admin' | 'customer';

export type InvitationStatus = 'draft' | 'published' | 'archived';
export type PaymentStatus = 'trial' | 'pending' | 'paid' | 'expired' | 'cancelled';

export interface PaymentOrder {
  id: string;
  order_code: string; // e.g. "PWD-INV-000123"
  invitation_id: string;
  invitation_title: string;
  user_id: string;
  user_name: string;
  user_email: string;
  package_name: 'Standard' | 'Pro' | 'VIP';
  amount: number; // e.g. 199000
  currency: 'VND';
  status: PaymentStatus;
  created_at: string;
  paid_at?: string;
  verified_by?: string;
}

export type GuestRSVPStatus = 'pending' | 'attending' | 'declined';
export type GuestStatus = 'unopened' | 'opened' | 'sent';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  created_at: string;
  status?: 'active' | 'inactive';
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: string; // e.g. 'Luxury', 'Minimalist', 'Traditional', 'Modern'
  description?: string;
  thumbnail_url: string;
  preview_url?: string;
  template_json: {
    sections?: any[];
    components?: any[];
    styles?: Record<string, any>;
    layout?: Record<string, any>;
    animations?: Record<string, any>;
    bindings?: Record<string, any>;
    settings?: {
      primary_color?: string;
      cover_url?: string;
      favicon_url?: string;
      [key: string]: any;
    };
    metadata?: Record<string, any>;
    [key: string]: any;
  };
  version?: number;
  status?: 'draft' | 'published';
  is_premium: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;

  // Frontend virtual/derived properties for backward compatibility
  version_label?: string;
  components?: any[];
  primary_color?: string;
  cover_url?: string;
  favicon_url?: string;
  is_active?: boolean;
}

export interface Invitation {
  // 12 STRICT DATABASE COLUMNS IN public.invitations SCHEMA
  id: string;
  template_id: string;
  created_by: string;
  title: string;
  slug: string;
  invitation_json: {
    bride_name?: string;
    bride_parent?: string;
    groom_name?: string;
    groom_parent?: string;
    story?: string;
    wedding_date?: string;
    ceremony_time?: string;
    reception_time?: string;
    venue_name?: string;
    address?: string;
    google_map?: string;
    gallery?: string[];
    videos?: string[];
    music?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    groom_bank_name?: string;
    groom_account_name?: string;
    groom_account_number?: string;
    bride_bank_name?: string;
    bride_account_name?: string;
    bride_account_number?: string;
    qr_image?: string;
    theme_color?: string;
    font?: string;
    auto_approve_wishes?: boolean;
    sections?: any[];
    components?: any[];
    styles?: Record<string, any>;
    layout?: Record<string, any>;
    animations?: Record<string, any>;
    settings?: Record<string, any>;
    [key: string]: any;
  };
  status: InvitationStatus;
  is_trial?: boolean;
  expires_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;

  // Virtual / Derived Properties for Frontend Backward Compatibility
  user_id?: string;
  bride_name?: string;
  bride_parent?: string;
  groom_name?: string;
  groom_parent?: string;
  story?: string;
  wedding_date?: string;
  ceremony_time?: string;
  reception_time?: string;
  venue_name?: string;
  address?: string;
  google_map?: string;
  gallery?: string[];
  music?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  groom_bank_name?: string;
  groom_account_name?: string;
  groom_account_number?: string;
  bride_bank_name?: string;
  bride_account_name?: string;
  bride_account_number?: string;
  qr_image?: string;
  theme_color?: string;
  font?: string;
  payment_status?: PaymentStatus;
  trial_start?: string;
  trial_end?: string;
  paid_at?: string;
  days_left?: number;
  is_expired?: boolean;
  domain_id?: string;
  views_count?: number;
  thumbnail_url?: string;
  auto_approve_wishes?: boolean;
}

export interface RSVPRecord {
  id: string;
  invitation_id: string;
  guest_id?: string;
  guest_name: string;
  phone?: string;
  attendance_status: GuestRSVPStatus;
  attendee_count: number;
  note?: string;
  created_at: string;
}

export interface WishRecord {
  id: string;
  invitation_id: string;
  guest_id?: string;
  guest_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  guest_name: string;
  guest_slug: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  group: string; // 'Nhà trai', 'Nhà gái', 'Bạn bè', 'Đồng nghiệp', 'Họ hàng', 'Khác' or custom
  note?: string;
  status: GuestStatus;
  qr_url: string;
  personal_url: string;
  viewed_at?: string;
  opened_count: number;
  rsvp_status: GuestRSVPStatus;
  rsvp_count?: number;
  wish?: string;
  wish_approved?: boolean;
  rsvp_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationPayload {
  template_id: string;
  bride_name: string;
  groom_name: string;
}

export interface Payment {
  id: string;
  user_id: string;
  invitation_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  transaction_ref: string;
  plan_name: string;
  created_at: string;
}

export type MediaType = 'image' | 'video' | 'music';

export interface MediaItem {
  id: string;
  invitation_id: string;
  type: MediaType;
  file_name: string;
  storage_path: string;
  public_url: string;
  thumbnail_url?: string;
  medium_url?: string;
  size: number;
  mime_type: string;
  sort_order: number;
  caption?: string;
  is_cover?: boolean;
  is_default?: boolean;
  settings?: {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    volume?: number;
  };
  created_at: string;
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type BrowserType = 'Chrome' | 'Safari' | 'Edge' | 'Firefox' | 'Other';
export type OSType = 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Other';
export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface PageViewRecord {
  id: string;
  invitation_id: string;
  guest_id?: string;
  device_type: DeviceType;
  browser: BrowserType;
  os: OSType;
  created_at: string;
}

export interface TimeSeriesPoint {
  date: string; // e.g. "25/07"
  value: number;
}

export interface InvitationAnalyticsData {
  views: {
    total: number;
    today: number;
    week: number;
    month: number;
    timeSeries: TimeSeriesPoint[];
  };
  guests: {
    total: number;
    opened: number;
    unopened: number;
    rsvped: number;
    unrsvped: number;
  };
  rsvp: {
    attending: number;
    declined: number;
    pending: number;
    totalHeadcount: number;
    timeSeries: TimeSeriesPoint[];
  };
  wishes: {
    total: number;
    today: number;
    timeSeries: TimeSeriesPoint[];
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: {
    chrome: number;
    safari: number;
    edge: number;
    firefox: number;
    other: number;
  };
  os: {
    android: number;
    ios: number;
    windows: number;
    macos: number;
    other: number;
  };
}
