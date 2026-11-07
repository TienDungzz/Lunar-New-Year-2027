# Thiết kế cảnh 3D và bố trí không gian

## Hệ tọa độ đề xuất
Y lên; nhà hướng về Z dương; camera nhìn từ sân trước về Z âm. Đơn vị gần mét, các tọa độ sau là **khởi điểm thiết kế** và phải tinh chỉnh khi dựng mô hình.

| Vật thể | Vị trí tâm [x,y,z] | Ghi chú |
|---|---|---|
| Nhà | [0,0,-3] | rộng 7, cao mái khoảng 5; mái ngói nâu |
| Hiên nhà | [0,0,-0.6] | bậc tam cấp, cột gỗ, đèn vàng |
| Cây mai | [-3.5,0,1.2] | tránh che cửa, 8 anchor cho vật trang trí treo có thể chọn |
| Vùng trời pháo hoa | phía trên/sau mái nhà | vùng nổ an toàn, tránh UI; trọng tâm khung hình pháo hoa |
| Lối sân | [0,0,3.5] | gạch lát, viền cỏ |
| Hậu cảnh | z < -7 | bụi tre, cây xa, đồi tối giản |

## Phân lớp
- **Tiền cảnh:** gạch sân, chậu hoa nhỏ, lá rơi.
- **Trung cảnh:** nhà, mái, cửa, đèn lồng, cây mai và vật trang trí treo.
- **Hậu cảnh:** cây xa, mái nhà lân cận gợi ý, bầu trời đêm; trăng chỉ hiện ở cảnh nhà/cây, ẩn trong reveal/pháo hoa và chuyển camera liên quan.

## Chi tiết gợi sum vầy mà không cần nhân vật
Hai hoặc ba ghế mây xếp quanh bàn, ấm trà và chén trà, khay mứt, bánh chưng, câu đối, đôi dép trước bậc cửa, ánh đèn từ cửa sổ, khói bếp mỏng. Tránh bố trí quá dày gây rối hoặc che điểm tương tác.

## Chuyển động môi trường
Đèn lồng lắc 1–3 độ; hoa/lá bay chậm với số lượng giới hạn; mây trôi; ánh cửa sổ dao động rất nhẹ. Không có vật lý toàn cảnh. `prefers-reduced-motion` giảm hoặc dừng các chuyển động lặp.

## Quy tắc tương tác
Cây mai chỉ chọn 8 vật trang trí treo có ID; hoa mai nền không nhận raycast. Hitbox vật treo rộng hơn mesh, đặc biệt trên mobile. Cảnh pháo hoa có nút DOM bắn từng kiểu, không phụ thuộc raycast trên trời. Camera và overlay không che nhau. Bàn trà nếu giữ chỉ là đạo cụ nền, không có cảnh cận hoặc tương tác riêng.




## Trang trí sân nhà đã triển khai
- Câu đối chữ Việt: “Xuân sang phúc lộc đầy nhà” và “Tết đến an khang vạn sự”, cùng biển “Chúc Mừng Năm Mới”; chữ được chuyển thành mesh trong GLB, không dùng ký hiệu giả chữ.
- Sáu chậu cúc vàng/cam, hai cây quất có quả, hàng rào gỗ thấp và hai cột cổng treo đèn lồng đỏ.
- Ba dây đèn bóng vàng có dây võng: ngang sân và từ hiên tới cổng; thêm nguồn sáng ấm gần đèn cổng.
- Góc bên phải hiên: nồi bánh chưng bằng kim loại trên bếp gạch, củi và than hồng; cạnh nồi có bánh gói lá dong buộc lạt trên thùng gỗ thấp. Đây là đạo cụ nền, không thêm cảnh bàn hoặc mini game.
- Hơi nước nhẹ bốc từ nắp và lửa nhỏ dưới nồi do HearthEffects.tsx dựng; không chạy chuyển động lặp khi reduced motion, dừng render khi tab ẩn.

Asset sân dùng cùng gốc [0.6,0,-3.9] với nhà sau chuyển trục glTF. Tâm nồi trong world web là [5.05,0,-1]; giữ khu vực trước cây mai và đường đi thoáng, không che vật treo.

