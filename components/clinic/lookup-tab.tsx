"use client"

import { useState } from "react"
import { Cake, Phone, Search, Stethoscope, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { BenhNhan, LichSuKhamItem } from "@/lib/clinic-types"

export function LookupTab({
  danhSachBenhNhan,
  lichSuKham,
}: {
  danhSachBenhNhan: BenhNhan[]
  lichSuKham: LichSuKhamItem[]
}) {
  const [maBNNhap, setMaBNNhap] = useState("")
  const [maBNTimKiem, setMaBNTimKiem] = useState<string | null>(null)

  const benhNhan = maBNTimKiem
    ? danhSachBenhNhan.find((bn) => bn.maBN.toUpperCase() === maBNTimKiem.toUpperCase())
    : undefined

  const lichSuCuaBenhNhan = benhNhan
    ? lichSuKham.filter((ls) => ls.maBN === benhNhan.maBN).sort((a, b) => (a.ngayKham < b.ngayKham ? 1 : -1))
    : []

  function handleTimKiem(e: React.FormEvent) {
    e.preventDefault()
    setMaBNTimKiem(maBNNhap.trim())
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search data-icon="inline-start" />
            Tra cứu hồ sơ bệnh nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTimKiem}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ma-bn-search">Mã bệnh nhân</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="ma-bn-search"
                    placeholder="VD: BN100235"
                    value={maBNNhap}
                    onChange={(e) => setMaBNNhap(e.target.value)}
                    className="text-base"
                  />
                  <Button type="submit">
                    <Search data-icon="inline-start" />
                    Tìm kiếm
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {maBNTimKiem && !benhNhan && (
        <Alert variant="destructive">
          <AlertDescription>Không tìm thấy hồ sơ bệnh nhân</AlertDescription>
        </Alert>
      )}

      {benhNhan && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User data-icon="inline-start" />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mã BN:</span>
                  <span className="font-mono text-sm font-medium">{benhNhan.maBN}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{benhNhan.hoTen}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cake className="size-4 text-muted-foreground" />
                  <span className="text-sm">{benhNhan.ngaySinh}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-sm">{benhNhan.sdt}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope data-icon="inline-start" />
                Lịch sử khám
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lichSuCuaBenhNhan.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có lịch sử khám nào.</p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {lichSuCuaBenhNhan.map((ls) => (
                    <li key={ls.id} className="relative border-l-2 border-border pl-4">
                      <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-primary" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{ls.ngayKham}</span>
                        <span className="text-xs text-muted-foreground">{ls.chuyenKhoa}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ls.tinhTrang}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
