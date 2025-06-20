import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Ambil semua tugas user (dengan filter & sort)
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  const where: any = { user_id: userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { [sort]: order },
  });
  return NextResponse.json({ tasks });
}

// POST: Tambah tugas baru
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { title, description, due_date, priority } = body;
  if (!title) return NextResponse.json({ error: 'Judul wajib diisi.' }, { status: 400 });
  const task = await prisma.task.create({
    data: {
      user_id: userId,
      title,
      description,
      due_date: due_date ? new Date(due_date) : undefined,
      priority,
    },
  });
  return NextResponse.json({ task });
}
