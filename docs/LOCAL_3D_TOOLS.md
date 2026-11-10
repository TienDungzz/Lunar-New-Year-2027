# Dựng cảnh và hiệu ứng bằng Blender MCP

## Phạm vi và quyền sử dụng
Dự án tập trung vào môi trường, bố cục, ánh sáng và hiệu ứng; không sử dụng mô hình nhân vật, rig hoặc animation nhân vật. Cảm giác sum vầy được thể hiện qua ngôi nhà, đạo cụ và ánh sáng.

Trong phạm vi phát triển dự án, cho phép agent truy cập Blender qua MCP để đọc cảnh, dựng/chỉnh mô hình môi trường và đạo cụ, thiết lập vật liệu/ánh sáng/camera, tạo mẫu hiệu ứng, render kiểm tra và xuất asset. Có thể thực thi Python qua Blender MCP để tạo hình chính xác và tái lập quy trình. Các thao tác này được thực hiện trong phạm vi dự án mà không cần xin lại quyền cho từng bước thông thường.

Quyền này là phạm vi làm việc của dự án, không tự cài đặt MCP hoặc thay đổi quyền hệ thống. Trước khi dùng, kiểm tra công cụ có sẵn và bridge kết nối tới đúng phiên Blender. Nếu chưa kết nối, báo rõ điều kiện còn thiếu; không tuyên bố đã dựng/render khi chưa thực hiện. Không xóa hoặc ghi đè cảnh không thuộc dự án đang mở trong Blender; tạo file làm việc riêng khi cần.

## Vai trò Blender và trình duyệt
- Blender MCP: dựng nhà/hiên/cây mai/vật treo, tinh chỉnh tỷ lệ và vật liệu, thử camera/ánh sáng, tạo mẫu hình pháo hoa và render ảnh tham chiếu.
- Three.js/R3F: chạy cảnh tương tác, particle pool/shader pháo hoa, hitbox và điều khiển trên web.
- Mô phỏng particle, Geometry Nodes, compositor và shader Blender không tự chuyển đầy đủ sang glTF. Hiệu ứng pháo hoa tương tác phải được tái tạo trong runtime web; không dùng video dựng sẵn thay thế các nút bắn.

## Quy trình
1. Chốt blockout, tỷ lệ và camera từ các docs cảnh; có thể dựng thử trong Blender hoặc Three.js.
2. Dùng Blender MCP dựng môi trường và đạo cụ; kiểm tra silhouette, chiều sâu, vật liệu, ánh sáng ấm/lạnh và chỗ trống cho UI.
3. Tạo mẫu chùm/trái tim/vòng tròn/thác sáng; lưu tham số hình dạng, màu, mật độ, lifetime, timing và ảnh tham chiếu. Hình trái tim/vòng tròn phải rõ từ camera mục tiêu.
4. Lưu master tại `art/blender/*.blend`, script tái tạo/export trong `scripts/blender/` và ảnh tham chiếu tại `art/images/previews/`. Logo chỉ giữ bản dùng trên web trong `public/`, không lưu ảnh gốc branding. Không chỉ giữ GLB của môi trường.
5. Xuất asset web sang `public/models/*.glb`, texture tương thích; kiểm tra đơn vị, trục Y-up, transform, normal, mặt trước/sau và anchor vật treo.
6. Tái tạo hiệu ứng bằng particle/shader web, so với ảnh tham chiếu; kiểm tra tone mapping, độ sáng, hình dạng trên desktop/mobile và reduced motion.
7. Nén theo pipeline đã kiểm chứng; tạo manifest checksum, triangles, texture bytes, nguồn/license; chạy build/check khi đã có triển khai.

## Tiêu chí hình ảnh
Ưu tiên cảnh có bố cục rõ, chất liệu nhất quán, ánh sáng có chiều sâu và pháo hoa dễ nhận diện. Render Blender là tham chiếu mỹ thuật; kết quả trong trình duyệt và benchmark thiết bị thật là căn cứ nghiệm thu. Không tăng mesh, texture hoặc particle chỉ để giống render offline mà vượt ngân sách web.



