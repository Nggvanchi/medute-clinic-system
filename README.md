# ClinicCare - Hệ Thống Quản Lý Hồ Sơ & Lịch Khám Phòng Khám

Hệ thống Dashboard quản trị và điều phối phòng khám y tế hiện đại (**ClinicCare**), được xây dựng trên nền tảng **Next.js 16**, **React 19**, **TypeScript** và **Tailwind CSS 4**. Ứng dụng cung cấp giải pháp toàn diện cho nhân viên y tế và bác sĩ: quản lý hàng đợi tiếp nhận thông minh, điều phối bệnh nhân theo mức ưu tiên, truy xuất hồ sơ theo khung thời gian, tra cứu bệnh án cùng dòng thời gian y tế (Medical Timeline), đặt/hủy lịch hẹn và quản lý lịch tái khám tự động.

---

## 📑 Mục lục

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

## 🩺 Chi tiết các phân hệ chức năng

### 1. Hàng đợi bệnh nhân (Patient Queue)
Quản lý lượt gọi khám và điều phối tiếp nhận bệnh nhân theo thời gian thực:
- **Hai chế độ phân loại**:
  - *Theo thứ tự đăng ký tiếp nhận*: Xếp theo nguyên tắc FIFO (First-In, First-Out) dựa vào thời điểm bệnh nhân check-in.
  - *Theo mức độ ưu tiên*: Tự động phân cấp theo 3 mức độ lâm sàng:
    - 🔴 **Mức 1 - Cấp cứu**: Ưu tiên cao nhất.
    - 🟡 **Mức 2 - Ưu tiên cao**: Người già, trẻ nhỏ, phụ nữ mang thai hoặc bệnh cấp tính.
    - ⚪ **Mức 3 - Bình thường**: Khám định kỳ hoặc tái khám thông thường.
- **Thống kê nhanh số lượng**: Hiển thị tổng số bệnh nhân đang chờ theo từng nhóm ưu tiên.
- **Bộ lọc tìm kiếm tức thì**: Lọc theo Họ tên, Mã bệnh nhân (VD: `BN100235`) hoặc Số điện thoại.
- **Hành động gọi khám**: Nút *"Gọi khám"* chuyển đổi trạng thái bệnh nhân từ `Đang chờ khám` sang `Đang khám`.

### 2. Truy xuất theo thời gian (Time-range Retrieval)
Giải thuật tìm kiếm và phân đoạn bệnh nhân theo khung giờ:
- **Khoảng thời gian tùy chọn**: Chọn mốc giờ bắt đầu và giờ kết thúc (hệ thống 48 ca khám 30 phút trong 24h).
- **Bộ lọc nhanh theo ca làm việc**:
  - 🌅 Ca sáng: `07:30 – 11:30`
  - ☀️ Ca chiều: `13:00 – 17:00`
  - 🌙 Ca tối: `17:30 – 20:00`
- **Bảng kết quả**: Hiển thị danh sách các bệnh nhân có giờ hẹn nằm chính xác trong khoảng thời gian đã lọc.

### 3. Tra cứu & Lịch sử khám (Lookup & Medical Timeline)
Phân hệ cốt lõi hiển thị hồ sơ chi tiết và lịch sử khám bệnh:
- **Card Tìm kiếm nhanh**:
  - Ô nhập mã bệnh nhân hoặc tên kèm nút tìm kiếm nổi bật.
  - Hàng gợi ý mã nhanh (Quick Suggestion Chips): `BN100235`, `BN000107`, `BN000101`, `BN000103` (click vào tự động điền và truy xuất tức thì).
- **Card Thông tin bệnh nhân (Patient Profile - Chiếm ~47% Desktop)**:
  - Header: Avatar tròn người dùng, Họ và tên (18–20px font-semibold), Mã bệnh nhân (font-mono), cùng Badge trạng thái khám hiện tại (`● Chưa khám`, `● Đang khám`, `● Đã khám`, `● Đã hủy`).
  - Lưới thông tin 2 cột rõ ràng:
    - `NGÀY SINH` | `SỐ ĐIỆN THOẠI`
    - `NGÀY KHÁM` | `THÔNG TIN LỊCH HẸN` (`✓ Có` hoặc `Chưa có`)
  - **Logic tự động suy diễn thông minh**:
    - Nếu bệnh nhân có lịch hẹn hoặc lịch tái khám: Ngày khám là ngày đặt hẹn, Thông tin lịch hẹn: *Có*, Trạng thái khám: *Chưa khám*.
    - Nếu không có lịch hẹn trước: Ngày khám là ngày khám gần nhất, Thông tin lịch hẹn: *Chưa có*, Trạng thái khám: *Đã khám*.
  - Tuyệt đối không thêm các thông số thống kê dư thừa, giữ hồ sơ sạch sẽ và bảo mật.
