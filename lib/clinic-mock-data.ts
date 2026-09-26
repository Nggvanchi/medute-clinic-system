import type { BenhNhan, HangDoiItem, KhungGioKhamItem, LichSuKhamItem, LichTaiKhamItem } from "./clinic-types"

export const danhSachBenhNhan: BenhNhan[] = [
  { maBN: "BN000101", hoTen: "Nguyễn Văn An", ngaySinh: "12/05/1985", sdt: "0912345678" },
  { maBN: "BN000102", hoTen: "Trần Thị Bình", ngaySinh: "23/11/1990", sdt: "0987654321" },
  { maBN: "BN000103", hoTen: "Lê Hoàng Cường", ngaySinh: "04/02/1978", sdt: "0901234567" },
  { maBN: "BN000104", hoTen: "Phạm Thị Duyên", ngaySinh: "30/07/1995", sdt: "0933445566" },
  { maBN: "BN000105", hoTen: "Hoàng Văn Em", ngaySinh: "18/09/1988", sdt: "0977889900" },
  { maBN: "BN000106", hoTen: "Vũ Thị Hạnh", ngaySinh: "09/03/2000", sdt: "0966112233" },
  { maBN: "BN000107", hoTen: "Đặng Văn Khoa", ngaySinh: "27/12/1970", sdt: "0944556677" },
  { maBN: "BN000108", hoTen: "Bùi Ngọc Linh", ngaySinh: "15/04/1993", sdt: "0918273645" },
  { maBN: "BN000109", hoTen: "Đỗ Minh Nhật", ngaySinh: "08/10/1982", sdt: "0922334455" },
  { maBN: "BN000110", hoTen: "Lương Thị Mai", ngaySinh: "22/01/1997", sdt: "0934567890" },
  { maBN: "BN000111", hoTen: "Phan Văn Phúc", ngaySinh: "11/08/1975", sdt: "0945678901" },
  { maBN: "BN000112", hoTen: "Trịnh Thu Trang", ngaySinh: "05/06/1994", sdt: "0956789012" },
  { maBN: "BN000113", hoTen: "Võ Quốc Tuấn", ngaySinh: "19/02/1989", sdt: "0967890123" },
  { maBN: "BN000114", hoTen: "Hà Thị Yến", ngaySinh: "14/11/2001", sdt: "0978901234" },
  { maBN: "BN000115", hoTen: "Dương Quang Vinh", ngaySinh: "03/09/1968", sdt: "0989012345" },
  { maBN: "BN100235", hoTen: "Ngô Thị Lan", ngaySinh: "15/06/1992", sdt: "0955667788" },
]

export const hangDoiKhoiTao: HangDoiItem[] = [
  { id: "hd-1", maBN: "BN000107", mucUuTien: 1, gioHen: "07:30", gioDangKy: "07:10", trangThai: "Đang khám" },
  { id: "hd-2", maBN: "BN000103", mucUuTien: 1, gioHen: "08:00", gioDangKy: "07:42", trangThai: "Đang chờ khám" },
  { id: "hd-3", maBN: "BN000115", mucUuTien: 1, gioHen: "08:30", gioDangKy: "08:10", trangThai: "Đang chờ khám" },
  { id: "hd-4", maBN: "BN000104", mucUuTien: 2, gioHen: "08:30", gioDangKy: "07:35", trangThai: "Đang chờ khám" },
  { id: "hd-5", maBN: "BN000106", mucUuTien: 2, gioHen: "09:00", gioDangKy: "07:55", trangThai: "Đang chờ khám" },
  { id: "hd-6", maBN: "BN000109", mucUuTien: 2, gioHen: "09:30", gioDangKy: "08:50", trangThai: "Đang chờ khám" },
  { id: "hd-7", maBN: "BN000112", mucUuTien: 2, gioHen: "10:00", gioDangKy: "09:15", trangThai: "Đang chờ khám" },
  { id: "hd-8", maBN: "BN000101", mucUuTien: 3, gioHen: "08:00", gioDangKy: "07:50", trangThai: "Đã khám" },
  { id: "hd-9", maBN: "BN000102", mucUuTien: 3, gioHen: "08:30", gioDangKy: "08:20", trangThai: "Đang chờ khám" },
  { id: "hd-10", maBN: "BN000105", mucUuTien: 3, gioHen: "09:00", gioDangKy: "08:05", trangThai: "Đã khám" },
  { id: "hd-11", maBN: "BN000108", mucUuTien: 3, gioHen: "09:30", gioDangKy: "08:40", trangThai: "Đang chờ khám" },
  { id: "hd-12", maBN: "BN000110", mucUuTien: 3, gioHen: "10:30", gioDangKy: "09:45", trangThai: "Đang chờ khám" },
  { id: "hd-13", maBN: "BN000111", mucUuTien: 3, gioHen: "11:00", gioDangKy: "10:15", trangThai: "Đang chờ khám" },
  { id: "hd-14", maBN: "BN000113", mucUuTien: 2, gioHen: "13:30", gioDangKy: "13:00", trangThai: "Đang chờ khám" },
  { id: "hd-15", maBN: "BN000114", mucUuTien: 3, gioHen: "14:00", gioDangKy: "13:15", trangThai: "Đang chờ khám" },
  { id: "hd-16", maBN: "BN100235", mucUuTien: 3, gioHen: "14:30", gioDangKy: "13:40", trangThai: "Đang chờ khám" },
]

