import { useState, useEffect } from 'react'

type GameState = 'ready' | 'playing' | 'won' | 'lost'
type Fruit = {
  id: number
  x: number
  y: number
  type: 'apple' | 'banana' | 'orange' | 'grape'
}

function App() {
  const [gameState, setGameState] = useState<GameState>('ready')
  const [score, setScore] = useState(0)
  const [fruitsEaten, setFruitsEaten] = useState(0)
  const [currentFruit, setCurrentFruit] = useState<Fruit | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [lastFruitTime, setLastFruitTime] = useState<number>(0)
  const [capybaraPosition, setCapybaraPosition] = useState({ x: 300, y: 400 })

  const FRUITS_TO_WIN = 20
  const FRUIT_SCORE = 5
  const TIME_PENALTY = 5
  const FRUIT_INTERVAL = 10

  useEffect(() => {
    if (gameState === 'playing' && !currentFruit && fruitsEaten < FRUITS_TO_WIN) {
      spawnFruit()
    }

    if (gameState === 'playing' && currentFruit) {
      const elapsed = Math.floor((Date.now() - lastFruitTime) / 1000)
      setTimeLeft(FRUIT_INTERVAL - elapsed)

      if (elapsed >= FRUIT_INTERVAL) {
        setScore((prev) => Math.max(0, prev - TIME_PENALTY))
        spawnFruit()
      }
    }
  }, [gameState, currentFruit, lastFruitTime, fruitsEaten])

  const spawnFruit = () => {
    const newFruit: Fruit = {
      id: Date.now(),
      x: Math.random() * 600 + 50,
      y: Math.random() * 300 + 100,
      type: ['apple', 'banana', 'orange', 'grape'][Math.floor(Math.random() * 4)] as Fruit['type'],
    }
    setCurrentFruit(newFruit)
    setLastFruitTime(Date.now())
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setFruitsEaten(0)
    setTimeLeft(FRUIT_INTERVAL)
    setCurrentFruit(null)
    spawnFruit()
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

  const getFruitEmoji = (type: string) => {
    const emojis = {
      apple: '🍎',
      banana: '🍌',
      orange: '🍊',
      grape: '🍇',
    }
    return emojis[type as keyof typeof emojis]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {gameState === 'ready' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h1 className="text-5xl font-bold mb-4 text-gray-800">🌿 卡皮巴拉和洋洋 🌿</h1>
            {/* 洋洋和卡皮巴拉展示 */}
            <div className="flex justify-center items-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <img src="/yangyang.png" alt="洋洋" className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow" />
                <span className="text-sm font-bold text-purple-600 mt-1">洋洋</span>
              </div>
              <div className="text-5xl">❤️</div>
              <div className="flex flex-col items-center">
                <div className="text-7xl">🦫</div>
                <span className="text-sm font-bold text-green-600 mt-1">卡皮巴拉</span>
              </div>
            </div>
            <div className="mb-8 space-y-4">
              <p className="text-2xl text-gray-600">第一关：洋洋喂卡皮巴拉吃水果</p>
              <div className="bg-sky-50 rounded-lg p-6 text-left">
                <p className="text-lg mb-2">📋 游戏规则：</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• 每个水果 <span className="font-bold text-green-600">+5 分</span></li>
                  <li>• 喂完 <span className="font-bold text-blue-600">20 个水果</span> 过关</li>
                  <li>• 每个水果间隔 <span className="font-bold text-red-600">不超过 10 秒</span></li>
                  <li>• 超时扣 <span className="font-bold text-red-600">-5 分</span></li>
                </ul>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-2xl font-bold rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg"
            >
              开始游戏 🎮
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex justify-between items-center">
              <div className="text-white text-xl font-bold">
                得分: <span className="text-yellow-300">{score}</span>
              </div>
              <div className="text-white text-xl font-bold">
                进度: <span className="text-yellow-300">{fruitsEaten}</span> / {FRUITS_TO_WIN}
              </div>
              <div className={`text-xl font-bold ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            <div className="relative h-[600px] bg-gradient-to-b from-green-100 to-green-200 overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-300 to-transparent"></div>
              
              {/* 卡皮巴拉 */}
              <div
                className="absolute text-8xl transition-all duration-300"
                style={{
                  left: `${capybaraPosition.x}px`,
                  top: `${capybaraPosition.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                🦫
              </div>

              {/* 洋洋角色 */}
              <div className="absolute left-6 bottom-24 flex flex-col items-center">
                <img
                  src="/yangyang.png"
                  alt="洋洋"
                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                />
                <p className="text-sm font-bold text-purple-600 mt-1 bg-white bg-opacity-80 rounded px-2 py-1">洋洋</p>
              </div>

              {/* 水果 */}
              {currentFruit && (
                <button
                  onClick={handleFruitClick}
                  className="absolute text-6xl cursor-pointer hover:scale-125 transition-transform animate-bounce"
                  style={{
                    left: `${currentFruit.x}px`,
                    top: `${currentFruit.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {getFruitEmoji(currentFruit.type)}
                </button>
              )}

              {/* 装饰元素 */}
              <div className="absolute top-10 left-10 text-4xl">🌸</div>
              <div className="absolute top-20 right-20 text-4xl">🌺</div>
              <div className="absolute bottom-32 left-20 text-4xl">🌼</div>
              <div className="absolute bottom-40 right-10 text-4xl">🌻</div>
            </div>
          </div>
        )}

        {gameState === 'won' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-5xl font-bold mb-6 text-green-600">🎉 恭喜过关！🎉</h2>
            <div className="mb-8">
              <p className="text-3xl text-gray-700 mb-4">洋洋成功喂了卡皮巴拉 20 个水果！</p>
              <p className="text-4xl font-bold text-yellow-600">最终得分: {score}</p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold rounded-full hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-lg"
            >
              再玩一次 🔄
            </button>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-5xl font-bold mb-6 text-red-600">😢 游戏结束</h2>
            <div className="mb-8">
              <p className="text-3xl text-gray-700 mb-4">洋洋没能及时喂完卡皮巴拉...</p>
              <p className="text-4xl font-bold text-yellow-600">得分: {score}</p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold rounded-full hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-lg"
            >
              再试一次 💪
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
