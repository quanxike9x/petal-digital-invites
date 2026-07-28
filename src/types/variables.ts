/**
 * TYPED VARIABLE BINDING SYSTEM WITH VIETNAMESE LOCALIZATION (STRICT TYPES - ZERO ANY)
 */

export type VariableDataType = 
  | 'string' 
  | 'date' 
  | 'image'
  | 'image[]' 
  | 'timeline[]' 
  | 'url' 
  | 'object';

export type VariableKey =
  | 'none'
  | 'groom_name'
  | 'bride_name'
  | 'wedding_date'
  | 'venue_name'
  | 'venue_address'
  | 'love_story'
  | 'wedding_quote'
  | 'bride_avatar'
  | 'groom_avatar'
  | 'cover_image'
  | 'background_image'
  | 'gallery_images'
  | 'background_music'
  | 'map_url'
  | 'timeline_events'
  | 'qr_information';

export interface VariableDefinition {
  key: VariableKey;
  displayName: string;
  description: string;
  dataType: VariableDataType;
}

export const VARIABLE_REGISTRY: VariableDefinition[] = [
  { key: 'none', displayName: 'Không liên kết (Giá trị tĩnh)', description: 'Dùng giá trị tĩnh nhập tay', dataType: 'string' },
  { key: 'groom_name', displayName: 'Tên chú rể', description: 'Tên chú rể hiển thị trên thiệp', dataType: 'string' },
  { key: 'bride_name', displayName: 'Tên cô dâu', description: 'Tên cô dâu hiển thị trên thiệp', dataType: 'string' },
  { key: 'wedding_date', displayName: 'Ngày tổ chức', description: 'Ngày tháng năm tổ chức lễ cưới', dataType: 'date' },
  { key: 'venue_name', displayName: 'Tên địa điểm', description: 'Tên nhà hàng / trung tâm tiệc cưới', dataType: 'string' },
  { key: 'venue_address', displayName: 'Địa chỉ tiệc cưới', description: 'Địa chỉ chi tiết nhà hàng / tư gia', dataType: 'string' },
  { key: 'love_story', displayName: 'Câu chuyện tình yêu', description: 'Nội dung câu chuyện tình yêu của cặp đôi', dataType: 'string' },
  { key: 'wedding_quote', displayName: 'Lời nhắn / Trích dẫn', description: 'Câu trích dẫn hoặc lời chúc ý nghĩa', dataType: 'string' },
  { key: 'bride_avatar', displayName: 'Ảnh đại diện cô dâu', description: 'Hình ảnh chân dung cô dâu', dataType: 'image' },
  { key: 'groom_avatar', displayName: 'Ảnh đại diện chú rể', description: 'Hình ảnh chân dung chú rể', dataType: 'image' },
  { key: 'cover_image', displayName: 'Ảnh bìa thiệp', description: 'Hình ảnh banner bìa chính', dataType: 'image' },
  { key: 'background_image', displayName: 'Ảnh nền thiệp', description: 'Hình ảnh phông nền thiệp', dataType: 'image' },
  { key: 'gallery_images', displayName: 'Album ảnh cưới', description: 'Bộ sưu tập danh sách ảnh cưới', dataType: 'image[]' },
  { key: 'background_music', displayName: 'Nhạc nền', description: 'Đường dẫn bài hát phát tự động', dataType: 'url' },
  { key: 'map_url', displayName: 'Bản đồ Google Maps', description: 'Đường dẫn vị trí trên Google Maps', dataType: 'url' },
  { key: 'timeline_events', displayName: 'Lịch trình sự kiện', description: 'Danh sách mốc thời gian chương trình', dataType: 'timeline[]' },
  { key: 'qr_information', displayName: 'Thông tin QR mừng cưới', description: 'Thông tin tài khoản ngân hàng nhận mừng cưới', dataType: 'object' },
];

export const getVariableDefinition = (key: string): VariableDefinition | undefined => {
  return VARIABLE_REGISTRY.find((v) => v.key === key);
};
