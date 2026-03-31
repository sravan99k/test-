/** @jsxImportSource react */
import * as React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Add proper type for JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
import usePageTitle from "@/hooks/usePageTitle";
import { useAuthFirebase } from "@/hooks/useAuthFirebase";
import Footer from "@/components/Footer";
import GameContainer from "@/components/games/GameContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Target,
  Heart,
  BrainCircuit,
  ArrowRight,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Trophy,
  Layers,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getUserStats, updateGameCompletion, getTodaysCognitiveMinutes } from "@/services/userStatsService";
import { getGameProgress } from "@/services/wellnessService";

const calculateLevelTitle = (levels: number) => {
  if (levels >= 30) return "Cognition Prime";
  if (levels >= 15) return "Cognitive Climber";
  if (levels >= 5) return "Brain Starter";
  return "Learner";
};

// Define types for our task categories
type Task = {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  points: number;
  premium: boolean;
  benefits: string;
  image: string;
};

type Category = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  description: string;
  tasks: Task[];
};

// Define the category keys as a const array to ensure type safety
const CATEGORY_KEYS = ['cognitive', 'attention', 'emotional', 'challenge'] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

// Define task categories outside the component to avoid recreation on each render
const taskCategories: Record<CategoryKey, Category> = {
  cognitive: {
    title: "Memory & Processing Skills",
    icon: Brain,
    color: "from-[#E8F4F8] to-[#E8F4F8]",
    textColor: "text-[#2C5F7C]",
    cardBg: "bg-[#E8F4F8] hover:bg-[#E8F4F8]/90",
    borderColor: "border-[#B8D4E0] hover:border-[#A0C4D4]",
    description: "Boost your brain power with games that strengthen memory, attention, and thinking skills - essential for academic success!",
    tasks: [
      {
        id: "digit",
        title: "Number Recall",
        description: "See how many numbers you can remember in order. It gets harder as you go!",
        duration: "4-6 min",
        difficulty: "Medium",
        points: 40,
        premium: false,
        benefits: "Helps you remember things better and stay focused.",
        image: "/cognitive task images/11.webp"
      },
      {
        id: "pattern",
        title: "Pattern Match",
        description: "Find and remember patterns in colorful grids. It's like a memory game for your eyes!",
        duration: "5-8 min",
        difficulty: "Medium",
        points: 50,
        premium: false,
        benefits: "Great for visual memory and spotting details.",
        image: "/cognitive task images/12.webp"
      },
      {
        id: "word",
        title: "Word Memory",
        description: "Remember lists of words before time runs out. How many can you recall?",
        duration: "5-8 min",
        difficulty: "Medium",
        points: 50,
        premium: false,
        benefits: "Helps with vocabulary and remembering what you read.",
        image: "/cognitive task images/13.webp"
      },
      {
        id: "sequence-story",
        title: "Story Builder",
        description: "Put story events in the right order. Watch out for tricky distractions!",
        duration: "6-10 min",
        difficulty: "Hard",
        points: 60,
        premium: false,
        benefits: "Good for logical thinking and paying attention to details.",
        image: "/cognitive task images/14.webp"
      }
    ]
  },
  attention: {
    title: "Focus & Attention Control",
    icon: Zap,
    color: "from-[#F5F1E8] to-[#F5F1E8]",
    textColor: "text-[#6B5B3C]",
    cardBg: "bg-[#F5F1E8] hover:bg-[#F5F1E8]/90",
    borderColor: "border-[#D9CEB8] hover:border-[#C9BDA4]",
    description: "Sharpen your focus and attention with these challenging games.",
    tasks: [
      {
        id: "stroop",
        title: "Color Match",
        description: "Match colors and words correctly. Don't let your brain get tricked!",
        duration: "4-6 min",
        difficulty: "Medium",
        points: 40,
        premium: false,
        benefits: "Trains your brain to focus and ignore distractions.",
        image: "/cognitive task images/21.webp"
      },
      {
        id: "reaction",
        title: "Reaction Master",
        description: "Tap the targets as fast as you can! Speed is key.",
        duration: "3-5 min",
        difficulty: "Medium",
        points: 40,
        premium: false,
        benefits: "Improves your reaction time and hand-eye coordination.",
        image: "/cognitive task images/22.webp"
      },
      {
        id: "focus-marathon",
        title: "Focus Challenge",
        description: "Keep your eyes on the moving objects. Don't lose track!",
        duration: "6-10 min",
        difficulty: "Hard",
        points: 60,
        premium: false,
        benefits: "Builds long-lasting focus and mental stamina.",
        image: "/cognitive task images/23.webp"
      }
    ]
  },
  emotional: {
    title: "Social & Emotional Skills",
    icon: Heart,
    color: "from-[#F3EDF7] to-[#F3EDF7]",
    textColor: "text-[#5C4A6B]",
    cardBg: "bg-[#F3EDF7] hover:bg-[#F3EDF7]/90",
    borderColor: "border-[#D4C4DE] hover:border-[#C4B0D0]",
    description: "Understand feelings and make friends better.",
    tasks: [
      {
        id: "emotion",
        title: "Guess the Feeling",
        description: "Look at faces and situations to guess the emotion.",
        duration: "4-6 min",
        difficulty: "Medium",
        points: 45,
        premium: false,
        benefits: "Helps you understand feelings and get along with others.",
        image: "/cognitive task images/31.webp"
      },
      {
        id: "breathing",
        title: "Calm Breather",
        description: "Relax with simple breathing exercises. Follow the bubble!",
        duration: "3-5 min",
        difficulty: "Easy",
        points: 35,
        premium: false,
        benefits: "Great for calming down and reducing stress.",
        image: "/cognitive task images/32.webp"
      },
      {
        id: "mood-tracker",
        title: "Mood Diary",
        description: "Write down how you feel and understand your emotions better.",
        duration: "5-8 min",
        difficulty: "Medium",
        points: 50,
        premium: false,
        benefits: "Helps you track your feelings and stay positive.",
        image: "/cognitive task images/33.webp"
      },
      {
        id: "empathy-roleplay",
        title: "Empathy Challenge",
        description: " Step into someone else's shoes. What would you do?",
        duration: "5-8 min",
        difficulty: "Medium",
        points: 45,
        premium: false,
        benefits: "Teaches kindness and understanding others.",
        image: "/cognitive task images/34.webp"
      }
    ]
  },
  challenge: {
    title: "Advanced Brain Challenges",
    icon: Layers,
    color: "from-[#E3F3EA] to-[#E3F3EA]/90",
    textColor: "text-[#083B2B]",
    cardBg: "bg-[#E3F3EA] hover:bg-[#E3F3EA]/90",
    borderColor: "border-green-200 hover:border-green-300",
    description: "Challenge your brain with these tough puzzles.",
    tasks: [
      {
        id: "logic-puzzle",
        title: "Logic Puzzles",
        description: "Solve fun riddles and tricky logic problems.",
        duration: "6-10 min",
        difficulty: "Hard",
        points: 75,
        premium: false,
        benefits: "Makes you a better problem solver and thinker.",
        image: "/cognitive task images/41.webp"
      },
      {
        id: "spatial-puzzle",
        title: "Shape Puzzle",
        description: "Fit shapes together to solve the puzzle. It gets deeper!",
        duration: "8-12 min",
        difficulty: "Hard",
        points: 80,
        premium: false,
        benefits: "Good for understanding shapes and space.",
        image: "/cognitive task images/42.webp"
      },
      {
        id: "strategy-planner",
        title: "Planning Master",
        description: "Plan your moves carefully to solve the towers and mazes.",
        duration: "6-10 min",
        difficulty: "Hard",
        points: 75,
        premium: false,
        benefits: "Enhances planning and problem-solving skills.",
        image: "/cognitive task images/43.webp"
      },
      {
        id: "bloxorz",
        title: "Block Puzzle",
        description: "Move the flippy block to the hole without falling off!",
        duration: "8-15 min",
        difficulty: "Expert",
        points: 100,
        premium: false,
        benefits: "Tests your planning and thinking ahead.",
        image: "/cognitive task images/42.webp"
      }
    ]
  }
};

