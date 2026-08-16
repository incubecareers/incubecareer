'use client'

import { useRouter } from 'next/navigation'
import { Clock, ArrowRight } from 'lucide-react'

// initialAuthenticated is passed from the server component so no extra API call
// is needed on the client just to check auth state on first render.
export default function CareerProgramCard({ course, initialAuthenticated = false }) {
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault()
    
    if (!initialAuthenticated) {
      // Store the course slug in sessionStorage to redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', `/courses/${course.slug}`)
      }
      router.push('/login')
    } else {
      router.push(`/courses/${course.slug}`)
    }
  }

  // Map category to icon emoji
  const getCategoryIcon = (category) => {
    const categoryLower = (category || '').toLowerCase()
    if (categoryLower.includes('hr') || categoryLower.includes('recruitment')) return '👥'
    if (categoryLower.includes('business') || categoryLower.includes('analyst')) return '📊'
    if (categoryLower.includes('financial') || categoryLower.includes('finance')) return '💰'
    if (categoryLower.includes('account')) return '🧾'
    return '📚'
  }

  // Map category to gradient color
  const getCategoryGradient = (category) => {
    const categoryLower = (category || '').toLowerCase()
    if (categoryLower.includes('hr') || categoryLower.includes('recruitment')) 
      return 'bg-gradient-to-br from-purple-700 to-purple-600'
    if (categoryLower.includes('business') || categoryLower.includes('analyst'))
      return 'bg-gradient-to-br from-blue-700 to-blue-600'
    if (categoryLower.includes('financial') || categoryLower.includes('finance'))
      return 'bg-gradient-to-br from-green-700 to-green-600'
    if (categoryLower.includes('account'))
      return 'bg-gradient-to-br from-orange-700 to-orange-600'
    return 'bg-gradient-to-br from-gray-700 to-gray-600'
  }

  const icon = getCategoryIcon(course.category)
  const bgGradient = getCategoryGradient(course.category)

  return (
    <div
      className="group overflow-hidden rounded-2xl border border-brand-dark-border bg-white transition-all hover:shadow-2xl cursor-pointer"
      onClick={handleClick}
    >
      {/* Banner/Header Image Area */}
      <div className={`relative h-48 ${bgGradient} overflow-hidden`}>
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">{icon}</div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        <h3 className="mb-2 font-heading text-xl font-bold text-gray-900 line-clamp-2">
          {course.title}
        </h3>
        
        {course.duration && (
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
        )}

        {course.description && (
          <p className="mb-6 text-sm text-gray-600 line-clamp-3">
            {course.description}
          </p>
        )}
        
        <div className="border-t border-gray-200 pt-6">
          <button className="group/btn flex w-full items-center justify-between rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-900">
            <span>Explore Program</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
