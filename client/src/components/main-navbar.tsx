"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HomeIcon,
  BookOpenIcon,
  MapPinIcon,
  UserIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
  PlusIcon,
  Bookmark,
  SearchIcon,
} from "lucide-react";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { useAuth } from "@/app/providers";
import { PostService } from "@/service/posts.service";
import useSWR from "swr";
import { debounce } from "lodash";
import { Input } from "./ui/input";
import { LoginDialog } from "./auth/login-dialog";

const navigation = [
  { name: "Beranda", href: "/", icon: HomeIcon },
  { name: "Explore", href: "/posts", icon: BookOpenIcon },
  { name: "Libary", href: "/library", icon: Bookmark },
  { name: "Search", href: "/search", icon: SearchIcon },
];

export function MainNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: searchLoading } = useSWR(
    searchQuery.length > 2 ? `/search?q=${searchQuery}` : null,
    async () => {
      const response = await PostService.getAll({
        search: searchQuery,
        limit: 5,
      });
      return response.data.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300,
    }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/(admin)")) {
    return null;
  }

  const canCreateEdit =
    user && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);
  const isAdmin = user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    setShowSearchResults(value.length >= 3);
  }, 300);

  const handleLogout = async () => {
    const toastId = notify.loading("Logging out...");
    try {
      await logout();
      notify.dismiss(toastId);
      notify.success("Logout berhasil!");
    } catch (err: unknown) {
      handleErrorResponse(err, toastId);
    }
  };

  const handleSearchSelect = (slug: string) => {
    router.push(`/posts/${slug}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleViewAllResults = () => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Masjidinfo</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {/* Desktop Search with Dropdown */}
              <div className="relative" ref={searchRef}>
                <div className="relative w-80">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Minimal 3 karakter untuk mencari..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    onFocus={() =>
                      searchQuery.length >= 3 && setShowSearchResults(true)
                    }
                    className="pl-10 pr-4 h-9"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.length >= 3 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Mencari...
                      </div>
                    ) : searchResults && searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Tidak ada hasil ditemukan.
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      <div className="py-2">
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                          Posts
                        </div>
                        {searchResults.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => handleSearchSelect(post.slug)}
                            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                          >
                            <BookOpenIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {post.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {post.type === "masjid" ? "Masjid" : "Artikel"}
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t px-3 py-2">
                          <button
                            onClick={handleViewAllResults}
                            className="text-xs text-primary hover:underline w-full text-left"
                          >
                            Lihat semua hasil untuk {searchQuery}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {canCreateEdit && (
                <Button size="sm" asChild>
                  <Link href="/posts/create">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Tulis
                  </Link>
                </Button>
              )}

              {/* Desktop User Menu */}
              {loading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar || ""}
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
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.fullname}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLoginOpen(true)}
                  >
                    <LogInIcon className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Actions - Search + Profile */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Search Dropdown */}
              <DropdownMenu
                open={mobileSearchOpen}
                onOpenChange={setMobileSearchOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" side="bottom">
                  <DropdownMenuLabel>Search Posts</DropdownMenuLabel>
                  <div className="p-3 space-y-3">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Minimal 3 karakter untuk mencari..."
                        onChange={(e) => debouncedSearch(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && searchQuery.length >= 3) {
                            router.push(
                              `/search?q=${encodeURIComponent(searchQuery)}`
                            );
                            setMobileSearchOpen(false);
                            setSearchQuery("");
                          }
                        }}
                        className="pl-10"
                        autoFocus
                      />
                    </div>

                    {/* Mobile Search Results */}
                    {searchQuery.length >= 3 && (
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        {searchLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Mencari...
                          </div>
                        ) : searchResults && searchResults.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Tidak ada hasil ditemukan.
                          </div>
                        ) : searchResults && searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((post) => (
                              <button
                                key={post.id}
                                onClick={() => {
                                  router.push(`/posts/${post.slug}`);
                                  setMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                              >
                                <BookOpenIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {post.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {post.type === "masjid"
                                      ? "Masjid"
                                      : "Artikel"}
                                  </div>
                                </div>
                              </button>
                            ))}
                            <div className="border-t px-3 py-2">
                              <button
                                onClick={() => {
                                  router.push(
                                    `/search?q=${encodeURIComponent(
                                      searchQuery
                                    )}`
                                  );
                                  setMobileSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="text-xs text-primary hover:underline w-full text-left"
                              >
                                Lihat semua hasil untuk {searchQuery}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {loading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar || ""}
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
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.fullname}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {canCreateEdit && (
                      <DropdownMenuItem asChild>
                        <Link href="/posts/create">
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Tulis Post
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <UserIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    {/* Login (buka modal) */}
                    <DropdownMenuItem
                      className="flex items-center"
                      onClick={() => setLoginOpen(true)}
                    >
                      <LogInIcon className="mr-2 h-4 w-4" />
                      Login
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <nav className="flex justify-around items-center h-20">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
            flex flex-col items-center justify-center space-y-1 transition-colors
            ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={`h-6 w-6 ${isActive ? "" : "opacity-80"}`}
                />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      {/* <div className="lg:hidden h-16" /> */}
    </>
  );
}
