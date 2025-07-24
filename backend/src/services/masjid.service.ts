import { prisma } from "../config/prisma.config";
import { CreateMasjidPayload } from "../types/masjid.types";

export const masjidService = {
  createMasjid: async (postId: string, data: CreateMasjidPayload) => {
    return prisma.masjid.create({
      data: {
        postId,
        namaLokal: data.namaLokal,
        alamat: data.alamat,
        kota: data.kota,
        provinsi: data.provinsi,
        negara: data.negara,
        tahunDibangun: data.tahunDibangun,
        arsitek: data.arsitek,
        gaya: data.gaya,
        mapsUrl: data.mapsUrl,
        sumberFoto: data.sumberFoto,
      },
    });
  },

  updateMasjid: async (postId: string, data: CreateMasjidPayload) => {
    return prisma.masjid.update({
      where: { postId },
      data,
    });
  },

  getMasjidByPostId: async (postId: string) => {
    return prisma.masjid.findUnique({
      where: { postId },
    });
  },

  deleteMasjid: async (postId: string) => {
    return prisma.masjid.delete({
      where: { postId },
    });
  },
};
