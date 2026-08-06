'use client'

import { Share2 } from 'lucide-react'

export default function ShareButton({ testId, title }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const url = `${window.location.origin}/exams/${testId}`
        if (navigator.share) {
          navigator.share({ title, text: `Take this test: ${title}`, url })
        } else {
          navigator.clipboard.writeText(url)
          alert('Test link copied!')
        }
      }}
      className="rounded-lg border border-brand-border p-2 text-brand-textSecondary hover:bg-brand-accentLight hover:text-brand-accent"
    >
      <Share2 className="h-4 w-4" />
    </button>
  )
}
