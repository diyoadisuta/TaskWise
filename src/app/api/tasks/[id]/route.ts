import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// PUT: Update task
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const body = await req.json();
  const { title, description, due_date, priority, status } = body;
  const task = await prisma.task.update({
    where: { id, user_id: userId },
    data: { title, description, due_date: due_date ? new Date(due_date) : undefined, priority, status },
  });
  return NextResponse.json({ task });
}

// DELETE: Hapus task
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  await prisma.task.delete({ where: { id, user_id: userId } });
  return NextResponse.json({ success: true });
}
