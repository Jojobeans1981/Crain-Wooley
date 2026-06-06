/**
 * Crain & Wooley team roster — single source for the /staff-profiles listing
 * (the Meet-the-Team page) and the individual bio pages (legacy 'staff' pages,
 * rendered by LegacyArticle, which looks up the member's portrait here).
 *
 * Headshots are re-hosted under /public/team. `bio: false` means the app has no
 * captured bio page for that person, so their listing card isn't a link.
 */
export type TeamMember = {
  name: string
  title: string
  slug: string
  office: 'Plano' | 'Mansfield'
  photo: string
  bio: boolean
}

export const TEAM: TeamMember[] = [
  { name: 'Justin T. Crain', title: 'Managing Partner & Attorney', slug: 'justin-t-crain', office: 'Plano', photo: '/team/justin-crain.jpg', bio: true },
  { name: 'Jeremy Crew', title: 'Senior Attorney', slug: 'jeremy-crew', office: 'Plano', photo: '/team/jeremy-crew.jpg', bio: true },
  { name: 'Joy Crosby', title: 'Chief Operating Officer', slug: 'joy-crosby', office: 'Plano', photo: '/team/joy-crosby.jpg', bio: true },
  { name: 'Connor Martin', title: 'Attorney', slug: 'connor-martin', office: 'Plano', photo: '/team/connor-martin.jpg', bio: true },
  { name: 'Kevin Berber', title: 'Director of Marketing and Communications', slug: 'kevin-berber', office: 'Plano', photo: '/team/kevin-berber.jpg', bio: true },
  { name: 'Marcel Williams', title: 'Paralegal', slug: 'marcel-williams', office: 'Plano', photo: '/team/marcel-williams.jpg', bio: true },
  { name: 'Mary Hughes', title: 'Paralegal', slug: 'mary-hughes', office: 'Plano', photo: '/team/mary-hughes.jpg', bio: true },
  { name: 'Brynn Siciliano', title: 'Marketing and Event Coordinator / Legal Services Coordinator', slug: 'brynn-siciliano', office: 'Plano', photo: '/team/brynn-siciliano.jpg', bio: true },
  { name: 'Matthew White', title: 'Operations & Legal Assistant', slug: 'matthew-white', office: 'Plano', photo: '/team/matthew-white.jpg', bio: true },
  { name: 'Jacob Wooley', title: 'Partner & Attorney', slug: 'jacob-wooley', office: 'Mansfield', photo: '/team/jacob-wooley.jpg', bio: true },
]

export const TEAM_BY_OFFICE: { office: string; members: TeamMember[] }[] = [
  { office: 'Plano Office', members: TEAM.filter((m) => m.office === 'Plano') },
  { office: 'Mansfield Office', members: TEAM.filter((m) => m.office === 'Mansfield') },
]

const BY_PATH = new Map(TEAM.map((m) => [`/staff-profiles/${m.slug}`, m]))

/** Portrait for a legacy /staff-profiles/<slug> bio page, or undefined. */
export function teamMemberByPath(path: string): TeamMember | undefined {
  return BY_PATH.get(path.replace(/\/$/, ''))
}
