import { Divination } from './divination.js'

describe('Divination Class', () => {
  let divination

  beforeEach(() => {
    divination = new Divination()
  })

  afterEach(() => {
    divination = null
  })

  test('loads hexagrams data on construction', () => {
    expect(divination.hexagrams).toHaveProperty('111111')
    expect(divination.hexagrams).toHaveProperty('000000')
    expect(divination.hexagrams['111111'].name).toBe('乾')
    expect(divination.hexagrams['000000'].name).toBe('坤')
  })

  test('generates random hexagram', () => {
    const hexagram = divination.randomDivination()
    expect(hexagram).toHaveProperty('code')
    expect(hexagram).toHaveProperty('name')
    expect(hexagram).toHaveProperty('fullName')
    expect(hexagram).toHaveProperty('desc')
    expect(hexagram).toHaveProperty('lines')
    expect(hexagram).toHaveProperty('overall')
    expect(hexagram).toHaveProperty('fortune')
    expect(hexagram).toHaveProperty('advice')
  })

  test('generates hexagram with 6 lines', () => {
    const hexagram = divination.randomDivination()
    expect(hexagram.lines.length).toBe(6)
  })

  test('number divination returns deep copy', () => {
    const hexagram1 = divination.numberDivination(1)
    const hexagram2 = divination.numberDivination(1)
    expect(hexagram1).toStrictEqual(hexagram2)

    const hexagram3 = divination.numberDivination(2)
    expect(hexagram3).not.toStrictEqual(hexagram1)
  })

  test('time divination works', () => {
    const date1 = new Date(2023, 0, 1)
    const date2 = new Date(2023, 0, 2)

    const hexagram1 = divination.timeDivination(date1)
    const hexagram2 = divination.timeDivination(date2)

    expect(hexagram1).not.toStrictEqual(hexagram2)
  })

  test('shake coin returns "0" or "1"', () => {
    const coin1 = divination.shakeCoin()
    const coin2 = divination.shakeCoin()

    expect(['0', '1']).toContain(coin1)
    expect(['0', '1']).toContain(coin2)
  })

  test('coin divination returns expected structure', () => {
    const result = divination.coinDivination()
    expect(result).toHaveProperty('hexagram')
    expect(result).toHaveProperty('code')
    expect(result).toHaveProperty('coinResults')
    expect(result).toHaveProperty('timestamp')
    expect(result.code.length).toBe(6)
    expect(result.hexagram).toHaveProperty('name')
  })

  test('shake divination is alias for coin divination', () => {
    const result = divination.shakeDivination()
    expect(result).toHaveProperty('hexagram')
    expect(result.code.length).toBe(6)
  })

  test('validate hexagram works', () => {
    expect(divination.validateHexagram({ code: '111111', name: '乾', fullName: '乾为天', lines: [1,2,3,4,5,6] })).toBe(true)
    expect(divination.validateHexagram(null)).toBeFalsy()
    expect(divination.validateHexagram({ code: '111111' })).toBeFalsy()
  })
})
