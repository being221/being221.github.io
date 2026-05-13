import hexagramsData from '../data/hexagrams.json'

export class Divination {
  constructor() {
    this.shakeThreshold = 15
    this.lastShakeTime = 0
    this.hexagrams = hexagramsData
  }

  // 随机起卦
  randomDivination() {
    const keys = Object.keys(this.hexagrams)
    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    return { ...this.hexagrams[randomKey] }
  }

  // 通过数字起卦
  numberDivination(number) {
    const keys = Object.keys(this.hexagrams)
    const index = number % keys.length
    return { ...this.hexagrams[keys[index]] }
  }

  // 通过时间起卦
  timeDivination(date = new Date()) {
    const timestamp = date.getTime()
    const number = timestamp.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0)
    return this.numberDivination(number)
  }

  // 六爻起卦（模拟三枚硬币摇6次）
  coinDivination() {
    let code = ''
    const coinResults = []
    for (let i = 0; i < 6; i++) {
      const result = this.shakeCoin()
      coinResults.push(result)
      code += result
    }
    return {
      hexagram: this.hexagrams[code] || this.randomDivination(),
      code,
      coinResults,
      timestamp: new Date()
    }
  }

  // 检测摇动
  detectShake(event, callback) {
    if (!window.DeviceMotionEvent) {
      console.warn('设备不支持加速度传感器')
      return
    }

    const acceleration = event.accelerationIncludingGravity
    if (!acceleration) return

    const now = Date.now()
    const timeDiff = now - this.lastShakeTime

    if (timeDiff > 100) {
      const x = Math.abs(acceleration.x || 0)
      const y = Math.abs(acceleration.y || 0)
      const z = Math.abs(acceleration.z || 0)

      const accelerationDiff = x + y + z

      if (accelerationDiff > this.shakeThreshold) {
        this.lastShakeTime = now
        callback()
      }
    }
  }

  // 模拟摇动起卦（与 coinDivination 逻辑一致）
  shakeDivination() {
    return this.coinDivination()
  }

  // 摇硬币：0=反面（阴），1=正面（阳）
  shakeCoin() {
    return Math.random() > 0.5 ? '1' : '0'
  }

  // 获取卦象的历史应验率（模拟）
  getAccuracyRate() {
    return Math.floor(Math.random() * 30) + 70
  }

  // 验证卦象数据
  validateHexagram(hexagram) {
    return hexagram &&
           hexagram.code &&
           hexagram.name &&
           hexagram.fullName &&
           Array.isArray(hexagram.lines) &&
           hexagram.lines.length === 6
  }
}

export const divination = new Divination()
