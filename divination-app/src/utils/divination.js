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
    return { hexagram: this.hexagrams[randomKey], code: randomKey, terms: [], changingHexagram: null, hasChanges: false, changingCode: '', coinResults: [] }
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

  // 六爻起卦（三枚铜钱掷6次，每次3枚→共18变。老阳○老阴×为变爻，产生变卦）
  coinDivination() {
    const coinResults = []
    const lineValues = []
    const terms = []
    let code = ''
    let changingCode = ''

    for (let i = 0; i < 6; i++) {
      const coins = [this.flipCoin(), this.flipCoin(), this.flipCoin()]
      const heads = coins.filter(c => c === 1).length
      coinResults.push({ coins, heads })
      let type
      if (heads === 3)      { type = '老阳○'; code += '1'; changingCode += '0'; }
      else if (heads === 2) { type = '少阳';      code += '1'; changingCode += '1'; }
      else if (heads === 1) { type = '少阴';      code += '0'; changingCode += '0'; }
      else                  { type = '老阴×';  code += '0'; changingCode += '1'; }
      terms.push(type)
    }

    const hexagram = this.hexagrams[code] || this.randomDivination()
    const changingHexagram = this.hexagrams[changingCode] || null
    const hasChanges = code !== changingCode

    return {
      hexagram, changingHexagram,
      code, changingCode, hasChanges,
      coinResults, terms,
      timestamp: new Date()
    }
  }

  // 掷一枚铜钱：1=正面(阳) 0=反面(阴)
  flipCoin() {
    return Math.random() > 0.5 ? 1 : 0
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

  // 兼容旧接口
  simpleDivination() {
    return this.randomDivination()
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
