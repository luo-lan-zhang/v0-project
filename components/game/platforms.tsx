'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/lib/game-store'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export function Platforms() {
  const { platforms, currentPlatformIndex } = useGameStore()

  return (
    <>
      {platforms.map((platform, index) => (
        <Platform
          key={platform.id}
          position={platform.position}
          scale={platform.scale}
          color={platform.color}
          isActive={index === currentPlatformIndex}
          isNext={index === currentPlatformIndex + 1}
          isPast={index < currentPlatformIndex}
        />
      ))}
    </>
  )
}

interface PlatformProps {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  isActive: boolean
  isNext: boolean
  isPast: boolean
}

function Platform({ position, scale, color, isActive, isNext, isPast }: PlatformProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return

    // Subtle hover animation for next platform
    if (isNext) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.03
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1)
    }

    // Fade out past platforms
    if (isPast && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = THREE.MathUtils.lerp(
        meshRef.current.material.opacity,
        0.3,
        0.05
      )
    }
  })

  return (
    <group position={position}>
      {/* Main platform */}
      <RoundedBox
        ref={meshRef}
        args={scale}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={isPast ? 0.5 : 1}
        />
      </RoundedBox>

      {/* Top surface glow */}
      <mesh
        ref={glowRef}
        position={[0, scale[1] / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[scale[0] * 0.8, scale[2] * 0.8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isNext ? 0.4 : isActive ? 0.2 : 0.1}
        />
      </mesh>

      {/* Edge glow for active/next platform */}
      {(isActive || isNext) && (
        <mesh position={[0, -scale[1] / 2 + 0.02, 0]}>
          <boxGeometry args={[scale[0] + 0.05, 0.02, scale[2] + 0.05]} />
          <meshStandardMaterial
            color={isNext ? '#60A5FA' : '#34D399'}
            emissive={isNext ? '#60A5FA' : '#34D399'}
            emissiveIntensity={isNext ? 2 : 1}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Perfect landing indicator for next platform */}
      {isNext && (
        <mesh
          position={[0, scale[1] / 2 + 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.05, 0.12, 32]} />
          <meshBasicMaterial
            color="#FBBF24"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  )
}
