<template>
  <div class="history-container">
    <!-- 顶部导航 -->
    <header class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>历史记录</h1>
    </header>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-number">{{ totalDivinations }}</span>
          <span class="stat-label">总起卦次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ todayDivinations }}</span>
          <span class="stat-label">今日次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ favoriteHexagram }}</span>
          <span class="stat-label">最常见卦象</span>
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-section">
      <button
        v-for="tag in tags"
        :key="tag"
        :class="['tag-btn', { active: selectedTag === tag }]"
        @click="selectTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list">
      <div
        v-for="month in groupedHistory"
        :key="month.month"
        class="month-group"
      >
        <h2 class="month-title">{{ month.month }}</h2>
        <div class="records">
          <div
            v-for="record in month.records"
            :key="record.id"
            class="record-card"
            @click="showRecordDetail(record)"
          >
            <div class="record-header">
              <span class="record-date">{{ formatDateTime(record.date) }}</span>
              <span class="hexagram-name">{{ getHexagramName(record) }}</span>
            </div>

            <div class="record-content">
              <p class="record-question">{{ record.question }}</p>

              <div class="record-preview">
                <p>{{ getHexagramOverall(record) }}</p>
              </div>

              <div class="record-tags" v-if="record.tags && record.tags.length">
                <span
                  v-for="tag in record.tags"
                  :key="tag"
                  class="record-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="record-actions">
              <button class="action-btn" @click.stop="editNote(record)">
                📝 笔记
              </button>
              <button class="action-btn" @click.stop="shareRecord(record)">
                📤 分享
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!groupedHistory.length" class="empty-state">
      <div class="empty-icon">📊</div>
      <p>还没有起卦记录</p>
      <button class="primary-btn" @click="goHome">开始起卦</button>
    </div>

    <!-- 笔记编辑弹窗 -->
    <div v-if="showNoteModal" class="modal" @click="closeNoteModal">
      <div class="modal-content" @click.stop>
        <h3>编辑笔记</h3>
        <textarea
          v-model="currentNote"
          placeholder="记录你的想法..."
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button class="secondary-btn" @click="closeNoteModal">取消</button>
          <button class="primary-btn" @click="saveNote">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { divinationStore } from '../utils/store'

