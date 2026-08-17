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
    <div className="relative flex flex-col overflow-hidden border border-gray-300 bg-white shadow hover:shadow-md">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-green-600 px-2.5 py-1 shadow">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-xs font-bold text-white">{discountPct}% OFF</span>
        </div>
      )}

      {/* Thumbnail - reduced height */}
      <Link href={`/courses/${c.slug}`} className="relative block h-40 overflow-hidden bg-gray-200">
        <span
          className="absolute left-0 top-3 z-10 inline-flex items-center gap-1.5 py-1 pl-3 pr-3.5 text-[11px] font-bold uppercase tracking-wide text-white shadow"
          style={{ backgroundColor: c.badgeColor || '#FE5529' }}
        >
          <span className="h-1.5 w-1.5 bg-white" />
          {c.badgeLabel || 'Online'}
        </span>
        {c.thumbnail ? (
          <img
            src={c.thumbnail}
            alt={c.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-accent/40">
            <GraduationCap className="h-12 w-12" />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/courses/${c.slug}`}>
          <h3 className="mb-2 font-heading text-base font-bold leading-tight text-gray-900 line-clamp-2">
            {c.title}
          </h3>
        </Link>

        {c.language && (
          <span className="mb-2 w-fit bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {c.language}
          </span>
        )}

        {/* Category badges - multiple streams */}
        {c.categoryNames && c.categoryNames.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {c.categoryNames.map((catName, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-brand-accent"
              >
                <Tag className="h-3 w-3" />
                {catName}
              </span>
            ))}
          </div>
        ) : c.category ? (
          <span className="mb-3 inline-flex w-fit items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-brand-accent">
            <Tag className="h-3 w-3" />
            {c.category}
          </span>
        ) : null}

        {/* Learning bullet points - Only 3 items */}
        {learningPoints.length > 0 && (
          <div className="mb-3 space-y-1">
            {learningPoints.slice(0, 3).map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600 mt-0.5" />
                <span className="line-clamp-1">{point}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-200">
          {/* Premium features */}
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-orange-800">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            <span>{c.premiumFeatureText || 'Industry-Ready Skills'}</span>
          </div>

          {/* Price */}
          {isFree ? (
            <div className="mb-3">
              <span className="font-heading text-xl font-bold text-green-600">Free</span>
            </div>
          ) : (
            <div className="mb-3 flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold text-brand-accent">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{c.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-5 gap-2">
            <Link
              href={`/courses/${c.slug}`}
              className="col-span-2 flex items-center justify-center border-2 px-3 py-2.5 text-center text-sm font-bold"
              style={{
                borderColor: c.exploreButtonColor || '#FE5529',
                color: c.exploreButtonColor || '#FE5529',
              }}
            >
              Explore
            </Link>
            <Link
              href={`/courses/${c.slug}`}
              className="col-span-3 flex items-center justify-center gap-2 px-3 py-2.5 text-center text-sm font-bold text-white shadow"
              style={{
                background: `linear-gradient(135deg, ${c.buyNowButtonColor || '#FE5529'} 0%, ${c.buyNowButtonColor || '#E04820'} 100%)`
              }}
            >
              Enroll Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
