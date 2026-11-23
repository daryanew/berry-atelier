const berries = [
  { id: 'strawberry', name: 'Strawberry', width: 2.8, length: 3.3, averageWeightG: 12, color: '#d97e8a', size: 'about 3 cm' },
  { id: 'blueberry', name: 'Blueberry', width: 1.4, length: 1.4, averageWeightG: 2, color: '#77749a', size: 'about 1.5 cm' },
  { id: 'raspberry', name: 'Raspberry', width: 2, length: 1.8, averageWeightG: 4, color: '#d9839a', size: 'about 2 cm' },
  { id: 'blackberry', name: 'Blackberry', width: 2.2, length: 1.8, averageWeightG: 7, color: '#625675', size: 'about 2 cm' },
  { id: 'redcurrant', name: 'Redcurrant', width: 1, length: 1, averageWeightG: 0.7, color: '#bd6671', size: 'about 1 cm' },
]

const state = {
  shape: 'circle',
  berry: 'strawberry',
  diameter: 24,
  length: 30,
  width: 20,
  reserve: 10,
  unit: 'count',
}

const dimensionFields = document.querySelector('#dimension-fields')
const berryOptions = document.querySelector('#berry-options')
const surfaceArea = document.querySelector('#surface-area')
const dimensionError = document.querySelector('#dimension-error')
const berryCount = document.querySelector('#berry-count')
const berryCountLabel = document.querySelector('#berry-count-label')
const purchaseCount = document.querySelector('#purchase-count')
const purchaseUnit = document.querySelector('#purchase-unit')
const resultArea = document.querySelector('#result-area')
const cakePreview = document.querySelector('#cake-preview')
const unitToggle = document.querySelector('#unit-toggle')
const estimateNote = document.querySelector('#estimate-note')

function renderDimensionFields() {
  const fields = state.shape === 'circle'
    ? [['diameter', 'Diameter', state.diameter]]
    : state.shape === 'square'
      ? [['width', 'Side length', state.width]]
      : [['length', 'Length', state.length], ['width', 'Width', state.width]]

  dimensionFields.className = `dimension-fields${fields.length === 2 ? ' is-pair' : ''}`
  dimensionFields.innerHTML = fields.map(([key, label, value]) => `
    <label class="dimension-label" for="dimension-${key}">${label}
      <span class="measure-input">
        <input id="dimension-${key}" name="${key}" data-dimension="${key}" type="number" min="5" max="60" step="0.5" value="${value}" inputmode="decimal" />
        <span>cm</span>
      </span>
    </label>
  `).join('')

  dimensionFields.querySelectorAll('[data-dimension]').forEach(input => {
    input.addEventListener('input', () => {
      state[input.dataset.dimension] = input.value === '' ? Number.NaN : input.valueAsNumber
      renderResults()
    })
  })
}

function renderBerryOptions() {
  berryOptions.innerHTML = berries.map(berry => `
    <button class="berry-option${state.berry === berry.id ? ' is-selected' : ''}" type="button" data-berry="${berry.id}" aria-pressed="${state.berry === berry.id}">
      <span class="berry-emoji" aria-hidden="true">${berryIcon(berry)}</span>
      <span class="berry-option-copy">
        <span class="berry-option-name">${berry.name}</span>
        <span class="berry-option-size">${berry.size}</span>
      </span>
      <span class="berry-select-mark" aria-hidden="true">✓</span>
    </button>
  `).join('')

  berryOptions.querySelectorAll('[data-berry]').forEach(button => {
    button.addEventListener('click', () => {
      state.berry = button.dataset.berry
      renderBerryOptions()
      renderResults()
    })
  })
}

