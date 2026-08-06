import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamSubject from '@/models/ExamSubject'
import ExamTopic from '@/models/ExamTopic'
import ExamQuestion from '@/models/ExamQuestion'
import { serialize } from '@/lib/utils'

// PATCH /api/exams/subjects/:id - Update a subject
export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, icon, order, status } = body

  if (name && !name.trim()) {
    return NextResponse.json({ error: 'Subject name cannot be empty' }, { status: 400 })
  }

  await dbConnect()
  const updates = {}
  if (name !== undefined) updates.name = name.trim()
  if (description !== undefined) updates.description = description.trim()
  if (icon !== undefined) updates.icon = icon
  if (order !== undefined) updates.order = order
  if (status !== undefined) updates.status = status

  const subject = await ExamSubject.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(subject))
}

// DELETE /api/exams/subjects/:id - Delete a subject and its topics
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  
  // Delete the subject and all its topics
  // Note: Questions are NOT deleted, just orphaned (subjectId remains but subject is gone)
  await Promise.all([
    ExamSubject.findByIdAndDelete(params.id),
    ExamTopic.deleteMany({ subjectId: params.id }),
  ])

  return NextResponse.json({ ok: true })
}
