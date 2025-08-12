"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserDetail, UpdateUserPayload } from "@/types/user.types";
import useSWR from "swr";
import { toast as notify } from "sonner";
import { UserService } from "@/service/users.service";
import handleErrorResponse from "@/utils/handleErrorResponse";

const fetchUsers = async (url: string) => {
  const [, searchQuery, currentPage] = url.split("|");

  const params: Record<string, string | number> = {
    page: currentPage,
    limit: 10,
    role: searchQuery === undefined ? "" : searchQuery,
  };

  if (searchQuery && searchQuery !== "undefined") {
    params.search = searchQuery;
  }

  const response = await UserService.getUsers(params);
  return response.data;
};

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("SUPER_ADMIN");
  const [banReason, setBanReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const swrKey = `users|${searchQuery}|${selectedRole}|${selectedStatus}|${currentPage}`;

  const {
    data: usersData,
    error,
    isLoading,
    mutate: mutateUsers,
  } = useSWR(swrKey, fetchUsers, {
    revalidateOnFocus: false,
  });

  const users = usersData?.data || [];
  const totalPages = usersData?.paginations?.totalPages || 1;
  const totalItems = usersData?.paginations?.totalItems || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setSelectedRole(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleChangeRole = (user: UserDetail) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleBanUser = (user: UserDetail) => {
    setSelectedUser(user);
    setBanReason(user.bannedReason || "");
    setIsBanDialogOpen(true);
  };

  const handleSubmitRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setIsSubmitting(true);
    const toastId = notify.loading("Mengubah role pengguna...");

    try {
      await UserService.updateUser(selectedUser.id, {
        role: newRole as "ADMIN" | "EDITOR" | "VIEWER" | "SUPER_ADMIN",
      });
      notify.success("Role pengguna berhasil diubah!", { id: toastId });

      mutateUsers();
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
    } catch (error) {
      handleErrorResponse(error, toastId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBan = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    const isCurrentlyBanned = selectedUser.isBanned;
    const toastId = notify.loading(
      isCurrentlyBanned ? "Membatalkan ban..." : "Membanning pengguna..."
    );

    try {
      const updatePayload: UpdateUserPayload = {
        isBanned: !isCurrentlyBanned,
        bannedReason: isCurrentlyBanned
          ? undefined
          : banReason.trim() || "Melanggar ketentuan",
      };

      await UserService.updateUser(selectedUser.id, updatePayload);

      notify.success(
        isCurrentlyBanned
          ? "Ban pengguna berhasil dibatalkan!"
          : "Pengguna berhasil dibanned!",
        {
          id: toastId,
        }
      );

      await mutateUsers();
      setIsBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
    } catch (error) {
      console.error("Ban/Unban error:", error);
      handleErrorResponse(error, toastId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      SUPER_ADMIN: { label: "Super Admin", variant: "destructive" as const },
      ADMIN: { label: "Admin", variant: "default" as const },
      EDITOR: { label: "Editor", variant: "secondary" as const },
      VIEWER: { label: "Viewer", variant: "outline" as const },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      variant: "outline" as const,
    };

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getStatusBadges = (user: UserDetail) => {
    const badges = [];

    if (user.isBanned) {
      badges.push(
        <Badge
          key="banned"
          variant="destructive"
          className="text-xs font-medium"
        >
          <UserX className="w-3 h-3 mr-1" />
          Banned
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="active" variant="secondary" className="text-xs font-medium">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }

    if (user.isVerified) {
      badges.push(
        <Badge
          key="verified"
          variant="default"
          className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    return badges;
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Pengguna
          </h2>
          <p className="text-muted-foreground">
            Kelola pengguna, role, dan status akun
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading users. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Manajemen Pengguna
        </h2>
        <p className="text-muted-foreground">
          Kelola pengguna, role, dan status akun
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terverifikasi</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u: UserDetail) => u.isVerified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u: UserDetail) => u.isBanned).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter(
                  (u: UserDetail) =>
                    u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="unverified">Belum Terverifikasi</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bergabung</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: UserDetail) => (
                    <TableRow
                      key={user.id}
                      className={
                        user.isBanned
                          ? "bg-red-50 hover:bg-red-100"
                          : "hover:bg-gray-50"
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.fullname}
                            />
                            <AvatarFallback>
                              {user.fullname
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div
                              className={`font-medium ${
                                user.isBanned ? "text-red-700" : ""
                              }`}
                            >
                              {user.fullname}
                            </div>
                            <div
                              className={`text-sm ${
                                user.isBanned
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getStatusBadges(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(user)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Ubah Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleBanUser(user)}
                              className={
                                user.isBanned
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {user.isBanned ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Unban Pengguna
                                </>
                              ) : (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Ban Pengguna
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {users.length} dari {totalItems} pengguna
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <div className="text-sm">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role Pengguna</DialogTitle>
            <DialogDescription>
              Ubah role untuk {selectedUser?.fullname}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmitRoleChange}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle
              className={
                selectedUser?.isBanned ? "text-green-600" : "text-red-600"
              }
            >
              {selectedUser?.isBanned ? (
                <div className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Unban Pengguna
                </div>
              ) : (
                <div className="flex items-center">
                  <UserX className="mr-2 h-5 w-5" />
                  Ban Pengguna
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isBanned
                ? `Batalkan ban untuk ${selectedUser?.fullname}? Pengguna akan dapat mengakses sistem kembali.`
                : `Ban pengguna ${selectedUser?.fullname}? Pengguna tidak akan dapat mengakses sistem.`}
            </DialogDescription>
          </DialogHeader>

          {!selectedUser?.isBanned && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Alasan Ban *</Label>
                <Textarea
                  id="reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Masukkan alasan ban..."
                  className="min-h-[80px]"
                  required
                />
              </div>
            </div>
          )}

          {selectedUser?.isBanned && selectedUser.bannedReason && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Alasan Ban Saat Ini:</Label>
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {selectedUser.bannedReason}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBanDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              onClick={handleSubmitBan}
              disabled={
                isSubmitting || (!selectedUser?.isBanned && !banReason.trim())
              }
              variant={selectedUser?.isBanned ? "default" : "destructive"}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {selectedUser?.isBanned ? "Membatalkan..." : "Membanning..."}
                </div>
              ) : selectedUser?.isBanned ? (
                "Unban Pengguna"
              ) : (
                "Ban Pengguna"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
