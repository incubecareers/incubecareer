import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamTopic from '@/models/ExamTopic'
import { serialize } from '@/lib/utils'

// GET /api/exams/topics?subjectId=xxx - List topics for a subject
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId is required' }, { status: 400 })
  }

  await dbConnect()
  const topics = await ExamTopic.find({ subjectId })
    .sort({ order: 1, createdAt: -1 })
    .lean()
  
  return NextResponse.json(serialize(topics))
}

// POST /api/exams/topics - Create a new topic
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { subjectId, name, description, order } = body

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId is required' }, { status: 400 })
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Topic name is required' }, { status: 400 })
  }

  await dbConnect()
  const topic = await ExamTopic.create({
    subjectId,
    name: name.trim(),
    description: description?.trim() || '',
    order: order || 0,
    status: 'active',
  })

  return NextResponse.json(serialize(topic))
}
