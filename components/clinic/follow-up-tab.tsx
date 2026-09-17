"use client"

import { useState } from "react"
import { BellRing, CalendarClock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { LichTaiKhamItem } from "@/lib/clinic-types"

function parseNgayVN(ngay: string) {
  const [d, m, y] = ngay.split("/").map(Number)
  return new Date(y, m - 1, d)
}

function soNgayConLai(ngay: string) {
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)
  const ngayHen = parseNgayVN(ngay)
  return Math.round((ngayHen.getTime() - homNay.getTime()) / (1000 * 60 * 60 * 24))
}

export function FollowUpTab({
  lichTaiKham,
  onTaoLich,
}: {
  lichTaiKham: LichTaiKhamItem[]
  onTaoLich: (data: { maBN: string; ngay: string; gio: string; noiDung: string }) => void
}) {
  const [maBN, setMaBN] = useState("")
  const [ngay, setNgay] = useState("")
  const [gio, setGio] = useState("")
  const [noiDung, setNoiDung] = useState("")

  const coTheTao = maBN.trim() && ngay && gio && noiDung.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!coTheTao) return
    const [y, m, d] = ngay.split("-")
    onTaoLich({ maBN: maBN.trim(), ngay: `${d}/${m}/${y}`, gio, noiDung: noiDung.trim() })
    setMaBN("")
    setNgay("")
    setGio("")
    setNoiDung("")
  }

  const sapToi = [...lichTaiKham]
    .filter((lt) => lt.trangThai === "Sắp tới")
    .sort((a, b) => soNgayConLai(a.ngay) - soNgayConLai(b.ngay))
  const khac = lichTaiKham.filter((lt) => lt.trangThai !== "Sắp tới")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing data-icon="inline-start" />
            Tạo lịch tái khám
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ma-bn-tai-kham">Mã bệnh nhân</FieldLabel>
                <Input
                  id="ma-bn-tai-kham"
                  placeholder="VD: BN000101"
                  value={maBN}
                  onChange={(e) => setMaBN(e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="ngay-tai-kham">Ngày</FieldLabel>
                  <Input id="ngay-tai-kham" type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="gio-tai-kham">Giờ</FieldLabel>
                  <Input id="gio-tai-kham" type="time" value={gio} onChange={(e) => setGio(e.target.value)} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="noi-dung-tai-kham">Nội dung tái khám</FieldLabel>
                <Input
                  id="noi-dung-tai-kham"
                  placeholder="VD: Tái khám huyết áp"
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                />
              </Field>
              <Button type="submit" disabled={!coTheTao} className="w-fit">
                <CalendarClock data-icon="inline-start" />
                Tạo lịch
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch tái khám</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã BN</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...sapToi, ...khac].length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Chưa có lịch tái khám nào.
                  </TableCell>
                </TableRow>
              ) : (
                [...sapToi, ...khac].map((lt) => {
                  const conLai = soNgayConLai(lt.ngay)
                  const gapHan = lt.trangThai === "Sắp tới" && conLai <= 3 && conLai >= 0
                  return (
                    <TableRow key={lt.id} className={cn(gapHan && "bg-amber-50 animate-pulse")}>
                      <TableCell className="font-mono text-sm">{lt.maBN}</TableCell>
                      <TableCell className={cn(gapHan && "font-semibold text-amber-700")}>{lt.ngay}</TableCell>
                      <TableCell>{lt.gio}</TableCell>
                      <TableCell>{lt.noiDung}</TableCell>
                      <TableCell>
                        {lt.trangThai === "Sắp tới" ? (
                          gapHan ? (
                            <Badge className="border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Sắp đến hạn ({conLai} ngày)
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sắp tới</Badge>
                          )
                        ) : lt.trangThai === "Hoàn thành" ? (
                          <Badge variant="secondary">Hoàn thành</Badge>
                        ) : (
                          <Badge variant="destructive">Đã hủy</Badge>
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
