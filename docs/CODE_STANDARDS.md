# Quy chuẩn code — Xuân An Yên

Phiên bản áp dụng: **1.1.0-project**, ngày 2026-11-10. Tham chiếu bộ mẫu v1.0.0 trong `example-standash/` (tên thư mục thực tế của workspace). Đây là quy chuẩn của ứng dụng React/Three.js, thay cho cấu hình mẫu dành cho repository tài liệu. Tình trạng áp dụng nằm trong [STANDARDS_REVIEW](STANDARDS_REVIEW.md).

## Phạm vi và cấu trúc

Dự án là một SPA tĩnh React 19 + TypeScript + Vite, Three.js/R3F/Drei, GSAP và Web Audio. Giữ repo đơn và cấu trúc hiện tại; không tạo monorepo, router, controller, repository, database, Redis, queue hoặc thư mục rỗng để giống mẫu. API lời chúc do dịch vụ bên ngoài quản lý; hợp đồng tại [CONTENT_API](CONTENT_API.md).

| Đường dẫn | Trách nhiệm |
| --- | --- |
| `src/main.tsx`, `src/App.tsx` | Bootstrap, ghép UI, điều phối phase và URL; không gom thuật toán particle/API vào App |
| `src/components/` | DOM, form và dialog; dữ liệu qua props, tương tác qua callback; fallback Canvas2D |
| `src/hooks/` | State, effect, clock, lifecycle, nội dung và preference; tên bắt đầu `use` |
| `src/lib/` | Logic miền: reducer, API boundary, timeline, bố cục chữ, hình dê, palette và audio |
| `src/scenes/` | Canvas/R3F, camera, geometry, material, particle pool và hiệu ứng môi trường |
| `src/i18n/` | Catalog VI/EN có key, translator và allowlist locale |
| `src/data/` | 8 lời chúc VI/EN cục bộ và kiểu nội dung |
| `src/styles/` | variables.css sở hữu token/font, global.css chỉ dùng var có fallback; BEM/responsive/focus |
| `public/` | Asset runtime có manifest, font/license, logo và favicon |
| `art/` | Nguồn Blender trong `blender/`, ảnh tham chiếu trong `images/previews/`; không lưu ảnh gốc branding, không deploy cùng `dist/` |
| `tests/`, `scripts/` | Kiểm thử, công cụ xác minh và script dựng cảnh trong `scripts/blender/`; tách khỏi logic runtime |

Component PascalCase, hook `useCamelCase`, hàm/biến camelCase, hằng dùng chung UPPER_SNAKE_CASE. Asset kebab-case; giữ tên tài liệu hiện có, liên kết đúng chữ hoa/thường. Dùng UTF-8. Module `.mjs` giữ cho logic thuần có thể kiểm thử trực tiếp bằng Node; không đổi đuôi hàng loạt chỉ vì hình thức.

Logic thuần không import React hoặc renderer. WebGL, Canvas2D và audio dùng chung timeline/plan; không sao chép một bộ physics cho mỗi renderer. Không truyền secret qua `VITE_*`. Dynamic import của `World` phải giữ Three.js ngoài initial JavaScript.

## Cách viết và vòng đời

- Mỗi hàm có một trách nhiệm, mục tiêu **tối đa 60 dòng**, tính cả JSX, comment, dòng trắng và hai dòng biên; callback/method cũng tính. Không ghép nhiều câu lệnh trên một dòng hoặc tách helper vô nghĩa để lách số dòng.
- Ranh giới nên tách: điều phối countdown, admission/cooldown, lifecycle audio, UI welcome/header, tạo plan và cập nhật particle. Chỉ đưa code lên dùng chung khi có consumer thật.
- Khai báo kiểu tại boundary và props; validate dữ liệu ngoài ở runtime. Giữ TypeScript strict; không dùng `any`, assertion hoặc suppression để che lỗi chưa hiểu.
- Effect phải dọn timer, listener, RAF, subscription và request; bỏ response/rasterization cũ khi rời cảnh hoặc đổi content ID. Dùng ref cho dữ liệu frame, không set React state cho từng hạt.
- Dispose resource do component sở hữu; không dispose material/GLTF cache vẫn được consumer khác dùng. Không tạo geometry, material hoặc AudioContext liên tục theo frame.
- Chỉ xóa code/asset khi xác nhận không dùng, kể cả dynamic import, R3F ref và nguồn tái tạo Blender. Không xóa file làm việc của người dùng chỉ vì tên chưa đẹp.

