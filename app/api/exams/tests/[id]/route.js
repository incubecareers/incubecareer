import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamTest from '@/models/ExamTest'
import { serialize } from '@/lib/utils'

// GET /api/exams/tests/:id - Get a single test
export async function GET(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const test = await ExamTest.findById(params.id).lean()

  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(test))
}

// PATCH /api/exams/tests/:id - Update a test
export async function PATCH(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await dbConnect()
  const updates = {}
  
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.description !== undefined) updates.description = body.description.trim()
  if (body.instructions !== undefined) updates.instructions = body.instructions.trim()
  if (body.questionIds !== undefined) updates.questionIds = body.questionIds
  if (body.duration !== undefined) updates.duration = body.duration
  if (body.totalMarks !== undefined) updates.totalMarks = body.totalMarks
  if (body.passingMarks !== undefined) updates.passingMarks = body.passingMarks
  if (body.shuffleQuestions !== undefined) updates.shuffleQuestions = body.shuffleQuestions
  if (body.showCorrectAnswers !== undefined) updates.showCorrectAnswers = body.showCorrectAnswers
  if (body.allowReview !== undefined) updates.allowReview = body.allowReview
  if (body.isPublic !== undefined) updates.isPublic = body.isPublic
  if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo
  if (body.startDate !== undefined) updates.startDate = body.startDate
  if (body.endDate !== undefined) updates.endDate = body.endDate
  if (body.status !== undefined) updates.status = body.status

  const test = await ExamTest.findByIdAndUpdate(
    params.id,
    updates,
    { new: true }
  ).lean()

  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 })
  }

  return NextResponse.json(serialize(test))
}

// DELETE /api/exams/tests/:id - Delete a test
export async function DELETE(req, { params }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  await ExamTest.findByIdAndDelete(params.id)

  return NextResponse.json({ ok: true })
}
