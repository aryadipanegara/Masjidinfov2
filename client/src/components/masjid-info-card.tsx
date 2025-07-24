"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PaletteIcon,
  ExternalLinkIcon,
  CameraIcon,
} from "lucide-react";
import type { Post } from "@/types/posts.types";

interface MasjidInfoCardProps {
  post: Post;
}

export function MasjidInfoCard({ post }: MasjidInfoCardProps) {
  if (post.type !== "masjid" || !post.masjidInfo) {
    return null;
  }

  const { masjidInfo } = post;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-green-600" />
          Informasi Masjid
        </CardTitle>
        <CardDescription>
          Detail lokasi dan informasi arsitektur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {masjidInfo.namaLokal && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nama Lokal
              </label>
              <p className="text-sm mt-1">{masjidInfo.namaLokal}</p>
            </div>
          )}
          {masjidInfo.tahunDibangun && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Tahun Dibangun
              </label>
              <p className="text-sm mt-1">{masjidInfo.tahunDibangun}</p>
            </div>
          )}
        </div>

        {/* Location */}
        {(masjidInfo.alamat ||
          masjidInfo.kota ||
          masjidInfo.provinsi ||
          masjidInfo.negara) && (
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
              <MapPinIcon className="h-4 w-4" />
              Lokasi
            </label>
            <div className="space-y-1">
              {masjidInfo.alamat && (
                <p className="text-sm">{masjidInfo.alamat}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {masjidInfo.kota && (
                  <Badge variant="outline">{masjidInfo.kota}</Badge>
                )}
                {masjidInfo.provinsi && (
                  <Badge variant="outline">{masjidInfo.provinsi}</Badge>
                )}
                {masjidInfo.negara && (
                  <Badge variant="outline">{masjidInfo.negara}</Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {masjidInfo.arsitek && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                Arsitek
              </label>
              <p className="text-sm mt-1">{masjidInfo.arsitek}</p>
            </div>
          )}
          {masjidInfo.gaya && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <PaletteIcon className="h-4 w-4" />
                Gaya Arsitektur
              </label>
              <p className="text-sm mt-1">{masjidInfo.gaya}</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {masjidInfo.sumberFoto && (
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CameraIcon className="h-4 w-4" />
              Sumber Foto
            </label>
            <p className="text-sm mt-1">{masjidInfo.sumberFoto}</p>
          </div>
        )}

        {/* Maps Link */}
        {masjidInfo.mapsUrl && (
          <div className="pt-4 border-t">
            <Button asChild variant="outline" className="w-full bg-transparent">
              <a
                href={masjidInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPinIcon className="w-4 h-4 mr-2" />
                Lihat di Google Maps
                <ExternalLinkIcon className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
