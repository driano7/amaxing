// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
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
