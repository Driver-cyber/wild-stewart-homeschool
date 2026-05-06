/* Personalization layer — rewrites lesson sight words and practice sentences
   based on which sight words a given student has marked as Mastered.

   Why this exists:
     Once a child has mastered a sight word, drilling it again is wasted reps.
     This module swaps mastered words for fresh unmastered ones (same tier when
     possible) and rewrites the practice sentence to match.

   Public API:
     window.getMasteredSightWords(state, studentId) -> Set<string>
     window.personalizeEntry(entry, mastered)       -> entry (cloned + adapted)
     window.personalizeLesson(lesson, mastered, week, kind) -> lesson
*/

(function () {
  'use strict';

  /* All sight words flattened, in tier order. Stable index = priority. */
  const ALL_SW = (() => {
    const list = [];
    (window.SIGHT_WORDS || []).forEach((g, gi) => {
      g.words.forEach((w, wi) => list.push({ word: w, tier: gi, idx: wi }));
    });
    return list;
  })();

  const TIER_OF = (() => {
    const m = {};
    ALL_SW.forEach(({ word, tier }) => { m[word.toLowerCase()] = tier; });
    return m;
  })();

  /* Words that show up in lesson sentences but aren't in the sight-word list —
     don't try to substitute these. Just a safety net. */
  function isSightWord(w) {
    return Object.prototype.hasOwnProperty.call(TIER_OF, w.toLowerCase());
  }

  /* Tiny deterministic hash so the same lesson always picks the same swap
     (stable across renders, no Math.random surprises). */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function getMasteredSightWords(state, studentId) {
    const map = state?.sightWords?.[studentId] || {};
    const set = new Set();
    Object.entries(map).forEach(([w, s]) => { if (s === 'mastered') set.add(w.toLowerCase()); });
    return set;
  }

  /* Find replacement sight words.
     - Prefer same tier as the original
     - Then any tier <= original (foundational)
     - Then later tiers
     - Skip anything already used in this lesson (avoid dupes) */
  function pickReplacements({ originalWords, mastered, exclude, count, seed }) {
    const used = new Set([...exclude].map(w => w.toLowerCase()));
    originalWords.forEach(w => used.add(w.toLowerCase()));

    const candidates = ALL_SW.filter(({ word }) => {
      const w = word.toLowerCase();
      return !mastered.has(w) && !used.has(w);
    });

    if (!candidates.length) return [];

    /* Score candidates: closer-tier preferred. We bucket by tier proximity to
       the median tier of the original lesson words; then within each bucket
       rotate by seed so different weeks pick different fresh words. */
    const origTiers = originalWords
      .map(w => TIER_OF[w.toLowerCase()])
      .filter(t => t !== undefined);
    const targetTier = origTiers.length
      ? Math.round(origTiers.reduce((a, b) => a + b, 0) / origTiers.length)
      : 0;

    candidates.sort((a, b) => {
      const da = Math.abs(a.tier - targetTier);
      const db = Math.abs(b.tier - targetTier);
      if (da !== db) return da - db;
      return a.idx - b.idx;
    });

    /* Rotate within the closest-tier group by seed */
    const closest = candidates.filter(c => Math.abs(c.tier - targetTier) === Math.abs(candidates[0].tier - targetTier));
    const rest = candidates.filter(c => Math.abs(c.tier - targetTier) !== Math.abs(candidates[0].tier - targetTier));
    const offset = seed % closest.length;
    const rotated = closest.slice(offset).concat(closest.slice(0, offset));
    const ordered = rotated.concat(rest);

    return ordered.slice(0, count).map(c => c.word);
  }

  /* Rewrite a sentence: any token that matches a mastered sight word gets
     replaced. Preserves capitalization and trailing punctuation. */
  function rewriteSentence(sentence, mastered, replacementsByLower) {
    if (!sentence) return sentence;
    return sentence.replace(/([A-Za-z']+)/g, (match) => {
      const lower = match.toLowerCase();
      if (!mastered.has(lower)) return match;
      const sub = replacementsByLower[lower];
      if (!sub) return match;
      /* preserve capitalization of original token */
      if (match[0] === match[0].toUpperCase()) {
        return sub[0].toUpperCase() + sub.slice(1);
      }
      return sub;
    });
  }

  function personalizeLesson(lesson, mastered, week, kind) {
    if (!lesson) return lesson;
    const original = lesson.sightWords || [];
    if (!original.length && !lesson.sentence) return lesson;

    /* Which originals are mastered? */
    const masteredHere = original.filter(w => mastered.has(w.toLowerCase()));
    if (!masteredHere.length) return lesson; // nothing to swap

    const kept = original.filter(w => !mastered.has(w.toLowerCase()));
    const needed = original.length - kept.length;
    const replacements = pickReplacements({
      originalWords: original,
      mastered,
      exclude: kept,
      count: needed,
      seed: hash(`${week}_${kind}`),
    });

    /* Map each mastered original to a replacement (1:1 in order) */
    const subMap = {};
    masteredHere.forEach((w, i) => {
      if (replacements[i]) subMap[w.toLowerCase()] = replacements[i];
    });

    const newSightWords = original.map(w => subMap[w.toLowerCase()] || w);
    const newSentence = rewriteSentence(lesson.sentence, mastered, subMap);

    return {
      ...lesson,
      sightWords: newSightWords,
      sentence: newSentence,
      _personalized: {
        original: { sightWords: original, sentence: lesson.sentence },
        swaps: subMap,
      },
    };
  }

  function personalizeEntry(entry, mastered) {
    if (!entry) return entry;
    const reading = personalizeLesson(entry.reading, mastered, entry.week, 'reading');
    const spelling = personalizeLesson(entry.spelling, mastered, entry.week, 'spelling');
    if (reading === entry.reading && spelling === entry.spelling) return entry;
    return { ...entry, reading, spelling };
  }

  window.getMasteredSightWords = getMasteredSightWords;
  window.personalizeLesson = personalizeLesson;
  window.personalizeEntry = personalizeEntry;
  window.isSightWord = isSightWord;
})();
