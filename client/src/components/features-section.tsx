"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPinIcon,
  BookOpenIcon,
  GlobeIcon,
  SearchIcon,
  CameraIcon,
  HistoryIcon,
} from "lucide-react";

const features = [
  {
    icon: MapPinIcon,
    title: "Peta Interaktif",
    description:
      "Jelajahi lokasi masjid-masjid bersejarah dengan peta interaktif yang mudah digunakan",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    icon: BookOpenIcon,
    title: "Artikel Mendalam",
    description:
      "Baca artikel berkualitas tinggi tentang sejarah, arsitektur, dan budaya Islam",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    icon: CameraIcon,
    title: "Galeri Foto HD",
    description:
      "Nikmati koleksi foto berkualitas tinggi dari berbagai sudut dan detail arsitektur",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  {
    icon: HistoryIcon,
    title: "Sejarah Lengkap",
    description:
      "Pelajari sejarah pembangunan, arsitek, dan perkembangan setiap masjid",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
  {
    icon: GlobeIcon,
    title: "Jangkauan Global",
    description:
      "Dokumentasi masjid dari berbagai negara dan benua di seluruh dunia",
    color: "text-teal-600",
    bgColor: "bg-teal-100 dark:bg-teal-900",
  },
  {
    icon: SearchIcon,
    title: "Pencarian Canggih",
    description:
      "Temukan masjid berdasarkan lokasi, gaya arsitektur, periode, dan kriteria lainnya",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Mengapa Memilih{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Masjid Info?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Platform terlengkap untuk menjelajahi keindahan arsitektur Islam dan
            mempelajari sejarah masjid-masjid bersejarah dunia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group border-0 shadow-md">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 lg:p-12 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Bergabunglah dengan Komunitas Kami
            </h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Ribuan orang telah mempercayai Masjid Info sebagai sumber
              informasi terpercaya tentang arsitektur Islam
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm lg:text-base opacity-90">
                Masjid Terdokumentasi
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">50+</div>
              <div className="text-sm lg:text-base opacity-90">Negara</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">10K+</div>
              <div className="text-sm lg:text-base opacity-90">
                Pembaca Aktif
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">1K+</div>
              <div className="text-sm lg:text-base opacity-90">
                Artikel Berkualitas
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
