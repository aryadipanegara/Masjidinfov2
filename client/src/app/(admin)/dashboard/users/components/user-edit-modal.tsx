"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveIcon, XIcon } from "lucide-react";
import type { UserDetail, UpdateUserPayload } from "@/types/user.types";
import { UserService } from "@/service/users.service";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";

interface UserEditModalProps {
  user: UserDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export default function UserEditModal({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateUserPayload>({
    fullname: "",
    role: "VIEWER",
    isVerified: false,
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        fullname: user.fullname,
        role: user.role,
        isVerified: user.isVerified,
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.fullname?.trim()) {
      notify.error("Nama lengkap tidak boleh kosong");
      return;
    }

    setLoading(true);
    const loadingToastId = notify.loading("Memperbarui data pengguna...");

    try {
      await UserService.updateUser(user.id, formData);
      notify.dismiss(loadingToastId);
      notify.success("Data pengguna berhasil diperbarui!");
      onUserUpdated();
      onOpenChange(false);
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);

    if (user) {
      setFormData({
        fullname: user.fullname,
        role: user.role,
        isVerified: user.isVerified,
      });
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Perbarui informasi pengguna di bawah ini
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profil Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || ""} alt={user.fullname} />
                  <AvatarFallback className="text-lg">
                    {user.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold">{user.fullname}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Nama Lengkap</Label>
                <Input
                  id="fullname"
                  type="text"
                  value={formData.fullname || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(
                    value: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER"
                  ) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVerified"
                  checked={formData.isVerified || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isVerified: checked })
                  }
                />
                <Label htmlFor="isVerified">Status Verifikasi</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <XIcon className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <SaveIcon className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
