/**
 * Thai & English Speech Similarity and Diff Utilities
 */

// Normalize text by removing spaces, punctuation, and optionally tone marks
export function normalizeText(text: string, removeTones: boolean = false): string {
  if (!text) return '';
  let normalized = text
    .toLowerCase()
    .replace(/[\s\s+\u200B-\u200D\uFEFF]/g, ' ') // Standardize spaces
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '') // Remove punctuation
    .trim();

  if (removeTones) {
    // Remove Thai tone marks
    normalized = normalized.replace(/[\u0e48-\u0e4c\u0e47]/g, '');
  }
  return normalized;
}

// Keep original for backwards compatibility
export function normalizeThaiText(text: string, removeTones: boolean = false): string {
  return normalizeText(text, removeTones);
}

/**
 * Calculates the Levenshtein Distance between two strings
 */
export function getLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // Deletion
          dp[i][j - 1] + 1,    // Insertion
          dp[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates string similarity percentage based on Levenshtein Distance
 */
export function calculateSimilarity(target: string, spoken: string): number {
  const cleanTarget = normalizeText(target, false).replace(/\s+/g, '');
  const cleanSpoken = normalizeText(spoken, false).replace(/\s+/g, '');

  if (!cleanTarget && !cleanSpoken) return 100;
  if (!cleanTarget || !cleanSpoken) return 0;

  const dist = getLevenshteinDistance(cleanTarget, cleanSpoken);
  const maxLen = Math.max(cleanTarget.length, cleanSpoken.length);
  const score = ((maxLen - dist) / maxLen) * 100;

  // For Thai checks
  const cleanTargetNoTones = normalizeText(target, true).replace(/\s+/g, '');
  const cleanSpokenNoTones = normalizeText(spoken, true).replace(/\s+/g, '');
  const distNoTones = getLevenshteinDistance(cleanTargetNoTones, cleanSpokenNoTones);
  const maxLenNoTones = Math.max(cleanTargetNoTones.length, cleanSpokenNoTones.length);
  const scoreNoTones = maxLenNoTones > 0 ? ((maxLenNoTones - distNoTones) / maxLenNoTones) * 100 : 0;

  return Math.round(Math.max(score, scoreNoTones));
}

export interface DiffSegment {
  char: string;
  isMatched: boolean;
}

export interface WordDiffSegment {
  word: string;
  isMatched: boolean;
}

/**
 * Computes a character-level match mapping for the target string.
 */
export function computeThaiDiff(target: string, spoken: string): DiffSegment[] {
  const cleanTarget = target.trim();
  const cleanSpoken = spoken.trim();

  const tArr = Array.from(cleanTarget);
  const sArr = Array.from(cleanSpoken);

  const m = tArr.length;
  const n = sArr.length;
  const lcsMatrix: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const tCharClean = normalizeText(tArr[i - 1], true);
      const sCharClean = normalizeText(sArr[j - 1], true);
      
      if (tArr[i - 1] === sArr[j - 1] || (tCharClean && sCharClean && tCharClean === sCharClean)) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  const matchedTargetIndices = new Set<number>();
  let i = m;
  let j = n;
  
  while (i > 0 && j > 0) {
    const tCharClean = normalizeText(tArr[i - 1], true);
    const sCharClean = normalizeText(sArr[j - 1], true);

    if (tArr[i - 1] === sArr[j - 1] || (tCharClean && sCharClean && tCharClean === sCharClean)) {
      matchedTargetIndices.add(i - 1);
      i--;
      j--;
    } else if (lcsMatrix[i - 1][j] >= lcsMatrix[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return tArr.map((char, index) => {
    if (char === ' ') {
      return { char, isMatched: true };
    }
    return {
      char,
      isMatched: matchedTargetIndices.has(index)
    };
  });
}

/**
 * Computes a word-level match mapping for English sentences.
 * This is much cleaner for English where highlighting word by word makes more sense!
 */
export function computeEnglishWordDiff(target: string, spoken: string): WordDiffSegment[] {
  // Normalize and split by spaces
  const tWords = target.trim().split(/\s+/);
  const sWords = spoken.trim().split(/\s+/);

  const m = tWords.length;
  const n = sWords.length;
  const lcsMatrix: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const tWordClean = normalizeText(tWords[i - 1]);
      const sWordClean = normalizeText(sWords[j - 1]);

      if (tWordClean === sWordClean) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  const matchedTargetIndices = new Set<number>();
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    const tWordClean = normalizeText(tWords[i - 1]);
    const sWordClean = normalizeText(sWords[j - 1]);

    if (tWordClean === sWordClean) {
      matchedTargetIndices.add(i - 1);
      i--;
      j--;
    } else if (lcsMatrix[i - 1][j] >= lcsMatrix[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return tWords.map((word, index) => {
    return {
      word,
      isMatched: matchedTargetIndices.has(index)
    };
  });
}
