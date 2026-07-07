import { TripDetailApp } from "@/components/trip-detail-app"

interface Props {
  params: Promise<{ id: string }>
}

export default async function TripPage({ params }: Props) {
  const { id } = await params
  return <TripDetailApp tripId={id} />
}
