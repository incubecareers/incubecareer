import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamQuestion from '@/models/ExamQuestion'
import { serialize } from '@/lib/utils'

// GET /api/exams/questions - List questions with 3-level filters
export async function GET(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const gradeId = searchParams.get('gradeId')
  const subjectId = searchParams.get('subjectId')
  const chapterId = searchParams.get('chapterId')
  const type = searchParams.get('type')
  const difficulty = searchParams.get('difficulty')
  const search = searchParams.get('search')

  await dbConnect()
  
  const filter = { status: { $ne: 'archived' } }
  // Support both old and new structure for filtering
  if (gradeId) filter.gradeId = gradeId
  if (subjectId) {
    // Check both gradeId and subjectId fields
    filter.$or = [{ gradeId: subjectId }, { subjectId: subjectId }]
  }
  if (chapterId) filter.chapterId = chapterId
  if (type) filter.type = type
  if (difficulty) filter.difficulty = difficulty
  if (search) {
    filter.$or = [
      { questionText: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  const questions = await ExamQuestion.find(filter)
    .sort({ createdAt: -1 })
    .lean()
  
  return NextResponse.json(serialize(questions))
}

// POST /api/exams/questions - Create a new question with 3-level hierarchy
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    gradeId,
    subjectId,
    chapterId,
    type,
    questionText,
    options,
    correctAnswer,
    explanation,
    marks,
    difficulty,
    tags,
    createdBy,
  } = body

  // Support both old (subjectId as grade) and new (gradeId) structure
  const resolvedGradeId = gradeId || subjectId
  
  if (!resolvedGradeId) {
    return NextResponse.json({ error: 'gradeId is required' }, { status: 400 })
  }

  if (!questionText?.trim()) {
    return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
  }

  await dbConnect()
  const question = await ExamQuestion.create({
    gradeId: resolvedGradeId,
    subjectId: subjectId || resolvedGradeId,
    chapterId: chapterId || null,
    type: type || 'mcq',
    questionText: questionText.trim(),
    options: options || [],
    correctAnswer: correctAnswer || '',
    explanation: explanation?.trim() || '',
    marks: marks || 1,
    difficulty: difficulty || 'medium',
    tags: tags || [],
    status: 'published',
    createdBy: createdBy || session.user.id,
  })

  return NextResponse.json(serialize(question))
}
