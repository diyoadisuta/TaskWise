import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// Next.js 13+ API Route: gunakan context.params untuk dynamic route
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = context.params;
  const body = await req.json();
  const { title, description, due_date, priority, status } = body;
  const task = await prisma.task.update({
    where: { id, user_id: userId },
    data: { title, description, due_date: due_date ? new Date(due_date) : undefined, priority, status },
  });
  return NextResponse.json({ task });
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = context.params;
  await prisma.task.delete({ where: { id, user_id: userId } });
  return NextResponse.json({ success: true });
}
