'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, Calendar, Clock, Users, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-red-100 text-red-800',
}

export default function ExamTestsManager({ initialSubjects, userId }) {
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, draft, active, scheduled, completed

  useEffect(() => {
    loadTests()
  }, [filter])

  async function loadTests() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      const data = await api(`/api/exams/tests?${params.toString()}`)
      setTests(data)
    } finally {
      setLoading(false)
    }
  }

  async function deleteTest(id) {
    if (!confirm('Delete this test? This cannot be undone.')) return
    await api(`/api/exams/tests/${id}`, 'DELETE')
    setTests(tests.filter(t => t._id !== id))
  }

  async function publishTest(id) {
    if (!confirm('Publish this test? Students will be able to see and attempt it.')) return
    const updated = await api(`/api/exams/tests/${id}`, 'PATCH', { status: 'active' })
    setTests(tests.map(t => t._id === id ? updated : t))
  }

  async function duplicateTest(id) {
    const updated = await api(`/api/exams/tests/${id}/duplicate`, 'POST')
    setTests([updated, ...tests])
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'draft', 'active', 'scheduled', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              filter === status
                ? 'bg-accent-gradient text-white shadow-accent'
                : 'border border-brand-border bg-white text-brand-textPrimary hover:border-brand-accent'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Create Test Button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/admin/exams/tests/create')}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Test
        </button>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-accent border-r-transparent"></div>
          <p className="mt-2 text-sm text-brand-textSecondary">Loading tests...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
          <p className="text-brand-textSecondary">
            No tests found. Create your first test!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <div key={test._id} className="rounded-xl border border-brand-border bg-white p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-brand-textPrimary">{test.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[test.status]}`}>
                      {test.status}
                    </span>
                  </div>
                  
                  {test.description && (
                    <p className="text-sm text-brand-textSecondary mb-4">{test.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-brand-textSecondary">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{test.questionIds?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{test.duration || 'No'} minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{test.attemptCount || 0} attempts</span>
                    </div>
                    {test.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(test.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {test.status === 'draft' && (
                    <button
                      onClick={() => publishTest(test._id)}
                      className="rounded-lg border border-green-600 bg-green-50 px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-100"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/admin/exams/tests/${test._id}/edit`)}
                    className="rounded-lg p-2 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => duplicateTest(test._id)}
                    className="rounded-lg p-2 text-brand-textSecondary hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTest(test._id)}
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
