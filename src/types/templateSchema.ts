/**
 * TEMPLATE JSON SCHEMA SPECIFICATION (v2.0)
 * Layout JSON Structure for Wedding Invitation Platform
 */

export interface TemplateWidgetConfig {
  id: string;
  type: 
    | 'text' 
    | 'image' 
    | 'gallery' 
    | 'button' 
    | 'countdown' 
    | 'maps' 
    | 'vietqr' 
    | 'music' 
    | 'video' 
    | 'timeline' 
    | 'calendar' 
    | 'full_effects' 
    | 'popup' 
    | 'divider'
    | 'rsvp';
  label?: string;
  binding?: string; // e.g. 'groom_and_bride', 'wedding_date', 'google_map'
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  zIndex: number;
  content?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    padding?: number;
    letterSpacing?: number;
    lineHeight?: number;
    textShadow?: string;
    boxShadow?: string;
    objectFit?: 'cover' | 'contain' | 'fill';
    opacity?: number;
  };
  settings?: {
    // Media & Gallery
    images?: string[];
    autoplay?: boolean;
    loop?: boolean;
    volume?: number;
    mode?: 'grid' | 'carousel' | 'slider';
    
    // Maps & Coordinates
    lat?: number | string;
    lng?: number | string;
    zoom?: number;

    // Calendar & Countdown
    lunarDateText?: string;
    solarDateText?: string;
    highlightDay?: number;
    onExpireAction?: 'stop' | 'hide' | 'show_message';

    // Effects & Popup
    effectType?: string;
    density?: number;
    speed?: number;
    title?: string;

    // Music Pinning
    pinPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'none';

    // Interactions & Animations
    eventTrigger?: 'click' | 'hover' | 'scroll' | 'none';
    onClickAction?: 'popup' | 'link' | 'music' | 'scroll' | 'none';
    linkUrl?: string;
    animationType?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate' | 'flip' | 'none';
    animationDelay?: number;
    animationDuration?: number;
  };
}

export interface TemplateSectionConfig {
  id: string;
  name: string;
  height: number;
  bgColor?: string;
  bgImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  padding?: number;
  margin?: number;
}

export interface TemplateLayoutJson {
  version: string; // e.g. "2.0.0"
  templateId?: string;
  name?: string;
  canvas: {
    width: number; // 375 for mobile, 1024 for desktop
    defaultHeight: number;
  };
  sections: TemplateSectionConfig[];
  widgets: TemplateWidgetConfig[];
}

/**
 * HARDCODED SAMPLE TEMPLATE LAYOUT JSON FOR CANVAS TEST RENDERING
 * Rich Luxury Royal Wedding Sample Template
 */
