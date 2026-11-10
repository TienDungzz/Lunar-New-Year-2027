# Bộ kiểm tra cấu hình quy chuẩn

Các file `.mjs` trong thư mục này được lấy từ `example-standash/scripts/` do người dùng cung cấp, giữ engine và API để kiểm tra bằng cấu hình [project-standards.json](../../project-standards.json) ở gốc repository. Không phụ thuộc việc giữ thư mục ví dụ trong runtime hoặc cài package riêng của bộ mẫu.

Chạy từ gốc repository:

```powershell
npm.cmd run check:standards
npm.cmd run check:css
npm.cmd run check:project
node scripts/standards/check-structure.mjs --scope frontend
node scripts/standards/check-quality.mjs --gate type-and-tests --run
```

Các command trong cấu hình chỉ được thực thi khi dùng `--run`; cấu hình phải được review như code. Checker tổng trả trạng thái incomplete khi chưa thực thi quality commands. Bộ này không thay checker checksum/decode/batching của asset, kiểm tra BEM hoặc initial bundle đã có trong `scripts/`.

Audit hàm dùng parser TypeScript tại `../audit-functions.mjs`, không dùng cấu hình ESLint JS của bộ mẫu cho mã TSX. Giới hạn và nợ refactor được ghi trong [CODE_STANDARDS](../../docs/CODE_STANDARDS.md) và [STANDARDS_REVIEW](../../docs/STANDARDS_REVIEW.md).
