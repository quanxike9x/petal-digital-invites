import type { PropertyFieldSchema } from '../types/propertySchema';
import type { VariableType } from '../types/variables';

export type WidgetType = 
  | 'Text'
  | 'Image'
  | 'Gallery'
  | 'Countdown'
  | 'Timeline'
  | 'Map'
  | 'Music'
  | 'QR'
  | 'Video'
  | 'Divider'
  | 'Spacer'
  | 'RSVP';

export interface ComponentDefinition {
  type: WidgetType;
  displayName: string;
  category: 'basic' | 'media' | 'interactive' | 'layout';
  icon?: string;
  defaultProps: Record<string, unknown>;
  defaultStyle: Record<string, unknown>;
  properties: PropertyFieldSchema[];
  acceptedVariableTypes?: VariableType[];
}

export type AnchorType = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ResizeMode = 'free' | 'horizontal' | 'vertical' | 'none';
export type ImageFitMode = 'cover' | 'contain' | 'fill';

export interface ComponentLayoutPosition {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  lockAspectRatio?: boolean;
  resizeMode?: ResizeMode;
  imageFit?: ImageFitMode;
  anchor?: AnchorType;
  /** Góc xoay của component (độ). Dùng bởi Moveable rotatable. */
  rotation?: number;
}

export interface ComponentLayerInfo {
  name?: string;
  order: number; // Equivalent to z-index
  locked?: boolean;
  hidden?: boolean;
}

export interface ComponentLayoutModel {
  position?: ComponentLayoutPosition;
  layer?: ComponentLayerInfo;
}

export interface UnifiedComponentInstance {
  id: string;
  name?: string;
  type: WidgetType;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
  layout?: ComponentLayoutModel;
}

