import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/authOptions';

type BlogPostRequestBody = {
  title: string;
  content: string;
  status: 'draft' | 'published';
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params.userId;
    const session = await getAuthSession();

    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 },
      );
    }

    const body: BlogPostRequestBody = await request.json();
    const { title, content, status } = body;

    if (!title || !content || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        status,
        authorId: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post created successfully',
        data: {
          id: blogPost.id,
          title: blogPost.title,
          content: blogPost.content,
          status: blogPost.status,
          authorId: blogPost.authorId,
          createdAt: blogPost.createdAt.toISOString(),
          updatedAt: blogPost.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}