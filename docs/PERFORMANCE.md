# Hiệu năng và tài nguyên

**Trạng thái:** mục tiêu thiết kế, chưa có benchmark của dự án. Tập trung vào môi trường và pháo hoa tương tác; không có mô hình nhân vật, rig hoặc animation nhân vật.

## Asset và pipeline
Dùng Blender MCP để dựng/tinh chỉnh môi trường, tạo mẫu hiệu ứng và render tham chiếu theo [LOCAL_3D_TOOLS](LOCAL_3D_TOOLS.md). Giữ master .blend và script trong art/blender; frontend chỉ tải asset đã xuất/tối ưu, không tải file .blend hoặc kết nối trực tiếp Blender MCP khi người dùng mở website.

Render offline không phải bằng chứng về tốc độ runtime. Simulation, Geometry Nodes và compositor cần bake/chuyển đổi hoặc tái tạo bằng Three.js tùy loại; pháo hoa tự bắn dùng particle pool/shader trên web.

## Mục tiêu ban đầu
- Initial payload compressed < 5 MB trên mạng mobile tốt.
- Texture GPU mục tiêu < 100 MB.
- Draw calls mục tiêu < 150 desktop / < 100 mobile.
- DPR mobile cap 1–1.5, desktop cap 2; hiệu chỉnh bằng đo thực tế.

Đây là mục tiêu chưa kiểm chứng, thống nhất với [MODEL_DESIGN](MODEL_DESIGN.md). Ưu tiên baked lighting/AO, instancing hoa, geometry/material reuse, ít shadow động. Giảm mật độ hạt, bloom và shadow trước khi làm mất hình dạng pháo hoặc khả năng nhận diện vật treo.

## Render và tương tác
Pool particle có kích thước giới hạn, cooldown chung và giới hạn vụ nổ đồng thời; bỏ yêu cầu vượt budget, không xếp hàng vô hạn. Chuyển cây/pháo hoa hủy timeline và dọn hiệu ứng cũ. Dừng render/âm thanh khi tab ẩn. Tái dùng tài nguyên phù hợp và dispose khi không cần.

Tải theo critical/soon/on demand, không chặn countdown bởi chi tiết cây chưa cần. Không có WebGL2 vẫn bắn được từng kiểu bằng CSS/Canvas2D và đọc đủ lời chúc qua DOM. Xem [SCENE_LOADING](SCENE_LOADING.md).

## Đo đạc
Đo Android tầm trung, iPhone Safari và desktop: tải lạnh/ấm, LCP, bytes JS/asset, median FPS, 1% low và bộ nhớ GPU ước tính. Kiểm tra khi phối hợp nhiều kiểu, spam nút và qua lại cảnh nhiều lần. Ghi thiết bị, browser, quality profile và particle limit cùng kết quả. Không tuyên bố đã đạt FPS hoặc dung lượng khi chưa đo. Xem [QA](TESTING_AND_ACCEPTANCE.md).

## Kiểm tra bản triển khai local — 2026-11-07
- GLB nhà mới: 1.116.824 byte, 17.816 triangles, 291 mesh gộp thành 10 nhóm vật liệu. GLB sân mới: 1.617.964 byte, 16.932 triangles, 485 mesh gộp thành 16 nhóm. Không có texture ngoài; đã giải mã và gộp bằng cùng helper Three.js với runtime.
- React được tách khỏi scene-libs; HTML đầu không preload Three.js/World. check:build giới hạn JavaScript tĩnh đầu ở 400.000 byte; kết quả build khoảng 252 KB chưa gzip. Khi có WebGL2, cảnh đầu vẫn cần tải các chunk 3D, không đồng nghĩa đã đạt thời gian tải tương tác.
- Hoa mai, gạch sân, cỏ, thân/lá tre dùng instancing. Fireworks dùng một Points với tối đa 30.000 điểm hiển thị (gồm vệt tàn), giới hạn 8 gói pháo đang hoạt động (tự bắn tối đa 6, dành 2 cho người dùng) và cooldown thủ công 400ms; mobile giảm số hạt.
- Chunk Three.js vẫn trên 500 KB và có cảnh báo của Vite. Font Noto Serif bản đầy đủ khoảng 1,89 MB; chưa subset để giảm tải.
- Chưa đo FPS, frame time, LCP hoặc GPU memory trên thiết bị thật. Chưa hoàn tất QA hình ảnh trong trình duyệt do công cụ browser/computer-use không hoạt động; build, kiểm tra logic và DOM test không thay thế bước này.


Màn diễn tự bắn chạy 5 phút đang xem; điểm/vụ nổ vẫn bị giới hạn, không tích lũy toàn bộ lịch bắn. Pháo chữ rasterize theo yêu cầu thành tối đa 2.400 điểm, chia theo từng ký tự, bỏ kết quả nếu rời cảnh. Cần đo lại GPU/FPS sau thay đổi tăng độ sáng, kích thước, số điểm và thời lượng; chưa coi các giới hạn này là bằng chứng đạt hiệu năng mobile.



Chữ mesh có thể không có UV; batchScene.mjs chuẩn hóa layout geometry trước khi gộp. Hơi nước dùng một Points 24 điểm; lửa dùng một InstancedMesh 7 ngọn nhỏ. Thêm ba point light không shadow (hai đèn cổng và bếp), không tạo light cho mọi bóng dây đèn. Cần benchmark lại sau khi tăng chi tiết và ánh sáng; dữ liệu asset không thay thế phép đo GPU.


Pháo chữ bắn đồng thời với các kiểu khác; không xóa gói đang vẽ hoặc dừng tự bắn. Chỉ cho một gói chữ trong vòng đời 9 giây, cùng ngân sách tám gói/30.000 điểm. Baseline, layout và thời điểm nổ dùng chung giữa WebGL/2D/audio. Cần kiểm tra thực tế độ rõ chữ khi bắn đồng thời nhiều hiệu ứng.


