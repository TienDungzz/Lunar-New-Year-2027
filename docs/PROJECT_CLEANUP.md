# Quản lý tài nguyên và dọn dự án

Giữ `src`, `public` asset đang dùng, `art/blender` master, scripts build/check, manifest, license và docs. Chỉ xóa cache tạo lại (`dist`, `.qa`, `node_modules`, screenshot tạm) sau khi xác nhận đường dẫn và build tái lập được. Không xóa `.blend` vì frontend không import. Không sao chép báo cáo dọn 2 GB của Women Day như số liệu dự án mới.

Trước mỗi lần cleanup: quét import/URL runtime, so manifest và checksum, kiểm tra fallback, chạy build và smoke test; chỉ xóa sau khi có bản backup phù hợp.



