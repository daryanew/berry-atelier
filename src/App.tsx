import { useMemo, useState } from 'react'
import { ArrowDown, RotateCcw, Sparkles, Minus, Plus, Info } from 'lucide-react'
import { calculateLayout, getCakeArea, reserveQuantity, validateDimension, ellipseArea, type Berry, type Cake, type Pattern, type Shape } from './lib/packing'
import './App.css'

const presets: Berry[] = [
  { id: 'strawberry', name: 'Strawberry', width: 25, length: 30, color: '#D94B63', proportion: 40, kind: 'strawberry' },
  { id: 'raspberry', name: 'Raspberry', width: 20, length: 18, color: '#E98AA5', proportion: 20, kind: 'round' },
  { id: 'blackberry', name: 'Blackberry', width: 22, length: 18, color: '#59405F', proportion: 10, kind: 'round' },
  { id: 'blueberry', name: 'Blueberry', width: 14, length: 14, color: '#7776A8', proportion: 30, kind: 'round' },
  { id: 'redcurrant', name: 'Redcurrant', width: 8, length: 8, color: '#B62F45', proportion: 0, kind: 'round' },
]

function BerryMark({ berry, small = false }: { berry: Berry; small?: boolean }) {
  return (
    <svg width={small ? 34 : 48} height={small ? 34 : 48} viewBox="0 0 48 48" aria-hidden="true">
      {berry.kind === 'strawberry' ? (
        <>
          <path d="M24 12C14 12 9 21 12 34c3 9 9 11 12 11s9-2 12-11c3-13-2-22-12-22Z" fill={berry.color} />
          <path d="M24 13c-5-5-10-4-13-1 5 0 8 3 13 1Zm0 0c5-5 10-4 13-1-5 0-8 3-13 1Z" fill="#A8B58A" />
          <g fill="#FFF8F0"><circle cx="18" cy="25" r="1.3"/><circle cx="29" cy="24" r="1.3"/><circle cx="21" cy="34" r="1.2"/><circle cx="28" cy="35" r="1.2"/></g>
        </>
      ) : berry.id === 'raspberry' ? (
        <g fill={berry.color}>{[[24,16],[17,20],[31,20],[24,24],[17,28],[31,28],[24,32],[24,38]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={i===7?4:6}/>)}</g>
      ) : berry.id === 'redcurrant' ? (
        <g fill={berry.color}><circle cx="16" cy="27" r="6"/><circle cx="24" cy="21" r="6"/><circle cx="32" cy="27" r="6"/><circle cx="24" cy="33" r="6"/></g>
      ) : berry.id === 'blackberry' ? (
        <g fill={berry.color}>{[[18,20],[27,17],[35,23],[19,29],[28,27],[34,34],[25,38],[25,23]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={5.5}/>)}</g>
      ) : (
        <><circle cx="24" cy="25" r="15" fill={berry.color}/><circle cx="19" cy="20" r="3" fill="#8E8DB5"/></>
      )}
    </svg>
  )
}


