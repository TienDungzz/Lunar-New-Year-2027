# Khung hình, camera, ánh sáng và UI

## Chi tiết cây mai

Cây mai 3D có thân/cành cong thuôn dần, 12 cành chính và 48 nhánh nhỏ. Hoa mọc theo cuống trên nhánh thay vì rải ngẫu nhiên trong tán: 288 hoa năm cánh, mỗi hoa có tâm và 10 nhụy với đầu phấn; xen 192 nụ xanh và 96 lá non. Hướng và sắc vàng biến thiên có seed cố định. Tám vật treo lời chúc giữ vị trí và tương tác hiện có. Thân/cành/cuống gộp một geometry, sáu nhóm chi tiết dùng instancing; không thêm light cho từng hoa. Cần kiểm tra trực quan và benchmark GPU mobile; build và DOM test không xác nhận chất lượng hình ảnh hay FPS.

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
Bảng pháo hoa cố định phía dưới trên mọi thiết bị, cách đáy max(12px, safe-area-inset-bottom); không có bộ chọn vị trí hoặc preference dock.

## Kiểm thử khung
360×800, 390×844, 768×1024, 1440×900; kiểm tra không che đồng hồ, 18 icon kiểu pháo (17 hình/cơ chế và chữ), nút qua lại cây/pháo hoa và 8 vật treo; không cắt chữ VI/EN; focus ring rõ.

## Điều khiển cảnh trọng tâm
Bảng 18 icon hình/chữ, đồng hồ 5 phút và nút pause/replay luôn thấy khi tự bắn; mobile bố trí thành hàng hoặc grid có nhãn, không che bầu trời. Nút có vùng chạm tối thiểu 44×44 CSS px. Camera pháo hoa ổn định để hình trái tim/vòng tròn dễ nhận diện. Nút Khám phá cây mai và Quay lại pháo hoa ở vùng safe area; không tự chuyển cảnh theo thời lượng.



