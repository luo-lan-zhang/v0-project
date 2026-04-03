'use client'

export function GameLights() {
  return (
    <>
      {/* Main directional light */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill light */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#60A5FA"
      />

      {/* Ambient light */}
      <ambientLight intensity={0.4} />

      {/* Rim light */}
      <pointLight
        position={[0, 10, -10]}
        intensity={0.5}
        color="#A78BFA"
      />

      {/* Ground bounce light */}
      <pointLight
        position={[0, -5, 0]}
        intensity={0.2}
        color="#34D399"
      />
    </>
  )
}
