'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, BookOpen } from 'lucide-react'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export default function GradeSubjectsPage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.gradeId

  const [grade, setGrade] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [subjectName, setSubjectName] = useState('')
  const [subjectDesc, setSubjectDesc] = useState('')

  useEffect(() => {
    loadData()
  }, [gradeId])

  async function loadData() {
    setLoading(true)
    try {
      const [gradeData, subjectsData] = await Promise.all([
        api(`/api/exams/grades/${gradeId}`),
        api(`/api/exams/grade-subjects?gradeId=${gradeId}`)
      ])
      setGrade(gradeData)
      setSubjects(subjectsData)
    } finally {
      setLoading(false)
    }
  }

  async function saveSubject() {
    if (!subjectName.trim()) return alert('Subject name is required')

    if (editingSubject) {
      const updated = await api(`/api/exams/grade-subjects/${editingSubject._id}`, 'PATCH', {
        name: subjectName,
        description: subjectDesc,
      })
      setSubjects(subjects.map(s => s._id === editingSubject._id ? updated : s))
    } else {
      const created = await api('/api/exams/grade-subjects', 'POST', {
        gradeId,
        name: subjectName,
        description: subjectDesc,
      })
      setSubjects([...subjects, created])
    }
    resetForm()
  }

  function resetForm() {
    setShowForm(false)
    setEditingSubject(null)
    setSubjectName('')
    setSubjectDesc('')
  }

  function editSubject(subject) {
    setEditingSubject(subject)
    setSubjectName(subject.name)
    setSubjectDesc(subject.description || '')
    setShowForm(true)
  }

  async function deleteSubject(id) {
    if (!confirm('Delete this subject? You must delete its chapters first.')) return
    try {
      await api(`/api/exams/grade-subjects/${id}`, 'DELETE')
      setSubjects(subjects.filter(s => s._id !== id))
    } catch {
      alert('Cannot delete subject with existing chapters. Delete chapters first.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-accent border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/exams/hierarchy"
        className="inline-flex items-center gap-1 text-sm text-brand-textSecondary hover:text-brand-accent"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Grades
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-textPrimary">
            {grade?.icon} {grade?.name} - Subjects
          </h1>
          <p className="mt-1 text-sm text-brand-textSecondary">
            Add and manage subjects for {grade?.name}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-textPrimary">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm focus:border-brand-accent focus:outline-none"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">
                  Description
                </label>
                <textarea
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm focus:border-brand-accent focus:outline-none"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={saveSubject}
                className="flex-1 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {editingSubject ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
          <BookOpen className="mx-auto h-12 w-12 text-brand-textSecondary opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-brand-textPrimary">No subjects yet</h3>
          <p className="mt-1 text-sm text-brand-textSecondary">
            Add subjects like Mathematics, Physics, Chemistry for {grade?.name}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="rounded-xl border border-brand-border bg-white p-5 shadow-card hover:border-brand-accent transition-all"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/admin/exams/hierarchy/${gradeId}/${subject._id}`}
                  className="flex items-center gap-3 flex-1 group"
                >
                  <BookOpen className="h-5 w-5 text-brand-accent" />
                  <div>
                    <h3 className="font-semibold text-brand-textPrimary group-hover:text-brand-accent">
                      {subject.name}
                    </h3>
                    {subject.description && (
                      <p className="text-sm text-brand-textSecondary">{subject.description}</p>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/exams/hierarchy/${gradeId}/${subject._id}`}
                    className="rounded-lg bg-brand-accentLight px-3 py-1.5 text-xs font-semibold text-brand-accent hover:bg-brand-accent hover:text-white"
                  >
                    Chapters →
                  </Link>
                  <button
                    onClick={() => editSubject(subject)}
                    className="rounded-lg p-2 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSubject(subject._id)}
                    className="rounded-lg p-2 text-brand-textSecondary hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
