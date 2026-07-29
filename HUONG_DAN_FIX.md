# FIX: Kéo thả / Resize / Xoay / Smart Guides

Nhánh này chỉ chứa các file đã sửa. Tải về và **replace** đúng đường dẫn trong project của bạn.

## File cần replace
| File | Nội dung sửa |
|---|---|
| `src/renderer/CanvasRenderer.tsx` | Viết lại toàn bộ engine Moveable: drag + resize + **rotate** + smart guides |
| `src/renderer/ContainerRenderer.tsx` | Định vị component bằng `transform` thay vì `left/top`, bỏ HTML5 drag |
| `src/registry/ComponentRegistry.ts` | Thêm `rotation?: number` vào `ComponentLayoutPosition` |
| `src/schema/TemplateSchema.ts` | Chuẩn hoá `rotation` trong `getNormalizedComponentLayoutPosition` + fix 2 lỗi type |

## Các lỗi gốc đã được xử lý
1. **Hai engine kéo thả đánh nhau.** HTML5 drag (`draggable`) + `react-selecto` (`selectByClick`) nuốt sự kiện `mousedown` của `react-moveable` → nhiều lúc kéo không ăn. Đã bỏ Selecto và bỏ HTML5 drag ở cấp component (DragContext giờ chỉ lo kéo **section**).
2. **Component nhảy vị trí.** React set `left/top` trong khi Moveable ghi `transform` → hai nguồn sự thật. Giờ vị trí luôn là `transform: translate(x,y) rotate(deg)`.
3. **Giật/lag và spam undo.** Bản cũ gọi `onChangeComponent` trong từng frame `onDrag`/`onResize`. Giờ trong lúc kéo chỉ ghi thẳng vào `target.style`, **chỉ commit vào state ở `onDragEnd` / `onResizeEnd` / `onRotateEnd`** → 1 bước undo cho 1 thao tác.
4. **Resize từ cạnh trái/trên bị trôi.** Thiếu `drag.beforeTranslate`. Đã thêm `target.style.transform = drag.transform` trong `onResize`.
5. **Không xoay được.** Đã bật `rotatable`, `rotationPosition="top"`, lưu `layout.position.rotation`.
6. **Khung điều khiển lệch khi scroll/zoom.** Đã gọi `moveableRef.current?.updateRect()` trong `onScroll`/`onPinch` của InfiniteViewer và khi layout đổi.
7. **Kéo mép dưới section không khớp con trỏ khi zoom.** Đã chia delta cho `zoom`.

## Smart guides
Bật bằng `snappable` + `elementGuidelines` (lấy tất cả `[data-component-id]` khác component đang chọn) + `snapDirections`/`elementSnapDirections` (top/left/bottom/right/center/middle), `snapThreshold={6}`, `isDisplaySnapDigit`.
Muốn thêm lưới, set `snapGridWidth={8} snapGridHeight={8}`.

## Lưu ý
- Component bị `locked` sẽ không gắn Moveable (kiểm tra qua `data-locked`).
- Nếu muốn khoá tỉ lệ khi resize ảnh: truyền `keepRatio={!!pos.lockAspectRatio}`.
