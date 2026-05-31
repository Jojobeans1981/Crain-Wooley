'use client'
import { IntakeFlow } from '@/components/intake/IntakeFlow'

// The estate intake: welcome → Wills/Probate chooser → branched multi-step
// questionnaire → review + consent → submit. Wired to /api/intake and the
// qualify → $300 payment → schedule → confirmation pipeline (see IntakeFlow).
export default function QualifyPage() {
  return <IntakeFlow />
}
