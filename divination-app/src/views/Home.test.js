import { mount } from '@vue/test-utils'
import Home from './Home.vue'

describe('Home Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Home)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.main-content').exists()).toBe(true)
  })

  test('displays today count', () => {
    const todayCount = wrapper.find('.user-info span')
    expect(todayCount.exists()).toBe(true)
    expect(todayCount.text()).toContain('今日')
  })

  test('has divination card', () => {
    const card = wrapper.find('.divination-card')
    expect(card.exists()).toBe(true)
    expect(card.find('.card-content').exists()).toBe(true)
  })

  test('clicking card opens question modal', async () => {
    const card = wrapper.find('.divination-card')
    expect(card.exists()).toBe(true)

    await card.trigger('click')
    expect(wrapper.vm.showQuestionModal).toBe(true)
  })

  test('confirming question starts divination', async () => {
    wrapper.vm.showQuestionModal = true
    wrapper.vm.userQuestion = '测试问题'
    wrapper.vm.confirmQuestion()

    expect(wrapper.vm.showQuestionModal).toBe(false)
    expect(wrapper.vm.isShaking).toBe(true)
    expect(wrapper.vm.isFlipping).toBe(true)
  })

  test('has quick actions', () => {
    const actions = wrapper.find('.quick-actions')
    expect(actions.exists()).toBe(true)
    expect(actions.findAll('.action-btn').length).toBe(2)
  })
})
