import { headers } from 'next/headers'
import FixturesPageClient from '@/components/FixturesPageClient'

export default async function FixturesPage() {
  const isLocalhost = (await headers()).get('x-is-localhost') === '1'
  return <FixturesPageClient isLocalhost={isLocalhost} />
}
