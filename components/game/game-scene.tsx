'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Float } from '@react-three/drei'
import { Player } from './player'
import { Platforms } from './platforms'
import { GameCamera } from './game-camera'
import { GameLights } from './game-lights'
import { GroundPlane } from './ground-plane'

export function GameScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [5, 8, 5], fov: 50 }}
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <Suspense fallback={null}>
        <GameCamera />
        <GameLights />
        
        {/* Background fog for depth */}
        <fog attach="fog" args={['#1a1a2e', 15, 40]} />
        
        {/* Ground */}
        <GroundPlane />
        
        {/* Game Elements */}
        <Platforms />
        <Player />
        
        {/* Decorative elements */}
        <FloatingParticles />
      </Suspense>
    </Canvas>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 20,
      Math.random() * 10 + 2,
      (Math.random() - 0.5) * 20,
    ] as [number, number, number],
    scale: 0.02 + Math.random() * 0.03,
  }))

  return (
    <>
      {particles.map((particle, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0} floatIntensity={2}>
          <mesh position={particle.position}>
            <sphereGeometry args={[particle.scale, 8, 8]} />
            <meshStandardMaterial
              color="#60A5FA"
              emissive="#60A5FA"
              emissiveIntensity={2}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}
