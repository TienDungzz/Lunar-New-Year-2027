# CSS token và theme của Xuân An Yên

Cập nhật theo `example-standash/docs/ui/css-variables.md` và `theme.md`, ngày 2026-11-10.

## File tổng và contract

`src/styles/variables.css` là nơi duy nhất khai báo custom properties và font cục bộ. Token gốc nằm trong `:root`, không phụ thuộc media query. `src/main.tsx` import file này một lần trước `global.css`. Styles component/responsive dùng `var(--token, fallback)`; mọi `var()` lồng nhau cũng có fallback và tên đã khai báo.

Token theo vai trò/component, ví dụ `--text-small`, `--header-padding`, `--firework-dock--bottom-gap`. Biến thể `-2`, `-3` giữ các giá trị responsive/trạng thái khác nhau trong lần chuyển đổi đầu tiên. Khi sửa thiết kế, ưu tiên đặt lại tên theo vai trò cụ thể và cập nhật consumer; không tạo token trùng không cần thiết.

Giá trị cấu trúc như display, grid placement, kích thước hình học, breakpoint và transform vẫn thuộc stylesheet bố cục. Thuộc tính thiết kế mặc định của bộ mẫu, cùng shorthand `background`, `border`/các cạnh, `outline`, `font`, được cấu hình trong [project-standards.json](../project-standards.json). Không dùng danh sách rỗng để lách policy.

Màu icon theo preset là dữ liệu runtime: `FireworksControls` cung cấp inline `--firework-color` từ preset đã biết; file tổng có default vàng và stylesheet có fallback. Checker không quét inline style hoặc màu shader/Canvas; palette pháo hoa tại `src/lib/fireworkPalette.mjs` phục vụ renderer và được kiểm thử riêng.

## Theme được hỗ trợ

Sản phẩm dùng **một theme đêm Tết đỏ–vàng**. Không có bộ chọn light/dark/system, không đọc preference theme và không thay cảnh theo OS. `color-scheme: dark` trong file tổng giúp browser controls phù hợp với cảnh đêm; nó không thay palette của scene.

Quy tắc mẫu về ưu tiên theme thủ công, bootstrap trước first paint, persistence và listener OS chỉ áp dụng nếu sản phẩm bổ sung đổi theme. Không tạo provider/storage/selector khi chưa có yêu cầu. Nếu thêm, đặt toàn bộ token override trong chính `variables.css`; không đảo màu cả trang/canvas bằng filter.

## Kiểm tra

Thiệp lời chúc dùng nền đỏ trầm, chữ kem/vàng và họa tiết SVG gốc tại `public/images/wish-ornaments.svg` (hoa mai, pháo hoa, dê và sóng ở viền). Token `--wish-dialog-background` phủ gradient đỏ lên họa tiết để giữ vùng giữa dịu, dễ đọc; không thêm ảnh tham chiếu hoặc watermark vào sản phẩm. Các màu chữ/nút của thiệp nằm trong nhóm `--wish-dialog-*`.

```powershell
npm.cmd run check:css
npm.cmd run check:project
```

Checker PostCSS kiểm tra token tập trung, giá trị gốc, var/fallback, tên sai và thuộc tính thiết kế; parser được pin trong devDependencies/lockfile. Regression test tại `tests/css-standards.test.mjs` được lấy từ bộ mẫu và ánh xạ sang engine dự án. Checker không thay việc đo contrast, computed styles, responsive hoặc QA browser.

Lần chuyển đổi đầu tiên giữ nguyên **997 giá trị khai báo** sau resolve token, selector, thứ tự và media context qua so sánh AST trước/sau. Thay đổi có chủ đích là browser color scheme dark và contract màu icon có default. Chưa kiểm tra hình ảnh trong browser; đối chiếu AST không chứng minh contrast/FPS đạt.
