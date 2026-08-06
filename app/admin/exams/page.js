import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import ExamGrade from '@/models/ExamGrade'
import ExamQuestion from '@/models/ExamQuestion'
import ExamTest from '@/models/ExamTest'
import ExamAttempt from '@/models/ExamAttempt'
import Link from 'next/link'
import { BookOpen, FileText, ClipboardList, BarChart3 } from 'lucide-react'

const TABS = [
  {
    href: '/admin/exams/hierarchy',
    label: 'Hierarchy (Grade→Subject→Chapter)',
    icon: BookOpen,
    description: 'Manage 3-level hierarchy: Grades, Subjects, and Chapters',
  },
  {
    href: '/admin/exams/questions',
    label: 'Question Bank',
    icon: ClipboardList,
    description: 'Create and manage exam questions',
  },
  {
    href: '/admin/exams/tests',
    label: 'Tests',
    icon: FileText,
    description: 'Create tests from your question bank',
  },
  {
    href: '/admin/exams/results',
    label: 'Results & Analytics',
    icon: BarChart3,
    description: 'View student performance and analytics',
  },
]

export default async function ExamsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()

  // Fetch real counts from database
  const [subjectCount, questionCount, testCount, attemptCount] = await Promise.all([
    ExamGrade.countDocuments(),
    ExamQuestion.countDocuments({ status: { $ne: 'archived' } }),
    ExamTest.countDocuments({ status: 'active' }),
    ExamAttempt.countDocuments({ status: 'evaluated' }),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-textPrimary">Exam System</h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Create and manage exams, question banks, and track student performance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Grades</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{subjectCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5">
              <ClipboardList className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Questions</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{questionCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Active Tests</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{testCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-brand-textSecondary">Attempts</p>
              <p className="text-2xl font-bold text-brand-textPrimary">{attemptCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="group rounded-xl border border-brand-border bg-white p-6 shadow-card transition-all hover:border-brand-accent hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-brand-accentLight p-3 transition-colors group-hover:bg-accent-gradient">
                  <Icon className="h-6 w-6 text-brand-accent transition-colors group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-textPrimary group-hover:text-brand-accent">
                    {tab.label}
                  </h3>
                  <p className="mt-1 text-sm text-brand-textSecondary">
                    {tab.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Getting Started */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900">Getting Started</h3>
        <ol className="mt-3 space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>Go to Hierarchy → Create subjects and chapters under each grade</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>Go to Question Bank → Select grade and add questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>Go to Tests → Create tests by selecting questions from your bank</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            <span>Publish tests for students to attempt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">5.</span>
            <span>Track performance in Results & Analytics</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
