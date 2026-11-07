# Thiết kế asset và vật liệu

## Chiến lược
Tập trung chất lượng môi trường và hiệu ứng, không dùng mô hình nhân vật hoặc rig. Cho phép dùng Blender MCP để dựng/tinh chỉnh nhà, hiên, cây mai, vật treo và đạo cụ; procedural Three.js phù hợp cho các hình lặp và runtime. Chọn cách dựng theo chất lượng hình ảnh và ngân sách web, không giới hạn Blender chỉ cho asset phức tạp.

| Asset | Cách dựng | LOD/ghi chú |
|---|---|---|
| Nhà, mái, cửa | mesh module/procedural hoặc 1 GLB tĩnh | texture atlas, baked lighting |
| Cây mai | trunk/branches GLB hoặc procedural | hoa dùng InstancedMesh; 8 anchor riêng cho vật trang trí treo |
| Đèn lồng | geometry đơn giản | emissive, chuyển động nhẹ |
| Bánh chưng, mứt, ấm trà | primitive hoặc GLB nhỏ | chỉ cận cảnh mới cần chi tiết |
| Pháo hoa | GPU particles/shader với 17 preset hình/cơ chế và chữ rasterize thành hạt | pool dùng chung; không tạo mỗi hạt một React component |
| Vật trang trí treo | thẻ/thiệp, đèn lồng nhỏ, nút thắt | 8 ID riêng, hitbox rộng và trạng thái đã đọc |
| Trời, sao, mây | shader/instancing | không cần HDRI dung lượng lớn |

## Nguyên tắc vật liệu
PBR với roughness có kiểm soát; gỗ/đá/ngói dùng texture lặp có seed ổn định. Hoa mai vàng tươi nhưng tránh phát sáng quá mạnh. Vật treo đỏ/vàng nổi trên tán mai, có mặt sau khi xoay cây; phân biệt được bằng hình dáng và dấu đã đọc, không chỉ bằng màu. Sử dụng sRGB cho baseColor, linear cho normal/roughness.

## Quy trình Blender MCP
`art/blender/*.blend` là nguồn chỉnh sửa; xuất `public/models/*.glb` bằng glTF; nén meshopt/Draco tùy pipeline, texture KTX2/WebP nếu được kiểm chứng tương thích; lưu manifest có checksum, triangles, texture bytes và license. Không dùng .blend trong frontend.

## Ngân sách mục tiêu ban đầu (phải đo lại)
Initial payload compressed < 5 MB trên mạng mobile tốt; tổng texture GPU mục tiêu < 100 MB; draw calls mục tiêu < 150 desktop / < 100 mobile; giảm shadows/particles trước khi giảm độ nét điểm nhấn. Đây là **mục tiêu thiết kế**, không phải benchmark đã đạt.


Dùng MCP để thử vật liệu, ánh sáng, camera và render tham chiếu; giữ script tái tạo/export cùng master. Simulation/Geometry Nodes/compositor không tự chuyển đầy đủ sang GLB; bake hoặc chuyển sang dữ liệu/texture khi phù hợp, tái tạo particle tương tác trong Three.js. Chi tiết tại [LOCAL_3D_TOOLS](LOCAL_3D_TOOLS.md).





## Asset trang trí sân nhà
Script Blender xuất tet-house.glb (kiến trúc và câu đối/biển chữ Việt) và tet-courtyard.glb (đèn cổng, dây đèn, quất/cúc, hàng rào, nồi/bếp/củi và bánh chưng). Giữ cùng gốc và trục Y-up khi xuất; chữ được chuyển thành mesh để không phụ thuộc font Blender trên frontend. Hơi nước/lửa chuyển động chạy trong Three.js; master .blend vẫn giữ đầy đủ sân để kiểm tra bố cục.


