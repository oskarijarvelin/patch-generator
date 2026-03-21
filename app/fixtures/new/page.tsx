import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import NewFixturePageClient from '@/components/NewFixturePageClient'

export default async function NewFixturePage() {
  const isLocalhost = (await headers()).get('x-is-localhost') === '1'
  if (!isLocalhost) redirect('/fixtures')
  return <NewFixturePageClient />
}
