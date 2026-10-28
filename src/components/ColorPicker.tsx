import { Grid3x3, Palette } from 'lucide-react'
import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'
import { normalizeHex, spectrumColor, spectrumPosition, SWATCH_GRID } from '../lib/color'
import { CATEGORY_COLORS } from '../lib/icons'
import { input, label } from './ui'

interface ColorPickerProps {
  value: string
  onChange(color: string): void
}

type Mode = 'grid' | 'spectrum'

const clamp = (n: number) => Math.min(1, Math.max(0, n))

const MODES: { mode: Mode; title: string; Icon: typeof Grid3x3 }[] = [
  { mode: 'grid', title: 'Grid', Icon: Grid3x3 },
  { mode: 'spectrum', title: 'Spectrum', Icon: Palette },
]

function Swatch({ color, selected, onSelect, className }: {
  color: string
  selected: boolean
  onSelect(): void
  className: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={color}
      title={color}
      onClick={onSelect}
      className={`${className} ${selected ? 'relative z-10 ring-2 ring-text ring-offset-2 ring-offset-bg' : ''}`}
      style={{ backgroundColor: color }}
    />
  )
}

function SwatchGrid({ value, onChange }: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const flat = SWATCH_GRID.flat()
  const cols = SWATCH_GRID[0].length
  const selectedIndex = flat.indexOf(value)

  // Roving tabindex: satu tab stop untuk seluruh grid, panah untuk berpindah.
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key]
    if (step === undefined) return
    e.preventDefault()
    const next = index + step
    if (next < 0 || next >= flat.length) return
    onChange(flat[next])
    ref.current?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)?.focus()
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="Color grid"
      // Kotak persegi maks. 22px supaya grid ringkas di laptop; di layar sempit kotak mengecil proporsional.
      className="grid w-full overflow-hidden rounded-lg border border-border"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols * 22 + 2 }}
    >
      {flat.map((c, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i === selectedIndex}
          aria-label={c}
          title={c}
          data-index={i}
          tabIndex={i === (selectedIndex === -1 ? 0 : selectedIndex) ? 0 : -1}
          onClick={() => onChange(c)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`aspect-square focus-visible:outline-none ${
            i === selectedIndex ? 'relative z-10 rounded-sm ring-2 ring-text ring-offset-1 ring-offset-bg' : 'focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

function Spectrum({ value, onChange }: ColorPickerProps) {
  // Posisi terakhir yang dipilih di spektrum dipakai selama warnanya masih sama dengan value, supaya
  // penanda tidak melompat karena pembulatan hex (mis. di tepi putih/hitam). Jika value berubah dari
  // luar (grid/hex), posisi dihitung ulang dari value.
  const [picked, setPicked] = useState(() => spectrumPosition(value))
  const pos = spectrumColor(picked.x, picked.y) === value ? picked : spectrumPosition(value)

  function pick(x: number, y: number) {
    const next = { x: clamp(x), y: clamp(y) }
    setPicked(next)
    onChange(spectrumColor(next.x, next.y))
  }

  function fromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    pick((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 0.1 : 0.02
    const delta = { ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowDown: [0, step], ArrowUp: [0, -step] }[e.key]
    if (!delta) return
    e.preventDefault()
    pick(pos.x + delta[0], pos.y + delta[1])
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Color spectrum"
      aria-valuetext={value}
      aria-valuenow={Math.round(pos.y * 360)}
      aria-valuemin={0}
      aria-valuemax={360}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        fromPointer(e)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
      }}
      onKeyDown={handleKeyDown}
      className="relative h-48 w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-border outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        // Lapisan atas = terang (putih → warna murni → hitam), lapisan bawah = hue dari atas ke bawah.
        background:
          'linear-gradient(to right, #fff, rgb(255 255 255 / 0) 50%, rgb(0 0 0 / 0) 50%, #000), ' +
          'linear-gradient(to bottom, #f00, #ff0 16.67%, #0f0 33.33%, #0ff 50%, #00f 66.67%, #f0f 83.33%, #f00)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_4px_rgb(0_0_0/0.4)]"
        style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, backgroundColor: value }}
      />
    </div>
  )
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [mode, setMode] = useState<Mode>('grid')
  const [hex, setHex] = useState(value)
  const [shown, setShown] = useState(value)

  // Sinkronkan kolom hex saat warna dipilih dari grid/spektrum.
  if (value !== shown) {
    setShown(value)
    setHex(value)
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className={label} id="color-label">Color</p>
        <div role="tablist" aria-label="Color picker mode" className="flex rounded-lg border border-border p-0.5">
          {MODES.map(({ mode: m, title, Icon }) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                mode === m ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'
              }`}
            >
              <Icon size={14} aria-hidden /> {title}
            </button>
          ))}
        </div>
      </div>
      <div aria-labelledby="color-label" className="space-y-3">
        <div role="radiogroup" aria-label="Suggested colors" className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={c === value} onSelect={() => onChange(c)} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        {mode === 'grid' ? <SwatchGrid value={value} onChange={onChange} /> : <Spectrum value={value} onChange={onChange} />}
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-10 w-10 shrink-0 rounded-xl border border-border" style={{ backgroundColor: value }} />
          <label htmlFor="color-hex" className="sr-only">Hex color</label>
          <input
            id="color-hex"
            className={`${input} font-mono uppercase`}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            value={hex}
            onChange={(e) => {
              setHex(e.target.value)
              const normalized = normalizeHex(e.target.value)
              // Hanya 6 digit yang langsung diterapkan; 3 digit diterapkan saat kolom ditinggalkan.
              if (normalized && e.target.value.replace('#', '').length === 6) onChange(normalized)
            }}
            onBlur={() => {
              const normalized = normalizeHex(hex)
              if (normalized) onChange(normalized)
              setHex(normalized ?? value)
            }}
          />
        </div>
      </div>
    </div>
  )
}
