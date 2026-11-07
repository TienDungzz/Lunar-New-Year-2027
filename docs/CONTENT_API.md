# API nội dung lời chúc — Xuân An Yên

_Cập nhật: 2026-11-06. Frontend đã triển khai đọc API tùy chọn; dự án không tạo backend. Chưa xác minh với API production._

## Phạm vi
API tùy chọn cung cấp nội dung VI/EN cho 8 lời chúc trên 8 vật trang trí treo của cây mai. Không thay đổi luồng countdown → pháo hoa tương tác → cây mai. Không có nội dung ngôi sao, nhân vật, cầu ảnh, quả cầu, rút lì xì hoặc xuất ảnh kỷ niệm.

Khi không cấu hình API, dự án dùng trọn bộ nội dung cục bộ theo [TREE_WISHES](TREE_WISHES.md). Không cần backend để bắn pháo hoa, xoay cây hay đọc lời chúc. API chỉ ghi đè văn bản lời chúc; không cung cấp model, shader, script, preset pháo hoa, thời điểm giao thừa hoặc vị trí vật treo.

## Cấu hình
Sao chép [.env.example](../.env.example) thành .env.local, đặt các biến sau rồi khởi động lại Vite:

~~~dotenv
VITE_CONTENT_API_URL=https://api.example.com/tet-content/{id}
VITE_CONTENT_ID_PARAM=i
~~~

Ví dụ URL trang: `https://your-site.example/?i=abc123`. Tham số mặc định `i` mang ID bộ nội dung, không phải wishId. ID gồm 1–128 ký tự ASCII chữ, số, gạch dưới hoặc gạch ngang, phân biệt hoa/thường. Thiếu ID, ID sai hoặc tham số ID lặp thì dùng nội dung cục bộ, không gọi API. Tên tham số cấu hình phải khớp `[A-Za-z][A-Za-z0-9_-]{0,31}`; cấu hình sai thì dùng mặc định `i`.

Endpoint có đúng một `{id}` thì thay bằng ID đã encode. Nếu không có placeholder, thêm/thay query parameter theo tên đã cấu hình, giữ các tham số khác. Placeholder lặp hoặc cấu hình URL sai thì dùng nội dung cục bộ, không request. Chấp nhận đường dẫn cùng origin hoặc URL HTTP(S) tuyệt đối; không chấp nhận URL có username/password hoặc fragment. Production dùng HTTPS, HTTP chỉ dành cho phát triển cục bộ; tránh mixed content.

Để trống VITE_CONTENT_API_URL khi chưa có API: không gọi backend giả. VITE_* là cấu hình công khai nhúng lúc build, không chứa khóa bí mật. API khác origin cần CORS cho origin website.

## Hợp đồng JSON
Payload trực tiếp hoặc bọc đúng một lớp `{"data": payload}`. `schemaVersion` bắt buộc bằng 1; thiếu/sai phiên bản thì fallback toàn bộ. Ví dụ ghi đè một phần:

~~~json
{
  "schemaVersion": 1,
  "wishes": {
    "wish-01": {
      "title": {"vi": "Bình an", "en": "Peace"},
      "body": {
        "vi": "Chúc một năm bình an, mỗi ngày đều có nơi để trở về.",
        "en": "May your year be peaceful, with a place to call home every day."
      }
    },
    "wish-08": {
      "title": {"vi": "Bạn bè", "en": "Friendship"},
      "body": {
        "vi": "Mong những tình bạn tốt đẹp tiếp tục đồng hành.",
        "en": "May good friendships walk beside you in the years ahead."
      }
    }
  }
}
~~~

Có đúng 8 ID được nhận: wish-01 đến wish-08, tương ứng [TREE_WISHES](TREE_WISHES.md). Payload có thể chỉ chứa một phần các ID; kết quả sau merge luôn có đủ 8 lời chúc. Bỏ qua ID và trường lạ, không tạo thêm vật treo. Không dùng tên dịch hoặc thứ tự object để ánh xạ nội dung. `ornamentId`, `anchorId`, `theme` và transform vẫn lấy từ dữ liệu cục bộ.

Mỗi title/body và từng ngôn ngữ được validate riêng. Chỉ chấp nhận chuỗi không trắng; title tối đa 160, body tối đa 8.000 ký tự theo độ dài chuỗi JavaScript. Thiếu, null, sai kiểu, trống hoặc quá giới hạn thì dùng trường cục bộ tương ứng. Thiếu EN dùng nội dung EN cục bộ, không lấy VI thay thế. Không nhận HTML/Markdown để render; chỉ hiển thị văn bản và xuống dòng. Nội dung dài được cuộn trong dialog; có thể đóng bằng Escape và điều hướng bằng bàn phím.

