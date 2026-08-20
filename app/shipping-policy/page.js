import LegalPage from '@/components/LegalPage'
import { SectionTitle, SectionText, ListItem } from '@/components/ui/typography'

const sections = [
  {
    title: 'Digital Product Delivery',
    body: 'Incube Careers provides online educational courses and digital learning materials. All products are delivered electronically through our learning platform. There is no physical shipping involved.',
  },
  {
    title: 'Instant Access',
    body: 'Once your payment is successfully processed and verified, you will receive immediate access to the purchased course content through your account dashboard. No additional shipping time or charges apply.',
  },
  {
    title: 'Course Access Method',
    body: 'After purchase, log in to your Incube Careers account and navigate to the "My Courses" or "Dashboard" section to access your enrolled courses. All course videos, notes, tests, and materials are available online.',
  },
  {
    title: 'Multiple Device Access',
    body: 'Your digital course content can be accessed from any device with an internet connection, including desktop computers, laptops, tablets, and mobile phones through a web browser.',
  },
  {
    title: 'No Physical Products',
    body: 'We do not sell or ship physical goods such as books, DVDs, or study materials. All content is delivered digitally through our online platform.',
  },
  {
    title: 'Access Duration',
    body: 'Course access is provided according to the terms mentioned at the time of purchase. For lifetime access courses, you retain access as long as your account remains active and the course is available on the platform.',
  },
  {
    title: 'Technical Requirements',
    body: 'To access course content, you need a stable internet connection, a modern web browser (Chrome, Firefox, Safari, or Edge), and sufficient device storage for viewing videos and downloading materials where applicable.',
  },
  {
    title: 'Delivery Confirmation',
    body: 'Course enrollment is confirmed via email once payment is verified. If you do not receive access within a reasonable time after payment, please contact support immediately.',
  },
  {
    title: 'International Access',
    body: 'Our digital courses are accessible from anywhere in the world, subject to internet availability and local regulations. There are no geographic shipping restrictions for digital products.',
  },
  {
    title: 'Support and Assistance',
    body: 'If you experience any issues accessing your purchased courses or need help with course delivery, please contact our support team at incubecareers@gmail.com or call +91 90713 66466 for assistance.',
  },
]

export const metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Learn how Incube Careers delivers digital courses and learning materials instantly online.',
}

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      description="All Incube Careers courses are digital products delivered instantly through our online platform. No physical shipping applies."
      updated="20 January 2026"
      badge="Delivery"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shipping Policy' }]}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionText className="mt-3">{section.body}</SectionText>
          </section>
        ))}

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <SectionTitle>Important notes</SectionTitle>
          <ul className="mt-4 space-y-2">
            <ListItem>All courses are 100% digital and accessed through your online account.</ListItem>
            <ListItem>No physical products are shipped, and no shipping fees are charged.</ListItem>
            <ListItem>Access is granted immediately after successful payment verification.</ListItem>
            <ListItem>Contact support if you experience any access issues after purchase.</ListItem>
          </ul>
        </section>
      </div>
    </LegalPage>
  )
}
