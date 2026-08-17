import { League_Spartan } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import ScrollToTop from '@/components/ScrollToTop'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.incubecareers.com'

// League Spartan for all text (100-900)
const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-league-spartan',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Incube Careers - Accelerate your career',
    template: '%s | Incube Careers',
  },
  description:
    'Live learning with industry experts. Jobs at technology companies. Accelerate your career with Incube Careers.',
  keywords: [
    'Incube Careers',
    'career development',
    'live learning',
    'technology careers',
    'industry experts',
    'tech jobs',
    'career acceleration',
    'professional development',
    'live classes',
    'tech training',
  ],
  applicationName: 'Incube Careers',
  authors: [{ name: 'Incube Careers' }],
  creator: 'Incube Careers',
  publisher: 'Incube Careers',
  category: 'Education',
  classification: 'Career development platform',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Incube Careers',
    title: 'Incube Careers - Accelerate your career',
    description:
      'Live learning with industry experts. Jobs at technology companies.',
    images: [
      {
        url: '/logo-full.png',
        width: 1200,
        height: 630,
        alt: 'Incube Careers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Incube Careers - Accelerate your career',
    description:
      'Live learning with industry experts. Jobs at technology companies.',
    images: ['/logo-full.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'theme-color': '#FE5529',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FE5529',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={leagueSpartan.variable}>
      <body>
        <Providers>
          {children}
          <CookieConsentBanner />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
