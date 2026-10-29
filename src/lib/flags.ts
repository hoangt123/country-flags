// Bundled flag SVGs from the flag-icons package (4:3 aspect ratio).
const files = import.meta.glob('/node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const byCode: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const m = path.match(/\/([a-z0-9-]+)\.svg$/)
  if (m) byCode[m[1].toUpperCase()] = url
}

export function flagUrl(code: string): string {
  return byCode[code.toUpperCase()] ?? ''
}
