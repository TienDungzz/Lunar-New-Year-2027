# Quy chuẩn BEM của dự án

Class UI dùng chữ thường và dấu gạch ngang; block độc lập như header, countdown, firework-dock, wish-dialog, tree-panel. Element dùng __, modifier dùng -- và luôn đi với class gốc. Không dùng class trạng thái chung như selected hoặc on.

Logic TypeScript, mesh Three.js và đối tượng Blender không phải class CSS. Styles bố cục ở src/styles/global.css; token và font chỉ khai báo tại src/styles/variables.css, import trước global.css. Mỗi var() có fallback. Chi tiết tại [CSS_TOKENS](CSS_TOKENS.md). Không có file christmas-theme.css hay nội dung Noel.

Ví dụ: firework-button firework-button--selected; wish-list__button wish-list__button--seen. Trạng thái native disabled/focus-visible/aria-pressed được dùng cho accessibility. Dialog dùng phần tử dialog native để focus trap và hỗ trợ Escape.

Chạy npm.cmd run check:bem để kiểm tra tên selector class. Đây là kiểm tra cú pháp tên, không kiểm toàn bộ quan hệ DOM hoặc accessibility. TypeScript và kiểm thử hành vi chạy qua npm.cmd run check; build qua npm.cmd run build.



