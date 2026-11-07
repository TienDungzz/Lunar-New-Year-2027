# Tải cảnh, lỗi và hiệu năng

## Nguyên tắc
Không hiển thị cảnh thiếu asset chính. Tuy nhiên không bắt tải pháo hoa chất lượng cao và mọi chi tiết vật trang trí treo trước khi cho xem countdown. Chia giai đoạn để giảm thời gian chờ.

## Phân tầng tải
1. **Critical:** GLB nhà và đạo cụ sân, sky, cây mai silhouette, vật liệu chính, font UI.
2. **Soon:** particle shader, preset các kiểu pháo, vật treo tương tác và audio metadata.
3. **On demand:** texture chi tiết cây và vật trang trí treo.

## Readiness
Preload URL đúng với consumer, Suspense đợi decode, compile shader/prepare texture nếu cần, render một frame khi che Canvas, rồi mở UI. Tách `environmentReady`, `fireworksReady`, `treeReady`; không chặn countdown bởi asset chưa cần. Khi lỗi một phần, giữ các phần khác hoạt động.

## Adaptive quality
Mobile: DPR cap 1–1.5 tùy đo, giảm số particle và shadow, tắt bloom hoặc dùng nhẹ; desktop DPR cap 2, tăng chất lượng theo benchmark. Pause render hoặc hạ FPS khi tab ẩn. Dùng instancing, texture compression, geometry reuse; dispose resource khi không còn dùng.

## Fallback
Không WebGL2: hình minh họa ngôi nhà + countdown DOM + pháo hoa CSS/Canvas2D với nút bắn đủ các kiểu + hình cây/vật treo và danh sách 8 lời chúc. Không yêu cầu GPU để đọc lời chúc.

## Kiểm thử lỗi
Mạng chậm, offline sau tải, mất GLB, shader compile fail, context lost/restored, refresh giữa animation, tab background, reduced motion, storage bị chặn. Nút Retry không làm mất dữ liệu lời chúc đã đọc.

Các nút pháo chỉ hoạt động khi preset/shader tương ứng sẵn sàng; có trạng thái tải/lỗi và Retry. Không cho vào cảnh tự bắn trống, không chặn countdown vì asset cây chưa cần. Khi chuyển qua lại cây/pháo hoa, hủy timeline cũ và tái dùng tài nguyên phù hợp.




Readiness hiện chờ cả tet-house.glb và tet-courtyard.glb cùng font UI và compile shader. Khi một GLB lỗi có thể Retry 3D (xóa cache cả hai GLB) hoặc dùng fallback 2D. Fallback có câu đối, đèn và góc nồi bánh chưng minh họa; mặt trăng là lớp riêng để ẩn trong cảnh pháo hoa.


