import { PageSEO } from '@/components/SEO'
import InteractiveGuidesSplitScroll from '@/components/InteractiveGuidesSplitScroll'

export default function GuidesPage() {
  return (
    <>
      <PageSEO
        title="Guides — 5 Journeys de Cultura Fácil | Amaxing"
        description="Cinco recorridos autoguiados de 60-90 min: Condesa, Centro, Chapultepec II, Chimalistac y UNAM. Cultura fácil para caminar solo."
      />
      <InteractiveGuidesSplitScroll />
    </>
  )
}
