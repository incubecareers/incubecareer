'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react'

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

  // Map category to gradient color
  const getCategoryGradient = (category) => {
    const categoryLower = (category || '').toLowerCase()
    if (categoryLower.includes('hr') || categoryLower.includes('recruitment')) 
      return 'from-purple-600 via-purple-700 to-indigo-700'
    if (categoryLower.includes('business') || categoryLower.includes('analyst'))
      return 'from-blue-600 via-blue-700 to-cyan-700'
    if (categoryLower.includes('financial') || categoryLower.includes('finance'))
      return 'from-green-600 via-emerald-700 to-teal-700'
    if (categoryLower.includes('account') || categoryLower.includes('gst'))
      return 'from-orange-600 via-red-600 to-pink-700'
    return 'from-gray-600 via-gray-700 to-gray-800'
  }

  const bgGradient = getCategoryGradient(course.category)

  // Parse whatYouLearn array for bullet points
  const learningPoints = course.whatYouLearn || []

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
      onClick={handleClick}
    >
      {/* Decorative gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Trending badge - floating top right */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1.5 shadow-lg opacity-0 transition-all duration-300 group-hover:opacity-100">
        <TrendingUp className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-bold text-white">Popular</span>
      </div>

      {/* Banner/Header Image Area - Fixed aspect ratio */}
      <div className={`relative aspect-[16/9] bg-gradient-to-br ${bgGradient} overflow-hidden`}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      
      {/* Card Content - Compact */}
      <div className="relative flex flex-1 flex-col p-5">
        <h3 className="mb-3 font-heading text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-orange-600 line-clamp-2">
          {course.title}
        </h3>

        {/* Learning points as bullets */}
        {learningPoints.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {learningPoints.slice(0, 4).map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                <span className="line-clamp-1">{point}</span>
              </div>
            ))}
            {learningPoints.length > 4 && (
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <span className="ml-6">+ {learningPoints.length - 4} more topics...</span>
              </div>
            )}
          </div>
        )}

        {course.description && !learningPoints.length && (
          <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2">
            {course.description}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          {/* Premium features indicator */}
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-orange-900">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span>Industry-Ready Skills • Job Placement Support</span>
          </div>
          
          {/* CTA Button with gradient */}
          <button className="group/btn relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-5 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
            <span className="relative z-10">Explore Program</span>
            <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
          </button>
        </div>
      </div>
    </div>
  )
}
