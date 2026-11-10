# Pháo hoa — màn diễn chính 5 phút

## Mốc thời gian và luồng
Giao thừa: `2027-02-06T00:00:00+07:00`. Countdown thật và preview 10 giây vẫn tách biệt. Ngay tại mốc countdown 0 (đồng thời với lời chúc năm mới), hoặc khi người dùng mở cảnh sau giao thừa, màn pháo hoa tự chạy trong **5 phút đang xem**. Không còn đoạn intro ngắn khóa các nút bắn.

Đồng hồ hiển thị 05:00 → 00:00. Có Tạm dừng / Tiếp tục; sau khi hết màn diễn có Phát lại 5 phút. Hết giờ chỉ dừng tự bắn, người dùng vẫn bắn thủ công và không tự chuyển sang cây. Khi ẩn tab hoặc sang cây mai, dừng đồng hồ/tự bắn và dọn các vụ nổ; quay lại tiếp tục thời lượng còn lại, giữ lựa chọn tạm dừng của người dùng. Không phát dồn các lượt đã lỡ.

## Biên đạo
- 0–30 giây: chùm, hoa mai, cọ vàng và vòng tròn mở màn; bắn lượt đầu ngay khi vào cảnh, không chờ camera hoặc reveal.
- 30–180 giây: luân phiên hình trái tim, vòng kép, bướm, thác sáng, sao, xoắn ốc, sao chổi và chùm; phối hợp nhiều vụ nổ.
- 180–260 giây: tăng nhịp, vẫn giữ vùng trống và giới hạn tải.
- 260–300 giây: finale dày hơn với chùm/cọ/vòng kép/thác sáng/trái tim/sao, tăng kích thước nhẹ.

Nhịp đề xuất khoảng 1,15 → 1 → 0,85 → 0,7 giây/lượt, bỏ lượt vượt budget thay vì xếp hàng. Reduced motion giữ đủ 5 phút nhưng dùng hình tĩnh/fade ngắn, nhịp chậm khoảng 3,2 giây và không có vệt phóng dài.

## Bộ chọn bằng icon
Mỗi kiểu có icon, nhãn VI/EN và accessible name; Enter/Space tương đương chạm/click. Bấm icon hình bắn ngay; icon chữ mở ô nhập. Bắn thủ công hoạt động ngay cả khi màn tự bắn đang chạy.

| ID | VI / EN | Hình dạng |
|---|---|---|
| goat | Dê Đinh Mùi / Year of the Goat | hình dê nhìn nghiêng có hai sừng, râu, thân, bốn chân và đuôi |
| rocket | Tên lửa / Rocket | bay lên 1,5 giây với vệt sáng cong, sau đó mới nổ |
| cluster | Nổ liên hoàn / Peony clusters | quả mẹ nổ, 6 nhánh bay ra và nổ phụ lần lượt |
| willow | Liễu rủ / Golden willow | bung tán vàng rồi rủ xuống chậm, vệt dài |
| crackle | Lách tách / Crackling | nổ chính rồi 8 cụm tia nhỏ nổ trễ, tiếng lách tách |
| fan | Quạt liên thanh / Fan volley | 5 quả bay xòe quạt và nổ lần lượt |
| burst | Pháo chùm / Burst | tỏa tròn nhiều lớp, lõi sáng và vệt tàn |
| heart | Trái tim / Heart | đường viền trái tim |
| ring | Vòng tròn / Ring | một vòng mở rộng |
| waterfall | Thác sáng / Waterfall | dải hạt vàng rơi |
| star | Ngôi sao / Star | ngôi sao 5 cánh bằng hạt |
| flower | Hoa mai / Blossom | đường hoa 5 cánh |
| spiral | Xoắn ốc / Spiral | đường xoắn mở rộng |
| double-ring | Vòng kép / Twin rings | hai vòng đồng tâm |
| palm | Cọ vàng / Golden palm | các nhánh tỏa cong như tán cọ |
| comet | Sao chổi / Comet | vệt sao kéo dài |
| butterfly | Cánh bướm / Butterfly | đường viền cánh bướm |
| text | Pháo chữ / Sky writing | nét chữ tạo bởi hạt sáng từ nội dung nhập |

