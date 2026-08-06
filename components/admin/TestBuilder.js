'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, X, Check, ChevronLeft, Save } from 'lucide-react'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export default function TestBuilder({ initialSubjects, userId }) {
  const router = useRouter()
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [topics, setTopics] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form states
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    instructions: '',
    duration: 60,
    passingMarks: 0,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    allowReview: true,
    isPublic: false,
  })

  // Load grades on mount
  useEffect(() => {
    async function fetchGrades() {
      try {
        const data = await api('/api/exams/grades')
        setGrades(data)
      } catch (e) { console.error(e) }
    }
    fetchGrades()
  }, [])

  // Load subjects when grade changes
  useEffect(() => {
    if (selectedGrade) {
      setSelectedSubject(null)
      setSelectedChapter(null)
      setSelectedTopic(null)
      setSubjects([])
      setChapters([])
      setTopics([])
      api(`/api/exams/grade-subjects?gradeId=${selectedGrade._id}`).then(setSubjects).catch(console.error)
    }
  }, [selectedGrade])

  // Load chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      setSelectedChapter(null)
      setSelectedTopic(null)
      setChapters([])
      setTopics([])
      api(`/api/exams/chapters?subjectId=${selectedSubject._id}`).then(setChapters).catch(console.error)
    }
  }, [selectedSubject])

  // Load topics when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      setSelectedTopic(null)
      setTopics([])
      api(`/api/exams/chapter-topics?chapterId=${selectedChapter._id}`).then(setTopics).catch(console.error)
    }
  }, [selectedChapter])

  // Load questions when filters change
  useEffect(() => {
    if (selectedGrade) {
      loadQuestions()
    }
  }, [selectedGrade, selectedSubject, selectedChapter, selectedTopic])

  async function loadQuestions() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedGrade) params.append('gradeId', selectedGrade._id)
      if (selectedSubject) params.append('subjectId', selectedSubject._id)
      if (selectedChapter) params.append('chapterId', selectedChapter._id)
      if (selectedTopic) params.append('topicId', selectedTopic._id)
      
      const data = await api(`/api/exams/questions?${params.toString()}`)
      setQuestions(data)
    } finally {
      setLoading(false)
    }
  }

  function toggleQuestion(question) {
    setSelectedQuestions(prev => {
      const exists = prev.find(q => q._id === question._id)
      if (exists) {
        return prev.filter(q => q._id !== question._id)
      } else {
        return [...prev, question]
      }
    })
  }

  function isQuestionSelected(questionId) {
    return selectedQuestions.some(q => q._id === questionId)
  }

  function calculateTotalMarks() {
    return selectedQuestions.reduce((sum, q) => sum + q.marks, 0)
  }

  async function saveTest() {
    if (!testData.title.trim()) return alert('Test title is required')
    if (selectedQuestions.length === 0) return alert('Please select at least one question')

    setSaving(true)
    try {
      const totalMarks = calculateTotalMarks()
      const payload = {
        ...testData,
        questionIds: selectedQuestions.map(q => q._id),
        totalMarks,
        passingMarks: testData.passingMarks || Math.ceil(totalMarks * 0.4),
        createdBy: userId,
      }

      await api('/api/exams/tests', 'POST', payload)
      router.push('/admin/exams/tests')
    } catch (error) {
      alert('Failed to create test: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const totalMarks = calculateTotalMarks()
  const filteredQuestions = searchQuery
    ? questions.filter(q => q.questionText.toLowerCase().includes(searchQuery.toLowerCase()))
    : questions

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/exams/tests')}
              className="rounded-lg p-2 text-brand-textSecondary hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-brand-textPrimary">Create Test</h1>
              <p className="text-sm text-brand-textSecondary">
                Build your test by selecting questions from the question bank
              </p>
            </div>
          </div>
          <button
            onClick={saveTest}
            disabled={saving || !testData.title || selectedQuestions.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Test'}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Test Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-brand-border bg-white p-6 shadow-card">
              <h2 className="text-lg font-semibold text-brand-textPrimary mb-4">Test Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={testData.title}
                    onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                    placeholder="e.g., Mathematics Quiz 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={testData.description}
                    onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={testData.duration}
                    onChange={(e) => setTestData({ ...testData, duration: Number(e.target.value) })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-brand-textSecondary">Set to 0 for no time limit</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={testData.passingMarks}
                    onChange={(e) => setTestData({ ...testData, passingMarks: Number(e.target.value) })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-brand-textSecondary">
                    Default: 40% of {totalMarks} = {Math.ceil(totalMarks * 0.4)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={testData.shuffleQuestions}
                      onChange={(e) => setTestData({ ...testData, shuffleQuestions: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-brand-textPrimary">Shuffle questions</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={testData.showCorrectAnswers}
                      onChange={(e) => setTestData({ ...testData, showCorrectAnswers: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-brand-textPrimary">Show correct answers after submission</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={testData.isPublic}
                      onChange={(e) => setTestData({ ...testData, isPublic: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-brand-textPrimary">Public test (visible to all students)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Selected Questions Summary */}
            <div className="rounded-xl border border-brand-border bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold text-brand-textPrimary mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-brand-textSecondary">Questions</span>
                  <span className="text-sm font-semibold text-brand-textPrimary">{selectedQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-textSecondary">Total Marks</span>
                  <span className="text-sm font-semibold text-brand-textPrimary">{totalMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-textSecondary">Pass Marks</span>
                  <span className="text-sm font-semibold text-brand-textPrimary">
                    {testData.passingMarks || Math.ceil(totalMarks * 0.4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Question Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="rounded-xl border border-brand-border bg-white p-4 shadow-card">
              <div className="grid gap-3 md:grid-cols-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Grade *
                  </label>
                  <select
                    value={selectedGrade?._id || ''}
                    onChange={(e) => {
                      const grade = grades.find(g => g._id === e.target.value)
                      setSelectedGrade(grade || null)
                    }}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(g => (
                      <option key={g._id} value={g._id}>{g.icon} {g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Subject
                  </label>
                  <select
                    value={selectedSubject?._id || ''}
                    onChange={(e) => {
                      const subject = subjects.find(s => s._id === e.target.value)
                      setSelectedSubject(subject || null)
                    }}
                    disabled={!selectedGrade}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm disabled:bg-gray-50"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Chapter
                  </label>
                  <select
                    value={selectedChapter?._id || ''}
                    onChange={(e) => {
                      const chapter = chapters.find(c => c._id === e.target.value)
                      setSelectedChapter(chapter || null)
                    }}
                    disabled={!selectedSubject}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm disabled:bg-gray-50"
                  >
                    <option value="">All Chapters</option>
                    {chapters.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                    Topic
                  </label>
                  <select
                    value={selectedTopic?._id || ''}
                    onChange={(e) => {
                      const topic = topics.find(t => t._id === e.target.value)
                      setSelectedTopic(topic || null)
                    }}
                    disabled={!selectedChapter}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm disabled:bg-gray-50"
                  >
                    <option value="">All Topics</option>
                    {topics.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full rounded-lg border border-brand-border pl-10 pr-4 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Question count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-brand-textSecondary">
                {selectedQuestions.length} selected | {filteredQuestions.length} available
              </p>
            </div>

            {/* Questions */}
            {!selectedGrade ? (
              <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
                <p className="text-brand-textSecondary">Select a grade to view questions</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-accent border-r-transparent"></div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="rounded-xl border border-brand-border bg-white p-12 text-center shadow-card">
                <p className="text-brand-textSecondary">No questions found for this selection</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredQuestions.map((q) => (
                  <div
                    key={q._id}
                    onClick={() => toggleQuestion(q)}
                    className={`cursor-pointer rounded-xl border p-4 shadow-card transition-all ${
                      isQuestionSelected(q._id)
                        ? 'border-brand-accent bg-brand-accentLight'
                        : 'border-brand-border bg-white hover:border-brand-accent/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border ${
                        isQuestionSelected(q._id) ? 'border-brand-accent bg-brand-accent' : 'border-brand-border'
                      }`}>
                        {isQuestionSelected(q._id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-textPrimary">{q.questionText}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-brand-textSecondary">{q.type}</span>
                          <span className="text-xs text-brand-textSecondary">•</span>
                          <span className="text-xs text-brand-textSecondary">{q.marks} mark(s)</span>
                          <span className="text-xs text-brand-textSecondary">•</span>
                          <span className="text-xs text-brand-textSecondary">{q.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
