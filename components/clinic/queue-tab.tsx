"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Clock, Filter, History, Phone, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { BenhNhan, HangDoiItem } from "@/lib/clinic-types"

type CheDoXemHangDoi = "uu-tien" | "dang-ky"

function timeToMinutes(gio: string) {
  const [h, m] = gio.split(":").map(Number)
  return h * 60 + m
}

function sapXepTheoUuTien(hangDoi: HangDoiItem[]) {
  return [...hangDoi].sort((a, b) => {
    if (a.mucUuTien !== b.mucUuTien) return a.mucUuTien - b.mucUuTien
    return timeToMinutes(a.gioHen) - timeToMinutes(b.gioHen)
  })
}

function sapXepTheoThoiGianDangKy(hangDoi: HangDoiItem[]) {
  return [...hangDoi].sort((a, b) => timeToMinutes(a.gioDangKy) - timeToMinutes(b.gioDangKy))
}

function locTheoKhoangGioHen(hangDoi: HangDoiItem[], gioBatDau: string, gioKetThuc: string) {
  if (!gioBatDau && !gioKetThuc) return hangDoi
  const batDau = gioBatDau ? timeToMinutes(gioBatDau) : Number.NEGATIVE_INFINITY
  const ketThuc = gioKetThuc ? timeToMinutes(gioKetThuc) : Number.POSITIVE_INFINITY
  return hangDoi.filter((item) => {
    const gio = timeToMinutes(item.gioHen)
    return gio >= batDau && gio <= ketThuc
  })
}

function MucUuTienBadge({ mucUuTien }: { mucUuTien: 1 | 2 | 3 }) {
  if (mucUuTien === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
        <AlertTriangle data-icon="inline-start" className="size-4" />
        Cấp cứu
      </span>
    )
  }
  if (mucUuTien === 2) {
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50">
        Ưu tiên cao
      </Badge>
    )
  }
  return <span className="text-sm text-muted-foreground">Bình thường</span>
}

function TrangThaiBadge({ trangThai }: { trangThai: HangDoiItem["trangThai"] }) {
  if (trangThai === "Đang chờ khám")
    return <Badge variant="secondary" className="text-muted-foreground">Đang chờ khám</Badge>
  if (trangThai === "Đang khám")
    return <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đang khám</Badge>
  if (trangThai === "Đã khám")
    return <Badge className="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">Đã khám</Badge>
  return <Badge className="border-red-200 bg-red-100 text-red-700 hover:bg-red-100">Đã hủy</Badge>
}

export function QueueTab({
  hangDoi,
  danhSachBenhNhan,
  onGoiKham,
}: {
  hangDoi: HangDoiItem[]
  danhSachBenhNhan: BenhNhan[]
  onGoiKham: (id: string) => void
}) {
  const [cheDoXem, setCheDoXem] = useState<CheDoXemHangDoi>("uu-tien")
  const [gioBatDau, setGioBatDau] = useState("")
  const [gioKetThuc, setGioKetThuc] = useState("")

  const layTenBenhNhan = (maBN: string) => danhSachBenhNhan.find((bn) => bn.maBN === maBN)?.hoTen ?? "Không rõ"

  const daLoc = useMemo(() => locTheoKhoangGioHen(hangDoi, gioBatDau, gioKetThuc), [hangDoi, gioBatDau, gioKetThuc])

  const daSapXep = useMemo(
    () => (cheDoXem === "dang-ky" ? sapXepTheoThoiGianDangKy(daLoc) : sapXepTheoUuTien(daLoc)),
    [cheDoXem, daLoc],
  )

  const dangLocTheoGio = Boolean(gioBatDau || gioKetThuc)

  return (
    <Card>
      <CardHeader className="gap-4">
        <CardTitle className="flex items-center gap-2">
          <Clock data-icon="inline-start" />
          Hàng đợi bệnh nhân
        </CardTitle>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Tabs value={cheDoXem} onValueChange={(v) => setCheDoXem(v as CheDoXemHangDoi)}>
            <TabsList>
              <TabsTrigger value="uu-tien" className="gap-1.5">
                <AlertTriangle data-icon="inline-start" className="size-4" />
                Ưu tiên &amp; giờ hẹn
              </TabsTrigger>
              <TabsTrigger value="dang-ky" className="gap-1.5">
                <History data-icon="inline-start" className="size-4" />
                Thứ tự đăng ký
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gio-bat-dau" className="text-xs text-muted-foreground">
                Lịch hẹn từ
              </Label>
              <Input
                id="gio-bat-dau"
                type="time"
                value={gioBatDau}
                onChange={(e) => setGioBatDau(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gio-ket-thuc" className="text-xs text-muted-foreground">
                Đến
              </Label>
              <Input
                id="gio-ket-thuc"
                type="time"
                value={gioKetThuc}
                onChange={(e) => setGioKetThuc(e.target.value)}
                className="w-32"
              />
            </div>
            {dangLocTheoGio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGioBatDau("")
                  setGioKetThuc("")
                }}
              >
                <X data-icon="inline-start" />
                Xóa lọc
              </Button>
            )}
          </div>
        </div>

        {dangLocTheoGio && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter data-icon="inline-start" className="size-3.5" />
            Đang lọc lịch hẹn {gioBatDau ? `từ ${gioBatDau}` : ""} {gioKetThuc ? `đến ${gioKetThuc}` : ""} — {daLoc.length}{" "}
            bệnh nhân
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {cheDoXem === "dang-ky" && <TableHead className="w-12">STT</TableHead>}
              <TableHead>Mã BN</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Giờ hẹn</TableHead>
              <TableHead>Mức ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daSapXep.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Không có bệnh nhân nào trong khoảng thời gian đã chọn.
                </TableCell>
              </TableRow>
            )}
            {daSapXep.map((item, idx) => (
              <TableRow
                key={item.id}
                className={cn(
                  item.mucUuTien === 1 && "border-l-4 border-l-destructive bg-destructive/5",
                  item.mucUuTien === 2 && "border-l-4 border-l-amber-400",
                )}
              >
                {cheDoXem === "dang-ky" && (
                  <TableCell className="text-sm text-muted-foreground">{idx + 1}</TableCell>
                )}
                <TableCell className="font-mono text-sm">{item.maBN}</TableCell>
                <TableCell className={cn("font-medium", item.mucUuTien === 1 && "text-destructive")}>
                  {item.mucUuTien === 1 && <AlertTriangle className="mr-1.5 inline size-4" />}
                  {layTenBenhNhan(item.maBN)}
                </TableCell>
                <TableCell>{item.gioHen}</TableCell>
                <TableCell>
                  <MucUuTienBadge mucUuTien={item.mucUuTien} />
                </TableCell>
                <TableCell>
                  <TrangThaiBadge trangThai={item.trangThai} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    disabled={item.trangThai !== "Đang chờ khám"}
                    onClick={() => onGoiKham(item.id)}
                  >
                    <Phone data-icon="inline-start" />
                    Gọi khám
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
