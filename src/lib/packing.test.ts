import { describe, expect, it } from 'vitest'
import { calculateLayout, ellipseArea, ellipsesOverlap, getCakeArea, reserveQuantity, validateDimension, type Berry, type Cake } from './packing'

const blueberry: Berry = { id: 'blueberry', name: 'Blueberry', width: 14, length: 14, color: '#59405F', proportion: 100, kind: 'round' }

describe('cake geometry', () => {
  it('calculates circle area', () => {
    expect(getCakeArea({ shape: 'circle', diameter: 20, length: 20, width: 20 })).toBeCloseTo(Math.PI * 100)
  })
  it('calculates square area', () => {
    expect(getCakeArea({ shape: 'square', diameter: 20, length: 20, width: 20 })).toBe(400)
  })
  it('calculates rectangle area', () => {
    expect(getCakeArea({ shape: 'rectangle', diameter: 20, length: 30, width: 20 })).toBe(600)
  })
})

describe('packing validation', () => {
  it('validates dimensions', () => {
    expect(validateDimension(5)).toBe(true)
    expect(validateDimension(60)).toBe(true)
    expect(validateDimension(0)).toBe(false)
    expect(validateDimension(61)).toBe(false)
  })
  it('returns no layout for invalid cake dimensions', () => {
    const cake: Cake = { shape: 'circle', diameter: 2, length: 2, width: 2 }
    expect(calculateLayout(cake, [blueberry], 'hex')).toEqual([])
  })
  it('converts ellipse dimensions to area', () => {
    expect(ellipseArea(7, 7)).toBeCloseTo(Math.PI * 49)
  })
  it('detects overlapping circles', () => {
    expect(ellipsesOverlap({ x: 0, y: 0, rx: 7, ry: 7, angle: 0, berryId: 'a', berryName: 'A', color: '#000', kind: 'round' }, { x: 5, y: 0, rx: 7, ry: 7, angle: 0, berryId: 'b', berryName: 'B', color: '#000', kind: 'round' })).toBe(true)
  })
})

describe('layout and reserve', () => {
  it('packs circular cakes without deterministic variance', () => {
    const cake: Cake = { shape: 'circle', diameter: 30, length: 30, width: 30 }
    const first = calculateLayout(cake, [blueberry], 'grid')
    const second = calculateLayout(cake, [blueberry], 'grid')
    expect(first).toEqual(second)
  })
  it('keeps generated points inside the cake', () => {
    const cake: Cake = { shape: 'circle', diameter: 30, length: 30, width: 30 }
    const points = calculateLayout(cake, [blueberry], 'hex')
    for (const point of points) {
      expect(Math.sqrt(point.x ** 2 + point.y ** 2) + point.rx).toBeLessThanOrEqual(15.01)
    }
  })
  it('calculates reserve quantities', () => {
    expect(reserveQuantity(100, 10)).toBe(110)
  })
  it('handles empty and tiny surfaces', () => {
    expect(calculateLayout({ shape: 'square', diameter: 5, length: 5, width: 5 }, [], 'grid')).toEqual([])
  })
})
