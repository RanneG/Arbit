import { notFound } from 'next/navigation'
import CardDetails from '../../components/CardDetails'
import { mockCards } from '@/lib/mockCards'

interface PageProps {
  params: {
    id: string
  }
}

export default function CardDetailPage({ params }: PageProps) {
  const card = mockCards.find((c) => c.id === params.id)

  if (!card) {
    notFound()
  }

  return <CardDetails card={card} />
}
