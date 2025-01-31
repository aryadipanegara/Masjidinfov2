"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getSession } from "@/lib/getSession"; // Ambil sesi dari server
import { useEffect, useState } from "react";
import { handleSignOut } from "@/lib/signOutServerAction";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/popular", label: "Most Popular" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
  }, []);

  return (
    <header className="w-full h-20 border-b">
      <nav className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 text-2xl font-bold">
          <Image src="/masjid.png" alt="logo" width={32} height={32} />
          <span>Masjidinfo</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <Button onClick={() => handleSignOut()}>Logout</Button>
          ) : (
            <Button>
              <Link href="/auth/signIn">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[100%] sm:w-[540px]">
            <div className="mt-8 flex flex-col items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Jika sudah login, tampilkan Logout */}
              {session ? (
                <Button asChild>
                  <Link href="/auth/signOut">Logout</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth/signIn">Login</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

export default Navbar;
