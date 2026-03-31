import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Trophy, Heart, Target, BookOpen, Users, Calendar, CheckCircle2, Zap, Activity, Droplets, GlassWater, Moon, BedDouble, MessageCircle, MessageSquare, Sparkles, RefreshCw, Brain, Medal, FileText, Gamepad2, Box, LayoutGrid, Layers, Lightbulb } from "lucide-react";

import { auth, db } from "@/integrations/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAchievements, saveAchievement, getMoodEntries, getWellnessGoals, getGameProgress } from "@/services/wellnessService";
import { listBadges, getStressManagementStats, getSleepRelaxationStats, getHealthyMindStats, hasBadge as hasResourceBadge, awardBadge as awardResourceBadge } from "@/services/resourcesService";
import { getStudentAssessments } from "@/services/assessmentService";
import { getJournalEntries } from "@/services/journalService";

const AchievementBadges = () => {
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [resourceBadges, setResourceBadges] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    // Map category to route
    const routeMap: Record<string, string> = {
      'Assessment': '/assessment',
      'Mood': '/wellness/mood',
      'Journal': '/wellness/journal',
      'Goals': '/wellness/goals',
      'Engagement': '/wellness/badges',
      'Learning': '/resources',
      'Gaming': '/tasks'
    };

    const route = routeMap[category] || '/';
    navigate(route);
  };

  // Removed duplicate useEffect - will be handled below

  const availableBadges = [
    {
      id: "first_assessment",
      name: "First Steps",
      description: "Completed your first mental health assessment",
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      category: "Assessment",
      requirement: "Complete 1 assessment"
    },
    {
      id: "assessment_streak_7",
      name: "Consistent Checker",
      description: "Completed assessments for 7 consecutive days",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      category: "Assessment",
      requirement: "7-day assessment streak"
    },
    {
      id: "mood_tracker_week",
      name: "Mood Master",
      description: "Tracked your mood for 7 consecutive days",
      icon: <Heart className="h-8 w-8 text-rose-500" />,
      category: "Mood",
      requirement: "Track mood for 7 days"
    },
    {
      id: "first_journal",
      name: "First Reflection",
      description: "Wrote your first journal entry",
      icon: <BookOpen className="h-8 w-8 text-indigo-500" />,
      category: "Journal",
      requirement: "Write 1 journal entry"
    },
    {
      id: "journal_writer",
      name: "Thoughtful Writer",
      description: "Written 10 journal entries",
      icon: <FileText className="h-8 w-8 text-purple-500" />,
      category: "Journal",
      requirement: "Write 10 journal entries"
    },
    {
      id: "journal_master",
      name: "Journal Master",
      description: "Written 25 journal entries",
      icon: <BookOpen className="h-8 w-8 text-purple-700" />,
      category: "Journal",
      requirement: "Write 25 journal entries"
    },
    {
      id: "goal_achiever",
      name: "Goal Getter",
      description: "Completed your first wellness goal",
      icon: <Target className="h-8 w-8 text-emerald-500" />,
      category: "Goals",
      requirement: "Complete 1 wellness goal"
    },
    {
      id: "wellness_warrior",
      name: "Wellness Warrior",
      description: "Used the platform for 30 consecutive days",
      icon: <Trophy className="h-8 w-8 text-amber-500" />,
      category: "Engagement",
      requirement: "30-day platform streak"
    },
    {
      id: "resource_explorer",
      name: "Resource Explorer",
      description: "Explored all available resources",
      icon: <Award className="h-8 w-8 text-cyan-500" />,
      category: "Learning",
      requirement: "Visit all resource sections"
    }
  ];

  // Resource badges catalog to merge into existing available list (no separate category)
  // Resource badges catalog to merge into existing available list (no separate category)
  const resourceBadgesCatalog = [
    { id: 'exercise-first', name: 'First Exercise', description: 'Logged your first exercise', icon: <Zap className="h-8 w-8 text-yellow-500" />, category: 'Learning', requirement: 'Complete exercise once' },
    { id: 'active-achiever', name: 'Active Achiever', description: '7-day exercise streak', icon: <Activity className="h-8 w-8 text-orange-500" />, category: 'Learning', requirement: '7-day exercise streak' },
    { id: 'hydration-starter', name: 'Hydration Starter', description: 'Logged hydration today', icon: <Droplets className="h-8 w-8 text-blue-400" />, category: 'Learning', requirement: 'Complete hydration once' },
    { id: 'hydration-hero', name: 'Hydration Hero', description: '7-day hydration streak', icon: <GlassWater className="h-8 w-8 text-blue-600" />, category: 'Learning', requirement: '7-day hydration streak' },
    { id: 'sleep-first', name: 'First Sleep Log', description: 'Logged your first sleep', icon: <Moon className="h-8 w-8 text-indigo-400" />, category: 'Learning', requirement: 'Complete sleep log once' },
    { id: 'sleep-champion', name: 'Sleep Champion', description: '7-day sleep streak', icon: <BedDouble className="h-8 w-8 text-indigo-600" />, category: 'Learning', requirement: '7-day sleep streak' },
    { id: 'selftalk-first', name: 'First Affirmation', description: 'Completed your first Positive Self-Talk', icon: <MessageCircle className="h-8 w-8 text-pink-400" />, category: 'Learning', requirement: 'Complete Positive Self-Talk once' },
    { id: 'selftalk-streaker', name: 'Self-Talk Streaker', description: '7-day Positive Self-Talk streak', icon: <MessageSquare className="h-8 w-8 text-pink-600" />, category: 'Learning', requirement: '7-day self-talk streak' },
    { id: 'gratitude-first', name: 'First Gratitude', description: 'Logged your first Gratitude Practice', icon: <Star className="h-8 w-8 text-yellow-400" />, category: 'Learning', requirement: 'Complete Gratitude once' },
    { id: 'gratitude-guru', name: 'Gratitude Guru', description: '7-day Gratitude Practice streak', icon: <Sparkles className="h-8 w-8 text-yellow-600" />, category: 'Learning', requirement: '7-day gratitude streak' },
    { id: 'reframing-first', name: 'First Reframe', description: 'Completed Thought Reframing once', icon: <RefreshCw className="h-8 w-8 text-purple-400" />, category: 'Learning', requirement: 'Complete Reframing once' },
    { id: 'reframing-pro', name: 'Reframing Pro', description: '7-day Thought Reframing streak', icon: <Brain className="h-8 w-8 text-purple-600" />, category: 'Learning', requirement: '7-day reframing streak' },
    { id: 'consistency-star', name: 'Consistency Star', description: 'Completed a 4-week Growth Journal streak', icon: <Medal className="h-8 w-8 text-gold-500" />, category: 'Learning', requirement: '4-week Growth Journal streak' }
  ];

  const gameBadgesCatalog = [
    // Progression
    { id: 'game_novice', name: 'Brain Starter', description: 'Complete 5 levels across any games', icon: <Gamepad2 className="h-8 w-8 text-blue-400" />, category: 'Gaming', requirement: '5 levels completed' },
    { id: 'game_intermediate', name: 'Cognitive Climber', description: 'Complete 15 levels across any games', icon: <Zap className="h-8 w-8 text-indigo-400" />, category: 'Gaming', requirement: '15 levels completed' },
    { id: 'game_master', name: 'Neuro-Navigator', description: 'Complete 30 levels across any games', icon: <Trophy className="h-8 w-8 text-amber-500" />, category: 'Gaming', requirement: '30 levels completed' },
    { id: 'xp_aspirant', name: 'XP Aspirant', description: 'Earn 500 Total XP in cognitive tasks', icon: <Sparkles className="h-8 w-8 text-cyan-400" />, category: 'Gaming', requirement: '500 XP earned' },

    // Game Specific Mastery
    { id: 'bloxorz_explorer', name: '3D Explorer', description: 'Reach level 5 in Bloxorz', icon: <Box className="h-8 w-8 text-orange-400" />, category: 'Gaming', requirement: 'Bloxorz Level 5' },
    { id: 'bloxorz_master', name: 'Cube Master', description: 'Reach level 20 in Bloxorz', icon: <LayoutGrid className="h-8 w-8 text-orange-600" />, category: 'Gaming', requirement: 'Bloxorz Level 20' },
    { id: 'digit_span_pro', name: 'Memory Pro', description: 'Reach level 5 in Digit Span', icon: <Brain className="h-8 w-8 text-emerald-400" />, category: 'Gaming', requirement: 'Digit Span Level 5' },
    { id: 'story_builder_pro', name: 'Logic Architect', description: 'Reach level 5 in Sequence Story', icon: <Layers className="h-8 w-8 text-purple-400" />, category: 'Gaming', requirement: 'Sequence Story Level 5' },
    { id: 'pattern_memory_pro', name: 'Pattern Pro', description: 'Reach level 5 in Pattern Match', icon: <LayoutGrid className="h-8 w-8 text-blue-500" />, category: 'Gaming', requirement: 'Pattern Match Level 5' },
    { id: 'word_memory_pro', name: 'Lexicon Master', description: 'Reach level 5 in Word Memory', icon: <BookOpen className="h-8 w-8 text-indigo-500" />, category: 'Gaming', requirement: 'Word Memory Level 5' },
    { id: 'logic_puzzle_pro', name: 'Riddle Solver', description: 'Reach level 5 in Logic Puzzles', icon: <Lightbulb className="h-8 w-8 text-yellow-400" />, category: 'Gaming', requirement: 'Logic Puzzles Level 5' },
    { id: 'spatial_puzzle_pro', name: 'Shape Shifter', description: 'Reach level 5 in Shape Puzzle', icon: <Box className="h-8 w-8 text-cyan-500" />, category: 'Gaming', requirement: 'Shape Puzzle Level 5' },
    { id: 'strategy_planner_pro', name: 'Master Strategist', description: 'Reach level 5 in Planning Master', icon: <Target className="h-8 w-8 text-rose-500" />, category: 'Gaming', requirement: 'Planning Master Level 5' },
    { id: 'emotion_expert', name: 'Emotion Expert', description: 'Reach level 5 in Guess the Feeling', icon: <Heart className="h-8 w-8 text-rose-400" />, category: 'Gaming', requirement: 'Guess the Feeling Level 5' },
    { id: 'social_star', name: 'Social Star', description: 'Reach level 5 in Empathy Challenge', icon: <Users className="h-8 w-8 text-indigo-400" />, category: 'Gaming', requirement: 'Empathy Challenge Level 5' },
    { id: 'focus_titan', name: 'Focus Titan', description: 'Reach level 5 in Focus Challenge', icon: <Zap className="h-8 w-8 text-amber-500" />, category: 'Gaming', requirement: 'Focus Challenge Level 5' },
    { id: 'stroop_pro', name: 'Color Master', description: 'Reach level 5 in Color Match', icon: <Activity className="h-8 w-8 text-orange-500" />, category: 'Gaming', requirement: 'Color Match Level 5' },
    { id: 'reaction_pro', name: 'Quick Reflex', description: 'Reach level 5 in Reaction Master', icon: <Zap className="h-8 w-8 text-yellow-600" />, category: 'Gaming', requirement: 'Reaction Master Level 5' },
    { id: 'breathing_pro', name: 'Calm Master', description: 'Reach level 5 in Calm Breather', icon: <Droplets className="h-8 w-8 text-sky-400" />, category: 'Gaming', requirement: 'Calm Breather Level 5' },
    { id: 'mood_pro', name: 'Self-Aware', description: 'Complete 5 entries in Mood Diary', icon: <BookOpen className="h-8 w-8 text-teal-400" />, category: 'Gaming', requirement: 'Mood Diary 5 entries' },
    { id: 'attention_pro', name: 'Attention Hero', description: 'Reach level 5 in Sustained Attention', icon: <Zap className="h-8 w-8 text-rose-500" />, category: 'Gaming', requirement: 'Attention Level 5' },
    { id: 'nback_pro', name: 'Dual Master', description: 'Reach level 5 in Dual N-Back', icon: <Brain className="h-8 w-8 text-indigo-500" />, category: 'Gaming', requirement: 'N-Back Level 5' },
    { id: 'switching_pro', name: 'Switch Master', description: 'Reach level 5 in Task Switching', icon: <RefreshCw className="h-8 w-8 text-orange-500" />, category: 'Gaming', requirement: 'Switching Level 5' },
    { id: 'tower_pro', name: 'Tower Planner', description: 'Reach level 5 in Planning Tower', icon: <Layers className="h-8 w-8 text-cyan-600" />, category: 'Gaming', requirement: 'Tower Level 5' }
  ];

  const allAvailableBadges = [...availableBadges, ...resourceBadgesCatalog, ...gameBadgesCatalog];

  const getCanonicalBadgeIdForAchievement = (achievement: any) => {
    if (!achievement) return '';

    const type = achievement.achievement_type;
    const name = achievement.achievement_name;

    // Prefer matching against our known badge catalog by id
    let matchedBadge = allAvailableBadges.find(badge => badge.id === type);
    if (matchedBadge) {
      return matchedBadge.id;
    }

    // Fallback: match by name in case older achievements used name instead of id
    matchedBadge = allAvailableBadges.find(badge => badge.name === name);
    if (matchedBadge) {
      return matchedBadge.id;
    }

    // Last resort: use whatever identifiers we have
    return type || name || achievement.id;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [, statsData, fetchedBadges, gameData] = await Promise.all([
          fetchAchievements(),
          fetchUserStats(),
          fetchResourceBadges(), // Now returns the badges
          fetchGameProgress()
        ]);

        // Optimistically calculate new badges without re-fetching
        // Use the badges we just fetched to check for existence
        const newBadges = await backfillResourceBadges(statsData, fetchedBadges);

        // If we awarded new badges, add them to state immediately
        if (newBadges && newBadges.length > 0) {
          setResourceBadges(prev => [...prev, ...newBadges]);
        }
      } catch (error) {
        console.error("Error loading achievement data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchAchievements = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const achievements = await getAchievements({ userId: user.uid });

        // Deduplicate achievements by canonical badge id so each conceptual badge is only counted once
        const canonicalAchievements = new Map<string, any>();

        achievements.forEach((achievement: any) => {
          const canonicalId = getCanonicalBadgeIdForAchievement(achievement);

          if (!canonicalAchievements.has(canonicalId)) {
            const badge = allAvailableBadges.find(b => b.id === canonicalId);

            canonicalAchievements.set(canonicalId, {
              ...achievement,
              achievement_type: canonicalId,
              achievement_name: badge?.name || achievement.achievement_name,
              description: badge?.description || achievement.description,
              badge_icon: badge?.icon || achievement.badge_icon
            });
          }
        });

        setUserAchievements(Array.from(canonicalAchievements.values()));
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Get student's school information from user document
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        // Prepare promises for parallel execution
        let assessmentsPromise = Promise.resolve([]);
        let journalsPromise = Promise.resolve([]);

        // Only fetch assessments if we have proper student data
        if (userData && userData.studentId && userData.parentAdminId && userData.schoolId) {
          assessmentsPromise = getStudentAssessments({
            studentId: userData.studentId,
            adminId: userData.parentAdminId,
            schoolId: userData.schoolId,
            organizationId: userData.organizationId || null
          }).catch((error) => {
            console.error('Error fetching assessments:', error);
            return [];
          });
        }

        // Fetch journals if we have proper student data
        if (userData && userData.studentId && userData.parentAdminId && userData.schoolId) {
          journalsPromise = getJournalEntries({
            studentId: userData.studentId,
            adminId: userData.parentAdminId,
            schoolId: userData.schoolId,
            organizationId: userData.organizationId || null
          }).catch((error) => {
            console.error('Error fetching journals:', error);
            return [];
          });
        }

        const moodsPromise = getMoodEntries({ userId: user.uid }).catch(() => []);
        const goalsPromise = getWellnessGoals({ userId: user.uid }).catch(() => []);
        const smPromise = getStressManagementStats(user.uid).catch(() => ({} as any));
        const slPromise = getSleepRelaxationStats(user.uid).catch(() => ({} as any));
        const hmPromise = getHealthyMindStats(user.uid).catch(() => ({} as any));

        // Execute all promises in parallel
        const [assessments, journals, moods, goals, smStats, slStats, hmStats] = await Promise.all([
          assessmentsPromise,
          journalsPromise,
          moodsPromise,
          goalsPromise,
          smPromise,
          slPromise,
          hmPromise
        ]);

        // Count completed goals
        const completedGoals = goals.filter((g: any) => g.is_completed).length;

        setUserStats(prev => ({
          ...prev,
          assessments: assessments.length,
          moods: moods.length,
          journals: journals.length,
          goals: goals.length,
          completedGoals: completedGoals,
          // Resource streaks for achievements-style awarding
          exerciseStreak: Number((smStats as any)?.exerciseStreak || 0),
          hydrationStreak: Number((smStats as any)?.hydrationStreak || 0),
          sleepStreak: Number((slStats as any)?.sleepStreak || 0),
          selfTalkStreak: Number((hmStats as any)?.selfTalkStreak || 0),
          gratitudeStreak: Number((hmStats as any)?.gratitudeStreak || 0),
          reframeStreak: Number((hmStats as any)?.reframeStreak || 0)
        }));

        return { smStats, slStats, hmStats };
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  };

  const fetchGameProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const gameProgress = await getGameProgress({ userId: user.uid });

      setUserStats(prev => ({
        ...prev,
        totalGameLevels: gameProgress.totalCompletedLevels,
        totalGameXP: gameProgress.totalXP,
        gameStats: gameProgress.gameStats
      }));

      return gameProgress;
    } catch (error) {
      console.error('Error fetching game progress:', error);
      return null;
    }
  };

  const fetchResourceBadges = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return [];
      const badges = await listBadges(user.uid).catch(() => []);
      setResourceBadges(badges || []);
      return badges || [];
    } catch (e) {
      console.error('[Badges] Error loading resource badges:', e);
      setResourceBadges([]);
      return [];
    }
  };

  // Backfill: award first-time resource badges if user already has non-zero streaks
  const backfillResourceBadges = async (preloadedStats?: any, existingBadges: any[] = []) => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      let sm = preloadedStats?.smStats;
      let sl = preloadedStats?.slStats;
      let hm = preloadedStats?.hmStats;

      if (!sm || !sl || !hm) {
        // Fallback if stats weren't passed
        return [];
      }

      const newAwards: any[] = [];
      const ops: Promise<any>[] = [];

      const exerciseStreak = Number((sm as any)?.exerciseStreak || 0);
      const hydrationStreak = Number((sm as any)?.hydrationStreak || 0);
      const sleepStreak = Number((sl as any)?.sleepStreak || 0);
      const selfTalkStreak = Number((hm as any)?.selfTalkStreak || 0);
      const gratitudeStreak = Number((hm as any)?.gratitudeStreak || 0);
      const reframeStreak = Number((hm as any)?.reframeStreak || 0);

      // Helper to check if badge exists in our already-fetched list
      const hasBadgeLocal = (id: string) => existingBadges.some(b => b.id === id);

      if (exerciseStreak >= 1 && !hasBadgeLocal('exercise-first')) {
        const badge = { key: 'exercise-first', name: 'First Exercise', icon: 'zap', description: 'Logged your first exercise' };
        ops.push(awardResourceBadge(user.uid, badge));
        newAwards.push({ id: badge.key, ...badge });
      }
      if (hydrationStreak >= 1 && !hasBadgeLocal('hydration-starter')) {
        const badge = { key: 'hydration-starter', name: 'Hydration Starter', icon: 'droplets', description: 'Logged hydration today' };
        ops.push(awardResourceBadge(user.uid, badge));
        newAwards.push({ id: badge.key, ...badge });
      }
      if (sleepStreak >= 1 && !hasBadgeLocal('sleep-first')) {
        const badge = { key: 'sleep-first', name: 'First Sleep Log', icon: 'moon', description: 'Logged your first sleep' };
        ops.push(awardResourceBadge(user.uid, badge));
        newAwards.push({ id: badge.key, ...badge });
      }
      if (selfTalkStreak >= 1 && !hasBadgeLocal('selftalk-first')) {
        const badge = { key: 'selftalk-first', name: 'First Affirmation', icon: 'smile', description: 'Completed your first Positive Self-Talk' };
        ops.push(awardResourceBadge(user.uid, badge));
        newAwards.push({ id: badge.key, ...badge });
      }
      if (gratitudeStreak >= 1 && !hasBadgeLocal('gratitude-first')) {
        const badge = { key: 'gratitude-first', name: 'First Gratitude', icon: 'star', description: 'Logged your first Gratitude Practice' };
        ops.push(awardResourceBadge(user.uid, badge));
        newAwards.push({ id: badge.key, ...badge });
      }
      if (reframeStreak >= 1 && !hasBadgeLocal('reframing-first')) {
        const badge = { key: 'reframing-first', name: 'First Reframe', icon: 'refresh-cw', description: 'Completed Thought Reframing once' };
        ops.push(awardResourceBadge(user.uid, badge));
        newAwards.push({ id: badge.key, ...badge });
      }

      if (ops.length > 0) {
        await Promise.all(ops);
        console.log('[Badges] Backfilled', newAwards.length, 'resource badges');
      }

      return newAwards;
    } catch (err) {
      console.error('[Badges] Resource backfill failed:', err);
      return [];
    }
  };

  const checkAndAwardBadges = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Don't check if we haven't loaded achievements yet
    if (userAchievements.length === 0 && loading) return;

    const earnedBadgeIds = userAchievements.map(a => getCanonicalBadgeIdForAchievement(a));
    const newBadges = [];

    console.log('[Badges] Current earned badges:', earnedBadgeIds);
    console.log('[Badges] User stats:', userStats);

    // Check each badge requirement
    if (!earnedBadgeIds.includes("first_assessment") && userStats.assessments >= 1) {
      console.log('[Badges] Awarding First Steps badge');
      newBadges.push({
        achievementType: "first_assessment",
        achievementName: "First Steps",
        description: "Completed your first mental health assessment",
        badgeIcon: "🌟"
      });
    }

    if (!earnedBadgeIds.includes("mood_tracker_week") && userStats.moods >= 7) {
      console.log('[Badges] Awarding Mood Master badge');
      newBadges.push({
        achievementType: "mood_tracker_week",
        achievementName: "Mood Master",
        description: "Tracked your mood for 7 consecutive days",
        badgeIcon: "😊"
      });
    }

    // Journal badges
    if (!earnedBadgeIds.includes("first_journal") && userStats.journals >= 1) {
      console.log('[Badges] Awarding First Reflection badge');
      newBadges.push({
        achievementType: "first_journal",
        achievementName: "First Reflection",
        description: "Wrote your first journal entry",
        badgeIcon: "✍️"
      });
    }

    if (!earnedBadgeIds.includes("journal_writer") && userStats.journals >= 10) {
      console.log('[Badges] Awarding Thoughtful Writer badge');
      newBadges.push({
        achievementType: "journal_writer",
        achievementName: "Thoughtful Writer",
        description: "Written 10 journal entries",
        badgeIcon: "📝"
      });
    }

    if (!earnedBadgeIds.includes("journal_master") && userStats.journals >= 25) {
      console.log('[Badges] Awarding Journal Master badge');
      newBadges.push({
        achievementType: "journal_master",
        achievementName: "Journal Master",
        description: "Written 25 journal entries",
        badgeIcon: "📚"
      });
    }

    // NEW: Check for Goal Getter badge
    if (!earnedBadgeIds.includes("goal_achiever") && userStats.completedGoals >= 1) {
      console.log('[Badges] Awarding Goal Getter badge');
      newBadges.push({
        achievementType: "goal_achiever",
        achievementName: "Goal Getter",
        description: "Completed your first wellness goal",
        badgeIcon: "🎯"
      });
    }

    // Resource badges (achievements-style awarding)
    // Exercise
    if (!earnedBadgeIds.includes('exercise-first') && (userStats.exerciseStreak || 0) >= 1) {
      newBadges.push({
        achievementType: 'exercise-first',
        achievementName: 'First Exercise',
        description: 'Logged your first exercise',
        badgeIcon: '⚡'
      });
    }
    if (!earnedBadgeIds.includes('active-achiever') && (userStats.exerciseStreak || 0) >= 7) {
      newBadges.push({
        achievementType: 'active-achiever',
        achievementName: 'Active Achiever',
        description: '7-day exercise streak',
        badgeIcon: '⚡'
      });
    }
    // Hydration
    if (!earnedBadgeIds.includes('hydration-starter') && (userStats.hydrationStreak || 0) >= 1) {
      newBadges.push({
        achievementType: 'hydration-starter',
        achievementName: 'Hydration Starter',
        description: 'Logged hydration today',
        badgeIcon: '💧'
      });
    }
    if (!earnedBadgeIds.includes('hydration-hero') && (userStats.hydrationStreak || 0) >= 7) {
      newBadges.push({
        achievementType: 'hydration-hero',
        achievementName: 'Hydration Hero',
        description: '7-day hydration streak',
        badgeIcon: '💧'
      });
    }
    // Sleep
    if (!earnedBadgeIds.includes('sleep-first') && (userStats.sleepStreak || 0) >= 1) {
      newBadges.push({
        achievementType: 'sleep-first',
        achievementName: 'First Sleep Log',
        description: 'Logged your first sleep',
        badgeIcon: '🌙'
      });
    }
    if (!earnedBadgeIds.includes('sleep-champion') && (userStats.sleepStreak || 0) >= 7) {
      newBadges.push({
        achievementType: 'sleep-champion',
        achievementName: 'Sleep Champion',
        description: '7-day sleep streak',
        badgeIcon: '🌙'
      });
    }
    // Self-talk
    if (!earnedBadgeIds.includes('selftalk-first') && (userStats.selfTalkStreak || 0) >= 1) {
      newBadges.push({
        achievementType: 'selftalk-first',
        achievementName: 'First Affirmation',
        description: 'Completed your first Positive Self-Talk',
        badgeIcon: '🙂'
      });
    }
    if (!earnedBadgeIds.includes('selftalk-streaker') && (userStats.selfTalkStreak || 0) >= 7) {
      newBadges.push({
        achievementType: 'selftalk-streaker',
        achievementName: 'Self-Talk Streaker',
        description: '7-day Positive Self-Talk streak',
        badgeIcon: '🙂'
      });
    }
    // Gratitude
    if (!earnedBadgeIds.includes('gratitude-first') && (userStats.gratitudeStreak || 0) >= 1) {
      newBadges.push({
        achievementType: 'gratitude-first',
        achievementName: 'First Gratitude',
        description: 'Logged your first Gratitude Practice',
        badgeIcon: '⭐'
      });
    }
    if (!earnedBadgeIds.includes('gratitude-guru') && (userStats.gratitudeStreak || 0) >= 7) {
      newBadges.push({
        achievementType: 'gratitude-guru',
        achievementName: 'Gratitude Guru',
        description: '7-day Gratitude Practice streak',
        badgeIcon: '⭐'
      });
    }
    // Reframing
    if (!earnedBadgeIds.includes('reframing-first') && (userStats.reframeStreak || 0) >= 1) {
      newBadges.push({
        achievementType: 'reframing-first',
        achievementName: 'First Reframe',
        description: 'Completed Thought Reframing once',
        badgeIcon: '🔄'
      });
    }
    if (!earnedBadgeIds.includes('reframing-pro') && (userStats.reframeStreak || 0) >= 7) {
      newBadges.push({
        achievementType: 'reframing-pro',
        achievementName: 'Reframing Pro',
        description: '7-day Thought Reframing streak',
        badgeIcon: '🔄'
      });
    }

    // Gaming Badges
    if (!earnedBadgeIds.includes('game_novice') && userStats.totalGameLevels >= 5) {
      newBadges.push({ achievementType: 'game_novice', achievementName: 'Brain Starter', description: 'Complete 5 levels across any games', badgeIcon: '🎮' });
    }
    if (!earnedBadgeIds.includes('game_intermediate') && userStats.totalGameLevels >= 15) {
      newBadges.push({ achievementType: 'game_intermediate', achievementName: 'Cognitive Climber', description: 'Complete 15 levels across any games', badgeIcon: '⚡' });
    }
    if (!earnedBadgeIds.includes('game_master') && userStats.totalGameLevels >= 30) {
      newBadges.push({ achievementType: 'game_master', achievementName: 'Neuro-Navigator', description: 'Complete 30 levels across any games', badgeIcon: '🏆' });
    }
    if (!earnedBadgeIds.includes('xp_aspirant') && userStats.totalGameXP >= 500) {
      newBadges.push({ achievementType: 'xp_aspirant', achievementName: 'XP Aspirant', description: 'Earn 500 Total XP in cognitive tasks', badgeIcon: '✨' });
    }

    // Game Specific
    if (!earnedBadgeIds.includes('bloxorz_explorer') && (userStats.gameStats?.bloxorz?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'bloxorz_explorer', achievementName: '3D Explorer', description: 'Reach level 5 in Bloxorz', badgeIcon: '📦' });
    }
    if (!earnedBadgeIds.includes('bloxorz_master') && (userStats.gameStats?.bloxorz?.maxLevel || 0) >= 20) {
      newBadges.push({ achievementType: 'bloxorz_master', achievementName: 'Cube Master', description: 'Reach level 20 in Bloxorz', badgeIcon: '🧩' });
    }
    if (!earnedBadgeIds.includes('digit_span_pro') && (userStats.gameStats?.digitSpan?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'digit_span_pro', achievementName: 'Memory Pro', description: 'Reach level 5 in Digit Span', badgeIcon: '🧠' });
    }
    if (!earnedBadgeIds.includes('story_builder_pro') && (userStats.gameStats?.sequenceStory?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'story_builder_pro', achievementName: 'Logic Architect', description: 'Reach level 5 in Sequence Story', badgeIcon: '📚' });
    }
    if (!earnedBadgeIds.includes('pattern_memory_pro') && (userStats.gameStats?.patternMemory?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'pattern_memory_pro', achievementName: 'Pattern Pro', description: 'Reach level 5 in Pattern Match', badgeIcon: '🧩' });
    }
    if (!earnedBadgeIds.includes('word_memory_pro') && (userStats.gameStats?.wordMemory?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'word_memory_pro', achievementName: 'Lexicon Master', description: 'Reach level 5 in Word Memory', badgeIcon: '📖' });
    }
    if (!earnedBadgeIds.includes('logic_puzzle_pro') && (userStats.gameStats?.logicPuzzle?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'logic_puzzle_pro', achievementName: 'Riddle Solver', description: 'Reach level 5 in Logic Puzzles', badgeIcon: '💡' });
    }
    if (!earnedBadgeIds.includes('spatial_puzzle_pro') && (userStats.gameStats?.spatialPuzzle?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'spatial_puzzle_pro', achievementName: 'Shape Shifter', description: 'Reach level 5 in Shape Puzzle', badgeIcon: '🧊' });
    }
    if (!earnedBadgeIds.includes('strategy_planner_pro') && (userStats.gameStats?.strategyPlanner?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'strategy_planner_pro', achievementName: 'Master Strategist', description: 'Reach level 5 in Planning Master', badgeIcon: '🎯' });
    }
    if (!earnedBadgeIds.includes('emotion_expert') && (userStats.gameStats?.emotionRecognition?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'emotion_expert', achievementName: 'Emotion Expert', description: 'Reach level 5 in Guess the Feeling', badgeIcon: '🎭' });
    }
    if (!earnedBadgeIds.includes('social_star') && (userStats.gameStats?.empathyRoleplay?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'social_star', achievementName: 'Social Star', description: 'Reach level 5 in Empathy Challenge', badgeIcon: '🤝' });
    }
    if (!earnedBadgeIds.includes('focus_titan') && (userStats.gameStats?.focusMarathon?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'focus_titan', achievementName: 'Focus Titan', description: 'Reach level 5 in Focus Challenge', badgeIcon: '⚡' });
    }
    if (!earnedBadgeIds.includes('stroop_pro') && (userStats.gameStats?.stroop?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'stroop_pro', achievementName: 'Color Master', description: 'Reach level 5 in Color Match', badgeIcon: '🎨' });
    }
    if (!earnedBadgeIds.includes('reaction_pro') && (userStats.gameStats?.reactionTime?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'reaction_pro', achievementName: 'Quick Reflex', description: 'Reach level 5 in Reaction Master', badgeIcon: '🛑' });
    }
    if (!earnedBadgeIds.includes('breathing_pro') && (userStats.gameStats?.bubbleBreathing?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'breathing_pro', achievementName: 'Calm Master', description: 'Reach level 5 in Calm Breather', badgeIcon: '🫧' });
    }
    if (!earnedBadgeIds.includes('mood_pro') && (userStats.gameStats?.moodTracker?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'mood_pro', achievementName: 'Self-Aware', description: 'Complete 5 entries in Mood Diary', badgeIcon: '📔' });
    }
    if (!earnedBadgeIds.includes('attention_pro') && (userStats.gameStats?.sustainedAttention?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'attention_pro', achievementName: 'Attention Hero', description: 'Reach level 5 in Sustained Attention', badgeIcon: '🎯' });
    }
    if (!earnedBadgeIds.includes('nback_pro') && (userStats.gameStats?.dualNback?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'nback_pro', achievementName: 'Dual Master', description: 'Reach level 5 in Dual N-Back', badgeIcon: '🧠' });
    }
    if (!earnedBadgeIds.includes('switching_pro') && (userStats.gameStats?.taskSwitching?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'switching_pro', achievementName: 'Switch Master', description: 'Reach level 5 in Task Switching', badgeIcon: '🔄' });
    }
    if (!earnedBadgeIds.includes('tower_pro') && (userStats.gameStats?.planningTower?.maxLevel || 0) >= 5) {
      newBadges.push({ achievementType: 'tower_pro', achievementName: 'Tower Planner', description: 'Reach level 5 in Planning Tower', badgeIcon: '🗼' });
    }

    // Award new badges
    if (newBadges.length > 0) {
      console.log('[Badges] Awarding', newBadges.length, 'new badges');
      try {
        await Promise.all(newBadges.map(badge =>
          saveAchievement({
            userId: user.uid,
            achievementName: badge.achievementName,
            achievementType: badge.achievementType,
            description: badge.description,
            badgeIcon: badge.badgeIcon
          })
        ));
        // Refresh achievements after awarding
        await fetchAchievements();
      } catch (error) {
        console.error('[Badges] Error awarding badges:', error);
      }
    } else {
      console.log('[Badges] No new badges to award');
    }
  };

  useEffect(() => {
    if (userStats && Object.keys(userStats).length > 0 && !loading) {
      checkAndAwardBadges();
    }
  }, [userStats, userAchievements, loading]);

  const getProgressForBadge = (badge: any) => {
    switch (badge.id) {
      case "first_assessment":
        return Math.min((userStats.assessments / 1) * 100, 100);
      case "mood_tracker_week":
        return Math.min((userStats.moods / 7) * 100, 100);
      case "journal_writer":
        return Math.min((userStats.journals / 10) * 100, 100);
      case "goal_achiever":
        return Math.min(((userStats.completedGoals || 0) / 1) * 100, 100);
      // Resource badges progress
      case 'exercise-first':
        return Math.min(((userStats.exerciseStreak || 0) >= 1 ? 100 : 0), 100);
      case 'active-achiever':
        return Math.min(((userStats.exerciseStreak || 0) / 7) * 100, 100);
      case 'hydration-starter':
        return Math.min(((userStats.hydrationStreak || 0) >= 1 ? 100 : 0), 100);
      case 'hydration-hero':
        return Math.min(((userStats.hydrationStreak || 0) / 7) * 100, 100);
      case 'sleep-first':
        return Math.min(((userStats.sleepStreak || 0) >= 1 ? 100 : 0), 100);
      case 'sleep-champion':
        return Math.min(((userStats.sleepStreak || 0) / 7) * 100, 100);
      case 'selftalk-first':
        return Math.min(((userStats.selfTalkStreak || 0) >= 1 ? 100 : 0), 100);
      case 'selftalk-streaker':
        return Math.min(((userStats.selfTalkStreak || 0) / 7) * 100, 100);
      case 'gratitude-first':
        return Math.min(((userStats.gratitudeStreak || 0) >= 1 ? 100 : 0), 100);
      case 'gratitude-guru':
        return Math.min(((userStats.gratitudeStreak || 0) / 7) * 100, 100);
      case 'reframing-first':
        return Math.min(((userStats.reframeStreak || 0) >= 1 ? 100 : 0), 100);
      case 'reframing-pro':
        return Math.min(((userStats.reframeStreak || 0) / 7) * 100, 100);

      // Game progress
      case 'game_novice':
        return Math.min(((userStats.totalGameLevels || 0) / 5) * 100, 100);
      case 'game_intermediate':
        return Math.min(((userStats.totalGameLevels || 0) / 15) * 100, 100);
      case 'game_master':
        return Math.min(((userStats.totalGameLevels || 0) / 30) * 100, 100);
      case 'xp_aspirant':
        return Math.min(((userStats.totalGameXP || 0) / 500) * 100, 100);
      case 'bloxorz_explorer':
        return Math.min(((userStats.gameStats?.bloxorz?.maxLevel || 0) / 5) * 100, 100);
      case 'bloxorz_master':
        return Math.min(((userStats.gameStats?.bloxorz?.maxLevel || 0) / 20) * 100, 100);
      case 'digit_span_pro':
        return Math.min(((userStats.gameStats?.digitSpan?.maxLevel || 0) / 5) * 100, 100);
      case 'story_builder_pro':
        return Math.min(((userStats.gameStats?.sequenceStory?.maxLevel || 0) / 5) * 100, 100);
      case 'pattern_memory_pro':
        return Math.min(((userStats.gameStats?.patternMemory?.maxLevel || 0) / 5) * 100, 100);
      case 'word_memory_pro':
        return Math.min(((userStats.gameStats?.wordMemory?.maxLevel || 0) / 5) * 100, 100);
      case 'logic_puzzle_pro':
        return Math.min(((userStats.gameStats?.logicPuzzle?.maxLevel || 0) / 5) * 100, 100);
      case 'spatial_puzzle_pro':
        return Math.min(((userStats.gameStats?.spatialPuzzle?.maxLevel || 0) / 5) * 100, 100);
      case 'strategy_planner_pro':
        return Math.min(((userStats.gameStats?.strategyPlanner?.maxLevel || 0) / 5) * 100, 100);
      case 'emotion_expert':
        return Math.min(((userStats.gameStats?.emotionRecognition?.maxLevel || 0) / 5) * 100, 100);
      case 'social_star':
        return Math.min(((userStats.gameStats?.empathyRoleplay?.maxLevel || 0) / 5) * 100, 100);
      case 'focus_titan':
        return Math.min(((userStats.gameStats?.focusMarathon?.maxLevel || 0) / 5) * 100, 100);
      case 'stroop_pro':
        return Math.min(((userStats.gameStats?.stroop?.maxLevel || 0) / 5) * 100, 100);
      case 'reaction_pro':
        return Math.min(((userStats.gameStats?.reactionTime?.maxLevel || 0) / 5) * 100, 100);
      case 'breathing_pro':
        return Math.min(((userStats.gameStats?.bubbleBreathing?.maxLevel || 0) / 5) * 100, 100);
      case 'mood_pro':
        return Math.min(((userStats.gameStats?.moodTracker?.maxLevel || 0) / 5) * 100, 100);
      case 'attention_pro':
        return Math.min(((userStats.gameStats?.sustainedAttention?.maxLevel || 0) / 5) * 100, 100);
      case 'nback_pro':
        return Math.min(((userStats.gameStats?.dualNback?.maxLevel || 0) / 5) * 100, 100);
      case 'switching_pro':
        return Math.min(((userStats.gameStats?.taskSwitching?.maxLevel || 0) / 5) * 100, 100);
      case 'tower_pro':
        return Math.min(((userStats.gameStats?.planningTower?.maxLevel || 0) / 5) * 100, 100);
      default:
        return 0;
    }
  };

  const isBadgeEarned = (badgeId: string) => {
    const earnedByAchievements = userAchievements.some(a => getCanonicalBadgeIdForAchievement(a) === badgeId);
    const earnedByResourceBadges = resourceBadges.some((b: any) => b.id === badgeId);
    return earnedByAchievements || earnedByResourceBadges;
  };

  // Check for new badges whenever stats change
  useEffect(() => {
    if (!loading && userStats && userAchievements) {
      checkAndAwardBadges();
    }
  }, [userStats, loading, userAchievements]);

  if (loading) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Achievement Summary */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 [&:hover]:shadow-none [&:hover]:scale-100 transition-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Achievement Dashboard
            </CardTitle>
            <CardDescription className="text-yellow-800">
              Track your wellness journey milestones and earn badges for your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="text-2xl font-bold text-yellow-700">{userAchievements.length}</div>
                </div>
                <div className="text-sm text-yellow-600">Badges Earned</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="text-2xl font-bold text-yellow-700">{userStats?.assessments || 0}</div>
                </div>
                <div className="text-sm text-yellow-600">Assessments</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="text-2xl font-bold text-yellow-700">{userStats?.moods || 0}</div>
                </div>
                <div className="text-sm text-yellow-600">Mood Entries</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="text-2xl font-bold text-yellow-700">{userStats?.journals || 0}</div>
                </div>
                <div className="text-sm text-yellow-600">Journal Entries</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="text-2xl font-bold text-yellow-700">{userStats?.totalGameLevels || 0}</div>
                </div>
                <div className="text-sm text-yellow-600">Game Levels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earned Badges (includes resource badges) */}
      <motion.div variants={itemVariants}>
        <Card className="[&:hover]:shadow-none [&:hover]:scale-100 transition-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Your Earned Badges
            </CardTitle>
            <CardDescription>
              Congratulations on your achievements!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {([...userAchievements, ...resourceBadges.map((b: any) => ({
              id: b.id,
              achievement_type: b.id,
              achievement_name: b.name || b.id,
              description: b.description,
              badge_icon: b.icon
            }))]).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...userAchievements, ...resourceBadges.map((b: any) => ({
                  id: b.id,
                  achievement_type: b.id,
                  achievement_name: b.name || b.id,
                  description: b.description,
                  badge_icon: b.icon
                }))].map((achievement) => {
                  const badge = allAvailableBadges.find(b => b.id === achievement.achievement_type);
                  return (
                    <div key={achievement.id} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          {React.isValidElement(badge?.icon) ? badge.icon : <span className="text-3xl">{badge?.icon || "🏆"}</span>}
                        </div>
                        <h3 className="font-semibold text-green-900">{achievement.achievement_name}</h3>
                        <p className="text-sm text-green-700 mt-1">{achievement.description}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Earned
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No badges earned yet.</p>
                <p className="text-sm text-gray-400">Keep engaging with the platform to earn your first badge!</p>
              </div>
            )
            }
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Badges */}
      <motion.div variants={itemVariants}>
        <Card className="[&:hover]:shadow-none [&:hover]:scale-100 transition-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Available Badges
            </CardTitle>
            <CardDescription>
              Work towards these achievements to unlock more badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[480px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAvailableBadges.map((badge) => {
                  const earned = isBadgeEarned(badge.id);
                  const progress = getProgressForBadge(badge);

                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg border ${earned
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex items-center justify-center ${earned ? '' : 'grayscale opacity-50'}`}>
                          {React.isValidElement(badge.icon) ? badge.icon : <span className="text-3xl">{badge.icon}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${earned ? 'text-green-900' : 'text-gray-700'}`}>
                              {badge.name}
                            </h3>
                            {earned && <Badge variant="secondary">Earned</Badge>}
                          </div>
                          <p className={`text-sm ${earned ? 'text-green-700' : 'text-gray-600'} mb-2`}>
                            {badge.description}
                          </p>
                          <button
                            onClick={() => handleCategoryClick(badge.category)}
                            className="transition-colors hover:text-primary"
                          >
                            <Badge
                              variant="outline"
                              className="text-xs mb-3 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              {badge.category}
                            </Badge>
                          </button>
                          {!earned && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{badge.requirement}</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AchievementBadges;
