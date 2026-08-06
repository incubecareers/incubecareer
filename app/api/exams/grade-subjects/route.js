import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamSubjectNew from '@/models/ExamSubjectNew'
import { serialize } from '@/lib/utils'

// GET /api/exams/grade-subjects - Get subjects by grade
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const gradeId = searchParams.get('gradeId')

  if (!gradeId) {
    return NextResponse.json({ error: 'gradeId is required' }, { status: 400 })
  }

  await dbConnect()
  const subjects = await ExamSubjectNew.find({ gradeId, status: 'active' })
    .sort({ order: 1, name: 1 })
    .lean()
  
  return NextResponse.json(serialize(subjects))
}

// POST /api/exams/grade-subjects - Create a new subject
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { gradeId, name, description, icon, order } = body

  if (!gradeId) {
    return NextResponse.json({ error: 'gradeId is required' }, { status: 400 })
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
  }

  await dbConnect()
  const subject = await ExamSubjectNew.create({
    gradeId,
    name: name.trim(),
    description: description?.trim() || '',
    icon: icon || '',
    order: order || 0,
    status: 'active',
  })

  return NextResponse.json(serialize(subject))
}
