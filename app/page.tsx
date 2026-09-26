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
  Cake,
  PhoneCall,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ClipboardList,
  Filter,
  ArrowUpDown,
  ListOrdered
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
  { id: "hang-doi", label: "Hàng đợi", icon: UsersIcon },
  { id: "truy-xuat-thoi-gian", label: "Truy xuất theo thời gian", icon: Clock },
  { id: "tra-cuu", label: "Tra cứu & Lịch sử", icon: Search },
  { id: "dat-lich", label: "Đặt / Hủy lịch", icon: CalendarPlus },
  { id: "tai-kham", label: "Nhắc lịch khám", icon: BellRing },
] as const

type ViewId = (typeof VIEWS)[number]["id"]

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

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
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("")

  // View 1 (Hàng đợi) State: 2 phần: danh sách theo thứ tự đăng ký, danh sách theo mức ưu tiên
  const [hangDoi, setHangDoi] = useState<HangDoiItem[]>(mockHangDoi)
  const [queueMode, setQueueMode] = useState<"thu-tu-dang-ky" | "muc-uu-tien">("thu-tu-dang-ky")

  // Chức năng mới trên Taskbar: Truy xuất bệnh nhân theo khoảng thời gian
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

  // Thống kê số lượng bệnh nhân theo mức ưu tiên
  const priorityCounts = useMemo(() => {
    return {
      1: hangDoi.filter((item) => item.mucUuTien === 1).length,
      2: hangDoi.filter((item) => item.mucUuTien === 2).length,
      3: hangDoi.filter((item) => item.mucUuTien === 3).length,
    }
  }, [hangDoi])

  // Queue sorting & filtering: 2 phần - danh sách theo thứ tự đăng ký, danh sách theo mức ưu tiên
  const filteredQueue = useMemo(() => {
    let result = [...hangDoi]

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
  }, [hangDoi, searchQuery, queueMode])

  // Lọc bệnh nhân theo khoảng thời gian (Binary Search View)
  const timeRangePatients = useMemo(() => {
    let result = [...hangDoi]

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
  }, [hangDoi, searchQuery, filterTimeFrom, filterTimeTo])

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
      .sort((a, b) => (a.ngayKham < b.ngayKham ? 1 : -1))
  }, [searchedPatient, lichSuList])

  const activeViewObj = VIEWS.find((v) => v.id === currentView) || VIEWS[0]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans antialiased">
      {/* ================= LEFT SIDEBAR (TASKBAR) ================= */}
      <aside className="w-[280px] bg-[#0f172a] border-r border-slate-800 flex flex-col shrink-0 h-full select-none">
        {/* Logo Area */}
        <div className="h-[84px] flex items-center gap-3.5 px-4.5 border-b border-slate-800 shrink-0">
          <div className="size-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <ClipboardList className="size-6.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight">
              Quản lý Hồ Sơ Bệnh Nhân
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Hệ thống hàng đợi &amp; lịch khám phòng khám
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {VIEWS.map((view) => {
            const Icon = view.icon
            const isActive = currentView === view.id
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => setCurrentView(view.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium"
                }`}
              >
                <Icon
                  className={`size-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span>{view.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ================= RIGHT AREA (MAIN CONTENT COLUMN) ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 flex items-center justify-between px-6 sm:px-8 shrink-0 z-10 gap-4">
          {/* Global Quick Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-gray-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh bệnh nhân (Tên, Mã BN, SĐT)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-gray-900 dark:text-zinc-100"
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

          {/* Right: Light/Dark Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <ModeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
        
        {/* ================= VIEW 1: HÀNG ĐỢI (PATIENT QUEUE) ================= */}
        {currentView === "hang-doi" && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
            {/* Header / Filter Toolbar */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col gap-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UsersIcon className="size-5" />
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

                {/* 2 Chức năng tra cứu: "Danh sách theo thứ tự đăng ký" & "Danh sách theo mức ưu tiên" */}
                <div className="inline-flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setQueueMode("thu-tu-dang-ky")}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
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
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                      queueMode === "muc-uu-tien"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <AlertTriangle className="size-3.5" />
                    Danh sách theo mức ưu tiên
                  </button>
                </div>
              </div>

              {/* Sub-toolbar according to mode */}
              {queueMode === "thu-tu-dang-ky" ? (
                <div className="flex flex-wrap items-center justify-end gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Tổng cộng: <strong className="text-blue-600 dark:text-blue-400">{filteredQueue.length}</strong> bệnh nhân
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="flex flex-wrap items-center gap-2">
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
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Tổng cộng: <strong className="text-blue-600 dark:text-blue-400">{filteredQueue.length}</strong> bệnh nhân
                  </div>
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
                          <td className="py-4 px-4 sm:px-6 font-mono text-xs font-bold text-gray-500 dark:text-zinc-400">
                            {index + 1}
                          </td>
                          {/* Mã BN */}
                          <td className="py-4 px-4 sm:px-6 font-mono text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300">
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
                          <td className="py-4 px-4 text-gray-600 dark:text-zinc-300 font-medium">
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
              <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Clock className="size-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Truy xuất bệnh nhân theo khoảng thời gian
                    </h2>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                  {timeRangePatients.length} bệnh nhân trong khoảng
                </span>
              </div>

              {/* Time inputs & Quick Presets */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="range-from" className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                      Giờ bắt đầu:
                    </label>
                    <select
                      id="range-from"
                      value={filterTimeFrom}
                      onChange={(e) => setFilterTimeFrom(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 cursor-pointer"
                    >
                      <option value="">-- Mốc bắt đầu (00:00) --</option>
                      {TIME_SLOTS_24H.map((slot) => (
                        <option key={`from-${slot}`} value={slot}>
                          {slot} ({slot.replace(":", "h")})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="range-to" className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                      Giờ kết thúc:
                    </label>
                    <select
                      id="range-to"
                      value={filterTimeTo}
                      onChange={(e) => setFilterTimeTo(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 cursor-pointer"
                    >
                      <option value="">-- Mốc kết thúc (23:30) --</option>
                      {TIME_SLOTS_24H.map((slot) => (
                        <option key={`to-${slot}`} value={slot}>
                          {slot} ({slot.replace(":", "h")})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTimeFrom("07:30")
                        setFilterTimeTo("11:30")
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl transition-colors cursor-pointer"
                    >
                      Ca sáng (07:30 - 11:30)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTimeFrom("13:00")
                        setFilterTimeTo("17:00")
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl transition-colors cursor-pointer"
                    >
                      Ca chiều (13:00 - 17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTimeFrom("")
                        setFilterTimeTo("")
                      }}
                      className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 bg-gray-100 dark:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Xóa lọc
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Danh sách lịch hẹn trong khoảng {filterTimeFrom ? `${filterTimeFrom}` : "bắt đầu"} đến {filterTimeTo ? `${filterTimeTo}` : "kết thúc"}
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
                            <td className="py-4 px-4 sm:px-6 font-mono text-xs font-bold text-gray-500 dark:text-zinc-400">
                              {index + 1}
                            </td>
                            <td className="py-4 px-4 font-mono text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300">
                              {item.maBN}
                            </td>
                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                              {bn?.hoTen || "Bệnh nhân"}
                            </td>
                            <td className="py-4 px-4 text-blue-600 dark:text-blue-400 font-semibold font-mono">
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
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <Search className="size-5 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
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
                <label htmlFor="search-mabn-input" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                  Mã bệnh nhân
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="search-mabn-input"
                    type="text"
                    value={searchMaBN}
                    onChange={(e) => setSearchMaBN(e.target.value)}
                    placeholder="VD: BN100235"
                    className="flex-1 px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Search className="size-4" />
                    Tìm kiếm
                  </button>
                </div>
              </form>

              {/* Quick sample chips */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                <span>Gợi ý nhanh:</span>
                {["BN100235", "BN000101", "BN000103"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setSearchMaBN(code)
                      setCurrentPatientId(code)
                    }}
                    className="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-mono transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Details */}
            {currentPatientId && !searchedPatient && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
                Không tìm thấy hồ sơ bệnh nhân với mã <strong>{currentPatientId}</strong>.
              </div>
            )}

            {searchedPatient && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient Profile */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 md:col-span-1">
                  <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800 mb-4">
                    <User className="size-4.5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Thông tin bệnh nhân</h3>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 block">Mã bệnh nhân</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{searchedPatient.maBN}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 block">Họ và tên</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{searchedPatient.hoTen}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 block">Ngày sinh</span>
                      <span className="text-gray-700 dark:text-zinc-300">{searchedPatient.ngaySinh}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 block">Số điện thoại</span>
                      <span className="font-mono text-gray-700 dark:text-zinc-300">{searchedPatient.sdt}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Medical History */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 md:col-span-2">
                  <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800 mb-4">
                    <Stethoscope className="size-4.5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Lịch sử khám bệnh</h3>
                  </div>

                  {patientHistory.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Chưa có lịch sử khám bệnh nào.</p>
                  ) : (
                    <div className="space-y-4">
                      {patientHistory.map((ls) => (
                        <div
                          key={ls.id}
                          className="relative pl-5 border-l-2 border-blue-500/40 dark:border-blue-500/30 py-2 group"
                        >
                          <span className="absolute -left-1.5 top-3.5 size-2.5 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-white dark:ring-zinc-900" />
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">{ls.ngayKham}</span>
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                                {ls.chuyenKhoa}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryItem(ls.id)}
                              className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-rose-600 transition-opacity flex items-center gap-1 cursor-pointer"
                              title="Xóa lượt khám này"
                            >
                              <X className="size-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      ))}
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
                            <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-zinc-400">{lh.sdt}</td>
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
                    <tr className="bg-gray-50/75 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Mã BN</th>
                      <th className="py-3.5 px-4">Ngày</th>
                      <th className="py-3.5 px-4">Giờ</th>
                      <th className="py-3.5 px-4">Nội dung</th>
                      <th className="py-3.5 px-4 sm:px-6">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                    {lichTaiKhamList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          Chưa có lịch tái khám nào.
                        </td>
                      </tr>
                    ) : (
                      lichTaiKhamList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-4 px-4 sm:px-6 font-mono text-sm font-medium text-gray-600 dark:text-zinc-300">
                            {item.maBN}
                          </td>
                          <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                            {item.ngay}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-zinc-300">
                            {item.gio}
                          </td>
                          <td className="py-4 px-4 text-gray-800 dark:text-zinc-200">
                            {item.noiDung}
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            {item.trangThai === "Sắp tới" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                Sắp tới
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
                                Hoàn thành
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  )
}
