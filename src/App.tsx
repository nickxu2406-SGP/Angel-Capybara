import { useState, useEffect, useRef } from 'react'
import yangyangImg from '/yangyang.png'
import momImg from '/mom.png'
import dengdengImg from '/dengdeng.png'

type GameLevel = 0 | 1 | 2 | 3 | 4 | 5
type GameState = 'menu' | 'playing' | 'won' | 'failed'
type Winner = 'yangyang' | 'mom' | null

// 第一关：喂水果
type Fruit = {
  id: number
  x: number
  y: number
  type: 'apple' | 'banana' | 'orange' | 'grape'
}

// 第四关：人物重量
type Character = {
  id: string
  name: string
  weight: number
  img: string
  side: 'left' | 'right' | 'none'
}

// 拖拽状态
type DragInfo = {
  characterId: string
  startX: number
  startY: number
} | null

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

  // 第三关状态
  const [dengdengScore, setDengdengScore] = useState(0)
  const [level3TimeLeft, setLevel3TimeLeft] = useState(20)
  const [showPunishment, setShowPunishment] = useState(false)
  const level3TimerRef = useRef<NodeJS.Timeout | null>(null)

  // 第四关状态
  const [level4TimeLeft, setLevel4TimeLeft] = useState(30)
  const [characters, setCharacters] = useState<Character[]>([
    { id: 'dengdeng', name: '等等', weight: 10, img: dengdengImg, side: 'none' },
    { id: 'capybara', name: '卡皮巴拉', weight: 5, img: '', side: 'none' },
    { id: 'yangyang', name: '洋洋', weight: 35, img: yangyangImg, side: 'none' },
    { id: 'mom', name: '妈妈', weight: 40, img: momImg, side: 'none' },
  ])
  const level4TimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 拖拽状态
  const [dragInfo, setDragInfo] = useState<DragInfo>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // 第一关常量
  const FRUITS_TO_WIN = 20
  const FRUIT_SCORE = 5
  const TIME_PENALTY = 5
  const FRUIT_INTERVAL = 10

  // 第二关常量
  const SCORE_TO_WIN = 100
  const FOOD_SCORE = 10

  // 第三关常量
  const LEVEL3_TARGET = 100
  const LEVEL3_TIME = 20
  const BAOZI_SCORE = 10

  // 第四关常量
  const LEVEL4_TIME = 30

  // 第五关数据
  const LEVEL5_TIME = 30

  type WordSlot = {
    wordId: number
    display: string[]        // 显示字符数组（含下划线）
    answer: string[]         // 正确答案数组
    missingIndices: number[]  // 缺失字母的位置
    filled: (string | null)[] // 当前填充
  }

  const makeLevel5Slots = (): WordSlot[] => [
    {
      wordId: 1,
      display: ['K', '_', 'L', 'L'],
      answer: ['K', 'I', 'L', 'L'],
      missingIndices: [1],
      filled: [null, null, null, null],
    },
    {
      wordId: 2,
      display: ['A', 'D', '_', 'L', 'T'],
      answer: ['A', 'D', 'U', 'L', 'T'],
      missingIndices: [2],
      filled: [null, null, null, null, null],
    },
    {
      wordId: 3,
      display: ['M', '_', 'R', 'R', '_', 'R'],
      answer: ['M', 'I', 'R', 'R', 'O', 'R'],
      missingIndices: [1, 4],
      filled: [null, null, null, null, null, null],
    },
    {
      wordId: 4,
      display: ['M', '_', 'G', 'I', 'C'],
      answer: ['M', 'A', 'G', 'I', 'C'],
      missingIndices: [1],
      filled: [null, null, null, null, null],
    },
    {
      wordId: 5,
      display: ['H', '_', 'N', 'T', 'E', 'R'],
      answer: ['H', 'U', 'N', 'T', 'E', 'R'],
      missingIndices: [1],
      filled: [null, null, null, null, null, null],
    },
  ]

  const [level5TimeLeft, setLevel5TimeLeft] = useState(LEVEL5_TIME)
  const [wordSlots, setWordSlots] = useState<WordSlot[]>(makeLevel5Slots())
  const [availableLetters, setAvailableLetters] = useState<string[]>(['I', 'U', 'A', 'I', 'O'])
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null)
  const level5TimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // 第三关：倒计时逻辑
  useEffect(() => {
    if (gameLevel === 3 && gameState === 'playing') {
      level3TimerRef.current = setInterval(() => {
        setLevel3TimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(level3TimerRef.current!)
            setGameState('failed')
            setShowPunishment(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        if (level3TimerRef.current) clearInterval(level3TimerRef.current)
      }
    }
  }, [gameLevel, gameState])

  // 第三关：检查获胜
  useEffect(() => {
    if (gameLevel === 3 && gameState === 'playing' && dengdengScore >= LEVEL3_TARGET) {
      if (level3TimerRef.current) clearInterval(level3TimerRef.current)
      setGameState('won')
    }
  }, [gameLevel, gameState, dengdengScore])

  // 第四关：倒计时逻辑
  useEffect(() => {
    if (gameLevel === 4 && gameState === 'playing') {
      level4TimerRef.current = setInterval(() => {
        setLevel4TimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(level4TimerRef.current!)
            setGameState('failed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        if (level4TimerRef.current) clearInterval(level4TimerRef.current)
      }
    }
  }, [gameLevel, gameState])

  // 第五关：倒计时逻辑
  useEffect(() => {
    if (gameLevel === 5 && gameState === 'playing') {
      level5TimerRef.current = setInterval(() => {
        setLevel5TimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(level5TimerRef.current!)
            setGameState('failed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        if (level5TimerRef.current) clearInterval(level5TimerRef.current)
      }
    }
  }, [gameLevel, gameState])

  // 第四关：检查平衡
  useEffect(() => {
    if (gameLevel === 4 && gameState === 'playing') {
      const leftWeight = characters.filter(c => c.side === 'left').reduce((sum, c) => sum + c.weight, 0)
      const rightWeight = characters.filter(c => c.side === 'right').reduce((sum, c) => sum + c.weight, 0)
      
      // 检查是否所有人都已放置
      const allPlaced = characters.every(c => c.side !== 'none')
      
      if (allPlaced && leftWeight === rightWeight && leftWeight > 0) {
        if (level4TimerRef.current) clearInterval(level4TimerRef.current)
        setGameState('won')
      }
    }
  }, [gameLevel, gameState, characters])

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

  const startLevel3 = () => {
    setGameLevel(3)
    setGameState('playing')
    setDengdengScore(0)
    setLevel3TimeLeft(LEVEL3_TIME)
    setShowPunishment(false)
  }

  const startLevel4 = () => {
    setGameLevel(4)
    setGameState('playing')
    setLevel4TimeLeft(LEVEL4_TIME)
    setCharacters([
      { id: 'dengdeng', name: '等等', weight: 10, img: dengdengImg, side: 'none' },
      { id: 'capybara', name: '卡皮巴拉', weight: 5, img: '', side: 'none' },
      { id: 'yangyang', name: '洋洋', weight: 35, img: yangyangImg, side: 'none' },
      { id: 'mom', name: '妈妈', weight: 40, img: momImg, side: 'none' },
    ])
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

  const handleDengdengEat = () => {
    if (gameState !== 'playing') return
    setDengdengScore(prev => Math.min(LEVEL3_TARGET, prev + BAOZI_SCORE))
  }

  // 第四关：拖拽处理
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, characterId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragInfo({
      characterId,
      startX: clientX,
      startY: clientY
    })
    setDragPosition({ x: clientX, y: clientY })
  }

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragInfo) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragPosition({ x: clientX, y: clientY })
  }

  const handleDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!dragInfo || !gameAreaRef.current) {
      setDragInfo(null)
      return
    }

    const rect = gameAreaRef.current.getBoundingClientRect()
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY
    const relX = clientX - rect.left
    const relY = clientY - rect.top
    const width = rect.width
    const height = rect.height

    // 检测放置区域
    // 左边区域：x < width/3, y > height/2
    // 右边区域：x > width*2/3, y > height/2
    // 中间区域：其他
    
    if (relY > height * 0.4) { // 只在下半部分可以放置
      if (relX < width * 0.35) {
        // 左边
        moveCharacter(dragInfo.characterId, 'left')
      } else if (relX > width * 0.65) {
        // 右边
        moveCharacter(dragInfo.characterId, 'right')
      } else {
        // 中间 - 移除（放回待选区）
        moveCharacter(dragInfo.characterId, 'none')
      }
    } else {
      // 拖到上半部分 - 移除（放回待选区）
      moveCharacter(dragInfo.characterId, 'none')
    }

    setDragInfo(null)
  }

  // 绑定拖拽事件
  useEffect(() => {
    if (dragInfo) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove)
      window.addEventListener('touchend', handleDragEnd)
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [dragInfo])

  // 第四关：移动人物
  const moveCharacter = (id: string, targetSide: 'left' | 'right' | 'none') => {
    setCharacters(prev => prev.map(c => 
      c.id === id ? { ...c, side: targetSide } : c
    ))
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
    setShowPunishment(false)
  }

  // 第四关：计算跷跷板倾斜角度
  const getSeesawAngle = () => {
    const leftWeight = characters.filter(c => c.side === 'left').reduce((sum, c) => sum + c.weight, 0)
    const rightWeight = characters.filter(c => c.side === 'right').reduce((sum, c) => sum + c.weight, 0)
    const diff = rightWeight - leftWeight
    // 最大倾斜15度
    return Math.max(-15, Math.min(15, diff * 0.5))
  }

  // ===== 第五关：单词填空 =====

  const startLevel5 = () => {
    setGameLevel(5)
    setGameState('playing')
    setLevel5TimeLeft(LEVEL5_TIME)
    setWordSlots(makeLevel5Slots())
    setAvailableLetters(['I', 'U', 'A', 'I', 'U'])
  }

  // 从字母槽拖出（点击字母后放置到单词槽）
  const handleLetterDragStart = (letter: string) => {
    setDraggedLetter(letter)
  }

  // 放置字母到单词槽
  const handleSlotDrop = (wordId: number, slotIndex: number) => {
    if (!draggedLetter) return
    const slot = wordSlots.find(s => s.wordId === wordId)
    if (!slot || !slot.missingIndices.includes(slotIndex)) return

    // 检查这个槽是否已经有字母
    const existingLetter = slot.filled[slotIndex]

    setWordSlots(prev => prev.map(s => {
      if (s.wordId !== wordId) return s
      const newFilled = [...s.filled]
      newFilled[slotIndex] = draggedLetter
      return { ...s, filled: newFilled }
    }))

    if (existingLetter) {
      // 槽里已有字母，把原来的放回可用区
      setAvailableLetters(prev => [...prev, existingLetter])
    }

    // 从可用区移除拖出的字母
    setAvailableLetters(prev => {
      const idx = prev.indexOf(draggedLetter!)
      if (idx === -1) return prev
      const next = [...prev]
      next.splice(idx, 1)
      return next
    })

    setDraggedLetter(null)
  }

  // 从单词槽移除字母放回可用区
  const handleSlotRemove = (wordId: number, slotIndex: number) => {
    const slot = wordSlots.find(s => s.wordId === wordId)
    if (!slot || !slot.missingIndices.includes(slotIndex)) return
    const letter = slot.filled[slotIndex]
    if (!letter) return

    setWordSlots(prev => prev.map(s => {
      if (s.wordId !== wordId) return s
      const newFilled = [...s.filled]
      newFilled[slotIndex] = null
      return { ...s, filled: newFilled }
    }))

    setAvailableLetters(prev => [...prev, letter])
  }

  // 提交答案
  const submitLevel5 = () => {
    const allCorrect = wordSlots.every(slot => {
      return slot.missingIndices.every(idx => slot.filled[idx] === slot.answer[idx])
    })
    if (allCorrect) {
      if (level5TimerRef.current) clearInterval(level5TimerRef.current)
      setGameState('won')
    } else {
      // 错误的字母抖动提示
      setGameState('failed')
    }
  }

  // 检查是否所有槽都填满
  const isAllFilled = () => {
    return wordSlots.every(slot =>
      slot.missingIndices.every(idx => slot.filled[idx] !== null)
    )
  }

  // 检查是否全部正确
  const isAllCorrect = () => {
    return wordSlots.every(slot =>
      slot.missingIndices.every(idx => slot.filled[idx] === slot.answer[idx])
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center p-2 sm:p-4 game-wrapper">
      <div className="w-full max-w-4xl">
        
        {/* 主菜单 */}
        {gameLevel === 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">🌿 卡皮巴拉乐园 🌿</h1>
            
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
              <div className="flex flex-col items-center">
                <img src={yangyangImg} alt="洋洋" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-yellow-400 shadow" />
                <span className="text-xs sm:text-sm font-bold text-purple-600 mt-1">洋洋</span>
              </div>
              <div className="flex flex-col items-center">
                <img src={dengdengImg} alt="等等" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-blue-400 shadow" />
                <span className="text-xs sm:text-sm font-bold text-blue-600 mt-1">等等</span>
              </div>
              <div className="text-3xl sm:text-5xl">🦫</div>
              <div className="flex flex-col items-center">
                <img src={momImg} alt="妈妈" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-pink-400 shadow" />
                <span className="text-xs sm:text-sm font-bold text-pink-600 mt-1">妈妈</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startLevel1}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg sm:text-2xl font-bold rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg"
              >
                第一关：喂卡皮巴拉 🍎
              </button>
              <button
                onClick={startLevel2}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                第二关：吃饭比赛 🍕🥟
              </button>
              <button
                onClick={startLevel3}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg sm:text-2xl font-bold rounded-full hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
              >
                第三关：监督吃饭 👀🥟
              </button>
              <button
                onClick={startLevel4}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-lg sm:text-2xl font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all shadow-lg"
              >
                第四关：跷跷板平衡 ⚖️
              </button>
              <button
                onClick={startLevel5}
                className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                第五关：单词填空 ✏️
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
                onClick={startLevel3}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
              >
                进入第三关 ➡️
              </button>
              <button
                onClick={startLevel2}
                className="w-full px-6 py-3 bg-purple-500 text-white text-lg font-bold rounded-full hover:bg-purple-600 transition-all"
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

        {/* 第三关：监督吃饭 */}
        {gameLevel === 3 && gameState === 'playing' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 sm:p-4 text-center">
              <div className="text-white text-lg sm:text-2xl font-bold mb-2">
                👀 洋洋监督等等吃饭 - {LEVEL3_TIME}秒内吃完{LEVEL3_TARGET}分！
              </div>
              <div className="flex justify-center items-center gap-6 sm:gap-12">
                <div className="text-yellow-300 text-xl sm:text-3xl font-bold">
                  得分: {dengdengScore}
                </div>
                <div className={`text-xl sm:text-3xl font-bold ${level3TimeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  ⏱️ {level3TimeLeft}s
                </div>
              </div>
            </div>

            <div className="relative game-area h-[50vh] sm:h-[60vh] md:h-[500px] bg-gradient-to-b from-blue-100 to-cyan-100 overflow-hidden">
              {/* 洋洋在左边监督 */}
              <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                <img
                  src={yangyangImg}
                  alt="洋洋"
                  className="w-16 sm:w-24 h-16 sm:h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                />
                <p className="text-sm sm:text-lg font-bold text-purple-600 mt-2">洋洋监督</p>
                <div className="text-2xl sm:text-4xl mt-2">👀</div>
              </div>

              {/* 等等在中间吃包子 */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <img
                  src={dengdengImg}
                  alt="等等"
                  className="w-20 sm:w-32 h-20 sm:h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg mb-4"
                />
                <p className="text-lg sm:text-xl font-bold text-blue-600 mb-4">等等</p>
                
                {/* 包子按钮 */}
                <button
                  onClick={handleDengdengEat}
                  className="text-6xl sm:text-8xl cursor-pointer hover:scale-110 active:scale-95 transition-transform animate-bounce"
                >
                  🥟
                </button>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-4">{dengdengScore} / {LEVEL3_TARGET}</p>
                <p className="text-sm sm:text-base text-gray-500 mt-2">点击包子让等等吃！</p>
              </div>

              {/* 进度条 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 sm:w-1/2">
                <div className="bg-gray-200 rounded-full h-4 sm:h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${(dengdengScore / LEVEL3_TARGET) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 第三关胜利 */}
        {gameLevel === 3 && gameState === 'won' && !showPunishment && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-green-600">🎉 任务完成！🎉</h2>
            
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <img
                  src={dengdengImg}
                  alt="等等"
                  className="w-24 sm:w-32 h-24 sm:h-32 rounded-full object-cover border-4 border-green-400 shadow-lg"
                />
                <div className="text-5xl sm:text-7xl">😋</div>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                等等按时吃完啦！
              </p>
              <p className="text-xl sm:text-2xl text-gray-600">
                用时: {LEVEL3_TIME - level3TimeLeft} 秒
              </p>
              <div className="mt-6 text-lg sm:text-xl text-gray-500">
                洋洋很满意！👍
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startLevel4}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all shadow-lg"
              >
                进入第四关 ➡️
              </button>
              <button
                onClick={startLevel3}
                className="w-full px-6 py-3 bg-blue-500 text-white text-lg font-bold rounded-full hover:bg-blue-600 transition-all"
              >
                再玩一次 🔄
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

        {/* 第三关失败 - 惩罚动画 */}
        {gameLevel === 3 && showPunishment && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-red-600">💥 时间到！💥</h2>
            
            <div className="mb-6 sm:mb-8">
              {/* 惩罚动画 */}
              <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6 animate-pulse">
                <img
                  src={yangyangImg}
                  alt="洋洋"
                  className="w-20 sm:w-28 h-20 sm:h-28 rounded-full object-cover border-4 border-red-400 shadow-lg"
                />
                <div className="text-4xl sm:text-6xl">👋💥</div>
                <img
                  src={dengdengImg}
                  alt="等等"
                  className="w-20 sm:w-28 h-20 sm:h-28 rounded-full object-cover border-4 border-blue-400 shadow-lg"
                />
              </div>
              
              <div className="text-4xl sm:text-6xl mb-4">😭😭😭</div>
              
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                等等没吃完！
              </p>
              <p className="text-xl sm:text-2xl text-gray-600">
                洋洋跑过去打了等等屁股！
              </p>
              <div className="mt-6 text-lg sm:text-xl text-gray-500">
                最终得分: {dengdengScore} / {LEVEL3_TARGET}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startLevel3}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
              >
                重新挑战 💪
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

        {/* 第四关：跷跷板平衡 */}
        {gameLevel === 4 && gameState === 'playing' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 sm:p-4 text-center">
              <div className="text-white text-lg sm:text-2xl font-bold mb-2">
                ⚖️ 跷跷板平衡 - 30秒内让两边平衡！
              </div>
              <div className="flex justify-center items-center gap-6 sm:gap-12">
                <div className="text-yellow-300 text-xl sm:text-3xl font-bold">
                  左边: {characters.filter(c => c.side === 'left').reduce((sum, c) => sum + c.weight, 0)} KG
                </div>
                <div className={`text-xl sm:text-3xl font-bold ${level4TimeLeft <= 10 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  ⏱️ {level4TimeLeft}s
                </div>
                <div className="text-yellow-300 text-xl sm:text-3xl font-bold">
                  右边: {characters.filter(c => c.side === 'right').reduce((sum, c) => sum + c.weight, 0)} KG
                </div>
              </div>
            </div>

            <div 
              ref={gameAreaRef}
              className="relative game-area h-[50vh] sm:h-[60vh] md:h-[500px] bg-gradient-to-b from-orange-100 to-yellow-100 overflow-hidden touch-none"
            >
              {/* 跷跷板 */}
              <div 
                className="absolute left-1/2 bottom-24 sm:bottom-32 transform -translate-x-1/2 transition-transform duration-500"
                style={{ transform: `translateX(-50%) rotate(${getSeesawAngle()}deg)` }}
              >
                {/* 跷跷板板子 */}
                <div className="relative w-64 sm:w-96 h-3 sm:h-4 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-lg">
                  {/* 左边放置区 */}
                  <div className="absolute -left-2 -top-20 sm:-top-24 w-16 sm:w-20 h-20 sm:h-24 border-2 border-dashed border-orange-400 rounded-lg flex flex-col items-center justify-center bg-orange-50 bg-opacity-50 pointer-events-none">
                    {characters.filter(c => c.side === 'left').map((c, i) => (
                      <div 
                        key={c.id} 
                        className="flex flex-col items-center cursor-grab active:cursor-grabbing pointer-events-auto z-10 bg-white rounded-lg p-1 shadow-md" 
                        style={{ marginTop: i === 0 ? 0 : -30 }}
                        onMouseDown={(e) => handleDragStart(e, c.id)}
                        onTouchStart={(e) => handleDragStart(e, c.id)}
                      >
                        {c.id === 'capybara' ? (
                          <div className="text-3xl sm:text-4xl">🦫</div>
                        ) : (
                          <img src={c.img} alt={c.name} className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover border-2 border-white shadow" />
                        )}
                        <span className="text-xs font-bold text-gray-700">{c.weight}KG</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* 右边放置区 */}
                  <div className="absolute -right-2 -top-20 sm:-top-24 w-16 sm:w-20 h-20 sm:h-24 border-2 border-dashed border-orange-400 rounded-lg flex flex-col items-center justify-center bg-orange-50 bg-opacity-50 pointer-events-none">
                    {characters.filter(c => c.side === 'right').map((c, i) => (
                      <div 
                        key={c.id} 
                        className="flex flex-col items-center cursor-grab active:cursor-grabbing pointer-events-auto z-10 bg-white rounded-lg p-1 shadow-md" 
                        style={{ marginTop: i === 0 ? 0 : -30 }}
                        onMouseDown={(e) => handleDragStart(e, c.id)}
                        onTouchStart={(e) => handleDragStart(e, c.id)}
                      >
                        {c.id === 'capybara' ? (
                          <div className="text-3xl sm:text-4xl">🦫</div>
                        ) : (
                          <img src={c.img} alt={c.name} className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover border-2 border-white shadow" />
                        )}
                        <span className="text-xs font-bold text-gray-700">{c.weight}KG</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 支点 */}
                <div className="absolute left-1/2 -bottom-4 sm:-bottom-6 transform -translate-x-1/2 w-0 h-0 border-l-8 sm:border-l-12 border-r-8 sm:border-r-12 border-t-12 sm:border-t-16 border-l-transparent border-r-transparent border-t-amber-800"></div>
              </div>

              {/* 人物选择区 - 可拖拽 */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-4 flex-wrap justify-center max-w-full px-2">
                {characters.filter(c => c.side === 'none').map(c => (
                  <div
                    key={c.id}
                    onMouseDown={(e) => handleDragStart(e, c.id)}
                    onTouchStart={(e) => handleDragStart(e, c.id)}
                    className="flex flex-col items-center p-2 sm:p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-grab active:cursor-grabbing select-none"
                  >
                    {c.id === 'capybara' ? (
                      <div className="text-3xl sm:text-4xl">🦫</div>
                    ) : (
                      <img src={c.img} alt={c.name} className="w-12 sm:w-16 h-12 sm:h-16 rounded-full object-cover border-2 border-orange-400" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-gray-700 mt-1">{c.name}</span>
                    <span className="text-xs font-bold text-orange-600">{c.weight}KG</span>
                  </div>
                ))}
              </div>

              {/* 拖拽中的人物 */}
              {dragInfo && (
                <div
                  className="fixed pointer-events-none z-50 flex flex-col items-center"
                  style={{
                    left: dragPosition.x,
                    top: dragPosition.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {dragInfo.characterId === 'capybara' ? (
                    <div className="text-4xl sm:text-5xl">🦫</div>
                  ) : (
                    <img 
                      src={characters.find(c => c.id === dragInfo.characterId)?.img} 
                      alt="" 
                      className="w-14 sm:w-18 h-14 sm:h-18 rounded-full object-cover border-3 border-orange-500 shadow-2xl" 
                    />
                  )}
                  <span className="text-xs font-bold text-orange-600 bg-white rounded px-2">
                    {characters.find(c => c.id === dragInfo.characterId)?.weight}KG
                  </span>
                </div>
              )}

              {/* 操作提示 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-sm sm:text-base text-gray-600 bg-white bg-opacity-80 rounded-lg px-4 py-2">
                  💡 拖拽人物头像到跷跷板两边，达到平衡！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 第四关胜利 */}
        {gameLevel === 4 && gameState === 'won' && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-green-600">🎉 完美平衡！🎉</h2>
            
            <div className="mb-6 sm:mb-8">
              <div className="text-6xl sm:text-8xl mb-6">⚖️</div>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                跷跷板平衡啦！
              </p>
              <p className="text-xl sm:text-2xl text-gray-600">
                用时: {LEVEL4_TIME - level4TimeLeft} 秒
              </p>
              <div className="mt-6 text-lg sm:text-xl text-gray-500">
                两边都是 45 KG，完美平衡！
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startLevel4}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all shadow-lg"
              >
                再玩一次 🔄
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

        {/* 第四关失败 */}
        {gameLevel === 4 && gameState === 'failed' && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-red-600">⏰ 时间到！</h2>
            
            <div className="mb-6 sm:mb-8">
              <div className="text-6xl sm:text-8xl mb-6">😵</div>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                没能在时间内平衡！
              </p>
              <div className="mt-6 text-lg sm:text-xl text-gray-500">
                左边: {characters.filter(c => c.side === 'left').reduce((sum, c) => sum + c.weight, 0)} KG | 
                右边: {characters.filter(c => c.side === 'right').reduce((sum, c) => sum + c.weight, 0)} KG
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startLevel4}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all shadow-lg"
              >
                重新挑战 💪
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

        {/* 第五关：单词填空 */}
        {gameLevel === 5 && gameState === 'playing' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* 顶部标题栏 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 sm:p-4 text-center">
              <div className="text-white text-lg sm:text-2xl font-bold mb-1">
                ✏️ 单词填空 - 把字母拖到单词中！
              </div>
              <div className={`text-3xl sm:text-5xl font-bold ${level5TimeLeft <= 10 ? 'text-red-300 animate-pulse' : 'text-yellow-300'}`}>
                ⏱️ {level5TimeLeft}s
              </div>
            </div>

            {/* 游戏区域 */}
            <div className="p-3 sm:p-6 bg-gradient-to-b from-purple-50 to-pink-50 min-h-[400px] sm:min-h-[500px]">

              {/* 单词列表 */}
              <div className="space-y-4 mb-6">
                {wordSlots.map((slot) => (
                  <div key={slot.wordId} className="bg-white rounded-2xl p-3 sm:p-4 shadow-md">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-gray-400 text-sm font-bold w-6">{slot.wordId}.</span>
                      {slot.display.map((char, idx) => {
                        const isMissing = slot.missingIndices.includes(idx)
                        const filledLetter = slot.filled[idx]
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            {isMissing ? (
                              <div
                                onClick={() => filledLetter ? handleSlotRemove(slot.wordId, idx) : undefined}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleSlotDrop(slot.wordId, idx)}
                                onMouseDown={() => draggedLetter && handleSlotDrop(slot.wordId, idx)}
                                className={`
                                  w-10 h-12 sm:w-14 sm:h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-xl sm:text-3xl font-bold
                                  transition-all cursor-pointer select-none
                                  ${filledLetter
                                    ? 'border-green-400 bg-green-50 text-green-600 shadow-sm hover:bg-red-50 hover:border-red-300'
                                    : 'border-purple-300 bg-purple-50 text-purple-300 hover:border-purple-400 hover:bg-purple-100'
                                  }
                                `}
                                style={{ minWidth: '2.5rem' }}
                              >
                                {filledLetter || <span className="text-purple-300 text-lg">_</span>}
                              </div>
                            ) : (
                              <div className="w-10 h-12 sm:w-14 sm:h-16 flex items-center justify-center text-xl sm:text-3xl font-bold text-gray-800">
                                {char}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 字母选择区 */}
              <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-lg border-2 border-purple-200">
                <p className="text-center text-purple-500 text-sm font-bold mb-3">📚 可用字母（点击字母后点击单词槽放置）</p>
                <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                  {availableLetters.map((letter, idx) => (
                    <div
                      key={`${letter}-${idx}`}
                      onClick={() => handleLetterDragStart(letter)}
                      className={`
                        w-12 h-14 sm:w-16 sm:h-18 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-bold cursor-pointer
                        transition-all transform select-none
                        ${draggedLetter === letter
                          ? 'bg-purple-600 text-white scale-110 shadow-xl ring-4 ring-purple-300'
                          : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md hover:scale-110 hover:shadow-xl active:scale-95'
                        }
                      `}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作提示 */}
              <div className="text-center mt-4 text-sm text-purple-500">
                💡 先点击字母选中，再点击单词槽中的空白处放置 | 点击已填字母可取回
              </div>

              {/* 提交按钮 */}
              <div className="mt-4 text-center">
                <button
                  onClick={submitLevel5}
                  disabled={!isAllFilled()}
                  className={`
                    px-8 py-3 text-xl font-bold rounded-full transition-all shadow-lg
                    ${isAllFilled()
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  ✅ 提交答案
                </button>
                {!isAllFilled() && (
                  <p className="text-xs text-gray-400 mt-1">先把所有字母放进单词槽再提交</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 第五关胜利 */}
        {gameLevel === 5 && gameState === 'won' && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-green-600">🎉 太棒了！🎉</h2>
            <div className="mb-6 sm:mb-8">
              <div className="text-6xl sm:text-8xl mb-6">🏆</div>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                单词拼写全部正确！
              </p>
              <p className="text-xl sm:text-2xl text-gray-600">
                用时: {LEVEL5_TIME - level5TimeLeft} 秒
              </p>
              <div className="mt-6 space-y-2 text-lg sm:text-xl text-gray-500">
                {wordSlots.map(slot => (
                  <div key={slot.wordId} className="text-green-600 font-bold">
                    {slot.answer.join('')}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={startLevel5}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                再玩一次 🔄
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

        {/* 第五关失败 */}
        {gameLevel === 5 && gameState === 'failed' && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-red-600">
              {level5TimeLeft <= 0 ? '⏰ 时间到！' : '❌ 还有错误！'}
            </h2>
            <div className="mb-6 sm:mb-8">
              <div className="text-6xl sm:text-8xl mb-6">😢</div>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                {level5TimeLeft <= 0 ? '没能在时间内完成拼写！' : '还有字母放错了位置！'}
              </p>
              <div className="mt-6 space-y-2 text-lg sm:text-xl text-gray-500">
                {wordSlots.map(slot => (
                  <div key={slot.wordId} className="text-gray-400 font-bold">
                    {slot.answer.join('')}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={startLevel5}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl sm:text-2xl font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                重新挑战 💪
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
