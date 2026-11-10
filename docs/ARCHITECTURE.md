# Kiến trúc ứng dụng, dữ liệu và trạng thái

## Stack triển khai
React 19 + TypeScript + Vite + Three.js + React Three Fiber + Drei; GSAP cho camera; CSS/HTML cho UI. Đã có triển khai nền tảng trong src/. App.tsx chỉ ghép các vùng UI; lifecycle được tách thành hook theo trách nhiệm.

## Các module chính
- App.tsx và hooks/useExperience.ts: ghép UI, điều phối nội dung và tiến độ.
- hooks/useExperienceClock.ts: countdown thật/preview, visibility, chuyển cảnh tại 0.
- hooks/useExperienceAudio.ts: volume và lifecycle audio.
- hooks/useFireworkLaunches.ts và useFireworkShow.ts: admission, cooldown, lịch tự bắn.
- hooks/useSceneFallback.ts và components/ExperienceScene.tsx: tải 3D, timeout, fallback và retry lazy import.
- components/ExperienceContent.tsx: header, welcome/countdown và bảng lời chúc.
- hooks/useSkyWriting.ts: bản nháp chữ và trạng thái form trong phiên, giữ khi đổi cảnh.
- scenes/World.tsx, ApricotTree.tsx, ApricotBotany.tsx, apricotStructure.ts, Fireworks.tsx: camera, môi trường, cây và renderer.
- lib/experience.mjs, fireworkDynamics.mjs, textSalvo.mjs: reducer, hình dạng và timeline dùng chung.
- components/FallbackScene.tsx: Canvas2D/SVG; components/WishDialog.tsx: dialog native.
- i18n/{vi,en}.json và styles/{variables,global}.css: nhãn VI/EN và token tập trung.

## State machine
`LOADING`, `COUNTDOWN`, `FIREWORKS`, `TREE_TRANSITION`, `TREE_EXPLORE`, `FIREWORKS_TRANSITION`.

Sự kiện: `READY`, `MIDNIGHT`, `PREVIEW`, `REVEAL_DONE`, `OPEN_TREE`, `OPEN_FIREWORKS`, `TRANSITION_DONE`. Bắn pháo và mở/đóng thiệp được xử lý bởi hook riêng, không phải event của reducer.

FIREWORKS có đồng hồ tự bắn độc lập useFireworkShow, 300.000ms đang xem. Có pause/resume/replay; không khóa bắn thủ công. Rời cảnh hoặc ẩn tab thì dừng đồng hồ và dọn vụ nổ, quay lại tiếp tục. Hết giờ ở lại cảnh, chỉ dừng tự bắn. Khóa điều hướng trùng trong transition; không phát dồn lượt đã lỡ. Bộ chọn có 17 hình/cơ chế và pháo chữ, validate/rasterize cục bộ tối đa 24 grapheme.

Chuyển trạng thái idempotent; dọn timer khi unmount/tab ẩn. Tách `clockMode: real|preview` khỏi `scenePhase`. Khi trở lại tab tính lại thời gian, không phát dồn hiệu ứng.

## Nguồn sự thật
- `TET_INSTANT = '2027-02-06T00:00:00+07:00'`, timezone `Asia/Ho_Chi_Minh`.
- `wishes`: 8 ID ổn định, `title`, `body`; VI/EN cùng ID.
- `ornaments`: 8 anchor tại ApricotTree.tsx gắn thứ tự ổn định wish-01…wish-08; API merge theo ID, không đổi thứ tự cục bộ.
- `fireworkPresets`: 17 kiểu hình/cơ chế và text (xem FIREWORKS_SPEC), nhãn VI/EN, shape sampler, màu, lifetime, budget và cooldown theo quality profile.
- `sceneLayout`: transform, camera presets, vùng trời an toàn và hit targets.

## Lưu trữ
localStorage: `tet-language`, `tet-sound-volume` (0–100, mặc định 70), `tet-wishes-seen`. Audio luôn tắt khi tải trang, không khôi phục trạng thái bật; preview và bản nháp chỉ giữ trong bộ nhớ phiên. Validate JSON/ID; storage bị chặn/hỏng không làm app ngừng chạy. Không lưu hàng đợi pháo hoa để phát lại sau refresh.

## Countdown và điều khiển
Tính remaining từ `Math.max(0, Math.ceil((Date.parse(TET_INSTANT) - Date.now()) / 1000))`, không cộng trừ theo tick. Cập nhật mỗi 250–1000ms và trên visibilitychange. MVP dùng giờ hệ thống.

Chỉ bật OrbitControls trong TREE_EXPLORE, tắt pan, giới hạn zoom/góc cực; khóa khi transition/dialog đang mở. Raycast chỉ nhận 8 vật treo tương tác, phân biệt drag xoay cây với tap mở thiệp. DOM có nút thay thế. Các nút pháo dùng cùng đường xử lý cho touch, chuột và keyboard.

## Công cụ phát triển 3D
Cho phép agent dùng Blender MCP để tạo và kiểm tra môi trường/đạo cụ/hiệu ứng tham chiếu theo [LOCAL_3D_TOOLS](LOCAL_3D_TOOLS.md). Đây là công cụ phát triển, không phải dependency hoặc kết nối của frontend khi chạy. Không có module tải model/rig nhân vật. Asset xuất dùng trong web phải được kiểm tra lại với renderer runtime.


## Nội dung API tùy chọn
Hợp đồng và module đã triển khai tại [CONTENT_API](CONTENT_API.md). API chỉ ghi đè title/body VI/EN của 8 wishId, không đổi anchor, vật treo, preset pháo hoa hay mốc giao thừa. Không cấu hình hoặc lỗi thì dùng dữ liệu cục bộ. Countdown/pháo hoa không chờ API; mở thiệp chờ nội dung hoặc timeout tối đa 8 giây. Khi ID URL đổi, hủy request cũ, bỏ phản hồi đến muộn và đóng dialog cũ.

tet-wishes-seen dùng định dạng có version, phân namespace default hoặc api:<id> kèm endpoint chuẩn hóa theo CONTENT_API; mảng ID cũ chỉ chuyển vào default. Đây là phần mở rộng quy tắc lưu trữ ở trên, tránh dùng nhầm tiến độ giữa các bộ nội dung. Không lưu payload API vào localStorage.


## Cấu trúc triển khai hiện tại
App.tsx ghép UI, hooks/useExperience.ts điều phối các hook lifecycle; lib/experience.mjs chứa countdown/reducer/shape sampler; scenes/World.tsx tải GLB và điều khiển camera; ApricotTree.tsx và Fireworks.tsx dựng nội dung procedural. hooks/useWishContent.ts và lib/contentApi.mjs thực hiện API. components/FallbackScene.tsx dùng Canvas2D và SVG khi WebGL2 lỗi. components/WishDialog.tsx dùng dialog native. Chi tiết chưa qua browser QA và benchmark thực tế.





fireworkDynamics.mjs là nguồn timeline dùng chung giữa Fireworks.tsx, FallbackScene.tsx và audio.ts: phóng/bay/nổ/nổ phụ được mô tả theo thời gian thực từ lúc bắn. Các pha con chia sẻ budget của gói mẹ, không tạo các lượt bắn mới không giới hạn. Audio lấy cue cùng timeline, hủy nguồn đã hẹn khi mute/ẩn tab/rời cảnh.



FireworksControls cố định dưới đáy, useMedia chỉ điều chỉnh bố cục mobile; không còn đọc/ghi tet-firework-dock hoặc selector đổi vị trí. Đổi viewport không remount/reset đồng hồ hoặc ô nhập chữ.

