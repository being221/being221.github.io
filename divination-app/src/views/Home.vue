<template>
  <div class="app">
    <header class="header">
      <div class="user-info">
        <h1>我的起卦</h1>
        <span>今日 {{ todayCount }} 次</span>
      </div>
      <button class="settings-btn" @click="showSettings">⚙️</button>
    </header>

    <main class="main-content">
      <div class="divination-area">
        <div
          class="divination-card"
          :class="{ shaking: isShaking, flipping: isFlipping }"
          @click="openQuestionModal"
        >
          <div class="card-content">
            <!-- 六爻掷币进度 -->
            <div class="yao-rounds" v-if="isShaking && yaoDisplay.length">
              <div class="yao-round-label">{{ yaoRoundText }}</div>
              <div class="coin-3d-group">
                <div
                  class="coin-3d"
                  v-for="(coin, ci) in yaoDisplay"
                  :key="ci"
                  :class="'coin-flip-' + (flipKey % 2)"
                >
                  <div class="coin-face coin-front">
                    <span class="coin-char yang-char">{{ '◆' }}</span>
                  </div>
                  <div class="coin-face coin-back">
                    <span class="coin-char yin-char">{{ '◇' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 默认静态硬币 -->
            <div class="coin-3d-group" v-else>
              <div class="coin-3d-static" v-for="i in 3" :key="i">
                <div class="coin-static-face">
                  <span class="coin-char yang-char">{{ '◆' }}</span>
                </div>
              </div>
            </div>
            <h3>{{ buttonText }}</h3>
            <p class="yao-result-preview" v-if="yaoResultPreview.length">{{ yaoResultPreview }}</p>
            <p v-if="!isListeningShake" class="card-hint">
              点击起卦 | 摇动手机感应
            </p>
            <p v-else class="card-hint shake-hint">
              摇动手机开始起卦...
            </p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="action-btn" @click="showHistory">
          📊 历史记录
        </button>
        <button class="action-btn" @click="showTemplates">
          📝 问题模板
        </button>
      </div>

      <div class="disclaimer">
        <p>温馨提示：本应用仅供娱乐，请相信科学、拒绝迷信。作者尚在学习前端开发，卦象结果由随机算法生成，切勿当真。</p>
      </div>
    </main>

    <!-- 问题输入弹窗 -->
    <div v-if="showQuestionModal" class="modal" @click="closeQuestionModal">
      <div class="modal-content" @click.stop>
        <h3>你想占卜什么？</h3>
        <textarea
          v-model="userQuestion"
          placeholder="请输入你想问的问题..."
          rows="3"
          @keyup.enter.ctrl="confirmQuestion"
        ></textarea>
        <div class="modal-actions">
          <button class="secondary-btn" @click="closeQuestionModal">取消</button>
          <button class="primary-btn" @click="confirmQuestion">开始起卦</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { divination } from '../utils/divination'
import { divinationStore } from '../utils/store'
import coinHead from '../assets/images/coin-head.svg'
import coinTail from '../assets/images/coin-tail.svg'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const isShaking = ref(false)
    const isFlipping = ref(false)
    const currentCoins = ref([coinHead, coinHead, coinHead])
    const todayCount = ref(0)
    const buttonText = ref('开始起卦')
    const isListeningShake = ref(false)
    const showQuestionModal = ref(false)
    const yaoDisplay = ref([])
    const yaoRoundText = ref('')
    const yaoResultPreview = ref('')
    const flipKey = ref(0)
    const userQuestion = ref('')
    const isPendingShake = ref(false)
    const shakeTimeoutId = ref(null)

    // 计算今日起卦次数
    const calculateTodayCount = () => {
      const today = new Date().toDateString()
      const history = JSON.parse(localStorage.getItem('divination_history') || '[]')
      todayCount.value = history.filter(item =>
        new Date(item.date).toDateString() === today
      ).length
    }

    // 加载设置
    const loadSettings = () => {
      const stored = localStorage.getItem('divination_settings')
      if (stored) {
        const settings = JSON.parse(stored)
        return settings
      }
      return null
    }

    // 打开问题输入弹窗
    const openQuestionModal = () => {
      if (isShaking.value) return
      showQuestionModal.value = true
    }

    // 关闭问题输入弹窗
    const closeQuestionModal = () => {
      showQuestionModal.value = false
    }

    // 确认问题并开始起卦
    const confirmQuestion = () => {
      showQuestionModal.value = false
      if (!userQuestion.value.trim()) {
        userQuestion.value = '今日运势'
      }
      if (isPendingShake.value) {
        isPendingShake.value = false
        performShakeDivination()
      } else {
        startDivination()
      }
    }

    // 开始起卦（六爻逐爻掷币动画）
    const startDivination = () => {
      if (isShaking.value) return

      isShaking.value = true
      buttonText.value = '掷币起卦...'
      yaoResultPreview.value = ''

      // 生成完整的6爻结果
      const fullResult = divination.coinDivination()
      const allTerms = fullResult.terms || []
      const code = fullResult.code || ''

      // 逐爻展示
      let round = 0
      yaoRoundText.value = '第 1/6 掷'
      yaoDisplay.value = [{ face: 0 }, { face: 0 }, { face: 0 }]

      const interval = setInterval(() => {
        flipKey.value++
        const ch = code[round]
        yaoDisplay.value = [
          { face: ch === '1' ? 1 : 0 },
          { face: ch === '1' ? 1 : 0 },
          { face: ch === '1' ? 1 : 0 }
        ]
        let preview = ''
        for (let r = 0; r <= round; r++) {
          preview += (code[r] === '1' ? '━' : '--') + ' '
        }
        yaoResultPreview.value = preview + '（' + allTerms[round] + '）'
        round++

        if (round >= 6) {
          clearInterval(interval)
          yaoRoundText.value = ''
          setTimeout(() => {
            isShaking.value = false
            yaoDisplay.value = []
            buttonText.value = '开始起卦'
            showResult(userQuestion.value.trim() || '今日运势', fullResult)
          }, 800)
        } else {
          yaoRoundText.value = '第 ' + (round + 1) + '/6 掷'
        }
      }, 600)
    }

    // 启动摇动监听
    const startShakeListening = () => {
      if (isShaking.value || isListeningShake.value) return

      isListeningShake.value = true
      buttonText.value = '摇动起卦...'

      const handleShake = (event) => {
        divination.detectShake(event, () => {
          // 摇动检测成功：停止监听，弹出问题输入框
          stopShakeListening()
          isPendingShake.value = true
          showQuestionModal.value = true
        })
      }

      window.addEventListener('devicemotion', handleShake)
      window.currentShakeHandler = handleShake

      // 10秒后如果没有摇动，自动取消
      shakeTimeoutId.value = setTimeout(() => {
        stopShakeListening()
        isPendingShake.value = false
      }, 10000)
    }

    // 停止摇动监听
    const stopShakeListening = () => {
      if (shakeTimeoutId.value) {
        clearTimeout(shakeTimeoutId.value)
        shakeTimeoutId.value = null
      }
      if (window.currentShakeHandler) {
        window.removeEventListener('devicemotion', window.currentShakeHandler)
        window.currentShakeHandler = null
      }
      isListeningShake.value = false
      buttonText.value = '开始起卦'
    }

    // 执行摇动起卦动画与结果生成
    const performShakeDivination = () => {
      isShaking.value = true
      isFlipping.value = true

      let shakeCount = 0
      const shakeInterval = setInterval(() => {
        currentCoins.value = currentCoins.value.map(() =>
          Math.random() > 0.5 ? coinHead : coinTail
        )
        shakeCount++
        if (shakeCount > 30) {
          clearInterval(shakeInterval)
        }
      }, 100)

      setTimeout(() => {
        isShaking.value = false
        isFlipping.value = false

        const result = divination.coinDivination()
        showResult(userQuestion.value.trim() || '今日运势', result)
      }, 3000)
    }

    // 生成卦象
    const generateHexagram = () => {
      return divination.randomDivination()
    }

    // 显示结果
    const showResult = (question, hexagram) => {
      const payload = {
        hexagram: hexagram.hexagram || hexagram,
        terms: hexagram.terms || [],
        changingHexagram: hexagram.changingHexagram || null,
        hasChanges: hexagram.hasChanges || false,
        changingCode: hexagram.changingCode || '',
        question: question
      }
      sessionStorage.setItem('divination_payload', JSON.stringify(payload))
      router.push('/result')
    }

    // 显示历史记录
    const showHistory = () => {
      router.push('/history')
    }

    // 显示问题模板
    const showTemplates = () => {
      router.push('/templates')
    }

    // 显示设置
    const showSettings = () => {
      router.push('/settings')
    }

    onMounted(() => {
      calculateTodayCount()
      // 读取设置，如果默认方式为摇一摇则自动启动监听
      const settings = loadSettings()
      if (settings && settings.divination && settings.divination.defaultMethod === 'shake') {
        startShakeListening()
      }
    })

    onBeforeUnmount(() => {
      stopShakeListening()
    })

    return {
      isShaking,
      todayCount,
      buttonText,
      isListeningShake,
      yaoDisplay,
      yaoRoundText,
      yaoResultPreview,
      flipKey,
      showQuestionModal,
      userQuestion,
      openQuestionModal,
      closeQuestionModal,
      confirmQuestion,
      startShakeListening,
      showHistory,
      showTemplates,
      showSettings
    }
  }
}
</script>

