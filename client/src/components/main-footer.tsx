"use client";

import Link from "next/link";
import {
  MapPinIcon,
  MailIcon,
  TwitterIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "lucide-react";

const footerLinks = {
  explore: [
    { name: "Semua Posts", href: "/posts" },
    { name: "Masjid Bersejarah", href: "/posts?type=masjid" },
    { name: "Artikel", href: "/posts?type=artikel" },
    { name: "Peta Masjid", href: "/masjid" },
  ],
  categories: [
    { name: "Arsitektur Ottoman", href: "/posts?category=ottoman" },
    { name: "Masjid Andalusia", href: "/posts?category=andalusia" },
    { name: "Arsitektur Modern", href: "/posts?category=modern" },
    { name: "Masjid Indonesia", href: "/posts?category=indonesia" },
  ],
  company: [
    { name: "Tentang Kami", href: "/about" },
    { name: "Kontak", href: "/contact" },
    { name: "Kebijakan Privasi", href: "/privacy" },
    { name: "Syarat & Ketentuan", href: "/terms" },
  ],
};

export function MainFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Masjid Info</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Platform terlengkap untuk menjelajahi keindahan arsitektur Islam
              dan mempelajari sejarah masjid-masjid bersejarah dunia.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-4">Jelajahi</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Kategori</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Masjid Info. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="mailto:info@masjidinfo.com"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              <MailIcon className="h-4 w-4 inline mr-2" />
              info@masjidinfo.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
