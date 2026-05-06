// Dolch sight word groupings, ported from reference/curriculum-inbox/sight-words-data.js.

import type { SightWord } from '../lib/types'

export type SightWordTier = SightWord['tier']

export interface SightWordGroup {
  tier: SightWordTier
  label: string
  words: string[]
}

export const SIGHT_WORDS: SightWordGroup[] = [
  {
    tier: 'pre_primer',
    label: 'Pre-Primer (start here)',
    words: ['the','of','and','a','to','in','is','it','you','that','he','was','for','on','are','with','as','his','they'],
  },
  {
    tier: 'primer',
    label: 'Primer',
    words: ['have','from','said','like','do','my','me','by','go','no','so','we','see','here','come','look','what','get','away','this','there','them','then'],
  },
  {
    tier: 'kindergarten',
    label: 'Kindergarten + High Frequency',
    words: ['out','big','find','down','will','jump','about','our','house','too','into','who','could','would','should','where','why','when','their','your','more','before','were','after','every','been','again','please','think','know','well','any','just','came','many','very','also','another','write','brother','little','give','fast','live','thank','walk'],
  },
]

// Flat list with tier labels — handy for seeding the sight_words table.
export const SIGHT_WORDS_FLAT: { word: string; tier: SightWordTier }[] =
  SIGHT_WORDS.flatMap(g => g.words.map(w => ({ word: w, tier: g.tier })))