<style scoped>
/* 样式保持不变 */

.card-hint {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  margin-top: 0.5rem;
}

.shake-hint {
  color: #667eea;
  font-weight: 500;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* 问题输入弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.modal-content textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  resize: vertical;
  font-size: 1rem;
  box-sizing: border-box;
}

.modal-content textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.secondary-btn {
  padding: 0.5rem 1.5rem;
  background: #e0e0e0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
}

.primary-btn {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
}

.primary-btn:hover {
  background: #5a67d8;
}

.disclaimer {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border-radius: 10px;
  text-align: center;
  border-left: 3px solid #ccc;
}

.disclaimer p {
  margin: 0;
  font-size: 0.8rem;
  color: #999;
  line-height: 1.6;
}

/* ===== 3D 铜钱样式 ===== */
.coin-3d-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 12px 0;
}
.coin-3d, .coin-3d-static {
  width: 64px;
  height: 64px;
}
.coin-3d {
  perspective: 600px;
  animation: coinSpin3D 0.6s ease-in-out;
}
.coin-face, .coin-static-face {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.coin-front {
  background: linear-gradient(135deg, #ffd700, #b8860b);
  box-shadow: 0 3px 12px rgba(255,215,0,0.4), inset 0 2px 6px rgba(255,255,255,0.3);
  z-index: 2;
}
.coin-back {
  background: linear-gradient(135deg, #c0c0c0, #808080);
  box-shadow: 0 3px 12px rgba(192,192,192,0.4), inset 0 2px 6px rgba(255,255,255,0.2);
  transform: rotateY(180deg);
}
.coin-flip-0 .coin-front { transform: rotateY(0); }
.coin-flip-1 .coin-front { transform: rotateY(180deg); }
.coin-flip-0 .coin-back  { transform: rotateY(180deg); }
.coin-flip-1 .coin-back  { transform: rotateY(0); }

.coin-static-face {
  background: linear-gradient(135deg, #ffd700, #b8860b);
  box-shadow: 0 3px 12px rgba(255,215,0,0.3);
  position: static;
  animation: coinIdle 3s ease-in-out infinite;
}
.coin-3d-static:nth-child(2) .coin-static-face { animation-delay: 0.3s; }
.coin-3d-static:nth-child(3) .coin-static-face { animation-delay: 0.6s; }

@keyframes coinSpin3D {
  0%   { transform: rotateY(0deg) rotateX(0deg); }
  25%  { transform: rotateY(540deg) rotateX(360deg); }
  50%  { transform: rotateY(1080deg); }
  75%  { transform: rotateY(1260deg); }
  100% { transform: rotateY(1440deg); }
}
@keyframes coinIdle {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.05); box-shadow: 0 4px 16px rgba(255,215,0,0.5); }
}

.coin-char {
  font-size: 32px;
  line-height: 1;
}
.yang-char {
  color: #5a3e00;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}
.yin-char {
  color: #444;
  text-shadow: 0 1px 2px rgba(255,255,255,0.3);
}

/* 爻轮次显示 */
.yao-rounds {
  text-align: center;
}
.yao-round-label {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 4px;
}
.yao-result-preview {
  font-size: 0.8rem;
  color: #666;
  margin-top: 6px;
  font-family: monospace;
  letter-spacing: 4px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .coin-3d, .coin-3d-static, .coin-face, .coin-static-face {
    width: 48px; height: 48px;
  }
  .coin-char { font-size: 24px; }
}
</style>
