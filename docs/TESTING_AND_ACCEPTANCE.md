# Kế hoạch QA và tiêu chí nghiệm thu

## Automated checks hiện có
- `npm run build`: TypeScript/Vite.
- `npm run check:content`: 8 wish IDs, 8 ornament IDs liên kết một-một với lời chúc/anchor; đủ VI/EN; 17 preset hình/cơ chế và giới hạn/rasterize chữ hợp lệ.
- `npm run check:assets`: file tồn tại, license, kích thước, texture, GLB decode.
- `npm run check:flow`: countdown/preview, đồng hồ show 5 phút/pause/replay, bắn pháo, qua lại cây/pháo hoa và lỗi asset.
- `npm run check:responsive`: DOM theo matchMedia tại 360/390/768/1440px: 20 lựa chọn, preset chung lưới, custom text cuối cùng và navigation. Không đo CSS clipping/hình ảnh.

## Test matrix
| Nhóm | Kịch bản | Kết quả mong đợi |
|---|---|---|
| Countdown | 23:59:59 → 00:00:00 VN | về 0, không âm, reveal một lần |
| Countdown | mở sau giao thừa | hiện năm mới và CTA vào pháo hoa |
| Preview | chạy trước Tết | 10 giây giả lập, đồng hồ thật không đổi; vào được toàn luồng |
| Tab | ẩn qua giao thừa hoặc khi đang bắn | cập nhật đúng thời gian, không phát dồn particle/âm thanh |
| Fireworks | bấm từng nút kiểu pháo | đúng chùm/trái tim/vòng tròn/thác sáng, nhận diện rõ trên mobile |
| Fireworks | phối hợp kiểu, spam click/keyboard | giới hạn chung và đồng thời có hiệu lực; phản hồi chờ, không hàng đợi vô hạn |
| Fireworks | hết 300 giây đang xem | dừng tự bắn, vẫn bắn tay và phát lại được; không tự chuyển cây |
| Navigation | qua cây khi đang tự bắn hoặc bắn tay, quay lại nhiều lần | dọn hiệu ứng, không trùng timeline; quay lại tiếp tục thời gian show còn lại, không lặp countdown/reveal |
| Tree | chọn đủ 8 vật treo, xoay cây | đúng ID/nội dung; không vật nào bị che vĩnh viễn, không mở nhầm khi drag |
| Tree | click hoa mai nền | không mở thiệp; chỉ vật treo hoặc nút DOM nhận tương tác |
| Persistence | refresh, đổi VI/EN, qua lại cảnh | giữ đúng ID đã xem, không bắt đọc đủ để điều hướng |
| Storage | JSON hỏng hoặc bị chặn | fallback an toàn, toàn luồng vẫn dùng được |
| Loading | mất model/shader, Retry, context lost/restored | có phản hồi/fallback, không mắc ở cảnh trống hoặc mất tiến độ |
| Mobile | touch, portrait, landscape | nút không che vùng nổ/vật treo, vùng chạm đủ lớn |
| A11y | keyboard, dialog Escape/focus restore, no audio | hoàn thành toàn luồng |
| Reduced motion | bắn từng kiểu, chuyển cảnh | giữ quyền điều khiển, giảm chuyển động/flash |
| Fallback | không WebGL2 | đủ kiểu pháo CSS/Canvas2D, đọc đủ 8 lời chúc bằng DOM, qua lại cảnh |

## Ngân sách và đo đạc
Ngân sách trong MODEL_DESIGN là mục tiêu chưa kiểm chứng. Đo Android tầm trung, iPhone Safari và desktop; ghi median FPS, 1% low, peak GPU memory ước tính, LCP, JS bundle và bytes asset. Đo riêng khi phối hợp nhiều kiểu và khi chạm giới hạn đồng thời; xác nhận particle pool không tăng vô hạn. Không công bố FPS cố định khi chưa benchmark.

## Definition of Done
Không có lỗi chặn luồng; nội dung/bản dịch đủ; countdown chuẩn; tự bắn đủ kiểu và ở lại cảnh theo ý muốn; 8 vật treo mở đúng lời chúc; qua lại cảnh giữ tiến độ; touch/keyboard/fallback hoạt động; asset nguồn và giấy phép có thể tái tạo; hoàn thành test matrix.

## Nghiệm thu cảnh và pipeline Blender MCP
- Không có mô hình/rig/animation nhân vật hoặc dependency bắt buộc vào asset nhân vật.
- Master .blend, script tạo/export, tham số hiệu ứng và ảnh tham chiếu được lưu để tái tạo.
- GLB đúng tỷ lệ/trục, normal, vật liệu, texture và anchor vật treo; không phụ thuộc simulation Blender chưa chuyển sang runtime.
- So sánh camera, bố cục, ánh sáng và hình pháo hoa trong trình duyệt với tham chiếu Blender ở desktop/mobile; duy trì ngân sách hiệu năng.


## Kết quả local — 2026-11-10
- npm.cmd run check: TypeScript, 40 kiểm thử logic/content API/pháo hoa/cảnh và 54 kiểm thử tích hợp React trong jsdom.
- Tích hợp đã kiểm tra: preview/reveal, màn tự bắn 5 phút/pause/replay, các nút hình/chữ và cooldown, không tự chuyển cảnh, đọc đủ 8 lời chúc, VI/EN, quay lại pháo hoa, storage hỏng, API chậm/timeout và bỏ phản hồi cũ khi đổi ID.
- npm.cmd run check:assets: checksum, nguồn/giấy phép, GLB header, giải mã bằng Three.js, gộp geometry theo material và tỷ lệ/trục xuất.
- npm.cmd run check:docs: liên kết cục bộ và đủ danh mục README; check:bem: cú pháp tên class CSS.
- npm.cmd run build và check:build: build tĩnh, không preload Three.js trước khi cần, entry JavaScript dưới 400 KB chưa gzip.

