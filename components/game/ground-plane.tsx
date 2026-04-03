'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function GroundPlane() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create grid texture
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, 512, 512)
      
      // Grid lines
      ctx.strokeStyle = '#1e3a5f'
      ctx.lineWidth = 1
      
      const gridSize = 32
      for (let i = 0; i <= 512; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 512)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(512, i)
        ctx.stroke()
      }
      
      // Glow at center
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
      gradient.addColorStop(0, 'rgba(96, 165, 250, 0.15)')
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 512, 512)
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    
    return texture
  }, [])

  useFrame((state) => {
    if (meshRef.current && gridTexture) {
      gridTexture.offset.x = state.clock.elapsedTime * 0.02
      gridTexture.offset.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <>
      {/* Main ground plane */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          map={gridTexture}
          transparent
          opacity={0.8}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Fog plane for depth */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.1, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  )
}
