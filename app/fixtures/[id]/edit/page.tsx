import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import EditFixturePageClient from '@/components/EditFixturePageClient'

export default async function EditFixturePage() {
  const isLocalhost = (await headers()).get('x-is-localhost') === '1'
  if (!isLocalhost) redirect('/fixtures')
  return <EditFixturePageClient />
}