Chưa kiểm chứng shader trên GPU trình duyệt, touch/keyboard trên thiết bị thật, clipping/occlusion từng viewport, focus trap native, reduced motion thực tế, CORS production hoặc FPS/bộ nhớ. jsdom mock Canvas/WebGL/dialog chỉ kiểm tra logic DOM; không tạo ảnh và không xác nhận độ đẹp hay độ mượt. Test matrix phía trên vẫn là điều kiện trước phát hành.


Bộ nội dung hiện có 8 lời chúc. Kiểm thử tích hợp bao gồm vòng trước/sau ở hai đầu danh sách và chuyển tiến độ cũ: giữ ID hợp lệ, loại ID ngừng dùng và ID trùng, không vượt 8/8.


## Bổ sung kiểm tra pháo hoa
Đã kiểm tra đồng hồ đúng 300.000ms đang xem, dừng phát sau kết thúc, replay và không phát dồn khi tab ẩn hoặc quay lại cây. Kiểm tra 17 preset và timeline, giới hạn điểm chữ, NFC/grapheme tiếng Việt, từ chối chữ rỗng/quá 24 ký tự/emoji/markup; giao diện truyền điểm chữ vào renderer và bỏ thao tác chuẩn bị chữ nếu rời cảnh. jsdom mock phần rasterize UI; kiểm tra bitmap dùng dữ liệu alpha tổng hợp. Vẫn cần QA thực tế chữ tiếng Việt, clipping, shader, nhịp sáng, layout 20 icon/ô nhập và GPU xuyên suốt 5 phút trên desktop/mobile.



## Kiểm tra cơ chế nổ và SFX
Đã kiểm tra: tên lửa chưa nổ trước đỉnh; một quả mẹ và sáu nhánh con bay/nổ riêng; quạt năm quả lệch thời gian; liễu có tuổi/vệt dài hơn; tám cụm crackle. Kiểm tra mọi plan trong giới hạn 9 giây và 30.000 điểm cho tám gói. AudioContext giả xác nhận tiếng rít tại lúc phóng, boom tại đỉnh, sáu pop theo lịch con, mặc định im lặng, hủy voice khi mute/ẩn tab và tối đa 80 voice. Chưa nghe/nhìn trên thiết bị thật nên chưa kết luận chất lượng SFX hoặc độ mượt GPU.


## Cảnh nhà và trăng
Kiểm tra tự động sceneVisibility cho reveal/pháo hoa/chuyển cảnh; integration xác nhận trăng 2D hiện ở nhà/cây và biến mất ở pháo hoa. check:assets kiểm tra câu đối mesh, nồi bánh chưng, bánh gói lá, đèn cổng, bóng dây và quả quất trong GLB, cùng khả năng batch geometry thực tế. Đã xem cảnh nhà/sân bằng Blender MCP; chưa xác minh riêng hơi nước/lửa và độ sáng trong trình duyệt thực tế.


## Loạt pháo chữ theo ký tự
Đã kiểm tra bố cục glyph giữ khoảng cách và baseline/dấu, một quả cho mỗi ký tự hiển thị, tất cả phóng lúc 0 và nổ lúc 1,5 giây, alpha giữ sáng đủ đọc, reduced motion không rút ngắn thời gian đọc. Kiểm tra fit màn hình dọc/ngang, pháo tự động và bắn tay tiếp tục trong khi chữ hiển thị, không hủy âm thanh đang phát. Audio mock kiểm tra mọi ký tự phóng/nổ cùng thời điểm. Rasterize UI vẫn mock trong jsdom; cần xem nét chữ thật và mật độ hạt trên GPU/Canvas2D.



## Vị trí bảng bắn pháo
Đã kiểm tra ba lựa chọn desktop, aria-pressed, lưu/khôi phục và fallback dữ liệu không hợp lệ. Kiểm thử chuyển media sang mobile: bảng luôn bottom, không có nhóm chọn vị trí, các nút chỉ SVG nhưng vẫn có accessible name, nội dung ô chữ được giữ và preference desktop không bị ghi đè; chuyển lại desktop khôi phục cạnh trái. DOM test không thay thế QA clipping, chiều cao vùng cuộn hoặc vùng chạm trên trình duyệt thực tế.


Kiểm tra quy chuẩn: npm.cmd run check:standards chỉ chạy tĩnh và ghi quality commands chưa thực thi là incomplete; npm.cmd run check:project chạy đủ gate trong project-standards.json. Audit hàm bằng TypeScript AST có 3 regression test; hiện còn 4 mục vượt 60 dòng trong STANDARDS_REVIEW.md, chưa coi là tuân thủ toàn bộ quy chuẩn code.

## Rà soát quy chuẩn và hồi quy ngày 2026-11-10

94 kiểm thử (41 Node + 55 React) bao gồm retry sau lazy import bị reject, giữ bản nháp/form khi đổi cảnh, tab ẩn qua giao thừa thật không có mode, notice lỗi tách khỏi lưới và tự ẩn sau 4 giây, vị trí custom text cuối cùng tại bốn kích thước DOM và dữ liệu hình học cây mai hữu hạn/tái lập. Gate check:functions không có finding; manifest kiểm tra cả độ phủ file runtime, số byte, checksum, nguồn và license. Không coi các kiểm tra này là QA hình ảnh hoặc benchmark GPU.
