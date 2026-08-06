import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import ExamTestsManager from '@/components/admin/ExamTestsManager'
import dbConnect from '@/lib/mongodb'
import ExamSubject from '@/models/ExamSubject'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ExamTestsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  const subjects = await ExamSubject.find({ status: 'active' })
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
        <h1 className="text-2xl font-bold text-brand-textPrimary">Tests</h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Create and manage tests from your question bank
        </p>
      </div>

      {/* Tests Manager */}
      <ExamTestsManager initialSubjects={serialize(subjects)} userId={session.user.id} />
    </div>
  )
}
