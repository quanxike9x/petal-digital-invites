import type { Invitation, Template, Guest, CustomDomain, Payment, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@pudwedding.shop',
    full_name: 'Quản Trị Viên (Admin)',
    role: 'admin',
    created_at: new Date().toISOString(),
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'active'
  }
];

export const mockTemplates: Template[] = [
  {
    id: 'tpl-song-hy-green',
    name: 'Song Hỷ Green',
    slug: 'song-hy-green',
    category: 'Traditional',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    preview_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    layout_json: {
      version: "2.0.0",
      canvas: { width: 375, defaultHeight: 1800 },
      sections: [{ id: "sec-1", name: "Header", height: 600, bgColor: "#064e3b" }],
      widgets: [{ id: "w-1", type: "text", content: "Song Hỷ Green Wedding", x: 40, y: 100, width: 295, height: 60 }]
    },
    template_json: { sections: [], components: [] },
    status: 'published',
    is_active: true,
    is_premium: false,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-luxury-gold',
    name: 'Luxury Gold',
    slug: 'luxury-gold',
    category: 'Luxury',
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
    thumbnail_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
    preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
    preview_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
    layout_json: {
      version: "2.0.0",
      canvas: { width: 375, defaultHeight: 1800 },
      sections: [{ id: "sec-1", name: "Header", height: 600, bgColor: "#78350f" }],
      widgets: [{ id: "w-1", type: "text", content: "Luxury Gold Royal Wedding", x: 40, y: 100, width: 295, height: 60 }]
    },
    template_json: { sections: [], components: [] },
    status: 'published',
    is_active: true,
    is_premium: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-minimal-white',
    name: 'Minimal White',
    slug: 'minimal-white',
    category: 'Minimalist',
    thumbnail: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600',
    thumbnail_url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600',
    preview: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200',
    preview_url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200',
    layout_json: {
      version: "2.0.0",
      canvas: { width: 375, defaultHeight: 1800 },
      sections: [{ id: "sec-1", name: "Header", height: 600, bgColor: "#ffffff" }],
      widgets: [{ id: "w-1", type: "text", content: "Minimal White Pure Love", x: 40, y: 100, width: 295, height: 60 }]
    },
    template_json: { sections: [], components: [] },
    status: 'draft',
    is_active: false,
    is_premium: false,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Cleaned Data Lists (All 0 by default, generated from real users)
export const mockInvitations: Invitation[] = [];
export const mockGuests: Guest[] = [];
export const mockDomains: CustomDomain[] = [];
export const mockPayments: Payment[] = [];
