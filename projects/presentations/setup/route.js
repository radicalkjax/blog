// The delivery route through the Rekindle talk. Slide frontmatter sets
// `chapter: <key>`; the HUD, route map and dividers all read this list.
export const route = [
  { key: 'intro', label: 'Intro', short: 'START' },
  { key: 'why', label: 'Why?', short: 'WHY' },
  { key: 'xfire', label: 'Xfire', short: 'XFIRE' },
  { key: 'veilid', label: 'Veilid', short: 'VEILID' },
  { key: 'tauri', label: 'Tauri', short: 'TAURI' },
  { key: 'chiral', label: 'STEAM vs STEM', short: 'CHIRAL' },
  { key: 'arch', label: 'App Arch', short: 'ARCH' },
  { key: 'tinfoil', label: 'Tinfoil Socialite', short: 'TINFOIL' },
  { key: 'lessons', label: 'What I’ve Learned', short: 'LESSONS' },
  { key: 'demo', label: 'Demo', short: 'DEMO' },
  { key: 'end', label: 'Questions', short: 'END' },
]

export function chapterIndex(key) {
  const index = route.findIndex(stop => stop.key === key)
  return index === -1 ? 0 : index
}
