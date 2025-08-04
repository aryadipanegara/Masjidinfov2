"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeftIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center dark:bg-gray-900">
      <div className="max-w-md space-y-6">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-50">
          404
        </h1>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Halaman Tidak Ditemukan
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin Anda
          salah mengetik URL, atau halaman tersebut telah dipindahkan.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto bg-transparent"
          >
            <Link href="#" onClick={() => window.history.back()}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
