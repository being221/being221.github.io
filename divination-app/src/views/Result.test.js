import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import Result from './Result.vue'
import { divinationStore } from '../utils/store'

const hexagram = {
  code: '111111',
  name: '乾',
  fullName: '乾为天',
  desc: '天行健，君子以自强不息',
  image: '☰',
  lines: [
    { text: '初九：潜龙勿用', meaning: '时机未到，应当隐忍', interpretation: '龙潜伏在水中。' },
    { text: '九二：见龙在田', meaning: '初露锋芒', interpretation: '龙出现在田野上。' }
  ],
  overall: '乾卦象征天，代表着创造、刚健、积极向上。',
  fortune: {
    career: '事业运势极佳，适合积极进取',
    love: '感情顺利，有机会遇到心仪对象',
    wealth: '财运亨通，投资回报不错',
    health: '精力充沛'
  },
  advice: '保持积极进取的态度，但也要注意适度。'
}

function createTestRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/result', name: 'Result', component: Result },
      { path: '/', name: 'Home', component: { template: '<div>Home</div>' } }
    ]
  })
}

describe('Result Component', () => {
  beforeEach(() => {
    // 每个测试前设置 store 数据（setup 阶段同步读取）
    divinationStore.currentHexagram = { ...hexagram }
    divinationStore.currentQuestion = '测试问题'
  })

  afterEach(() => {
    divinationStore.currentHexagram = null
    divinationStore.currentQuestion = ''
  })

  test('renders correctly with hexagram data', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.hexagram-name').text()).toContain('乾为天')
  })

  test('displays hexagram description', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    expect(wrapper.find('.hexagram-desc').text()).toContain('天行健，君子以自强不息')
  })

  test('displays all four fortune items', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    const items = wrapper.findAll('.fortune-item')
    expect(items.length).toBe(4)
  })

  test('displays advice section', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    expect(wrapper.find('.advice-card').text()).toContain('积极进取')
  })

  test('displays lines section', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    const lines = wrapper.findAll('.line-item')
    expect(lines.length).toBe(2)
  })

  test('has back button', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    expect(wrapper.find('.back-btn').text()).toContain('返回')
  })

  test('has action buttons', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    const actions = wrapper.findAll('.actions .action-btn')
    expect(actions.length).toBe(3)
  })

  test('has notes textarea', () => {
    const wrapper = mount(Result, {
      global: { plugins: [createTestRouter()] }
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('placeholder')).toContain('记录')
  })
})
