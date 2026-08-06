import { getAdminSession } from '@/lib/admin'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import ExamGrade from '@/models/ExamGrade'
import { serialize } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function HierarchyPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await dbConnect()
  
  // Grades will be auto-created when accessed via API
  const grades = await ExamGrade.find({})
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
        <h1 className="text-2xl font-bold text-brand-textPrimary">Manage Hierarchy</h1>
        <p className="mt-1 text-sm text-brand-textSecondary">
          Grade → Subject → Chapter structure for organizing questions
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">📚 How It Works</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li><strong>Select a Grade</strong> below (8th, 9th, NEET, CET, JEE, etc.)</li>
          <li><strong>Add Subjects</strong> for that grade (Mathematics, Physics, Chemistry)</li>
          <li><strong>Add Chapters</strong> for each subject (Algebra, Mechanics, Organic Chemistry)</li>
          <li><strong>Create Questions</strong> linked to Grade → Subject → Chapter</li>
        </ol>
      </div>

      {/* Grades Grid */}
      <div>
        <h2 className="text-lg font-semibold text-brand-textPrimary mb-4">Select a Grade</h2>
        {grades.length === 0 ? (
          <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
            <p className="text-brand-textSecondary">Loading grades...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grades.map((grade) => (
              <Link
                key={grade._id}
                href={`/admin/exams/hierarchy/${grade._id}`}
                className="group rounded-xl border border-brand-border bg-white p-6 shadow-card transition-all hover:border-brand-accent hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{grade.icon || '📚'}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-textPrimary group-hover:text-brand-accent">
                        {grade.name}
                      </h3>
                      {grade.description && (
                        <p className="text-sm text-brand-textSecondary mt-1">
                          {grade.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-textSecondary group-hover:text-brand-accent" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
