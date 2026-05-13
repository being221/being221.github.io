<template>
  <div class="settings-container">
    <!-- 顶部导航 -->
    <header class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>设置</h1>
    </header>

    <!-- 设置分组 -->
    <div class="settings-sections">
      <!-- 起卦设置 -->
      <div class="section">
        <h2>起卦设置</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>默认起卦方式</h3>
              <p>选择您喜欢的起卦方式</p>
            </div>
            <select v-model="settings.divination.defaultMethod" @change="saveSettings">
              <option value="click">点击起卦</option>
              <option value="shake">摇一摇</option>
              <option value="random">随机起卦</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>摇动灵敏度</h3>
              <p>调整摇动检测的灵敏度</p>
            </div>
            <div class="sensitive-slider">
              <input
                type="range"
                v-model="settings.divination.sensitivity"
                min="10"
                max="30"
                @input="updateSensitivity"
              />
              <span class="sensitive-value">{{ settings.divination.sensitivity }}</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>音效</h3>
              <p>摇动和起卦时播放音效</p>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                v-model="settings.divination.sound"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>震动反馈</h3>
              <p>摇动时震动提醒</p>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                v-model="settings.divination.vibration"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 提醒设置 -->
      <div class="section">
        <h2>提醒设置</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>每日提醒</h3>
              <p>每天提醒您起卦</p>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                v-model="settings.reminder.daily"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item" v-if="settings.reminder.daily">
            <div class="setting-info">
              <h3>提醒时间</h3>
              <p>设置每天的提醒时间</p>
            </div>
            <input
              type="time"
              v-model="settings.reminder.time"
              @change="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>周报提醒</h3>
              <p>每周回顾本周起卦记录</p>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                v-model="settings.reminder.weekly"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item" v-if="settings.reminder.weekly">
            <div class="setting-info">
              <h3>周报提醒日</h3>
              <p>选择周报的提醒日期</p>
            </div>
            <select v-model="settings.reminder.day" @change="saveSettings">
              <option value="sunday">周日</option>
              <option value="monday">周一</option>
              <option value="tuesday">周二</option>
              <option value="wednesday">周三</option>
              <option value="thursday">周四</option>
              <option value="friday">周五</option>
              <option value="saturday">周六</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 界面设置 -->
      <div class="section">
        <h2>界面设置</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>主题</h3>
              <p>选择应用主题</p>
            </div>
            <select v-model="settings.interface.theme" @change="saveSettings">
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>字体大小</h3>
              <p>调整应用字体大小</p>
            </div>
            <select v-model="settings.interface.fontSize" @change="saveSettings">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>动画效果</h3>
              <p>是否显示动画效果</p>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                v-model="settings.interface.animation"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="section">
        <h2>数据管理</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>历史记录上限</h3>
              <p>设置最多保存的历史记录数</p>
            </div>
            <div class="limit-input">
              <input
                type="number"
                v-model="settings.data.maxHistory"
                min="10"
                max="1000"
                @change="saveSettings"
              />
              <span>条</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>自动备份</h3>
              <p>定期备份历史记录到本地</p>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                v-model="settings.data.backup"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>导出数据</h3>
              <p>导出历史记录为JSON文件</p>
            </div>
            <button class="action-btn" @click="exportData">导出</button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>清除数据</h3>
              <p>清除所有历史记录</p>
            </div>
            <button class="danger-btn" @click="confirmClearData">清除</button>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="section">
        <h2>关于</h2>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>版本</h3>
              <p>我的起卦 v1.0.0</p>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>反馈</h3>
              <p>意见与建议</p>
            </div>
            <button class="action-btn" @click="showFeedback">反馈</button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>开源地址</h3>
              <p>查看源码</p>
            </div>
            <button class="action-btn" @click="openSource">GitHub</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认弹窗 -->
    <div v-if="showConfirmModal" class="modal" @click="closeConfirmModal">
      <div class="modal-content" @click.stop>
        <h3>确认清除</h3>
        <p>确定要清除所有历史记录吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="secondary-btn" @click="closeConfirmModal">取消</button>
          <button class="danger-btn" @click="clearData">确认清除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { divination } from '../utils/divination'

