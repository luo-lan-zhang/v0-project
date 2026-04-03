'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/lib/game-store'
import * as THREE from 'three'

export function Player() {
  const meshRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const { 
    gameState, 
    playerPosition, 
    chargePower,
    platforms,
    currentPlatformIndex,
    setPlayerPosition,
    addScore,
    generateNextPlatform,
    endGame,
    updateChargePower,
  } = useGameStore()
  
  const jumpState = useRef({
    isJumping: false,
    jumpPower: 0,
    velocity: new THREE.Vector3(),
    startPosition: new THREE.Vector3(),
    targetDirection: new THREE.Vector3(),
  })

  // Calculate jump target direction
  useEffect(() => {
    if (currentPlatformIndex < platforms.length - 1) {
      const current = platforms[currentPlatformIndex]
      const next = platforms[currentPlatformIndex + 1]
      const direction = new THREE.Vector3(
        next.position[0] - current.position[0],
        0,
        next.position[2] - current.position[2]
      ).normalize()
      jumpState.current.targetDirection = direction
    }
  }, [currentPlatformIndex, platforms])

  // Handle keyboard/touch events
  useEffect(() => {
    const startCharging = useGameStore.getState().startCharging
    const releaseJump = useGameStore.getState().releaseJump

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        startCharging()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        const power = releaseJump()
        if (power > 0) {
          jumpState.current.isJumping = true
          jumpState.current.jumpPower = power
          jumpState.current.startPosition.set(...playerPosition)
          jumpState.current.velocity.set(
            jumpState.current.targetDirection.x * power * 1.2,
            power * 2,
            jumpState.current.targetDirection.z * power * 1.2
          )
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      startCharging()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      const power = releaseJump()
      if (power > 0) {
        jumpState.current.isJumping = true
        jumpState.current.jumpPower = power
        jumpState.current.startPosition.set(...playerPosition)
        jumpState.current.velocity.set(
          jumpState.current.targetDirection.x * power * 1.2,
          power * 2,
          jumpState.current.targetDirection.z * power * 1.2
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [playerPosition])

  useFrame((state, delta) => {
    if (!meshRef.current || !bodyRef.current) return

    // Update charge power for UI
    if (gameState === 'charging') {
      updateChargePower()
    }

    // Squish effect when charging
    if (gameState === 'charging') {
      const squish = 1 - chargePower * 0.3
      bodyRef.current.scale.y = squish
      bodyRef.current.scale.x = 1 + chargePower * 0.2
      bodyRef.current.scale.z = 1 + chargePower * 0.2
      bodyRef.current.position.y = -chargePower * 0.15
    } else {
      // Smooth return to normal
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 1, 0.1)
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, 1, 0.1)
      bodyRef.current.scale.z = THREE.MathUtils.lerp(bodyRef.current.scale.z, 1, 0.1)
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0, 0.1)
    }

    // Jump physics
    if (jumpState.current.isJumping) {
      const gravity = 15
      jumpState.current.velocity.y -= gravity * delta

      meshRef.current.position.x += jumpState.current.velocity.x * delta
      meshRef.current.position.y += jumpState.current.velocity.y * delta
      meshRef.current.position.z += jumpState.current.velocity.z * delta

      // Rotation during jump
      const rotationAxis = new THREE.Vector3(
        -jumpState.current.targetDirection.z,
        0,
        jumpState.current.targetDirection.x
      )
      meshRef.current.rotateOnWorldAxis(rotationAxis, delta * 8)

      // Check landing
      const nextPlatform = platforms[currentPlatformIndex + 1]
      if (nextPlatform && meshRef.current.position.y <= nextPlatform.position[1] + nextPlatform.scale[1] / 2 + 0.3) {
        const dx = meshRef.current.position.x - nextPlatform.position[0]
        const dz = meshRef.current.position.z - nextPlatform.position[2]
        const distance = Math.sqrt(dx * dx + dz * dz)
        const platformRadius = Math.min(nextPlatform.scale[0], nextPlatform.scale[2]) / 2

        if (distance < platformRadius + 0.2) {
          // Landed successfully
          jumpState.current.isJumping = false
          meshRef.current.rotation.set(0, 0, 0)
          
          const landY = nextPlatform.position[1] + nextPlatform.scale[1] / 2 + 0.3
          meshRef.current.position.y = landY
          
          const newPosition: [number, number, number] = [
            meshRef.current.position.x,
            landY,
            meshRef.current.position.z,
          ]
          setPlayerPosition(newPosition)

          // Score based on accuracy
          const isPerfect = distance < 0.15
          addScore(isPerfect ? 2 : 1, isPerfect)
          generateNextPlatform()
        }
      }

      // Check if fell
      if (meshRef.current.position.y < -3) {
        jumpState.current.isJumping = false
        endGame()
      }
    } else {
      // Idle animation
      if (gameState === 'playing' || gameState === 'idle') {
        meshRef.current.position.y = playerPosition[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02
      }
    }

    // Update mesh position when not jumping
    if (!jumpState.current.isJumping && gameState !== 'gameover') {
      meshRef.current.position.x = playerPosition[0]
      meshRef.current.position.z = playerPosition[2]
    }
  })

  return (
    <group ref={meshRef} position={playerPosition}>
      <group ref={bodyRef}>
        {/* Main body */}
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.06, 0.1, 0.12]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.06, 0.1, 0.12]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Glow ring */}
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#60A5FA"
            emissive="#60A5FA"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
      
      {/* Shadow indicator */}
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
