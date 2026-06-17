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
            <p class="card-hint">点击卡片开始起卦</p>
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

      <!-- ===== 卦象结果（同页面渲染）===== -->
      <div class="result-inline" v-if="showResultInline && resultData">
        <div class="result-hexagram-display">
          <!-- 本卦 -->
          <div class="hexagram-card">
            <div class="hexagram-lines-major" v-if="resultData.hexagram.code">
              <div
                v-for="(line, i) in resultData.hexagram.code.split('').reverse()"
                :key="'b'+i"
                class="hex-line"
                :class="[line === '1' ? 'line-yang' : 'line-yin', 'line-anim-' + (5-i)]"
              >
                <span class="line-bar" v-if="line === '1'"></span>
                <template v-else>
                  <span class="line-bar-left"></span>
                  <span class="line-bar-right"></span>
                </template>
                <span class="line-term" v-if="resultData.terms && resultData.terms.length">{{ resultData.terms[5-i] }}</span>
              </div>
            </div>
            <h1 class="hexagram-name">{{ resultData.hexagram.fullName }}</h1>
            <p class="hexagram-desc">{{ resultData.hexagram.desc }}</p>
          </div>

          <!-- 变卦 -->
          <div class="hexagram-card changing" v-if="resultData.hasChanges && resultData.changingHexagram">
            <div class="change-arrow">→</div>
            <div class="hexagram-lines-minor">
              <div
                v-for="(line, i) in resultData.changingCode.split('').reverse()"
                :key="'c'+i"
                class="hex-line-mini"
                :class="line === '1' ? 'line-yang' : 'line-yin'"
              >
                <span class="line-bar" v-if="line === '1'"></span>
                <template v-else>
                  <span class="line-bar-left"></span>
                  <span class="line-bar-right"></span>
                </template>
              </div>
            </div>
            <h3 class="changing-name">{{ resultData.changingHexagram.fullName }}</h3>
            <p class="hexagram-desc">{{ resultData.changingHexagram.desc }}</p>
          </div>
        </div>

        <!-- 整体运势 -->
        <div class="section">
          <h2>整体运势</h2>
          <div class="fortune-card">
            <p>{{ resultData.hexagram.overall }}</p>
          </div>
        </div>

        <!-- 爻位详解 -->
        <div class="section" v-if="resultData.hexagram.lines && resultData.hexagram.lines.length">
          <h2>爻位详解</h2>
          <div class="lines-detail">
            <div class="line-detail-card" v-for="(line, i) in resultData.hexagram.lines" :key="i">
              <div class="line-detail-header">
                <span class="line-pos">{{['初','二','三','四','五','上'][i]}}{{ resultData.hexagram.code.split('').reverse()[i] === '1' ? '九' : '六' }}</span>
                <span class="line-term-badge" v-if="resultData.terms && resultData.terms.length">{{ resultData.terms[5-i] }}</span>
              </div>
              <p class="line-detail-text" v-if="line.text">{{ line.text }}</p>
              <p class="line-detail-interp" v-if="line.interpretation">{{ line.interpretation }}</p>
            </div>
          </div>
        </div>

        <!-- 四方面运势 -->
        <div class="section" v-if="resultData.hexagram.fortune">
          <h2>详细运势</h2>
          <div class="fortune-grid">
            <div class="fortune-item">
              <span class="fortune-icon">💼</span>
              <div><h4>事业</h4><p>{{ resultData.hexagram.fortune.career }}</p></div>
            </div>
            <div class="fortune-item">
              <span class="fortune-icon">💕</span>
              <div><h4>感情</h4><p>{{ resultData.hexagram.fortune.love }}</p></div>
            </div>
            <div class="fortune-item">
              <span class="fortune-icon">💰</span>
              <div><h4>财富</h4><p>{{ resultData.hexagram.fortune.wealth }}</p></div>
            </div>
            <div class="fortune-item">
              <span class="fortune-icon">🏥</span>
              <div><h4>健康</h4><p>{{ resultData.hexagram.fortune.health }}</p></div>
            </div>
          </div>
        </div>

        <!-- 建议 -->
        <div class="section" v-if="resultData.hexagram.advice">
          <h2>建议</h2>
          <div class="advice-card"><p>{{ resultData.hexagram.advice }}</p></div>
        </div>

        <div class="result-actions">
          <button class="action-btn primary-btn" @click="showResultInline = false">🔄 再起一卦</button>
          <button class="action-btn" @click="showHistory">📊 历史记录</button>
        </div>
      </div>    </main>

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
    const showResultInline = ref(false)
    const resultData = ref(null)

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
        return JSON.parse(stored)
      }
      // 默认：摇一摇起卦
      return { divination: { defaultMethod: 'shake' } }
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
      if (isListeningShake.value) return

      isListeningShake.value = true
      buttonText.value = '点击或摇动手机起卦'

      const handleShake = (event) => {
        divination.detectShake(event, () => {
    // 摇一摇直接起卦，不走弹窗，用默认问题
          if (isShaking.value) return
          stopShakeListening()
          userQuestion.value = '今日运势'
          startDivination()
          // 起卦完成后不自动重启摇动——用户自己点卡片再起下一卦
        })
      }

      window.addEventListener('devicemotion', handleShake)
      window.currentShakeHandler = handleShake

      // 不设置超时——始终监听摇动
      if (shakeTimeoutId.value) clearTimeout(shakeTimeoutId.value)
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

    // 显示结果 — 改成直接在当前页展示，不跳转路由
    const showResult = (question, hexagram) => {
      resultData.value = {
        hexagram: hexagram.hexagram || hexagram,
        terms: hexagram.terms || [],
        changingHexagram: hexagram.changingHexagram || null,
        hasChanges: hexagram.hasChanges || false,
        changingCode: hexagram.changingCode || '',
        question: question
      }
      showResultInline.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
      // 摇一摇功能已移除
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
      showSettings,
      showResultInline,
      resultData
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

/* ===== 卦象结果内联展示 ===== */
.result-inline {
  animation: fadeIn 0.3s ease;
  padding: 0 0 1rem;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.result-hexagram-display { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 1rem; }

.hexagram-lines-major { display: flex; flex-direction: column-reverse; align-items: center; gap: 8px; padding: 20px 0; }
.hexagram-lines-minor { display: flex; flex-direction: column-reverse; align-items: center; gap: 6px; padding: 12px 0; }
.hex-line { display: flex; align-items: center; gap: 8px; opacity: 0; animation: lineReveal 0.5s ease forwards; }
.hex-line.line-anim-0 { animation-delay: 0.0s; } .hex-line.line-anim-1 { animation-delay: 0.4s; }
.hex-line.line-anim-2 { animation-delay: 0.8s; } .hex-line.line-anim-3 { animation-delay: 1.2s; }
.hex-line.line-anim-4 { animation-delay: 1.6s; } .hex-line.line-anim-5 { animation-delay: 2.0s; }
@keyframes lineReveal { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
.hex-line-mini { display: flex; align-items: center; gap: 6px; opacity: 0; animation: lineReveal 0.5s ease forwards; }
.hex-line-mini:nth-child(1) { animation-delay: 2.2s; } .hex-line-mini:nth-child(2) { animation-delay: 2.3s; }
.hex-line-mini:nth-child(3) { animation-delay: 2.4s; } .hex-line-mini:nth-child(4) { animation-delay: 2.5s; }
.hex-line-mini:nth-child(5) { animation-delay: 2.6s; } .hex-line-mini:nth-child(6) { animation-delay: 2.7s; }
.line-bar { display: block; width: 160px; height: 10px; background: linear-gradient(135deg, #667eea, #5a67d8); border-radius: 5px; box-shadow: 0 2px 10px rgba(102,126,234,0.4); }
.line-bar-left, .line-bar-right { display: block; width: 72px; height: 10px; background: linear-gradient(135deg, #667eea, #5a67d8); border-radius: 5px; box-shadow: 0 2px 10px rgba(102,126,234,0.4); }
.line-term { font-size: 0.7rem; color: #e74c3c; font-weight: bold; min-width: 40px; text-align: center; }

.hexagram-card { background: #fff; border-radius: 15px; padding: 1.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.1); flex: 1; min-width: 260px; max-width: 380px; text-align: center; }
.hexagram-card.changing { opacity: 0.85; }
.hexagram-name { color: #667eea; font-size: 1.5rem; margin: 0.5rem 0 0; }
.hexagram-desc { color: #444; font-size: 0.9rem; }
.changing-name { color: #48c78e; font-size: 1.1rem; margin: 0.5rem 0; }
.change-arrow { font-size: 2rem; color: #48c78e; margin: 0.5rem 0; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }

.section { margin: 1rem 0; }
.section h2 { font-size: 1.1rem; color: #667eea; margin: 0 0 0.5rem; padding-bottom: 0.25rem; border-bottom: 2px solid rgba(102,126,234,0.2); }
.fortune-card { background: rgba(102,126,234,0.08); border-radius: 8px; padding: 0.75rem; }
.fortune-card p { color: #2c2c2c; line-height: 1.7; font-size: 0.9rem; margin: 0; }
.fortune-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
@media (max-width: 480px) { .fortune-grid { grid-template-columns: 1fr; } }
.fortune-item { display: flex; gap: 0.5rem; background: rgba(255,255,255,0.9); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(102,126,234,0.15); }
.fortune-icon { font-size: 1.5rem; } .fortune-item h4 { margin: 0 0 2px; font-size: 0.85rem; color: #667eea; }
.fortune-item p { margin: 0; font-size: 0.8rem; color: #444; line-height: 1.4; }

.advice-card { background: rgba(72,199,142,0.1); border: 1px solid rgba(72,199,142,0.2); border-radius: 8px; padding: 0.75rem; }
.advice-card p { color: #2c2c2c; line-height: 1.7; font-size: 0.9rem; margin: 0; }

.lines-detail { display: flex; flex-direction: column; gap: 0.5rem; }
.line-detail-card { background: #fff; border-radius: 8px; padding: 10px 14px; border-left: 3px solid rgba(102,126,234,0.5); }
.line-detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.line-pos { font-size: 0.8rem; color: #667eea; font-weight: bold; }
.line-term-badge { font-size: 0.7rem; padding: 1px 6px; border-radius: 4px; background: rgba(231,76,60,0.2); color: #e74c3c; }
.line-detail-text { font-size: 0.85rem; color: #333; line-height: 1.5; margin: 0.25rem 0; }
.line-detail-interp { font-size: 0.8rem; color: #555; margin: 0.125rem 0; line-height: 1.4; }

.result-actions { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.5rem; }
.action-btn.primary-btn { background: #667eea; color: white; border: none; border-radius: 10px; padding: 0.5rem 1.5rem; cursor: pointer; font-size: 0.9rem; }
.action-btn.primary-btn:hover { background: #5a67d8; }
.action-btn { padding: 0.5rem 1rem; background: rgba(255,255,255,0.8); border: 1px solid #ddd; border-radius: 10px; cursor: pointer; font-size: 0.85rem; }

@media (max-width: 480px) {
  .hexagram-card { max-width: 100%; }
  .line-bar { width: 120px; height: 8px; }
  .line-bar-left, .line-bar-right { width: 54px; height: 8px; }
}
.result-card {
  background: rgba(255,255,255,0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  animation: fadeIn 0.3s ease;
}
.result-card h2 {
  color: #667eea;
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  text-align: center;
}
.result-desc {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}
.result-overall {
  color: #333;
  line-height: 1.7;
  margin: 1rem 0;
}
.change-info {
  background: rgba(72,199,142,0.1);
  border: 1px solid rgba(72,199,142,0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin: 0.75rem 0;
}
.change-info p {
  margin: 0.25rem 0;
  color: #48c78e;
  font-size: 0.9rem;
}
.result-meta {
  margin: 0.75rem 0;
  font-size: 0.8rem;
  color: #888;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.result-meta p {
  margin: 2px;
  padding: 2px 8px;
  background: rgba(102,126,234,0.08);
  border-radius: 4px;
}
.back-btn {
  display: block;
  margin: 1rem auto 0;
  padding: 0.5rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
