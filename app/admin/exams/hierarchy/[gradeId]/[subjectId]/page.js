'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, ChevronRight, Plus, Edit2, Trash2, FileText, Tag } from 'lucide-react'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export default function SubjectChaptersPage() {
  const params = useParams()
  const { gradeId, subjectId } = params

  const [grade, setGrade] = useState(null)
  const [subject, setSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Chapter form
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [chapterName, setChapterName] = useState('')
  const [chapterDesc, setChapterDesc] = useState('')

  // Topic state
  const [expandedChapters, setExpandedChapters] = useState(new Set())
  const [topicsMap, setTopicsMap] = useState({}) // { chapterId: [topics] }
  const [showTopicForm, setShowTopicForm] = useState(null) // chapterId or null
  const [editingTopic, setEditingTopic] = useState(null)
  const [topicName, setTopicName] = useState('')
  const [topicDesc, setTopicDesc] = useState('')

  useEffect(() => { loadData() }, [gradeId, subjectId])

  async function loadData() {
    setLoading(true)
    try {
      const [gradeData, subjectData, chaptersData] = await Promise.all([
        api(`/api/exams/grades/${gradeId}`),
        api(`/api/exams/grade-subjects/${subjectId}`),
        api(`/api/exams/chapters?subjectId=${subjectId}`)
      ])
      setGrade(gradeData)
      setSubject(subjectData)
      setChapters(chaptersData)
    } finally { setLoading(false) }
  }

  // Chapter CRUD
  async function saveChapter() {
    if (!chapterName.trim()) return alert('Chapter name is required')
    if (editingChapter) {
      const updated = await api(`/api/exams/chapters/${editingChapter._id}`, 'PATCH', { name: chapterName, description: chapterDesc })
      setChapters(chapters.map(c => c._id === editingChapter._id ? updated : c))
    } else {
      const created = await api('/api/exams/chapters', 'POST', { subjectId, name: chapterName, description: chapterDesc })
      setChapters([...chapters, created])
    }
    resetChapterForm()
  }

  function resetChapterForm() { setShowChapterForm(false); setEditingChapter(null); setChapterName(''); setChapterDesc('') }

  function editChapter(chapter) { setEditingChapter(chapter); setChapterName(chapter.name); setChapterDesc(chapter.description || ''); setShowChapterForm(true) }

  async function deleteChapter(id) {
    if (!confirm('Delete this chapter and all its topics?')) return
    await api(`/api/exams/chapters/${id}`, 'DELETE')
    setChapters(chapters.filter(c => c._id !== id))
  }

  // Topic CRUD
  async function loadTopics(chapterId) {
    if (topicsMap[chapterId]) return
    const data = await api(`/api/exams/chapter-topics?chapterId=${chapterId}`)
    setTopicsMap(prev => ({ ...prev, [chapterId]: data }))
  }

  function toggleChapter(chapterId) {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
      loadTopics(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  async function saveTopic(chapterId) {
    if (!topicName.trim()) return alert('Topic name is required')
    if (editingTopic) {
      const updated = await api(`/api/exams/chapter-topics/${editingTopic._id}`, 'PATCH', { name: topicName, description: topicDesc })
      setTopicsMap(prev => ({ ...prev, [chapterId]: prev[chapterId].map(t => t._id === editingTopic._id ? updated : t) }))
    } else {
      const created = await api('/api/exams/chapter-topics', 'POST', { chapterId, name: topicName, description: topicDesc })
      setTopicsMap(prev => ({ ...prev, [chapterId]: [...(prev[chapterId] || []), created] }))
    }
    resetTopicForm()
  }

  function resetTopicForm() { setShowTopicForm(null); setEditingTopic(null); setTopicName(''); setTopicDesc('') }

  function editTopic(topic, chapterId) { setEditingTopic(topic); setTopicName(topic.name); setTopicDesc(topic.description || ''); setShowTopicForm(chapterId) }

  async function deleteTopic(id, chapterId) {
    if (!confirm('Delete this topic?')) return
    await api(`/api/exams/chapter-topics/${id}`, 'DELETE')
    setTopicsMap(prev => ({ ...prev, [chapterId]: prev[chapterId].filter(t => t._id !== id) }))
  }

  if (loading) {
    return <div className="text-center py-12"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-accent border-r-transparent"></div></div>
  }

  return (
    <div className="space-y-6">
      <Link href={`/admin/exams/hierarchy/${gradeId}`} className="inline-flex items-center gap-1 text-sm text-brand-textSecondary hover:text-brand-accent">
        <ChevronLeft className="h-4 w-4" /> Back to Subjects
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-textPrimary">{grade?.icon} {grade?.name} → {subject?.name} - Chapters & Topics</h1>
          <p className="mt-1 text-sm text-brand-textSecondary">Add chapters and topics for {subject?.name}. Click on a chapter to expand and manage its topics.</p>
        </div>
        <button onClick={() => setShowChapterForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Chapter
        </button>
      </div>

      {/* Chapter Form Modal */}
      {showChapterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-textPrimary">{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">Chapter Name *</label>
                <input type="text" value={chapterName} onChange={(e) => setChapterName(e.target.value)} className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm" placeholder="e.g., Algebra, Mechanics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">Description</label>
                <textarea value={chapterDesc} onChange={(e) => setChapterDesc(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm" placeholder="Optional" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={saveChapter} className="flex-1 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white">{editingChapter ? 'Update' : 'Create'}</button>
              <button onClick={resetChapterForm} className="flex-1 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-textPrimary">{editingTopic ? 'Edit Topic' : 'Add Topic'}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">Topic Name *</label>
                <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm" placeholder="e.g., Linear Equations, Quadratic Equations" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary">Description</label>
                <textarea value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm" placeholder="Optional" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => saveTopic(showTopicForm)} className="flex-1 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white">{editingTopic ? 'Update' : 'Create'}</button>
              <button onClick={resetTopicForm} className="flex-1 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-textPrimary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Chapters & Topics List */}
      {chapters.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
          <FileText className="mx-auto h-12 w-12 text-brand-textSecondary opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-brand-textPrimary">No chapters yet</h3>
          <p className="mt-1 text-sm text-brand-textSecondary">Add chapters for {subject?.name} (e.g., Algebra, Trigonometry, Calculus)</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="rounded-xl border border-brand-border bg-white shadow-card overflow-hidden">
              {/* Chapter Header */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleChapter(chapter._id)}>
                  {expandedChapters.has(chapter._id) ? <ChevronDown className="h-5 w-5 text-brand-accent" /> : <ChevronRight className="h-5 w-5 text-brand-textSecondary" />}
                  <FileText className="h-5 w-5 text-brand-accent" />
                  <div>
                    <h3 className="font-semibold text-brand-textPrimary">{chapter.name}</h3>
                    {chapter.description && <p className="text-sm text-brand-textSecondary">{chapter.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => editChapter(chapter)} className="rounded-lg p-2 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteChapter(chapter._id)} className="rounded-lg p-2 text-brand-textSecondary hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Topics Section (Expandable) */}
              {expandedChapters.has(chapter._id) && (
                <div className="border-t border-brand-border bg-gray-50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-brand-textPrimary flex items-center gap-2">
                      <Tag className="h-4 w-4 text-brand-accent" /> Topics
                    </h4>
                    <button onClick={() => setShowTopicForm(chapter._id)} className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-textPrimary hover:border-brand-accent">
                      <Plus className="h-3 w-3" /> Add Topic
                    </button>
                  </div>

                  {!topicsMap[chapter._id] || topicsMap[chapter._id].length === 0 ? (
                    <p className="text-sm text-brand-textSecondary italic">No topics yet. Add topics like &quot;Linear Equations&quot;, &quot;Quadratic Equations&quot;, etc.</p>
                  ) : (
                    <div className="space-y-2">
                      {topicsMap[chapter._id].map((topic) => (
                        <div key={topic._id} className="flex items-center justify-between rounded-lg border border-brand-border bg-white p-3">
                          <div className="flex items-center gap-2 flex-1">
                            <Tag className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-brand-textPrimary">{topic.name}</p>
                              {topic.description && <p className="text-xs text-brand-textSecondary">{topic.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => editTopic(topic, chapter._id)} className="rounded p-1.5 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteTopic(topic._id, chapter._id)} className="rounded p-1.5 text-brand-textSecondary hover:bg-red-50 hover:text-red-600">
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