export const SAMPLE_HARDCODED_TEMPLATE_JSON: TemplateLayoutJson = {
  version: "2.0.0",
  templateId: "sample-royal-wedding",
  name: "Mẫu Thiệp Hoàng Gia Sang Trọng (Hardcoded Test)",
  canvas: {
    width: 375,
    defaultHeight: 2160,
  },
  sections: [
    {
      id: "sec-banner",
      name: "Section 1: Banner Lễ Cưới",
      height: 720,
      bgColor: "#0f172a",
      bgImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
      overlayColor: "#0f172a",
      overlayOpacity: 0.45,
    },
    {
      id: "sec-details",
      name: "Section 2: Đếm Ngược & Chương Trình",
      height: 720,
      bgColor: "#1e293b",
      overlayColor: "#000000",
      overlayOpacity: 0.2,
    },
    {
      id: "sec-location",
      name: "Section 3: Bản Đồ & Mừng Cưới",
      height: 720,
      bgColor: "#0f172a",
    },
  ],
  widgets: [
    // --- SECTION 1: BANNER ---
    {
      id: "w-title-top",
      type: "text",
      label: "Tiêu Đề Trân Trọng Kính Mời",
      x: 37,
      y: 40,
      width: 300,
      height: 40,
      zIndex: 10,
      content: "SAVE THE DATE",
      style: {
        fontFamily: "Cinzel",
        fontSize: 14,
        fontWeight: "bold",
        color: "#fbbf24",
        textAlign: "center",
        letterSpacing: 3,
      },
    },
    {
      id: "w-couple-names",
      type: "text",
      label: "Tên Chú Rể & Cô Dâu",
      x: 37,
      y: 90,
      width: 300,
      height: 70,
      zIndex: 11,
      content: "Minh Phong & Quỳnh Hoa",
      style: {
        fontFamily: "Great Vibes",
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
        textShadow: "0 4px 12px rgba(0,0,0,0.6)",
      },
    },
    {
      id: "w-couple-img",
      type: "image",
      label: "Ảnh Cưới Chính",
      x: 27,
      y: 170,
      width: 320,
      height: 240,
      zIndex: 12,
      content: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
      style: {
        borderRadius: 24,
        objectFit: "cover",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
      },
    },
    {
      id: "w-wedding-date-text",
      type: "text",
      label: "Ngày Cưới Văn Bản",
      x: 37,
      y: 430,
      width: 300,
      height: 40,
      zIndex: 13,
      content: "24 THÁNG 10 NĂM 2026",
      style: {
        fontFamily: "Be Vietnam Pro",
        fontSize: 16,
        fontWeight: "bold",
        color: "#fef08a",
        textAlign: "center",
        letterSpacing: 2,
      },
    },

    // --- SECTION 2: DETAILS & COUNTDOWN ---
    {
      id: "w-countdown",
      type: "countdown",
      label: "Đồng Hồ Đếm Ngược",
      x: 27,
      y: 760,
      width: 320,
      height: 100,
      zIndex: 20,
      content: "2026-10-24",
      settings: {
        onExpireAction: "stop",
      },
    },
    {
      id: "w-timeline",
      type: "timeline",
      label: "Chương Trình Lễ Cưới",
      x: 27,
      y: 880,
      width: 320,
      height: 240,
      zIndex: 21,
      settings: {
        items: [
          { time: "07:30", title: "Lễ Vu Quy", description: "Tại tư gia nhà gái" },
          { time: "11:00", title: "Lễ Thành Hôn", description: "Lễ gia tiên tại nhà trai" },
          { time: "11:30", title: "Tiệc Cưới Trọng Thể", description: "Đón tiếp quan khách tại Trung tâm Tiệc cưới" },
        ],
      },
    },
    {
      id: "w-calendar",
      type: "calendar",
      label: "Lịch Tháng 10",
      x: 27,
      y: 1140,
      width: 320,
      height: 260,
      zIndex: 22,
      content: "2026-10-24",
      settings: {
        lunarDateText: "Tức ngày 15 tháng 09 năm Bính Ngọ",
      },
    },

    // --- SECTION 3: LOCATION MAP & RSVP & MUSIC ---
    {
      id: "w-map",
      type: "maps",
      label: "Bản Đồ Google Maps",
      x: 27,
      y: 1480,
      width: 320,
      height: 200,
      zIndex: 30,
      content: "Trung Tâm Tiệc Cưới Hoàng Gia, 123 Nguyễn Huệ, Quận 1, TP.HCM",
      settings: {
        lat: 10.7769,
        lng: 106.7009,
        zoom: 15,
      },
    },
    {
      id: "w-vietqr",
      type: "vietqr",
      label: "Hộp Mừng Cưới VietQR",
      x: 27,
      y: 1700,
      width: 320,
      height: 60,
      zIndex: 31,
      content: "MB Bank - 1018920192 - TRAN MINH PHONG",
    },
    {
      id: "w-rsvp-btn",
      type: "button",
      label: "Nút RSVP Xác Nhận",
      x: 37,
      y: 1780,
      width: 300,
      height: 50,
      zIndex: 32,
      content: "💌 XÁC NHẬN THAM DỰ (RSVP)",
      style: {
        bgColor: "#e11d48",
        color: "#ffffff",
        borderRadius: 16,
        fontSize: 13,
        fontWeight: "bold",
      },
    },
    {
      id: "w-music",
      type: "music",
      label: "Nhạc Nền Tiệc Cưới",
      x: 20,
      y: 20,
      width: 54,
      height: 54,
      zIndex: 99,
      content: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      settings: {
        autoplay: true,
        loop: true,
        pinPosition: "bottom-right",
      },
    },
  ],
};