function berryIcon(berry) {
  const fill = berry.color
  const drawings = {
    strawberry: `<path d="M16 8c-6 0-9 5-7 11 2 6 6 9 7 9s5-3 7-9c2-6-1-11-7-11Z" fill="${fill}"/><path d="M16 8c-3-4-7-3-9-1 4 0 6 2 9 1Zm0 0c3-4 7-3 9-1-4 0-6 2-9 1Z" fill="#879772"/>`,
    blueberry: `<circle cx="16" cy="18" r="10" fill="${fill}"/><circle cx="12" cy="14" r="2.4" fill="#fff" opacity=".42"/><path d="m14 8 2-2 2 2-2 2Z" fill="#565271"/>`,
    raspberry: `<g fill="${fill}"><circle cx="16" cy="9" r="4.3"/><circle cx="10" cy="13" r="4.3"/><circle cx="22" cy="13" r="4.3"/><circle cx="11" cy="20" r="4.3"/><circle cx="21" cy="20" r="4.3"/><circle cx="16" cy="25" r="4.3"/></g>`,
    blackberry: `<g fill="${fill}"><circle cx="12" cy="10" r="4.2"/><circle cx="20" cy="10" r="4.2"/><circle cx="8" cy="16" r="4.2"/><circle cx="16" cy="16" r="4.2"/><circle cx="24" cy="16" r="4.2"/><circle cx="11" cy="22" r="4.2"/><circle cx="20" cy="22" r="4.2"/></g>`,
    redcurrant: `<g fill="${fill}"><circle cx="10" cy="18" r="5"/><circle cx="16" cy="11" r="5"/><circle cx="22" cy="18" r="5"/><circle cx="16" cy="23" r="5"/></g><path d="M16 7c1-3 4-4 6-4" fill="none" stroke="#879772" stroke-width="1.5" stroke-linecap="round"/>`,
  }
  return `<svg viewBox="0 0 32 32" width="25" height="25">${drawings[berry.id]}</svg>`
}

function getMeasurements() {
  if (state.shape === 'circle') return [state.diameter]
  if (state.shape === 'square') return [state.width]
  return [state.length, state.width]
}

function getCakeArea() {
  if (state.shape === 'circle') return Math.PI * (state.diameter / 2) ** 2
  if (state.shape === 'square') return state.width ** 2
  return state.length * state.width
}

function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number)
}

function formatKg(grams) {
  return (grams / 1000).toFixed(2)
}

function pluralBerryName(berry) {
  const name = berry.name.toLowerCase()
  return name.endsWith('y') ? `${name.slice(0, -1)}ies` : `${name}s`
}