Gate check:functions hiện không có hàm vượt 60 dòng. Một số JSX cũ vẫn viết dồn dòng và cần cải thiện độ dễ đọc; kết quả AST không thay thế review code. `audit:functions` báo cáo bằng AST TypeScript; `--strict` trả lỗi khi còn vi phạm. Audit không thay ESLint/Rules of Hooks, không chứng minh hết dead code. Chưa bật gate lint vì repo chưa có cấu hình lint phù hợp TSX; không sử dụng ESLint mẫu chỉ đọc JavaScript để tuyên bố đã kiểm tra TypeScript.

## Hợp đồng sản phẩm phải giữ

- Mốc giao thừa `2027-02-06T00:00:00+07:00`; camera chuyển từ 3 giây cuối, loạt đầu phóng ngay khi về 0. Dê vàng và “Chúc mừng năm mới” cùng phóng/nổ. Preview 10 giây chỉ có CTA trước Tết khi URL có `mode=preview`; sau mốc thật luôn có CTA vào pháo hoa.
- Màn diễn 5 phút theo thời gian đang xem; pause, ẩn tab và qua cây không phát bù hàng đợi. Có thể bắn tay đồng thời với tự động/pháo chữ; giữ giới hạn admission, cooldown, voice và buffer tại source, thay đổi phải kèm test.
- Chữ tối đa 24 grapheme, chuẩn hóa NFC, tính khoảng trắng bên trong; hỗ trợ dấu Việt. Nét serif nghiêng mềm, màu từng ký tự khác nhau và đổi theo lần bắn; không nhấp nháy liên tục. Dê giữ màu vàng.
- Cây mai có đúng 8 vật treo/8 ID ổn định, VI/EN và tiến độ theo bộ nội dung. Không có bàn lì xì, nhân vật hoặc cảnh ngôi sao điều ước.
- Âm thanh mặc định tắt, cần thao tác bật; volume 0–100%, mặc định 70%, preference không tự kích hoạt audio. Dừng âm thanh khi ẩn tab/rời cảnh.

Chi tiết nghiệp vụ nằm trong [PROJECT_SPEC](PROJECT_SPEC.md), [FIREWORKS_SPEC](FIREWORKS_SPEC.md), [TREE_WISHES](TREE_WISHES.md). Không tự thay các giá trị chỉ để qua kiểm thử hoặc quy chuẩn mẫu.

## UI, 3D và tài nguyên

Giữ đỏ Tết/vàng kim, logo đầu dê + 2027, favicon chỉ đầu dê. CSS theo [BEM](BEM.md) và [CSS_TOKENS](CSS_TOKENS.md); custom properties tập trung, mọi var có fallback. Theme hiện cố định đêm đỏ–vàng; không thêm light/dark/system khi sản phẩm chưa yêu cầu. Nhãn UI dùng catalog và placeholder theo [LANGUAGES](LANGUAGES.md). Icon có tên truy cập và tooltip; trạng thái không chỉ phân biệt bằng màu. Dialog quản lý focus, Escape và keyboard; có danh sách lời chúc DOM. Kiểm tra responsive, touch tối thiểu 44px, safe area, reduced motion và fallback 2D.

Bảng pháo hoa cố định dưới đáy trên mọi thiết bị, cách đáy max(12px, safe-area-inset-bottom), không có bộ chọn vị trí hoặc preference dock. Desktop tối đa 1280px, dàn ngang khi mở text; mobile icon gọn và âm lượng mở khi cần. Navigation hai cảnh ở trên tiêu đề, chỉ rõ mục hiện tại và không chồng bảng. Xem [FRAMING_AND_LIGHTING](FRAMING_AND_LIGHTING.md).

