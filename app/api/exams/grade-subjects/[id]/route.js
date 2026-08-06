import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamSubjectNew from '@/models/ExamSubjectNew'
import ExamChapter from '@/models/ExamChapter'
import { serialize } from '@/lib/utils'

// GET /api/exams/grade-subjects/:id - Get single subject
export async function GET(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const subject = await ExamSubjectNew.findById(params.id).lean()

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(subject))
}

// PATCH /api/exams/grade-subjects/:id - Update subject
export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await dbConnect()
  const updates = {}
  
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description.trim()
  if (body.icon !== undefined) updates.icon = body.icon
  if (body.order !== undefined) updates.order = body.order
  if (body.status !== undefined) updates.status = body.status

  const subject = await ExamSubjectNew.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(subject))
}

// DELETE /api/exams/grade-subjects/:id - Delete subject
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  
  // Check if subject has chapters
  const chapterCount = await ExamChapter.countDocuments({ subjectId: params.id })
  if (chapterCount > 0) {
    return NextResponse.json({ 
      error: 'Cannot delete subject with existing chapters. Delete chapters first.' 
    }, { status: 400 })
  }

  await ExamSubjectNew.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