function berryDrawing(berry, x, y, radius, index) {
  const highlight = `<circle cx="${x - radius * .28}" cy="${y - radius * .3}" r="${Math.max(1.3, radius * .24)}" fill="#fff" opacity=".42"/>`
  if (berry.id === 'strawberry') {
    return `<g transform="translate(${x} ${y}) scale(${radius / 8}) rotate(${index % 2 ? 10 : -10})">
      <path d="M0-8C-7-8-8-2 0 9 8-2 7-8 0-8Z" fill="${berry.color}"/>
      <path d="M0-7c-4-5-8-4-10-2 4 0 7 3 10 2Zm0 0c4-5 8-4 10-2-4 0-7 3-10 2Z" fill="#879772"/>
      <g fill="#fff2d6"><circle cx="-3" cy="-2" r=".65"/><circle cx="3" cy="-1" r=".65"/><circle cx="0" cy="3" r=".65"/></g>
    </g>`
  }
  if (berry.id === 'raspberry' || berry.id === 'blackberry') {
    const r = radius * .43
    const circles = [[0, -r * .7], [-r * .8, -.1], [r * .8, -.1], [-r * .48, r * .7], [r * .48, r * .7], [0, r * 1.05]]
      .map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="${berry.color}" stroke="#fff" stroke-opacity=".22" stroke-width=".8"/>`)
      .join('')
    return circles
  }
  return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${berry.color}" stroke="#fff" stroke-width="1.2"/>${highlight}`
}

function renderCake(berry, dimensionsValid) {
  const centerX = 160
  const centerY = 132
  let shapeMarkup
  let cakeWidth
  let cakeHeight
  let radius = 0

  if (state.shape === 'circle') {
    radius = 104
    cakeWidth = radius * 2
    cakeHeight = radius * 2
    shapeMarkup = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" />`
  } else {
    const rawLength = state.shape === 'square' ? state.width : state.length
    const cakeLength = Number.isFinite(rawLength) ? rawLength : 5
    const cakeBreadth = Number.isFinite(state.width) ? state.width : 5
    const scale = Math.min(244 / cakeLength, 190 / cakeBreadth)
    cakeWidth = cakeLength * scale
    cakeHeight = cakeBreadth * scale
    const left = centerX - cakeWidth / 2
    const top = centerY - cakeHeight / 2
    shapeMarkup = `<rect x="${left}" y="${top}" width="${cakeWidth}" height="${cakeHeight}" rx="14" />`
  }

  let berriesMarkup = ''
  if (dimensionsValid) {
    const scale = state.shape === 'circle'
      ? (radius * 2) / state.diameter
      : cakeWidth / (state.shape === 'square' ? state.width : state.length)
    const spacing = Math.max(12, Math.min(27, Math.min(berry.width, berry.length) * scale * .96))
    const berryRadius = Math.max(4, Math.min(10, Math.min(berry.width, berry.length) * scale * .34))
    let index = 0

    for (let row = -cakeHeight / 2 + spacing / 2; row <= cakeHeight / 2 - spacing / 2 && index < 150; row += spacing * .92) {
      const offset = Math.round((row + cakeHeight / 2) / (spacing * .92)) % 2 ? spacing / 2 : 0
      for (let col = -cakeWidth / 2 + spacing / 2 + offset; col <= cakeWidth / 2 - spacing / 2 && index < 150; col += spacing) {
        const x = centerX + col
        const y = centerY + row
        const inside = state.shape !== 'circle' || Math.hypot(col, row) < radius - berryRadius * .55
        if (inside) {
          berriesMarkup += berryDrawing(berry, x, y, berryRadius, index)
          index += 1
        }
      }
    }
  }

  cakePreview.innerHTML = `
    <defs>
      <clipPath id="cake-clip">${shapeMarkup}</clipPath>
      <filter id="cake-shadow" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#776755" flood-opacity=".14"/>
      </filter>
    </defs>
    <g filter="url(#cake-shadow)">
      ${shapeMarkup.replace('<circle', '<circle fill="#fffefa" stroke="#e5d8ca" stroke-width="2.5"').replace('<rect', '<rect fill="#fffefa" stroke="#e5d8ca" stroke-width="2.5"')}
    </g>
    <g clip-path="url(#cake-clip)">${berriesMarkup}</g>
    <g fill="#d99b83" opacity=".72"><circle cx="46" cy="65" r="2"/><circle cx="272" cy="42" r="2.5"/><circle cx="286" cy="203" r="1.8"/></g>
  `
}

function renderResults() {
  const valid = getMeasurements().every(value => Number.isFinite(value) && value >= 5 && value <= 60)
  const berry = berries.find(item => item.id === state.berry)
  const area = valid ? getCakeArea() : 0
  const footprint = Math.PI * (berry.width / 2) * (berry.length / 2)
  const needed = valid ? Math.ceil(area / (footprint * .82)) : 0
  const purchase = Math.ceil(needed * (1 + state.reserve / 100))
  const berryName = pluralBerryName(berry)
  const weightEstimate = state.unit === 'kg'

  dimensionError.hidden = valid
  surfaceArea.textContent = valid ? `${area.toFixed(1)} cm²` : '—'
  resultArea.textContent = valid ? `${area.toFixed(1)} cm²` : '—'
  berryCount.textContent = valid
    ? weightEstimate ? formatKg(needed * berry.averageWeightG) : formatNumber(needed)
    : '—'
  berryCountLabel.textContent = weightEstimate ? 'kg' : needed === 1 ? berry.name.toLowerCase() : berryName
  purchaseCount.textContent = valid
    ? weightEstimate ? `${formatKg(purchase * berry.averageWeightG)} kg` : formatNumber(purchase)
    : '—'
  purchaseUnit.textContent = weightEstimate ? `of ${berryName}` : berryName
  unitToggle.textContent = weightEstimate ? 'Show berry count' : 'Convert to kg'
  unitToggle.setAttribute('aria-pressed', String(weightEstimate))
  estimateNote.textContent = weightEstimate
    ? 'Kilograms are estimated from typical average berry weights. Actual fruit sizes vary, so treat this as a helpful shopping guide.'
    : 'A cozy estimate, not a promise from nature. Berry sizes vary, so a few extras are always a lovely idea.'

  document.querySelectorAll('[data-shape]').forEach(button => {
    const selected = button.dataset.shape === state.shape
    button.classList.toggle('is-selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })

  renderCake(berry, valid)
}

document.querySelectorAll('[data-shape]').forEach(button => {
  button.addEventListener('click', () => {
    state.shape = button.dataset.shape
    renderDimensionFields()
    renderResults()
  })
})

document.querySelector('#reserve').addEventListener('change', event => {
  state.reserve = Number(event.target.value)
  renderResults()
})

unitToggle.addEventListener('click', () => {
  state.unit = state.unit === 'count' ? 'kg' : 'count'
  renderResults()
})

renderDimensionFields()
renderBerryOptions()
renderResults()