Blender MCP là công cụ tác giả, không phải dependency runtime. Giữ nguồn `.blend` trong `art/blender/`, script trong `scripts/blender/`, ảnh nguồn/tham chiếu trong `art/images/`; GLB trong `public/models/`, export active scene và selection để tránh nhân đôi. Nhà chính/nhà phụ, sân gạch, đèn và nồi bánh chưng là đạo cụ môi trường; không có rig/skinned character. Dùng instancing/batch material cho hình lặp. Cập nhật manifest sau export hoặc đổi asset.

| Ngân sách kiểm tra tĩnh | Ngưỡng |
| --- | --- |
| File trong `public/` | ≤ 5 MiB = 5.242.880 byte |
| Toàn bộ `public/` | ≤ 15 MiB = 15.728.640 byte, gồm font và license |
| Initial JavaScript chưa nén | < 400.000 byte; giữ lazy scene |

Hai ngưỡng asset lấy từ profile mẫu, áp cho runtime thực tế đang nhỏ hơn ngưỡng, không áp cho master trong `art/`. Ngân sách render/texture và mục tiêu FPS theo [PERFORMANCE](PERFORMANCE.md); chưa có benchmark thiết bị thật. GLB parse bằng Three.js không thay Khronos Validator hoặc QA hình ảnh. Không chép các số FPS/texture mẫu thành kết quả đã đạt.

## Nội dung ngoài và bảo mật theo phạm vi

API chỉ đọc, `credentials: omit`, có timeout, abort, giới hạn response và fallback cục bộ. Chỉ nhận 8 ID/trường VI/EN cho phép; nội dung là text, không HTML/script/shader/model. ID URL và endpoint phải validate theo [CONTENT_API](CONTENT_API.md); `mode=preview` là tùy chọn UI, không phải cơ chế phân quyền. Không ghi payload API, token hay thông tin cá nhân vào log/localStorage.

Backend auth/session, CSRF, database, upload, webhook, server rate limit và load test endpoint **không áp dụng trong repo frontend này**. Dịch vụ API chịu trách nhiệm quyền truy cập, expiry, CORS và quota của nó. Host tĩnh cần HTTPS/header phù hợp khi triển khai; hiện chưa có cấu hình host để xác minh. Secret/dependency scan chuyên dụng, quyền sử dụng asset và cấu hình triển khai phải được review trước phát hành; không coi cấu trúc thư mục hoặc test jsdom là bằng chứng an toàn đầy đủ.

## Kiểm tra và bàn giao

```powershell
npm.cmd ci
npm.cmd run check:standards
npm.cmd run audit:functions
npm.cmd run check:project
```

`check:standards` kiểm tra JSON, đường dẫn, docs, budget runtime và CSS token/fallback, ghi các command chưa chạy là SKIP/incomplete. `check:project` chạy thêm các gate thật đã khai báo trong [project-standards.json](../project-standards.json), gồm type/test, manifest, docs, BEM, build, bundle và audit hàm strict. Không trỏ quality command ngược vào chính orchestrator gây đệ quy. Các gate hiện tại chưa bao gồm lint, dependency audit, browser QA hoặc benchmark.

`npm.cmd run check:functions` kiểm tra mục tiêu 60 dòng bằng AST, hiện đạt và đã được thêm vào gate bắt buộc trong check:project. Snapshot cũ được giữ trong [STANDARDS_REVIEW](STANDARDS_REVIEW.md). Audit thường trả 0 để xuất báo cáo, không dùng nó làm bằng chứng tuân thủ hay thay cho strict gate.

Các script trong `scripts/standards/` được lấy từ bộ mẫu để dùng cấu hình dự án; không ghi đè checker manifest/BEM/build chuyên biệt đã có. Khi sửa engine chung cần thêm regression test tương ứng. Không thêm dependency/backend hoặc yêu cầu approval ngoài phạm vi chỉ vì mẫu có checklist.

Commit theo `[type]detail`, ví dụ `[feat]add synchronized opening fireworks`, `[fix]gate preview entry by URL mode`, `[docs]adapt project coding standards`. Không tự commit/push khi người dùng chưa yêu cầu. Bàn giao nêu lệnh đã chạy, phần chưa kiểm chứng và rủi ro còn lại; không công bố release-ready chỉ từ build/test.
