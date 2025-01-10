import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const { postId } = params;

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!blogPost) {
      return NextResponse.json(
        { success: false, message: 'Blog post not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post retrieved successfully',
        data: {
          ...blogPost,
          createdAt: blogPost.createdAt.toISOString(),
          updatedAt: blogPost.updatedAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error retrieving blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}