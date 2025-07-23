"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboardIcon,
  UsersIcon,
  SettingsIcon,
  ChevronRightIcon,
  LogOutIcon,
  UserIcon,
  ShieldIcon,
  DatabaseIcon,
  BarChart3Icon,
  FileTextIcon,
  BellIcon,
  HelpCircleIcon,
  CogIcon,
} from "lucide-react";
import type { UserDetail } from "@/types/user.types";
import { useRouter } from "next/navigation";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import Cookies from "js-cookie";
import { AuthService } from "@/service/auth.service";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "Master Data",
      url: "#",
      icon: DatabaseIcon,
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
          icon: UsersIcon,
        },
        {
          title: "Roles & Permissions",
          url: "/dashboard/roles",
          icon: ShieldIcon,
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3Icon,
      items: [
        {
          title: "User Analytics",
          url: "/dashboard/analytics/users",
          icon: UsersIcon,
        },
        {
          title: "System Reports",
          url: "/dashboard/analytics/reports",
          icon: FileTextIcon,
        },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: CogIcon,
      items: [
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: SettingsIcon,
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
          icon: BellIcon,
        },
        {
          title: "Help & Support",
          url: "/dashboard/help",
          icon: HelpCircleIcon,
        },
      ],
    },
  ],
};

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserDetail | null;
}

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const loadingToastId = notify.loading("Logging out...");
    try {
      await AuthService.logout();
      notify.dismiss(loadingToastId);
      notify.success("Logout berhasil!");
      Cookies.remove("authToken");
      router.push("/login");
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboardIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => {
              const isActive =
                pathname === item.url ||
                (item.items &&
                  item.items.some((subItem) => pathname === subItem.url));

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {item.items ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url}>
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton
                        tooltip={item.title}
                        asChild
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.fullname || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.fullname
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.fullname || "Admin"}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email || "admin@example.com"}
                    </span>
                  </div>
                  <ChevronRightIcon className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
