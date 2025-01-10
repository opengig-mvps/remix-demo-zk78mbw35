import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type BlogPostRequestBody = {
  title: string;
  content: string;
  status: string;
};

export async function PUT(
  request: Request,
  { params }: { params: { userId: string; postId: string } },
) {
  try {
    const { userId, postId } = params;
    const body: BlogPostRequestBody = await request.json();

    const { title, content, status } = body;
    if (!title || !content || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const updatedPost = await prisma.blogPost.updateMany({
      where: { id: postId, authorId: userId },
      data: {
        title,
        content,
        status,
      },
    });

    if (updatedPost.count === 0) {
      return NextResponse.json(
        { success: false, message: 'Post not found or unauthorized' },
        { status: 404 },
      );
    }

    const post = await prisma.blogPost.findUnique({
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

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post updated successfully',
        data: {
          id: post?.id,
          title: post?.title,
          content: post?.content,
          status: post?.status,
          authorId: post?.authorId,
          createdAt: post?.createdAt.toISOString(),
          updatedAt: post?.updatedAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}