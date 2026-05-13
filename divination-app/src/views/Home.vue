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
            <div class="coin-group">
              <div class="coin" v-for="i in 3" :key="i">
                <img :src="currentCoins[i-1]" :class="{ flipping: isFlipping }" />
              </div>
            </div>
            <h3>{{ buttonText }}</h3>
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

    // 开始起卦（点击模式）
    const startDivination = () => {
      if (isShaking.value) return

      isShaking.value = true
      isFlipping.value = true
      buttonText.value = '起卦中...'

      // 模拟摇动3秒
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
        buttonText.value = '开始起卦'

        const hexagram = generateHexagram()
        showResult(userQuestion.value.trim() || '今日运势', hexagram)
      }, 3000)
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

        const result = divination.shakeDivination()
        showResult(userQuestion.value.trim() || '今日运势', result.hexagram)
      }, 3000)
    }

    // 生成卦象
    const generateHexagram = () => {
      return divination.randomDivination()
    }

    // 显示结果
    const showResult = (question, hexagram) => {
      divinationStore.currentHexagram = hexagram
      divinationStore.currentQuestion = question
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
      isFlipping,
      currentCoins,
      todayCount,
      buttonText,
      isListeningShake,
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
</style>
