import { CATEGORY_ICONS } from '../lib/icons'
import { label } from './ui'

interface IconPickerProps {
  value: string
  onChange(name: string): void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div>
      <p className={label} id="icon-label">Icon</p>
      <div role="radiogroup" aria-labelledby="icon-label" className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
        {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => {
          const checked = name === value
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={name}
              title={name}
              onClick={() => onChange(name)}
              className={`flex aspect-square items-center justify-center rounded-lg border ${
                checked ? 'border-primary bg-primary text-on-primary' : 'border-border bg-bg text-text hover:bg-surface'
              }`}
            >
              <Icon size={18} aria-hidden />
            </button>
          )
        })}
      </div>
    </div>
  )
}