## Pháo hoa chữ
Tối đa **24 ký tự hiển thị**, tính cả khoảng trắng bên trong; bỏ khoảng trắng đầu/cuối. Chuẩn hóa Unicode NFC, đếm grapheme để dấu tiếng Việt không bị tính thành nhiều ký tự. Nhận chữ, số, khoảng trắng và dấu ! ? . & + - cùng dấu nháy đơn; yêu cầu có ít nhất một chữ/số. Không nhận emoji hoặc HTML. Vượt giới hạn/sai ký tự thì hiện hướng dẫn và vô hiệu nút bắn, không cắt nội dung âm thầm.

Đợi font tiếng Việt cục bộ sẵn sàng rồi rasterize bằng Canvas2D. Rasterize từng grapheme riêng, giữ chung baseline, dấu tiếng Việt và độ rộng khoảng trắng; tổng tối đa 2.400 điểm. Mỗi ký tự nhìn thấy có một quả pháo riêng, các quả bay thẳng theo hàng và cùng nổ ở giây 1,5; khoảng trắng chỉ tạo khoảng cách. WebGL và Canvas2D dùng cùng dữ liệu glyph/timeline. Sau nổ, chữ giữ ổn định khoảng 4,5 giây rồi tan nhẹ, không rơi sớm làm mất nét. Không dùng DOM overlay để giả hiệu ứng chữ. Không gửi hoặc lưu nội dung nhập lên backend. Nếu rời cảnh khi chuẩn bị chữ thì bỏ kết quả, không bắn muộn.

## Khung hình và độ nổi bật
Camera ưu tiên bầu trời; nhà và cảnh sân ở rìa dưới. Vị trí nổ và kích thước tính theo khung nhìn hiện tại để không cắt hình/chữ trên mobile. Tăng lõi sáng, quầng mềm và vệt tàn; tông đỏ/vàng/trắng ấm. Chữ và hình phẳng hướng về camera. Bảng icon ở đáy, nhãn cảnh gọn; ô nhập chữ mở theo nhu cầu và có cuộn khi màn hình thấp. Không tăng flash liên tục để thay cho độ sáng hạt.

## Giới hạn và triển khai
Một Points với buffer cố định 30.000 điểm hiển thị, gồm cả vệt tàn. Tối đa 8 gói pháo đang chạy (mỗi gói có thể chứa nhiều nổ phụ); tự bắn dùng tối đa 6 chỗ, dành 2 chỗ cho người dùng. Cooldown thủ công 400ms, không bị khóa bởi một lượt tự bắn. Mỗi hình khoảng 420 điểm gốc desktop / 240 mobile, vệt tàn tối đa 8 mẫu; chữ tối đa 2.400 điểm với 2 mẫu vệt. Mỗi gói pháo tối đa 9 giây, gồm các pha con; liễu rủ hiện kéo dài khoảng 8,2 giây. Đây là giới hạn triển khai, chưa phải benchmark GPU.

Các module: lib/fireworkShow.mjs (score/giới hạn/validate/bitmap), hooks/useFireworkShow.ts (đồng hồ và pause), components/FireworksControls.tsx (icon/ô nhập), lib/fireworkText.ts (rasterize), scenes/Fireworks.tsx (WebGL), components/FallbackScene.tsx (Canvas2D).

Audio mặc định tắt, chỉ bật sau user gesture. Không có WebGL2 vẫn dùng đủ các nút và pháo chữ với Canvas2D. Pipeline Blender MCP có thể dùng để tạo mẫu/đối chiếu hình dạng và timing; particle tương tác vẫn chạy trong Three.js, không có mô hình nhân vật.


## Timeline nhiều giai đoạn và âm thanh
fireworkDynamics.mjs mô tả từng pha: thời điểm phóng, thời gian bay, vị trí xuất phát/đích, thời điểm nổ, lực bung, trọng lực, tuổi hạt và vệt tàn. WebGL và Canvas2D dùng chung sampleFlight/sampleSpark nên hành vi tương đương. Nổ liên hoàn có một pha mẹ và sáu pha con: pha con bắt đầu tại tâm vụ nổ mẹ, bay ra nhánh rồi nổ. Quạt có năm quả phóng lệch nhau 0,22 giây. Reduced motion bỏ đường bay, dùng hình/fade tĩnh và một tiếng nổ nhẹ thay chuỗi dài.

Mở popup từ icon loa duy nhất trên header, rồi tăng/kéo mức âm lượng dương để nghe; bảng pháo hoa không còn điều khiển audio. Mặc định vẫn tắt và cần user gesture; bật giữa màn diễn chỉ phát các lượt mới. Âm thanh tổng hợp bằng Web Audio, không tải mẫu bên ngoài:
- Bay: tiếng phụt/gió và tiếng rít lên cao, kéo dài theo thời gian bay.
- Nổ chính: nhiễu trầm + âm bass hạ tần, có đuôi âm.
- Nổ phụ: các tiếng pop ngắn đúng thời điểm từng chùm con.
- Lách tách: nhiều crack nhỏ theo các cụm tia.

