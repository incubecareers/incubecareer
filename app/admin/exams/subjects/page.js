import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import ExamSubjectsManager from '@/components/admin/ExamSubjectsManager'
import dbConnect from '@/lib/mongodb'
import ExamSubject from '@/models/ExamSubject'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

async function ensureDefaultSubjects() {
  const count = await ExamSubject.countDocuments()
  if (count === 0) {
    // Auto-create default subjects
    const defaultSubjects = [
      { name: '8th Grade', description: 'Questions for 8th standard students', icon: '🎒', order: 1, status: 'active' },
      { name: '9th Grade', description: 'Questions for 9th standard students', icon: '📚', order: 2, status: 'active' },
      { name: '10th Grade', description: 'Questions for 10th standard students (Board Exams)', icon: '🎓', order: 3, status: 'active' },
      { name: '11th Grade', description: 'Questions for 11th standard students', icon: '📖', order: 4, status: 'active' },
      { name: '12th Grade', description: 'Questions for 12th standard students (Board Exams)', icon: '🎯', order: 5, status: 'active' },
      { name: 'NEET', description: 'National Eligibility cum Entrance Test for Medical', icon: '🩺', order: 6, status: 'active' },
      { name: 'CET', description: 'Common Entrance Test', icon: '🏆', order: 7, status: 'active' },
      { name: 'JEE Main', description: 'Joint Entrance Examination for Engineering', icon: '⚙️', order: 8, status: 'active' },
      { name: 'JEE Advanced', description: 'Advanced JEE for IITs', icon: '🔬', order: 9, status: 'active' },
    ]
    await ExamSubject.insertMany(defaultSubjects)
  }
}

export default async function ExamSubjectsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  
  // Ensure default subjects exist on first load
  await ensureDefaultSubjects()
  
  const subjects = await ExamSubject.find({}).sort({ order: 1, createdAt: -1 }).lean()

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
        <h1 className="text-2xl font-bold text-brand-textPrimary">Subjects & Topics</h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Select a subject below and add topics for organizing your questions
        </p>
      </div>

      {/* Subjects Manager */}
      <ExamSubjectsManager initialSubjects={serialize(subjects)} />
    </div>
  )
}