export default {
  name: 'History',
  setup() {
    const router = useRouter()
    const history = ref([])
    const selectedTag = ref('全部')
    const showNoteModal = ref(false)
    const currentRecord = ref(null)
    const currentNote = ref('')

    // 计算属性
    const totalDivinations = computed(() => history.value.length)

    const todayDivinations = computed(() => {
      const today = new Date().toDateString()
      return history.value.filter(item =>
        new Date(item.date).toDateString() === today
      ).length
    })

    const favoriteHexagram = computed(() => {
      const hexagramCount = {}
      history.value.forEach(record => {
        const name = hexagramField(record, 'fullName')
        hexagramCount[name] = (hexagramCount[name] || 0) + 1
      })

      const maxCount = Math.max(...Object.values(hexagramCount))
      const favorite = Object.keys(hexagramCount).find(key => hexagramCount[key] === maxCount)
      return favorite || '-'
    })

    const groupedHistory = computed(() => {
      // 按标签筛选
      const filtered = selectedTag.value === '全部'
        ? history.value
        : history.value.filter(r => r.tags && r.tags.includes(selectedTag.value))

      const groups = {}
      filtered.forEach(record => {
        const date = new Date(record.date)
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!groups[month]) {
          groups[month] = {
            month: getMonthName(month),
            records: []
          }
        }

        groups[month].records.push(record)
      })

      return Object.entries(groups)
        .sort(([, a], [, b]) => b.records[0].date.localeCompare(a.records[0].date))
        .map(([, value]) => value)
    })

    const tags = computed(() => {
      const allTags = ['全部']
      history.value.forEach(record => {
        if (record.tags && record.tags.length) {
          record.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
              allTags.push(tag)
            }
          })
        }
      })
      return allTags
    })

    // 方法
    const loadHistory = () => {
      const stored = localStorage.getItem('divination_history')
      if (stored) {
        history.value = JSON.parse(stored)
      }
    }

    const goBack = () => {
      router.back()
    }

    const goHome = () => {
      router.push('/')
    }

    const formatDateTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()

      // 今天
      if (date.toDateString() === now.toDateString()) {
        return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
      }

      // 昨天
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return `昨天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
      }

      // 更早
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const getMonthName = (monthKey) => {
      const [year, month] = monthKey.split('-')
      return `${year}年${parseInt(month)}月`
    }

    const selectTag = (tag) => {
      selectedTag.value = tag
      // 这里可以添加筛选逻辑
    }

    const showRecordDetail = (record) => {
      if (record.hexagram && record.hexagram.code) {
        divinationStore.currentHexagram = record.hexagram
      } else {
        divinationStore.currentHexagram = {
          code: record.code,
          name: record.name,
          fullName: record.fullName,
          desc: record.desc,
          image: record.image,
          lines: record.lines,
          overall: record.overall,
          fortune: record.fortune,
          advice: record.advice
        }
      }
      divinationStore.currentQuestion = record.question || ''
      router.push('/result')
    }

    const editNote = (record) => {
      currentRecord.value = record
      currentNote.value = record.notes || ''
      showNoteModal.value = true
    }

    const saveNote = () => {
      if (currentRecord.value) {
        const index = history.value.findIndex(r => r.id === currentRecord.value.id)
        if (index !== -1) {
          history.value[index].notes = currentNote.value
          localStorage.setItem('divination_history', JSON.stringify(history.value))
        }
      }
      closeNoteModal()
    }

    const closeNoteModal = () => {
      showNoteModal.value = false
      currentRecord.value = null
      currentNote.value = ''
    }

    // 兼容新旧两种记录格式
    const hexagramField = (record, field) => {
      if (record.hexagram) return record.hexagram[field] || ''
      return record[field] || ''
    }

    const getHexagramName = (record) => hexagramField(record, 'fullName')
    const getHexagramOverall = (record) => hexagramField(record, 'overall')

    const shareRecord = (record) => {
      const shareText = `起卦记录：${record.date}\n\n卦象：${getHexagramName(record)}\n问题：${record.question}\n\n${getHexagramOverall(record)}`

      if (navigator.share) {
        navigator.share({
          title: '起卦记录',
          text: shareText
        })
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('记录已复制到剪贴板')
        })
      }
    }

    onMounted(() => {
      loadHistory()
    })

    return {
      history,
      totalDivinations,
      todayDivinations,
      favoriteHexagram,
      groupedHistory,
      tags,
      selectedTag,
      showNoteModal,
      currentNote,
      goBack,
      goHome,
      formatDateTime,
      getHexagramName,
      getHexagramOverall,
      selectTag,
      showRecordDetail,
      editNote,
      saveNote,
      closeNoteModal,
      shareRecord
    }
  }
}
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  color: #333;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
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

.stats-section {
  margin-bottom: 1.5rem;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.filter-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tag-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.95);
}

.tag-btn.active {
  background: #667eea;
  color: white;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.month-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.month-title {
  color: white;
  font-size: 1.125rem;
  margin: 0;
}

.records {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.record-card:hover {
  transform: translateY(-2px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.record-date {
  color: #666;
  font-size: 0.875rem;
}

.hexagram-name {
  font-weight: bold;
  color: #667eea;
}

.record-content {
  margin-bottom: 1rem;
}

.record-question {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.record-preview {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
}

.record-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.record-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 15px;
}

.record-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: white;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.primary-btn {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.primary-btn:hover {
  background: #5a67d8;
}

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
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.secondary-btn {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.secondary-btn:hover {
  background: #e0e0e0;
}

@media (max-width: 480px) {
  .stats-card {
    flex-direction: column;
    gap: 1rem;
  }

  .record-actions {
    flex-direction: column;
  }
}
</style>