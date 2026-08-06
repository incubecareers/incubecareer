import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamQuestion from '@/models/ExamQuestion'
import { serialize } from '@/lib/utils'

// PATCH /api/exams/questions/:id - Update a question
export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await dbConnect()
  const updates = {}
  
  if (body.subjectId !== undefined) updates.subjectId = body.subjectId
  if (body.topicId !== undefined) updates.topicId = body.topicId || null
  if (body.type !== undefined) updates.type = body.type
  if (body.questionText !== undefined) updates.questionText = body.questionText.trim()
  if (body.options !== undefined) updates.options = body.options
  if (body.correctAnswer !== undefined) updates.correctAnswer = body.correctAnswer
  if (body.explanation !== undefined) updates.explanation = body.explanation.trim()
  if (body.marks !== undefined) updates.marks = body.marks
  if (body.difficulty !== undefined) updates.difficulty = body.difficulty
  if (body.tags !== undefined) updates.tags = body.tags
  if (body.status !== undefined) updates.status = body.status

  const question = await ExamQuestion.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(question))
}

// DELETE /api/exams/questions/:id - Delete a question
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  await ExamQuestion.findByIdAndDelete(params.id)

  return NextResponse.json({ ok: true })
}
