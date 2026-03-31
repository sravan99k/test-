import React from 'react';

import StroopGame from './StroopGame';
import EmotionRecognitionGame from './EmotionRecognitionGame';
import BubbleBreathingGame from './BubbleBreathingGame';
import DigitSpanGame from './DigitSpanGame';
import ReactionTimeGame from './ReactionTimeGame';
import PatternMemoryGame from './PatternMemoryGame';
import MoodTrackerGame from './MoodTrackerGame';
import SequenceStoryGame from './SequenceStoryGame';
import SpatialPuzzleGame from './SpatialPuzzleGame';
import StrategyPlannerGame from './StrategyPlannerGame';
import EmpathyRoleplayGame from './EmpathyRoleplayGame';
import FocusMarathonGame from './FocusMarathonGame';
import LogicPuzzleGame from './LogicPuzzleGame';
import WordMemoryGame from './WordMemoryGame';
import BloxorzGame from './BloxorzGame';

export type GameId =
  | 'stroop'
  | 'emotion'
  | 'breathing'
  | 'digit'
  | 'reaction'
  | 'pattern'
  | 'mood-tracker'
  | 'sequence-story'
  | 'spatial-puzzle'
  | 'strategy-planner'
  | 'empathy-roleplay'
  | 'focus-marathon'
  | 'logic-puzzle'
  | 'word'
  | 'bloxorz'
  | 'sustained-attention'
  | 'dual-nback'
  | 'task-switching'
  | 'planning-tower';

export type GameCategoryId =
  | 'memory-and-pattern'
  | 'attention-and-speed'
  | 'emotion-and-planning'
  | 'calm-and-regulation'
  | 'spatial-3d'
  | 'executive-coming-soon';

export interface GameComponentProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export interface GameDefinition {
  id: GameId;
  title: string;
  shortTitle: string;
  description: string;
  categoryId: GameCategoryId;
  component?: React.ComponentType<GameComponentProps>;
  isComingSoon?: boolean;
}

export const GAME_DEFINITIONS: Record<GameId, GameDefinition> = {
  // Memory & pattern games
  stroop: {
    id: 'stroop',
    title: 'Color Match',
    shortTitle: 'Color Match',
    description: 'Train selective attention and cognitive control by matching ink color and word.',
    categoryId: 'memory-and-pattern',
    component: StroopGame,
  },
  emotion: {
    id: 'emotion',
    title: 'Guess the Feeling',
    shortTitle: 'Guess the Feeling',
    description: 'Practice recognizing emotions from facial expressions and scenarios.',
    categoryId: 'emotion-and-planning',
    component: EmotionRecognitionGame,
  },
  breathing: {
    id: 'breathing',
    title: 'Calm Breather',
    shortTitle: 'Calm Breather',
    description: 'Guided breathing with calming visuals to build self-regulation skills.',
    categoryId: 'calm-and-regulation',
    component: BubbleBreathingGame,
  },
  digit: {
    id: 'digit',
    title: 'Number Recall',
    shortTitle: 'Number Recall',
    description: 'Remember sequences of digits across increasing levels of difficulty.',
    categoryId: 'memory-and-pattern',
    component: DigitSpanGame,
  },
  reaction: {
    id: 'reaction',
    title: 'Reaction Master',
    shortTitle: 'Reaction Master',
    description: 'Measure and train reaction speed with fast visual cues.',
    categoryId: 'attention-and-speed',
    component: ReactionTimeGame,
  },
  pattern: {
    id: 'pattern',
    title: 'Pattern Match',
    shortTitle: 'Pattern Match',
    description: 'Memorize and recall visual patterns of shapes on a grid.',
    categoryId: 'memory-and-pattern',
    component: PatternMemoryGame,
  },
  'mood-tracker': {
    id: 'mood-tracker',
    title: 'Mood Diary',
    shortTitle: 'Mood Diary',
    description: 'Track daily mood and reflections to build emotional awareness.',
    categoryId: 'emotion-and-planning',
    component: MoodTrackerGame,
  },
  'sequence-story': {
    id: 'sequence-story',
    title: 'Story Builder',
    shortTitle: 'Story Builder',
    description: 'Arrange story events in the correct order to build narrative memory.',
    categoryId: 'memory-and-pattern',
    component: SequenceStoryGame,
  },
  'spatial-puzzle': {
    id: 'spatial-puzzle',
    title: 'Shape Puzzle',
    shortTitle: 'Shape Puzzle',
    description: 'Solve spatial puzzles that train visual-spatial reasoning.',
    categoryId: 'emotion-and-planning',
    component: SpatialPuzzleGame,
  },
  'strategy-planner': {
    id: 'strategy-planner',
    title: 'Planning Master',
    shortTitle: 'Planning Master',
    description: 'Plan ahead and make strategic decisions to reach a goal.',
    categoryId: 'emotion-and-planning',
    component: StrategyPlannerGame,
  },
  'empathy-roleplay': {
    id: 'empathy-roleplay',
    title: 'Empathy Challenge',
    shortTitle: 'Empathy Challenge',
    description: 'Explore social situations and practice empathetic responding.',
    categoryId: 'emotion-and-planning',
    component: EmpathyRoleplayGame,
  },
  'focus-marathon': {
    id: 'focus-marathon',
    title: 'Focus Challenge',
    shortTitle: 'Focus Challenge',
    description: 'Sustain attention over time with a continuous focus task.',
    categoryId: 'attention-and-speed',
    component: FocusMarathonGame,
  },
  'logic-puzzle': {
    id: 'logic-puzzle',
    title: 'Logic Puzzles',
    shortTitle: 'Logic Puzzles',
    description: 'Solve logic puzzles that require reasoning and problem solving.',
    categoryId: 'attention-and-speed',
    component: LogicPuzzleGame,
  },
  word: {
    id: 'word',
    title: 'Word Memory',
    shortTitle: 'Word Memory',
    description: 'Remember and recall words to strengthen verbal memory.',
    categoryId: 'memory-and-pattern',
    component: WordMemoryGame,
  },
  bloxorz: {
    id: 'bloxorz',
    title: 'Block Puzzle',
    shortTitle: 'Block Puzzle',
    description: 'Navigate a 3D block through challenging spatial puzzles.',
    categoryId: 'spatial-3d',
    component: BloxorzGame,
  },

  // Executive / advanced games that are marked as coming soon
  'sustained-attention': {
    id: 'sustained-attention',
    title: 'Focus Hero',
    shortTitle: 'Focus Hero',
    description: 'A game to help you focus for a long time (coming soon).',
    categoryId: 'executive-coming-soon',
    isComingSoon: true,
  },
  'dual-nback': {
    id: 'dual-nback',
    title: 'Memory Dual',
    shortTitle: 'Memory Dual',
    description: 'A tricky game to test your memory (coming soon).',
    categoryId: 'executive-coming-soon',
    isComingSoon: true,
  },
  'task-switching': {
    id: 'task-switching',
    title: 'Switch Master',
    shortTitle: 'Switch Master',
    description: 'Practice switching between different tasks quickly (coming soon).',
    categoryId: 'executive-coming-soon',
    isComingSoon: true,
  },
  'planning-tower': {
    id: 'planning-tower',
    title: 'Tower Planner',
    shortTitle: 'Tower Planner',
    description: 'A fun puzzle game where you plan your moves (coming soon).',
    categoryId: 'executive-coming-soon',
    isComingSoon: true,
  },
};
