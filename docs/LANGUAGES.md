# Đa ngôn ngữ VI/EN và accessibility

Tiếng Việt mặc định, English là lựa chọn thứ hai. `tet-language` lưu trong localStorage; không suy từ vị trí. Nội dung UI, 8 lời chúc, nhãn vật treo, kiểu pháo và trạng thái cooldown, alt/aria-label, title và meta description được dịch theo ID. Chuyển ngôn ngữ không reset countdown, camera, tiến độ lời chúc hay chế độ pháo hoa.

Dùng StableText hoặc grid dự trữ kích thước cho các nhãn có độ dài khác nhau, nhất là countdown và thiệp. Kiểm tra 360/390/768/1440px. Dropdown có điều hướng bàn phím, Escape, focus restore. Dialog lời chúc có nút đóng rõ ràng. Âm thanh mặc định tắt, bật qua user gesture. Hỗ trợ `prefers-reduced-motion` và tránh hiệu ứng nhấp nháy liên tục.

## Bảng nhãn ví dụ
| VI | EN |
|---|---|
| Đếm ngược đến giao thừa | Countdown to Lunar New Year |
| Xem trước giao thừa | Preview New Year's Eve |
| Bắn pháo hoa | Launch fireworks |
| Cây Lộc Đầu Xuân | Spring Wishes Tree |
| Khám phá cây mai | Explore the apricot tree |
| Xem lời chúc | Read a wish |
| Quay lại | Back |
| Quay lại pháo hoa | Back to fireworks |
| Pháo chùm | Burst |
| Trái tim | Heart |
| Vòng tròn | Ring |
| Thác sáng | Waterfall |
| Tạm dừng tự bắn | Pause auto show |
| Tiếp tục tự bắn | Resume auto show |
| Phát lại 5 phút | Replay 5 minutes |
| Pháo chữ | Sky writing |
| Bắn chữ | Launch text |
| Chờ một chút | Please wait |

Nút kiểu pháo có nhãn truy cập rõ và trạng thái disabled khi vượt budget; không thông báo aria-live theo từng hạt/vụ nổ. Vật treo có tên lời chúc tương ứng; trạng thái đã xem không chỉ biểu thị bằng màu.







