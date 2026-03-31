import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Target,
  BookOpen,
  Award,
  Sparkles,
  Wind,
  Moon,
  Sun,
  Smile,
  Zap,
  Lock,
  ChevronRight,
  Play,
  Star,
  Sprout,
  Crown,
  Trophy,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/integrations/firebase";
import { getMoodEntries, getWellnessGoals, getAchievements } from "@/services/wellnessService";

// --- Constants & Helpers ---

const badgeCatalog = [
  { id: "first_assessment", name: "First Steps", iconName: "Sprout", description: "Completed first check-in", color: "text-emerald-500" },
  { id: "mood_tracker_week", name: "Mood Master", iconName: "Crown", description: "Tracked mood for a week", color: "text-amber-500" },
  { id: "goal_achiever", name: "Goal Getter", iconName: "Trophy", description: "Completed a goal", color: "text-blue-500" },
  { id: "journal_writer", name: "Thoughtful", iconName: "BookOpen", description: "Wrote a journal entry", color: "text-violet-500" },
  { id: "wellness_warrior", name: "Warrior", iconName: "Shield", description: "Consistent wellness streak", color: "text-rose-500" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getCanonicalBadgeIdForAchievement = (achievement: any) => {
  if (!achievement) return "";
  const type = achievement.achievement_type;
  const name = achievement.achievement_name;
  let matchedBadge = badgeCatalog.find(badge => badge.id === type);
  if (matchedBadge) return matchedBadge.id;
  matchedBadge = badgeCatalog.find(badge => badge.name === name);
  if (matchedBadge) return matchedBadge.id;
  return type || name || achievement.id;
};

interface PersonalizedDashboardProps {
  onNavigateToGoals?: () => void;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ onNavigateToGoals }) => {
  const [user, setUser] = useState<any>(null);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [openInfoBox, setOpenInfoBox] = useState<number | null>(null);

  // Helper to get user's name
  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name.split(" ")[0]; // First name only
    if (user?.demographics?.name) return user.demographics.name.split(" ")[0];
    return "Friend";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        setUser(currentUser);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Parallel fetching for speed
        const [moods, goals, achievementsData] = await Promise.all([
          getMoodEntries({ userId: currentUser.uid }).catch(() => []),
          getWellnessGoals({ userId: currentUser.uid, activeOnly: true }).catch(() => []),
          getAchievements({ userId: currentUser.uid }).catch(() => [])
        ]);

        setRecentMoods(moods.slice(0, 7));
        setActiveGoals(goals.slice(0, 3));

        const earnedIds = new Set<string>();
        achievementsData.forEach((achievement: any) => {
          earnedIds.add(getCanonicalBadgeIdForAchievement(achievement));
        });
        setEarnedBadgeIds(earnedIds);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const averageMoodScore =
    recentMoods.length > 0
      ? recentMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / recentMoods.length
      : 0;

  const personalizedContent = [
    {
      title: "Exam Stress?",
      icon: BookOpen,
      description: "3 simple tricks to focus better.",
      benefit: "Focus Helper",
      type: "article",
      color: "bg-blue-50 text-blue-700 border-blue-100",
      iconColor: "text-blue-500",
      action: "Read"
    },
    {
      title: "Quick Calm",
      icon: Wind,
      description: "Breathe in... Breathe out...",
      benefit: "Quick Calm",
      type: "exercise",
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      iconColor: "text-emerald-500",
      action: "Start"
    },
    {
      title: "Sleep Better",
      icon: Moon,
      description: "Why sleep is your superpower.",
      benefit: "Energy Boost",
      type: "guide",
      color: "bg-violet-50 text-violet-700 border-violet-100",
      iconColor: "text-violet-500",
      action: "Learn"
    },
  ];

  // Animation variants
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

  if (!user && !loading) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12 font-sans text-slate-800 max-w-6xl mx-auto"
    >

      {/* 1. Welcome Banner - Flat Pastel, Friendly */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2rem] bg-indigo-50/80 p-6 border border-indigo-100/50"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1 flex items-center gap-2 tracking-tight">
              {getGreeting()}, {getUserName()} <span className="text-2xl animate-wave"></span>
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-lg">
              Ready to have a great day?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-indigo-900/70 border border-indigo-100 shadow-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
        {/* Subtle decorative element */}
        <div className="absolute -bottom-6 -right-6 text-9xl opacity-5 pointer-events-none select-none">
          🌟
        </div>
      </motion.div>

      {/* 2. Stats Grid - Hierarchy & Warmth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mood - Featured/Highlighted */}
        <motion.div variants={itemVariants}>
          <Card className="border-none bg-rose-100/50 hover:bg-rose-100/60 transition-colors duration-300 rounded-[2rem] group cursor-default shadow-sm ring-1 ring-rose-100 h-full">
            <CardContent className="p-5 flex flex-col items-center text-center h-full justify-center py-6">
              <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-rose-500 group-hover:scale-110 transition-transform">
                <Smile size={24} strokeWidth={2.5} fill="currentColor" className="opacity-20 absolute" />
                <Smile size={24} strokeWidth={2.5} />
              </div>
              {loading ? (
                <Skeleton className="h-9 w-12 mb-1 bg-rose-200/50" />
              ) : (
                <p className="text-3xl font-black text-slate-800 mb-0.5">{averageMoodScore.toFixed(1)}</p>
              )}
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Mood Score</p>
              <p className="text-[10px] text-slate-500 font-bold  px-2 py-0.5 rounded-full">Avg this week</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak/Activity - Secondary Priority */}
        <motion.div variants={itemVariants}>
          <Card className="border-none bg-emerald-100/50 hover:bg-emerald-50 transition-colors duration-300 rounded-[2rem] group cursor-default h-full">
            <CardContent className="p-5 flex flex-col items-center text-center h-full justify-center py-6">
              <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-emerald-500 group-hover:scale-110 transition-transform">
                <Zap size={20} strokeWidth={2.5} fill="currentColor" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-10 mb-1 bg-emerald-200/50" />
              ) : (
                <p className="text-2xl font-black text-slate-800 mb-0.5">{recentMoods.length}</p>
              )}
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Streak</p>
              <p className="text-[10px] text-slate-400 font-bold">Days active</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals */}
        <motion.div variants={itemVariants}>
          <Card
            onClick={onNavigateToGoals}
            className="border-none bg-sky-100/50 hover:bg-sky-50 transition-colors duration-300 rounded-[2rem] group cursor-pointer active:scale-95 h-full"
          >
            <CardContent className="p-5 flex flex-col items-center text-center h-full justify-center py-6">
              <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-sky-500 group-hover:scale-110 transition-transform">
                <Target size={20} strokeWidth={2.5} fill="currentColor" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-10 mb-1 bg-sky-200/50" />
              ) : (
                <p className="text-2xl font-black text-slate-800 mb-0.5">{activeGoals.length}</p>
              )}
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Goals</p>
              <p className="text-[10px] text-slate-400 font-bold">Active now</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div variants={itemVariants}>
          <Card className="border-none bg-amber-100/50 hover:bg-amber-50 transition-colors duration-300 rounded-[2rem] group cursor-default h-full">
            <CardContent className="p-5 flex flex-col items-center text-center h-full justify-center py-6">
              <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-amber-500 group-hover:scale-110 transition-transform">
                <Award size={20} strokeWidth={2.5} fill="currentColor" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-10 mb-1 bg-amber-200/50" />
              ) : (
                <p className="text-2xl font-black text-slate-800 mb-0.5">{earnedBadgeIds.size}</p>
              )}
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Badges</p>
              <p className="text-[10px] text-slate-400 font-bold">Collected</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 3. Daily Boost - Rounder, Softer, Friendlier */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500 fill-current" /> Daily Boost
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personalizedContent.map((content, index) => (
            <div
              key={index}
              onClick={() => setOpenInfoBox(index)}
              className={`relative group rounded-[2rem] p-5 border transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col h-full ${content.color} bg-opacity-30 hover:bg-opacity-50 border-opacity-40`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-2xl bg-white shadow-sm ${content.iconColor}`}>
                  <content.icon size={20} fill="currentColor" className="opacity-20 absolute" />
                  <content.icon size={20} strokeWidth={2.5} />
                </div>
                <Badge variant="secondary" className="bg-white/70 backdrop-blur-sm text-slate-600 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 h-6">
                  {content.benefit}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                {content.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed flex-grow">
                {content.description}
              </p>

              <div className="flex items-center text-xs font-bold mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-1 group-hover:gap-2 transition-all">
                  {content.action} <ChevronRight size={14} />
                </span>
              </div>

              {/* Info Modal Overlay */}
              {openInfoBox === index && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenInfoBox(null); }}>
                  <div
                    className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                      onClick={() => setOpenInfoBox(null)}
                    >
                      ✕
                    </button>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${content.color} bg-opacity-100`}>
                      <content.icon className={`w-7 h-7 ${content.iconColor}`} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{content.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed mb-8">{content.description}</p>
                    <Button onClick={() => setOpenInfoBox(null)} className="w-full h-12 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800">
                      Got it!
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 4. Achievements Grid - Expressive & Fun */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Award className="h-5 w-5 text-amber-600" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Trophy Case</h2>
            <p className="text-slate-400 text-xs font-medium">Collect them all!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badgeCatalog.map((badge) => {
            const isUnlocked = earnedBadgeIds.has(badge.id);
            const IconComponent = {
              'Sprout': Sprout,
              'Crown': Crown,
              'Trophy': Trophy,
              'BookOpen': BookOpen,
              'Shield': Shield
            }[badge.iconName] || Trophy;

            return (
              <div
                key={badge.id}
                className={`group relative flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 ${isUnlocked
                  ? "bg-white border-2 border-slate-200/60 hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
                  : "bg-slate-50 border-2 border-slate-100/50 opacity-50"
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 ${isUnlocked
                  ? `bg-${badge.color.split('-')[1]}-100/50 ${badge.color}`
                  : 'bg-slate-100 text-slate-300'
                  }`}>
                  <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h4 className={`text-xs font-bold mb-0.5 ${isUnlocked ? "text-slate-700" : "text-slate-400"}`}>
                  {badge.name}
                </h4>
                <p className="text-[10px] text-slate-400 leading-tight">{badge.description}</p>
                {!isUnlocked && <Lock className="w-3 h-3 text-slate-300 absolute top-3 right-3" strokeWidth={1.5} />}
                {isUnlocked && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

    </motion.div>
  );
}

export default PersonalizedDashboard;