export const ComponentRegistry: Record<WidgetType, ComponentDefinition> = {
  Text: {
    type: 'Text',
    displayName: 'Văn Bản (Text)',
    category: 'basic',
    defaultProps: {
      text: 'Chúc mừng ngày chung đôi!',
      binding: 'groom_name',
    },
    defaultStyle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#0f172a',
      textAlign: 'center',
    },
    acceptedVariableTypes: ['string', 'number'],
    properties: [
      { key: 'text', label: 'Nội dung Text', type: 'text', target: 'props', defaultValue: 'Chúc mừng ngày chung đôi!' },
      { key: 'fontSize', label: 'Cỡ Chữ (px)', type: 'number', target: 'style', defaultValue: 24, min: 10, max: 120 },
      { key: 'color', label: 'Màu Chữ', type: 'color', target: 'style', defaultValue: '#0f172a' },
      { key: 'fontWeight', label: 'Độ Dày Chữ', type: 'select', target: 'style', defaultValue: 'bold', options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Medium', value: '500' },
        { label: 'SemiBold', value: '600' },
        { label: 'Bold', value: 'bold' },
      ]},
      { key: 'textAlign', label: 'Căn Lề', type: 'select', target: 'style', defaultValue: 'center', options: [
        { label: 'Trái', value: 'left' },
        { label: 'Giữa', value: 'center' },
        { label: 'Phải', value: 'right' },
      ]},
    ],
  },
  Image: {
    type: 'Image',
    displayName: 'Hình Ảnh (Image)',
    category: 'media',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
      alt: 'Wedding Photo',
      binding: 'groom_avatar',
    },
    defaultStyle: {
      width: '100%',
      height: '320px',
      borderRadius: 16,
      objectFit: 'cover',
    },
    acceptedVariableTypes: ['image'],
    properties: [
      { key: 'src', label: 'Đường Dẫn Ảnh (URL)', type: 'text', target: 'props', defaultValue: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80' },
      { key: 'alt', label: 'Mô Tả Ảnh (Alt)', type: 'text', target: 'props', defaultValue: 'Wedding Photo' },
      { key: 'height', label: 'Chiều Cao (px)', type: 'text', target: 'style', defaultValue: '320px' },
      { key: 'borderRadius', label: 'Bo Góc (px)', type: 'slider', target: 'style', defaultValue: 16, min: 0, max: 50 },
      { key: 'objectFit', label: 'Kiểu Hiển Thị (Fit)', type: 'select', target: 'style', defaultValue: 'cover', options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
      ]},
    ],
  },
  Gallery: {
    type: 'Gallery',
    displayName: 'Bộ Ảnh (Gallery)',
    category: 'media',
    defaultProps: {
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80',
      ],
      binding: 'gallery_images',
    },
    defaultStyle: {
      columns: 3,
      gap: 12,
    },
    acceptedVariableTypes: ['gallery'],
    properties: [
      { key: 'columns', label: 'Số Cột (Grid Columns)', type: 'number', target: 'style', defaultValue: 3, min: 1, max: 4 },
      { key: 'gap', label: 'Khoảng Cách Ảnh (px)', type: 'slider', target: 'style', defaultValue: 12, min: 0, max: 40 },
    ],
  },
  Countdown: {
    type: 'Countdown',
    displayName: 'Đếm Ngược (Countdown)',
    category: 'interactive',
    defaultProps: {
      targetDate: '2026-12-31T18:00:00',
      orientation: 'horizontal',
      gap: 8,
      frameColor: '#cbd5e1',
      cardBg: '#ffffff',
      binding: 'wedding_date',
    },
    defaultStyle: {
      backgroundColor: '#f8fafc',
      padding: 16,
      borderRadius: 16,
      color: '#0f172a',
      opacity: 1,
    },
    acceptedVariableTypes: ['date'],
    properties: [
      { key: 'targetDate', label: 'Ngày Đếm Ngược', type: 'date', target: 'props', defaultValue: '2026-12-31T18:00:00' },
      { key: 'orientation', label: 'Hướng Hiển Thị', type: 'select', target: 'props', defaultValue: 'horizontal', options: [
        { label: 'Ngang', value: 'horizontal' },
        { label: 'Dọc', value: 'vertical' },
      ]},
      { key: 'gap', label: 'Khoảng Cách (px)', type: 'number', target: 'props', defaultValue: 8, min: 0, max: 40 },
      { key: 'frameColor', label: 'Màu Khung', type: 'color', target: 'props', defaultValue: '#cbd5e1' },
      { key: 'cardBg', label: 'Màu Nền Ô Số', type: 'color', target: 'props', defaultValue: '#ffffff' },
      { key: 'backgroundColor', label: 'Màu Nền Khung', type: 'color', target: 'style', defaultValue: '#f8fafc' },
    ],
  },
  Timeline: {
    type: 'Timeline',
    displayName: 'Lịch Tháng (Calendar)',
    category: 'interactive',
    defaultProps: {
      month: 12,
      year: 2026,
      weddingDay: 20,
      engagementDay: 15,
      showTwoDates: true,
      styleType: 'style1',
      accentColor: '#e11d48',
    },
    defaultStyle: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontSize: 14,
      opacity: 1,
    },
    acceptedVariableTypes: ['timeline'],
    properties: [
      { key: 'showTwoDates', label: 'Hiển Thị 2 Ngày Cưới', type: 'select', target: 'props', defaultValue: 'true', options: [
        { label: 'Có (Ngày cưới & Ăn hỏi)', value: 'true' },
        { label: 'Không (Chỉ 1 Ngày)', value: 'false' },
      ]},
      { key: 'styleType', label: 'Style Lịch', type: 'select', target: 'props', defaultValue: 'style1', options: [
        { label: 'Style Kiểu 1 (Tròn)', value: 'style1' },
        { label: 'Style Kiểu 2 (Vuông)', value: 'style2' },
      ]},
      { key: 'accentColor', label: 'Màu Giao Diện Chân', type: 'color', target: 'props', defaultValue: '#e11d48' },
      { key: 'color', label: 'Màu Chữ', type: 'color', target: 'style', defaultValue: '#0f172a' },
      { key: 'backgroundColor', label: 'Màu Nền', type: 'color', target: 'style', defaultValue: '#ffffff' },
    ],
  },
  Map: {
    type: 'Map',
    displayName: 'Bản Đồ (Map)',
    category: 'interactive',
    defaultProps: {
      address: 'Trung tâm Tiệc cưới Pudwedding, Hà Nội',
      mapUrl: 'https://maps.google.com',
      binding: 'wedding_address',
    },
    defaultStyle: {
      height: '240px',
    },
    acceptedVariableTypes: ['location'],
    properties: [
      { key: 'address', label: 'Địa Chỉ Hiển Thị', type: 'text', target: 'props', defaultValue: 'Trung tâm Tiệc cưới Pudwedding, Hà Nội' },
      { key: 'height', label: 'Chiều Cao Bản Đồ (px)', type: 'text', target: 'style', defaultValue: '240px' },
    ],
  },
  Music: {
    type: 'Music',
    displayName: 'Nhạc Nền (Music)',
    category: 'media',
    defaultProps: {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      autoPlay: true,
      binding: 'background_music',
    },
    defaultStyle: {
      buttonColor: '#e11d48',
    },
    acceptedVariableTypes: ['music'],
    properties: [
      { key: 'url', label: 'Đường Dẫn Audio (MP3 URL)', type: 'text', target: 'props', defaultValue: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { key: 'buttonColor', label: 'Màu Nút Bấm Nhạc', type: 'color', target: 'style', defaultValue: '#e11d48' },
    ],
  },
  QR: {
    type: 'QR',
    displayName: 'Mã QR Mừng Cưới (QR)',
    category: 'interactive',
    defaultProps: {
      bankName: 'MBBank',
      accountNo: '8888888888',
      accountName: 'PUDWEDDING CO',
      giftBoxImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200',
      binding: 'qr_groom',
    },
    defaultStyle: {
      cardBg: '#ffffff',
    },
    acceptedVariableTypes: ['qr'],
    properties: [
      { key: 'giftBoxImage', label: 'Ảnh Hộp Quà Mừng Cưới', type: 'text', target: 'props', defaultValue: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200' },
      { key: 'bankName', label: 'Tên Ngân Hàng', type: 'text', target: 'props', defaultValue: 'MBBank' },
      { key: 'accountNo', label: 'Số Tài Khoản', type: 'text', target: 'props', defaultValue: '8888888888' },
      { key: 'accountName', label: 'Chủ Tài Khoản', type: 'text', target: 'props', defaultValue: 'PUDWEDDING CO' },
    ],
  },
  RSVP: {
    type: 'RSVP',
    displayName: 'Xác Nhận Tham Dự (RSVP)',
    category: 'interactive',
    defaultProps: {
      title: 'Xác Nhận Tham Dự Lễ Cưới',
      subtitle: 'Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi',
      buttonText: 'Gửi Xác Nhận',
    },
    defaultStyle: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontSize: 14,
      borderRadius: 16,
      width: 400,    // THÊM
      height: 600,   // THÊM
    },
    properties: [
      { key: 'title', label: 'Tiêu Đề Form', type: 'text', target: 'props', defaultValue: 'Xác Nhận Tham Dự Lễ Cưới' },
      { key: 'subtitle', label: 'Lời Nhắn Phụ', type: 'text', target: 'props', defaultValue: 'Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi' },
      { key: 'buttonText', label: 'Tên Nút Bấm', type: 'text', target: 'props', defaultValue: 'Gửi Xác Nhận' },
      { key: 'backgroundColor', label: 'Màu Nền Form', type: 'color', target: 'style', defaultValue: '#ffffff' },
      { key: 'width', label: 'Chiều Rộng', type: 'number', target: 'style', defaultValue: 400 },
      { key: 'height', label: 'Chiều Cao', type: 'number', target: 'style', defaultValue: 600 },
    ],
  },
  Video: {
    type: 'Video',
    displayName: 'Video (YouTube/Vimeo)',
    category: 'media',
    defaultProps: {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      binding: 'wedding_video',
    },
    defaultStyle: {
      height: '300px',
    },
    acceptedVariableTypes: ['video'],
    properties: [
      { key: 'url', label: 'Đường Dẫn Video Embed URL', type: 'text', target: 'props', defaultValue: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { key: 'height', label: 'Chiều Cao Video (px)', type: 'text', target: 'style', defaultValue: '300px' },
    ],
  },
  Divider: {
    type: 'Divider',
    displayName: 'Đường Phân Cách (Divider)',
    category: 'layout',
    defaultProps: {
      styleType: 'dashed',
    },
    defaultStyle: {
      color: '#cbd5e1',
      thickness: 1,
    },
    properties: [
      { key: 'color', label: 'Màu Đường Kẻ', type: 'color', target: 'style', defaultValue: '#cbd5e1' },
      { key: 'thickness', label: 'Độ Dày (px)', type: 'number', target: 'style', defaultValue: 1, min: 1, max: 10 },
    ],
  },
  Spacer: {
    type: 'Spacer',
    displayName: 'Khoảng Trắng (Spacer)',
    category: 'layout',
    defaultProps: {},
    defaultStyle: {
      height: 32,
    },
    properties: [
      { key: 'height', label: 'Chiều Cao Khoảng Trắng (px)', type: 'number', target: 'style', defaultValue: 32, min: 8, max: 200 },
    ],
  },
};

export function getRegisteredComponentByType(type: WidgetType): ComponentDefinition | undefined {
  return ComponentRegistry[type];
}

export function getDefaultResizeModeForType(type: WidgetType): ResizeMode {
  switch (type) {
    case 'Image':
    case 'Gallery':
    case 'Video':
    case 'QR':
    case 'RSVP':
    case 'Countdown':
    case 'Map':
    case 'Text':
      return 'free';
    case 'Music':
    case 'Divider':
      return 'horizontal';
    case 'Spacer':
    case 'Timeline':
      return 'vertical';
    default:
      return 'free';
  }
}

export function createComponentInstance(type: WidgetType, defaultLayoutOrder: number = 1): UnifiedComponentInstance {
  const definition = ComponentRegistry[type];
  if (!definition) {
    throw new Error(`Component type "${type}" is not registered.`);
  }

  const id = `comp-${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const defaultResizeMode = getDefaultResizeModeForType(type);
  const defaultStyle = definition.defaultStyle;
  const defaultWidth = defaultStyle?.width ? String(defaultStyle.width) : '100%';
  const defaultHeight = defaultStyle?.height ? String(defaultStyle.height) : 'auto';

  return {
    id,
    name: `${definition.displayName}`,
    type,
    props: JSON.parse(JSON.stringify(definition.defaultProps)),
    style: JSON.parse(JSON.stringify(definition.defaultStyle)),
    layout: {
      position: {
        x: 0,
        y: 0,
        width: defaultWidth,   // 👈 Sửa ở đây
        height: defaultHeight, // 👈 Sửa ở đây
        minWidth: '40px',
        minHeight: '20px',
        maxWidth: '100%',
        maxHeight: 'none',
        lockAspectRatio: false,
        resizeMode: defaultResizeMode,
        imageFit: 'cover',
        anchor: 'top-left',
      },
      layer: {
        name: `${definition.displayName}`,
        order: defaultLayoutOrder,
        locked: false,
        hidden: false,
      },
    },
  };
}
