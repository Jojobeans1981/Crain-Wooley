import Image from 'next/image'
import { pageMetadata } from '@/lib/seo'
import { GuideForm } from '@/components/site/GuideForm'

export const metadata = pageMetadata({
  title: 'Free Estate Planning Guide | Crain & Wooley',
  description: 'Download our free Planning & Settling Estates guide — plain-language help on wills, trusts, probate, and protecting your family across the Dallas–Fort Worth area.',
  path: '/resources/free-estate-planning-guide',
})

export default function FreeGuidePage() {
  return (
    <div className="cw-article-bg">
      <header className="legacy-banner"><div className="cw-container legacy-banner-inner"><h1 className="legacy-banner-title">Free Estate Planning Guide</h1></div></header>
      <div className="cw-container legacy-body">
        <div className="cw-webinar-grid">
          <div>
            <h2 className="legacy-h2">Planning and Settling Estates</h2>
            <p className="learn-p" style={{ maxWidth: 640 }}>Planning for the future doesn’t have to be stressful. At Crain &amp; Wooley, we help families across the metroplex protect what matters most with personalized estate planning and probate services. With offices in Plano, Mansfield, and Fort Worth, our team has guided hundreds of local families to protect their legacy.</p>
            <p className="learn-p" style={{ maxWidth: 640 }}>Fill out the form and your copy of our Planning &amp; Settling Estates guide will download right away.</p>
            <Image src="/home/guide-feature.jpg" alt="Crain & Wooley Free Estate Planning Guide" width={420} height={460} style={{ width: '100%', maxWidth: 360, height: 'auto', marginTop: 24 }} />
          </div>
          <GuideForm />
        </div>
      </div>
    </div>
  )
}
