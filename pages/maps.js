// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
import { PageSEO } from '@/components/SEO'
import CDMXInteractiveExperience from '@/components/CDMXInteractiveExperience'

export default function MapsPage() {
  return (
    <>
      <PageSEO
        title="Maps - Amaxing | Guía Interactiva CDMX 2026"
        description="Cinco mapas interactivos curados: fondas sin tacos, zonas de precaución con datos oficiales, mixología, joyas escondidas y top atracciones. Cada punto verificado para visitantes de 2 a 7 días."
      />
      <CDMXInteractiveExperience />
    </>
  )
}
