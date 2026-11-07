# Cây Lộc Đầu Xuân — 8 vật trang trí treo và lời chúc

Con dê đứng thứ 8 trong 12 con giáp, vì vậy cây mai có 8 lời chúc cho chủ đề Đinh Mùi. Giữ các ID wish-01 đến wish-08 để bảo toàn tiến độ của các lời chúc còn lại.

## Tương tác
Cây mai có 8 vật trang trí treo trên cành (thiệp, thẻ chúc, đèn lồng nhỏ, nút thắt may mắn), mỗi vật có ornamentId và wishId cố định. Bố trí dễ thấy từ nhiều góc, tách rõ khỏi hoa mai nền. OrbitControls giới hạn để không nhìn xuyên nền; hover/focus làm vật treo nổi bật; tap/click vào vật treo mở thiệp HTML. Danh sách 8 nút là đường truy cập thay thế cho raycast. Đã xem được đánh dấu bằng vòng sáng nhỏ; không xóa khi đổi ngôn ngữ.

## Nội dung tiếng Việt đề xuất
| ID | Chủ đề | Lời chúc |
|---|---|---|
| wish-01 | Bình an | Chúc một năm bình an, mỗi ngày đều có nơi để trở về. |
| wish-02 | Sức khỏe | Chúc bạn và gia đình mạnh khỏe, an nhiên qua bốn mùa. |
| wish-03 | Hạnh phúc | Mong niềm vui nhỏ luôn ghé thăm ngôi nhà của bạn. |
| wish-04 | Tài lộc | Chúc công việc thuận lợi, tài lộc đủ đầy và bền vững. |
| wish-05 | Thành công | Mong những cố gắng của bạn nở hoa trong năm mới. |
| wish-06 | Gia đình | Chúc những bữa cơm sum họp luôn đầy ắp tiếng cười. |
| wish-07 | Tình yêu | Chúc trái tim luôn được trân trọng và yêu thương. |
| wish-08 | Bạn bè | Mong những tình bạn tốt đẹp tiếp tục đồng hành. |

## Dữ liệu
Lời chúc: `{id,title,body,anchorId,theme}`; vật treo: `{id,wishId,anchorId,kind,position,rotation,scale}`; dịch EN cùng ID. Không phụ thuộc thứ tự mảng. Session/local storage chỉ lưu ID hợp lệ. Thiệp có nút đóng, trước/sau, quay lại cây và quay lại cảnh pháo hoa.

## Chấp nhận
Đúng 8 vật treo tương tác, không có điểm bị che vĩnh viễn; mở được bằng touch/keyboard; xem hết 8 lời chúc; đổi VI/EN không mất tiến độ; không cần zoom chính xác vào mesh nhỏ. Hoa mai nền không nhận raycast; hitbox vật treo lớn hơn hình hiển thị. Phân biệt drag xoay cây với tap để không vô tình mở thiệp. Dialog có Escape, focus trap và trả focus về vật/nút đã chọn. Không cần xem đủ 8 lời chúc mới được quay lại pháo hoa.


## Nội dung từ API tùy chọn
Theo [CONTENT_API](CONTENT_API.md), title/body VI/EN có thể được ghi đè theo wishId; vẫn giữ đúng 8 vật treo và anchor cục bộ. Frontend đã hỗ trợ nguồn API tùy chọn; chưa xác minh backend production. Khi cấu hình API, các nút mở thiệp mesh/DOM chờ nội dung hoặc timeout rồi dùng fallback; countdown và bắn pháo không bị chặn. Tiến độ được lưu theo bộ nội dung và endpoint, không dùng chung cho mọi ID URL.




## Chuyển từ bộ nội dung cũ
Khi đọc tiến độ đã lưu, chỉ giữ wish-01 đến wish-08 và loại ID không còn dùng; không reset các lời chúc hợp lệ đã xem. API bỏ qua ID ngoài bộ 8 lời chúc, không tạo thêm vật treo.



