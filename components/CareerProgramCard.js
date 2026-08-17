'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function CareerProgramCard({ course, initialAuthenticated = false }) {
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault()
    if (!initialAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', `/courses/${course.slug}`)
      }
      router.push('/login')
    } else {
      router.push(`/courses/${course.slug}`)
    }
  }

  const learningPoints = course.whatYouLearn || []

  return (
    <div
      className="flex flex-col overflow-hidden border border-gray-300 bg-white shadow cursor-pointer hover:shadow-md"
      onClick={handleClick}
    >
      {/* Banner - Reduced height */}
      <div className="relative h-40 overflow-hidden bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Content - Reduced padding */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 font-heading text-base font-bold leading-tight text-gray-900 line-clamp-2">
          {course.title}
        </h3>

        {/* Learning bullet points - Only 3 items */}
        {learningPoints.length > 0 ? (
          <div className="mb-3 space-y-1">
            {learningPoints.slice(0, 3).map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                <span className="line-clamp-1">{point}</span>
              </div>
            ))}
            {learningPoints.length > 4 && (
              <p className="ml-6 text-xs text-gray-400">+ {learningPoints.length - 4} more topics</p>
            )}
          </div>
        ) : course.description ? (
          <p className="mb-4 text-sm text-gray-600 line-clamp-3">{course.description}</p>
        ) : null}

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-orange-800">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            <span>Industry-Ready Skills • Job Placement Support</span>
          </div>

          <button className="flex w-full items-center justify-between bg-gradient-to-r from-orange-600 to-red-600 px-5 py-3.5 font-bold text-white shadow">
            <span>Explore Program</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
