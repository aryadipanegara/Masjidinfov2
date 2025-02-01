import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Cari post berdasarkan slug
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        user: true, // Include data user yang membuat post
        comments: true, // Include data komentar
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(
      { post, status: "success", message: "Post found successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post by slug" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { title, image, newSlug, desc, content, isFeatured } =
      await request.json();

    // Validasi data
    if (!title || !newSlug || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update post berdasarkan slug
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title,
        image,
        slug: newSlug,
        desc,
        content,
        isFeatured,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Hapus post berdasarkan slug
    await prisma.post.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
