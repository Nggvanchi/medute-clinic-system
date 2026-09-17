"use client"

import { useState } from "react"
import { BellRing, CalendarPlus, ChevronDown, Search, Stethoscope, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QueueTab } from "@/components/clinic/queue-tab"
import { LookupTab } from "@/components/clinic/lookup-tab"
import { AppointmentTab } from "@/components/clinic/appointment-tab"
import { FollowUpTab } from "@/components/clinic/follow-up-tab"
import {
  danhSachBenhNhan,
  hangDoiKhoiTao,
  khungGioKhamKhoiTao,
  lichSuKhamKhoiTao,
  lichTaiKhamKhoiTao,
} from "@/lib/clinic-mock-data"
import type { HangDoiItem, KhungGioKhamItem, LichHenItem, LichTaiKhamItem } from "@/lib/clinic-types"

const CHUC_NANG = [
  { value: "hang-doi", label: "Hàng đợi", icon: Users },
  { value: "tra-cuu", label: "Tra cứu & Lịch sử", icon: Search },
  { value: "dat-lich", label: "Đặt / Hủy lịch", icon: CalendarPlus },
  { value: "tai-kham", label: "Nhắc lịch khám", icon: BellRing },
] as const

type ChucNangValue = (typeof CHUC_NANG)[number]["value"]

export default function ClinicDashboard() {
  const [chucNangHienTai, setChucNangHienTai] = useState<ChucNangValue>("hang-doi")
  const [hangDoi, setHangDoi] = useState<HangDoiItem[]>(hangDoiKhoiTao)
  const [khungGioKham, setKhungGioKham] = useState<KhungGioKhamItem[]>(khungGioKhamKhoiTao)
  const [lichHen, setLichHen] = useState<LichHenItem[]>([])
  const [lichTaiKham, setLichTaiKham] = useState<LichTaiKhamItem[]>(lichTaiKhamKhoiTao)

  const mucHienTai = CHUC_NANG.find((cn) => cn.value === chucNangHienTai) ?? CHUC_NANG[0]

  function handleGoiKham(id: string) {
    setHangDoi((prev) => prev.map((item) => (item.id === id ? { ...item, trangThai: "Đang khám" } : item)))
  }

  function handleDatLich(data: { maBN: string; nhuCauKham: string; ngay: string; khungGioId: string }) {
    const idMoi = `lh-${Date.now()}`
    setLichHen((prev) => [...prev, { id: idMoi, trangThai: "Đã đặt", ...data }])
    setKhungGioKham((prev) =>
      prev.map((kg) => (kg.id === data.khungGioId ? { ...kg, daDat: Math.min(kg.soLuongToiDa, kg.daDat + 1) } : kg)),
    )
  }

  function handleHuyLich(id: string) {
    const lichCanHuy = lichHen.find((lh) => lh.id === id)
    if (!lichCanHuy || lichCanHuy.trangThai === "Đã hủy") return
    setLichHen((prev) => prev.map((lh) => (lh.id === id ? { ...lh, trangThai: "Đã hủy" } : lh)))
    setKhungGioKham((prev) =>
      prev.map((kg) => (kg.id === lichCanHuy.khungGioId ? { ...kg, daDat: Math.max(0, kg.daDat - 1) } : kg)),
    )
  }

  function handleTaoLichTaiKham(data: { maBN: string; ngay: string; gio: string; noiDung: string }) {
    const idMoi = `tk-${Date.now()}`
    setLichTaiKham((prev) => [...prev, { id: idMoi, trangThai: "Sắp tới", ...data }])
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Quản lý Hồ Sơ Bệnh Nhân</h1>
              <p className="text-sm text-muted-foreground">Hệ thống hàng đợi &amp; lịch khám phòng khám</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="min-w-56 justify-between">
                  <span className="flex items-center gap-2">
                    <mucHienTai.icon data-icon="inline-start" />
                    {mucHienTai.label}
                  </span>
                  <ChevronDown data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Chọn chức năng</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {CHUC_NANG.map((cn) => (
                  <DropdownMenuItem
                    key={cn.value}
                    onClick={() => setChucNangHienTai(cn.value)}
                    data-active={cn.value === chucNangHienTai}
                    className="gap-2 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  >
                    <cn.icon data-icon="inline-start" />
                    {cn.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {chucNangHienTai === "hang-doi" && (
          <QueueTab hangDoi={hangDoi} danhSachBenhNhan={danhSachBenhNhan} onGoiKham={handleGoiKham} />
        )}
        {chucNangHienTai === "tra-cuu" && (
          <LookupTab danhSachBenhNhan={danhSachBenhNhan} lichSuKham={lichSuKhamKhoiTao} />
        )}
        {chucNangHienTai === "dat-lich" && (
          <AppointmentTab
            lichHen={lichHen}
            khungGioKham={khungGioKham}
            onDatLich={handleDatLich}
            onHuyLich={handleHuyLich}
          />
        )}
        {chucNangHienTai === "tai-kham" && <FollowUpTab lichTaiKham={lichTaiKham} onTaoLich={handleTaoLichTaiKham} />}
      </div>
    </main>
  )
}
