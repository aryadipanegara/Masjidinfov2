"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPinIcon, CalendarIcon, UserIcon, PaletteIcon } from "lucide-react";
import type { CreateMasjidPayload } from "@/types/masjid.types";

interface MasjidInfoFormProps {
  data: CreateMasjidPayload;
  onChange: (data: CreateMasjidPayload) => void;
  disabled?: boolean;
}

export function MasjidInfoForm({
  data,
  onChange,
  disabled = false,
}: MasjidInfoFormProps) {
  const handleChange = (field: keyof CreateMasjidPayload, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5" />
          Informasi Masjid
        </CardTitle>
        <CardDescription>
          Lengkapi informasi detail tentang masjid ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="namaLokal">Nama Lokal</Label>
            <Input
              id="namaLokal"
              value={data.namaLokal || ""}
              onChange={(e) => handleChange("namaLokal", e.target.value)}
              placeholder="Nama masjid dalam bahasa lokal"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahunDibangun" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Tahun Dibangun
            </Label>
            <Input
              id="tahunDibangun"
              value={data.tahunDibangun || ""}
              onChange={(e) => handleChange("tahunDibangun", e.target.value)}
              placeholder="Contoh: 1850"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Textarea
            id="alamat"
            value={data.alamat || ""}
            onChange={(e) => handleChange("alamat", e.target.value)}
            placeholder="Alamat lengkap masjid"
            rows={2}
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kota">Kota</Label>
            <Input
              id="kota"
              value={data.kota || ""}
              onChange={(e) => handleChange("kota", e.target.value)}
              placeholder="Nama kota"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provinsi">Provinsi</Label>
            <Input
              id="provinsi"
              value={data.provinsi || ""}
              onChange={(e) => handleChange("provinsi", e.target.value)}
              placeholder="Nama provinsi"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negara">Negara</Label>
            <Input
              id="negara"
              value={data.negara || ""}
              onChange={(e) => handleChange("negara", e.target.value)}
              placeholder="Nama negara"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="arsitek" className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              Arsitek
            </Label>
            <Input
              id="arsitek"
              value={data.arsitek || ""}
              onChange={(e) => handleChange("arsitek", e.target.value)}
              placeholder="Nama arsitek"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gaya" className="flex items-center gap-1">
              <PaletteIcon className="h-4 w-4" />
              Gaya Arsitektur
            </Label>
            <Input
              id="gaya"
              value={data.gaya || ""}
              onChange={(e) => handleChange("gaya", e.target.value)}
              placeholder="Contoh: Ottoman, Moorish, Modern"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mapsUrl">URL Google Maps</Label>
          <Input
            id="mapsUrl"
            value={data.mapsUrl || ""}
            onChange={(e) => handleChange("mapsUrl", e.target.value)}
            placeholder="https://maps.google.com/..."
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sumberFoto">Sumber Foto</Label>
          <Input
            id="sumberFoto"
            value={data.sumberFoto || ""}
            onChange={(e) => handleChange("sumberFoto", e.target.value)}
            placeholder="Kredit fotografer atau sumber gambar"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
