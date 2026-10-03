/** "v0.3.0 · 8e0da4e" di build Netlify, "v0.3.0" saat dijalankan lokal. */
export function formatVersion(version: string, commit: string): string {
  const short = commit.slice(0, 7)
  return short ? `v${version} · ${short}` : `v${version}`
}

export const APP_VERSION_LABEL = formatVersion(__APP_VERSION__, __COMMIT_REF__)
