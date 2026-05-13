import { mount } from '@vue/test-utils'

// 模拟localStorage
const localStorageMock = (function() {
  let store = {}
  return {
    getItem: function(key) {
      return store[key] || null
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// 模拟router
const mockRouter = {
  push: vi.fn(),
  currentRoute: { value: {} }
}

global.router = mockRouter

// 模拟window.DeviceMotionEvent
if (!window.DeviceMotionEvent) {
  window.DeviceMotionEvent = class {}
}