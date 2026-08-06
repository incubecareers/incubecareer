import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamGrade from '@/models/ExamGrade'
import ExamSubjectNew from '@/models/ExamSubjectNew'
import { serialize } from '@/lib/utils'

// GET /api/exams/grades/:id - Get single grade
export async function GET(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const grade = await ExamGrade.findById(params.id).lean()

  if (!grade) {
    return NextResponse.json({ error: 'Grade not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(grade))
}

// PATCH /api/exams/grades/:id - Update grade
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

  const grade = await ExamGrade.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!grade) {
    return NextResponse.json({ error: 'Grade not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(grade))
}

// DELETE /api/exams/grades/:id - Delete grade
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  
  // Check if grade has subjects
  const subjectCount = await ExamSubjectNew.countDocuments({ gradeId: params.id })
  if (subjectCount > 0) {
    return NextResponse.json({ 
      error: 'Cannot delete grade with existing subjects. Delete subjects first.' 
    }, { status: 400 })
  }

  await ExamGrade.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
