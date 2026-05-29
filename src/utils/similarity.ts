/**
 * Thai Speech Similarity and Diff Utilities
 */

// Normalize Thai text by removing spaces, punctuation, and optionally tone marks for more lenient matching
export function normalizeThaiText(text: string, removeTones: boolean = false): string {
  if (!text) return '';
  let normalized = text
    .toLowerCase()
    .replace(/[\s\s+\u200B-\u200D\uFEFF]/g, '') // Remove spaces and zero-width spaces
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ''); // Remove punctuation

  if (removeTones) {
    // Remove Thai tone marks (่ ้ ๊ ๋) and other diacritics like ็ (ไม้ไต่คู้), ์ (ทัณฑฆาต)
    normalized = normalized.replace(/[\u0e48-\u0e4c\u0e47]/g, '');
  }
  return normalized;
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
  const cleanTarget = normalizeThaiText(target, false);
  const cleanSpoken = normalizeThaiText(spoken, false);

  if (!cleanTarget && !cleanSpoken) return 100;
  if (!cleanTarget || !cleanSpoken) return 0;

  // Let's also do a second check removing tones, and take the highest score.
  // This is highly beneficial for children whose tones might not be picked up perfectly by the microphone
  const distWithTones = getLevenshteinDistance(cleanTarget, cleanSpoken);
  const maxLenWithTones = Math.max(cleanTarget.length, cleanSpoken.length);
  const scoreWithTones = ((maxLenWithTones - distWithTones) / maxLenWithTones) * 100;

  const cleanTargetNoTones = normalizeThaiText(target, true);
  const cleanSpokenNoTones = normalizeThaiText(spoken, true);
  const distNoTones = getLevenshteinDistance(cleanTargetNoTones, cleanSpokenNoTones);
  const maxLenNoTones = Math.max(cleanTargetNoTones.length, cleanSpokenNoTones.length);
  const scoreNoTones = maxLenNoTones > 0 ? ((maxLenNoTones - distNoTones) / maxLenNoTones) * 100 : 0;

  // We will blend or take the maximum to be generous to the kid, but keeping a realistic balance.
  // Take maximum score but cap it or return the best matching.
  const finalScore = Math.max(scoreWithTones, scoreNoTones);
  
  return Math.round(finalScore);
}

export interface DiffSegment {
  char: string;
  isMatched: boolean;
}

/**
 * Computes a character-level match mapping for the target string.
 * This determines which characters in the target string are correctly spoken,
 * allowing us to highlight exactly what the child got right (green) vs missed (gray/red).
 * We use a Longest Common Subsequence (LCS) approach to find alignment.
 */
export function computeThaiDiff(target: string, spoken: string): DiffSegment[] {
  const cleanTarget = target.trim();
  const cleanSpoken = spoken.trim();

  // Find LCS of characters (ignoring spaces for alignment index, but mapping back to original)
  const tArr = Array.from(cleanTarget);
  const sArr = Array.from(cleanSpoken);

  // We want to align them. Let's do LCS on arrays of characters.
  const m = tArr.length;
  const n = sArr.length;
  const lcsMatrix: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // Normalize character comparison slightly to be more forgiving (e.g. ignore case, tone check)
      const tCharClean = normalizeThaiText(tArr[i - 1], true);
      const sCharClean = normalizeThaiText(sArr[j - 1], true);
      
      // If characters are identical, or clean versions match (and they are not empty spaces)
      if (tArr[i - 1] === sArr[j - 1] || (tCharClean && sCharClean && tCharClean === sCharClean)) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  // Backtrack to find which characters in target are matched
  const matchedTargetIndices = new Set<number>();
  let i = m;
  let j = n;
  
  while (i > 0 && j > 0) {
    const tCharClean = normalizeThaiText(tArr[i - 1], true);
    const sCharClean = normalizeThaiText(sArr[j - 1], true);

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

  // Create visual segments from target characters
  return tArr.map((char, index) => {
    // Spaces are always considered "matched" or styled neutrally, but let's count them as matched for aesthetics
    if (char === ' ') {
      return { char, isMatched: true };
    }
    return {
      char,
      isMatched: matchedTargetIndices.has(index)
    };
  });
}
