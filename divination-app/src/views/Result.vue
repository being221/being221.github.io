<template>
  <div class="result-container">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">← 返回</button>

    <!-- 加载/空状态 -->
    <div v-if="!loaded" class="loading-state">
      <p>加载中...</p>
    </div>

    <!-- 卦象展示 -->
    <template v-if="loaded">
      <div class="hexagram-display">
        <!-- 本卦 -->
        <div class="hexagram-card">
          <div class="hexagram-lines-major" v-if="hexagram.code">
            <div
              v-for="(line, i) in hexagram.code.split('').reverse()"
              :key="i"
              class="hex-line"
              :class="[line === '1' ? 'line-yang' : 'line-yin', 'line-anim-' + (5 - i)]"
            >
              <span class="line-bar" v-if="line === '1'"></span>
              <span class="line-bar-left" v-else></span>
              <span class="line-bar-right" v-else></span>
              <span class="line-term" v-if="terms && terms.length">{{ terms[5-i] }}</span>
            </div>
          </div>
          <h1 class="hexagram-name">{{ hexagram.fullName }}</h1>
          <p class="hexagram-desc">{{ hexagram.desc }}</p>
        </div>

        <!-- 变卦 -->
        <div class="hexagram-card changing" v-if="changingHexagram && hasChanges">
          <div class="change-arrow">→</div>
          <div class="hexagram-lines-minor">
            <div
              v-for="(line, i) in changingCode.split('').reverse()"
              :key="i"
              class="hex-line-mini"
              :class="line === '1' ? 'line-yang' : 'line-yin'"
            >
              <span class="line-bar" v-if="line === '1'"></span>
              <span class="line-bar-left" v-else></span>
              <span class="line-bar-right" v-else></span>
            </div>
          </div>
          <h3 class="changing-name">{{ changingHexagram.fullName }}</h3>
          <p class="hexagram-desc">{{ changingHexagram.desc }}</p>
        </div>
      </div>

      <!-- 详细解读 -->
      <div class="interpretation">
        <!-- 整体运势 -->
        <div class="section">
          <h2>整体运势</h2>
          <div class="fortune-card">
            <p>{{ hexagram.overall }}</p>
          </div>
        </div>

        <!-- 爻位详解 -->
        <div class="section" v-if="hexagram.lines && hexagram.lines.length">
          <h2>爻位详解</h2>
          <div class="lines-detail">
            <div class="line-detail-card" v-for="(line, i) in hexagram.lines" :key="i">
              <div class="line-detail-header">
                <span class="line-pos">{{['初','二','三','四','五','上'][i]}}{{ hexagram.code.split('').reverse()[i] === '1' ? '九' : '六' }}</span>
                <span class="line-term-badge" v-if="terms && terms.length">{{ terms[5-i] }}</span>
              </div>
              <p class="line-detail-text" v-if="line.text">{{ line.text }}</p>
              <p class="line-detail-interp" v-if="line.interpretation">{{ line.interpretation }}</p>
            </div>
          </div>
        </div>

        <!-- 各方面运势 -->
        <div class="section">
          <h2>详细运势</h2>
          <div class="fortune-grid">
            <div class="fortune-item">
              <span class="fortune-icon">💼</span>
              <div>
                <h4>事业</h4>
                <p>{{ hexagram.fortune.career }}</p>
              </div>
            </div>
            <div class="fortune-item">
              <span class="fortune-icon">💕</span>
              <div>
                <h4>感情</h4>
                <p>{{ hexagram.fortune.love }}</p>
              </div>
            </div>
            <div class="fortune-item">
              <span class="fortune-icon">💰</span>
              <div>
                <h4>财富</h4>
                <p>{{ hexagram.fortune.wealth }}</p>
              </div>
            </div>
            <div class="fortune-item">
              <span class="fortune-icon">🏥</span>
              <div>
                <h4>健康</h4>
                <p>{{ hexagram.fortune.health }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 爻辞详解 -->
        <div class="section">
          <h2>爻辞详解</h2>
          <div class="lines-container">
            <div
              v-for="(line, index) in hexagram.lines"
              :key="index"
              class="line-item"
            >
              <div class="line-header">
                <span class="line-number">{{ index + 1 }}爻</span>
                <span class="line-text">{{ line.text }}</span>
              </div>
              <div class="line-content">
                <p class="line-meaning">{{ line.meaning }}</p>
                <p class="line-interpretation">{{ line.interpretation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 建议 -->
        <div class="section">
          <h2>建议</h2>
          <div class="advice-card">
            <p>{{ hexagram.advice }}</p>
          </div>
        </div>

        <!-- 保存状态 -->
        <div class="save-status" v-if="autoSaved">
          <span>✅ 已自动保存到历史记录</span>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <button class="action-btn" @click="shareResult">
            📤 分享结果
          </button>
          <button class="action-btn primary" @click="divinateAgain">
            🔄 再起一卦
          </button>
        </div>

        <!-- 笔记区域 -->
        <div class="notes-section">
          <h3>个人笔记</h3>
          <textarea
            v-model="userNotes"
            placeholder="记录你的想法..."
            @input="saveNotes"
          ></textarea>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { divinationStore } from '../utils/store'

export default {
  name: 'Result',
  setup() {
    const router = useRouter()
    const hexagram = ref({})
    const loaded = ref(false)
    const autoSaved = ref(false)
    const userNotes = ref('')
    const currentRecord = ref(null)

    // 自动保存到 localStorage
    const autoSave = () => {
      if (!currentRecord.value) return
      currentRecord.value.id = Date.now().toString()
      currentRecord.value.date = new Date().toLocaleString()
      currentRecord.value.notes = userNotes.value

      const history = JSON.parse(localStorage.getItem('divination_history') || '[]')
      // 如果已经保存过（相同的 hexagram code + question），跳过
      const exists = history.some(r =>
        r.hexagram && r.hexagram.code === currentRecord.value.hexagram.code &&
        r.question === currentRecord.value.question &&
        Math.abs(new Date(r.date) - new Date(currentRecord.value.date)) < 10000
      )
      if (exists) { autoSaved.value = true; return }

      history.unshift(currentRecord.value)
      if (history.length > 100) history.splice(100)
      localStorage.setItem('divination_history', JSON.stringify(history))
      autoSaved.value = true
    }

    // 从 store 读取卦象数据
    const getHexagramFromStore = (clearStore) => {
      if (divinationStore.currentHexagram && divinationStore.currentHexagram.code) {
        const data = divinationStore.currentHexagram
        hexagram.value = data
        currentRecord.value = {
          hexagram: data,
          notes: '',
          timestamp: new Date(),
          question: divinationStore.currentQuestion || ''
        }
        if (clearStore !== false) {
          divinationStore.currentHexagram = null
          divinationStore.currentQuestion = ''
        }
        // 自动保存
        setTimeout(() => autoSave(), 300)
        return true
      }
      return false
    }

    // setup 阶段立即尝试读取
    getHexagramFromStore()
    loaded.value = !!hexagram.value.code

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 保存笔记（同步到已保存的历史记录）
    const saveNotes = () => {
      if (!currentRecord.value) return
      currentRecord.value.notes = userNotes.value
      // 更新 localStorage 中对应记录
      const history = JSON.parse(localStorage.getItem('divination_history') || '[]')
      const idx = history.findIndex(r => r.id === currentRecord.value.id)
      if (idx !== -1) {
        history[idx].notes = userNotes.value
        localStorage.setItem('divination_history', JSON.stringify(history))
      }
    }

    // 分享结果
    const shareResult = () => {
      const shareText = `我起了一卦：${hexagram.value.fullName}\n\n${hexagram.value.desc}\n\n${hexagram.value.advice}`

      if (navigator.share) {
        navigator.share({
          title: '起卦结果',
          text: shareText
        })
      } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(shareText).then(() => {
          showNotification('结果已复制到剪贴板')
        })
      }
    }

    // 再起一卦
    const divinateAgain = () => {
      router.push('/')
    }

    // 显示通知
    const showNotification = (message) => {
      // 创建通知元素
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
      document.body.appendChild(notification)

      // 3秒后移除
      setTimeout(() => {
        notification.remove()
      }, 3000)
    }

    onMounted(() => {
      // onMounted 再次尝试读取（兼容直接访问或刷新页面等场景）
      if (!hexagram.value.code) {
        getHexagramFromStore()
        loaded.value = !!hexagram.value.code
      }
    })

    return {
      hexagram,
      loaded,
      autoSaved,
      terms,
      changingHexagram,
      hasChanges,
      changingCode,
      userNotes,
      goBack,
      saveNotes,
      shareResult,
      divinateAgain
    }
  }
}
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  color: #333;
}

.save-status {
  text-align: center;
  padding: 0.5rem;
  background: rgba(72, 199, 142, 0.2);
  border: 1px solid rgba(72, 199, 142, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #48c78e;
  font-size: 0.875rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  color: white;
  font-size: 1.25rem;
}

.back-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.hexagram-display {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.hexagram-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
}

.hexagram-symbol {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.hexagram-name {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.hexagram-code {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  font-family: monospace;
}

.hexagram-desc {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
}

.section {
  margin: 2rem 0;
}

.section h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.fortune-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.fortune-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.fortune-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.fortune-icon {
  font-size: 1.5rem;
}

.fortune-item h4 {
  margin: 0;
  color: #333;
}

.fortune-item p {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.875rem;
}

.lines-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.line-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.line-number {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.line-text {
  font-weight: bold;
  color: #333;
}

.line-meaning {
  color: #666;
  margin-bottom: 0.5rem;
}

.line-interpretation {
  color: #555;
  font-size: 0.875rem;
}

.advice-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 120px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a67d8;
}

.notes-section {
  margin: 2rem 0;
}

.notes-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.notes-section textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: none;
  border-radius: 15px;
  font-size: 1rem;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.notes-section textarea:focus {
  outline: none;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .fortune-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .action-btn {
    min-width: auto;
  }
}

/*===== 爻线可视化 =====*/
.hexagram-lines-major {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
}
.hexagram-lines-minor {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
}
.hex-line {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: lineReveal 0.5s ease forwards;
}
/* 逐条动画延迟：从初爻(0)到上爻(5) */
.hex-line.line-anim-0 { animation-delay: 0.0s; }
.hex-line.line-anim-1 { animation-delay: 0.4s; }
.hex-line.line-anim-2 { animation-delay: 0.8s; }
.hex-line.line-anim-3 { animation-delay: 1.2s; }
.hex-line.line-anim-4 { animation-delay: 1.6s; }
.hex-line.line-anim-5 { animation-delay: 2.0s; }
@keyframes lineReveal {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
.hex-line-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  animation: lineReveal 0.5s ease forwards;
}
.hex-line-mini:nth-child(1) { animation-delay: 2.2s; }
.hex-line-mini:nth-child(2) { animation-delay: 2.3s; }
.hex-line-mini:nth-child(3) { animation-delay: 2.4s; }
.hex-line-mini:nth-child(4) { animation-delay: 2.5s; }
.hex-line-mini:nth-child(5) { animation-delay: 2.6s; }
.hex-line-mini:nth-child(6) { animation-delay: 2.7s; }

.line-bar {
  display: block;
  width: 160px;
  height: 10px;
  background: linear-gradient(135deg, #667eea, #5a67d8);
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(102,126,234,0.4);
}
.line-bar-left, .line-bar-right {
  display: block;
  width: 72px;
  height: 10px;
  background: linear-gradient(135deg, #667eea, #5a67d8);
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(102,126,234,0.4);
}
.line-term {
  font-size: 0.7rem;
  color: #e74c3c;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

/* 变卦 */
.hexagram-card.changing {
  position: relative;
  opacity: 0.85;
  margin-top: 0;
  padding-top: 0;
}
.change-arrow {
  text-align: center;
  font-size: 2rem;
  color: #48c78e;
  margin: 0.5rem 0;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { opacity: 0.5; transform: scale(1); }
  50%     { opacity: 1; transform: scale(1.2); }
}
.changing-name {
  color: #48c78e;
  font-size: 1.1rem;
  text-align: center;
  margin: 0.5rem 0;
}

/* 爻位详解 */
.lines-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.line-detail-card {
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 14px;
  border-left: 3px solid rgba(102,126,234,0.5);
}
.line-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.line-pos {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: bold;
}
.line-term-badge {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(231,76,60,0.2);
  color: #e74c3c;
}
.line-detail-text {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
}
.line-detail-interp {
  font-size: 0.8rem;
  color: #888;
  margin-top: 2px;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .line-bar { width: 120px; height: 8px; }
  .line-bar-left, .line-bar-right { width: 54px; height: 8px; }
}
</style></style>
