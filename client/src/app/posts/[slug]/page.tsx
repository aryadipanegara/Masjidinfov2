import type { Metadata } from "next";
import { PostService } from "@/service/posts.service";
import { PostDetailContent } from "@/components/post-detail-content";
import { TopNavigationWrapper } from "@/components/reader/top-navigation-wrapper";
import { createMetadata } from "@/lib/meta-data";
import NotFound from "@/app/not-found";

interface PostDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const response = await PostService.getBySlug(slug);
    const post = response.data;

    if (!post) {
      return createMetadata({
        title: "Post Tidak Ditemukan",
        description: "Post yang Anda cari tidak dapat ditemukan.",
        noSuffix: true,
      });
    }

    return createMetadata({
      title: post.title,
      description: post.excerpt || `Baca lebih lanjut tentang ${post.title}.`,
      image: post.coverImage,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${post.slug}`,
      keywords: post.tags,
    });
  } catch (error) {
    console.error("Failed to generate metadata:", error);

    return createMetadata({
      title: "Error",
      description: "Terjadi kesalahan saat memuat metadata.",
      noSuffix: true,
    });
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;

  let postData;
  let errorFetching = false;
  try {
    const response = await PostService.getBySlug(slug);
    postData = response.data;
    if (!postData) {
      NotFound();
    }
  } catch (error) {
    console.error("Failed to fetch post:", error);
    errorFetching = true;
  }

  if (errorFetching || !postData) {
    return (
      <div className="min-h-screen bg-white">
        <TopNavigationWrapper
          title={errorFetching ? "Error" : "Memuat..."}
          subtitle={errorFetching ? "Gagal memuat post" : "Memuat konten"}
        />
        <div className="pt-20 container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-64 sm:w-80 h-80 sm:h-96 bg-gray-200 rounded-lg" />
              <div className="space-y-4 w-full max-w-md">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="flex justify-center gap-4">
                  <div className="h-10 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <PostDetailContent initialPost={postData} />;
}
