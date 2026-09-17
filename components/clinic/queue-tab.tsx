"use client"

import { AlertTriangle, Clock, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { BenhNhan, HangDoiItem } from "@/lib/clinic-types"

function timeToMinutes(gio: string) {
  const [h, m] = gio.split(":").map(Number)
  return h * 60 + m
}

function sapXepHangDoi(hangDoi: HangDoiItem[]) {
  return [...hangDoi].sort((a, b) => {
    if (a.mucUuTien !== b.mucUuTien) return a.mucUuTien - b.mucUuTien
    return timeToMinutes(a.gioHen) - timeToMinutes(b.gioHen)
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
  const daSapXep = sapXepHangDoi(hangDoi)
  const layTenBenhNhan = (maBN: string) => danhSachBenhNhan.find((bn) => bn.maBN === maBN)?.hoTen ?? "Không rõ"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock data-icon="inline-start" />
          Hàng đợi bệnh nhân
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã BN</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Giờ hẹn</TableHead>
              <TableHead>Mức ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daSapXep.map((item) => (
              <TableRow
                key={item.id}
                className={cn(
                  item.mucUuTien === 1 && "border-l-4 border-l-destructive bg-destructive/5",
                  item.mucUuTien === 2 && "border-l-4 border-l-amber-400",
                )}
              >
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
