import { useState, useCallback } from 'react';

// List of abusive words to filter (can be expanded as needed)
const PROFANITY_LIST = [
  // English profanities
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'crap',
  'damn', 'bastard', 'dickhead', 'piss', 'wanker', 'twat', 'cock', 'prick', 'cunt',
  'motherfucker', 'fucker', 'shitty', 'ass', 'bollocks', 'arse', 'arsehole', 'bellend',
  'bloody', 'bugger', 'bum', 'choad', 'crikey', 'darn', 'douche', 'fanny', 'feck',
  'goddamn', 'jesus christ', 'jesus', 'christ', 'minge', 'minger', 'munter', 'pissed',
  'pissed off', 'pissflaps', 'shag', 'shat', 'shit', 'shite', 'shitfaced', 'shitting',
  'skank', 'slapper', 'slag', 'spastic', 'spaz', 'suck', 'tits', 'titties', 'twunt',
  'wank', 'wanker', 'wankstain', 'whore', 'wtf',
  
  // Hindi profanities
  'bhosdike', 'madarchod', 'behenchod', 'bhenchod', 'bhosdi', 'chutiya', 'chutiye',
  'gaandu', 'gandu', 'lund', 'loda', 'lawda', 'lavde', 'choot', 'chut', 'chootiya',
  'randi', 'rand', 'saala', 'sala', 'kutta', 'kuttiya', 'bhadwa', 'bhosda', 'chakke',
  'chutmarike', 'chutad', 'chutia', 'chuchi', 'gaand', 'gand', 'gandfat', 'gandit',
  'gandu', 'harami', 'haramzaade', 'haramkhor', 'kamine', 'kamina', 'kutti', 'laura',
  'lavde', 'lodu', 'lounde', 'lund', 'lundtopi', 'maa chuda', 'madar', 'madarchod',
  'mader', 'mammey', 'rand', 'randi', 'sadi', 'sala', 'sali', 'saala', 'saali',
  'suar', 'tatti', 'teri maa', 'teri maa ka', 'teri maa ki', 'tharak', 'tharki',
  'tujhe', 'tumhari', 'tumhari maa', 'tumhari maa ka', 'tumhari maa ki', 'ullu',
  'ullu ka pattha', 'bhadwe', 'bhosdike', 'bhosdiwala', 'bsdk', 'chakka', 'chhapri',
  'chudai', 'chut', 'chutad', 'chutia', 'chutiya', 'gaandu', 'gand', 'gandu', 'gandfat',
  'gandit', 'harami', 'haramzaade', 'haramkhor', 'kamine', 'kamina', 'kutti', 'laura',
  'lavde', 'lodu', 'lounde', 'lund', 'lundtopi', 'maa chuda', 'madar', 'madarchod',
  'mader', 'mammey', 'rand', 'randi', 'sadi', 'sala', 'sali', 'saala', 'saali',
  'suar', 'tatti', 'teri maa', 'teri maa ka', 'teri maa ki', 'tharak', 'tharki',
  'tujhe', 'tumhari', 'tumhari maa', 'tumhari maa ka', 'tumhari maa ki', 'ullu',
  'ullu ka pattha'
];

// Create a regex pattern that matches any word in the profanity list with word boundaries
const PROFANITY_PATTERN = new RegExp(
  PROFANITY_LIST
    .map(word => {
      // Escape special regex characters
      const escaped = word.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
      // Add word boundaries for whole word matching
      return `\\b${escaped}\\b`;
    })
    .join('|'),
  'gi'
);

export const useProfanityFilter = () => {
  const [hasProfanity, setHasProfanity] = useState(false);

  // Function to check if text contains profanity
  const checkProfanity = useCallback((text: string): boolean => {
    if (!text) return false;
    // Convert to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    // Check for exact matches in the profanity list
    return PROFANITY_LIST.some(word => {
      // Create a regex that matches the word as a whole word
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
      return wordRegex.test(lowerText);
    });
  }, []);

  // Function to filter profanity from text
  const filterProfanity = useCallback((text: string): string => {
    if (!text) return '';
    let result = text;
    // Process each profanity word separately
    PROFANITY_LIST.forEach(word => {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(wordRegex, '*'.repeat(word.length));
    });
    return result;
  }, []);

  // Function to validate input and update state
  const validateInput = useCallback((text: string): string => {
    const containsProfanity = checkProfanity(text);
    setHasProfanity(containsProfanity);
    
    if (containsProfanity) {
      return filterProfanity(text);
    }
    return text;
  }, [checkProfanity, filterProfanity]);

  return {
    hasProfanity,
    checkProfanity,
    filterProfanity,
    validateInput
  };
};

export default useProfanityFilter;
