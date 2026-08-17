/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { GraduationCap, Users, Sparkles, Tag, ArrowRight, Award } from 'lucide-react'

export default function CourseCard({ course: c }) {
  const price = c.discountPrice > 0 ? c.discountPrice : c.originalPrice
  const hasDiscount = c.discountPrice > 0 && c.originalPrice > c.discountPrice
  const discountPct = hasDiscount
    ? Math.round(((c.originalPrice - c.discountPrice) / c.originalPrice) * 100)
    : 0
  const isFree = !c.originalPrice && !c.discountPrice

  return (
    <div className="group relative flex flex-col overflow-hidden border border-brand-border bg-white p-3 shadow-md hover:shadow-lg">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-green-600 px-2.5 py-1 shadow">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-xs font-bold text-white">{discountPct}% OFF</span>
        </div>
      )}

      {/* Thumbnail */}
      <Link href={`/courses/${c.slug}`} className="relative block aspect-video w-full overflow-hidden bg-brand-accentLight/40">
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
      <div className="flex flex-1 flex-col px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${c.slug}`}>
            <h3 className="font-heading text-base font-semibold text-brand-textPrimary group-hover:text-brand-accentDark">
              {c.title}
            </h3>
          </Link>
          {c.language && (
            <span className="shrink-0 bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-textSecondary">
              {c.language}
            </span>
          )}
        </div>

        {/* Category badges - multiple streams */}
        {c.categoryNames && c.categoryNames.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.categoryNames.map((catName, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-brand-accent"
              >
                <Tag className="h-3 w-3" />
                {catName}
              </span>
            ))}
          </div>
        ) : c.category ? (
          <span className="mt-2 inline-flex w-fit items-center gap-1 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-brand-accent">
            <Tag className="h-3 w-3" />
            {c.category}
          </span>
        ) : null}

        {/* Meta rows */}
        <div className="mt-3 space-y-1.5 text-sm text-brand-textSecondary">
          {c.examTarget && (
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-brand-accent" />
              <span>For {c.examTarget} Students</span>
            </p>
          )}
          {c.instructorName && (
            <p className="flex items-center gap-2">
              <Award className="h-4 w-4 shrink-0 text-brand-accent" />
              <span>{c.instructorName}</span>
            </p>
          )}
        </div>

        {/* Premium banner */}
        <div className="mt-3 flex items-center justify-between bg-gray-900 px-4 py-2.5">
          <span className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            {c.premiumFeatureText || 'Premium Features'}
          </span>
          <span
            className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: c.premiumBadgeColor || '#F59E0B' }}
          >
            {c.premiumBadgeLabel || 'ELITE'}
          </span>
        </div>

        <div className="mt-3 flex-1" />

        {/* Price */}
        <div className="mt-3 border-t border-brand-border pt-3">
          {isFree ? (
            <span className="font-heading text-2xl font-bold text-green-600">Free</span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-brand-accent">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{c.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-brand-textSecondary">
            {isFree ? 'Access anytime' : 'Full course'}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-3 grid grid-cols-5 gap-2">
          <Link
            href={`/courses/${c.slug}`}
            className="col-span-2 flex items-center justify-center gap-2 border-2 px-3 py-2.5 text-center text-sm font-bold"
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
  )
}
