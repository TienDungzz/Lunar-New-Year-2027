# Khung hình, camera, ánh sáng và UI

## Camera presets (đề xuất, FOV 40–45°)
| Phase | Camera [x,y,z] | Target [x,y,z] | Mục đích |
|---|---|---|---|
| Countdown | [9,5.5,12] | [0,2,-2] | nhà và cây mai đều hiện |
| Fireworks | [0,3.8,17] | [0,11,-9] | ưu tiên bầu trời khoảng 75–85% khung; hình/chữ tự căn theo viewport |
| Tree transition | [-1.8,3.1,6.3] | [-3.5,2,1.2] | tiến gần cây mai |
| Tree explore | [-3.5,2.6,6.5] | [-3.5,1.9,1.2] | OrbitControls quanh cây |

Camera presets là tọa độ mục tiêu, không phải giá trị đã kiểm chứng; kiểm tra clipping, occlusion và góc trên mobile. Chuyển cảnh 1.2–2.5 giây; reduced motion cắt ngắn hoặc snap.

## Ánh sáng
- Nền trời đêm tím than pha sắc ấm. Trong reveal/pháo hoa và chuyển camera liên quan, ẩn mặt trăng và tắt directional light ánh trăng; giữ nguồn sáng ấm từ nhà/sân. Cảnh nhà/cây vẫn có ánh trăng nhẹ.
- Ánh sáng cửa và đèn lồng màu vàng ấm là điểm nhấn.
- Baked lightmap/ambient occlusion cho nhà, hiên và sân; ít đèn động có shadow.
- Pháo hoa dùng emissive + flash light giới hạn, tránh tạo point light cho từng hạt.
- Tone mapping AgX hoặc ACES, kiểm tra màu đỏ/vàng trên cả desktop và mobile.

## UI
Desktop: tiêu đề/countdown phía trên hoặc bên trái; nhà nằm trung tâm, cây mai nhìn thấy rõ. Mobile: countdown phía trên, CTA trong vùng an toàn dưới, không phủ lên vật treo hoặc vùng nổ chính. UI là DOM overlay ngoài Canvas; hỗ trợ safe-area-inset và chiều cao màn hình nhỏ.

## Kiểm thử khung
360×800, 390×844, 768×1024, 1440×900; kiểm tra không che đồng hồ, 18 icon kiểu pháo (17 hình/cơ chế và chữ), nút qua lại cây/pháo hoa và 8 vật treo; không cắt chữ VI/EN; focus ring rõ.

## Điều khiển cảnh trọng tâm
Bảng 18 icon hình/chữ, đồng hồ 5 phút và nút pause/replay luôn thấy khi tự bắn; mobile bố trí thành hàng hoặc grid có nhãn, không che bầu trời. Nút có vùng chạm tối thiểu 44×44 CSS px. Camera pháo hoa ổn định để hình trái tim/vòng tròn dễ nhận diện. Nút Khám phá cây mai và Quay lại pháo hoa ở vùng safe area; không tự chuyển cảnh theo thời lượng.