export const lichSuKhamKhoiTao: LichSuKhamItem[] = [
  { id: "ls-1", maBN: "BN100235", ngayKham: "02/01/2026", chuyenKhoa: "Nội tổng quát", tinhTrang: "" },
  { id: "ls-2", maBN: "BN100235", ngayKham: "20/08/2025", chuyenKhoa: "Nội tổng quát", tinhTrang: "" },
  { id: "ls-3", maBN: "BN100235", ngayKham: "15/03/2025", chuyenKhoa: "Tim mạch", tinhTrang: "" },
  { id: "ls-4", maBN: "BN000101", ngayKham: "10/12/2025", chuyenKhoa: "Da liễu", tinhTrang: "" },
  { id: "ls-5", maBN: "BN000101", ngayKham: "05/06/2025", chuyenKhoa: "Nội tổng quát", tinhTrang: "" },
  { id: "ls-6", maBN: "BN000101", ngayKham: "12/01/2025", chuyenKhoa: "Tai Mũi Họng", tinhTrang: "" },
  { id: "ls-7", maBN: "BN000103", ngayKham: "28/12/2025", chuyenKhoa: "Cấp cứu", tinhTrang: "" },
  { id: "ls-8", maBN: "BN000103", ngayKham: "14/09/2025", chuyenKhoa: "Cơ xương khớp", tinhTrang: "" },
  { id: "ls-9", maBN: "BN000104", ngayKham: "18/11/2025", chuyenKhoa: "Khám Mắt", tinhTrang: "" },
  { id: "ls-10", maBN: "BN000104", ngayKham: "22/04/2025", chuyenKhoa: "Răng Hàm Mặt", tinhTrang: "" },
  { id: "ls-11", maBN: "BN000107", ngayKham: "05/11/2025", chuyenKhoa: "Tim mạch", tinhTrang: "" },
  { id: "ls-12", maBN: "BN000107", ngayKham: "10/06/2025", chuyenKhoa: "Hô hấp", tinhTrang: "" },
]

export const khungGioKhamKhoiTao: KhungGioKhamItem[] = [
  // Ca sáng
  { id: "kg-1", gio: "07:30", soLuongToiDa: 5, daDat: 2 },
  { id: "kg-2", gio: "08:00", soLuongToiDa: 5, daDat: 5 },
  { id: "kg-3", gio: "08:30", soLuongToiDa: 5, daDat: 3 },
  { id: "kg-4", gio: "09:00", soLuongToiDa: 5, daDat: 4 },
  { id: "kg-5", gio: "09:30", soLuongToiDa: 5, daDat: 1 },
  { id: "kg-6", gio: "10:00", soLuongToiDa: 5, daDat: 2 },
  { id: "kg-7", gio: "10:30", soLuongToiDa: 5, daDat: 3 },
  { id: "kg-8", gio: "11:00", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-9", gio: "11:30", soLuongToiDa: 5, daDat: 0 },

  // Ca chiều
  { id: "kg-10", gio: "13:00", soLuongToiDa: 5, daDat: 1 },
  { id: "kg-11", gio: "13:30", soLuongToiDa: 5, daDat: 2 },
  { id: "kg-12", gio: "14:00", soLuongToiDa: 5, daDat: 4 },
  { id: "kg-13", gio: "14:30", soLuongToiDa: 5, daDat: 2 },
  { id: "kg-14", gio: "15:00", soLuongToiDa: 5, daDat: 3 },
  { id: "kg-15", gio: "15:30", soLuongToiDa: 5, daDat: 1 },
  { id: "kg-16", gio: "16:00", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-17", gio: "16:30", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-18", gio: "17:00", soLuongToiDa: 5, daDat: 1 },

  // Ca tối
  { id: "kg-19", gio: "17:30", soLuongToiDa: 5, daDat: 2 },
  { id: "kg-20", gio: "18:00", soLuongToiDa: 5, daDat: 3 },
  { id: "kg-21", gio: "18:30", soLuongToiDa: 5, daDat: 1 },
  { id: "kg-22", gio: "19:00", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-23", gio: "19:30", soLuongToiDa: 5, daDat: 0 },
  { id: "kg-24", gio: "20:00", soLuongToiDa: 5, daDat: 0 },
]

export const lichTaiKhamKhoiTao: LichTaiKhamItem[] = [
  { id: "tk-1", maBN: "BN100235", ngay: "19/09/2026", gio: "09:00", noiDung: "Tái khám Tim mạch", trangThai: "Sắp tới" },
  { id: "tk-2", maBN: "BN000101", ngay: "20/09/2026", gio: "10:30", noiDung: "Tái khám Tổng quát", trangThai: "Sắp tới" },
  { id: "tk-3", maBN: "BN000104", ngay: "05/10/2026", gio: "14:00", noiDung: "Tái khám Cơ xương khớp", trangThai: "Sắp tới" },
  { id: "tk-4", maBN: "BN000107", ngay: "01/09/2026", gio: "08:30", noiDung: "Tái khám Tổng quát", trangThai: "Hoàn thành" },
  { id: "tk-5", maBN: "BN000103", ngay: "10/10/2026", gio: "08:00", noiDung: "Tái khám Cấp cứu", trangThai: "Sắp tới" },
  { id: "tk-6", maBN: "BN000106", ngay: "12/10/2026", gio: "09:30", noiDung: "Tái khám Da liễu", trangThai: "Sắp tới" },
  { id: "tk-7", maBN: "BN000108", ngay: "15/10/2026", gio: "14:30", noiDung: "Tái khám Răng Hàm Mặt", trangThai: "Sắp tới" },
  { id: "tk-8", maBN: "BN000112", ngay: "18/10/2026", gio: "16:00", noiDung: "Tái khám Mắt", trangThai: "Sắp tới" },
]
