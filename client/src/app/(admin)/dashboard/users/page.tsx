"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Shield,
  Ban,
  RotateCcw,
  Key,
  Mail,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { UserService } from "@/service/users.service";

interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  isVerified: boolean;
  isBanned: boolean;
  bannedReason?: string;
  createdAt: string;
  updatedAt: string;
}

const USER_ROLES = [
  { value: "all", label: "Semua Role" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "EDITOR", label: "Editor" },
  { value: "VIEWER", label: "Viewer" },
];

const USER_STATUS = [
  { value: "all", label: "Semua Status" },
  { value: "verified", label: "Terverifikasi" },
  { value: "unverified", label: "Belum Verifikasi" },
  { value: "banned", label: "Dibanned" },
];

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "EDITOR", label: "Editor" },
  { value: "VIEWER", label: "Viewer" },
];

// SWR fetcher function
const fetchUsers = async (url: string) => {
  const [, searchQuery, selectedRole, selectedStatus, currentPage] =
    url.split("|");

  const params: any = {
    page: Number.parseInt(currentPage) || 1,
    limit: 10,
  };

  if (searchQuery && searchQuery !== "undefined") params.search = searchQuery;

  const response = await UserService.getUsers(params);
  return response.data;
};

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [banReason, setBanReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create SWR key
  const swrKey = `users|${searchQuery}|${selectedRole}|${selectedStatus}|${currentPage}`;

  // SWR hook for users data
  const {
    data: usersData,
    error,
    isLoading,
    mutate: mutateUsers,
  } = useSWR(swrKey, fetchUsers, {
    revalidateOnFocus: false,
  });

  const users = usersData?.data || [];
  const totalPages = usersData?.pagination?.totalPages || 1;
  const totalItems = usersData?.pagination?.totalItems || 0;

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

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setBanReason("");
    setIsBanDialogOpen(true);
  };

  const handleSubmitRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setIsSubmitting(true);
    const toastId = notify.loading("Mengubah role pengguna...");

    try {
      await UserService.updateUser(selectedUser.id, { role: newRole });
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
    const toastId = notify.loading(
      selectedUser.isBanned ? "Membatalkan ban..." : "Membanned pengguna..."
    );

    try {
      if (selectedUser.isBanned) {
        await UserService.updateUser(selectedUser.id, {
          isBanned: false,
          bannedReason: null,
        });
        notify.success("Ban pengguna berhasil dibatalkan!", { id: toastId });
      } else {
        await UserService.updateUser(selectedUser.id, {
          isBanned: true,
          bannedReason: banReason.trim() || "Melanggar ketentuan",
        });
        notify.success("Pengguna berhasil dibanned!", { id: toastId });
      }

      mutateUsers();
      setIsBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
    } catch (error) {
      handleErrorResponse(error, toastId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        color: string;
      }
    > = {
      SUPER_ADMIN: { variant: "destructive", color: "bg-red-100 text-red-800" },
      ADMIN: { variant: "default", color: "bg-blue-100 text-blue-800" },
      EDITOR: { variant: "secondary", color: "bg-green-100 text-green-800" },
      VIEWER: { variant: "outline", color: "bg-gray-100 text-gray-800" },
    };
    const config = variants[role] || variants.VIEWER;
    return <Badge className={config.color}>{role}</Badge>;
  };

  const getStatusBadges = (user: User) => {
    const badges = [];

    if (user.isBanned) {
      badges.push(
        <Badge key="banned" variant="destructive">
          Banned
        </Badge>
      );
    }

    if (user.isVerified) {
      badges.push(
        <Badge
          key="verified"
          variant="default"
          className="bg-green-100 text-green-800"
        >
          Verified
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="unverified" variant="outline">
          Unverified
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

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter pengguna berdasarkan role dan status
          </CardDescription>
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna ({totalItems} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
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
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {user.fullname
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullname}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </p>
                            {user.isBanned && user.bannedReason && (
                              <p className="text-xs text-red-600 mt-1">
                                Alasan: {user.bannedReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getStatusBadges(user)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(user)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Ubah Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleBanUser(user)}
                            >
                              {user.isBanned ? (
                                <>
                                  <RotateCcw className="mr-2 h-4 w-4 text-green-600" />
                                  Unban
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                                  Ban
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role Pengguna</DialogTitle>
            <DialogDescription>
              Ubah role untuk {selectedUser?.fullname} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Baru</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitRoleChange}
              disabled={isSubmitting || !newRole}
            >
              {isSubmitting ? "Mengubah..." : "Ubah Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.isBanned
                ? "Batalkan Ban Pengguna"
                : "Ban Pengguna"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isBanned
                ? `Apakah Anda yakin ingin membatalkan ban untuk ${selectedUser?.fullname}?`
                : `Apakah Anda yakin ingin memban ${selectedUser?.fullname}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!selectedUser?.isBanned && (
            <div className="space-y-2">
              <Label htmlFor="banReason">Alasan Ban</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Masukkan alasan ban (opsional)"
                rows={3}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitBan}
              disabled={isSubmitting}
              className={
                selectedUser?.isBanned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting
                ? selectedUser?.isBanned
                  ? "Membatalkan..."
                  : "Membanning..."
                : selectedUser?.isBanned
                ? "Batalkan Ban"
                : "Ban Pengguna"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
