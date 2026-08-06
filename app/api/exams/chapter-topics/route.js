import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamTopicNew from '@/models/ExamTopicNew'
import { serialize } from '@/lib/utils'

// GET /api/exams/chapter-topics?chapterId=xxx
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const chapterId = searchParams.get('chapterId')

  if (!chapterId) {
    return NextResponse.json({ error: 'chapterId is required' }, { status: 400 })
  }

  await dbConnect()
  const topics = await ExamTopicNew.find({ chapterId, status: 'active' })
    .sort({ order: 1, name: 1 })
    .lean()
  
  return NextResponse.json(serialize(topics))
}

// POST /api/exams/chapter-topics
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { chapterId, name, description, order } = body

  if (!chapterId) {
    return NextResponse.json({ error: 'chapterId is required' }, { status: 400 })
  }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Topic name is required' }, { status: 400 })
  }

  await dbConnect()
  const topic = await ExamTopicNew.create({
    chapterId,
    name: name.trim(),
    description: description?.trim() || '',
    order: order || 0,
    status: 'active',
  })

  return NextResponse.json(serialize(topic))
}
