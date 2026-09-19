export type MucUuTien = 1 | 2 | 3

export type TrangThaiHangDoi = "Đang chờ khám" | "Đang khám" | "Đã khám" | "Đã hủy"

export interface BenhNhan {
  maBN: string
  hoTen: string
  ngaySinh: string
  sdt: string
}

export interface HangDoiItem {
  id: string
  maBN: string
  mucUuTien: MucUuTien
  gioHen: string
  trangThai: TrangThaiHangDoi
}

export interface LichSuKhamItem {
  id: string
  maBN: string
  ngayKham: string
  chuyenKhoa: string
  tinhTrang: string
}

export interface KhungGioKhamItem {
  id: string
  gio: string
  soLuongToiDa: number
  daDat: number
}

export type TrangThaiLichTaiKham = "Sắp tới" | "Đã hủy" | "Hoàn thành"

export interface LichTaiKhamItem {
  id: string
  maBN: string
  ngay: string
  gio: string
  noiDung: string
  trangThai: TrangThaiLichTaiKham
}

export interface LichHenItem {
  id: string
  hoTen: string
  ngaySinh: string
  sdt: string
  nhuCauKham: string
  ngay: string
  khungGioId: string
  trangThai: "Đã đặt" | "Đã hủy"
}
