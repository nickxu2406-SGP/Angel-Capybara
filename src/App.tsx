import { useState, useEffect, useRef } from 'react'
import yangyangImg from '/yangyang.png'
import momImg from '/mom.png'

type GameLevel = 0 | 1 | 2
type GameState = 'menu' | 'playing' | 'won'
type Winner = 'yangyang' | 'mom' | null

// 第一关：喂水果
type Fruit = {
  id: number
  x: number
  y: number
  type: 'apple' | 'banana' | 'orange' | 'grape'
}

function App() {
  const [gameLevel, setGameLevel] = useState<GameLevel>(0)
  const [gameState, setGameState] = useState<GameState>('menu')
  
  // 第一关状态
  const [score, setScore] = useState(0)
  const [fruitsEaten, setFruitsEaten] = useState(0)
  const [currentFruit, setCurrentFruit] = useState<Fruit | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [lastFruitTime, setLastFruitTime] = useState<number>(0)
  const [capybaraPosition, setCapybaraPosition] = useState({ x: 50, y: 75 })

  // 第二关状态
  const [yangyangScore, setYangyangScore] = useState(0)
  const [momScore, setMomScore] = useState(0)
  const [winner, setWinner] = useState<Winner>(null)
  const [capybaraTarget, setCapybaraTarget] = useState<'left' | 'right' | 'center'>('center')

  const gameAreaRef = useRef<HTMLDivElement>(null)

  // 第一关常量
  const FRUITS_TO_WIN = 20
  const FRUIT_SCORE = 5
  const TIME_PENALTY = 5
  const FRUIT_INTERVAL = 10

  // 第二关常量
  const SCORE_TO_WIN = 100
  const FOOD_SCORE = 10

  // 第一关逻辑
  useEffect(() => {
    if (gameLevel === 1 && gameState === 'playing' && !currentFruit && fruitsEaten < FRUITS_TO_WIN) {
      spawnFruit()
    }

    if (gameLevel === 1 && gameState === 'playing' && currentFruit) {
      const elapsed = Math.floor((Date.now() - lastFruitTime) / 1000)
      setTimeLeft(FRUIT_INTERVAL - elapsed)

      if (elapsed >= FRUIT_INTERVAL) {
        setScore((prev) => Math.max(0, prev - TIME_PENALTY))
        spawnFruit()
      }
    }
  }, [gameLevel, gameState, currentFruit, lastFruitTime, fruitsEaten])

  // 第二关：检查获胜
  useEffect(() => {
    if (gameLevel === 2 && gameState === 'playing') {
      if (yangyangScore >= SCORE_TO_WIN) {
        setWinner('yangyang')
        setGameState('won')
        setCapybaraTarget('left')
      } else if (momScore >= SCORE_TO_WIN) {
        setWinner('mom')
        setGameState('won')
        setCapybaraTarget('right')
      }
    }
  }, [gameLevel, gameState, yangyangScore, momScore])

  const spawnFruit = () => {
    const newFruit: Fruit = {
      id: Date.now(),
      x: Math.random() * 70 + 15,
      y: Math.random() * 60 + 15,
      type: ['apple', 'banana', 'orange', 'grape'][Math.floor(Math.random() * 4)] as Fruit['type'],
    }
    setCurrentFruit(newFruit)
    setLastFruitTime(Date.now())
  }

  const startLevel1 = () => {
    setGameLevel(1)
    setGameState('playing')
    setScore(0)
    setFruitsEaten(0)
    setTimeLeft(FRUIT_INTERVAL)
    setCurrentFruit(null)
    setCapybaraPosition({ x: 50, y: 75 })
    spawnFruit()
  }

  const startLevel2 = () => {
    setGameLevel(2)
    setGameState('playing')
    setYangyangScore(0)
    setMomScore(0)
    setWinner(null)
    setCapybaraTarget('center')
  }

  const handleFruitClick = () => {
    if (!currentFruit || gameState !== 'playing') return

    setScore((prev) => prev + FRUIT_SCORE)
    setFruitsEaten((prev) => {
      const newCount = prev + 1
      if (newCount >= FRUITS_TO_WIN) {
        setGameState('won')
      } else {
        setCurrentFruit(null)
        setTimeout(() => spawnFruit(), 300)
      }
      return newCount
    })
  }

  const handleYangyangEat = () => {
    if (gameState !== 'playing') return
    setYangyangScore(prev => Math.min(SCORE_TO_WIN, prev + FOOD_SCORE))
  }

  const handleMomEat = () => {
    if (gameState !== 'playing') return
    setMomScore(prev => Math.min(SCORE_TO_WIN, prev + FOOD_SCORE))
  }

  const getFruitEmoji = (type: string) => {
    const emojis = {
      apple: '🍎',
      banana: '🍌',
      orange: '🍊',
      grape: '🍇',
    }
    return emojis[type as keyof typeof emojis]
  }

  const backToMenu = () => {
    setGameLevel(0)
    setGameState('menu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center p-2 sm:p-4 game-wrapper">
      <div className="w-full max-w-4xl">
        
        {/* 主菜单 */}
        {gameLevel === 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">🌿 卡皮巴拉乐园 🌿</h1>
            
            <div className="flex justify-center items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="flex flex-col items-center">
                <img src={yangyangImg} alt="洋洋" className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-yellow-400 shadow" />
                <span className="text-xs sm:text-sm font-bold text-purple-600 mt-1">洋洋</span>
              </div>
              <div className="text-4xl sm:text-6xl">🦫</div>
              <div className="flex flex-col items-center">
                <img src={momImg} alt="妈妈" className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-pink-400 shadow" />
                <span className="text-xs sm:text-sm font-bold text-pink-600 mt-1">妈妈</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startLevel1}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg"
              >
                第一关：喂卡皮巴拉 🍎
              </button>
              <button
                onClick={startLevel2}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                第二关：吃饭比赛 🍕🥟
              </button>
            </div>
          </div>
        )}

        {/* 第一关：喂水果 */}
        {gameLevel === 1 && gameState === 'playing' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 sm:p-4 flex justify-between items-center">
              <div className="text-white text-sm sm:text-xl font-bold">
                得分: <span className="text-yellow-300">{score}</span>
              </div>
              <div className="text-white text-sm sm:text-xl font-bold">
                进度: <span className="text-yellow-300">{fruitsEaten}</span> / {FRUITS_TO_WIN}
              </div>
              <div className={`text-sm sm:text-xl font-bold ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            <div
              ref={gameAreaRef}
              className="relative game-area h-[50vh] sm:h-[60vh] md:h-[500px] bg-gradient-to-b from-green-100 to-green-200 overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-green-300 to-transparent"></div>

              <div
                className="absolute text-6xl sm:text-8xl transition-all duration-300"
                style={{
                  left: `${capybaraPosition.x}%`,
                  top: `${capybaraPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                🦫
              </div>

              <div className="absolute left-4 sm:left-6 bottom-20 sm:bottom-24 flex flex-col items-center">
                <img
                  src={yangyangImg}
                  alt="洋洋"
                  className="w-16 sm:w-24 h-16 sm:h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                />
                <p className="text-xs sm:text-sm font-bold text-purple-600 mt-1 bg-white bg-opacity-80 rounded px-2 py-1">洋洋</p>
              </div>

              {currentFruit && (
                <button
                  onClick={handleFruitClick}
                  className="absolute text-5xl sm:text-6xl cursor-pointer hover:scale-125 transition-transform animate-bounce"
                  style={{
                    left: `${currentFruit.x}%`,
                    top: `${currentFruit.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {getFruitEmoji(currentFruit.type)}
                </button>
              )}

              <div className="absolute top-8 left-8 text-3xl sm:text-4xl">🌸</div>
              <div className="absolute top-16 right-16 text-3xl sm:text-4xl">🌺</div>
            </div>
          </div>
        )}

        {/* 第一关胜利 */}
        {gameLevel === 1 && gameState === 'won' && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-green-600">🎉 第一关通过！🎉</h2>
            <div className="mb-6 sm:mb-8">
              <p className="text-xl sm:text-3xl text-gray-700 mb-4">洋洋成功喂了卡皮巴拉 {FRUITS_TO_WIN} 个水果！</p>
              <p className="text-2xl sm:text-4xl font-bold text-yellow-600">得分: {score}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={startLevel2}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                进入第二关 ➡️
              </button>
              <button
                onClick={backToMenu}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 text-lg font-bold rounded-full hover:bg-gray-300 transition-all"
              >
                返回菜单
              </button>
            </div>
          </div>
        )}

        {/* 第二关：吃饭比赛 */}
        {gameLevel === 2 && gameState === 'playing' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-2 sm:p-4 text-center">
              <div className="text-white text-lg sm:text-2xl font-bold mb-2">
                🏆 吃饭比赛 - 先到 {SCORE_TO_WIN} 分获胜！
              </div>
              <div className="flex justify-center gap-8 sm:gap-16">
                <div className="text-yellow-300 text-xl sm:text-3xl font-bold">
                  洋洋: {yangyangScore}
                </div>
                <div className="text-yellow-300 text-xl sm:text-3xl font-bold">
                  妈妈: {momScore}
                </div>
              </div>
            </div>

            <div className="relative game-area h-[50vh] sm:h-[60vh] md:h-[500px] bg-gradient-to-b from-orange-100 to-yellow-100 overflow-hidden">
              {/* 卡皮巴拉在中间观察 */}
              <div
                className={`absolute text-6xl sm:text-8xl transition-all duration-1000 ${
                  capybaraTarget === 'left' ? 'left-[25%]' : capybaraTarget === 'right' ? 'left-[75%]' : 'left-[50%]'
                }`}
                style={{
                  top: '40%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                🦫
              </div>

              {/* 洋洋区域 - 左边 */}
              <div className="absolute left-0 top-0 bottom-0 w-1/2 flex flex-col items-center justify-center border-r-4 border-dashed border-orange-300">
                <img
                  src={yangyangImg}
                  alt="洋洋"
                  className="w-20 sm:w-28 h-20 sm:h-28 rounded-full object-cover border-4 border-yellow-400 shadow-lg mb-4"
                />
                <p className="text-lg sm:text-xl font-bold text-purple-600 mb-4">洋洋</p>
                
                {/* 披萨按钮 */}
                <button
                  onClick={handleYangyangEat}
                  className="text-6xl sm:text-8xl cursor-pointer hover:scale-110 active:scale-95 transition-transform animate-pulse"
                >
                  🍕
                </button>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-4">{yangyangScore} 分</p>
              </div>

              {/* 妈妈区域 - 右边 */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 flex flex-col items-center justify-center">
                <img
                  src={momImg}
                  alt="妈妈"
                  className="w-20 sm:w-28 h-20 sm:h-28 rounded-full object-cover border-4 border-pink-400 shadow-lg mb-4"
                />
                <p className="text-lg sm:text-xl font-bold text-pink-600 mb-4">妈妈</p>
                
                {/* 包子按钮 */}
                <button
                  onClick={handleMomEat}
                  className="text-6xl sm:text-8xl cursor-pointer hover:scale-110 active:scale-95 transition-transform animate-pulse"
                >
                  🥟
                </button>
                <p className="text-2xl sm:text-3xl font-bold text-pink-600 mt-4">{momScore} 分</p>
              </div>
            </div>
          </div>
        )}

        {/* 第二关胜利 */}
        {gameLevel === 2 && gameState === 'won' && winner && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-yellow-600">🏆 比赛结束！🏆</h2>
            
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <img
                  src={winner === 'yangyang' ? yangyangImg : momImg}
                  alt={winner === 'yangyang' ? '洋洋' : '妈妈'}
                  className="w-24 sm:w-32 h-24 sm:h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                />
                <div className="text-5xl sm:text-7xl">🦫</div>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                {winner === 'yangyang' ? '洋洋' : '妈妈'}获胜！
              </p>
              <p className="text-xl sm:text-2xl text-gray-600">
                卡皮巴拉跑向了{winner === 'yangyang' ? '洋洋' : '妈妈'}！
              </p>
              <div className="mt-6 text-lg sm:text-xl text-gray-500">
                最终比分：洋洋 {yangyangScore} - {momScore} 妈妈
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startLevel2}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                再比一次 🔄
              </button>
              <button
                onClick={backToMenu}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 text-lg font-bold rounded-full hover:bg-gray-300 transition-all"
              >
                返回菜单
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