Lịch tiếng lấy từ cùng timeline với hình ảnh; panning stereo theo vị trí nhánh. Gain đầu ra và compressor hạn chế chồng âm; tối đa 80 voice đang phát/đã hẹn, bỏ voice vượt budget. Mute, rời cảnh hoặc ẩn tab hủy toàn bộ voice và cue chưa phát; không phát dồn khi quay lại. Kiểm thử dùng AudioContext giả để xác nhận lịch và cleanup; độ tự nhiên/âm lượng thực tế vẫn cần nghe trên loa và tai nghe.

## Màn pháo chữ ở giữa màn hình
Pháo chữ có điểm đặt cố định tại tâm khung nhìn, không dùng vị trí nổ ngẫu nhiên. Dòng chữ chiếm đến 86% chiều ngang và tối đa 40% chiều cao, tự co để không cắt trên mobile hoặc màn hình ngang thấp. Tiêu đề cảnh, ô nhập và bảng icon thu gọn trong lúc trình diễn để nhường chỗ đọc chữ.

Một loạt chữ là một gói có nhiều quả ký tự, dùng chung thời điểm phóng/nổ. Chữ giữ kích thước lớn giữa màn hình, bắn đồng thời với pháo khác; không xóa hiệu ứng, ngắt âm thanh hay thu gọn bảng. Giới hạn một gói chữ trong vòng đời 6,5 giây để tránh chồng chữ, tối đa tám gói tổng cộng và buffer 30.000 điểm. Bắn tay có cooldown chung ngắn 400 ms, có thể chờ thêm khi chạm giới hạn gói.

Tiếng bay và tiếng nổ của các ký tự cũng diễn ra đồng thời, panning theo từng vị trí chữ, hạ gain theo số quả để tránh chồng âm quá lớn. Reduced motion giữ thời gian đọc, bỏ bay/bung mạnh, dùng một tiếng nổ nhẹ. Nội dung chữ được thông báo qua aria-live cho người dùng trình đọc màn hình; không dùng dòng DOM nhìn thấy để giả hiệu ứng.


## Pháo hình dê Đinh Mùi
Preset goat có icon và nhãn riêng ở đầu bộ chọn. Dùng đường nét gốc chung cho icon và hạt, không dùng emoji hay model nhân vật 3D. Bổ sung đường cong bên trong sừng, vân sừng, tai, mắt, má, râu, lông ngực, móng và hoa văn thân. Riêng dê dùng tối thiểu 640 điểm gốc cả desktop/mobile và 640 điểm trong màn mở đầu; giữ hai mẫu vệt và buffer chung 30.000 điểm. Quả pháo bay lên rồi bung thành hình dê vàng nhìn nghiêng, giữ nét khoảng 2 giây rồi hạt rơi/tản và tắt dần. Xuất hiện ở mở đầu, phần chính và finale của màn tự bắn 5 phút. Hỗ trợ cả WebGL/Canvas2D và tiếng bay/nổ cùng timeline.


## Bố trí bảng điều khiển
Bảng pháo hoa chỉ ở phía dưới, sát đáy với safe area, không hỗ trợ đổi vị trí. Giữ nút icon và nhãn truy cập; vẫn bắn chữ, bật âm thanh và pause/replay được. Xem FRAMING_AND_LIGHTING để biết breakpoint. Đổi viewport không thay đổi clock hoặc dữ liệu nhập chữ.



## Điều chỉnh âm lượng

Thanh kéo 0–100%, nút giảm/tăng mỗi bước 10%; mặc định 70%. Ghi nhớ bằng tet-sound-volume, kiểm tra và giới hạn giá trị khi đọc. Gain âm lượng đặt sau compressor, chuyển mức trong 40 ms; 0% cho đầu ra im lặng. Nạp preference không tự bật tiếng hay tạo AudioContext. Thao tác chỉnh âm lượng dương bật tiếng; giảm về 0 tự tắt tiếng. Tăng từ 0 bằng nút + hoặc thanh kéo để bật tiếng. Thanh nằm trong popup dưới cụm âm thanh trên header: desktop rê chuột/focus để mở; mobile chạm icon âm lượng để mở/đóng, vùng chạm ít nhất 44 px.


