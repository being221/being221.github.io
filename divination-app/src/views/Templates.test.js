import { mount } from '@vue/test-utils'
import Templates from './Templates.vue'

describe('Templates Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Templates)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
  })

  test('displays category tabs', () => {
    const tabs = wrapper.findAll('.tab-btn')
    expect(tabs.length).toBeGreaterThan(0)
  })

  test('displays templates in the current category', () => {
    const cards = wrapper.findAll('.template-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  test('has search box', () => {
    const input = wrapper.find('.search-box input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('搜索')
  })

  test('has custom question input', () => {
    const input = wrapper.find('.custom-input-container input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('自定义问题')
  })

  test('has back button', () => {
    const backBtn = wrapper.find('.back-btn')
    expect(backBtn.exists()).toBe(true)
    expect(backBtn.text()).toContain('返回')
  })
})
