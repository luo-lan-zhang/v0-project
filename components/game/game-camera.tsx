'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '@/lib/game-store'
import * as THREE from 'three'

export function GameCamera() {
  const { camera } = useThree()
  const { playerPosition, gameState } = useGameStore()
  const targetPosition = useRef(new THREE.Vector3(5, 8, 5))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    if (gameState === 'idle') {
      // Idle camera position - overview
      targetPosition.current.set(5, 8, 5)
      targetLookAt.current.set(0, 0, 0)
    } else {
      // Follow player with offset
      const offset = new THREE.Vector3(4, 6, 4)
      targetPosition.current.set(
        playerPosition[0] + offset.x,
        playerPosition[1] + offset.y,
        playerPosition[2] + offset.z
      )
      targetLookAt.current.set(
        playerPosition[0],
        playerPosition[1],
        playerPosition[2]
      )
    }

    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.05)
    
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    const targetDir = targetLookAt.current.clone().sub(camera.position).normalize()
    camera.lookAt(
      camera.position.x + THREE.MathUtils.lerp(currentLookAt.x, targetDir.x, 0.05) * 10,
      camera.position.y + THREE.MathUtils.lerp(currentLookAt.y, targetDir.y, 0.05) * 10,
      camera.position.z + THREE.MathUtils.lerp(currentLookAt.z, targetDir.z, 0.05) * 10
    )
  })

  return null
}
