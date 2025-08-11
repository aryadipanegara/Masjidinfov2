import CreatePostForm from "@/components/create-post-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Post Baru",
  description: "Halaman untuk membuat post atau artikel baru.",
};

export default function CreatePostPage() {
  return <CreatePostForm />;
}
