# Quản lý Hồ sơ Bệnh nhân

Giao diện dashboard hỗ trợ nhân viên phòng khám theo dõi hàng đợi, tra cứu hồ sơ và lịch sử khám, đặt hoặc hủy lịch khám, cũng như lập lịch tái khám. Ứng dụng dùng dữ liệu mẫu để trình diễn các luồng thao tác trên giao diện.

## Chức năng giao diện

- **Hàng đợi bệnh nhân:** xem danh sách theo thứ tự đăng ký hoặc mức ưu tiên (cấp cứu, ưu tiên cao, bình thường); tìm nhanh theo tên, mã bệnh nhân hoặc số điện thoại; gọi bệnh nhân đang chờ vào khám.
- **Truy xuất theo thời gian:** lọc bệnh nhân theo giờ hẹn, chọn khoảng giờ tùy ý hoặc dùng nhanh các khoảng ca sáng/ca chiều. Có thể kết hợp với ô tìm kiếm nhanh trên thanh đầu trang.
- **Tra cứu & lịch sử:** tra cứu hồ sơ theo mã bệnh nhân, xem thông tin cá nhân và các lượt khám đã lưu trong dữ liệu mẫu; xóa một lượt khỏi danh sách lịch sử hiển thị.
- **Đặt / hủy lịch:** nhập thông tin bệnh nhân, chọn nhu cầu khám, ngày và khung giờ; khung giờ hết chỗ bị vô hiệu hóa. Danh sách lịch hẹn hiển thị trạng thái và cho phép hủy lịch.
- **Nhắc lịch khám:** tạo lịch tái khám theo mã bệnh nhân, ngày, giờ và nội dung; xem các lịch đã tạo cùng trạng thái.
- **Giao diện sáng/tối:** chuyển đổi thủ công giữa giao diện sáng và tối; mặc định theo thiết lập hệ thống.

## Công nghệ

- Next.js 16 (App Router), React 19 và TypeScript
- Tailwind CSS 4
- Bộ component giao diện theo phong cách shadcn/ui, xây dựng trên Base UI
- Lucide React cho biểu tượng
- `next-themes` cho giao diện sáng/tối

## Yêu cầu

- Node.js phiên bản tương thích với Next.js 16
- pnpm (phiên bản dự án khai báo: `12.3.4`)

## Cài đặt và chạy

Cài dependencies:

```bash
pnpm install
```

Chạy môi trường phát triển:

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

Tạo bản build production:

```bash
pnpm build
```

Chạy bản build production sau khi build:

```bash
pnpm start
```

## Cấu trúc thư mục

```text
app/
  page.tsx                 Màn hình dashboard và logic tương tác chính
  layout.tsx               Layout gốc, metadata, font, theme provider
  globals.css              Tailwind, biến màu và kiểu dùng chung
components/
  clinic/                  Các component tab tái sử dụng cho nghiệp vụ phòng khám
  ui/                      Các component giao diện cơ bản
  mode-toggle.tsx          Nút đổi giao diện sáng/tối
  theme-provider.tsx       Cấu hình next-themes
lib/
  clinic-types.ts          Kiểu dữ liệu bệnh nhân, hàng đợi, lịch khám
  clinic-mock-data.ts      Danh sách dữ liệu mẫu khởi tạo
  utils.ts                 Hàm tiện ích class CSS
public/                    Tài nguyên tĩnh
```

Trang hiện tại được kết xuất tại route `/`. Các nghiệp vụ chính và trạng thái UI đang được điều phối trong `app/page.tsx`; các file trong `components/clinic/` cung cấp những component tab độc lập, không phải toàn bộ đều được trang chính sử dụng.

## Dữ liệu và giới hạn hiện tại

- Dữ liệu bệnh nhân, hàng đợi, lịch sử, khung giờ và lịch tái khám ban đầu nằm trong `lib/clinic-mock-data.ts`; lịch hẹn mẫu được khởi tạo trong `app/page.tsx`.
- Các thao tác thêm, hủy, gọi khám hoặc xóa lịch sử chỉ cập nhật React state phía trình duyệt. Tải lại trang sẽ khôi phục dữ liệu ban đầu.
- Dự án hiện chưa kết nối backend/API, cơ sở dữ liệu, đăng nhập, phân quyền hoặc dịch vụ gửi thông báo. Mục nhắc lịch chỉ quản lý danh sách trong giao diện, không tự gửi thông báo cho bệnh nhân.
- Đây là UI/demo với dữ liệu giả lập, chưa phù hợp để xử lý hồ sơ y tế hoặc thông tin cá nhân thực tế.

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `pnpm dev` | Chạy server phát triển Next.js |
| `pnpm build` | Tạo bản build production |
| `pnpm start` | Chạy server production sau khi build |
