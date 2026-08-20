'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Upload, Download } from 'lucide-react'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ (Single Correct)' },
  { value: 'multiple', label: 'MCQ (Multiple Correct)' },
  { value: 'truefalse', label: 'True / False' },
  { value: 'fillinblank', label: 'Fill in the Blank' },
  { value: 'oneword', label: 'One Word Answer' },
  { value: 'numerical', label: 'Numeric Answer' },
  { value: 'shortanswer', label: 'Short Answer' },
  { value: 'essay', label: 'Long Answer / Essay' },
  { value: 'matchfollowing', label: 'Match the Following' },
  { value: 'assertionreason', label: 'Assertion & Reason' },
  { value: 'casestudy', label: 'Case Study Based' },
  { value: 'comprehension', label: 'Passage Based / Comprehension' },
  { value: 'imagebased', label: 'Picture / Image Based' },
  { value: 'diagrambased', label: 'Map / Diagram Based' },
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' },
]

export default function ExamQuestionsManager({ initialSubjects, userId }) {
  // Cascading dropdown data
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  
  // Selected values
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [selectedType, setSelectedType] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  
  // Questions
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkQuestions, setBulkQuestions] = useState('')
  const [bulkResults, setBulkResults] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [formData, setFormData] = useState({
    type: 'mcq',
    questionText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswer: '',
    explanation: '',
    marks: 1,
    difficulty: 'medium',
    tags: '',
  })

  // Load grades on mount
  useEffect(() => {
    loadGrades()
  }, [])

  // Load subjects when grade changes
  useEffect(() => {
    if (selectedGrade) {
      loadSubjects(selectedGrade._id)
      setSelectedSubject(null)
      setSelectedChapter(null)
      setSubjects([])
      setChapters([])
    }
  }, [selectedGrade])

  // Load chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject._id)
      setSelectedChapter(null)
      setChapters([])
    }
  }, [selectedSubject])

  // Load questions when filters change
  useEffect(() => {
    if (selectedGrade) {
      loadQuestions()
    }
  }, [selectedGrade, selectedSubject, selectedChapter, selectedType, selectedDifficulty])

  async function loadGrades() {
    try {
      const data = await api('/api/exams/grades')
      setGrades(data)
    } catch (error) {
      console.error('Failed to load grades:', error)
    }
  }

  async function loadSubjects(gradeId) {
    try {
      const data = await api(`/api/exams/grade-subjects?gradeId=${gradeId}`)
      setSubjects(data)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  async function loadChapters(subjectId) {
    try {
      const data = await api(`/api/exams/chapters?subjectId=${subjectId}`)
      setChapters(data)
    } catch (error) {
      console.error('Failed to load chapters:', error)
    }
  }

  async function loadQuestions() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedGrade) params.append('gradeId', selectedGrade._id)
      if (selectedSubject) params.append('subjectId', selectedSubject._id)
      if (selectedChapter) params.append('chapterId', selectedChapter._id)
      if (selectedType) params.append('type', selectedType)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
      if (searchQuery) params.append('search', searchQuery)
      
      const data = await api(`/api/exams/questions?${params.toString()}`)
      setQuestions(data)
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    if (!selectedGrade || !selectedSubject) {
      alert('Please select Grade and Subject first')
      return
    }
    setEditingQuestion(null)
    setFormData({
      type: 'mcq',
      questionText: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: '',
      explanation: '',
      marks: 1,
      difficulty: 'medium',
      tags: '',
    })
    setShowForm(true)
  }

  async function saveQuestion() {
    if (!formData.questionText.trim()) {
      alert('Please enter question text')
      return
    }

    try {
      const payload = {
        gradeId: selectedGrade._id,
        subjectId: selectedSubject._id,
        chapterId: selectedChapter?._id || null,
        type: formData.type,
        questionText: formData.questionText,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        marks: formData.marks,
        difficulty: formData.difficulty,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        createdBy: userId,
      }

      if (editingQuestion) {
        await api(`/api/exams/questions/${editingQuestion._id}`, 'PATCH', payload)
      } else {
        await api('/api/exams/questions', 'POST', payload)
      }

      setShowForm(false)
      loadQuestions()
    } catch (error) {
      alert('Failed to save question: ' + error.message)
    }
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return
    try {
      await api(`/api/exams/questions/${id}`, 'DELETE')
      loadQuestions()
    } catch (error) {
      alert('Failed to delete question: ' + error.message)
    }
  }

  function addOption() {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }],
    })
  }

  function updateOption(index, field, value) {
    const newOptions = [...formData.options]
    newOptions[index][field] = value
    if (field === 'isCorrect' && value && formData.type === 'mcq') {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false
      })
    }
    setFormData({ ...formData, options: newOptions })
  }

  function removeOption(index) {
    if (formData.options.length <= 2) {
      alert('At least 2 options required')
      return
    }
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Grade */}
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
              {grades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.icon} {grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
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
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter */}
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
              {chapters.map((chapter) => (
                <option key={chapter._id} value={chapter._id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-brand-textSecondary mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {QUESTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-brand-textSecondary mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            >
              <option value="">All Levels</option>
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-textSecondary">
          {questions.length} question(s) found
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!selectedGrade || !selectedSubject) {
                alert('Please select Grade and Subject first')
                return
              }
              setShowBulkForm(true)
              setBulkResults(null)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm font-semibold text-brand-textPrimary hover:border-brand-accent"
          >
            <Upload className="h-4 w-4" /> Bulk Upload
          </button>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-textPrimary mb-2">Bulk Upload Questions</h3>
            <p className="text-sm text-brand-textSecondary mb-4">
              All questions will be saved to: <strong>{selectedGrade?.name}</strong> → <strong>{selectedSubject?.name}</strong>
              {selectedChapter && <> → <strong>{selectedChapter.name}</strong></>}
              {selectedType && <> | Type: <strong>{QUESTION_TYPES.find(t => t.value === selectedType)?.label}</strong></>}
              {selectedDifficulty && <> | Difficulty: <strong>{selectedDifficulty}</strong></>}
            </p>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">CSV Format:</h4>
              <code className="text-xs text-blue-800 block">questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,marks</code>
              <p className="text-xs text-blue-700 mt-1">correctAnswer = A, B, C, or D (for MCQ). Leave options empty for non-MCQ types.</p>
              <button
                onClick={() => {
                  const csv = 'questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,marks\n"What is 2+2?","3","4","5","6","B","2+2 equals 4",1\n"Capital of India?","Mumbai","Delhi","Chennai","Kolkata","B","Delhi is the capital",1'
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'question_template.csv'
                  a.click()
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                <Download className="h-3 w-3" /> Download CSV Template
              </button>
            </div>

            {/* Paste or Upload */}
            <div>
              <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                Paste CSV content or upload file:
              </label>
              <div className="mb-2">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (ev) => setBulkQuestions(ev.target.result)
                      reader.readAsText(file)
                    }
                  }}
                  className="w-full text-sm"
                />
              </div>
              <textarea
                value={bulkQuestions}
                onChange={(e) => setBulkQuestions(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm font-mono"
                placeholder={'questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,marks\n"What is 2+2?","3","4","5","6","B","2+2 equals 4",1'}
              />
            </div>

            {/* Results */}
            {bulkResults && (
              <div className={`mt-4 rounded-lg p-4 ${bulkResults.failureCount > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <p className="text-sm font-semibold">
                  ✅ {bulkResults.successCount} uploaded | ❌ {bulkResults.failureCount} failed | Total: {bulkResults.total}
                </p>
                {bulkResults.results.filter(r => !r.success).map((r, i) => (
                  <p key={i} className="text-xs text-red-700 mt-1">Row {r.row}: {r.error}</p>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={async () => {
                  if (!bulkQuestions.trim()) return alert('Please paste CSV content or upload a file')
                  
                  // Parse CSV
                  const lines = bulkQuestions.trim().split('\n')
                  const header = lines[0]
                  const rows = lines.slice(1).filter(l => l.trim())
                  
                  if (rows.length === 0) return alert('No data rows found')
                  
                  const questions = rows.map(row => {
                    // Simple CSV parser
                    const cols = row.match(/(".*?"|[^,]+)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || []
                    const [questionText, optA, optB, optC, optD, correct, explanation, marks] = cols
                    
                    const options = []
                    const correctMap = { A: 0, B: 1, C: 2, D: 3 }
                    
                    if (optA) options.push({ text: optA, isCorrect: correct?.toUpperCase() === 'A' })
                    if (optB) options.push({ text: optB, isCorrect: correct?.toUpperCase() === 'B' })
                    if (optC) options.push({ text: optC, isCorrect: correct?.toUpperCase() === 'C' })
                    if (optD) options.push({ text: optD, isCorrect: correct?.toUpperCase() === 'D' })
                    
                    return {
                      questionText: questionText || '',
                      options: options.length > 0 ? options : [],
                      correctAnswer: correct || '',
                      explanation: explanation || '',
                      marks: parseInt(marks) || 1,
                    }
                  })
                  
                  try {
                    const res = await api('/api/exams/questions/bulk', 'POST', {
                      gradeId: selectedGrade._id,
                      subjectId: selectedSubject._id,
                      chapterId: selectedChapter?._id || null,
                      type: selectedType || 'mcq',
                      difficulty: selectedDifficulty || 'medium',
                      questions,
                    })
                    setBulkResults(res)
                    if (res.successCount > 0) loadQuestions()
                  } catch (error) {
                    alert('Bulk upload failed: ' + error.message)
                  }
                }}
                className="flex-1 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                Upload {bulkQuestions.trim().split('\n').length - 1} Questions
              </button>
              <button
                onClick={() => { setShowBulkForm(false); setBulkQuestions(''); setBulkResults(null) }}
                className="flex-1 rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-textPrimary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-accent border-r-transparent"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface p-12 text-center shadow-card">
          <p className="text-brand-textSecondary">
            {selectedGrade ? 'No questions found. Add your first question!' : 'Select a grade to view questions'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q._id} className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-brand-textSecondary">#{index + 1}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      DIFFICULTY_LEVELS.find(d => d.value === q.difficulty)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-brand-textSecondary">
                      {QUESTION_TYPES.find(t => t.value === q.type)?.label}
                    </span>
                    <span className="text-xs text-brand-textSecondary">
                      {q.marks} mark(s)
                    </span>
                  </div>
                  <p className="text-brand-textPrimary font-medium">{q.questionText}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteQuestion(q._id)}
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-textPrimary mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h3>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-1">Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-1">Question Text *</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  placeholder="Enter your question..."
                />
              </div>

              {/* Options for MCQ/Multiple/TrueFalse */}
              {(formData.type === 'mcq' || formData.type === 'multiple' || formData.type === 'truefalse') && (
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-2">
                    Options (Select correct answer)
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type={formData.type === 'multiple' ? 'checkbox' : 'radio'}
                          checked={option.isCorrect}
                          onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          className="flex-1 rounded-lg border border-brand-border px-3 py-2 text-sm"
                          placeholder={`Option ${index + 1}`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.type !== 'truefalse' && (
                    <button
                      onClick={addOption}
                      className="mt-2 text-sm text-brand-accent hover:underline"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              )}

              {/* Correct Answer for Short Answer/Numerical */}
              {(formData.type === 'shortanswer' || formData.type === 'numerical') && (
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                    placeholder="Enter correct answer..."
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-1">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  placeholder="Optional explanation shown after answer..."
                />
              </div>

              {/* Marks & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">Marks</label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-textSecondary mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-brand-textSecondary mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  placeholder="e.g. algebra, equations, basics"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={saveQuestion}
                className="flex-1 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-textPrimary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