// Define the type for game results
interface GameResultsType {
  score: number;
  gameType: string;
  timeSpent: number;
  points?: number;
  taskTitle?: string;
  taskBenefits?: string;
}

const CognitiveTasks: React.FC = () => {
  usePageTitle("Cognitive Tasks");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthFirebase();
  const { toast } = useToast();

  // State declarations with proper types
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('cognitive');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [cognitiveMinutesToday, setCognitiveMinutesToday] = useState<number | null>(null);
  const [gamesCompleted, setGamesCompleted] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [cognitiveLocked, setCognitiveLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refs
  const prevPathRef = React.useRef<string>('');

  // Calculate total tasks and progress percentage
  const totalTasks = useMemo(() =>
    Object.values(taskCategories).reduce(
      (sum, category) => sum + category.tasks.length,
      0
    ), []);

  const progressPercentage = useMemo(() =>
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0,
    [completedTasks.length, totalTasks]
  );

  // Scroll to top when the route changes
  useEffect(() => {
    // Only scroll if the path has changed (not just a hash change)
    if (location.pathname !== prevPathRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Load user stats from Firebase
  const loadUserStats = useCallback(async () => {
    if (!user?.uid) return;

    // Reset loading state if needed, but we'll use the data presence to trigger animations
    setIsLoading(true);

    try {
      // Fetch stats and minutes independently
      // Trigger animation as soon as stats are available
      getGameProgress({ userId: user.uid }).then(progress => {
        setCompletedTasks(Object.keys(progress.gameStats) || []);

        // Use total completed levels for "Games Completed" count
        const totalLevels = progress.totalCompletedLevels || 0;
        setGamesCompleted(totalLevels);

        // Calculate rank based on levels
        setCurrentLevel(calculateLevelTitle(totalLevels));

        setIsLoading(false); // Trigger entrance animation for the first two cards
      });

      getTodaysCognitiveMinutes(user.uid).then(minutes => {
        setCognitiveMinutesToday(minutes);
        setCognitiveLocked(minutes >= 20);
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your stats. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [user?.uid, toast]);

  // Animation variants for stats cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Load stats when component mounts or when user changes
  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Scroll to categories section
  const scrollToCategories = useCallback(() => {
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      // Add a small delay to ensure any state updates complete first
      setTimeout(() => {
        categoriesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 50);
    }
  }, []);

  // Handle starting a new task
  const handleStartTask = useCallback((taskId: string) => {
    if (cognitiveLocked) {
      toast({
        title: 'Daily Limit Reached',
        description: 'You have reached your daily training limit. Please come back tomorrow!',
        variant: 'destructive',
      });
      return;
    }
    setGameStartTime(Date.now());
    setCurrentGame(taskId);
    // Scroll to categories section when starting a new game
    scrollToCategories();

    // Update URL to reflect the current game
    navigate(`#${taskId}`, { replace: true });
  }, [cognitiveLocked, toast, navigate]);

  const handleGameComplete = async (score: number, timeSpentSeconds: number) => {
    if (!currentGame || !user?.uid) return;

    try {
      setIsLoading(true);
      const durationMinutes = Math.ceil(timeSpentSeconds / 60);

      // Find the current task to get points and other details
      const currentTask = Object.values(taskCategories)
        .flatMap(category => category.tasks)
        .find(task => task.id === currentGame);

      if (!currentTask) return;

      // Calculate points based on score and task difficulty
      const pointsEarned = Math.ceil((score / 100) * currentTask.points);

      // Update game completion in Firebase
      const updatedStats = await updateGameCompletion(
        user.uid,
        currentGame,
        durationMinutes
      );

      // Update user points separately if needed
      if (pointsEarned > 0) {
        // Add your points update logic here if needed
      }

      // Update games completed and rank from source of truth
      await loadUserStats();

      // Legacy update for completed tasks UI state immediately if needed, 
      // though loadUserStats will cover it.
      setCompletedTasks(prev => [...new Set([...prev, currentGame])]);

      // Update cognitive minutes
      const minutes = await getTodaysCognitiveMinutes(user.uid);
      setCognitiveMinutesToday(minutes);
      setCognitiveLocked(minutes >= 20);

      toast({
        title: 'Great job!',
        description: `You've earned ${pointsEarned} points!`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating game completion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your stats. Your progress may not be saved.',
        variant: 'destructive',
      });
    } finally {
      setGameStartTime(null);
      setIsLoading(false);
    }
  };

  // Memoize the game container to prevent unnecessary re-renders
  const gameContainer = useMemo<React.ReactNode>(() => {
    if (!currentGame) return null;

    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
        <GameContainer
          gameType={currentGame}
          onComplete={handleGameComplete}
          onBack={() => setCurrentGame(null)}
        />
      </div>
    );
  }, [currentGame]);

  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert') => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-orange-100 text-orange-800";
      case "Expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };



  // Memoize the tasks grid to prevent unnecessary re-renders
  // ...existing code...

  // Main render
  return (
    <div id="onboarding-cognitive-content" className="min-h-screen bg-[#F5F7F9] dark:from-gray-900 dark:to-gray-800 relative">
      {gameContainer}
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden bg-[#5A92AB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 id="onboarding-cognitive-title" className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2.5 text-white">
              Cognitive Training
            </h1>
            <p className="text-sm sm:text-base text-white max-w-2xl mx-auto">
              Boost your brain power with fun, science-based games that improve memory, focus, and mental agility.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={!isLoading ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Games Completed */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border-t-2 border-t-[#5A92AB] border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2.5 rounded-md bg-[#EBF5F9] dark:bg-gray-700/50 text-[#5A92AB] dark:text-gray-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Games Completed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {gamesCompleted ?? 0}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Current Level */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border-t-2 border-t-[#5D9B7A] border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2.5 rounded-md bg-[#EBF6F0] dark:bg-gray-700/50 text-[#5D9B7A] dark:text-gray-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Current Level</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentLevel ?? '...'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Minutes Trained */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border-t-2 border-t-[#9B8768] border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2.5 rounded-md bg-[#F6F3ED] dark:bg-gray-700/50 text-[#9B8768] dark:text-gray-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Minutes Trained</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {cognitiveMinutesToday ?? 0}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Categories Section Anchor */}
      <div id="categories-section" className="relative -top-24"></div>

      {/* Tabs and Games Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10">
        <Tabs
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as CategoryKey)}
          className="w-full"
        >
          <div className="mb-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {Object.entries(taskCategories).map(([key, category]) => {
                const isActive = activeCategory === key;
                const cardColors = {
                  cognitive: {
                    bg: 'bg-white',
                    border: 'border-gray-200',
                    text: 'text-[#2C5F7C]',
                    hover: 'hover:bg-[#F8FBFC]',
                    activeBg: 'bg-[#E8F4F8]',
                    icon: 'text-[#6BA7C1]',
                    activeBorder: 'border-[#B8D4E0]',
                    activeText: 'text-[#1A3D52] font-semibold'
                  },
                  attention: {
                    bg: 'bg-white',
                    border: 'border-gray-200',
                    text: 'text-[#6B5B3C]',
                    hover: 'hover:bg-[#FDFCFA]',
                    activeBg: 'bg-[#F5F1E8]',
                    icon: 'text-[#A89373]',
                    activeBorder: 'border-[#D9CEB8]',
                    activeText: 'text-[#4D412A] font-semibold'
                  },
                  emotional: {
                    bg: 'bg-white',
                    border: 'border-gray-200',
                    text: 'text-[#5C4A6B]',
                    hover: 'hover:bg-[#FCFBFD]',
                    activeBg: 'bg-[#F3EDF7]',
                    icon: 'text-[#9B7EB0]',
                    activeBorder: 'border-[#D4C4DE]',
                    activeText: 'text-[#3D2F4A] font-semibold'
                  },
                  challenge: {
                    bg: 'bg-white',
                    border: 'border-gray-200',
                    text: 'text-[#3A5F4A]',
                    hover: 'hover:bg-[#F9FCF9]',
                    activeBg: 'bg-[#E8F3EA]',
                    icon: 'text-[#6AA77E]',
                    activeBorder: 'border-[#C4D9CA]',
                    activeText: 'text:#1F3A2A font-semibold'
                  }
                }[key];

                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key as CategoryKey)}
                    className={`flex items-center justify-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 w-full
                      ${isActive
                        ? `${cardColors.activeBg} border ${cardColors.activeBorder} shadow-sm`
                        : `${cardColors.bg} border ${cardColors.border} hover:shadow-sm`}
                      whitespace-nowrap cursor-pointer active:scale-[0.98]`}
                  >
                    <category.icon className={`w-4 h-4 mr-2 ${cardColors.icon}`} />
                    <span className={`${isActive ? cardColors.activeText : cardColors.text}`}>
                      {category.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {Object.entries(taskCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <motion.div
                id="onboarding-cognitive-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: !isLoading ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7"
              >
                {category.tasks.map((task) => {
                  const isMemoryTask = ['digit', 'pattern', 'word', 'sequence-story'].includes(task.id);
                  const isAttentionTask = ['stroop', 'reaction', 'focus-marathon'].includes(task.id);
                  const isEmotionalTask = ['emotion', 'breathing', 'mood-tracker', 'empathy-roleplay'].includes(task.id);
                  const isChallengeTask = ['logic-puzzle', 'spatial-puzzle', 'strategy-planner', 'bloxorz'].includes(task.id);
                  const isSpecialLayout = isMemoryTask || isAttentionTask || isEmotionalTask || isChallengeTask;
                  const isDarkTextTask = isAttentionTask || isMemoryTask;

                  if (isSpecialLayout) {
                    return (
                      <Card
                        key={task.id}
                        className="group relative flex flex-col h-full transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl overflow-hidden border border-gray-200 cursor-pointer min-h-[380px]"
                        onClick={() => handleStartTask(task.id)}
                      >
                        {/* Full Background Image */}
                        <div className="absolute inset-0">
                          <img
                            src={task.image}
                            alt={task.title}
                            className="object-cover w-full h-full"
                          />
                          {/* Removed Gradient Overlay */}
                        </div>

                        {/* Content at the Bottom */}
                        <div className="relative z-10 flex flex-col h-full justify-end p-5">
                          <div>
                            <h3 className={`font-bold text-lg mb-1 ${isDarkTextTask ? 'text-[#2C5F7C]' : 'text-white drop-shadow-md'}`}>
                              {task.title}
                            </h3>
                            <p className={`text-[11px] mb-4 leading-snug font-medium ${isDarkTextTask ? 'text-gray-700' : 'text-gray-100 drop-shadow-sm'}`}>
                              {task.description}
                            </p>

                            {/* Removed difficulty, duration, and points as requested */}
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTask(task.id);
                            }}
                            className={`w-full font-bold border-none transition-all shadow-lg ${isAttentionTask
                              ? 'bg-[#9B8768] hover:bg-[#8A7657] text-white'
                              : isEmotionalTask
                                ? 'bg-white hover:bg-gray-100 text-[#4A7F98]'
                                : isChallengeTask
                                  ? 'bg-white hover:bg-gray-100 text-[#5D9B7A]'
                                  : 'bg-white hover:bg-gray-100 text-[#2C5F7C]'
                              }`}
                          >
                            {completedTasks.includes(task.id) ? 'Play Again' : 'Start Challenge'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  }

                  return (
                    <Card key={task.id} className="flex flex-col h-full transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md overflow-hidden border border-gray-200">
                      <div className="w-full h-[160px] flex items-center justify-center overflow-hidden bg-gray-50 border-b border-gray-200">
                        <img src={task.image} alt={task.title} className="object-cover w-full h-full" />
                      </div>
                      <CardContent className="flex-1 flex flex-col justify-between p-5 bg-white dark:bg-gray-800">
                        <div>
                          <h3 className={`font-semibold text-base mb-2.5 ${category.textColor}`}>{task.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-loose">{task.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md ${category.cardBg} ${category.textColor}`}>
                              {task.difficulty}
                            </span>
                            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.duration}
                            </span>
                            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Star className="w-3 h-3 mr-1 text-gray-400" />
                              {task.points} pts
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartTask(task.id)}
                          className={`mt-3 w-full text-white transition-all ${key === 'cognitive'
                            ? 'bg-[#5A92AB] hover:bg-[#4A7F98]'
                            : key === 'attention'
                              ? 'bg-[#9B8768] hover:bg-[#8A7657]'
                              : key === 'emotional'
                                ? 'bg-[#9B7EB0] hover:bg-[#8A6D9F]'
                                : 'bg-[#5D9B7A] hover:bg-[#4C8A69]'
                            }`}
                        >
                          {completedTasks.includes(task.id) ? 'Play Again' : 'Start'}
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

export default CognitiveTasks;