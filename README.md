# Lunar New Year 2027 — Xuân An Yên

Website trải nghiệm Tết Đinh Mùi 2027: khung cảnh nhà Việt 3D, pháo hoa tương tác và 8 lời chúc trên cây mai. React 19 + TypeScript + Vite + Three.js/R3F; môi trường nhà dựng bằng Blender MCP. Không sử dụng mô hình nhân vật.

## Mục lục
- [docs/CSS_TOKENS.md](docs/CSS_TOKENS.md)
- [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/SCENE_DESIGN.md](docs/SCENE_DESIGN.md)
- [docs/FRAMING_AND_LIGHTING.md](docs/FRAMING_AND_LIGHTING.md)
- [docs/MODEL_DESIGN.md](docs/MODEL_DESIGN.md)
- [docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- [docs/BEM.md](docs/BEM.md)
- [docs/FIREWORKS_SPEC.md](docs/FIREWORKS_SPEC.md)
- [docs/TREE_WISHES.md](docs/TREE_WISHES.md)
- [docs/CONTENT_API.md](docs/CONTENT_API.md)
- [docs/SCENE_LOADING.md](docs/SCENE_LOADING.md)
- [docs/LANGUAGES.md](docs/LANGUAGES.md)
- [docs/LOCAL_3D_TOOLS.md](docs/LOCAL_3D_TOOLS.md)
- [docs/PROJECT_CLEANUP.md](docs/PROJECT_CLEANUP.md)
- [docs/TESTING_AND_ACCEPTANCE.md](docs/TESTING_AND_ACCEPTANCE.md)
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)

## Quyết định chính
- Tập trung vào khung cảnh, ánh sáng và hiệu ứng; không sử dụng mô hình nhân vật.
- Cho phép dùng Blender MCP để dựng/tinh chỉnh cảnh, vật liệu, camera và mẫu hiệu ứng; quy trình tại [LOCAL_3D_TOOLS](docs/LOCAL_3D_TOOLS.md).
- Một môi trường 3D liên tục: căn nhà → pháo hoa → cây mai; từ cây có thể quay lại pháo hoa.
- Countdown thật đến 00:00 ngày 06/02/2027, múi giờ Việt Nam; có chế độ preview 10 giây. Camera bắt đầu chuyển khi còn 3 giây; pháo hoa phóng ngay tại mốc 0.
- Pháo hoa là cảnh trọng tâm: màn tự bắn 5 phút, 17 kiểu hình/cơ chế bằng icon, có Dê Đinh Mùi và pháo chữ tối đa 24 ký tự (hỗ trợ tiếng Việt).
- Số 8 gắn với vị trí con dê trong 12 con giáp. Nhấn 8 vật trang trí treo trên cây mai để đọc 8 lời chúc; có VI/EN và fallback không WebGL2.
- API nội dung tùy chọn cung cấp lời chúc VI/EN theo 8 ID cố định; luôn có nội dung cục bộ khi không có API hoặc tải lỗi.
- Không có cảnh bàn lì xì hoặc mini game rút lì xì.
- Thông số camera, ngân sách hiệu năng và animation là mục tiêu đề xuất, phải hiệu chỉnh qua QA.




