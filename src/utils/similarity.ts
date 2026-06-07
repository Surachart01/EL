/**
 * Thai & English Speech Similarity and Diff Utilities
 */

// Standardize English numbers and contractions for leniency
export function standardizeEnglishSpeech(text: string): string {
  let result = text.toLowerCase();
  
  // 1. Map digits (0-20) to word representation
  const digitMap: Record<string, string> = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
    '14': 'fourteen', '15': 'fifteen', '16': 'sixteen', '17': 'seventeen',
    '18': 'eighteen', '19': 'nineteen', '20': 'twenty'
  };
  
  for (const [digit, word] of Object.entries(digitMap)) {
    const regex = new RegExp(`\\b${digit}\\b`, 'g');
    result = result.replace(regex, word);
  }

  // 2. Expand common contractions
  const contractionsMap: Record<string, string> = {
    "i'm": "i am",
    "im": "i am",
    "what's": "what is",
    "whats": "what is",
    "it's": "it is",
    "its": "it is",
    "don't": "do not",
    "dont": "do not",
    "can't": "cannot",
    "cant": "cannot",
    "let's": "let us",
    "lets": "let us",
    "you're": "you are",
    "youre": "you are",
    "we're": "we are",
    "they're": "they are",
    "theyre": "they are",
    "he's": "he is",
    "hes": "he is",
    "she's": "she is",
    "shes": "she is",
    "didn't": "did not",
    "didnt": "did not",
    "isn't": "is not",
    "isnt": "is not",
    "aren't": "are not",
    "arent": "are not",
    "wasn't": "was not",
    "wasnt": "was not",
    "weren't": "were not",
    "werent": "were not"
  };

  for (const [contraction, expansion] of Object.entries(contractionsMap)) {
    if (contraction.includes("'")) {
      result = result.replace(new RegExp(contraction.replace("'", "['’]"), 'g'), expansion);
    } else {
      result = result.replace(new RegExp(`\\b${contraction}\\b`, 'g'), expansion);
    }
  }

  return result;
}

// Normalize text by removing spaces, punctuation, and optionally tone marks
export function normalizeText(text: string, removeTones: boolean = false): string {
  if (!text) return '';
  let standardized = standardizeEnglishSpeech(text);
  let normalized = standardized
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
 * Checks if targetWords is a subsequence of spokenWords
 */
function isSubsequence(targetWords: string[], spokenWords: string[]): boolean {
  let tIdx = 0;
  for (let sIdx = 0; sIdx < spokenWords.length; sIdx++) {
    if (targetWords[tIdx] === spokenWords[sIdx]) {
      tIdx++;
      if (tIdx === targetWords.length) return true;
    }
  }
  return false;
}

/**
 * Calculates string similarity percentage based on Levenshtein Distance
 * with added leniency rules for kids (subsequence matching and minor typo tolerance).
 */
export function calculateSimilarity(target: string, spoken: string): number {
  const normTarget = normalizeText(target, false);
  const normSpoken = normalizeText(spoken, false);

  if (!normTarget && !normSpoken) return 100;
  if (!normTarget || !normSpoken) return 0;

  const targetWords = normTarget.split(/\s+/);
  const spokenWords = normSpoken.split(/\s+/);

  // 1. Subsequence match (e.g. if child says "this is an apple" for target "apple", it's 100%)
  if (isSubsequence(targetWords, spokenWords)) {
    return 100;
  }

  // 2. Character-level Levenshtein distance
  const cleanTarget = normTarget.replace(/\s+/g, '');
  const cleanSpoken = normSpoken.replace(/\s+/g, '');

  const dist = getLevenshteinDistance(cleanTarget, cleanSpoken);
  const maxLen = Math.max(cleanTarget.length, cleanSpoken.length);
  let score = ((maxLen - dist) / maxLen) * 100;

  // Leniency rules for young kids:
  // - If only 1 character is different in a short word (length <= 5), give them 85% (passing)
  // - If only 2 characters are different in a medium word (length 6-8), give them 80% (passing)
  if (dist === 1 && maxLen <= 5) {
    score = Math.max(score, 85);
  } else if (dist <= 2 && maxLen >= 6 && maxLen <= 8) {
    score = Math.max(score, 80);
  }

  // For Thai checks (if any)
  const cleanTargetNoTones = normalizeText(target, true).replace(/\s+/g, '');
  const cleanSpokenNoTones = normalizeText(spoken, true).replace(/\s+/g, '');
  const distNoTones = getLevenshteinDistance(cleanTargetNoTones, cleanSpokenNoTones);
  const maxLenNoTones = Math.max(cleanTargetNoTones.length, cleanSpokenNoTones.length);
  let scoreNoTones = maxLenNoTones > 0 ? ((maxLenNoTones - distNoTones) / maxLenNoTones) * 100 : 0;

  if (distNoTones === 1 && maxLenNoTones <= 5) {
    scoreNoTones = Math.max(scoreNoTones, 85);
  } else if (distNoTones <= 2 && maxLenNoTones >= 6 && maxLenNoTones <= 8) {
    scoreNoTones = Math.max(scoreNoTones, 80);
  }

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
  // Normalize and split by spaces, expanding contractions/digits first to align correctly
  const cleanTarget = target.trim();
  const cleanSpoken = spoken.trim();

  const stdTarget = standardizeEnglishSpeech(cleanTarget);
  const stdSpoken = standardizeEnglishSpeech(cleanSpoken);

  const tWords = stdTarget.split(/\s+/);
  const sWords = stdSpoken.split(/\s+/);

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
