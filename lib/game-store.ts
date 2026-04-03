import { create } from 'zustand'

export type GameState = 'idle' | 'playing' | 'charging' | 'jumping' | 'gameover'

interface Platform {
  id: number
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}

interface GameStore {
  // Game state
  gameState: GameState
  score: number
  bestScore: number
  combo: number
  
  // Player state
  playerPosition: [number, number, number]
  chargeStartTime: number | null
  chargePower: number
  
  // Platforms
  platforms: Platform[]
  currentPlatformIndex: number
  
  // Actions
  startGame: () => void
  endGame: () => void
  startCharging: () => void
  releaseJump: () => number
  updateChargePower: () => void
  setPlayerPosition: (position: [number, number, number]) => void
  addScore: (points: number, isPerfect: boolean) => void
  generateNextPlatform: () => void
  resetGame: () => void
}

const PLATFORM_COLORS = [
  '#60A5FA', // Blue
  '#34D399', // Green
  '#F472B6', // Pink
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#FB923C', // Orange
]

const generatePlatform = (id: number, prevPosition: [number, number, number]): Platform => {
  const direction = Math.random() > 0.5 ? 'x' : 'z'
  const distance = 1.5 + Math.random() * 1.5
  
  const newPosition: [number, number, number] = [
    direction === 'x' ? prevPosition[0] + distance : prevPosition[0],
    0,
    direction === 'z' ? prevPosition[2] + distance : prevPosition[2],
  ]
  
  const scale: [number, number, number] = [
    0.8 + Math.random() * 0.6,
    0.5 + Math.random() * 0.5,
    0.8 + Math.random() * 0.6,
  ]
  
  return {
    id,
    position: newPosition,
    scale,
    color: PLATFORM_COLORS[id % PLATFORM_COLORS.length],
  }
}

const initialPlatforms: Platform[] = [
  {
    id: 0,
    position: [0, 0, 0],
    scale: [1.2, 0.6, 1.2],
    color: PLATFORM_COLORS[0],
  },
  {
    id: 1,
    position: [2, 0, 0],
    scale: [1, 0.6, 1],
    color: PLATFORM_COLORS[1],
  },
]

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: 'idle',
  score: 0,
  bestScore: typeof window !== 'undefined' ? parseInt(localStorage.getItem('jumpBestScore') || '0') : 0,
  combo: 0,
  
  playerPosition: [0, 0.9, 0],
  chargeStartTime: null,
  chargePower: 0,
  
  platforms: initialPlatforms,
  currentPlatformIndex: 0,
  
  // Actions
  startGame: () => set({
    gameState: 'playing',
    score: 0,
    combo: 0,
    playerPosition: [0, 0.9, 0],
    platforms: [...initialPlatforms],
    currentPlatformIndex: 0,
    chargePower: 0,
    chargeStartTime: null,
  }),
  
  endGame: () => {
    const { score, bestScore } = get()
    const newBest = Math.max(score, bestScore)
    if (typeof window !== 'undefined') {
      localStorage.setItem('jumpBestScore', newBest.toString())
    }
    set({ gameState: 'gameover', bestScore: newBest })
  },
  
  startCharging: () => {
    const { gameState } = get()
    if (gameState !== 'playing') return
    set({ gameState: 'charging', chargeStartTime: Date.now(), chargePower: 0 })
  },
  
  releaseJump: () => {
    const { chargeStartTime, gameState } = get()
    if (gameState !== 'charging' || !chargeStartTime) return 0
    
    const chargeTime = Date.now() - chargeStartTime
    const power = Math.min(chargeTime / 1000, 1.5) * 3
    
    set({ gameState: 'jumping', chargeStartTime: null, chargePower: 0 })
    return power
  },
  
  updateChargePower: () => {
    const { chargeStartTime, gameState } = get()
    if (gameState !== 'charging' || !chargeStartTime) return
    
    const chargeTime = Date.now() - chargeStartTime
    const power = Math.min(chargeTime / 1000, 1.5)
    set({ chargePower: power })
  },
  
  setPlayerPosition: (position) => set({ playerPosition: position }),
  
  addScore: (points, isPerfect) => {
    const { score, combo } = get()
    const newCombo = isPerfect ? combo + 1 : 0
    const bonusPoints = isPerfect ? newCombo * 2 : 0
    set({ score: score + points + bonusPoints, combo: newCombo })
  },
  
  generateNextPlatform: () => {
    const { platforms, currentPlatformIndex } = get()
    const lastPlatform = platforms[platforms.length - 1]
    const newPlatform = generatePlatform(lastPlatform.id + 1, lastPlatform.position)
    
    set({
      platforms: [...platforms, newPlatform],
      currentPlatformIndex: currentPlatformIndex + 1,
      gameState: 'playing',
    })
  },
  
  resetGame: () => set({
    gameState: 'idle',
    score: 0,
    combo: 0,
    playerPosition: [0, 0.9, 0],
    platforms: [...initialPlatforms],
    currentPlatformIndex: 0,
    chargePower: 0,
    chargeStartTime: null,
  }),
}))