## Chạy dự án
Yêu cầu Node.js 22.22.2+ thuộc nhánh 22 LTS (đã kiểm tra trên 22.23.0) hoặc Node.js 24.15+ thuộc nhánh 24 LTS, và npm.

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở địa chỉ Vite in ra (mặc định http://127.0.0.1:5173). Trước Tết, mở URL với ?mode=preview (hoặc &mode=preview khi đã có query) rồi chọn “Xem trước giao thừa” để chạy preview 10 giây và khám phá đầy đủ trải nghiệm. Pháo hoa tự bắn trong 5 phút, có tạm dừng/phát lại; vẫn bắn thủ công bằng icon trong lúc màn diễn chạy. Chọn Tên lửa để xem bay lên rồi nổ, Nổ liên hoàn để xem quả mẹ tách thành chùm nổ phụ, hoặc Liễu rủ/Lách tách/Quạt liên thanh. Nhấn “Bật âm thanh pháo hoa” để nghe tiếng rít, nổ trầm và nổ phụ theo từng pha. Âm lượng có thanh kéo 0–100% và nút −/+ mỗi bước 10%, tự ghi nhớ mức đã chọn; mobile mở thanh qua icon âm lượng. Hai icon CM/NM và 20/27 bắn ngay “Chúc mừng năm mới” và “2027”. Icon pháo chữ mở ô nhập tối đa 24 ký tự. Chữ hiện lớn giữa màn hình: mỗi ký tự một quả, bay theo hàng và cùng nổ; pháo tự động và bắn tay vẫn tiếp tục đồng thời. Tự chuyển sang cây mai khi muốn, quay lại tiếp tục thời lượng còn lại. Tại cây, chạm vật treo hoặc mở danh sách lời chúc; kéo để xoay, có nút đặt lại góc nhìn. VI/EN, âm thanh opt-in và tiến độ lời chúc được hỗ trợ. Khi 3D không sẵn sàng, ứng dụng chuyển sang cảnh 2D cùng chức năng chính.

## Kiểm tra và build
```powershell
npm.cmd run check
npm.cmd run check:assets
npm.cmd run check:docs
npm.cmd run check:bem
npm.cmd run build
npm.cmd run check:build
npm.cmd run preview
```

Build tĩnh ở dist/. Có thể phục vụ từ web host hỗ trợ HTTPS. Bản build và 55 kiểm thử tự động đã được kiểm tra; chưa hoàn tất QA hình ảnh trong trình duyệt hoặc benchmark thiết bị thật, chưa coi là release candidate. Three.js vẫn có cảnh báo chunk trên 500 KB.

## Nội dung API
Sao chép [.env.example](.env.example) thành .env.local nếu cần API. Để trống URL để dùng 8 lời chúc cục bộ; không cần backend để trải nghiệm. Hợp đồng, ID URL, timeout và fallback tại [CONTENT_API](docs/CONTENT_API.md). Chưa xác minh với backend production.

## Asset và Blender
- Master: art/blender/xuan-an-yen.blend; script tái tạo: art/blender/build_environment.py. Có thể đặt biến môi trường TET_PROJECT_ROOT trước khi chạy script ở checkout khác.
- GLB web: public/models/tet-house.glb (~1,12 MB) và public/models/tet-courtyard.glb (~1,62 MB). Nhà chính rộng hơn và nhà phụ hai gian, hiên và đèn riêng; nhà có câu đối chữ Việt và biển chúc Tết; sân có nồi bánh chưng/bếp củi, bánh gói lá, cúc, quất, hàng rào, đèn cổng và dây đèn. Vật liệu PBR/emissive không cần texture ngoài; runtime gộp theo material (10 nhóm nhà + 16 nhóm sân).
- Cây mai, hoa instancing, vật treo và pháo hoa được dựng bằng Three.js; không phụ thuộc kết nối Blender khi người dùng truy cập web.
- Manifest checksum/nguồn/giấy phép: public/asset-manifest.json; cập nhật bằng node scripts/asset-manifest.mjs sau khi thay asset.
- Font tiếng Việt được lưu cục bộ, giấy phép SIL OFL trong public/fonts/. Âm thanh tổng hợp bằng Web Audio, không tải audio bên ngoài.

Chưa tự commit hoặc push các thay đổi triển khai lên repository GitHub.








Trong cảnh pháo hoa và các đoạn chuyển camera liên quan, mặt trăng và nguồn sáng trăng được tắt ở cả 3D/2D. Cảnh nhà/cây vẫn có trăng. Nồi bánh chưng có hơi nước và lửa nhẹ trên web, reduced motion giữ hiệu ứng tĩnh.





Bảng bắn pháo trên desktop có nút chọn phía dưới/bên trái/bên phải và ghi nhớ lựa chọn. Mobile cố định phía dưới, nút chỉ hiển thị icon (vẫn có nhãn truy cập và vùng chạm 44px); đồng hồ còn lại vẫn hiển thị. Quay lại desktop khôi phục vị trí đã chọn.


Logo đỏ–vàng kim kết hợp đầu dê và 2027 dùng ở header; favicon chỉ có đầu dê. PNG nền trong suốt, bản gốc và hướng dẫn xuất kích thước nằm trong [art/branding](art/branding/README.md).

Project structure, asset budgets and executable quality gates are configured in project-standards.json. Run npm.cmd run check:standards for static checks or npm.cmd run check:project for the configured commands.
