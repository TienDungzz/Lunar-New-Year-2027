# Kiến trúc ứng dụng, dữ liệu và trạng thái

## Stack đề xuất
React 19 + TypeScript + Vite + Three.js + React Three Fiber + Drei; GSAP cho camera; CSS/HTML cho UI. Đã có triển khai nền tảng trong src/. Chi tiết file thực tế xem cây mã nguồn; đây là kiến trúc định hướng, một số module được gộp trong App.tsx và World.tsx.

## Cây thư mục dự kiến
```text
src/
  main.tsx
  App.tsx
  components/{Countdown,SceneLoading,LanguageSelect,WishCard,FireworksControls,SoundToggle}.tsx
  hooks/{useExperienceFlow,useCountdown,useReducedMotion,useQualityProfile}.ts
  scenes/{TetEnvironment,House,Porch,ApricotTree,TreeOrnament,Fireworks,Sky,CameraRig}.tsx
  data/{wishes.vi,wishes.en,ornaments,fireworkPresets,sceneLayout}.ts
  lib/{time,storage,random}.ts
  i18n.tsx
  styles/global.css
public/models/ public/textures/ public/audio/ public/images/
scripts/{check-content,check-assets,check-flow,check-responsive}.mjs
art/blender/
```

## State machine
`LOADING`, `COUNTDOWN`, `FIREWORKS`, `TREE_TRANSITION`, `TREE_EXPLORE`, `FIREWORKS_TRANSITION`.

Sự kiện: `ASSETS_READY`, `MIDNIGHT_REACHED`, `PREVIEW_START`, `LAUNCH_FIREWORK(typeId)`, `OPEN_TREE`, `OPEN_FIREWORKS`, `TRANSITION_FINISHED`, `OPEN_WISH(wishId)`, `CLOSE_WISH`, `RESET_VIEW`.

FIREWORKS có đồng hồ tự bắn độc lập useFireworkShow, 300.000ms đang xem. Có pause/resume/replay; không khóa bắn thủ công. Rời cảnh hoặc ẩn tab thì dừng đồng hồ và dọn vụ nổ, quay lại tiếp tục. Hết giờ ở lại cảnh, chỉ dừng tự bắn. Khóa điều hướng trùng trong transition; không phát dồn lượt đã lỡ. Bộ chọn có 17 hình/cơ chế và pháo chữ, validate/rasterize cục bộ tối đa 12 ký tự.

Chuyển trạng thái idempotent; dọn timer khi unmount/tab ẩn. Tách `clockMode: real|preview` khỏi `scenePhase`. Khi trở lại tab tính lại thời gian, không phát dồn hiệu ứng.

## Nguồn sự thật
- `TET_INSTANT = '2027-02-06T00:00:00+07:00'`, timezone `Asia/Ho_Chi_Minh`.
- `wishes`: 8 ID ổn định, `title`, `body`, `theme`, `anchorId`; VI/EN cùng ID.
- `ornaments`: 8 ID, `wishId`, `anchorId`, loại hình và transform; mỗi vật treo gắn một lời chúc, không phụ thuộc thứ tự mảng.
- `fireworkPresets`: 17 kiểu hình/cơ chế và text (xem FIREWORKS_SPEC), nhãn VI/EN, shape sampler, màu, lifetime, budget và cooldown theo quality profile.
- `sceneLayout`: transform, camera presets, vùng trời an toàn và hit targets.

## Lưu trữ
localStorage: `tet-language`, `tet-sound-volume` (0–100, mặc định 70), `tet-sound-enabled` (preference, audio vẫn cần user gesture), `tet-wishes-seen`. sessionStorage: `tet-preview-played` và trạng thái điều hướng nếu cần. Validate JSON/ID; storage bị chặn/hỏng không làm app ngừng chạy. Không lưu hàng đợi pháo hoa để phát lại sau refresh.

## Countdown và điều khiển
Tính remaining từ `Math.max(0, Math.ceil((Date.parse(TET_INSTANT) - Date.now()) / 1000))`, không cộng trừ theo tick. Cập nhật mỗi 250–1000ms và trên visibilitychange. MVP dùng giờ hệ thống.

Chỉ bật OrbitControls trong TREE_EXPLORE, tắt pan, giới hạn zoom/góc cực; khóa khi transition/dialog đang mở. Raycast chỉ nhận 8 vật treo tương tác, phân biệt drag xoay cây với tap mở thiệp. DOM có nút thay thế. Các nút pháo dùng cùng đường xử lý cho touch, chuột và keyboard.

## Công cụ phát triển 3D
Cho phép agent dùng Blender MCP để tạo và kiểm tra môi trường/đạo cụ/hiệu ứng tham chiếu theo [LOCAL_3D_TOOLS](LOCAL_3D_TOOLS.md). Đây là công cụ phát triển, không phải dependency hoặc kết nối của frontend khi chạy. Không có module tải model/rig nhân vật. Asset xuất dùng trong web phải được kiểm tra lại với renderer runtime.


## Nội dung API tùy chọn
Hợp đồng và module đã triển khai tại [CONTENT_API](CONTENT_API.md). API chỉ ghi đè title/body VI/EN của 8 wishId, không đổi anchor, vật treo, preset pháo hoa hay mốc giao thừa. Không cấu hình hoặc lỗi thì dùng dữ liệu cục bộ. Countdown/pháo hoa không chờ API; mở thiệp chờ nội dung hoặc timeout tối đa 8 giây. Khi ID URL đổi, hủy request cũ, bỏ phản hồi đến muộn và đóng dialog cũ.

tet-wishes-seen dùng định dạng có version, phân namespace default hoặc api:<id> kèm endpoint chuẩn hóa theo CONTENT_API; mảng ID cũ chỉ chuyển vào default. Đây là phần mở rộng quy tắc lưu trữ ở trên, tránh dùng nhầm tiến độ giữa các bộ nội dung. Không lưu payload API vào localStorage.


## Cấu trúc triển khai hiện tại
App.tsx điều phối state machine, UI và timer; lib/experience.mjs chứa countdown/reducer/shape sampler; scenes/World.tsx tải GLB và điều khiển camera; ApricotTree.tsx và Fireworks.tsx dựng nội dung procedural. hooks/useWishContent.ts và lib/contentApi.mjs thực hiện API. components/FallbackScene.tsx dùng Canvas2D và SVG khi WebGL2 lỗi. components/WishDialog.tsx dùng dialog native. Chi tiết chưa qua browser QA và benchmark thực tế.





fireworkDynamics.mjs là nguồn timeline dùng chung giữa Fireworks.tsx, FallbackScene.tsx và audio.ts: phóng/bay/nổ/nổ phụ được mô tả theo thời gian thực từ lúc bắn. Các pha con chia sẻ budget của gói mẹ, không tạo các lượt bắn mới không giới hạn. Audio lấy cue cùng timeline, hủy nguồn đã hẹn khi mute/ẩn tab/rời cảnh.



FireworksControls lưu preference vị trí bảng tại tet-firework-dock (bottom|left|right), validate trước khi dùng. useMedia áp vị trí hiệu lực bottom cho mobile; không thay đổi giá trị desktop đã lưu. Chỉ thay layout của cùng component, không remount/reset đồng hồ hoặc ô nhập chữ.

