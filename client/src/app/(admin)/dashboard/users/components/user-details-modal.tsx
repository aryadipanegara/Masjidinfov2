"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  MailIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChromeIcon as GoogleIcon,
} from "lucide-react";
import type { UserDetail } from "@/types/user.types";

interface UserDetailModalProps {
  user: UserDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailModal({
  user,
  open,
  onOpenChange,
}: UserDetailModalProps) {
  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "EDITOR":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pengguna</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang pengguna ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || ""} alt={user.fullname} />
                  <AvatarFallback className="text-lg">
                    {user.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">{user.fullname}</h3>
                    <p className="text-muted-foreground flex items-center mt-1">
                      <MailIcon className="h-4 w-4 mr-2" />
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(user.role)}>
                      <ShieldIcon className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {user.hasGoogleAccount && (
                      <Badge variant="outline">
                        <GoogleIcon className="h-3 w-3 mr-1" />
                        Google Connected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {user.id}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <div>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status Verifikasi
                  </label>
                  <div className="flex items-center space-x-2">
                    {user.isVerified ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {user.isVerified
                        ? "Terverifikasi"
                        : "Belum Terverifikasi"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Google Account
                  </label>
                  <div className="flex items-center space-x-2">
                    {user.hasGoogleAccount ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {user.hasGoogleAccount ? "Terhubung" : "Tidak Terhubung"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Waktu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Tanggal Bergabung
                  </label>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Terakhir Diperbarui
                  </label>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
