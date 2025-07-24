"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, MapPinIcon, BookOpenIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20 dark:to-black/20" />

      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              >
                <MapPinIcon className="w-4 h-4 mr-2" />
                Jelajahi Keindahan Arsitektur Islam
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold tracking-tight"
              >
                <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Masjid Info
                </span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">
                  Warisan Arsitektur
                  <br />
                  Islam Dunia
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl"
              >
                Temukan keindahan dan sejarah masjid-masjid bersejarah dari
                seluruh dunia. Pelajari arsitektur, budaya, dan cerita di balik
                setiap bangunan suci yang menakjubkan.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild className="group">
                <Link href="/posts">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  Jelajahi Posts
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/masjid">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Lihat Masjid
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-600">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Masjid Terdokumentasi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                  50+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Negara
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600">
                  1000+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Artikel
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10">
              <img
                src="/placeholder.svg?height=600&width=500"
                alt="Beautiful Mosque Architecture"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -left-4 top-1/4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    Masjid Hagia Sophia
                  </div>
                  <div className="text-xs text-gray-500">Istanbul, Turkey</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="absolute -right-4 bottom-1/4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Artikel Terbaru</div>
                  <div className="text-xs text-gray-500">
                    Arsitektur Andalusia
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Background Decorations */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
