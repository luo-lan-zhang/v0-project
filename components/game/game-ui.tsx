'use client'

import { useGameStore } from '@/lib/game-store'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function GameUI() {
  const { gameState, score, bestScore, combo, chargePower, startGame, resetGame } = useGameStore()

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score Display */}
      <AnimatePresence>
        {(gameState === 'playing' || gameState === 'charging' || gameState === 'jumping') && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2"
          >
            <div className="glass-dark rounded-2xl px-8 py-4 text-center">
              <motion.div
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-white font-mono"
              >
                {score}
              </motion.div>
              {combo > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-yellow-400 font-semibold mt-1"
                >
                  连击 x{combo}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power Bar */}
      <AnimatePresence>
        {gameState === 'charging' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2"
          >
            <div className="glass-dark rounded-full px-6 py-3">
              <div className="w-48 h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-colors duration-200",
                    chargePower < 0.5 ? "bg-green-400" :
                    chargePower < 1 ? "bg-yellow-400" : "bg-red-400"
                  )}
                  style={{ width: `${Math.min(chargePower / 1.5 * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 text-center mt-2">蓄力中...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      <AnimatePresence>
        {gameState === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <div className="text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
                  跳一跳
                </h1>
                <p className="text-slate-400 text-lg mb-8">
                  按住空格键蓄力，松开跳跃
                </p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={startGame}
                className="group relative px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">开始游戏</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              </motion.button>

              {bestScore > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 glass-dark rounded-xl px-6 py-3 inline-block"
                >
                  <span className="text-slate-400">最高分: </span>
                  <span className="text-yellow-400 font-bold text-xl">{bestScore}</span>
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-slate-500 text-sm"
              >
                <p>💡 提示：落在平台中心可获得双倍分数</p>
                <p className="mt-2">支持键盘空格键或触屏操作</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-dark rounded-3xl p-8 md:p-12 text-center max-w-md mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-6xl mb-4"
              >
                🎮
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">游戏结束</h2>
              
              <div className="my-8 space-y-4">
                <div className="glass rounded-xl px-6 py-4">
                  <div className="text-slate-400 text-sm">本次得分</div>
                  <div className="text-4xl font-bold text-white font-mono">{score}</div>
                </div>
                
                {score >= bestScore && score > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-yellow-400 font-semibold"
                  >
                    🎉 新纪录！
                  </motion.div>
                )}
                
                <div className="text-slate-400">
                  最高分: <span className="text-yellow-400 font-bold">{bestScore}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startGame}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                >
                  再来一局
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetGame}
                  className="w-full px-8 py-3 rounded-xl bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors"
                >
                  返回首页
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions hint */}
      <AnimatePresence>
        {(gameState === 'playing' || gameState === 'charging' || gameState === 'jumping') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-dark rounded-full px-4 py-2 text-slate-400 text-sm"
          >
            按住 <kbd className="px-2 py-1 bg-slate-700 rounded text-white mx-1">空格</kbd> 蓄力跳跃
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
