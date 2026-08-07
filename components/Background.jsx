'use client'

import dynamic from 'next/dynamic'

const Particles = dynamic(() => import('./Particles').then((m) => m.Particles), {
  ssr: false,
  loading: () => null,
})

export function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <Particles quantity={115} accentRatio={0.2} accentColor="222, 29, 141" />
    </div>
  )
}

export default Background
