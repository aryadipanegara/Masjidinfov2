import supabase from "./supabase";
import { randomUUID } from "crypto";

export const uploadImageToSupabase = async (
  fileBuffer: Buffer,
  mimetype: string,
  originalName: string
) => {
  const filename = `${Date.now()}-${randomUUID()}-${originalName}`;
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .upload(filename, fileBuffer, {
      contentType: mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
    filename,
  };
};
