# XUÂN AN YÊN — Đặc tả sản phẩm Tết Đinh Mùi 2027

**Trạng thái:** đã có triển khai nền tảng; đang chờ QA hình ảnh và benchmark thiết bị thật. **Múi giờ:** Asia/Ho_Chi_Minh. **Giao thừa:** 2027-02-06T00:00:00+07:00.

## Mục tiêu
Ngôi nhà Việt ấm áp dưới bầu trời đêm, đèn lồng và cây mai. Pháo hoa tương tác là cảnh trọng tâm: người dùng bấm nút để bắn từng kiểu theo ý muốn. Tại cây mai, nhấn các vật trang trí treo để đọc 8 lời chúc. Không có cảnh bàn lì xì, rút thưởng hay kết quả ngẫu nhiên. Dự án tập trung vào khung cảnh, ánh sáng và hiệu ứng; không sử dụng mô hình nhân vật, rig hoặc animation nhân vật.

## Luồng chính
`LOADING → COUNTDOWN → FIREWORKS → TREE_TRANSITION → TREE_EXPLORE`.

- **LOADING:** che Canvas đến khi môi trường/GPU sẵn sàng; lỗi có Retry.
- **COUNTDOWN:** tính ngày/giờ/phút/giây từ thời gian thực, nhà hiện phía sau; có bật âm thanh và “Xem trước giao thừa”.
- **3 giây cuối:** visual phase COUNTDOWN_PREPARE ngẩng camera lên bầu trời, countdown tiếp tục. Tại 0 giây chuyển thẳng FIREWORKS, bắn lượt đầu ngay; lời chúc năm mới hiện đồng thời dưới dạng overlay không chặn tương tác, không có pha reveal trì hoãn màn diễn.
- **FIREWORKS:** màn tự bắn 5 phút có tạm dừng/phát lại; vẫn bắn thêm bằng 17 icon hình/cơ chế hoặc nhập pháo chữ tối đa 24 ký tự tiếng Việt. Không tự rời cảnh; có navigation “Pháo hoa / Lời chúc”. Chi tiết tại FIREWORKS_SPEC.md.
- **TREE_TRANSITION:** camera về cây; khóa điều khiển trong transition, ánh trời dịu đi.
- **TREE_EXPLORE:** xoay cây, chọn 8 vật trang trí treo có ID cố định để mở thiệp VI/EN, lưu tiến độ; có danh sách DOM thay thế.

Từ cây, chọn “Pháo hoa” trong navigation đi qua `FIREWORKS_TRANSITION → FIREWORKS`, không lặp countdown/reveal hoặc xóa tiến độ; tiếp tục thời lượng tự bắn còn lại (giữ trạng thái tạm dừng nếu người dùng đã dừng). Không cần đọc đủ 8 thiệp mới được quay lại.

## Trước/sau giao thừa và lưu trạng thái
- Trước mốc: countdown thật; preview 10 giây có nhãn rõ, không sửa đồng hồ thật; sau preview khám phá đầy đủ pháo hoa/cây.
- Tại/sau mốc: không hiện số âm. Mở trang sau giao thừa hiện lời chúc năm mới và CTA vào pháo hoa, không tự phát âm thanh.
- Tab ẩn dừng render/âm thanh; khi trở lại tính lại thời gian, không phát dồn hiệu ứng đã trễ.
- Refresh giữ ngôn ngữ, tùy chọn âm thanh và ID lời chúc đã xem; không bắt xem lại toàn bộ mở đầu.
- MVP dùng giờ client; đồng bộ qua endpoint máy chủ nằm ngoài phạm vi.

## Dữ liệu và khả năng truy cập
8 lời chúc có ID ổn định, mỗi lời gắn một vật treo và anchor riêng; nội dung không chọn ngẫu nhiên. Mỗi kiểu pháo có ID và nhãn VI/EN. Âm thanh mặc định tắt, bật qua user gesture. Toàn luồng hỗ trợ touch, keyboard, reduced motion và fallback 2D.

## Tiêu chí hoàn thành
- Countdown đúng mốc Việt Nam, không âm, đúng khi đổi tab; preview không khóa người dùng trước Tết.
- Mỗi nút pháo tạo đúng kiểu; bắn lặp/phối hợp trong giới hạn tải và không tự chuyển cảnh.
- 8 vật treo đều mở được bằng touch/keyboard; lưu đúng ID, đổi VI/EN không mất tiến độ.
- Qua lại cây/pháo hoa không chạy trùng timer hay mất trạng thái.
- Hoàn thành luồng trên 360px và khi không có WebGL2; không có lỗi chặn luồng.
- FPS, bộ nhớ và dung lượng được đo trên thiết bị thật trước phát hành.

## Công cụ tạo cảnh và hiệu ứng
Cho phép agent sử dụng Blender MCP để dựng/chỉnh môi trường và đạo cụ, thiết lập vật liệu/ánh sáng/camera, tạo mẫu pháo hoa, render kiểm tra và xuất asset trong phạm vi dự án. Xem [quy trình Blender MCP](LOCAL_3D_TOOLS.md). Hiệu ứng tương tác được triển khai bằng Three.js trên web và đối chiếu với tham chiếu Blender; không mặc định simulation/shader Blender xuất nguyên vẹn sang glTF.







Nút xem trước trước giao thừa chỉ hiển thị khi query mode=preview (khớp chính xác giá trị). Khi countdown thật đã kết thúc, luôn hiện nút Thắp sáng bầu trời kể cả không có mode=preview; bấm để vào màn diễn. Tham số mode không thay đổi mốc Tết thật, không can thiệp content ID i và không tự bật âm thanh.

Điều hướng hai cảnh nằm trên tiêu đề cảnh: Pháo hoa và Lời chúc luôn hiện, mục hiện tại được nhấn sáng/vạch trượt và aria-current=page. Không điều hướng lại khi chọn cảnh đang xem, khóa cả hai trong camera transition; không reset show, form/tiến độ khi quay lại. Navigation chỉ xuất hiện sau khi vào trải nghiệm, không mở đường bỏ qua countdown hoặc điều kiện mode=preview.
