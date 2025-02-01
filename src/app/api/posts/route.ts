import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Mendapatkan semua posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST: Membuat post baru
export async function POST(request: Request) {
  try {
    const { title, image, slug, desc, content, isFeatured, userId } =
      await request.json();

    // Validasi data
    if (!title || !slug || !content || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        image,
        slug,
        desc,
        content,
        isFeatured: isFeatured || false,
        userId,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
