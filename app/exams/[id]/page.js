import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import ExamTest from '@/models/ExamTest'
import ExamQuestion from '@/models/ExamQuestion'
import ExamAttempt from '@/models/ExamAttempt'
import { serialize } from '@/lib/utils'
import { verifyStudentToken, STUDENT_TOKEN_NAME } from '@/lib/studentJwt'
import TestTakingInterface from '@/components/exams/TestTakingInterface'

export default async function TakeTestPage({ params }) {
  // Get user from next-auth session OR student JWT token
  const session = await getServerSession(authOptions)
  let userId = session?.user?.id

  if (!userId) {
    const cookieStore = cookies()
    const studentToken = cookieStore.get(STUDENT_TOKEN_NAME)?.value
    if (studentToken) {
      const verified = await verifyStudentToken(studentToken)
      if (verified.valid) {
        userId = verified.payload.userId
      }
    }
  }

  if (!userId) {
    redirect('/login')
  }

  await dbConnect()
  
  // Get test details
  const test = await ExamTest.findById(params.id).lean()
  
  if (!test) {
    redirect('/exams')
  }

  // Check if test is accessible - allow both active and draft status
  const now = new Date()
  const isAccessible = 
    (!test.startDate || new Date(test.startDate) <= now) &&
    (!test.endDate || new Date(test.endDate) >= now)

  if (!isAccessible) {
    redirect('/exams')
  }

  // Check if user already completed this test
  const completedAttempt = await ExamAttempt.findOne({
    userId: userId,
    testId: params.id,
    status: 'evaluated'
  }).lean()

  if (completedAttempt) {
    redirect(`/exams/${params.id}/result`)
  }

  // Check if user has already attempted (in-progress)
  const existingAttempt = await ExamAttempt.findOne({
    userId: userId,
    testId: params.id,
    status: 'in-progress'
  }).lean()

  // Get questions
  const questions = await ExamQuestion.find({
    _id: { $in: test.questionIds }
  }).lean()

  // Create new attempt if none exists
  let attempt = existingAttempt
  if (!attempt) {
    attempt = await ExamAttempt.create({
      userId: userId,
      testId: params.id,
      startedAt: new Date(),
      answers: {},
      status: 'in-progress',
      totalMarks: test.totalMarks,
    })
    attempt = attempt.toObject()
  }

  return (
    <TestTakingInterface
      test={serialize(test)}
      questions={serialize(questions)}
      attempt={serialize(attempt)}
      userId={userId}
    />
  )
}
