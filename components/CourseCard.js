/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { GraduationCap, Users, Sparkles, Tag, ArrowRight, Clock, Award } from 'lucide-react'

// Marketing course card used on the catalog and the dashboard "explore" grid.
export default function CourseCard({ course: c }) {
  const price = c.discountPrice > 0 ? c.discountPrice : c.originalPrice
  const hasDiscount = c.discountPrice > 0 && c.originalPrice > c.discountPrice
  const discountPct = hasDiscount
    ? Math.round(((c.originalPrice - c.discountPrice) / c.originalPrice) * 100)
    : 0
  const isFree = !c.originalPrice && !c.discountPrice

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Discount badge - floating top right */}
      {hasDiscount && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">{discountPct}% OFF</span>
        </div>
      )}

      {/* Thumbnail with overlay gradient */}
      <Link href={`/courses/${c.slug}`} className="relative block aspect-video w-full overflow-hidden">
        {/* Badge ribbon */}
        <span
          className="absolute left-0 top-4 z-10 inline-flex items-center gap-1.5 rounded-r-lg py-1.5 pl-3 pr-4 text-xs font-bold uppercase tracking-wide text-white shadow-xl backdrop-blur-sm"
          style={{ backgroundColor: c.badgeColor || '#FE5529' }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {c.badgeLabel || 'Online'}
        </span>

        {/* Dark gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {c.thumbnail ? (
          <img
            src={c.thumbnail}
            alt={c.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-accent/20 to-brand-accentDark/20">
            <GraduationCap className="h-16 w-16 text-brand-accent opacity-40" />
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="relative flex flex-1 flex-col p-4">
        {/* Title and Language */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/courses/${c.slug}`} className="flex-1">
            <h3 className="font-heading text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-brand-accent">
              {c.title}
            </h3>
          </Link>
          {c.language && (
            <span className="shrink-0 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {c.language}
            </span>
          )}
        </div>

        {/* Category badges - multiple streams */}
        {c.categoryNames && c.categoryNames.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {c.categoryNames.map((catName, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 px-2.5 py-1 text-xs font-semibold text-brand-accent shadow-sm"
              >
                <Tag className="h-3 w-3" />
                {catName}
              </span>
            ))}
          </div>
        ) : c.category ? (
          <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 px-2.5 py-1 text-xs font-semibold text-brand-accent shadow-sm">
            <Tag className="h-3 w-3" />
            {c.category}
          </span>
        ) : null}

        {/* Meta information */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {c.examTarget && (
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-brand-accent" />
              <span className="font-medium">For {c.examTarget} Students</span>
            </p>
          )}
          {c.instructorName && (
            <p className="flex items-center gap-2">
              <Award className="h-4 w-4 shrink-0 text-brand-accent" />
              <span className="font-medium">{c.instructorName}</span>
            </p>
          )}
        </div>

        {/* Premium features banner */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 shadow-md">
          <span className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            {c.premiumFeatureText || 'Premium Features'}
          </span>
          <span
            className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow"
            style={{ backgroundColor: c.premiumBadgeColor || '#F59E0B' }}
          >
            {c.premiumBadgeLabel || 'ELITE'}
          </span>
        </div>

        <div className="mt-4 flex-1" />

        {/* Price section */}
        <div className="mt-4 rounded-xl border-t-2 border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              {isFree ? (
                <span className="font-heading text-2xl font-bold text-green-600">Free</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-brand-accent">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm font-medium text-gray-400 line-through">
                      ₹{c.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Complete Program
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-5 gap-3">
          <Link
            href={`/courses/${c.slug}`}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-center text-sm font-bold transition-all hover:scale-105 hover:shadow-md"
            style={{
              borderColor: c.exploreButtonColor || '#FE5529',
              color: c.exploreButtonColor || '#FE5529',
            }}
          >
            Explore
          </Link>
          <Link
            href={`/courses/${c.slug}`}
            className="col-span-3 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
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
  )
}