## Tải và fallback
GET với Accept: application/json, credentials: omit, referrerPolicy: no-referrer và cache: no-store. Timeout 8 giây bao gồm tải body. Giới hạn body 512.000 byte, đếm byte thực tế khi đọc (không chỉ tin Content-Length); quá giới hạn thì hủy tải và fallback. HTTP không thành công, Content-Type không phải application/json hoặc application/*+json, mạng/CORS lỗi, JSON hỏng hoặc root không phải object đều dùng nội dung cục bộ. Không có JSONP hay thực thi mã từ phản hồi.

Trong lúc tải nội dung, countdown và nút bắn pháo hoạt động bình thường. Cây vẫn tải/hiện, nhưng các nút mở thiệp (mesh và DOM) chờ kết quả hoặc timeout, có nhãn “Đang chuẩn bị lời chúc” / “Preparing wishes”. Khi lỗi, mở đọc ngay bằng nội dung cục bộ và có thông báo nhẹ; không khóa toàn cảnh. Retry do người dùng chủ động, không vòng lặp request vô hạn. Giữ snapshot hiện tại khi Retry; thay snapshot nguyên tử khi hoàn tất và giữ tiến độ theo ID.

Đổi VI/EN và qua lại cây/pháo hoa không gọi API lần nữa. Tab ẩn không khởi động request trùng; timeout vẫn kết thúc request đang chạy. Không phát lại pháo hoa khi nội dung tải xong.

## ID, điều hướng và lưu trữ
Khi ID URL thay đổi (kể cả Back/Forward), hủy request cũ và bỏ phản hồi đến muộn; không hiển thị nội dung của ID trước cho ID mới. Đóng dialog đang mở, dùng snapshot cục bộ trong lúc chờ và vô hiệu mở thiệp đến khi hoàn tất. Không reset countdown thật hoặc bắt phát lại reveal. Mã gọi history.pushState/replaceState cần thông báo thay đổi route cho app hoặc tải lại trang; các API này không tự phát popstate.

`tet-wishes-seen` lưu dữ liệu có version, phân theo bộ nội dung: `default` khi không gọi API, `api:<id>` khi có ID hợp lệ và API được cấu hình hợp lệ. Trong namespace API, lưu thêm endpoint chuẩn hóa để không dùng nhầm tiến độ nếu đổi nguồn API. ID được validate trước khi tạo namespace; chỉ lưu wishId hợp lệ. Đổi bộ nội dung khôi phục tiến độ của bộ đó hoặc bắt đầu rỗng, không mang tiến độ bộ trước sang. API lỗi vẫn dùng namespace đã chọn với nội dung fallback; Retry thành công giữ ID đã xem. Định dạng storage cũ là mảng ID được chuyển vào default, không áp cho mọi ID API.

Chỉ lưu ngôn ngữ, tùy chọn âm thanh/vị trí bảng pháo hoa và tiến độ ID như [ARCHITECTURE](ARCHITECTURE.md); không lưu payload API vào localStorage. Storage bị chặn/hỏng vẫn đọc được toàn bộ nội dung trong phiên. Frontend không gửi lời nhắn hay tiến độ lên backend. Người giữ URL có thể gửi ID đến API; backend chịu trách nhiệm quyền truy cập, hết hạn và tính riêng tư.

## Mã nguồn và kiểm tra
- [contentApi.mjs](../src/lib/contentApi.mjs): parse ID/config, dựng URL, validate/merge, giới hạn body và timeout.
- [useWishContent.ts](../src/hooks/useWishContent.ts): snapshot, loading, Retry, abort và bỏ phản hồi cũ.
- [usePreferences.ts](../src/hooks/usePreferences.ts): lưu tiến độ theo namespace có version, fallback khi storage lỗi.
- [content.test.mjs](../tests/content.test.mjs): đủ 8 ID, URL, schema, VI/EN fallback, media/HTTP lỗi, giới hạn body, timeout và hủy request.

Chạy npm.cmd run check:content hoặc npm.cmd run check. Mock HTTP được dùng trong test; đã kiểm tra phản hồi cũ/đổi ID bằng jsdom, chưa xác minh CORS production hoặc hành vi trong trình duyệt thực tế. Khi mã bên ngoài dùng history.pushState/replaceState, phát sự kiện tet:routechange hoặc popstate để hook cập nhật ID.





