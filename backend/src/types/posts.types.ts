export type CreatePostPayload = {
  type: "masjid" | "artikel";
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  categoryIds?: string[];
  imageIds?: string[];
};
