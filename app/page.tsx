"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import {
  Stethoscope,
  Search,
  Clock,
  CalendarCheck,
  CalendarPlus,
  Bell,
  BellRing,
  AlertTriangle,
  Phone,
  ChevronDown,
  History,
  X,
  User,
  Users,
  Cake,
  PhoneCall,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ClipboardList,
  Filter,
  ArrowUpDown,
  ListOrdered,
  LogOut,
  Menu,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import {
  danhSachBenhNhan as mockDanhSachBN,
  hangDoiKhoiTao as mockHangDoi,
  khungGioKhamKhoiTao as mockKhungGio,
  lichSuKhamKhoiTao as mockLichSu,
  lichTaiKhamKhoiTao as mockLichTaiKham,
} from "@/lib/clinic-mock-data"
import type { HangDoiItem, KhungGioKhamItem, LichHenItem, LichTaiKhamItem, LichSuKhamItem } from "@/lib/clinic-types"

// Các chức năng chính của hệ thống
const VIEWS = [
  { id: "hang-doi", label: "Hàng đợi", icon: Users },
  { id: "truy-xuat-thoi-gian", label: "Truy xuất theo thời gian", icon: Clock },
  { id: "tra-cuu", label: "Tra cứu & Lịch sử", icon: Search },
  { id: "dat-lich", label: "Đặt / Hủy lịch", icon: CalendarPlus },
  { id: "tai-kham", label: "Nhắc lịch khám", icon: BellRing },
] as const

type ViewId = (typeof VIEWS)[number]["id"]

const NHU_CAU_KHAM_OPTIONS = [
  "Khám tổng quát",
  "Khám Tim mạch",
  "Khám Hô hấp",
  "Khám Tiêu hóa",
  "Khám Tai Mũi Họng",
  "Khám Răng Hàm Mặt",
  "Khám Da liễu",
  "Khám Mắt",
  "Khám Cơ xương khớp",
  "Khám Thần kinh",
  "Khám Sản – Phụ khoa",
  "Khám Nhi",
]

const NOI_DUNG_TAI_KHAM_OPTIONS = [
  "Tái khám Tổng quát",
  "Tái khám Tim mạch",
  "Tái khám Hô hấp",
  "Tái khám Tiêu hóa",
  "Tái khám Tai Mũi Họng",
  "Tái khám Răng Hàm Mặt",
  "Tái khám Da liễu",
  "Tái khám Mắt",
  "Tái khám Cơ xương khớp",
  "Tái khám Thần kinh",
  "Tái khám Sản – Phụ khoa",
  "Tái khám Nhi",
]

function timeToMinutes(gio: string) {
  const [h, m] = gio.split(":").map(Number)
  return h * 60 + m
}

// Chuyển YYYY-MM-DD sang DD/MM/YYYY
function isoToDmy(iso: string): string {
  if (!iso) return ""
  const parts = iso.split("-")
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

// Chuyển DD/MM/YYYY sang YYYY-MM-DD
function dmyToIso(dmy: string): string {
  if (!dmy) return ""
  const parts = dmy.split("/")
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return dmy
}

// Hệ giờ 0h đến 23h, mỗi ca cách nhau 30 phút (48 mốc thời gian)
const TIME_SLOTS_24H = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? "00" : "30"
  return `${h.toString().padStart(2, "0")}:${m}`
})

