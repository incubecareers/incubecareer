import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyStudentToken, STUDENT_TOKEN_NAME } from '@/lib/studentJwt'
import dbConnect from '@/lib/mongodb'
import ExamTest from '@/models/ExamTest'
import ExamQuestion from '@/models/ExamQuestion'
import ExamAttempt from '@/models/ExamAttempt'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Award, Home } from 'lucide-react'

export default async function TestResultPage({ params }) {
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

  if (!userId) redirect('/login')

  await dbConnect()
  
  // Get the most recent completed attempt for this user and test
  const attempt = await ExamAttempt.findOne({
    userId: userId,
    testId: params.id,
    status: 'evaluated'
  })
    .sort({ submittedAt: -1 })
    .lean()

  if (!attempt) {
    redirect(`/exams/${params.id}`)
  }

  const test = await ExamTest.findById(params.id).lean()
  const questions = await ExamQuestion.find({ _id: { $in: test.questionIds } }).lean()

  // Create a map of questions for easy lookup
  const questionMap = {}
  questions.forEach(q => {
    questionMap[q._id.toString()] = q
  })

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Result Card */}
        <div className="rounded-xl border border-brand-border bg-white p-8 shadow-card mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              attempt.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {attempt.passed ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-brand-textPrimary mb-2">
              {attempt.passed ? 'Congratulations!' : 'Test Completed'}
            </h1>
            <p className="text-brand-textSecondary">
              {attempt.passed ? 'You have passed the test' : 'Keep practicing to improve your score'}
            </p>
          </div>

          {/* Score Summary */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">Score</p>
              <p className="text-2xl font-bold text-blue-900">
                {attempt.score}/{attempt.totalMarks}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <p className="text-sm text-purple-600 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-purple-900">
                {attempt.percentage}%
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-600 mb-1">Correct</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.values(attempt.questionResults).filter(r => r.isCorrect).length}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-600 mb-1">Time Taken</p>
              <p className="text-2xl font-bold text-amber-900">
                {formatTime(attempt.timeSpent)}
              </p>
            </div>
          </div>

          {/* Test Info */}
          <div className="border-t border-brand-border pt-6 mb-6">
            <h2 className="text-xl font-bold text-brand-textPrimary mb-4">{test.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                <Award className="h-4 w-4" />
                <span>Passing Score: {test.passingMarks} marks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                <Clock className="h-4 w-4" />
                <span>Submitted: {new Date(attempt.submittedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center border-t border-brand-border pt-6">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-white px-6 py-3 text-sm font-semibold text-brand-textPrimary hover:bg-gray-50"
            >
              <Home className="h-4 w-4" />
              Back to Tests
            </Link>
            {test.showCorrectAnswers && (
              <a
                href="#answers-section"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                View Answers
              </a>
            )}
          </div>
        </div>

        {/* Detailed Answers */}
        {test.showCorrectAnswers && (
          <div id="answers-section" className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-textPrimary mb-4">Answer Review</h2>
            {questions.map((question, idx) => {
              const result = attempt.questionResults[question._id.toString()]
              const userAnswer = attempt.answers[question._id.toString()]
              
              return (
                <div
                  key={question._id}
                  className={`rounded-xl border-2 p-6 ${
                    result?.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-brand-textPrimary flex-1">
                      <span className="text-brand-textSecondary">Q{idx + 1}.</span> {question.questionText}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                      result?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  {/* Options display */}
                  {['mcq', 'multiple', 'truefalse'].includes(question.type) && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optIdx) => {
                        const isUserAnswer = Array.isArray(userAnswer) 
                          ? userAnswer.includes(optIdx) 
                          : userAnswer === optIdx
                        const isCorrect = option.isCorrect

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 rounded-lg border-2 p-3 ${
                              isCorrect ? 'border-green-500 bg-green-100' :
                              isUserAnswer ? 'border-red-500 bg-red-100' :
                              'border-gray-200 bg-white'
                            }`}
                          >
                            {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {!isCorrect && isUserAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                            <span className="text-brand-textPrimary">{option.text}</span>
                            {isUserAnswer && !isCorrect && <span className="ml-auto text-sm text-red-600">(Your answer)</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Text answer display */}
                  {['shortanswer', 'numerical'].includes(question.type) && (
                    <div className="space-y-2 mb-4">
                      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-600 mb-1">Your Answer:</p>
                        <p className="text-brand-textPrimary">{userAnswer || '(Not answered)'}</p>
                      </div>
                      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-3">
                        <p className="text-sm text-green-600 mb-1">Correct Answer:</p>
                        <p className="text-brand-textPrimary">{question.correctAnswer}</p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                      <p className="text-sm text-blue-800">{question.explanation}</p>
                    </div>
                  )}

                  {/* Marks */}
                  <div className="mt-4 text-sm text-brand-textSecondary">
                    Marks: {result?.marksObtained || 0} / {question.marks}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
