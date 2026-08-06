'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export default function ExamSubjectsManager({ initialSubjects }) {
  const [subjects, setSubjects] = useState(initialSubjects || [])
  const [topics, setTopics] = useState({}) // { subjectId: [topics] }
  const [expandedSubjects, setExpandedSubjects] = useState(new Set())
  
  // Subject form state
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [subjectName, setSubjectName] = useState('')
  const [subjectDesc, setSubjectDesc] = useState('')
  
  // Topic form state
  const [showTopicForm, setShowTopicForm] = useState(null) // subjectId or null
  const [editingTopic, setEditingTopic] = useState(null)
  const [topicName, setTopicName] = useState('')
  const [topicDesc, setTopicDesc] = useState('')

  // Load topics for a subject
  async function loadTopics(subjectId) {
    if (topics[subjectId]) return // already loaded
    const data = await api(`/api/exams/topics?subjectId=${subjectId}`)
    setTopics(prev => ({ ...prev, [subjectId]: data }))
  }

  // Toggle subject expansion
  async function toggleSubject(subjectId) {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
      await loadTopics(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  // Subject CRUD
  async function saveSubject() {
    if (!subjectName.trim()) return alert('Subject name is required')
    
    if (editingSubject) {
      const updated = await api(`/api/exams/subjects/${editingSubject._id}`, 'PATCH', {
        name: subjectName,
        description: subjectDesc,
      })
      setSubjects(subjects.map(s => s._id === editingSubject._id ? updated : s))
    } else {
      const created = await api('/api/exams/subjects', 'POST', {
        name: subjectName,
        description: subjectDesc,
      })
      setSubjects([...subjects, created])
    }
    
    resetSubjectForm()
  }

  function resetSubjectForm() {
    setShowSubjectForm(false)
    setEditingSubject(null)
    setSubjectName('')
    setSubjectDesc('')
  }

  function editSubject(subject) {
    setEditingSubject(subject)
    setSubjectName(subject.name)
    setSubjectDesc(subject.description || '')
    setShowSubjectForm(true)
  }

  async function deleteSubject(id) {
    if (!confirm('Delete this subject and all its topics? This will not delete questions.')) return
    await api(`/api/exams/subjects/${id}`, 'DELETE')
    setSubjects(subjects.filter(s => s._id !== id))
    // Also remove from topics cache
    const newTopics = { ...topics }
    delete newTopics[id]
    setTopics(newTopics)
  }

  // Topic CRUD
  async function saveTopic(subjectId) {
    if (!topicName.trim()) return alert('Topic name is required')
    
    if (editingTopic) {
      const updated = await api(`/api/exams/topics/${editingTopic._id}`, 'PATCH', {
        name: topicName,
        description: topicDesc,
      })
      setTopics(prev => ({
        ...prev,
        [subjectId]: prev[subjectId].map(t => t._id === editingTopic._id ? updated : t)
      }))
    } else {
      const created = await api('/api/exams/topics', 'POST', {
        subjectId,
        name: topicName,
        description: topicDesc,
      })
      setTopics(prev => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), created]
      }))
    }
    
    resetTopicForm()
  }

  function resetTopicForm() {
    setShowTopicForm(null)
    setEditingTopic(null)
    setTopicName('')
    setTopicDesc('')
  }

  function editTopic(topic, subjectId) {
    setEditingTopic(topic)
    setTopicName(topic.name)
    setTopicDesc(topic.description || '')
    setShowTopicForm(subjectId)
  }

  async function deleteTopic(id, subjectId) {
    if (!confirm('Delete this topic? Questions will not be deleted.')) return
    await api(`/api/exams/topics/${id}`, 'DELETE')
    setTopics(prev => ({
      ...prev,
      [subjectId]: prev[subjectId].filter(t => t._id !== id)
    }))
  }

  return (
    <div className="space-y-4">
      {/* Add Subject Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSubjectForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {/* Subject Form Modal */}
      {showSubjectForm && (
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
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">
                  Description
                </label>
                <textarea
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  rows={3}
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
                onClick={resetSubjectForm}
                className="flex-1 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-textPrimary">
              {editingTopic ? 'Edit Topic' : 'Add Topic'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">
                  Topic Name *
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm focus:border-brand-accent focus:outline-none"
                  placeholder="e.g., Algebra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">
                  Description
                </label>
                <textarea
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm focus:border-brand-accent focus:outline-none"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => saveTopic(showTopicForm)}
                className="flex-1 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {editingTopic ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetTopicForm}
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
            Create your first subject to start building your question bank
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div key={subject._id} className="rounded-xl border border-brand-border bg-white shadow-card">
              {/* Subject Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleSubject(subject._id)}
                    className="text-brand-textSecondary hover:text-brand-accent"
                  >
                    {expandedSubjects.has(subject._id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  <BookOpen className="h-5 w-5 text-brand-accent" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-textPrimary">{subject.name}</h3>
                    {subject.description && (
                      <p className="text-sm text-brand-textSecondary">{subject.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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

              {/* Topics (when expanded) */}
              {expandedSubjects.has(subject._id) && (
                <div className="border-t border-brand-border bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-brand-textPrimary">Topics</h4>
                    <button
                      onClick={() => setShowTopicForm(subject._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-textPrimary hover:border-brand-accent"
                    >
                      <Plus className="h-3 w-3" />
                      Add Topic
                    </button>
                  </div>
                  
                  {!topics[subject._id] || topics[subject._id].length === 0 ? (
                    <p className="text-sm text-brand-textSecondary italic">No topics yet</p>
                  ) : (
                    <div className="space-y-2">
                      {topics[subject._id].map((topic) => (
                        <div
                          key={topic._id}
                          className="flex items-center justify-between rounded-lg border border-brand-border bg-white p-3"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="h-4 w-4 text-brand-textSecondary" />
                            <div>
                              <p className="text-sm font-medium text-brand-textPrimary">{topic.name}</p>
                              {topic.description && (
                                <p className="text-xs text-brand-textSecondary">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => editTopic(topic, subject._id)}
                              className="rounded p-1.5 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTopic(topic._id, subject._id)}
                              className="rounded p-1.5 text-brand-textSecondary hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
