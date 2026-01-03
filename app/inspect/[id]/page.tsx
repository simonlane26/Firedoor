import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function InspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  // Must be logged in to inspect
  if (!session?.user) {
    redirect(`/login?callbackUrl=/inspect/${id}`)
  }

  // Verify the door exists and user has access
  const door = await prisma.fireDoor.findUnique({
    where: { id },
    include: {
      building: true
    }
  })

  if (!door) {
    redirect('/doors')
  }

  // Check user has access to this door (either their tenant or their managed building)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true }
  })

  const hasAccess = door.tenantId === user?.tenantId ||
                    door.building.managerId === session.user.id

  if (!hasAccess) {
    redirect('/doors')
  }

  // Redirect to inspection form with doorId pre-selected
  redirect(`/inspections/new?doorId=${id}`)
}
