import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import History from './History.vue'

describe('History Component', () => {
  let wrapper

  beforeEach(() => {
    const mockHistory = [
      {
        id: '1',
        date: new Date().toISOString(),
        hexagram: { code: '111111', name: '乾', fullName: '乾为天', overall: '乾卦象征天。' },
        question: '最近的工作运势如何？'
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000).toISOString(),
        hexagram: { code: '000000', name: '坤', fullName: '坤为地', overall: '坤卦象征地。' },
        question: '是否应该跳槽？'
      }
    ]

    localStorage.setItem('divination_history', JSON.stringify(mockHistory))

    const router = createRouter({
      history: createWebHashHistory(),
      routes: [
        { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
        { path: '/result', name: 'Result', component: { template: '<div>Result</div>' } }
      ]
    })

    wrapper = mount(History, {
      global: { plugins: [router] }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    localStorage.clear()
  })

  test('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.history-list').exists()).toBe(true)
  })

  test('displays statistics', () => {
    const statNumbers = wrapper.findAll('.stat-number')
    expect(statNumbers.length).toBe(3)
  })

  test('displays history records', () => {
    const records = wrapper.findAll('.record-card')
    expect(records.length).toBe(2)
  })

  test('displays hexagram names', () => {
    const names = wrapper.findAll('.hexagram-name')
    expect(names[0].text()).toContain('乾')
    expect(names[1].text()).toContain('坤')
  })

  test('displays record questions', () => {
    const questions = wrapper.findAll('.record-question')
    expect(questions[0].text()).toContain('最近的工作运势如何？')
    expect(questions[1].text()).toContain('是否应该跳槽？')
  })

  test('has filter tags', () => {
    const tags = wrapper.findAll('.tag-btn')
    expect(tags.length).toBeGreaterThanOrEqual(1)
  })

  test('shows empty state when no records', async () => {
    localStorage.clear()
    const router = createRouter({
      history: createWebHashHistory(),
      routes: [
        { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
        { path: '/result', name: 'Result', component: { template: '<div>Result</div>' } }
      ]
    })
    const emptyWrapper = mount(History, { global: { plugins: [router] } })
    expect(emptyWrapper.find('.empty-state').exists()).toBe(true)
    emptyWrapper.unmount()
  })
})
