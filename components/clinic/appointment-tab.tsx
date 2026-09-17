"use client"

import { useMemo, useState } from "react"
import { CalendarPlus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { KhungGioKhamItem, LichHenItem } from "@/lib/clinic-types"

const NHU_CAU_KHAM = ["Khám tổng quát", "Khám chuyên khoa Tim mạch", "Khám chuyên khoa Da liễu", "Khám Nhi", "Xét nghiệm"]

export function AppointmentTab({
  lichHen,
  khungGioKham,
  onDatLich,
  onHuyLich,
}: {
  lichHen: LichHenItem[]
  khungGioKham: KhungGioKhamItem[]
  onDatLich: (data: { maBN: string; nhuCauKham: string; ngay: string; khungGioId: string }) => void
  onHuyLich: (id: string) => void
}) {
  const [maBN, setMaBN] = useState("")
  const [nhuCauKham, setNhuCauKham] = useState("")
  const [ngay, setNgay] = useState("")
  const [khungGioId, setKhungGioId] = useState("")

  const khungGioDaChon = useMemo(() => khungGioKham.find((k) => k.id === khungGioId), [khungGioKham, khungGioId])
  const coTheDat =
    maBN.trim() && nhuCauKham && ngay && khungGioId && khungGioDaChon && khungGioDaChon.daDat < khungGioDaChon.soLuongToiDa

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!coTheDat) return
    const [y, m, d] = ngay.split("-")
    onDatLich({ maBN: maBN.trim(), nhuCauKham, ngay: `${d}/${m}/${y}`, khungGioId })
    setMaBN("")
    setNhuCauKham("")
    setNgay("")
    setKhungGioId("")
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus data-icon="inline-start" />
            Đặt lịch khám
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ma-bn-dat-lich">Mã bệnh nhân</FieldLabel>
                <Input
                  id="ma-bn-dat-lich"
                  placeholder="VD: BN000101"
                  value={maBN}
                  onChange={(e) => setMaBN(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nhu-cau-kham">Nhu cầu khám</FieldLabel>
                <Select value={nhuCauKham} onValueChange={setNhuCauKham}>
                  <SelectTrigger id="nhu-cau-kham" className="w-full">
                    <SelectValue placeholder="Chọn nhu cầu khám" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {NHU_CAU_KHAM.map((nc) => (
                        <SelectItem key={nc} value={nc} label={nc}>
                          {nc}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="ngay-kham">Ngày khám</FieldLabel>
                <Input id="ngay-kham" type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="khung-gio">Khung giờ</FieldLabel>
                <Select value={khungGioId} onValueChange={setKhungGioId}>
                  <SelectTrigger id="khung-gio" className="w-full">
                    <SelectValue placeholder="Chọn khung giờ">
                      {(value: string) => {
                        const kg = khungGioKham.find((k) => k.id === value)
                        if (!kg) return "Chọn khung giờ"
                        const day = kg.daDat >= kg.soLuongToiDa
                        return `${kg.gio} — ${day ? "Khung giờ đã đầy" : `Còn ${kg.soLuongToiDa - kg.daDat}/${kg.soLuongToiDa} suất`}`
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {khungGioKham.map((kg) => {
                        const day = kg.daDat >= kg.soLuongToiDa
                        const nhan = `${kg.gio} — ${day ? "Khung giờ đã đầy" : `Còn ${kg.soLuongToiDa - kg.daDat}/${kg.soLuongToiDa} suất`}`
                        return (
                          <SelectItem key={kg.id} value={kg.id} label={nhan} disabled={day}>
                            {nhan}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Button type="submit" disabled={!coTheDat} className="w-fit">
                <CalendarPlus data-icon="inline-start" />
                Đặt lịch
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch đã đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã BN</TableHead>
                <TableHead>Nhu cầu khám</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lichHen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Chưa có lịch hẹn nào.
                  </TableCell>
                </TableRow>
              ) : (
                lichHen.map((lh) => {
                  const khungGio = khungGioKham.find((k) => k.id === lh.khungGioId)
                  return (
                    <TableRow key={lh.id}>
                      <TableCell className="font-mono text-sm">{lh.maBN}</TableCell>
                      <TableCell>{lh.nhuCauKham}</TableCell>
                      <TableCell>{lh.ngay}</TableCell>
                      <TableCell>{khungGio?.gio ?? "—"}</TableCell>
                      <TableCell>
                        {lh.trangThai === "Đã đặt" ? (
                          <Badge variant="outline">Đã đặt</Badge>
                        ) : (
                          <Badge variant="destructive">Đã hủy</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {lh.trangThai === "Đã đặt" && (
                          <Button size="sm" variant="outline" onClick={() => onHuyLich(lh.id)}>
                            <X data-icon="inline-start" />
                            Hủy
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
