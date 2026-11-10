# Đa ngôn ngữ VI/EN và accessibility

Tiếng Việt mặc định, English là lựa chọn thứ hai. `tet-language` lưu trong localStorage; không suy từ vị trí hoặc theme. Chỉ nhận `vi`/`en`; giá trị khác về `vi`. Chuyển ngôn ngữ không reset countdown, camera, tiến độ lời chúc, form hay chế độ pháo hoa.

Nhãn UI, loading/error, tooltip, accessible name và metadata nằm trong `src/i18n/vi.json` và `en.json`, cùng tập key ổn định. `src/i18n/index.ts` sở hữu allowlist và translator; EN có fallback VI cho message thiếu/rỗng, kiểm thử phải phát hiện thiếu key trước bàn giao. Không tự ghép locale vào đường dẫn import. Message động dùng placeholder như `fireworks.launchPreset` với `{name}`; không ghép tiền tố dịch và tên để tạo cả câu. Render dưới dạng text React, không dùng HTML thô.

Catalog dữ liệu miền giữ nơi sở hữu riêng: 8 lời chúc tại `src/data/wishes.json`/CONTENT_API, tên preset trong `src/lib/experience.mjs`. Chữ người dùng gõ và hai mẫu “Chúc mừng năm mới”/“2027” là nội dung pháo, không tự dịch theo UI. Tên riêng Xuân An Yên, mã 2027 và tên ngôn ngữ VI/EN không đổi.

Locale không đổi mốc `2027-02-06T00:00:00+07:00`. Countdown/đồng hồ show dùng bộ số có độ rộng cố định; đơn vị và nhãn theo catalog. HTML lang, title và description cập nhật theo lựa chọn. Không có route locale/SSR/RTL trong phạm vi hiện tại.

Dùng grid/kích thước phù hợp với nhãn dài, nhất là countdown và thiệp. Kiểm tra 360/390/768/1440px. Bộ chọn VI/EN là nút có aria-pressed; dialog có nút đóng, Escape và focus restore. Âm thanh mặc định tắt, bật qua user gesture. Hỗ trợ reduced motion và tránh nhấp nháy liên tục.

Test i18n kiểm tra parity key/placeholder, allowlist và interpolation; integration kiểm tra đổi locale giữ tiến độ/metadata. Chưa tự động đánh giá chất lượng dịch, SEO hoặc layout browser. Ma trận thực tế là VI/EN × theme đêm cố định, không phải các theme chưa triển khai.

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







