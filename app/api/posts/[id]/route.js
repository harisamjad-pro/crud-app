import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET a single post by ID
export async function GET(request, { params }) {
    const { id } = params;
    const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
    });
    return NextResponse.json(post);
}

// PUT (Update) a post by ID
export async function PUT(request, { params }) {
    const { id } = params;
    const { title, content, published } = await request.json();
    const post = await prisma.post.update({
        where: { id: parseInt(id) },
        data: { title, content, published },
    });
    return NextResponse.json(post);
}

// DELETE a post by ID
export async function DELETE(request, { params }) {
    const { id } = params;
    await prisma.post.delete({
        where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Post deleted' });
}
