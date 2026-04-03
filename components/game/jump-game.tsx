'use client'

import dynamic from 'next/dynamic'
import { GameUI } from './game-ui'

// Dynamic import for Three.js components to avoid SSR issues
const GameScene = dynamic(
  () => import('./game-scene').then((mod) => mod.GameScene),
  { ssr: false }
)

export function JumpGame() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* 3D Canvas */}
      <GameScene />
      
      {/* UI Overlay */}
      <GameUI />
      
      {/* Decorative gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-900/80 to-transparent" />
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
