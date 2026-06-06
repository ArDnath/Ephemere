import { cookies } from 'next/headers'

import PageClient from './page-client'

export const metadata = {
  title: 'Chat Room',
  description: 'Real-time chat room powered by Ephemere',
}

interface PageProps {
  params: Promise<{
    roomId: string
  }>
  searchParams?: Promise<{
    created?: string
  }>
}

const Page = async ({ params, searchParams }: PageProps) => {
  const cookieStore = await cookies()
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const { roomId } = resolvedParams
  const isNewRoom = resolvedSearchParams?.created === '1'
  const token = cookieStore.get('token')?.value

  return <PageClient roomId={roomId} token={token} isNewRoom={isNewRoom} />
}

export default Page
