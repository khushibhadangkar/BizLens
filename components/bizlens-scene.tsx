'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const nodes = [
  // Upper Left Sphere
  { position: [-3.0, 1.3, -0.6] as [number, number, number], scale: 1.0, color: '#1c3d64', opacity: 0.25 },
  // Top Center Sphere
  { position: [0.4, 2.05, -0.8] as [number, number, number], scale: 0.76, color: '#3d495a', opacity: 0.2 },
  // Top Right Sphere
  { position: [3.1, 1.25, -0.6] as [number, number, number], scale: 1.1, color: '#1f3652', opacity: 0.2 },
  // Center Bottom Sphere (AMBER/GOLD)
  { position: [0.05, -1.35, -0.4] as [number, number, number], scale: 1.45, color: '#9e6425', opacity: 0.35 },
  // Lower Right Sphere
  { position: [3.35, -1.3, -0.5] as [number, number, number], scale: 1.15, color: '#16385e', opacity: 0.25 },
]

function WireNode({ node, index }: { node: typeof nodes[number]; index: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * (index % 2 === 0 ? 0.03 : -0.025)
      ref.current.rotation.x += delta * 0.015
    }
  })
  return (
    <group ref={ref} position={node.position}>
      <mesh scale={node.scale}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={node.color} wireframe transparent opacity={node.opacity} />
      </mesh>
      <mesh scale={node.scale * 1.02}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={node.color} wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function Network() {
  const stars = useMemo(() => {
    const result: [number, number, number][] = []
    for (let i = 0; i < 90; i++) {
      result.push([
        ((i * 1.731) % 14) - 7,
        ((i * 2.379) % 9) - 4.5,
        -1.5 + ((i % 5) * -0.2)
      ])
    }
    return result
  }, [])

  return (
    <>
      {nodes.map((node, index) => (
        <WireNode key={index} node={node} index={index} />
      ))}
      
      {/* Curved Arcs / Lines connecting nodes */}
      <Line
        points={[[-3.0, 1.3, -0.6], [0.4, 2.05, -0.8], [3.1, 1.25, -0.6]]}
        color="#1d385c"
        transparent
        opacity={0.15}
        lineWidth={0.5}
      />
      <Line
        points={[[-3.0, 1.3, -0.6], [0.05, -1.35, -0.4], [3.35, -1.3, -0.5]]}
        color="#2a3d54"
        transparent
        opacity={0.15}
        lineWidth={0.5}
      />
      <Line
        points={[[0.4, 2.05, -0.8], [3.1, 1.25, -0.6], [3.35, -1.3, -0.5]]}
        color="#1d385c"
        transparent
        opacity={0.15}
        lineWidth={0.5}
      />
      
      {/* Background Stars / Dots */}
      {stars.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshBasicMaterial color="#777788" transparent opacity={0.45} />
        </mesh>
      ))}
    </>
  )
}

export function BizLensScene() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <Network />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_10%,var(--background)_100%)] opacity-100" />
    </div>
  )
}

