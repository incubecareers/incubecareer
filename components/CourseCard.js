/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { GraduationCap, Sparkles, Tag, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function CourseCard({ course: c }) {
  const price = c.discountPrice > 0 ? c.discountPrice : c.originalPrice
  const hasDiscount = c.discountPrice > 0 && c.originalPrice > c.discountPrice
  const discountPct = hasDiscount
    ? Math.round(((c.originalPrice - c.discountPrice) / c.originalPrice) * 100)
    : 0
  const isFree = !c.originalPrice && !c.discountPrice

  const learningPoints = c.whatYouLearn || []

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">{discountPct}% OFF</span>
        </div>
      )}

      {/* Thumbnail with proper aspect ratio */}
      <Link href={`/courses/${c.slug}`} className="relative block aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <span
          className="absolute left-0 top-4 z-10 inline-flex items-center gap-1.5 rounded-r-lg py-1.5 pl-3 pr-4 text-xs font-bold uppercase tracking-wide text-white shadow-xl backdrop-blur-sm"
          style={{ backgroundColor: c.badgeColor || '#FE5529' }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {c.badgeLabel || 'Online'}
        </span>
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {c.thumbnail ? (
          <img
            src={c.thumbnail}
            alt={c.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GraduationCap className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="relative flex flex-1 flex-col p-3">
        {/* Title and Language */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${c.slug}`} className="flex-1">
            <h3 className="font-heading text-sm font-bold leading-tight text-gray-900 transition-colors group-hover:text-orange-600 line-clamp-1">
              {c.title}
            </h3>
          </Link>
          {c.language && (
            <span className="shrink-0 rounded-lg bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {c.language}
            </span>
          )}
        </div>

        {/* Category badges - multiple streams */}
        {c.categoryNames && c.categoryNames.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {c.categoryNames.slice(0, 3).map((catName, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white"
              >
                <Tag className="h-2.5 w-2.5 text-white" />
                {catName}
              </span>
            ))}
          </div>
        ) : c.category ? (
          <span className="mt-2 inline-flex w-fit items-center gap-0.5 rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <Tag className="h-2.5 w-2.5 text-white" />
            {c.category}
          </span>
        ) : null}

        <div className="mt-2 flex-1" />

        {/* Price - Compact */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="font-heading text-lg font-bold text-green-600">Free</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-lg font-bold text-orange-600">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ₹{c.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>
          <Link
            href={`/courses/${c.slug}`}
            className="flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-white"
            style={{ 
              background: `linear-gradient(135deg, ${c.buyNowButtonColor || '#FE5529'} 0%, ${c.buyNowButtonColor || '#E04820'} 100%)`
            }}
          >
            Enroll
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
