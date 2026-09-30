import { useEffect, useState } from 'react'

export interface ChartColors {
  text: string
  muted: string
  grid: string
  surface: string
  income: string
  expense: string
  theme: 'light' | 'dark'
}

function readVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
  return style.getPropertyValue(name).trim() || fallback
}

/** Warna grafik dibaca dari CSS variable tema aktif. */
export function readChartColors(): ChartColors {
  const style = getComputedStyle(document.documentElement)
  return {
    text: readVar(style, '--text', '#2a0a10'),
    muted: readVar(style, '--text-muted', '#6b4a4f'),
    grid: readVar(style, '--chart-grid', 'rgba(0,0,0,0.1)'),
    surface: readVar(style, '--surface', '#f3e6d5'),
    income: readVar(style, '--income', '#3f7d58'),
    expense: readVar(style, '--expense', '#800020'),
    theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  }
}

/** Membaca ulang warna setiap kali atribut data-theme pada <html> berubah. */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState(readChartColors)
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readChartColors()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return colors
}