- **Card Lịch sử khám bệnh (Medical Timeline - Chiếm ~53% Desktop)**:
  - Header: Icon `ClipboardList` + Tiêu đề *"Lịch sử khám bệnh"*, không tạo nút bấm giả.
  - **Vertical Medical Timeline**:
    - Mỗi mốc khám hiển thị trên một hàng ngang: `● [Ngày khám]  [Loại khám]  [● Đã khám]`.
    - Dot tròn xanh primary `#2563EB` với hiệu ứng hào quang nhẹ.
    - Đường line nối dọc `#BFDBFE` liền mạch giữa các mốc khám, tự động dừng ở mốc cuối cùng.
    - Đã gỡ bỏ hoàn toàn nút *"Xóa"* lịch sử để đảm bảo tính nguyên vẹn của bệnh án y khoa.
  - **Trạng thái rỗng (Empty State)**: Khi bệnh nhân chưa có tiền sử khám bệnh (như `BN000102`), hiển thị icon dịu mắt cùng dòng chữ *"Chưa có lịch sử khám bệnh"*, không vẽ line timeline rỗng.

### 4. Đặt / Hủy lịch khám (Appointment Booking)
- **Form đăng ký khám bệnh**:
  - Nhập thông tin: Họ và tên, Ngày sinh, Số điện thoại, Nhu cầu khám (12 chuyên khoa: Tim mạch, Hô hấp, Da liễu, Cơ xương khớp, Tai Mũi Họng, Sản - Phụ khoa, Nhi,...).
  - Chọn ngày khám và Khung giờ khám (hệ 48 khung giờ 24h).
  - Tự động hiển thị số chỗ trống theo thời gian thực (VD: `2/5 chỗ`). Các khung giờ đã đầy (`5/5`) sẽ tự động bị vô hiệu hóa để chống trùng lịch.
- **Danh sách lịch hẹn hiện hành**: Hiển thị bảng theo dõi các lịch đã đăng ký kèm chức năng *"Hủy lịch"* nhanh chóng.

### 5. Nhắc lịch khám (Follow-up Reminders)
- **Thiết lập lịch tái khám**: Tạo lịch nhắc hẹn cho bệnh nhân xuất viện hoặc cần tái kiểm tra theo Mã BN, Ngày hẹn, Giờ hẹn và Nội dung khám.
- **Bảng danh sách lịch tái khám chuẩn hóa**:
  - Cột 1: `MÃ BN` (font-mono xanh primary)
  - Cột 2: `HỌ TÊN` (Tự động tra cứu họ tên bệnh nhân tương ứng từ danh mục)
  - Cột 3: `NGÀY`
  - Cột 4: `GIỜ`
  - Cột 5: `NỘI DUNG`
  - Cột 6: `TRẠNG THÁI` (Badge: *Sắp tới*, *Hoàn thành*, *Đã hủy*)

---

## 💻 Công nghệ sử dụng

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Thư viện UI**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) (Bộ icon chuẩn hóa đồng bộ)
- **Quản lý chủ đề**: [`next-themes`](https://github.com/pacocoursey/next-themes) (Hỗ trợ Dark/Light mode không giật flash)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Cài đặt và khởi chạy

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

## 🔒 Dữ liệu & Giới hạn hiện tại

- **Môi trường Client State**: Ứng dụng hiện lưu trữ và điều phối trạng thái thông qua React State trong bộ nhớ trình duyệt (`useState`, `useMemo`). Việc làm mới trang (`F5`) sẽ khôi phục lại dữ liệu mẫu ban đầu từ `lib/clinic-mock-data.ts`.
- **Chưa tích hợp Database/Backend thực tế**: Dự án phục vụ mục đích xây dựng và mô phỏng giao diện chuẩn cho hệ thống quản lý phòng khám (đồ án / prototype), chưa kết nối với cơ sở dữ liệu quan hệ (PostgreSQL/MySQL) hay dịch vụ xác thực người dùng (Auth) thực thụ.
- **Bảo toàn dữ liệu y khoa**: Chức năng xóa bản ghi lịch sử khám bệnh đã bị vô hiệu hóa trên giao diện để tuân thủ nguyên tắc lưu trữ hồ sơ bệnh án không thể chỉnh sửa.