export default {
  name: 'Settings',
  setup() {
    const router = useRouter()
    const settings = ref({
      divination: {
        defaultMethod: 'click',
        sensitivity: 20,
        sound: true,
        vibration: true
      },
      reminder: {
        daily: false,
        time: '20:00',
        weekly: false,
        day: 'sunday'
      },
      interface: {
        theme: 'light',
        fontSize: 'medium',
        animation: true
      },
      data: {
        maxHistory: 100,
        backup: true
      }
    })
    const showConfirmModal = ref(false)

    // 加载设置
    const loadSettings = () => {
      const stored = localStorage.getItem('divination_settings')
      if (stored) {
        settings.value = JSON.parse(stored)
      }
    }

    // 保存设置
    const saveSettings = () => {
      localStorage.setItem('divination_settings', JSON.stringify(settings.value))
      showNotification('设置已保存')
    }

    // 更新灵敏度
    const updateSensitivity = () => {
      divination.shakeThreshold = parseInt(settings.value.divination.sensitivity)
      saveSettings()
    }

    // 导出数据
    const exportData = () => {
      const history = localStorage.getItem('divination_history')
      if (!history) {
        showNotification('没有数据可导出')
        return
      }

      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        history: JSON.parse(history)
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `divination-history-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      showNotification('数据导出成功')
    }

    // 确认清除数据
    const confirmClearData = () => {
      showConfirmModal.value = true
    }

    // 清除数据
    const clearData = () => {
      localStorage.removeItem('divination_history')
      showNotification('历史记录已清除')
      closeConfirmModal()
    }

    // 关闭确认弹窗
    const closeConfirmModal = () => {
      showConfirmModal.value = false
    }

    // 显示反馈
    const showFeedback = () => {
      showNotification('反馈功能开发中...')
    }

    // 打开源码
    const openSource = () => {
      showNotification('即将跳转到GitHub...')
      // 实际项目中应该是真实的GitHub链接
      // window.open('https://github.com/yourusername/my-divination', '_blank')
    }

    // 返回
    const goBack = () => {
      router.back()
    }

    // 显示通知
    const showNotification = (message) => {
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
      document.body.appendChild(notification)

      setTimeout(() => {
        notification.remove()
      }, 3000)
    }

    onMounted(() => {
      loadSettings()
      divination.shakeThreshold = parseInt(settings.value.divination.sensitivity)
    })

    return {
      settings,
      showConfirmModal,
      saveSettings,
      updateSensitivity,
      exportData,
      confirmClearData,
      clearData,
      closeConfirmModal,
      showFeedback,
      openSource,
      goBack
    }
  }
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  color: #333;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.header h1 {
  color: white;
  font-size: 1.5rem;
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.25rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.setting-info h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.setting-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

/* 选择框样式 */
select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 120px;
}

select:focus {
  outline: none;
  border-color: #667eea;
}

/* 滑块样式 */
.sensitive-slider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sensitive-slider input[type="range"] {
  width: 100px;
}

.sensitive-value {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 500;
  min-width: 25px;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* 按钮样式 */
.action-btn {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #5a67d8;
}

.danger-btn {
  padding: 0.5rem 1.5rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.danger-btn:hover {
  background: #c53030;
}

.secondary-btn {
  padding: 0.5rem 1.5rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.secondary-btn:hover {
  background: #d0d0d0;
}

.limit-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.limit-input input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.limit-input span {
  font-size: 0.875rem;
  color: #666;
}

/* 模态框样式 */
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

.modal-content p {
  margin-bottom: 1.5rem;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* 通知样式 */
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
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .setting-info {
    width: 100%;
  }

  select, .action-btn, .danger-btn, .secondary-btn {
    width: 100%;
  }

  .sensitive-slider {
    width: 100%;
  }

  .sensitive-slider input[type="range"] {
    flex: 1;
  }
}
</style>