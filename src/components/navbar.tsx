"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/popular", label: "Most Popular" },
  { href: "/about", label: "About" },
];

const NavItems = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => (
  <div className={`flex flex-col md:flex-row items-center gap-4 ${className}`}>
    {navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="text-gray-700 hover:text-blue-600 transition-colors"
        onClick={onClick}
      >
        {link.label}
      </Link>
    ))}
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  </div>
);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full h-20 border-b">
      <nav className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 text-2xl font-bold">
          <Image src="/masjid.png" alt="logo" width={32} height={32} />
          <span>Masjidinfo</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex">
          <NavItems />
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
            <NavItems className="mt-8" onClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

export default Navbar;
