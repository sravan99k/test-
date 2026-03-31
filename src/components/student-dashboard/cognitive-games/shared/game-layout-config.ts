/**
 * Game Layout Configuration — Single Source of Truth
 * 
 * All 15 games import from here for consistent card styling, spacing, and colors.
 * To update the look across ALL games, change values here only.
 */

export const GAME_LAYOUT = {
  /** Card border & background */
  card: {
    borderColor: '#3862DD',
    borderWidth: '2px',
    background: '#f0f7ff',
    radius: '1.5rem',       // 24px – rounded-3xl equivalent
  },

  /** Page / viewport background */
  page: {
    background: '#ffffff',
  },

  /** Results page accents */
  results: {
    passedColor: '#3B82F6',    // Blue-500
    failedColor: '#60A5FA',    // Blue-400
  },

  /** Consistent padding – responsive */
  spacing: {
    cardPaddingX: { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
    cardPaddingY: { mobile: '1rem', tablet: '1.25rem', desktop: '1.5rem' },
    pageMaxWidth: '64rem',     // max-w-4xl
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Pre-built Tailwind class strings for direct use in JSX className  */
/* ------------------------------------------------------------------ */

/** Outer wrapper for gameplay screens — fills viewport between Nav & Footer, no scroll */
export const gameViewportClasses =
  'flex-1 min-h-0 flex flex-col overflow-hidden bg-white';

/** The main content card with blue border & light-blue tint */
export const gameCardClasses =
  'border-4 border-[#3862DD] bg-[#F0F7FF] rounded-[3rem] shadow-[0_20px_50px_rgba(56,98,221,0.1)]';

/** Inner content area within the card */
export const gameContentClasses =
  'flex-1 min-h-0 flex flex-col items-center overflow-hidden';

/** Centered container with responsive padding */
export const gameContainerClasses =
  'w-full max-w-4xl mx-auto px-4 sm:px-6';

/** Level select pages — allow page scroll, no viewport constraint */
export const levelSelectClasses =
  'w-full bg-white font-sans text-blue-900';
