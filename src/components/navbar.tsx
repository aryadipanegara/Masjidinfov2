"use client";

import { useState } from "react";
import { Button, Burger, Drawer, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [opened, { toggle, close }] = useDisclosure(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trending", label: "Trending" },
    { href: "/popular", label: "Most Popular" },
    { href: "/about", label: "About" },
  ];

  const NavItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-gray-700 hover:text-blue-600 transition-colors"
          onClick={close}
        >
          {link.label}
        </Link>
      ))}
      <Button component={Link} href="/login" radius="xl" size="md">
        Login
      </Button>
    </>
  );

  return (
    <header className="w-full h-20 border-b">
      <nav className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 text-2xl font-bold">
          <Image src="/masjid.png" alt="logo" width={32} height={32} />
          <span>Masjidinfo</span>
        </Link>

        {/* Desktop Menu */}
        <Group gap="xl" visibleFrom="md">
          <NavItems />
        </Group>

        {/* Mobile Menu */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
        <Drawer
          opened={opened}
          onClose={close}
          size="100%"
          padding="md"
          hiddenFrom="md"
          zIndex={1000}
        >
          <Stack
            align="center"
            justify="center"
            h="100%"
            className="text-center justify-center items-center gap-8 "
          >
            <NavItems />
          </Stack>
        </Drawer>
      </nav>
    </header>
  );
};

export default Navbar;
