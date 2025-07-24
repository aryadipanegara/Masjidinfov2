export type CreateMasjidPayload = {
  namaLokal?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  negara?: string;
  tahunDibangun?: string;
  arsitek?: string;
  gaya?: string;
  mapsUrl?: string;
  sumberFoto?: string;
};

export type UpdateMasjidPayload = CreateMasjidPayload;
