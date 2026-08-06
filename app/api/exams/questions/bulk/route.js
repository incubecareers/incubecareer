import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import dbConnect from '@/lib/mongodb'
import ExamQuestion from '@/models/ExamQuestion'
import { serialize } from '@/lib/utils'

// POST /api/exams/questions/bulk - Bulk insert questions
export async function POST(req) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { gradeId, subjectId, chapterId, type, difficulty, questions } = body

  if (!gradeId || !subjectId) {
    return NextResponse.json({ error: 'gradeId and subjectId are required' }, { status: 400 })
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'questions array is required' }, { status: 400 })
  }

  await dbConnect()

  const results = []
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    try {
      // Validate required fields
      if (!q.questionText?.trim()) {
        results.push({
          row: i + 1,
          success: false,
          error: 'Question text is required',
        })
        continue
      }

      // Create question
      const question = await ExamQuestion.create({
        gradeId,
        subjectId,
        chapterId: chapterId || null,
        type: type || 'mcq',
        questionText: q.questionText.trim(),
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation?.trim() || '',
        marks: q.marks || 1,
        difficulty: difficulty || 'medium',
        tags: q.tags || [],
        status: 'published',
        createdBy: session.user.id,
      })

      results.push({
        row: i + 1,
        success: true,
        id: question._id,
      })
    } catch (error) {
      results.push({
        row: i + 1,
        success: false,
        error: error.message,
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  return NextResponse.json({
    success: true,
    total: questions.length,
    successCount,
    failureCount,
    results,
  })
}
