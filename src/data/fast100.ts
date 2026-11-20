/**
 * "Fast 100": the quickest route to knowing 100 flags. Ordered from most to
 * least familiar, so new flags are introduced easiest-first. Picked for being
 * either countries most people should know or flags distinctive enough to stick
 * after one or two looks (unique shapes, emblems or colour schemes).
 */
export const FAST100_TIERS: { title: string; codes: string[] }[] = [
  { title: 'Household names', codes: ['US', 'GB', 'CA', 'JP', 'FR', 'DE', 'IT', 'CN', 'BR', 'IN', 'AU', 'MX', 'ES', 'KR', 'RU', 'CH', 'SE', 'GR', 'TR', 'IL'] },
  { title: 'Well-known countries', codes: ['AR', 'ZA', 'NL', 'BE', 'PT', 'IE', 'NO', 'DK', 'FI', 'PL', 'UA', 'AT', 'EG', 'SA', 'NG', 'KE', 'JM', 'CU', 'NZ', 'VN'] },
  { title: 'Major countries worth knowing', codes: ['TH', 'PH', 'ID', 'MY', 'SG', 'PK', 'BD', 'IR', 'IQ', 'AE', 'QA', 'MA', 'DZ', 'TN', 'ET', 'GH', 'TZ', 'CO', 'PE', 'CL'] },
  { title: 'Unmistakable designs', codes: ['NP', 'BT', 'LK', 'KH', 'LB', 'CY', 'AL', 'MK', 'KZ', 'KG', 'MN', 'PG', 'KI', 'UG', 'ZW', 'MZ', 'SZ', 'LS', 'SC', 'BB'] },
  { title: 'Distinctive and easy wins', codes: ['IS', 'CZ', 'HR', 'HU', 'GE', 'TW', 'KP', 'VA', 'PA', 'UY', 'BS', 'TT', 'LC', 'DM', 'BZ', 'GY', 'BW', 'NA', 'RW', 'SO'] },
]

export const FAST100: string[] = FAST100_TIERS.flatMap((t) => t.codes)
