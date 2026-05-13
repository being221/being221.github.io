<template>
  <div class="templates-container">
    <!-- 顶部导航 -->
    <header class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>问题模板</h1>
    </header>

    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索问题..."
          @input="searchTemplates"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="categories-section">
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['tab-btn', { active: selectedCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          <span class="tab-icon">{{ category.icon }}</span>
          <span class="tab-name">{{ category.name }}</span>
        </button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="templates-section">
      <div v-if="filteredTemplates.length" class="templates-grid">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="template-content">
            <h3 class="template-text">{{ template.text }}</h3>
            <div class="template-tags">
              <span class="template-category">{{ template.category }}</span>
              <span class="template-keywords">
                {{ template.keywords.join(' · ') }}
              </span>
            </div>
          </div>
          <div class="template-action">
            <span class="use-btn">使用</span>
          </div>
        </div>
      </div>

      <!-- 搜索无结果 -->
      <div v-else-if="searchQuery" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>没有找到匹配的问题模板</p>
        <button class="clear-btn" @click="clearSearch">清空搜索</button>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📝</div>
        <p>选择一个分类开始</p>
      </div>
    </div>

    <!-- 自定义问题输入框 -->
    <div class="custom-section">
      <div class="custom-input-container">
        <input
          v-model="customQuestion"
          type="text"
          placeholder="或者输入自定义问题..."
          @keyup.enter="useCustomQuestion"
        />
        <button class="custom-btn" @click="useCustomQuestion">
          起卦
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import templates from '../data/templates.json'
import { divination } from '../utils/divination'
import { divinationStore } from '../utils/store'

export default {
  name: 'Templates',
  setup() {
    const router = useRouter()
    const selectedCategory = ref('career')
    const searchQuery = ref('')
    const customQuestion = ref('')
    const filteredTemplates = ref([])

    // 分类列表
    const categories = computed(() => {
      return Object.entries(templates).map(([key, value]) => ({
        id: key,
        name: value.name,
        icon: value.icon,
        templates: value.templates
      }))
    })

    // 当前分类的模板
    const currentCategoryTemplates = computed(() => {
      return categories.value.find(cat => cat.id === selectedCategory.value)?.templates || []
    })

    // 过滤后的模板
    const filteredTemplatesComputed = computed(() => {
      if (!searchQuery.value) return currentCategoryTemplates.value

      const query = searchQuery.value.toLowerCase()
      return currentCategoryTemplates.value.filter(template =>
        template.text.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    })

    // 模板过滤
    const searchTemplates = () => {
      filteredTemplates.value = filteredTemplatesComputed.value
    }

    // 选择分类
    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId
      searchQuery.value = ''
      filteredTemplates.value = currentCategoryTemplates.value
    }

    // 选择模板
    const selectTemplate = (template) => {
      customQuestion.value = template.text
      // 自动跳转到起卦页面
      startDivination(template.text)
    }

    // 使用自定义问题
    const useCustomQuestion = () => {
      if (customQuestion.value.trim()) {
        startDivination(customQuestion.value.trim())
      }
    }

    // 开始起卦
    const startDivination = (question) => {
      const hexagram = divination.randomDivination()
      divinationStore.currentHexagram = hexagram
      divinationStore.currentQuestion = question
      router.push('/result')
    }

    // 清空搜索
    const clearSearch = () => {
      searchQuery.value = ''
      filteredTemplates.value = currentCategoryTemplates.value
    }

    // 返回
    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      // 初始化显示当前分类的模板
      filteredTemplates.value = currentCategoryTemplates.value
    })

    return {
      categories,
      selectedCategory,
      searchQuery,
      customQuestion,
      filteredTemplates,
      selectCategory,
      selectTemplate,
      useCustomQuestion,
      searchTemplates,
      clearSearch,
      goBack
    }
  }
}
</script>

<style scoped>
.templates-container {
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

.search-section {
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
}

.categories-section {
  margin-bottom: 1.5rem;
}

.category-tabs {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.3s;
  flex-shrink: 0;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.95);
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.tab-icon {
  font-size: 1.125rem;
}

.tab-name {
  font-weight: 500;
}

.templates-section {
  margin-bottom: 2rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.template-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.template-text {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.4;
}

.template-tags {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.template-category {
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 500;
}

.template-keywords {
  font-size: 0.75rem;
  color: #999;
}

.use-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: background 0.3s;
}

.use-btn:hover {
  background: #5a67d8;
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

.clear-btn {
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.custom-section {
  position: sticky;
  bottom: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.custom-input-container {
  display: flex;
  gap: 0.75rem;
}

.custom-input-container input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.05);
}

.custom-input-container input:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.08);
}

.custom-btn {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
  white-space: nowrap;
}

.custom-btn:hover {
  background: #5a67d8;
}

/* 滚动条样式 */
.category-tabs::-webkit-scrollbar {
  height: 4px;
}

.category-tabs::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.category-tabs::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.category-tabs::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}

@media (max-width: 480px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .custom-input-container {
    flex-direction: column;
  }

  .custom-btn {
    width: 100%;
  }
}
</style>