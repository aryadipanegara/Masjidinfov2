"use client";

import Link from "next/link";
import { MapPinIcon } from "lucide-react";

export function MainFooter() {
  return (
    <footer className="text-black py-8 bottom-0 w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPinIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Masjid Info V2</span>
          </Link>
          <p className="text-center text-gray-400">
            Copyright © 2024 Dipaneagra All rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