## Bảng màu Tết Việt Nam
Giao diện lấy đỏ son/đỏ trầm làm nền (#641a24, #851e28), vàng ấm làm điểm nhấn (#f3c969, #ffd579), chữ kem để dễ đọc. Header, bảng điều khiển, nút điều hướng và thiệp lời chúc cùng dùng bảng màu này. Nút chính có nền vàng và chữ đỏ đậm. Cây cỏ giữ màu tự nhiên, trời đêm đủ tối để pháo hoa nổi bật; không phủ đỏ toàn bộ mô hình. Pháo hoa ưu tiên đỏ, vàng, cam và trắng ấm, phân biệt kiểu bằng hình dạng.




Nguồn sáng bổ sung đặt tại hai đèn cổng và bếp nồi bánh chưng; nhiều bóng dây đèn dùng emissive thay vì một point light cho từng bóng. Lửa biến thiên nhẹ, không chớp mạnh; reduced motion giữ cố định. Câu đối và biển chúc Tết đặt trước cột/mép mái để dễ nhìn.


Pháo chữ: cố định tâm màn hình, fit tối đa 86% chiều ngang/40% chiều cao. Mỗi quả bay lên đúng cột ký tự rồi cùng nổ; ẩn tiêu đề cảnh và thu gọn bảng icon trong 8,5 giây để dòng chữ không bị che. Khoảng trắng giữ đúng độ rộng nhưng không tạo quả pháo rỗng.



## Vị trí bảng bắn pháo
Desktop có nhóm ba nút icon vị trí: phía dưới (mặc định), cạnh trái, cạnh phải. Nút hiện aria-pressed cho lựa chọn đang dùng. Bảng cạnh dùng grid ba cột, chiều cao giới hạn và cuộn bên trong; không kéo ra khỏi safe area. Nhớ lựa chọn ở tet-firework-dock, dữ liệu không hợp lệ trở về bottom.

Mobile (chiều ngang tối đa 699px, hoặc thiết bị pointer coarse ở màn hình ngang thấp tối đa 550px) chỉ có bảng phía dưới, không hiện nhóm chọn vị trí. Nút kiểu pháo, âm thanh, pause/replay và bắn chữ chỉ hiện icon; giữ aria-label/title, vùng chạm ít nhất 44×44 CSS px và đồng hồ còn lại. Ẩn dòng hướng dẫn dài để tiết kiệm không gian; ô nhập chữ vẫn có nhãn, bộ đếm và thông báo lỗi khi mở.

Khi đổi kích thước/orientation, ép mobile về bottom nhưng không ghi đè lựa chọn desktop; trở lại desktop khôi phục trái/phải đã chọn. Đổi vị trí không reset show 5 phút, nội dung chữ hay thao tác bắn. Trạng thái pháo chữ vẫn thu gọn bảng icon ở cả ba vị trí.


Khu nhà gồm nhà chính rộng hơn 35%, cao hơn 8%, thêm cửa sổ gian bên; nhà phụ hai gian đặt lùi bên phải, mái thấp, hiên, cửa sáng và đèn lồng riêng. Hàng rào phải và khóm tre được dời ra ngoài, nền sân mở rộng; camera mở đầu bao quát cả hai khối nhà. Nguồn mô hình: art/blender/build_environment.py, xuất GLB chỉ từ scene đang hoạt động để tránh nhân đôi mô hình. Bản fallback SVG cũng có nhà phụ.


Bảng pháo hoa dùng nút chỉ icon trên cả desktop và mobile, giữ title/aria-label để nhận biết. Bảng dưới giới hạn rộng 660px, bảng bên rộng 208px; nút tối thiểu 44px. Thanh âm lượng mở/đóng bằng icon trên mọi thiết bị. Ẩn mô tả dài trong cảnh pháo hoa và thu nút chuyển cây mai thành icon để nhường chỗ cho bầu trời.

Bảng bên trái/phải có góc bo 18px, nền đỏ trầm trong mờ và viền vàng nhẹ. Nhóm chọn vị trí, đồng hồ căn giữa và ba nút điều khiển được chia rõ; lưới pháo ba cột, nút cao tối thiểu 48px. Hai preset chữ chia đều hàng cuối. Âm lượng mở thành grid riêng, phần trăm ở hàng trên, nút giảm/thanh kéo/nút tăng cùng hàng dưới để không tràn hoặc xuống dòng bất thường. Nội dung cuộn khi màn hình thấp.


Góc mở đầu tiến gần khu nhà: desktop camera (10.8, 6.5, 15.5), nhìn về (0.7, 1.65, -2.5); mobile giữ khoảng lùi rộng hơn. Sân 19 × 14 m lát kín 32 × 24 viên gạch đất nung, mạch 18 mm, màu biến thiên nhẹ; dùng một InstancedMesh với 768 viên, thay lối đi 96 viên. Fallback SVG cũng lát toàn bộ sân.
