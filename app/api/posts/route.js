import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET all posts
export async function GET() {
    const posts = await prisma.post.findMany();
    return NextResponse.json(posts);
}

// POST a new post
export async function POST(request) {
    const { title, content } = await request.json();
    const post = await prisma.post.create({
        data: { title, content, published: false },
    });
    return NextResponse.json(post, { status: 201 });
}
