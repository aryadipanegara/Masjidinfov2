export type MetadataOptions = {
  title?: string;
  description?: string;
};

const APP_NAME = "Masjidinfo";

/**
 * Helper untuk membuat metadata dengan suffix otomatis
 */
export function createMetadata({ title, description }: MetadataOptions = {}) {
  return {
    title: title ? `${title} - ${APP_NAME}` : APP_NAME,
    description: description || "Masjidinfo - Aplikasi Masjid",
  };
}
