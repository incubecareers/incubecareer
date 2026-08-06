import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamSubject from '@/models/ExamSubject'
import ExamTopic from '@/models/ExamTopic'
import ExamQuestion from '@/models/ExamQuestion'
import { serialize } from '@/lib/utils'

// GET /api/exams/subjects - List all subjects
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const subjects = await ExamSubject.find({}).sort({ order: 1, createdAt: -1 }).lean()
  
  return NextResponse.json(serialize(subjects))
}

// POST /api/exams/subjects - Create a new subject
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, icon, order } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
  }

  await dbConnect()
  const subject = await ExamSubject.create({
    name: name.trim(),
    description: description?.trim() || '',
    icon: icon || '',
    order: order || 0,
    status: 'active',
  })

  return NextResponse.json(serialize(subject))
}
