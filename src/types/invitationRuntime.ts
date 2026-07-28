/**
 * INVITATION RUNTIME TYPES (STRICT TYPES - ZERO ANY)
 */

export interface TimelineEventData {
  time: string;
  title: string;
  location?: string;
}

export interface QRInformationData {
  bankName: string;
  accountNo: string;
  accountName: string;
}

export interface InvitationData {
  groom_name?: string;
  bride_name?: string;
  wedding_date?: string;
  venue_name?: string;
  venue_address?: string;
  love_story?: string;
  wedding_quote?: string;
  bride_avatar?: string;
  groom_avatar?: string;
  cover_image?: string;
  background_image?: string;
  gallery_images?: string[];
  timeline_events?: TimelineEventData[];
  map_url?: string;
  background_music?: string;
  qr_information?: QRInformationData;
  [key: string]: unknown;
}

/**
 * DEFAULT PREVIEW DATA FOR RUNTIME TESTING
 */
export const DEFAULT_PREVIEW_INVITATION_DATA: InvitationData = {
  groom_name: 'Trần Minh Phong',
  bride_name: 'Nguyễn Quỳnh Hoa',
  wedding_date: '2026-10-24',
  venue_name: 'Trung Tâm Tiệc Cưới Hoàng Gia',
  venue_address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  love_story: 'Hành trình 5 năm gắn kết và cùng nhau viết tiếp trang mới...',
  wedding_quote: 'Tình yêu không phải là nhìn nhau, mà là cùng nhìn về một hướng.',
  bride_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
  groom_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  cover_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
  background_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
  gallery_images: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600',
  ],
  background_music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  map_url: 'https://maps.google.com/?q=10.7769,106.7009',
  timeline_events: [
    { time: '07:30', title: 'Lễ Vu Quy (Nhà Gái)', location: 'Tư Gia Cô Dâu' },
    { time: '11:00', title: 'Lễ Thành Hôn (Nhà Trai)', location: 'Tư Gia Chú Rể' },
    { time: '11:30', title: 'Tiệc Cưới Trọng Thể', location: 'Trung Tâm Hoàng Gia' },
  ],
  qr_information: {
    bankName: 'MB Bank',
    accountNo: '1018920192',
    accountName: 'TRAN MINH PHONG',
  },
};
