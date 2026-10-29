/**
 * Groups of flags that are commonly confused with each other. Used to pick
 * tough multiple-choice distractors and to power "look-alike" drills.
 */
export interface SimilarGroup {
  id: string
  title: string
  hint: string
  codes: string[]
}

export const SIMILAR_GROUPS: SimilarGroup[] = [
  { id: 'nordic', title: 'Nordic crosses', hint: 'Off-centre crosses: colour is everything.', codes: ['DK', 'SE', 'NO', 'FI', 'IS'] },
  { id: 'chad-romania', title: 'Chad vs Romania', hint: 'Chad uses a darker, indigo blue; Romania is a brighter blue.', codes: ['TD', 'RO', 'AD', 'MD'] },
  { id: 'red-white-bicolours', title: 'Red & white bicolours', hint: 'Monaco/Indonesia: red on top. Poland: white on top. Singapore adds a crescent. Monaco is squarer than Indonesia.', codes: ['MC', 'ID', 'PL', 'SG', 'MT'] },
  { id: 'aus-nz', title: 'Australia vs New Zealand', hint: 'Australia: 6 white stars incl. the big Commonwealth star. New Zealand: 4 red stars with white borders.', codes: ['AU', 'NZ', 'FJ', 'TV'] },
  { id: 'ireland-ivory', title: 'Ireland vs Ivory Coast', hint: 'Ireland: green at the hoist. Ivory Coast: orange at the hoist.', codes: ['IE', 'CI', 'IT', 'MX'] },
  { id: 'lux-nl', title: 'Luxembourg vs Netherlands', hint: 'Luxembourg uses a lighter sky blue and a longer flag; Netherlands a darker blue.', codes: ['LU', 'NL', 'RU', 'HR', 'PY', 'SI', 'SK', 'RS'] },
  { id: 'slavic', title: 'Slavic tricolours', hint: 'Russia white-blue-red, Slovenia & Slovakia add a coat of arms (left), Serbia red-blue-white with arms, Croatia red-white-blue with checkerboard.', codes: ['RU', 'SI', 'SK', 'RS', 'HR'] },
  { id: 'pan-african-tricolours', title: 'Pan-African tricolours', hint: 'Senegal: green star in the middle. Mali: no star. Guinea: red-yellow-green (reverse of Mali). Cameroon: star on the red.', codes: ['SN', 'ML', 'GN', 'CM', 'GH', 'BO', 'ET', 'LT', 'BJ'] },
  { id: 'pan-arab', title: 'Pan-Arab colours', hint: 'Jordan: 7-point star in red triangle. Palestine: plain red triangle. Sudan: green triangle. Kuwait: black trapezoid. UAE: vertical red bar.', codes: ['JO', 'PS', 'SD', 'KW', 'AE', 'EH', 'IQ', 'SY', 'EG', 'YE'] },
  { id: 'egypt-iraq-syria-yemen', title: 'Red-white-black stripes', hint: 'Yemen: plain. Egypt: golden eagle. Iraq: green Arabic script. Syria (2025): green-white-black with three red stars.', codes: ['YE', 'EG', 'IQ', 'SY', 'PS', 'JO'] },
  { id: 'qatar-bahrain', title: 'Qatar vs Bahrain', hint: 'Bahrain: red with 5 white serrations. Qatar: maroon with 9 serrations.', codes: ['QA', 'BH'] },
  { id: 'central-america', title: 'Central American blue-white-blue', hint: 'Honduras: 5 stars. Nicaragua: triangle emblem. El Salvador: emblem with the words. Guatemala: vertical bars. Argentina: sun.', codes: ['HN', 'NI', 'SV', 'GT', 'AR'] },
  { id: 'gran-colombia', title: 'Yellow-blue-red (Gran Colombia)', hint: 'Colombia: plain, yellow is half the flag. Venezuela: arc of 8 stars. Ecuador: coat of arms in the centre.', codes: ['CO', 'VE', 'EC'] },
  { id: 'italy-mexico', title: 'Italy vs Mexico', hint: 'Mexico has the eagle-and-snake emblem and is longer; Italy is plain green-white-red.', codes: ['IT', 'MX', 'IE', 'HU', 'BG'] },
  { id: 'hungary-bulgaria', title: 'Hungary vs Bulgaria', hint: 'Hungary: red-white-green. Bulgaria: white-green-red.', codes: ['HU', 'BG', 'IT'] },
  { id: 'austria-latvia', title: 'Austria vs Latvia vs Lebanon', hint: 'Austria: equal bands, bright red. Latvia: dark maroon, thin white stripe. Lebanon: cedar tree.', codes: ['AT', 'LV', 'LB', 'PE', 'CA'] },
  { id: 'belgium-germany', title: 'Belgium vs Germany', hint: 'Belgium: vertical black-yellow-red. Germany: horizontal black-red-gold.', codes: ['BE', 'DE'] },
  { id: 'india-niger', title: 'India vs Niger', hint: 'India: saffron-white-green with a blue wheel. Niger: orange-white-green with an orange sun.', codes: ['IN', 'NE', 'CI', 'IE'] },
  { id: 'blue-white', title: 'Blue & white', hint: 'Greece: 9 stripes + cross. Israel: Star of David. Finland: blue cross. Somalia: single white star. San Marino / Micronesia: light blue.', codes: ['GR', 'IL', 'FI', 'SO', 'SM', 'FM', 'UY', 'AR'] },
  { id: 'star-crescent', title: 'Star & crescent', hint: 'Türkiye: red, star at right. Tunisia: red with white disc. Pakistan: green with white hoist bar. Algeria: green-white halves. Mauritania: green with red bands. Libya: red-black-green.', codes: ['TR', 'TN', 'PK', 'DZ', 'MR', 'LY', 'MV', 'MY', 'AZ', 'UZ', 'TM'] },
  { id: 'malaysia-liberia-us', title: 'Stripes & canton', hint: 'USA: 13 stripes, 50 stars. Liberia: 11 stripes, 1 star. Malaysia: 14 stripes, crescent & star.', codes: ['US', 'LR', 'MY', 'TG', 'UY', 'GR'] },
  { id: 'cuba-pr-chile', title: 'Triangle & star', hint: 'Cuba: blue stripes, red triangle. Chile: white over red, blue canton. Czechia: blue triangle, white over red. Philippines: blue over red with sun.', codes: ['CU', 'CL', 'CZ', 'PH', 'TL', 'ST', 'DJ', 'VU'] },
  { id: 'estonia-gabon', title: 'Horizontal tricolours with blue/green', hint: 'Estonia: blue-black-white. Gabon: green-yellow-blue. Sierra Leone: green-white-blue. Lesotho: blue-white-green with hat.', codes: ['EE', 'GA', 'SL', 'LS', 'UZ', 'RW'] },
  { id: 'sudan-ss', title: 'Black-red-green', hint: 'Kenya: Maasai shield. Malawi: rising sun. Libya: white crescent. Afghanistan: emblem.', codes: ['KE', 'MW', 'LY', 'AF', 'IQ'] },
  { id: 'southern-cross', title: 'Southern Cross & Pacific', hint: 'Papua New Guinea: bird of paradise. Samoa: red with blue canton. Fiji: light blue. Tuvalu: light blue with 9 stars.', codes: ['PG', 'WS', 'FJ', 'TV', 'AU', 'NZ', 'CK'] },
  { id: 'green-white', title: 'Green & white', hint: 'Nigeria: vertical green-white-green. Pakistan: crescent. Saudi Arabia: script & sword. Norfolk-style pines are not countries!', codes: ['NG', 'PK', 'SA', 'BD', 'DZ', 'MR'] },
  { id: 'tiny-islands', title: 'Caribbean islands', hint: 'St Lucia: triangles. St Vincent: diamonds. St Kitts: diagonal stars. Grenada: nutmeg. Dominica: parrot. Antigua: sun in a V. Barbados: trident. Bahamas: black triangle.', codes: ['LC', 'VC', 'KN', 'GD', 'DM', 'AG', 'BB', 'BS', 'TT', 'JM'] },
  { id: 'cross-flags', title: 'Flags with crosses', hint: 'Switzerland: square. Georgia: five crosses. Tonga: red cross in canton. Dominican Rep: cross with emblem. Greece: cross canton.', codes: ['CH', 'GE', 'TO', 'DO', 'GR', 'DK', 'SE', 'NO', 'FI', 'IS'] },
  { id: 'koreas-japan', title: 'East Asian discs', hint: 'Japan: red disc on white. Bangladesh: red disc on green. Palau: yellow disc on blue. Laos: white disc on blue stripe. South Korea: taegeuk + trigrams.', codes: ['JP', 'BD', 'PW', 'LA', 'KR', 'KP'] },
  { id: 'uk-derivatives', title: 'Blue with a star / canton', hint: 'Somalia: one star. Micronesia: four stars. Kosovo: six stars + map. Nauru: yellow stripe + star. Bosnia: triangle + stars. EU-like designs.', codes: ['SO', 'FM', 'XK', 'NR', 'BA', 'TV', 'FJ'] },
  { id: 'poland-indonesia-etc', title: 'Andorra vs Moldova', hint: 'Both blue-yellow-red with a coat of arms. Andorra: cows on the arms, lighter blue. Moldova: eagle holding a shield.', codes: ['AD', 'MD', 'RO', 'TD'] },
  { id: 'armenia-colombia', title: 'Armenia vs Colombia', hint: 'Armenia: red-blue-orange equal bands. Colombia: yellow (half)-blue-red.', codes: ['AM', 'CO', 'VE', 'EC'] },
  { id: 'ghana-bolivia', title: 'Ghana vs Bolivia vs Ethiopia', hint: 'Ghana: red-yellow-green with black star. Bolivia: red-yellow-green plain (or arms). Ethiopia: green-yellow-red with blue disc. Lithuania: yellow-green-red.', codes: ['GH', 'BO', 'ET', 'LT', 'GN', 'ML', 'BF', 'CG', 'CM', 'TG', 'BJ', 'MM'] },
  { id: 'mozambique-zimbabwe', title: 'Southern Africa', hint: 'South Africa: Y shape. Zimbabwe: bird & star. Mozambique: AK-47. Zambia: eagle in corner. Botswana: light blue with black stripe.', codes: ['ZA', 'ZW', 'MZ', 'ZM', 'BW', 'NA', 'SZ', 'LS', 'MW', 'TZ'] },
  { id: 'tanzania-namibia', title: 'Diagonal stripes', hint: 'Tanzania: green & blue split by black. Namibia: red diagonal with sun. DR Congo: sky blue with red diagonal. Trinidad: black diagonal. Saint Kitts: black diagonal with stars. Congo: green & red split by yellow.', codes: ['TZ', 'NA', 'CD', 'TT', 'KN', 'CG', 'SB', 'BN', 'MH'] },
  { id: 'tricolour-vertical', title: 'Vertical tricolours', hint: 'France, Belgium, Ireland, Italy, Romania, Chad, Moldova, Andorra, Mali, Guinea, Nigeria, Peru, Canada.', codes: ['FR', 'BE', 'IE', 'IT', 'RO', 'TD', 'MD', 'AD', 'ML', 'GN', 'NG', 'PE', 'CA', 'CI', 'MX'] },
  { id: 'central-asia', title: 'Central Asia', hint: 'Kazakhstan: sun & eagle on sky blue. Uzbekistan: blue-white-green with crescent. Turkmenistan: carpet stripe. Kyrgyzstan: red with yurt sun. Tajikistan: red-white-green with crown.', codes: ['KZ', 'UZ', 'TM', 'KG', 'TJ', 'MN'] },
  { id: 'baltics', title: 'Baltics', hint: 'Estonia: blue-black-white. Latvia: maroon-white-maroon. Lithuania: yellow-green-red.', codes: ['EE', 'LV', 'LT'] },
  { id: 'benelux-balkans', title: 'Balkans', hint: 'Albania: double-headed eagle. North Macedonia: sun rays. Montenegro: gold-bordered red with eagle. Bosnia: triangle. Kosovo: map. Serbia: arms. Croatia: checkerboard.', codes: ['AL', 'MK', 'ME', 'BA', 'XK', 'RS', 'HR', 'SI'] },
  { id: 'indian-ocean', title: 'Indian Ocean islands', hint: 'Mauritius: four stripes. Seychelles: rays. Comoros: four stripes + crescent. Madagascar: white hoist bar. Maldives: green with crescent. Sri Lanka: lion.', codes: ['MU', 'SC', 'KM', 'MG', 'MV', 'LK'] },
  { id: 'gulf', title: 'Arabian Gulf', hint: 'Oman: white-red-green with red hoist bar. UAE: green-white-black with red hoist bar. Kuwait: green-white-red with black trapezoid.', codes: ['OM', 'AE', 'KW', 'QA', 'BH', 'SA', 'YE', 'JO'] },
  { id: 'west-africa-stars', title: 'West Africa', hint: 'Togo: stripes + star canton. Burkina Faso: red over green with yellow star. Ghana: black star. Cape Verde: stripes & ring of stars. Liberia: one star. Guinea-Bissau: red bar with black star. Senegal: green star.', codes: ['TG', 'BF', 'GH', 'CV', 'LR', 'GW', 'SN', 'ML', 'GN', 'SL', 'GM', 'BJ', 'NE', 'NG', 'CI'] },
  { id: 'southeast-asia', title: 'Southeast Asia', hint: 'Thailand: red-white-blue-white-red. Costa Rica: blue-white-red-white-blue. Cambodia: Angkor Wat. Vietnam: yellow star. Laos: white disc. Myanmar: white star on yellow-green-red.', codes: ['TH', 'CR', 'KH', 'VN', 'LA', 'MM', 'MY', 'ID', 'SG', 'PH', 'BN', 'TL'] },
]

const index = new Map<string, Set<string>>()
for (const g of SIMILAR_GROUPS) {
  for (const c of g.codes) {
    if (!index.has(c)) index.set(c, new Set())
    for (const other of g.codes) if (other !== c) index.get(c)!.add(other)
  }
}

export function lookalikes(code: string): string[] {
  return [...(index.get(code) ?? [])]
}