Hai preset chữ cố định: Chúc mừng năm mới (icon CM/NM) và 2027 (icon 20/27), bấm để tạo và bắn ngay. Nội dung nhập tay cũng hỗ trợ đủ lời chúc này với giới hạn 24 ký tự; vẫn dùng cùng ngân sách 2400 hạt, mỗi ký tự một quả và cùng nổ giữa màn hình. Cooldown và âm thanh giữ cùng hành vi pháo chữ; không tạm dừng các pháo khác.


Loạt đầu mỗi màn diễn/phát lại là gói opening: đầu dê vàng phía trên, dòng Chúc mừng năm mới phía dưới, cùng phóng tại mốc 0 và cùng nổ sau 1,5 giây. Chuẩn bị bitmap lời chúc từ lúc mở ứng dụng; nếu font chưa sẵn sàng tại giờ bắn dùng font fallback để không đợi tải. Cả gói dùng chung bố cục ở WebGL/Canvas2D và cùng timeline âm thanh. Reduced motion giữ hình và thời gian đọc, bỏ chuyển động bay.

Chữ dùng Tet Serif nghiêng 500, nét mềm và có chân; raster có padding theo bounding box để không cắt nét nghiêng. Mỗi ký tự có màu khác ký tự liền trước, luân phiên vàng/hồng/xanh lam/đỏ/tím/xanh non/trắng; seed của lần bắn đổi thứ tự màu. Màu ổn định trong cùng một loạt, không nhấp nháy. Dê mở màn giữ màu vàng.

Viền quanh bảng điều khiển thể hiện thời gian tự bắn còn lại: đầy ở 5 phút, rút dần theo elapsed đang xem, hết viền khi kết thúc. Dùng cùng clock với pause/ẩn tab/chuyển cây/phát lại, không chạy animation timer riêng. Giữ đồng hồ số, bỏ dấu chấm trước đồng hồ. SVG tự khớp khung khi mở form/âm lượng hoặc đổi viewport, không nhận pointer events; reduced motion tắt chuyển động nội suy viền.

Header chỉ có một icon loa, gộp điều khiển tiếng và âm lượng trong cùng popup. Popup chỉ còn nút -/thanh kéo/nút +, không có nút bật/tắt hoặc chữ trạng thái/phần trăm. Desktop mở khi hover bằng chuột chính xác, hỗ trợ focus bàn phím; popup giữ tương tác khi rê xuống thanh kéo. Mobile cần chạm. Escape đóng và trả focus về nút; chạm ngoài đóng popup. Thao tác kéo/tăng âm lượng dương tự bật tiếng; về 0 tự tắt. Nút +/- không có border, giữ vùng bấm 44px.

Popup âm lượng dùng nền đỏ alpha khoảng 35%, rộng tối đa 220px, padding 4px 8px và vùng chạm nút 44px kèm backdrop blur, giữ icon/thanh kéo rõ nét. Không hiện chữ Muted hoặc phần trăm; giá trị hiện tại vẫn có trong aria-valuetext của slider cho công cụ hỗ trợ. Bật/tắt chỉ qua mức 0 hoặc dương.

Khi trang đang mute (kể cả vừa load và đã lưu mức 100%), icon, tooltip và thanh kéo cùng biểu diễn mức nghe thực tế 0%. Preference vẫn có thể lưu mức cũ nhưng không hiển thị như đang phát. Mở popup không khởi tạo AudioContext; nút + từ trạng thái này bắt đầu ở 10%, thao tác tăng/kéo mới bật tiếng.

Bảng mobile hỗ trợ collapse/expand bên cạnh pause. Collapse không thay đổi trạng thái tự bắn, chỉ chuyển toàn bộ icon thành một hàng cuộn ngang và tạm ẩn form. Mở text tự expand, giữ bản nháp; lỗi tạo/bắn chữ tự expand để hiện thông báo. Mọi preset vẫn bấm được khi thu gọn.

Pháo chữ và hình dê giữ hình khoảng 2 giây sau nổ, rồi rơi theo gia tốc với độ lệch giữa từng hạt và tản ngang nhẹ. Thời gian hạt tồn tại sau nổ là 5 giây (chữ trước đây 6,8 giây); chữ/loạt opening bay 1,5 giây nên kết thúc sau tổng 6,5 giây. Admission nhả chỗ chữ theo mốc này, không giữ đủ 9 giây. WebGL và Canvas2D dùng chung sampler; reduced motion bỏ rơi/tản nhưng vẫn tắt trong cùng thời lượng.
