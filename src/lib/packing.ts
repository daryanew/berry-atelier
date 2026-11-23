export type Shape = 'circle' | 'square' | 'rectangle'
export type Pattern = 'grid' | 'hex'

export type Berry = {
  id: string
  name: string
  width: number
  length: number
  color: string
  proportion: number
  kind: 'round' | 'strawberry'
}

export type Point = {
  x: number
  y: number
  rx: number
  ry: number
  angle: number
  berryId: string
  berryName: string
  color: string
  kind: 'round' | 'strawberry'
}

export type Cake = { shape: Shape; diameter: number; length: number; width: number }

export function getCakeArea(cake: Cake): number {
  if (cake.shape === 'circle') return Math.PI * (cake.diameter / 2) ** 2
  if (cake.shape === 'square') return cake.width * cake.width
  return cake.length * cake.width
}

export function validateDimension(value: number): boolean {
  return Number.isFinite(value) && value >= 5 && value <= 60
}

export function ellipseArea(rx: number, ry: number): number {
  return Math.PI * rx * ry
}

export function isInsideCake(x: number, y: number, rx: number, ry: number, cake: Cake): boolean {
  const cx = 0
  const cy = 0
  if (cake.shape === 'circle') {
    const r = cake.diameter / 2
    const bearing = Math.max(rx, ry) + 0.05
    return ellipseInsideCircle(x, y, bearing, r)
  }
  const halfW = cake.width / 2
  const halfH = (cake.shape === 'square' ? cake.width : cake.length) / 2
  return x - rx >= cx - halfW && x + rx <= cx + halfW &&
    y - ry >= cy - halfH && y + ry <= cy + halfH
}

function ellipseInsideCircle(x: number, y: number, radius: number, cakeRadius: number): boolean {
  return Math.sqrt(x * x + y * y) + radius <= cakeRadius + 0.001
}

export function ellipsesOverlap(a: Point, b: Point, tolerance = 0.45): boolean {
  if (Math.abs(a.angle - b.angle) < 1 && a.angle !== 0) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy) < Math.max(a.rx, b.rx) + Math.max(a.ry, b.ry) - tolerance
  }
  const dx = a.x - b.x
  const dy = a.y - b.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const maxRadius = Math.max(a.rx, a.ry, b.rx, b.ry)
  return distance < maxRadius - tolerance
}

export function reserveQuantity(actual: number, reservePercent: number): number {
  if (!Number.isFinite(actual) || actual < 0) return 0
  return Math.ceil(actual * (1 + reservePercent / 100) - 1e-9)
}
function weightedBerry(berries: Berry[], index: number): Berry {
  const total = berries.reduce((sum, berry) => sum + Math.max(0, berry.proportion), 0)
  if (total <= 0) return berries[index % berries.length]
  let target = ((index * 0.61803398875) % 1) * total
  for (const berry of berries) {
    target -= Math.max(0, berry.proportion)
    if (target < 0) return berry
  }
  return berries[0]
}

export function calculateLayout(cake: Cake, berries: Berry[], pattern: Pattern, limit = 1800): Point[] {
  if (!berries.length || limit < 1) return []
  if (cake.shape === 'circle' && !validateDimension(cake.diameter)) return []
  if (cake.shape === 'square' && !validateDimension(cake.width)) return []
  if (cake.shape === 'rectangle' && (!validateDimension(cake.length) || !validateDimension(cake.width))) return []

  const points: Point[] = []
  const xs = cake.shape === 'circle' ? cake.diameter : (cake.shape === 'square' ? cake.width : cake.length)
  const ys = cake.shape === 'circle' ? cake.diameter : (cake.shape === 'square' ? cake.width : cake.width)
  const halfW = xs / 2
  const halfH = ys / 2
  const minDim = Math.min(...berries.map(b => Math.min(b.width, b.length))) / 2
  const step = Math.max(minDim * 0.72, 1.5)

  for (let row = -halfH + step; row <= halfH - step && points.length < limit; row += step * 1.62) {
    const rowIndex = Math.round((row + halfH) / (step * 1.62))
    const offset = pattern === 'hex' && rowIndex % 2 ? step * 0.81 : 0
    for (let col = -halfW + step; col <= halfW - step && points.length < limit; col += step * 1.62) {
      const berry = weightedBerry(berries, points.length)
      const rx = berry.width / 2
      const ry = berry.length / 2
      const angle = berry.kind === 'strawberry' && berry.width < berry.length ? 90 : 0
      const x = col + offset
      const y = row
      if (!isInsideCake(x, y, rx, ry, cake)) continue
      const candidate: Point = { x, y, rx, ry, angle, berryId: berry.id, berryName: berry.name, color: berry.color, kind: berry.kind }
      if (points.every(existing => !ellipsesOverlap(candidate, existing))) points.push(candidate)
    }
  }

  const alternate: Point[] = []
  const startStep = step * 1.58
  for (let row = -halfH + step; row <= halfH - step && alternate.length < limit; row += startStep) {
    for (let col = -halfW + step; col <= halfW - step && alternate.length < limit; col += startStep) {
      const berry = weightedBerry(berries, alternate.length)
      const rx = berry.width / 2
      const ry = berry.length / 2
      const candidate: Point = { x: col, y: row, rx, ry, angle: berry.kind === 'strawberry' ? 90 : 0, berryId: berry.id, berryName: berry.name, color: berry.color, kind: berry.kind }
      if (isInsideCake(candidate.x, candidate.y, rx, ry, cake) && alternate.every(existing => !ellipsesOverlap(candidate, existing))) alternate.push(candidate)
    }
  }

  return pattern === 'hex' ? (points.length >= alternate.length ? points : alternate) : (alternate.length >= points.length ? alternate : points)
}
