import type { BenhNhan, HangDoiItem, KhungGioKhamItem, LichSuKhamItem, LichTaiKhamItem } from "./clinic-types"

export const danhSachBenhNhan: BenhNhan[] = [
  { maBN: "BN000101", hoTen: "Nguyễn Văn An", ngaySinh: "12/05/1985", sdt: "0912345678" },
  { maBN: "BN000102", hoTen: "Trần Thị Bình", ngaySinh: "23/11/1990", sdt: "0987654321" },
  { maBN: "BN000103", hoTen: "Lê Hoàng Cường", ngaySinh: "04/02/1978", sdt: "0901234567" },
  { maBN: "BN000104", hoTen: "Phạm Thị Duyên", ngaySinh: "30/07/1995", sdt: "0933445566" },
  { maBN: "BN000105", hoTen: "Hoàng Văn Em", ngaySinh: "18/09/1988", sdt: "0977889900" },
  { maBN: "BN000106", hoTen: "Vũ Thị Hạnh", ngaySinh: "09/03/2000", sdt: "0966112233" },
  { maBN: "BN000107", hoTen: "Đặng Văn Khoa", ngaySinh: "27/12/1970", sdt: "0944556677" },
  { maBN: "BN100235", hoTen: "Ngô Thị Lan", ngaySinh: "15/06/1992", sdt: "0955667788" },
]

export const hangDoiKhoiTao: HangDoiItem[] = [
  { id: "hd-1", maBN: "BN000103", mucUuTien: 1, gioHen: "08:00", gioDangKy: "07:42", trangThai: "Đang chờ khám" },
  { id: "hd-2", maBN: "BN000101", mucUuTien: 3, gioHen: "08:15", gioDangKy: "07:50", trangThai: "Đang chờ khám" },
  { id: "hd-3", maBN: "BN000104", mucUuTien: 2, gioHen: "08:30", gioDangKy: "07:35", trangThai: "Đang chờ khám" },
  { id: "hd-4", maBN: "BN000102", mucUuTien: 3, gioHen: "08:45", gioDangKy: "08:20", trangThai: "Đang chờ khám" },
  { id: "hd-5", maBN: "BN000106", mucUuTien: 2, gioHen: "09:00", gioDangKy: "07:55", trangThai: "Đang chờ khám" },
  { id: "hd-6", maBN: "BN000105", mucUuTien: 3, gioHen: "09:15", gioDangKy: "08:05", trangThai: "Đang khám" },
  { id: "hd-7", maBN: "BN000107", mucUuTien: 1, gioHen: "09:30", gioDangKy: "07:10", trangThai: "Đã khám" },
]

export const lichSuKhamKhoiTao: LichSuKhamItem[] = [
  { id: "ls-1", maBN: "BN100235", ngayKham: "02/01/2026", chuyenKhoa: "Nội tổng quát", tinhTrang: "Ổn định, hẹn tái khám sau 1 tháng" },
  { id: "ls-2", maBN: "BN100235", ngayKham: "15/11/2025", chuyenKhoa: "Tim mạch", tinhTrang: "Theo dõi huyết áp, đã kê thuốc" },
  { id: "ls-3", maBN: "BN100235", ngayKham: "20/08/2025", chuyenKhoa: "Nội tổng quát", tinhTrang: "Khám sức khỏe định kỳ, bình thường" },
  { id: "ls-4", maBN: "BN000101", ngayKham: "10/12/2025", chuyenKhoa: "Da liễu", tinhTrang: "Điều trị viêm da, đã khỏi" },
  { id: "ls-5", maBN: "BN000101", ngayKham: "05/06/2025", chuyenKhoa: "Nội tổng quát", tinhTrang: "Cảm cúm, đã kê thuốc" },
  { id: "ls-6", maBN: "BN000103", ngayKham: "28/12/2025", chuyenKhoa: "Cấp cứu", tinhTrang: "Chấn thương nhẹ, đã xử lý" },
]

export const khungGioKhamKhoiTao: KhungGioKhamItem[] = [
  { id: "kg-1", gio: "08:00", soLuongToiDa: 5, daDat: 5 },
  { id: "kg-2", gio: "08:30", soLuongToiDa: 5, daDat: 3 },
  { id: "kg-3", gio: "09:00", soLuongToiDa: 5, daDat: 2 },
  { id: "kg-4", gio: "09:30", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-5", gio: "10:00", soLuongToiDa: 5, daDat: 4 },
  { id: "kg-6", gio: "10:30", soLuongToiDa: 5, daDat: 1 },
  { id: "kg-7", gio: "14:00", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-8", gio: "14:30", soLuongToiDa: 5, daDat: 0 },
]

export const lichTaiKhamKhoiTao: LichTaiKhamItem[] = [
  { id: "tk-1", maBN: "BN100235", ngay: "19/09/2026", gio: "09:00", noiDung: "Tái khám Tim mạch", trangThai: "Sắp tới" },
  { id: "tk-2", maBN: "BN000101", ngay: "20/09/2026", gio: "10:30", noiDung: "Tái khám Nội tổng quát", trangThai: "Sắp tới" },
  { id: "tk-3", maBN: "BN000104", ngay: "05/10/2026", gio: "14:00", noiDung: "Tái khám Cơ xương khớp", trangThai: "Sắp tới" },
  { id: "tk-4", maBN: "BN000107", ngay: "01/09/2026", gio: "08:30", noiDung: "Tái khám Nội tổng quát", trangThai: "Hoàn thành" },
]
