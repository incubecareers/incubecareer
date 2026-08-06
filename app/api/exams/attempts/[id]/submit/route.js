import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'
import { verifyStudentToken, STUDENT_TOKEN_NAME } from '@/lib/studentJwt'
import dbConnect from '@/lib/mongodb'
import ExamAttempt from '@/models/ExamAttempt'
import ExamQuestion from '@/models/ExamQuestion'
import ExamTest from '@/models/ExamTest'
import { serialize } from '@/lib/utils'

// Auto-grade function
function gradeQuestion(question, answer) {
  let isCorrect = false
  let marksObtained = 0

  if (question.type === 'mcq' || question.type === 'truefalse') {
    const correctOption = question.options.findIndex(o => o.isCorrect)
    isCorrect = answer === correctOption
    marksObtained = isCorrect ? question.marks : 0
  } else if (question.type === 'multiple') {
    const correctIndices = question.options
      .map((o, idx) => o.isCorrect ? idx : -1)
      .filter(idx => idx !== -1)
    const userAnswer = Array.isArray(answer) ? answer.sort() : []
    isCorrect = JSON.stringify(correctIndices.sort()) === JSON.stringify(userAnswer)
    marksObtained = isCorrect ? question.marks : 0
  } else if (question.type === 'numerical' || question.type === 'shortanswer') {
    const correctAnswer = question.correctAnswer.toLowerCase().trim()
    const userAnswer = String(answer || '').toLowerCase().trim()
    isCorrect = correctAnswer === userAnswer
    marksObtained = isCorrect ? question.marks : 0
  }

  return { isCorrect, marksObtained, marksTotal: question.marks }
}

// POST /api/exams/attempts/:id/submit - Submit and grade test
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  let userId = session?.user?.id

  if (!userId) {
    const cookieStore = cookies()
    const studentToken = cookieStore.get(STUDENT_TOKEN_NAME)?.value
    if (studentToken) {
      const verified = await verifyStudentToken(studentToken)
      if (verified.valid) userId = verified.payload.userId
    }
  }

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { answers, timeSpent } = body

  await dbConnect()

  // Get the attempt
  const attempt = await ExamAttempt.findById(params.id)
  if (!attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }

  // Check if user owns this attempt
  if (attempt.userId.toString() !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Check if already submitted
  if (attempt.status === 'submitted' || attempt.status === 'evaluated') {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
  }

  // Get test and questions
  const test = await ExamTest.findById(attempt.testId)
  const questions = await ExamQuestion.find({ _id: { $in: test.questionIds } })

  // Grade each question
  const questionResults = {}
  let totalScore = 0
  let totalMarks = 0

  for (const question of questions) {
    const answer = answers[question._id.toString()]
    const result = gradeQuestion(question, answer)
    questionResults[question._id.toString()] = result
    totalScore += result.marksObtained
    totalMarks += result.marksTotal
  }

  const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0
  const passed = percentage >= ((test.passingMarks / test.totalMarks) * 100)

  // Update attempt
  attempt.answers = answers
  attempt.questionResults = questionResults
  attempt.score = totalScore
  attempt.totalMarks = totalMarks
  attempt.percentage = Math.round(percentage * 100) / 100
  attempt.passed = passed
  attempt.submittedAt = new Date()
  attempt.timeSpent = timeSpent || 0
  attempt.status = 'evaluated'
  await attempt.save()

  // Update test statistics
  test.attemptCount = (test.attemptCount || 0) + 1
  const avgScore = ((test.avgScore || 0) * (test.attemptCount - 1) + percentage) / test.attemptCount
  test.avgScore = Math.round(avgScore * 100) / 100
  await test.save()

  return NextResponse.json(serialize(attempt))
}
