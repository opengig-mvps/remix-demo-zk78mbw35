import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const size = parseInt(searchParams.get('size') || '10', 10);

    const skip = (page - 1) * size;

    const totalPosts = await prisma.blogPost.count();
    const posts = await prisma.blogPost.findMany({
      skip,
      take: size,
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      authorId: post.authorId,
      author: post.author,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Blog posts retrieved successfully',
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          size,
          total: totalPosts,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}