export default function App() {
  const [shape, setShape] = useState<Shape>('circle')
  const [diameter, setDiameter] = useState(24)
  const [cakeLength, setCakeLength] = useState(30)
  const [cakeWidth, setCakeWidth] = useState(20)
  const [berries, setBerries] = useState<Berry[]>(presets)
  const [pattern, setPattern] = useState<Pattern>('hex')
  const [reserve, setReserve] = useState(10)
  const [customReserve, setCustomReserve] = useState(12)
  const [zoom, setZoom] = useState(1)
  const [showSummary, setShowSummary] = useState(false)
  const [notice, setNotice] = useState('')

  const cake: Cake = useMemo(() => ({ shape, diameter, length: cakeLength, width: cakeWidth }), [shape, diameter, cakeLength, cakeWidth])
  const selectedBerries = berries.filter(b => b.proportion > 0)
  const layout = useMemo(() => calculateLayout(cake, selectedBerries, pattern), [cake, selectedBerries, pattern])
  const cakeArea = getCakeArea(cake)
  const areaCovered = layout.reduce((sum, point) => sum + ellipseArea(point.rx, point.ry), 0)
  const coverage = cakeArea > 0 ? Math.min(100, areaCovered / cakeArea * 100) : 0
  const reservePercent = reserve === -1 ? customReserve : reserve
  const counts = selectedBerries.map(berry => ({ berry, count: layout.filter(point => point.berryId === berry.id).length }))
  const reserveQuantityValue = reserveQuantity(layout.length, reservePercent)
  const theoretical = cakeArea > 0 && selectedBerries.length ? Math.ceil(cakeArea / selectedBerries.reduce((sum, berry) => sum + ellipseArea(berry.width / 2, berry.length / 2) * (berry.proportion / 100), 0)) : 0

  const updateBerry = (id: string, patch: Partial<Berry>) => setBerries(current => current.map(b => b.id === id ? { ...b, ...patch } : b))

  const reset = () => {
    setShape('circle'); setDiameter(24); setCakeLength(30); setCakeWidth(20)
    setBerries(presets); setPattern('hex'); setReserve(10); setZoom(1); setNotice('')
  }

  const valid = shape === 'circle' ? validateDimension(diameter) : shape === 'square' ? validateDimension(cakeWidth) : validateDimension(cakeLength) && validateDimension(cakeWidth)

  const viewScale = 310 / (shape === 'circle' ? 65 : shape === 'square' ? 65 : 75)

  return (
    <main>
      <header className="header">
        <a className="brand" href="#top" aria-label="Berry Atelier home">
          <BerryMark berry={presets[0]} small />
          <span><b>Berry</b> Atelier</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#calculator">Calculator</a><a href="#how">How it works</a><a href="#about">About</a>
        </nav>
        <button className="header-button" onClick={() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' })}>Start designing</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14}/> The cake decoration calculator</p>
          <h1>Your perfect berry-covered cake starts here.</h1>
          <p className="hero-subtitle">Discover exactly how many berries you need to create a beautiful, generous cake decoration.</p>
          <button className="primary" onClick={() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' })}>Design my cake <ArrowDown size={18}/></button>
        </div>
        <div className="hero-art">
          <div className="hero-cake">
            <svg viewBox="0 0 460 360" role="img" aria-label="Decorated berry cake">
              <ellipse cx="230" cy="320" rx="170" ry="22" fill="#59405F" opacity=".08"/>
              <path d="M88 180h284v112c0 24-64 43-142 43S88 316 88 292V180Z" fill="#F8E6E5"/>
              <ellipse cx="230" cy="180" rx="142" ry="58" fill="#FFF8F0" stroke="#E5D0C4" strokeWidth="5"/>
              {Array.from({length: 25}).map((_, i) => {
                const angle = i * 137.508
                const r = 18 + (i % 5) * 18
                const x = 230 + Math.cos(angle) * r * 1.15
                const y = 180 + Math.sin(angle) * r * .62
                const berry = presets[i % 4]
                return berry.kind === 'strawberry'
                  ? <BerryMark key={i} berry={berry}/>
                  : <circle key={i} cx={x} cy={y} r={berry.id === 'blueberry' ? 9 : 12} fill={berry.color}/>
              })}
              <circle cx="230" cy="180" r="48" fill="none" stroke="#F8E6E5" strokeWidth="3"/>
            </svg>
          </div>
        </div>
      </section>

      <section className="calculator" id="calculator">
        <div className="section-heading"><p className="eyebrow">Cake calculator</p><h2>Design your topping</h2></div>
        <div className="calculator-grid">
          <aside className="controls-card">
            <div className="control-section">
              <div className="control-title"><span>1</span><div><b>Cake shape</b><small>Choose a surface</small></div></div>
              <div className="shape-options">
                {(['circle','square','rectangle'] as Shape[]).map(value => (
                  <button key={value} className={shape === value ? 'active' : ''} onClick={() => setShape(value)}>
                    <span className={`shape-icon ${value}`}/>{value[0].toUpperCase()+value.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <div className="control-title"><span>2</span><div><b>Dimensions</b><small>Millimetres are converted automatically</small></div></div>
              {shape === 'circle' ? (
                <label>Diameter <div className="input-unit"><input type="number" min="5" max="60" value={diameter} onChange={e => setDiameter(Number(e.target.value))}/><span>cm</span></div></label>
              ) : shape === 'square' ? (
                <label>Side length <div className="input-unit"><input type="number" min="5" max="60" value={cakeWidth} onChange={e => setCakeWidth(Number(e.target.value))}/><span>cm</span></div></label>
              ) : (
                <div className="dimension-row">
                  <label>Length<div className="input-unit"><input type="number" min="5" max="60" value={cakeLength} onChange={e => setCakeLength(Number(e.target.value))}/><span>cm</span></div></label>
                  <label>Width<div className="input-unit"><input type="number" min="5" max="60" value={cakeWidth} onChange={e => setCakeWidth(Number(e.target.value))}/><span>cm</span></div></label>
                </div>
              )}
              {!valid && <p className="error">Use dimensions from 5 to 60 cm.</p>}
              <div className="area-note">Surface area <b>{valid ? cakeArea.toFixed(1) : '—'} cm²</b></div>
            </div>

            <div className="control-section berries-control">
              <div className="control-title"><span>3</span><div><b>Berry mix</b><small>Select types and proportions</small></div></div>
              <div className="berry-list">
                {berries.map(berry => (
                  <div className="berry-row" key={berry.id}>
                    <button className="berry-select" onClick={() => updateBerry(berry.id, { proportion: berry.proportion > 0 ? 0 : 10 })} aria-pressed={berry.proportion > 0}>
                      <BerryMark berry={berry} small/><span>{berry.name}</span>
                    </button>
                    {berry.proportion > 0 && (
                      <div className="berry-edit">
                        <input type="number" min="1" max="100" value={berry.width} onChange={e => updateBerry(berry.id, { width: Number(e.target.value) })} aria-label={`${berry.name} width`}/>
                        <span>×</span>
                        <input type="number" min="1" max="100" value={berry.length} onChange={e => updateBerry(berry.id, { length: Number(e.target.value) })} aria-label={`${berry.name} length`}/>
                        <span>mm</span>
                        <input className="proportion" type="number" min="0" max="100" value={berry.proportion} onChange={e => updateBerry(berry.id, { proportion: Number(e.target.value) })} aria-label={`${berry.name} proportion`}/>
                        <span>%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="preview-card">
            <div className="preview-toolbar">
              <div className="segmented"><button className={!showSummary ? 'active' : ''} onClick={() => setShowSummary(false)}>Simulation</button><button className={showSummary ? 'active' : ''} onClick={() => setShowSummary(true)}>Summary</button></div>
              <div className="zoom-controls"><button onClick={() => setZoom(z => Math.max(.7, z-.1))} aria-label="Zoom out"><Minus size={15}/></button><b>{Math.round(zoom*100)}%</b><button onClick={() => setZoom(z => Math.min(1.5, z+.1))} aria-label="Zoom in"><Plus size={15}/></button><button onClick={() => setZoom(1)} aria-label="Reset zoom"><RotateCcw size={15}/></button></div>
            </div>

            {showSummary ? (
              <div className="summary-view">
                <p className="eyebrow">Heuristic estimate</p><h3>{layout.length} berries</h3>
                <div className="summary-metrics"><div><span>Cake area</span><b>{cakeArea.toFixed(1)} cm²</b></div><div><span>Coverage</span><b>{coverage.toFixed(1)}%</b></div><div><span>Purchase</span><b>{reserveQuantityValue}</b></div></div>
              </div>
            ) : (
              <div className="canvas-shell">
                <svg viewBox="0 0 310 310" width="100%" height="100%" role="img" aria-label="Berry packing simulation">
                  <g transform={`translate(155 155) scale(${zoom}) translate(-155 -155)`}>
                    {shape === 'circle'
                      ? <circle cx="155" cy="155" r={diameter * viewScale / 2} fill="#FFF8F0" stroke="#DCC7BB" strokeWidth="3"/>
                      : <rect x={155 - (shape === 'square' ? cakeWidth : cakeLength) * viewScale / 2} y={155 - cakeWidth * viewScale / 2} width={(shape === 'square' ? cakeWidth : cakeLength) * viewScale} height={cakeWidth * viewScale} rx="8" fill="#FFF8F0" stroke="#DCC7BB" strokeWidth="3"/>}
                    {layout.map((point, index) => {
                      const x = 155 + point.x * viewScale
                      const y = 155 + point.y * viewScale
                      const rx = point.rx * viewScale
                      const ry = point.ry * viewScale
                      return point.kind === 'strawberry'
                        ? <g key={index} transform={`translate(${x} ${y}) rotate(${point.angle})`}><path d={`M0 ${-ry*.9}C${-rx*.95} ${-ry*.9} ${-rx} ${ry*.15} 0 ${ry}C${rx} ${ry*.15} ${rx*.95} ${-ry*.9} 0 ${-ry*.9}`} fill={point.color}/><path d={`M0 ${-ry*.75}l${-rx*.35} ${-ry*.35}l${rx*.35} ${ry*.2}l${rx*.35} ${-ry*.2}l${-rx*.35} ${ry*.35}Z`} fill="#A8B58A"/></g>
                        : <ellipse key={index} cx={x} cy={y} rx={rx} ry={ry} fill={point.color} stroke="#FFF8F0" strokeWidth=".8"/>
                    })}
                  </g>
                </svg>
              </div>
            )}

            <div className="pattern-row">
              <span>Arrangement</span>
              <div className="segmented"><button className={pattern === 'grid' ? 'active' : ''} onClick={() => setPattern('grid')}>Square</button><button className={pattern === 'hex' ? 'active' : ''} onClick={() => setPattern('hex')}>Hexagonal</button></div>
            </div>
            <div className="legend">{counts.map(({berry,count}) => <span key={berry.id}><i style={{background: berry.color}}/><b>{berry.name}</b> {count}</span>)}</div>
          </section>

          <aside className="results-card">
            <div className="results-heading"><p>Estimated result</p><button onClick={reset}><RotateCcw size={14}/> Reset</button></div>
            <div className="berry-total"><span>Actual layout</span><strong>{layout.length}</strong><small>berries placed</small></div>
            <div className="coverage"><div><span>Estimated coverage</span><b>{coverage.toFixed(1)}%</b></div><div className="bar"><i style={{width: `${coverage}%`}}/></div><small>{Math.max(0,cakeArea-areaCovered/100).toFixed(1)} cm² uncovered estimate</small></div>
            <div className="reserve-box"><label>Purchase reserve<select value={reserve} onChange={e => setReserve(Number(e.target.value))}><option value={5}>5%</option><option value={10}>10%</option><option value={15}>15%</option><option value={-1}>Custom</option></select></label>{reserve === -1 && <div className="input-unit compact"><input type="number" value={customReserve} onChange={e => setCustomReserve(Number(e.target.value))}/><span>%</span></div>}<div className="purchase"><span>Recommended purchase</span><strong>{reserveQuantityValue}</strong></div></div>
            <div className="theoretical"><Info size={15}/><div><b>Theoretical area estimate</b><span>{theoretical} berries</span></div></div>
            <p className="disclaimer">A heuristic layout, not a mathematical optimum. Natural berries vary in shape and size.</p>
            {notice && <p className="notice">{notice}</p>}
          </aside>
        </div>
      </section>

      <section className="how" id="how">
        <p className="eyebrow">How it works</p><h2>From cake to counting, in minutes.</h2>
        <div className="steps">
          {[['01','Choose your cake','Pick a shape and enter dimensions.'],['02','Select your berries','Set realistic sizes and a mixed topping.'],['03','Compare arrangements','Try square or hexagonal packing.'],['04','Review & shop','Use the generated layout as a practical estimate.']].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>

      <section className="about" id="about"><div><p className="eyebrow">Berry Atelier</p><h2>A little berry magic for every cake.</h2></div><p>Every berry is unique. Our browser-based geometric model gives you a beautiful, practical starting point for decorating—not a biological or mathematical guarantee.</p></section>
    </main>
  )
}
