import type { Lead } from '@prisma/client'

export type PortalChecklistItem = {
  id: string
  title: string
  description: string
  audience: 'Client' | 'Firm' | 'Shared'
}

function hasAny(value: unknown) {
  if (!value) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0
  return String(value).trim().length > 0
}

export function getPortalChecklist(lead: Pick<Lead, 'intakeType' | 'practiceArea' | 'hasChildren' | 'hasMinorChildren' | 'ownsRealEstate' | 'ownsBusiness' | 'decedentName' | 'willExists' | 'decedentHadTrust' | 'attachments'>): PortalChecklistItem[] {
  const items: PortalChecklistItem[] = []

  if (lead.intakeType === 'PROBATE' || lead.practiceArea === 'PROBATE') {
    items.push(
      {
        id: 'death-certificate',
        title: 'Death certificate',
        description: 'Upload the certified copy or send it to the firm so the probate team can open the file.',
        audience: 'Client',
      },
      {
        id: 'original-will',
        title: 'Original signed will',
        description: 'If one exists, the original is usually the document the court and firm need first.',
        audience: 'Client',
      },
    )
  } else {
    items.push(
      {
        id: 'identification',
        title: 'Government ID',
        description: 'A clear copy of the client and any spouse or co-client ID speeds up signing and review.',
        audience: 'Client',
      },
      {
        id: 'asset-summary',
        title: 'Asset summary',
        description: 'A rough list of real estate, accounts, and business interests helps the drafting team scope the plan.',
        audience: 'Shared',
      },
    )
  }

  if (lead.hasChildren || lead.hasMinorChildren) {
    items.push({
      id: 'guardian-notes',
      title: 'Guardian / trustee notes',
      description: 'Confirm who should care for minor children or manage the trust if something happens first.',
      audience: 'Shared',
    })
  }

  if (lead.ownsRealEstate) {
    items.push({
      id: 'deed-records',
      title: 'Property records',
      description: 'Deed copies, mortgage statements, and homestead details help the team align the transfer plan.',
      audience: 'Firm',
    })
  }

  if (lead.ownsBusiness) {
    items.push({
      id: 'business-docs',
      title: 'Business documents',
      description: 'Formation papers, ownership agreements, and operating rules are useful for succession planning.',
      audience: 'Firm',
    })
  }

  if (hasAny(lead.attachments)) {
    items.push({
      id: 'intake-attachments',
      title: 'Intake attachments received',
      description: 'The intake questionnaire already captured file names for the team to review.',
      audience: 'Shared',
    })
  }

  items.push({
    id: 'signature-packet',
    title: 'Signature packet',
    description: 'Once the draft is ready, the client can request the signing packet and the firm can route the right documents.',
    audience: 'Shared',
  })

  return items
}

