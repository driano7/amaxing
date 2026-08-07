'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PresentationControls, useGLTF, Html } from '@react-three/drei'
import { motion, useScroll } from 'framer-motion'
import { Group } from 'three'
import * as THREE from 'three'

interface Hotspot {
  id: string
  title: string
  description: string
  position: [number, number, number]
  rotation: [number, number, number]
}

export function VirtualTeaser() {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<Group>(null)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const hotspots: Hotspot[] = [
    {
      id: 'headdress',
      title: 'Capa Ceremonial',
      description: 'Un ornamento elaborado que sugiere estatus real y poderes divinos.',
      position: [0, 2, 0],
      rotation: [0, Math.PI / 2, 0],
    },
    {
      id: 'body',
      title: 'Talla en Piedra',
      description:
        'Escultura de basalto representando una deidad ancestral con mandíbula prominente.',
      position: [0, 0.5, -1],
      rotation: [0, 0, 0],
    },
    {
      id: 'base',
      title: 'Plataforma Ritual',
      description: 'Mesa circular tallada con motivos del calendario mesoamericano.',
      position: [0, -1, 0],
      rotation: [0, -Math.PI / 2, 0],
    },
  ]

  useEffect(() => {
    const updateRotation = () => {
      if (modelRef.current) {
        const rotation = scrollYProgress.get() * 2 * Math.PI
        modelRef.current.rotation.y = rotation
      }
    }

    const unsubscribe = scrollYProgress.onChange(updateRotation)
    updateRotation()

    return unsubscribe
  }, [scrollYProgress])

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <PresentationControls
            global
            rotation={[0, 0.2, 0]}
            polar={[0, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 400, friction: 50 }}
            snap={{ rotation: true }}
          >
            <group ref={modelRef} scale={2} position={[0, -1, 0]}>
              <primitive
                object={new THREE.Scene()}
                onClick={() => setActiveHotspot(activeHotspot ? null : 'headdress')}
              />
              {hotspots.map((hotspot) => (
                <Html
                  key={hotspot.id}
                  position={hotspot.position}
                  center
                  occlude
                  style={{ pointerEvents: 'auto', opacity: activeHotspot ? 1 : 0.8 }}
                >
                  <motion.button
                    onClick={() => setActiveHotspot(hotspot.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-8 w-8 rounded-full border-2 transition-all duration-300 ${
                      activeHotspot === hotspot.id
                        ? 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/50'
                        : 'border-white/30 bg-zinc-900 hover:border-orange-500/50'
                    }`}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: activeHotspot === hotspot.id ? 1 : 0,
                      y: activeHotspot === hotspot.id ? 0 : 10,
                    }}
                    className={`absolute left-1/2 mt-2 w-48 -translate-x-1/2 transform rounded-lg border border-white/10 bg-zinc-900 p-3 ${
                      activeHotspot === hotspot.id ? 'block' : 'hidden'
                    }`}
                  >
                    <h4 className="mb-1 text-sm font-bold text-white">{hotspot.title}</h4>
                    <p className="text-xs text-gray-300">{hotspot.description}</p>
                  </motion.div>
                </Html>
              ))}
            </group>
          </PresentationControls>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-2xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-4xl font-bold text-white md:text-5xl"
          >
            Descubre el Tesoro Prehispánico
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-300"
          >
            Explora una réplica digital detallada y rotatable de nuestra pieza ceremonial más
            preciada
          </motion.p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 transform flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm uppercase tracking-wider text-white/60"
        >
          Desplázate para explorar
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="h-12 w-0.5 bg-gradient-to-b from-orange-500/50 to-transparent"
        />
      </div>
    </section>
  )
}
