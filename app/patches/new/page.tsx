import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import NewPatchPageClient from '@/components/NewPatchPageClient'

export default async function NewPatchPage() {
  const isLocalhost = (await headers()).get('x-is-localhost') === '1'
  if (!isLocalhost) redirect('/dashboard')
  return <NewPatchPageClient />
}
