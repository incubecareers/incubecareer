import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import ExamTest from '@/models/ExamTest'
import ExamAttempt from '@/models/ExamAttempt'
import User from '@/models/User'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, TrendingUp, Users, Award, Clock } from 'lucide-react'

export default async function ExamResultsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()

  // Get all tests
  const tests = await ExamTest.find({})
    .sort({ createdAt: -1 })
    .select('title attemptCount avgScore totalMarks')
    .lean()

  // Get recent attempts with user details
  const recentAttempts = await ExamAttempt.find({ status: 'evaluated' })
    .sort({ submittedAt: -1 })
    .limit(20)
    .lean()

  // Get user details for attempts
  const userIds = [...new Set(recentAttempts.map(a => a.userId.toString()))]
  const users = await User.find({ _id: { $in: userIds } })
    .select('name email')
    .lean()

  const userMap = {}
  users.forEach(u => {
    userMap[u._id.toString()] = u
  })

  // Get test details
  const testMap = {}
  const testIds = [...new Set(recentAttempts.map(a => a.testId.toString()))]
  const testsForAttempts = await ExamTest.find({ _id: { $in: testIds } })
    .select('title')
    .lean()
  
  testsForAttempts.forEach(t => {
    testMap[t._id.toString()] = t
  })

  // Calculate overall stats
  const totalAttempts = await ExamAttempt.countDocuments({ status: 'evaluated' })
  const totalTests = tests.length
  const avgScoreOverall = tests.reduce((acc, t) => acc + (t.avgScore || 0), 0) / (tests.length || 1)
  const totalStudents = await User.countDocuments({ role: 'student' })

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/exams"
        className="inline-flex items-center gap-1 text-sm text-brand-textSecondary hover:text-brand-accent"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Exam System
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-textPrimary">Results & Analytics</h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Monitor student performance and test analytics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Total Attempts</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Avg Score</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{avgScoreOverall.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Active Tests</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{totalTests}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Students</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Performance */}
      <div className="rounded-xl border border-brand-border bg-white shadow-card">
        <div className="border-b border-brand-border p-6">
          <h2 className="text-lg font-semibold text-brand-textPrimary">Test Performance</h2>
        </div>
        <div className="p-6">
          {tests.length === 0 ? (
            <p className="text-center text-brand-textSecondary py-8">No tests available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border text-left">
                    <th className="pb-3 text-sm font-semibold text-brand-textSecondary">Test Name</th>
                    <th className="pb-3 text-sm font-semibold text-brand-textSecondary">Attempts</th>
                    <th className="pb-3 text-sm font-semibold text-brand-textSecondary">Avg Score</th>
                    <th className="pb-3 text-sm font-semibold text-brand-textSecondary">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test._id} className="border-b border-brand-border last:border-0">
                      <td className="py-4">
                        <p className="font-medium text-brand-textPrimary">{test.title}</p>
                      </td>
                      <td className="py-4 text-brand-textSecondary">
                        {test.attemptCount || 0}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          (test.avgScore || 0) >= 70 ? 'bg-green-100 text-green-800' :
                          (test.avgScore || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(test.avgScore || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 text-brand-textSecondary">
                        {test.totalMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="rounded-xl border border-brand-border bg-white shadow-card">
        <div className="border-b border-brand-border p-6">
          <h2 className="text-lg font-semibold text-brand-textPrimary">Recent Attempts</h2>
        </div>
        <div className="p-6">
          {recentAttempts.length === 0 ? (
            <p className="text-center text-brand-textSecondary py-8">No attempts yet</p>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => {
                const user = userMap[attempt.userId.toString()]
                const test = testMap[attempt.testId.toString()]
                
                return (
                  <div
                    key={attempt._id}
                    className="flex items-center justify-between rounded-lg border border-brand-border p-4 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          attempt.passed ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Award className={`h-5 w-5 ${
                            attempt.passed ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-brand-textPrimary">
                            {user?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-brand-textSecondary">
                            {test?.title || 'Unknown Test'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-brand-textPrimary">
                          {attempt.score}/{attempt.totalMarks}
                        </p>
                        <p className="text-xs text-brand-textSecondary">
                          {attempt.percentage}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-textSecondary">
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-brand-textSecondary">
                          {new Date(attempt.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
