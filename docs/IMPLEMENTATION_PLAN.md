# Lộ trình triển khai

## Giai đoạn 1 — Foundation
Vite/React/TS, R3F, i18n, state machine, countdown thật/preview, responsive và fallback 2D. **Bàn giao:** countdown trên môi trường placeholder.

## Giai đoạn 2 — Environment
Dùng Blender MCP để dựng/tinh chỉnh blockout nhà/sân/hiên/cây, vật liệu, camera, đèn vàng và render tham chiếu; chốt vùng trời cho pháo hoa và anchor treo trang trí. **Bàn giao:** môi trường liên tục không nhân vật.

## Giai đoạn 3 — Pháo hoa trọng tâm
Tạo mẫu hình dạng/timing bằng Blender MCP, lưu tham số và render tham chiếu; tái tạo bằng pool particle web với 17 preset hình/cơ chế và pháo chữ tối đa 12 ký tự, nút bắn trực tiếp, giới hạn đồng thời/cooldown, màn tự bắn 5 phút có pause/resume/replay, audio opt-in, reduced motion. **Bàn giao:** tự bắn nhiều kiểu, không tự chuyển cảnh; kiểm tra hình dạng trên mobile/fallback.

## Giai đoạn 4 — Cây mai
8 vật treo, anchor/hitbox riêng, raycast, OrbitControls, danh sách DOM, thiệp VI/EN và lưu tiến độ. **Bàn giao:** đọc đủ lời chúc và qua lại cây/pháo hoa không mất trạng thái.

## Giai đoạn 5 — Polish/QA
Loading nhiều tầng, Retry, context loss/fallback, adaptive quality, keyboard, touch, screenshots và benchmark thiết bị thật. **Bàn giao:** release candidate qua test matrix.

## Rủi ro và phương án
- Bắn liên tục quá tải GPU: pool, giới hạn đồng thời và bỏ yêu cầu vượt budget.
- Hình trái tim/vòng tròn khó nhận diện: căn theo camera, kiểm tra DPR thấp.
- Vật treo bị che/khó chạm: chỉnh anchor, hitbox lớn, danh sách DOM.
- Countdown sai: epoch UTC+7, fake clock và visibilitychange.
- Timeline/camera chạy trùng: state machine idempotent và cleanup.


## Tiến độ triển khai
Đã có foundation, GLB nhà tạo bằng Blender MCP, cây mai procedural, 8 vật treo, UI VI/EN, countdown/preview, 17 kiểu hình/cơ chế và pháo chữ, màn tự bắn 5 phút, camera transition, fallback 2D, API tùy chọn, font cục bộ và âm thanh tổng hợp. Kiểm thử tự động cho flow/content đã có. Chưa hoàn tất QA hình ảnh browser/responsive, so khớp mẫu pháo trong Blender hoặc benchmark thiết bị thật; giai đoạn polish/QA vẫn mở. Không coi là release candidate.