export default function PatientManagementApp() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewId>("hang-doi")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("")

  // View 1 (Hàng đợi) State: 2 phần: danh sách theo thứ tự đăng ký, danh sách theo mức ưu tiên
  const [hangDoi, setHangDoi] = useState<HangDoiItem[]>(mockHangDoi)
  const [queueMode, setQueueMode] = useState<"thu-tu-dang-ky" | "muc-uu-tien">("thu-tu-dang-ky")
  const [queueDate, setQueueDate] = useState("2026-09-27")

  // Chức năng mới trên Taskbar: Truy xuất bệnh nhân theo khoảng thời gian
  const [filterDate, setFilterDate] = useState("2026-09-27")
  const [filterTimeFrom, setFilterTimeFrom] = useState("08:00")
  const [filterTimeTo, setFilterTimeTo] = useState("09:30")

  // View 2 (Tra cứu & Lịch sử) State
  const [searchMaBN, setSearchMaBN] = useState("BN100235")
  const [currentPatientId, setCurrentPatientId] = useState<string | null>("BN100235")
  const [lichSuList, setLichSuList] = useState<LichSuKhamItem[]>(mockLichSu)

  // View 3 (Đặt / Hủy lịch) State
  const [khungGioList, setKhungGioList] = useState<KhungGioKhamItem[]>(mockKhungGio)
  const [lichHenList, setLichHenList] = useState<LichHenItem[]>([
    {
      id: "lh-init-1",
      hoTen: "Trần Minh Quang",
      ngaySinh: "14/08/1991",
      sdt: "0908877665",
      nhuCauKham: "Khám Tim mạch",
      ngay: "27/09/2026",
      khungGioId: "kg-2",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-2",
      hoTen: "Lê Thảo Vy",
      ngaySinh: "05/11/1996",
      sdt: "0938123456",
      nhuCauKham: "Khám Da liễu",
      ngay: "27/09/2026",
      khungGioId: "kg-3",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-3",
      hoTen: "Nguyễn Đức Trọng",
      ngaySinh: "20/03/1983",
      sdt: "0919283746",
      nhuCauKham: "Khám Cơ xương khớp",
      ngay: "27/09/2026",
      khungGioId: "kg-4",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-4",
      hoTen: "Đỗ Hoàng Yến",
      ngaySinh: "12/07/1999",
      sdt: "0988776655",
      nhuCauKham: "Khám Mắt",
      ngay: "27/09/2026",
      khungGioId: "kg-6",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-5",
      hoTen: "Phạm Thành Nam",
      ngaySinh: "18/12/1979",
      sdt: "0944112233",
      nhuCauKham: "Khám Tiêu hóa",
      ngay: "27/09/2026",
      khungGioId: "kg-10",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-6",
      hoTen: "Vũ Bích Ngọc",
      ngaySinh: "25/09/1995",
      sdt: "0966334455",
      nhuCauKham: "Khám Răng Hàm Mặt",
      ngay: "27/09/2026",
      khungGioId: "kg-12",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-7",
      hoTen: "Trương Gia Huy",
      ngaySinh: "30/01/2004",
      sdt: "0977221144",
      nhuCauKham: "Khám Tai Mũi Họng",
      ngay: "27/09/2026",
      khungGioId: "kg-14",
      trangThai: "Đã đặt",
    },
    {
      id: "lh-init-8",
      hoTen: "Bùi Khánh Linh",
      ngaySinh: "08/04/1992",
      sdt: "0909554433",
      nhuCauKham: "Khám Sản – Phụ khoa",
      ngay: "27/09/2026",
      khungGioId: "kg-19",
      trangThai: "Đã hủy",
    },
  ])
  const [bookingForm, setBookingForm] = useState({
    hoTen: "",
    ngaySinh: "",
    sdt: "",
    nhuCauKham: "",
    ngay: "",
    khungGioId: "",
  })

  // View 4 (Nhắc lịch khám) State
  const [lichTaiKhamList, setLichTaiKhamList] = useState<LichTaiKhamItem[]>(mockLichTaiKham)
  const [reminderForm, setReminderForm] = useState({
    maBN: "",
    ngay: "",
    gio: "",
    noiDung: "",
  })

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Call Patient Action
  const handleGoiKham = (id: string) => {
    setHangDoi((prev) =>
      prev.map((item) => (item.id === id ? { ...item, trangThai: "Đang khám" } : item))
    )
  }

  // Handle Book Appointment
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !bookingForm.hoTen.trim() ||
      !bookingForm.ngaySinh ||
      !bookingForm.sdt.trim() ||
      !bookingForm.nhuCauKham ||
      !bookingForm.ngay ||
      !bookingForm.khungGioId
    ) {
      return
    }

    const [y, m, d] = bookingForm.ngay.split("-")
    const [yS, mS, dS] = bookingForm.ngaySinh.split("-")

    const newAppointment: LichHenItem = {
      id: `lh-${Date.now()}`,
      hoTen: bookingForm.hoTen.trim(),
      ngaySinh: `${dS}/${mS}/${yS}`,
      sdt: bookingForm.sdt.trim(),
      nhuCauKham: bookingForm.nhuCauKham,
      ngay: `${d}/${m}/${y}`,
      khungGioId: bookingForm.khungGioId,
      trangThai: "Đã đặt",
    }

    setLichHenList((prev) => [newAppointment, ...prev])
    setKhungGioList((prev) =>
      prev.map((kg) =>
        kg.id === bookingForm.khungGioId
          ? { ...kg, daDat: Math.min(kg.soLuongToiDa, kg.daDat + 1) }
          : kg
      )
    )

    setBookingForm({
      hoTen: "",
      ngaySinh: "",
      sdt: "",
      nhuCauKham: "",
      ngay: "",
      khungGioId: "",
    })
  }

  // Handle Cancel Appointment
  const handleCancelAppointment = (id: string) => {
    const item = lichHenList.find((l) => l.id === id)
    if (!item || item.trangThai === "Đã hủy") return

    setLichHenList((prev) =>
      prev.map((l) => (l.id === id ? { ...l, trangThai: "Đã hủy" } : l))
    )
    setKhungGioList((prev) =>
      prev.map((kg) =>
        kg.id === item.khungGioId ? { ...kg, daDat: Math.max(0, kg.daDat - 1) } : kg
      )
    )
  }

  // Handle Create Reminder
  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reminderForm.maBN.trim() || !reminderForm.ngay || !reminderForm.gio || !reminderForm.noiDung) {
      return
    }

    const [y, m, d] = reminderForm.ngay.split("-")
    const newReminder: LichTaiKhamItem = {
      id: `tk-${Date.now()}`,
      maBN: reminderForm.maBN.trim().toUpperCase(),
      ngay: `${d}/${m}/${y}`,
      gio: reminderForm.gio,
      noiDung: reminderForm.noiDung,
      trangThai: "Sắp tới",
    }

    setLichTaiKhamList((prev) => [newReminder, ...prev])
    setReminderForm({
      maBN: "",
      ngay: "",
      gio: "",
      noiDung: "",
    })
  }

  // Xóa lịch sử khám
  const handleDeleteHistoryItem = (id: string) => {
    setLichSuList((prev) => prev.filter((item) => item.id !== id))
  }

  // Thống kê số lượng bệnh nhân theo mức ưu tiên theo ngày đã chọn
  const priorityCounts = useMemo(() => {
    const queueForDate = queueDate
      ? hangDoi.filter((item) => {
          const dmy = isoToDmy(queueDate)
          return (item.ngayHen || "27/09/2026") === dmy || item.ngayHen === queueDate
        })
      : hangDoi
    return {
      1: queueForDate.filter((item) => item.mucUuTien === 1).length,
      2: queueForDate.filter((item) => item.mucUuTien === 2).length,
      3: queueForDate.filter((item) => item.mucUuTien === 3).length,
    }
  }, [hangDoi, queueDate])

  // Queue sorting & filtering: 2 phần - danh sách theo thứ tự đăng ký, danh sách theo mức ưu tiên
  const filteredQueue = useMemo(() => {
    let result = [...hangDoi]

    // Lọc theo ngày khám nếu có
    if (queueDate) {
      const dmy = isoToDmy(queueDate)
      result = result.filter(
        (item) => (item.ngayHen || "27/09/2026") === dmy || item.ngayHen === queueDate
      )
    }

    // Lọc theo từ khóa tìm kiếm nhanh
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        const bn = mockDanhSachBN.find((b) => b.maBN === item.maBN)
        return (
          item.maBN.toLowerCase().includes(q) ||
          bn?.hoTen.toLowerCase().includes(q) ||
          bn?.sdt.includes(q)
        )
      })
    }

    // 2 phần tra cứu hàng đợi:
    if (queueMode === "thu-tu-dang-ky") {
      // 1. Danh sách theo thứ tự đăng ký tiếp nhận (FIFO theo giờ đăng ký)
      result.sort((a, b) => timeToMinutes(a.gioDangKy) - timeToMinutes(b.gioDangKy))
    } else {
      // 2. Danh sách theo mức ưu tiên (Mức 1 Cấp cứu -> Mức 2 Ưu tiên cao -> Mức 3 Bình thường)
      result.sort((a, b) => {
        if (a.mucUuTien !== b.mucUuTien) return a.mucUuTien - b.mucUuTien
        return timeToMinutes(a.gioDangKy) - timeToMinutes(b.gioDangKy)
      })
    }

    return result
  }, [hangDoi, queueDate, searchQuery, queueMode])

  // Lọc bệnh nhân theo khoảng thời gian (Binary Search View)
  const timeRangePatients = useMemo(() => {
    let result = [...hangDoi]

    // Lọc theo ngày hẹn
    if (filterDate) {
      const dmy = isoToDmy(filterDate)
      result = result.filter(
        (item) => (item.ngayHen || "27/09/2026") === dmy || item.ngayHen === filterDate
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        const bn = mockDanhSachBN.find((b) => b.maBN === item.maBN)
        return (
          item.maBN.toLowerCase().includes(q) ||
          bn?.hoTen.toLowerCase().includes(q) ||
          bn?.sdt.includes(q)
        )
      })
    }

    if (filterTimeFrom) {
      const fromMin = timeToMinutes(filterTimeFrom)
      result = result.filter((item) => timeToMinutes(item.gioHen) >= fromMin)
    }
    if (filterTimeTo) {
      const toMin = timeToMinutes(filterTimeTo)
      result = result.filter((item) => timeToMinutes(item.gioHen) <= toMin)
    }

    result.sort((a, b) => timeToMinutes(a.gioHen) - timeToMinutes(b.gioHen))
    return result
  }, [hangDoi, filterDate, searchQuery, filterTimeFrom, filterTimeTo])

  // Lookup data resolution
  const searchedPatient = useMemo(() => {
    if (!currentPatientId) return null
    return mockDanhSachBN.find(
      (b) => b.maBN.toUpperCase() === currentPatientId.toUpperCase()
    ) || null
  }, [currentPatientId])

  const patientHistory = useMemo(() => {
    if (!searchedPatient) return []
    return lichSuList
      .filter((ls) => ls.maBN === searchedPatient.maBN)
      .sort((a, b) => {
        const parseDate = (dStr: string) => {
          const parts = dStr.split("/")
          if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
          }
          return 0
        }
        return parseDate(b.ngayKham) - parseDate(a.ngayKham)
      })
  }, [searchedPatient, lichSuList])

  // Trạng thái khám hiện tại, lịch hẹn và ngày khám của bệnh nhân đang tra cứu
  const patientAppointmentStatus = useMemo(() => {
    if (!searchedPatient) return null

    // 1. Kiểm tra xem có lịch đặt khám còn hiệu lực (Đã đặt)
    const booking = lichHenList.find(
      (lh) =>
        (lh.sdt === searchedPatient.sdt ||
          lh.hoTen.trim().toLowerCase() === searchedPatient.hoTen.trim().toLowerCase()) &&
        lh.trangThai === "Đã đặt"
    )

    // 2. Kiểm tra xem có lịch tái khám sắp tới (Sắp tới)
    const followUp = lichTaiKhamList.find(
      (tk) =>
        tk.maBN.toUpperCase() === searchedPatient.maBN.toUpperCase() &&
        tk.trangThai === "Sắp tới"
    )

    const coLichHen = Boolean(booking || followUp)

    if (coLichHen) {
      // Có đặt lịch khám hoặc có lịch tái khám:
      // Ngày khám là ngày đặt lịch / ngày hẹn, thông tin lịch hẹn: Có, trạng thái khám: Chưa khám
      return {
        coLichHen: true,
        ngayKham: booking?.ngay || followUp?.ngay || "27/09/2026",
        thongTinLichHen: "Có",
        trangThaiKham: "Chưa khám",
      }
    } else {
      // Không có đặt trước lịch hẹn khám:
      // Ngày khám là ngày đã khám gần nhất, thông tin lịch hẹn: Chưa có, trạng thái khám: Đã khám
      const ngayKhamGanNhat = patientHistory.length > 0 ? patientHistory[0].ngayKham : "Chưa có lượt khám"
      return {
        coLichHen: false,
        ngayKham: ngayKhamGanNhat,
        thongTinLichHen: "Chưa có",
        trangThaiKham: "Đã khám",
      }
    }
  }, [searchedPatient, lichHenList, lichTaiKhamList, patientHistory])

  const activeViewObj = VIEWS.find((v) => v.id === currentView) || VIEWS[0]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-zinc-950 text-[#0F172A] dark:text-zinc-100 font-sans antialiased">
      {/* Mobile/Tablet Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= LEFT SIDEBAR (TASKBAR) ================= */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0f172a] border-r border-white/[0.08] flex flex-col shrink-0 h-full select-none transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Area */}
        <div className="h-[76px] flex items-center justify-between px-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Stethoscope className="size-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-[16px] font-bold text-white leading-tight truncate">
                ClinicCare
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                Quản lý phòng khám
              </p>
            </div>
          </div>
          {/* Close button for Tablet/Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
            aria-label="Đóng menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Menu Items (Spacing: pt-7 = 28px from logo, px-4 = 16px padding, space-y-1.5 = 6px item spacing) */}
        <nav className="flex-1 px-4 pt-7 pb-4 space-y-1.5 overflow-y-auto">
          {VIEWS.map((view) => {
            const Icon = view.icon
            const isActive = currentView === view.id
            return (
              <button
                key={view.id}
                type="button"
                data-view={view.id}
                onClick={() => {
                  setCurrentView(view.id)
                  setIsMobileSidebarOpen(false)
                }}
                className={`relative w-full h-[44px] flex items-center gap-3 px-3.5 rounded-xl text-sm transition-all duration-200 ease-in-out cursor-pointer group ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium"
                }`}
              >
                {/* Indicator bar nhỏ ở cạnh trái khi active */}
                {isActive && (
                  <span
                    className="absolute left-1 top-2.5 bottom-2.5 w-[3px] bg-blue-500 rounded-full"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={`size-[18px] shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-blue-400"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{view.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Taskbar Footer: Logout Button (Placed near the bottom, compact, subtle red styling) */}
        <div className="mt-auto px-4 py-3.5 border-t border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsLogoutModalOpen(true)
              setIsMobileSidebarOpen(false)
            }}
            className="w-full h-[42px] flex items-center gap-3 px-3.5 rounded-xl text-sm font-medium text-red-400/90 hover:text-red-300 hover:bg-red-500/[0.08] active:bg-red-500/15 border border-white/[0.08] hover:border-red-500/25 transition-all duration-200 ease-in-out cursor-pointer group"
          >
            <LogOut className="size-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="truncate">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT AREA (MAIN CONTENT COLUMN) ================= */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 sm:h-[68px] bg-white dark:bg-zinc-900 border-b border-[#E2E8F0] dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 gap-4">
          {/* Mobile/Tablet Menu Button + Global Quick Search */}
          <div className="flex items-center gap-2 flex-1 max-w-[500px]">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="size-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8] dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh bệnh nhân..."
                className="w-full h-11 pl-10 pr-9 text-sm bg-white dark:bg-zinc-800 border border-[#E2E8F0] dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] dark:focus:border-blue-500 transition-all placeholder:text-[#94A3B8] dark:placeholder:text-zinc-500 text-[#0F172A] dark:text-zinc-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Topbar Icons: Notifications, Dark mode, User Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Thông báo"
            >
              <Bell className="size-4.5" />
            </button>
            <ModeToggle />
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-zinc-800">
              <div className="size-8.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="size-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#0F172A] dark:text-zinc-100 leading-none">Bác sĩ trực</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 leading-none mt-1">Phòng khám</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8FAFC] dark:bg-zinc-950">
        
        {/* ================= VIEW 1: HÀNG ĐỢI (PATIENT QUEUE) ================= */}
        {currentView === "hang-doi" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
            {/* Header / Filter Toolbar */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col gap-4">
              {/* Header Section */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Hàng đợi bệnh nhân
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Quản lý lượt gọi khám và điều phối bệnh nhân tại phòng khám
                    </p>
                  </div>
                </div>
              </div>

              {/* Dedicated Toolbar Row Under Header & Above Table */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                {/* Left side: Date Filter */}
                <div className="flex items-center gap-2">
                  <label htmlFor="queue-date" className="text-xs font-semibold text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                    Ngày khám:
                  </label>
                  <input
                    id="queue-date"
                    type="date"
                    value={queueDate}
                    onChange={(e) => setQueueDate(e.target.value)}
                    className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 cursor-pointer shadow-2xs"
                  />
                  {queueDate !== "2026-09-27" && (
                    <button
                      type="button"
                      onClick={() => setQueueDate("2026-09-27")}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer"
                    >
                      Hôm nay
                    </button>
                  )}
                </div>

                {/* Right side: 2 tab buttons and Total count badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="inline-flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setQueueMode("thu-tu-dang-ky")}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                        queueMode === "thu-tu-dang-ky"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <ListOrdered className="size-3.5" />
                      Danh sách theo thứ tự đăng ký
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueMode("muc-uu-tien")}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                        queueMode === "muc-uu-tien"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <AlertTriangle className="size-3.5" />
                      Danh sách theo mức ưu tiên
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 whitespace-nowrap">
                    Tổng cộng: <strong className="text-blue-600 dark:text-blue-400">{filteredQueue.length}</strong> bệnh nhân
                  </div>
                </div>
              </div>

              {/* Priority Breakdown Bar when in "muc-uu-tien" mode */}
              {queueMode === "muc-uu-tien" && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-gray-100 dark:border-zinc-800/80">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Phân luồng mức ưu tiên:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                    <AlertTriangle className="size-3" />
                    Cấp cứu (Mức 1): {priorityCounts[1]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                    Ưu tiên cao (Mức 2): {priorityCounts[2]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                    Bình thường (Mức 3): {priorityCounts[3]}
                  </span>
                </div>
              )}
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">STT</th>
                    <th className="py-3.5 px-4">Mã BN</th>
                    <th className="py-3.5 px-4">Họ tên</th>
                    <th className="py-3.5 px-4">Giờ hẹn</th>
                    <th className="py-3.5 px-4">Mức ưu tiên</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                        Không có bệnh nhân nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item, index) => {
                      const bn = mockDanhSachBN.find((b) => b.maBN === item.maBN)
                      const isEmergency = item.mucUuTien === 1
                      const isHighPriority = item.mucUuTien === 2

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* STT */}
                          <td className="py-4 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-zinc-400">
                            {index + 1}
                          </td>
                          {/* Mã BN */}
                          <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300">
                            {item.maBN}
                          </td>

                          {/* Họ tên */}
                          <td className="py-4 px-4">
                            <span
                              className={`font-medium ${
                                isEmergency
                                  ? "text-red-600 dark:text-red-400 flex items-center gap-1.5"
                                  : "text-gray-900 dark:text-zinc-100"
                              }`}
                            >
                              {isEmergency && <AlertTriangle className="size-4 shrink-0" />}
                              {bn?.hoTen || "Bệnh nhân"}
                            </span>
                          </td>

                          {/* Giờ hẹn */}
                          <td className="py-4 px-4 font-semibold text-gray-900 dark:text-zinc-100">
                            {item.gioHen}
                          </td>

                          {/* Mức ưu tiên */}
                          <td className="py-4 px-4">
                            {isEmergency && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                                <AlertTriangle className="size-3" />
                                Cấp cứu
                              </span>
                            )}
                            {isHighPriority && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                                Ưu tiên cao
                              </span>
                            )}
                            {!isEmergency && !isHighPriority && (
                              <span className="text-gray-500 dark:text-zinc-400 text-sm">
                                Bình thường
                              </span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-4 px-4">
                            {item.trangThai === "Đang khám" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Đang khám
                              </span>
                            )}
                            {item.trangThai === "Đã khám" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Đã khám
                              </span>
                            )}
                            {item.trangThai === "Đang chờ khám" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                Đang chờ khám
                              </span>
                            )}
                            {item.trangThai === "Đã hủy" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                Đã hủy
                              </span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <button
                              type="button"
                              disabled={item.trangThai !== "Đang chờ khám"}
                              onClick={() => handleGoiKham(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                              <Phone className="size-3.5" />
                              Gọi khám
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW MỚI: TRUY XUẤT THEO KHOẢNG THỜI GIAN ================= */}
        {currentView === "truy-xuat-thoi-gian" && (
          <div className="flex flex-col gap-6">
            {/* Filter Control Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Clock className="size-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Truy xuất bệnh nhân theo khoảng thời gian
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Tìm kiếm lịch hẹn theo khung giờ và ngày chỉ định
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                  {timeRangePatients.length} bệnh nhân trong khoảng
                </span>
              </div>

              {/* Single Horizontal Row Toolbar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800/80 font-sans">
                {/* Ngày */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="range-date" className="text-sm font-medium text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                    Ngày:
                  </label>
                  <input
                    id="range-date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-[126px] sm:w-[132px] h-9 px-2 text-sm font-normal text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 cursor-pointer shadow-2xs font-sans"
                  />
                </div>

                {/* Giờ bắt đầu */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="range-from" className="text-sm font-medium text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                    Từ:
                  </label>
                  <select
                    id="range-from"
                    value={filterTimeFrom}
                    onChange={(e) => setFilterTimeFrom(e.target.value)}
                    className="w-[84px] sm:w-[90px] h-9 px-1.5 sm:px-2 text-sm font-normal text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 cursor-pointer shadow-2xs font-sans"
                  >
                    <option value="">00:00</option>
                    {TIME_SLOTS_24H.map((slot) => (
                      <option key={`from-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Giờ kết thúc */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="range-to" className="text-sm font-medium text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                    Đến:
                  </label>
                  <select
                    id="range-to"
                    value={filterTimeTo}
                    onChange={(e) => setFilterTimeTo(e.target.value)}
                    className="w-[84px] sm:w-[90px] h-9 px-1.5 sm:px-2 text-sm font-normal text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 cursor-pointer shadow-2xs font-sans"
                  >
                    <option value="">23:30</option>
                    {TIME_SLOTS_24H.map((slot) => (
                      <option key={`to-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Presets & Clear button */}
                <div className="flex items-center gap-1.5 flex-wrap ml-auto sm:ml-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTimeFrom("07:30")
                      setFilterTimeTo("11:30")
                    }}
                    className="h-9 px-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center font-sans"
                  >
                    Ca sáng (07:30 - 11:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTimeFrom("13:00")
                      setFilterTimeTo("17:00")
                    }}
                    className="h-9 px-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center font-sans"
                  >
                    Ca chiều (13:00 - 17:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTimeFrom("17:30")
                      setFilterTimeTo("20:30")
                    }}
                    className="h-9 px-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center font-sans"
                  >
                    Ca tối (17:30 - 20:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDate("2026-09-27")
                      setFilterTimeFrom("")
                      setFilterTimeTo("")
                    }}
                    className="h-9 px-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center font-sans"
                  >
                    Xóa lọc
                  </button>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  {filterTimeFrom && filterTimeTo
                    ? `Danh sách lịch hẹn trong ngày ${isoToDmy(filterDate)} khoảng ${filterTimeFrom} đến ${filterTimeTo}`
                    : filterTimeFrom
                    ? `Danh sách lịch hẹn trong ngày ${isoToDmy(filterDate)} từ ${filterTimeFrom} trở đi`
                    : filterTimeTo
                    ? `Danh sách lịch hẹn trong ngày ${isoToDmy(filterDate)} trước ${filterTimeTo}`
                    : `Danh sách lịch hẹn trong ngày ${isoToDmy(filterDate)} (Toàn bộ khung giờ)`}
                </h3>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  {timeRangePatients.length} lượt hẹn
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">STT</th>
                      <th className="py-3.5 px-4">Mã BN</th>
                      <th className="py-3.5 px-4">Họ tên</th>
                      <th className="py-3.5 px-4">Giờ hẹn</th>
                      <th className="py-3.5 px-4">Mức ưu tiên</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                    {timeRangePatients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                          Không có bệnh nhân nào trong khung giờ này.
                        </td>
                      </tr>
                    ) : (
                      timeRangePatients.map((item, index) => {
                        const bn = mockDanhSachBN.find((b) => b.maBN === item.maBN)
                        const isEmergency = item.mucUuTien === 1
                        const isHighPriority = item.mucUuTien === 2

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                          >
                            <td className="py-4 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-zinc-400">
                              {index + 1}
                            </td>
                            <td className="py-4 px-4 text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300">
                              {item.maBN}
                            </td>
                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                              {bn?.hoTen || "Bệnh nhân"}
                            </td>
                            <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">
                              {item.gioHen}
                            </td>
                            <td className="py-4 px-4">
                              {isEmergency && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                                  <AlertTriangle className="size-3" />
                                  Cấp cứu
                                </span>
                              )}
                              {isHighPriority && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                                  Ưu tiên cao
                                </span>
                              )}
                              {!isEmergency && !isHighPriority && (
                                <span className="text-gray-500 dark:text-zinc-400 text-sm">
                                  Bình thường
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                {item.trangThai}
                              </span>
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <button
                                type="button"
                                disabled={item.trangThai !== "Đang chờ khám"}
                                onClick={() => handleGoiKham(item.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                <Phone className="size-3.5" />
                                Gọi khám
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: TRA CỨU & LỊCH SỬ (SEARCH & HISTORY) ================= */}
        {currentView === "tra-cuu" && (
          <div className="flex flex-col gap-6">
            {/* Search Box Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-[#E2E8F0] dark:border-zinc-800 p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <Search className="size-5 text-[#2563eb] dark:text-blue-400 stroke-[2.2]" />
                <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-white">
                  Tra cứu hồ sơ bệnh nhân
                </h2>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setCurrentPatientId(searchMaBN.trim())
                }}
                className="max-w-xl"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8] dark:text-zinc-500 pointer-events-none" />
                    <input
                      id="search-mabn-input"
                      type="text"
                      value={searchMaBN}
                      onChange={(e) => setSearchMaBN(e.target.value)}
                      placeholder="Nhập mã bệnh nhân, ví dụ BN100235..."
                      className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-zinc-800 border border-[#E2E8F0] dark:border-zinc-700 rounded-xl text-[#0F172A] dark:text-zinc-100 placeholder:text-[#94A3B8] dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] dark:focus:border-blue-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 px-6 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Search className="size-4" />
                    <span>Tìm kiếm</span>
                  </button>
                </div>
              </form>

              {/* Quick sample chips */}
              <div className="mt-4 flex items-center gap-2 text-xs sm:text-[13px] text-[#64748B] dark:text-zinc-400 flex-wrap">
                <span className="font-medium">Gợi ý nhanh:</span>
                {["BN100235", "BN000107", "BN000101", "BN000103"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setSearchMaBN(code)
                      setCurrentPatientId(code)
                    }}
                    className="h-7 sm:h-[30px] px-3 inline-flex items-center justify-center rounded-lg bg-[#EFF6FF] dark:bg-zinc-800 hover:bg-blue-100/80 dark:hover:bg-zinc-700 text-[#2563eb] dark:text-blue-400 border border-blue-200/60 dark:border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Details */}
            {currentPatientId && !searchedPatient && (
              <div className="bg-[#FEF2F2] dark:bg-rose-950/30 border border-[#FECACA] dark:border-rose-900/40 rounded-2xl p-5 text-[#B91C1C] dark:text-rose-300 text-sm flex items-center gap-3">
                <AlertTriangle className="size-5 shrink-0 text-[#EF4444]" />
                <span>
                  Không tìm thấy hồ sơ bệnh nhân với mã <strong>{currentPatientId}</strong>. Vui lòng kiểm tra lại hoặc chọn mã trong phần gợi ý nhanh.
                </span>
              </div>
            )}

            {searchedPatient && (
              <div className="flex flex-col lg:flex-row gap-5 items-stretch">
                {/* Patient Profile Card - Redesigned Medical Patient Profile (~47% width on desktop) */}
                <div className="w-full lg:w-[47%] bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                  <div>
                    {/* 1. HEADER: Left (Avatar + HoTen + MaBN), Right (Status Badge) */}
                    <div className="flex items-center justify-between gap-3 flex-wrap pb-4 sm:pb-5 border-b border-[#E2E8F0] dark:border-zinc-800 mb-5 sm:mb-6">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar User Icon */}
                        <div className="size-11 sm:size-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <User className="size-5 sm:size-6 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0F172A] dark:text-white leading-tight">
                            {searchedPatient.hoTen}
                          </h3>
                          <p className="text-[13px] sm:text-sm font-medium text-[#2563EB] dark:text-blue-400 mt-0.5">
                            {searchedPatient.maBN}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge (Derived dynamically from system data) */}
                      {(() => {
                        const status = patientAppointmentStatus?.trangThaiKham || "Chưa khám"
                        let badgeClasses = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                        let dotColor = "bg-amber-500"

                        if (status === "Đang khám") {
                          badgeClasses = "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
                          dotColor = "bg-blue-500"
                        } else if (status === "Đã khám") {
                          badgeClasses = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                          dotColor = "bg-emerald-500"
                        } else if (status === "Đã hủy") {
                          badgeClasses = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                          dotColor = "bg-rose-500"
                        }

                        return (
                          <div className="shrink-0">
                            <span
                              className={`h-7 sm:h-[30px] inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-medium border ${badgeClasses}`}
                            >
                              <span className={`size-1.5 rounded-full ${dotColor}`} />
                              {status}
                            </span>
                          </div>
                        )
                      })()}
                    </div>

                    {/* 2. THÔNG TIN BỆNH NHÂN: Grid 2 cột rõ ràng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-5 sm:gap-y-6">
                      {/* Cột 1: Ngày sinh */}
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-[#64748B] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Calendar className="size-3.5 text-[#64748B] dark:text-zinc-400" />
                          Ngày sinh
                        </span>
                        <span className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] dark:text-zinc-100 block">
                          {searchedPatient.ngaySinh}
                        </span>
                      </div>

                      {/* Cột 2: Số điện thoại */}
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-[#64748B] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Phone className="size-3.5 text-[#64748B] dark:text-zinc-400" />
                          Số điện thoại
                        </span>
                        <span className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] dark:text-zinc-100 block">
                          {searchedPatient.sdt}
                        </span>
                      </div>

                      {/* Cột 1: Ngày khám */}
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-[#64748B] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Calendar className="size-3.5 text-[#64748B] dark:text-zinc-400" />
                          Ngày khám
                        </span>
                        <span className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] dark:text-zinc-100 block">
                          {patientAppointmentStatus?.ngayKham || "—"}
                        </span>
                      </div>

                      {/* Cột 2: Thông tin lịch hẹn */}
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-[#64748B] dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <CalendarCheck className="size-3.5 text-[#64748B] dark:text-zinc-400" />
                          Thông tin lịch hẹn
                        </span>
                        <div className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] dark:text-zinc-100 flex items-center gap-1.5">
                          {patientAppointmentStatus?.thongTinLichHen === "Có" ? (
                            <>
                              <Check className="size-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                              <span>Có</span>
                            </>
                          ) : (
                            <span>Chưa có</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Medical History - Modern Vertical Medical Timeline (~53% width on desktop) */}
                <div className="w-full lg:w-[53%] bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
                  {/* 1. Header: Icon ClipboardList + Title "Lịch sử khám bệnh" (không kèm số phía sau) */}
                  <div className="flex items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-[#E2E8F0] dark:border-zinc-800 mb-5 sm:mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ClipboardList className="size-4.5 stroke-[2.2]" />
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-white">
                        Lịch sử khám bệnh
                      </h3>
                    </div>
                  </div>

                  {/* 2. Content: Empty State hoặc Vertical Timeline */}
                  {patientHistory.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="size-11 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mb-3">
                        <ClipboardList className="size-5 stroke-[1.8]" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        Chưa có lịch sử khám bệnh
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-7 sm:space-y-8">
                      {patientHistory.map((ls, idx) => {
                        const isLast = idx === patientHistory.length - 1
                        const status = (ls as any).trangThai || (ls.tinhTrang ? ls.tinhTrang : "Đã khám")
                        const isCompleted = status === "Đã khám"
                        const isCancelled = status === "Đã hủy"

                        return (
                          <div key={ls.id} className="relative group">
                            {/* Đường line dọc kết nối giữa các mốc khám */}
                            {!isLast && (
                              <span
                                className="absolute -left-[18px] top-3 bottom-[-28px] sm:bottom-[-32px] w-[2px] bg-[#BFDBFE] dark:bg-zinc-800"
                                aria-hidden="true"
                              />
                            )}

                            {/* Dot tròn màu xanh primary */}
                            <span
                              className="absolute -left-[23px] top-1 size-3 rounded-full bg-[#2563eb] ring-4 ring-blue-50 dark:ring-blue-950/80 transition-transform group-hover:scale-110"
                              aria-hidden="true"
                            />

                            {/* Dòng mốc khám: Ngày khám | Loại khám | Đã khám trên cùng 1 hàng */}
                            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                              {/* Ngày khám (Font 14-15px, Font weight 600) */}
                              <span className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] dark:text-zinc-100 tracking-tight shrink-0">
                                {ls.ngayKham}
                              </span>

                              {/* Loại khám (Chuyên khoa): Chip xanh rất nhạt, text primary */}
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs sm:text-[13px] font-medium bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 shrink-0">
                                {ls.chuyenKhoa}
                              </span>

                              {/* Trạng thái khám: Badge Đã khám */}
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                                  isCompleted
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                                    : isCancelled
                                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    isCompleted
                                      ? "bg-emerald-500"
                                      : isCancelled
                                      ? "bg-rose-500"
                                      : "bg-amber-500"
                                  }`}
                                />
                                {status}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 3: ĐẶT / HỦY LỊCH (BOOK / CANCEL APPOINTMENT) ================= */}
        {currentView === "dat-lich" && (
          <div className="flex flex-col gap-6">
            {/* Booking Form Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <CalendarCheck className="size-5 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Đặt lịch khám
                </h2>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Họ và tên */}
                  <div>
                    <label htmlFor="booking-name" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Họ và tên
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn An"
                      value={bookingForm.hoTen}
                      onChange={(e) => setBookingForm({ ...bookingForm, hoTen: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <label htmlFor="booking-dob" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      id="booking-dob"
                      type="date"
                      required
                      value={bookingForm.ngaySinh}
                      onChange={(e) => setBookingForm({ ...bookingForm, ngaySinh: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label htmlFor="booking-phone" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      value={bookingForm.sdt}
                      onChange={(e) => setBookingForm({ ...bookingForm, sdt: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Nhu cầu khám */}
                  <div>
                    <label htmlFor="booking-specialty" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Nhu cầu khám
                    </label>
                    <select
                      id="booking-specialty"
                      required
                      value={bookingForm.nhuCauKham}
                      onChange={(e) => setBookingForm({ ...bookingForm, nhuCauKham: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-gray-800 dark:text-zinc-200"
                    >
                      <option value="">-- Chọn nhu cầu khám --</option>
                      {NHU_CAU_KHAM_OPTIONS.map((nc) => (
                        <option key={nc} value={nc}>
                          {nc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ngày khám */}
                  <div>
                    <label htmlFor="booking-date" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Ngày khám
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      required
                      value={bookingForm.ngay}
                      onChange={(e) => setBookingForm({ ...bookingForm, ngay: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Khung giờ */}
                  <div>
                    <label htmlFor="booking-slot" className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                      Khung giờ khám ({khungGioList.length} ca khám trong ngày)
                    </label>
                    <select
                      id="booking-slot"
                      required
                      value={bookingForm.khungGioId}
                      onChange={(e) => setBookingForm({ ...bookingForm, khungGioId: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-gray-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <option value="">-- Chọn khung giờ khám phù hợp --</option>
                      <optgroup label="☀️ Ca sáng (07:30 - 11:30)">
                        {khungGioList.slice(0, 9).map((kg) => {
                          const isFull = kg.daDat >= kg.soLuongToiDa
                          return (
                            <option key={kg.id} value={kg.id} disabled={isFull}>
                              {kg.gio} — {isFull ? "Đã kín lịch" : `Còn ${kg.soLuongToiDa - kg.daDat}/${kg.soLuongToiDa} chỗ`}
                            </option>
                          )
                        })}
                      </optgroup>
                      <optgroup label="🌤️ Ca chiều (13:00 - 17:00)">
                        {khungGioList.slice(9, 18).map((kg) => {
                          const isFull = kg.daDat >= kg.soLuongToiDa
                          return (
                            <option key={kg.id} value={kg.id} disabled={isFull}>
                              {kg.gio} — {isFull ? "Đã kín lịch" : `Còn ${kg.soLuongToiDa - kg.daDat}/${kg.soLuongToiDa} chỗ`}
                            </option>
                          )
                        })}
                      </optgroup>
                      <optgroup label="🌙 Ca tối (17:30 - 20:00)">
                        {khungGioList.slice(18).map((kg) => {
                          const isFull = kg.daDat >= kg.soLuongToiDa
                          return (
                            <option key={kg.id} value={kg.id} disabled={isFull}>
                              {kg.gio} — {isFull ? "Đã kín lịch" : `Còn ${kg.soLuongToiDa - kg.daDat}/${kg.soLuongToiDa} chỗ`}
                            </option>
                          )
                        })}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="size-4" />
                    Đặt lịch
                  </button>
                </div>
              </form>
            </div>

            {/* List of Booked Appointments */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="font-bold text-gray-900 dark:text-white">Danh sách lịch đã đặt</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Ngày sinh</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Nhu cầu khám</th>
                      <th className="py-3 px-4">Ngày</th>
                      <th className="py-3 px-4">Giờ</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                    {lichHenList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          Chưa có lịch hẹn nào.
                        </td>
                      </tr>
                    ) : (
                      lichHenList.map((lh) => {
                        const kg = khungGioList.find((k) => k.id === lh.khungGioId)
                        return (
                          <tr key={lh.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">{lh.hoTen}</td>
                            <td className="py-3.5 px-4 text-gray-600 dark:text-zinc-400">{lh.ngaySinh}</td>
                            <td className="py-3.5 px-4 text-gray-600 dark:text-zinc-400">{lh.sdt}</td>
                            <td className="py-3.5 px-4 text-gray-700 dark:text-zinc-300">{lh.nhuCauKham}</td>
                            <td className="py-3.5 px-4 text-gray-700 dark:text-zinc-300">{lh.ngay}</td>
                            <td className="py-3.5 px-4 text-gray-700 dark:text-zinc-300">{kg?.gio || "—"}</td>
                            <td className="py-3.5 px-4">
                              {lh.trangThai === "Đã đặt" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Đã đặt
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  Đã hủy
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {lh.trangThai === "Đã đặt" && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelAppointment(lh.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  <X className="size-3" />
                                  Hủy
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: NHẮC LỊCH KHÁM (FOLLOW-UP REMINDERS) ================= */}
        {currentView === "tai-kham" && (
          <div className="flex flex-col gap-6">
            {/* Section 1: Tạo lịch tái khám */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <Bell className="size-5 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Tạo lịch tái khám
                </h2>
              </div>

              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Mã bệnh nhân */}
                  <div>
                    <label htmlFor="reminder-mabn" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Mã bệnh nhân
                    </label>
                    <input
                      id="reminder-mabn"
                      type="text"
                      required
                      placeholder="VD: BN000101"
                      value={reminderForm.maBN}
                      onChange={(e) => setReminderForm({ ...reminderForm, maBN: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 uppercase"
                    />
                  </div>

                  {/* Ngày */}
                  <div>
                    <label htmlFor="reminder-date" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Ngày
                    </label>
                    <input
                      id="reminder-date"
                      type="date"
                      required
                      value={reminderForm.ngay}
                      onChange={(e) => setReminderForm({ ...reminderForm, ngay: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Giờ */}
                  <div>
                    <label htmlFor="reminder-time" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Giờ
                    </label>
                    <input
                      id="reminder-time"
                      type="time"
                      required
                      value={reminderForm.gio}
                      onChange={(e) => setReminderForm({ ...reminderForm, gio: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Nội dung tái khám */}
                  <div>
                    <label htmlFor="reminder-content" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Nội dung tái khám
                    </label>
                    <select
                      id="reminder-content"
                      required
                      value={reminderForm.noiDung}
                      onChange={(e) => setReminderForm({ ...reminderForm, noiDung: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-gray-800 dark:text-zinc-200"
                    >
                      <option value="">-- Chọn nội dung --</option>
                      {NOI_DUNG_TAI_KHAM_OPTIONS.map((nd) => (
                        <option key={nd} value={nd}>
                          {nd}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <BellRing className="size-4" />
                    Tạo lịch
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Danh sách lịch tái khám */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="font-bold text-gray-900 dark:text-white">Danh sách lịch tái khám</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                      <th className="py-3.5 px-4 sm:px-6">MÃ BN</th>
                      <th className="py-3.5 px-4">HỌ TÊN</th>
                      <th className="py-3.5 px-4">NGÀY</th>
                      <th className="py-3.5 px-4">GIỜ</th>
                      <th className="py-3.5 px-4">NỘI DUNG</th>
                      <th className="py-3.5 px-4 sm:px-6">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                    {lichTaiKhamList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          Chưa có lịch tái khám nào.
                        </td>
                      </tr>
                    ) : (
                      lichTaiKhamList.map((item) => {
                        const bn = mockDanhSachBN.find(
                          (b) => b.maBN.toUpperCase() === item.maBN.toUpperCase()
                        )
                        const hoTen = bn?.hoTen || "Bệnh nhân ẩn"

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-4 px-4 sm:px-6 text-sm font-normal text-gray-800 dark:text-zinc-200">
                              {item.maBN}
                            </td>
                            <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">
                              {hoTen}
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center justify-center">
                                {item.ngay}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center justify-center">
                                {item.gio}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm font-normal text-gray-700 dark:text-zinc-300">
                              {item.noiDung}
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              {item.trangThai === "Sắp tới" ? (
                                <span className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 rounded-full px-3 py-0.5 text-xs font-medium inline-flex items-center gap-1.5 border">
                                  <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
                                  Sắp tới
                                </span>
                              ) : (
                                <span className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 rounded-full px-3 py-0.5 text-xs font-medium inline-flex items-center gap-1.5 border">
                                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Hoàn thành
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* ================= MODAL XÁC NHẬN ĐĂNG XUẤT ================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/50">
                <LogOut className="size-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Xác nhận đăng xuất
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Hệ thống Quản lý Bệnh nhân
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Bạn có chắc chắn muốn đăng xuất phiên làm việc hiện tại không? Mọi dữ liệu đã lưu trữ sẽ vẫn được bảo toàn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4.5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false)
                  setCurrentView("hang-doi")
                  alert("Đã đăng xuất thành công khỏi hệ thống!")
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="size-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
