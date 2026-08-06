import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamChapter from '@/models/ExamChapter'
import { serialize } from '@/lib/utils'

// GET /api/exams/chapters - Get chapters by subject
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId is required' }, { status: 400 })
  }

  await dbConnect()
  const chapters = await ExamChapter.find({ subjectId, status: 'active' })
    .sort({ order: 1, name: 1 })
    .lean()
  
  return NextResponse.json(serialize(chapters))
}

// POST /api/exams/chapters - Create a new chapter
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { subjectId, name, description, order } = body

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId is required' }, { status: 400 })
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Chapter name is required' }, { status: 400 })
  }

  await dbConnect()
  const chapter = await ExamChapter.create({
    subjectId,
    name: name.trim(),
    description: description?.trim() || '',
    order: order || 0,
    status: 'active',
  })

  return NextResponse.json(serialize(chapter))
}
