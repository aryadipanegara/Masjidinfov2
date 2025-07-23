"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CircleUserIcon, MenuIcon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type { UserDetail } from "@/types/user.types";
import { AuthService } from "@/service/auth.service";

interface AdminHeaderProps {
  user: UserDetail | null;
  loadingUser: boolean;
}

export function AdminHeader({ user, loadingUser }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const loadingToastId = notify.loading("Logging out...");
    try {
      await AuthService.logout();
      notify.dismiss(loadingToastId);
      notify.success("Logout berhasil!");
      localStorage.removeItem("authToken");
      router.push("/login");
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="sm:hidden bg-transparent"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <LayoutDashboardIcon className="h-6 w-6" />
              <span>Admin Dashboard</span>
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/users" className="hover:text-foreground">
              Users
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="relative ml-auto flex-1 md:grow-0" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUserIcon className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            {loadingUser ? "Memuat..." : user ? user.email : "Profil"}
          </DropdownMenuItem>
          <DropdownMenuItem>Pengaturan</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
