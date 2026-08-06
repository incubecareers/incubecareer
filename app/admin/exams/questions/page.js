import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import ExamGrade from '@/models/ExamGrade'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ExamQuestionsManager from '@/components/admin/ExamQuestionsManager'

async function ensureDefaultGrades() {
  const count = await ExamGrade.countDocuments()
  if (count === 0) {
    const defaultGrades = [
      { name: '8th Grade', description: 'Questions for 8th standard students', icon: '🎒', order: 1, status: 'active' },
      { name: '9th Grade', description: 'Questions for 9th standard students', icon: '📚', order: 2, status: 'active' },
      { name: '10th Grade', description: 'Questions for 10th standard students', icon: '🎓', order: 3, status: 'active' },
      { name: '11th Grade', description: 'Questions for 11th standard students', icon: '📖', order: 4, status: 'active' },
      { name: '12th Grade', description: 'Questions for 12th standard students', icon: '🎯', order: 5, status: 'active' },
      { name: 'NEET', description: 'National Eligibility cum Entrance Test', icon: '🩺', order: 6, status: 'active' },
      { name: 'CET', description: 'Common Entrance Test', icon: '🏆', order: 7, status: 'active' },
      { name: 'JEE Main', description: 'Joint Entrance Examination', icon: '⚙️', order: 8, status: 'active' },
      { name: 'JEE Advanced', description: 'Advanced JEE for IITs', icon: '🔬', order: 9, status: 'active' },
    ]
    await ExamGrade.insertMany(defaultGrades)
  }
}

export default async function ExamQuestionsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  
  // Ensure default grades exist
  await ensureDefaultGrades()
  
  const grades = await ExamGrade.find({ status: 'active' })
    .sort({ order: 1, name: 1 })
    .lean()

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
        <h1 className="text-2xl font-bold text-brand-textPrimary">Question Bank</h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Create and manage exam questions using Grade → Subject → Chapter structure
        </p>
      </div>

      {/* Questions Manager - Note: Backend supports 3-level (gradeId/subjectId/chapterId) */}
      <ExamQuestionsManager initialSubjects={serialize(grades)} userId={session.user.id} />
    </div>
  )
}