## Bảng màu Tết Việt Nam
Giao diện lấy đỏ son/đỏ trầm làm nền (#641a24, #851e28), vàng ấm làm điểm nhấn (#f3c969, #ffd579), chữ kem để dễ đọc. Header, bảng điều khiển, nút điều hướng và thiệp lời chúc cùng dùng bảng màu này. Nút chính có nền vàng và chữ đỏ đậm. Cây cỏ giữ màu tự nhiên, trời đêm đủ tối để pháo hoa nổi bật; không phủ đỏ toàn bộ mô hình. Pháo hoa ưu tiên đỏ, vàng, cam và trắng ấm, phân biệt kiểu bằng hình dạng.




Nguồn sáng bổ sung đặt tại hai đèn cổng và bếp nồi bánh chưng; nhiều bóng dây đèn dùng emissive thay vì một point light cho từng bóng. Lửa biến thiên nhẹ, không chớp mạnh; reduced motion giữ cố định. Câu đối và biển chúc Tết đặt trước cột/mép mái để dễ nhìn.


Pháo chữ: cố định tâm màn hình, fit tối đa 86% chiều ngang/40% chiều cao. Mỗi quả bay lên đúng cột ký tự rồi cùng nổ; giữ bảng điều khiển hoạt động, không dừng pháo khác khi chữ xuất hiện. Khoảng trắng giữ đúng độ rộng nhưng không tạo quả pháo rỗng.



## Vị trí bảng bắn pháo
Bảng pháo hoa cố định phía dưới trên mọi thiết bị, cách đáy max(12px, safe-area-inset-bottom); không có bộ chọn vị trí hoặc preference dock.

Mobile (chiều ngang tối đa 699px, hoặc thiết bị pointer coarse ở màn hình ngang thấp tối đa 550px) chỉ có bảng phía dưới, không hiện nhóm chọn vị trí. Nút kiểu pháo, pause/replay và bắn chữ chỉ hiện icon; giữ aria-label/title, vùng chạm ít nhất 44×44 CSS px và đồng hồ còn lại. Ẩn dòng hướng dẫn dài để tiết kiệm không gian; ô nhập chữ vẫn có nhãn, bộ đếm và thông báo lỗi khi mở.

Khi đổi kích thước/orientation, giữ bảng phía dưới, không reset show hoặc nội dung chữ. Preference tet-firework-dock cũ không còn được đọc/ghi.


Khu nhà gồm nhà chính rộng hơn 35%, cao hơn 8%, thêm cửa sổ gian bên; nhà phụ hai gian đặt lùi bên phải, mái thấp, hiên, cửa sáng và đèn lồng riêng. Hàng rào phải và khóm tre được dời ra ngoài, nền sân mở rộng; camera mở đầu bao quát cả hai khối nhà. Nguồn mô hình: scripts/blender/build_environment.py, xuất GLB chỉ từ scene đang hoạt động để tránh nhân đôi mô hình. Bản fallback SVG cũng có nhà phụ.


Bảng pháo hoa dùng nút chỉ icon trên cả desktop và mobile, giữ title/aria-label để nhận biết. Bảng dưới giới hạn rộng 1280px; nút tối thiểu 44px. Âm lượng nằm trong popup header: desktop hover, mobile chạm icon. Ẩn mô tả dài trong cảnh pháo hoa và dùng navigation hai cảnh phía trên tiêu đề.



Góc mở đầu tiến gần khu nhà: desktop camera (10.8, 6.5, 15.5), nhìn về (0.7, 1.65, -2.5); mobile giữ khoảng lùi rộng hơn. Sân 19 × 14 m lát kín 32 × 24 viên gạch đất nung, mạch 18 mm, màu biến thiên nhẹ; dùng một InstancedMesh với 768 viên, thay lối đi 96 viên. Fallback SVG cũng lát toàn bộ sân.

Bảng phía dưới trên desktop mở rộng tối đa 1280px, cách hai mép ít nhất 4%. Đồng hồ và nút điều khiển chung một hàng; toàn bộ 20 nút kiểu pháo/preset chung một hàng từ 1200px, hai hàng ở màn nhỏ hơn. Từ 1000px, nhãn nhập chữ nằm cạnh ô nhập; hướng dẫn ngắn phía dưới. Bảng giữ sát đáy để giảm diện tích che bầu trời, mobile dùng bố cục gọn riêng.

Navigation Pháo hoa / Lời chúc đặt trên tiêu đề cảnh, thay eyebrow số cảnh và toàn bộ nút qua lại cũ. Mục hiện tại có nền vàng nhẹ, vạch vàng và aria-current=page; chỉ báo trượt khi đổi cảnh, tắt animation ở reduced motion. Mỗi nút cao tối thiểu 44px, pointer-events bật riêng trong chapter; khóa trong transition.

Viền vàng mảnh bao quanh bảng pháo hoa đồng thời là chỉ báo thời gian còn lại; chỉ vẽ đường tiến trình, không có viền nền hoặc viền vuông ngoài; hết giờ đường viền biến mất. Số phút/giây không có chấm đứng trước. Viền tự khớp kích thước khung, không chặn bấm; token trong variables.css.

Header chỉ có một icon loa gộp âm thanh và âm lượng; popup bám ngay bên dưới cụm, có vùng đệm để rê chuột xuống. Màn hẹp ≤480px giữ logo, ẩn chữ thương hiệu để chừa chỗ cho audio và VI/EN; liên kết thương hiệu vẫn có tên truy cập. Không đặt popup hoặc nút audio trong bảng pháo hoa.

Mobile có nút thu gọn/mở rộng cạnh pause/replay. Mặc định mở rộng; khi thu gọn chỉ còn một hàng 20 icon (gồm hai preset chữ) cuộn ngang bên dưới hàng đồng hồ/nút điều khiển. Icon giữ 44px, không xuống dòng. Thu gọn tạm ẩn form nhưng giữ nội dung; chọn icon pháo chữ tự mở rộng lại. Đổi viewport không reset show hoặc nội dung. Desktop không hiện nút này.

Ở mobile portrait ≤699px, Canvas phủ liền toàn màn hình, không tách cảnh thành một ô phía trên. Grid chỉ bố trí header 98px, khoảng trống dành cho thân nhà tối thiểu 250px, nội dung căn giữa phía dưới và footer 56px. Camera nhìn về (3, -4.3, -2.5) để đưa nhà lên cao, dành sân gạch phía trước làm nền cho chữ; vị trí (11, 13, 39) tại khung 425 × 857, khoảng cách tự điều chỉnh theo tỉ lệ Canvas để giữ nhà trong chiều ngang. Tiêu đề 32px, eyebrow và dãy countdown căn giữa; giữ CTA theo mode. Màn thấp cho phép cuộn. Khi còn 3 giây, ẩn chữ và chuyển camera lên trời trên cùng Canvas; về 0 bắn ngay. Fallback 2D cũng phủ toàn màn hình.
