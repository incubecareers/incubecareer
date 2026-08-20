'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react'

async function api(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export default function TestTakingInterface({ test, questions, attempt, userId }) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(attempt.answers || {})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const currentQuestion = questions[currentIndex]

  // Initialize timer
  useEffect(() => {
    if (test.duration > 0) {
      const startTime = new Date(attempt.startedAt).getTime()
      const duration = test.duration * 60 * 1000 // convert to milliseconds
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setTimeRemaining(Math.floor(remaining / 1000)) // in seconds
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0) {
        handleSubmit(true) // Auto-submit when time runs out
      }
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  // Auto-save answers periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        api(`/api/exams/attempts/${attempt._id}`, 'PATCH', { answers })
          .catch(err => console.error('Failed to auto-save:', err))
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [answers, attempt._id])

  function formatTime(seconds) {
    if (seconds === null) return 'No limit'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  function handleAnswerChange(questionId, answer) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  function handleMultipleChoice(questionId, optionIndex) {
    const current = answers[questionId] || []
    const updated = current.includes(optionIndex)
      ? current.filter(i => i !== optionIndex)
      : [...current, optionIndex]
    handleAnswerChange(questionId, updated)
  }

  async function handleSubmit(autoSubmit = false) {
    if (!autoSubmit && !confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const timeSpent = test.duration > 0 
        ? (test.duration * 60) - (timeRemaining || 0)
        : Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)

      await api(`/api/exams/attempts/${attempt._id}/submit`, 'POST', {
        answers,
        timeSpent
      })

      router.push(`/exams/${test._id}/result`)
    } catch (error) {
      alert('Failed to submit test: ' + error.message)
      setIsSubmitting(false)
    }
  }

  function getAnsweredCount() {
    return Object.keys(answers).length
  }

  function isQuestionAnswered(questionId) {
    const answer = answers[questionId]
    if (Array.isArray(answer)) return answer.length > 0
    return answer !== undefined && answer !== null && answer !== ''
  }

  if (showReview) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
            <h2 className="text-2xl font-bold text-brand-textPrimary mb-6">Review Your Answers</h2>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => {
                    setShowReview(false)
                    setCurrentIndex(idx)
                  }}
                  className={`aspect-square rounded-lg border-2 text-sm font-semibold transition-colors ${
                    isQuestionAnswered(q._id)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-brand-surface text-gray-500'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-brand-border pt-6">
              <div className="text-sm text-brand-textSecondary">
                <p>Answered: {getAnsweredCount()} / {questions.length}</p>
                <p>Unanswered: {questions.length - getAnsweredCount()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReview(false)}
                  className="rounded-lg border border-brand-border bg-brand-surface px-6 py-2.5 text-sm font-semibold text-brand-textPrimary hover:bg-[#1A1A1A]"
                >
                  Continue Test
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="rounded-lg bg-accent-gradient px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-brand-border bg-brand-surface shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-brand-textPrimary">{test.title}</h1>
              <p className="text-sm text-brand-textSecondary">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {test.duration > 0 && (
                <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  timeRemaining < 300 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                </div>
              )}
              
              <button
                onClick={() => setShowReview(true)}
                className="rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-textPrimary hover:bg-[#1A1A1A]"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="rounded-xl border border-brand-border bg-brand-surface p-8 shadow-card">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-brand-textPrimary flex-1">
                {currentQuestion.questionText}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 whitespace-nowrap">
                {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {['mcq', 'truefalse'].includes(currentQuestion.type) && (
              <>
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 cursor-pointer transition-all hover:border-brand-accent hover:bg-brand-accentLight"
                  >
                    <input
                      type="radio"
                      name={currentQuestion._id}
                      checked={answers[currentQuestion._id] === idx}
                      onChange={() => handleAnswerChange(currentQuestion._id, idx)}
                      className="h-5 w-5 text-brand-accent"
                    />
                    <span className="text-brand-textPrimary">{option.text}</span>
                  </label>
                ))}
              </>
            )}

            {currentQuestion.type === 'multiple' && (
              <>
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 cursor-pointer transition-all hover:border-brand-accent hover:bg-brand-accentLight"
                  >
                    <input
                      type="checkbox"
                      checked={(answers[currentQuestion._id] || []).includes(idx)}
                      onChange={() => handleMultipleChoice(currentQuestion._id, idx)}
                      className="h-5 w-5 text-brand-accent"
                    />
                    <span className="text-brand-textPrimary">{option.text}</span>
                  </label>
                ))}
              </>
            )}

            {['shortanswer', 'numerical'].includes(currentQuestion.type) && (
              <input
                type={currentQuestion.type === 'numerical' ? 'number' : 'text'}
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-brand-textPrimary focus:border-brand-accent focus:outline-none"
                placeholder="Type your answer here..."
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-6 py-3 text-sm font-semibold text-brand-textPrimary hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="text-sm text-brand-textSecondary">
            {getAnsweredCount()} of {questions.length} answered
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowReview(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Review & Submit
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
