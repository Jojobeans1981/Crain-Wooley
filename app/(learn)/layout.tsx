import { SiteHeader, SiteFooter, RevealScript } from '@/components/site/SiteChrome'

/** Learning Center layout — Scorpion interior skin (light #F7F7F7 content bg). */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cw-page">
      <SiteHeader />
      <main className="learn-main">{children}</main>
      <SiteFooter />
      <RevealScript />
    </div>
  )
}
