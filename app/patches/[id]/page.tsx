import { headers } from 'next/headers'
import PatchPageClient from '@/components/PatchPageClient'

export default async function PatchPage() {
  const isLocalhost = (await headers()).get('x-is-localhost') === '1'
  return <PatchPageClient isLocalhost={isLocalhost} />
}
