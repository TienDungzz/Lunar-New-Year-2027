# Đối chiếu quy chuẩn mẫu và dự án

Ngày rà soát: **2026-11-10**. Nguồn tham chiếu: `example-standash/`, bộ mẫu v1.0.0. Phạm vi: chuyên biệt hóa quy chuẩn và công cụ kiểm tra cho dự án hiện tại; không coi đây là xác nhận toàn bộ code đã tuân thủ.

## Những điều đã điều chỉnh

| Nội dung mẫu | Áp dụng trong Xuân An Yên |
| --- | --- |
| Repo tài liệu, tắt asset | Frontend 3D; bật budget cho toàn bộ `public/` |
| Cây monorepo, route/feature/shared tham chiếu | Ánh xạ cấu trúc `src/` hiện hữu; không tạo tầng rỗng |
| Controller, database, auth, queue, chống tải backend | Không áp dụng; API nội dung ngoài có contract/timeout/fallback phía client |
| ESLint cho JS, 60 dòng/hàm | Mục tiêu giữ 60; audit bằng AST TypeScript bao phủ `.ts`, `.tsx`, `.mjs`; chưa có lint đầy đủ |
| Template bàn giao, hồ sơ chưa điền | Quy tắc cụ thể trong CODE_STANDARDS, cấu hình thật và báo cáo này |
| Nhân vật 3D ví dụ | Chỉ môi trường/đạo cụ, không nhân vật; nguồn Blender tách runtime GLB |
| Budget mẫu chung | Byte/file và total public bật trong cấu hình; giữ mục tiêu GPU/FPS riêng chưa benchmark |
| Quality command của repo chuẩn | Dùng type/test, manifest, docs, BEM, build/bundle của ứng dụng; không cài ESLint mẫu không đọc TSX |

## Điểm code hiện tại cần cải thiện

Kết quả AST khi bắt đầu rà soát, tính cả dòng trống/comment/JSX:

| Vị trí | Dòng/hàm | Hướng xử lý |
| --- | --- | --- |
| `src/App.tsx`, `App` | 179 | Tách lifecycle countdown, admission/audio và các vùng UI theo trách nhiệm |
| `src/components/FireworksControls.tsx`, `FireworksControls` | 69 | Tách form nhập chữ và nhóm điều khiển, giữ state/callback rõ |
| `src/scenes/Fireworks.tsx`, `Fireworks` | 78 | Tách chuẩn bị buffer/material và cập nhật frame, giữ pool cố định |
| `tests/integration/experience.test.tsx`, callback `describe` | 183 | Chia nhóm kiểm thử theo countdown, API và trải nghiệm; giữ helper có ý nghĩa |

Đây là snapshot trước refactor, số mới lấy bằng `npm.cmd run audit:functions`. Chưa có ngoại lệ được duyệt và không tăng ngưỡng để làm kết quả xanh. Việc chuyển toàn bộ hàm về ≤60 dòng là hạng mục refactor tiếp theo, chưa hoàn thành trong đợt chuyên biệt hóa tài liệu này. Một số hàm/JSX còn dồn nhiều câu lệnh trên một dòng; số dòng không tự phản ánh độ dễ đọc.

TypeScript strict hiện không tương đương lint Hooks/unused exports. Cần bổ sung lint phù hợp TypeScript/React khi thực hiện refactor; phải khai báo dynamic import và R3F trước khi dùng công cụ dead-code. Không xóa `art/blender/Untitled.blend` hoặc các thay đổi đang có của người dùng trong đợt này.

## Bằng chứng và giới hạn

- Các gate thực thi được nằm trong [project-standards.json](../project-standards.json); xem kết quả `npm.cmd run check:project` cho snapshot hiện tại.
- Analyzer độ dài hàm có regression test cho comment/dòng trắng, TSX, arrow/method và declaration không có body.
- Audit chỉ đo độ dài AST, không chứng minh trách nhiệm hàm, không thay lint, security scan hoặc kiểm tra duplication.
- Cấu hình chỉ kiểm tra các path/capability được khai báo. Engine trong `scripts/standards/` là bản lấy từ ví dụ, còn bộ ví dụ gốc được giữ nguyên.
- Browser responsive, hình ảnh 3D, chất lượng âm thanh, Khronos Validator, GPU memory/FPS, security headers host và advisory dependency hiện chưa được xác minh trong đợt này.

Tiêu chí nghiệp vụ phải giữ khi refactor: [PROJECT_SPEC](PROJECT_SPEC.md), [FIREWORKS_SPEC](FIREWORKS_SPEC.md), [CONTENT_API](CONTENT_API.md), [TREE_WISHES](TREE_WISHES.md). Phần chưa kiểm chứng không được đánh dấu đạt chỉ vì các gate tự động trả mã 0.

## Kết quả chạy ngày 2026-11-10

- check:project: đạt toàn bộ 6 quality gate đã cấu hình; 27 Node tests và 31 React integration tests, tổng 58.
- Budget runtime: 12 file, 4.963.467 byte; initial JavaScript 276.565 byte, giữ lazy scene.
- check:docs: README lập chỉ mục 18 tài liệu; BEM kiểm tra 108 class.
- audit:functions: 59 file, 4 finding đã nêu; strict chưa đạt. Không ghi nhận ngoại lệ đã duyệt.
- Build còn cảnh báo chunk Three.js trên 500 KB; chưa có benchmark/QA trình duyệt để kết luận chất lượng hiển thị hoặc tốc độ.

## Bổ sung CSS, theme và i18n — 2026-11-10

Đã đồng bộ engine mới có check-css và css-config/css-policy. Profile 1.1.0-project bật CSS, dùng variables.css thay đường dẫn examples/css không tồn tại trong dự án. Token gốc/font tập trung, 438 khai báo chuyển sang var có fallback; so sánh AST xác nhận 997 giá trị, selector và media context giữ nguyên. Inline màu icon là contract runtime có default; shader/Canvas không thuộc CSS scan.

Theme light/dark/system không áp dụng do sản phẩm dùng một cảnh đêm đỏ–vàng. Đã tách 99 cặp nhãn sang catalog VI/EN, chuẩn hóa locale, bổ sung interpolation cho tên pháo/âm lượng và regression test key/placeholder. Lời chúc/preset dữ liệu có catalog miền riêng; không tự dịch nội dung chữ pháo.

Bổ sung 13 regression test CSS từ bộ mẫu và 2 test i18n; tổng 73 test (40 Node + 33 React), đã chạy đạt qua check:project. Audit hàm vẫn có 4 mục vượt ngưỡng; chưa có ngoại lệ đã duyệt hoặc QA browser. Snapshot 58 test ở phần trên thuộc đợt trước.

Kết quả profile 1.1.0-project: checker CSS và toàn bộ 6 quality gate đạt; README lập chỉ mục 19 tài liệu. Initial JavaScript 284.961 byte dưới ngưỡng 400.000; CSS production 53,26 kB (gzip 9,93 kB), tăng do token và fallback tường minh. Npm install với lockfile đã cập nhật báo 0 advisory tại thời điểm chạy; không thay review bảo mật/runtime. Audit hiện quét 65 file và vẫn có 4 finding. Chưa kiểm tra giao diện trong browser.
