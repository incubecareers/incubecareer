import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamTest from '@/models/ExamTest'
import { serialize } from '@/lib/utils'

// GET /api/exams/tests - List all tests
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  await dbConnect()
  
  const filter = {}
  if (status) filter.status = status

  const tests = await ExamTest.find(filter)
    .sort({ createdAt: -1 })
    .lean()
  
  return NextResponse.json(serialize(tests))
}

// POST /api/exams/tests - Create a new test
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    title,
    description,
    instructions,
    questionIds,
    duration,
    totalMarks,
    passingMarks,
    shuffleQuestions,
    showCorrectAnswers,
    allowReview,
    isPublic,
    assignedTo,
    startDate,
    endDate,
  } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Test title is required' }, { status: 400 })
  }

  await dbConnect()
  const test = await ExamTest.create({
    title: title.trim(),
    description: description?.trim() || '',
    instructions: instructions?.trim() || '',
    questionIds: questionIds || [],
    duration: duration || 60,
    totalMarks: totalMarks || 0,
    passingMarks: passingMarks || 0,
    shuffleQuestions: shuffleQuestions || false,
    showCorrectAnswers: showCorrectAnswers !== false,
    allowReview: allowReview !== false,
    isPublic: isPublic || false,
    assignedTo: assignedTo || [],
    startDate: startDate || null,
    endDate: endDate || null,
    status: 'draft',
    createdBy: session.user.id,
    attemptCount: 0,
    avgScore: 0,
  })

  return NextResponse.json(serialize(test))
}
