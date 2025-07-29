export type CreatePostPayload = {
  type: "masjid" | "sejarah" | "kisah" | "ziarah" | "refleksi" | "tradisi";
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  categoryIds?: string[];
  imageIds?: string[];
  allImageConnections?: string[] | undefined;
};
