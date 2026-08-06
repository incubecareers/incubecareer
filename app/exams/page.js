import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'
import { verifyStudentToken, STUDENT_TOKEN_NAME } from '@/lib/studentJwt'
import dbConnect from '@/lib/mongodb'
import ExamTest from '@/models/ExamTest'
import ExamAttempt from '@/models/ExamAttempt'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { Clock, FileText, Calendar, CheckCircle, Trophy } from 'lucide-react'
import ShareButton from '@/components/exams/ShareButton'

export const metadata = {
  title: 'Tests - Daily Tutors',
  description: 'Take online tests and track your performance',
}

export default async function StudentExamsPage() {
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

  await dbConnect()
  
  const now = new Date()
  const tests = await ExamTest.find({
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ]
  })
    .sort({ createdAt: -1 })
    .lean()

  // Get completed attempts for this user
  const completedAttempts = userId ? await ExamAttempt.find({
    userId,
    status: 'evaluated'
  }).select('testId').lean() : []
  
  const completedTestIds = new Set(completedAttempts.map(a => a.testId.toString()))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-textPrimary">Available Tests</h1>
          <p className="mt-2 text-brand-textSecondary">
            Test your knowledge and track your progress
          </p>
        </div>

        {tests.length === 0 ? (
          <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
            <FileText className="mx-auto h-12 w-12 text-brand-textSecondary opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-brand-textPrimary">No tests available</h3>
            <p className="mt-1 text-sm text-brand-textSecondary">
              Check back later for new tests
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => {
              const isCompleted = completedTestIds.has(test._id.toString())
              return (
                <Link
                  key={test._id}
                  href={isCompleted ? `/exams/${test._id}/result` : `/exams/${test._id}`}
                  className="group rounded-xl border border-brand-border bg-white p-6 shadow-card transition-all hover:border-brand-accent hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-brand-textPrimary group-hover:text-brand-accent">
                    {test.title}
                  </h3>
                  
                  {test.description && (
                    <p className="mt-2 text-sm text-brand-textSecondary line-clamp-2">
                      {test.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                      <FileText className="h-4 w-4" />
                      <span>{test.questionIds?.length || 0} questions</span>
                    </div>
                    
                    {test.duration > 0 && (
                      <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                        <Clock className="h-4 w-4" />
                        <span>{test.duration} minutes</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                      <CheckCircle className="h-4 w-4" />
                      <span>{test.totalMarks} marks</span>
                    </div>

                    {test.startDate && (
                      <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                        <Calendar className="h-4 w-4" />
                        <span>Available from {new Date(test.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                        <Trophy className="h-4 w-4" /> View Result
                      </span>
                    ) : (
                      <span className="inline-block rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white group-hover:opacity-90">
                        Start Test →
                      </span>
                    )}
                    <ShareButton testId={test._id.toString()} title={test.title} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
