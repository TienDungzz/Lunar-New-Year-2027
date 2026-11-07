# Nhận diện Tết Đinh Mùi 2027

Logo được tạo bằng imagegen theo hình tham khảo người dùng cung cấp: đầu dê nhìn sang phải, số 2027, đỏ sơn mài và ánh vàng kim. Không đưa tên xưởng in hoặc watermark trong hình tham khảo vào thiết kế.

- `tet-2027-master.png`: bản gốc nền trong suốt của logo đầy đủ.
- `goat-master.png`: bản đầu dê riêng, giản lược để dùng làm favicon.
- `../../public/images/tet-2027-logo.png`: logo web 256 × 256.
- `../../public/images/goat-mark.png`: biểu tượng đầu dê 192 × 192.
- `../../public/favicon-32.png`: favicon 32 × 32.
- `../../public/apple-touch-icon.png`: biểu tượng màn hình chính 180 × 180.

Tạo lại các kích thước PNG trên Windows bằng `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-branding.ps1`, rồi chạy `node scripts/asset-manifest.mjs`. Tùy chọn execution policy chỉ áp dụng cho tiến trình này. Script chỉ đổi kích thước, giữ kênh alpha; không sửa nội dung thiết kế.
