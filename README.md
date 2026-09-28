# ClinicCare - Hệ Thống Quản Lý Hồ Sơ & Lịch Khám Phòng Khám

Hệ thống Dashboard quản trị và điều phối phòng khám y tế hiện đại (**ClinicCare**), được xây dựng trên nền tảng **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4** và phông chữ **Roboto**. Ứng dụng cung cấp giải pháp toàn diện cho nhân viên y tế và bác sĩ: quản lý hàng đợi tiếp nhận thông minh với bộ lọc ngày khám, điều phối bệnh nhân theo mức độ ưu tiên lâm sàng, truy xuất hồ sơ theo khung thời gian và ca làm việc (Sáng/Chiều/Tối), tra cứu bệnh án cùng dòng thời gian y tế (Medical Timeline), đặt/hủy lịch hẹn và quản lý lịch nhắc tái khám tự động.

---

## Mục lục

1. [Chi tiết các phân hệ chức năng](#-chi-tiết-các-phân-hệ-chức-năng)
   - [1. Hàng đợi bệnh nhân (Patient Queue)](#1-hàng-đợi-bệnh-nhân-patient-queue)
   - [2. Truy xuất theo thời gian (Time-range Retrieval)](#2-truy-xuất-theo-thời-gian-time-range-retrieval)
   - [3. Tra cứu & Lịch sử khám (Lookup & Medical Timeline)](#3-tra-cứu--lịch-sử-khám-lookup--medical-timeline)
   - [4. Đặt / Hủy lịch khám (Appointment Booking)](#4-đặt--hủy-lịch-khám-appointment-booking)
   - [5. Nhắc lịch khám (Follow-up Reminders)](#5-nhắc-lịch-khám-follow-up-reminders)
2. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
3. [Cài đặt và khởi chạy](#-cài-đặt-và-khởi-chạy)
4. [Dữ liệu & Giới hạn hiện tại](#-dữ-liệu--giới-hạn-hiện-tại)

---

## Chi tiết các phân hệ chức năng

### 1. Hàng đợi bệnh nhân (Patient Queue)
Quản lý lượt gọi khám và điều phối tiếp nhận bệnh nhân theo thời gian thực:
- **Thanh công cụ lọc chuyên dụng (Dedicated Toolbar)**:
  - Bố trí trực tiếp dưới phần Header và ngay trên bảng dữ liệu.
  - **Bộ lọc Ngày khám (`Ngày khám:`)**: Cho phép chọn ngày bất kỳ thông qua `<input type="date">` với nút tắt *"Hôm nay"* để nhanh chóng quay về ngày mặc định.
  - Danh sách hàng đợi và chỉ số thống kê sẽ tự động cập nhật động theo ngày khám đã chọn.
- **Hai chế độ phân loại & điều phối**:
  - *Theo thứ tự đăng ký tiếp nhận*: Xếp theo nguyên tắc FIFO (First-In, First-Out) dựa vào thời điểm bệnh nhân check-in tại quầy tiếp đón.
  - *Theo mức độ ưu tiên*: Tự động phân cấp theo 3 mức độ lâm sàng:
    - 🔴 **Mức 1 - Cấp cứu**: Bệnh nhân nguy kịch, cần can thiệp khẩn cấp; tự động đưa lên đầu hàng đợi kèm icon cảnh báo.
    - 🟡 **Mức 2 - Ưu tiên cao**: Người cao tuổi, trẻ nhỏ, phụ nữ mang thai hoặc bệnh nhân có triệu chứng suy nhược.
    - ⚪ **Mức 3 - Bình thường**: Khám định kỳ, kiểm tra sức khỏe hoặc tái khám thông thường.
- **Thống kê nhanh số lượng**: Hiển thị tổng số lượng bệnh nhân đang chờ tương ứng với từng nhóm mức độ ưu tiên theo thời gian thực.
- **Bộ lọc tìm kiếm tức thì**: Tìm kiếm nhanh theo Họ tên, Mã bệnh nhân (VD: `BN100235`) hoặc Số điện thoại.
- **Cột Giờ hẹn chuẩn hóa**: Hiển thị giờ hẹn khám (`gioHen`) tinh gọn, rõ ràng.
- **Hành động điều phối gọi khám**:
  - Nút *"Gọi khám"*: Chuyển đổi trạng thái bệnh nhân từ `Đang chờ khám` sang `Đang khám`.
  - Nút *"Khám xong"*: Chuyển đổi trạng thái từ `Đang khám` sang `Đã khám`.

### 2. Truy xuất theo thời gian (Time-range Retrieval)
Giải thuật tìm kiếm và phân đoạn bệnh nhân theo khung giờ và ca khám:
- **Thanh công cụ lọc một hàng (Single-row Filter Bar)**:
  - Thiết kế đồng bộ trên một hàng ngang duy nhất với chiều cao chuẩn `h-9` và phông chữ Roboto `text-sm`.
  - **Chọn Ngày khám**: Hỗ trợ chọn ngày cụ thể để xem danh sách lịch hẹn trong ngày đó.
  - **Khoảng thời gian tùy chọn**: Chọn mốc giờ bắt đầu (*"Từ:"*) và giờ kết thúc (*"Đến:"*) theo định dạng 24h sạch sẽ (VD: `07:30`, `11:30`, `17:00`).
  - **Bộ lọc nhanh theo 3 ca làm việc chuẩn**:
    - 🌅 **Ca sáng**: `07:30 – 11:30`
    - ☀️ **Ca chiều**: `13:00 – 17:00`
    - 🌙 **Ca tối**: `17:30 – 20:30`
  - **Nút "Xóa lọc"**: Khôi phục lại toàn bộ các khung giờ trong ngày đã chọn.
- **Dòng tiêu đề phụ động (Dynamic Subtitle)**: Tự động cập nhật tóm tắt điều kiện lọc và số lượng kết quả (VD: *"Đang lọc: ngày 27/09/2026, từ 07:30 đến 11:30 (9 ca) — 13 kết quả"*).
- **Bảng kết quả truy xuất**: Hiển thị danh sách các bệnh nhân có giờ hẹn nằm chính xác trong khoảng thời gian đã lọc, cột Giờ hẹn hiển thị giờ hẹn (`gioHen`) rõ ràng và nổi bật.

### 3. Tra cứu & Lịch sử khám (Lookup & Medical Timeline)
Phân hệ cốt lõi hiển thị hồ sơ chi tiết và lịch sử khám bệnh của từng bệnh nhân:
- **Card Tìm kiếm nhanh**:
  - Ô nhập mã bệnh nhân hoặc tên kèm nút tìm kiếm nổi bật.
  - Hàng gợi ý mã nhanh (Quick Suggestion Chips): `BN100235`, `BN000107`, `BN000101`, `BN000103` (click vào tự động điền và truy xuất tức thì).
- **Card Thông tin bệnh nhân**:
  - Header: Avatar tròn người dùng, Họ và tên (phông chữ Roboto rõ nét), Mã bệnh nhân, cùng Badge trạng thái khám hiện tại (`● Chưa khám`, `● Đang khám`, `● Đã khám`, `● Đã hủy`).
  - Lưới thông tin 2 cột rõ ràng:
    - `NGÀY SINH` | `SỐ ĐIỆN THOẠI`
    - `NGÀY KHÁM` | `THÔNG TIN LỊCH HẸN` (`✓ Có` hoặc `Chưa có`)
  - **Logic tự động suy diễn thông minh**:
    - Nếu bệnh nhân có lịch hẹn hoặc lịch tái khám: Ngày khám lấy theo ngày đặt hẹn, Thông tin lịch hẹn: *Có*, Trạng thái khám: *Chưa khám*.
    - Nếu không có lịch hẹn trước: Ngày khám lấy theo ngày khám gần nhất, Thông tin lịch hẹn: *Chưa có*, Trạng thái khám: *Đã khám*.
  - Tuyệt đối không thêm các thông số thống kê dư thừa, giữ hồ sơ sạch sẽ và bảo mật.
- **Card Lịch sử khám bệnh (Medical Timeline)**:
  - Header: Icon `ClipboardList` + Tiêu đề *"Lịch sử khám bệnh"* (đã loại bỏ số thứ tự dư thừa sau tiêu đề).
  - **Vertical Medical Timeline**:
    - Mỗi mốc khám hiển thị trên một hàng ngang: `● [Ngày khám]  [Loại khám]  [● Đã khám]`.
    - Dot tròn xanh primary `#2563EB` với hiệu ứng hào quang nhẹ.
    - Đường line nối dọc `#BFDBFE` liền mạch giữa các mốc khám, tự động dừng ở mốc cuối cùng.
    - Đã gỡ bỏ hoàn toàn nút *"Xóa"* lịch sử để đảm bảo tính nguyên vẹn và bất biến của bệnh án y khoa.
  - **Trạng thái rỗng (Empty State)**: Khi bệnh nhân chưa có tiền sử khám bệnh (như `BN000102`), hiển thị icon dịu mắt cùng dòng chữ *"Chưa có lịch sử khám bệnh"*, không vẽ line timeline rỗng.

### 4. Đặt / Hủy lịch khám (Appointment Booking)
- **Form đăng ký khám bệnh**:
  - Nhập thông tin: Họ và tên, Ngày sinh, Số điện thoại, Nhu cầu khám (12 chuyên khoa phổ biến: Nội tổng quát, Tim mạch, Hô hấp, Tiêu hóa, Thần kinh, Da liễu, Cơ xương khớp, Khám Mắt, Tai Mũi Họng, Răng Hàm Mặt, Sản - Phụ khoa, Nhi khoa).
  - Chọn ngày khám và Khung giờ khám (hệ 24 khung giờ xuyên suốt Ca sáng, Ca chiều và Ca tối).
  - Tự động hiển thị số chỗ trống theo thời gian thực (VD: `2/5 chỗ`). Các khung giờ đã đầy (`5/5`) sẽ tự động bị vô hiệu hóa để chống tình trạng quá tải và trùng lịch hẹn.
- **Danh sách lịch hẹn hiện hành**: Hiển thị bảng theo dõi các lịch đã đăng ký kèm chức năng *"Hủy lịch"* nhanh chóng.

### 5. Nhắc lịch khám (Follow-up Reminders)
- **Thiết lập lịch tái khám**: Tạo lịch nhắc hẹn cho bệnh nhân xuất viện hoặc cần tái kiểm tra theo Mã BN, Ngày hẹn, Giờ hẹn và Nội dung khám kèm kiểm tra tính hợp lệ dữ liệu.
- **Bảng danh sách lịch tái khám chuẩn hóa**:
  - Cột 1: `MÃ BN` (xanh primary).
  - Cột 2: `HỌ TÊN` (Tự động tra cứu họ tên bệnh nhân tương ứng từ danh mục).
  - Cột 3: `NGÀY` (Highlight badge màu xanh dương nổi bật `bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400`, **đã loại bỏ icon** để giữ bảng thông tin thanh thoát, dễ đọc).
  - Cột 4: `GIỜ` (Highlight badge màu chàm nổi bật `bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400`, **đã loại bỏ icon**).
  - Cột 5: `NỘI DUNG` (Chuyên khoa hoặc ghi chú điều trị tái khám).
  - Cột 6: `TRẠNG THÁI` (Badge: *Sắp tới* - cảnh báo hổ phách, *Hoàn thành* - hoàn tất xanh ngọc lục bảo).

---

## Công nghệ sử dụng

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Thư viện UI**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Phông chữ (Typography)**: Duy nhất Google Font **Roboto** trên toàn bộ hệ thống (`next/font/google`, hỗ trợ đầy đủ `latin` & `vietnamese`), áp dụng đồng bộ cho mọi văn bản, tiêu đề, nút bấm, ô nhập liệu, số liệu và mã hồ sơ bệnh án.
- **Icons**: [Lucide React](https://lucide.dev/) (Bộ icon chuẩn hóa đồng bộ)
- **Quản lý chủ đề**: [`next-themes`](https://github.com/pacocoursey/next-themes) (Hỗ trợ Dark/Light mode không giật flash)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## Cài đặt và khởi chạy

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên (khuyến nghị phiên bản LTS 20+)
- **pnpm**: Phiên bản 9.x hoặc 10.x

### Các bước cài đặt

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   pnpm install
   ```

2. **Khởi chạy máy chủ phát triển (Development Server):**
   ```bash
   pnpm dev
   ```
   Truy cập vào ứng dụng tại: [http://localhost:3000](http://localhost:3000)

3. **Kiểm tra và xây dựng bản Production (Build):**
   ```bash
   pnpm build
   ```

4. **Khởi chạy ứng dụng Production:**
   ```bash
   pnpm start
   ```

---

## Dữ liệu & Giới hạn hiện tại

- **Môi trường Client State**: Ứng dụng hiện lưu trữ và điều phối trạng thái thông qua React State trong bộ nhớ trình duyệt (`useState`, `useMemo`). Việc làm mới trang (`F5`) sẽ khôi phục lại dữ liệu mẫu ban đầu từ `lib/clinic-mock-data.ts`.
- **Chưa tích hợp Database/Backend thực tế**: Dự án phục vụ mục đích xây dựng và mô phỏng giao diện chuẩn cho hệ thống quản lý phòng khám (đồ án / prototype), chưa kết nối với cơ sở dữ liệu quan hệ (PostgreSQL/MySQL) hay dịch vụ xác thực người dùng (Auth) thực thụ.
- **Bảo toàn dữ liệu y khoa**: Chức năng xóa bản ghi lịch sử khám bệnh đã bị vô hiệu hóa trên giao diện để tuân thủ nguyên tắc lưu trữ hồ sơ bệnh án không thể chỉnh sửa.
