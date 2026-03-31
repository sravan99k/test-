import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Smile,
  TrendingUp,
  Calendar,
  Sparkles,
  Star
} from "lucide-react";
import { auth } from "@/integrations/firebase";
import { useToast } from "@/hooks/use-toast";
import { saveMoodEntry, getMoodEntries } from "@/services/wellnessService";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState("");
  const { filterProfanity } = useProfanityFilter();
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [sevenDayAverage, setSevenDayAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const { toast } = useToast();
  const { recordActivity, hasCheckedInToday } = useActivityTracking();

  // Dynamic placeholder texts that rotate
  const placeholderTexts = [
    "What made you smile today? 😊",
    "Name one person who made a difference today",
    "What's one thing you learned?",
    "Describe your day in 3 words",
    "What would make tomorrow better?",
    "Share a win, big or small 🌟",
    "What are you looking forward to?",
    "How did you show up for yourself today?",
    "What challenged you today?",
    "Name something you're grateful for",
    "What's weighing on your mind?",
    "What made today unique?",
    "How would you like to feel tomorrow?",
    "Share a moment that mattered",
    "What did you do for fun today? 🎮"
  ];

  const [currentPlaceholder] = useState(() =>
    placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)]
  );

  const moodOptions = [
    { score: 1, label: "Terrible", emoji: "😭", bgColor: "bg-red-50/80", lightBg: "bg-red-50/90", borderColor: "border-red-200", hoverBorderColor: "hover:border-red-300", textColor: "text-red-600" },
    { score: 2, label: "Bad", emoji: "😩", bgColor: "bg-orange-50/80", lightBg: "bg-orange-50/90", borderColor: "border-orange-200", hoverBorderColor: "hover:border-orange-300", textColor: "text-orange-600" },
    { score: 3, label: "Meh", emoji: "😕", bgColor: "bg-amber-50/80", lightBg: "bg-amber-50/90", borderColor: "border-amber-200", hoverBorderColor: "hover:border-amber-300", textColor: "text-amber-600" },
    { score: 4, label: "Okay", emoji: "🙂", bgColor: "bg-yellow-50/80", lightBg: "bg-yellow-50/90", borderColor: "border-yellow-200", hoverBorderColor: "hover:border-yellow-300", textColor: "text-yellow-600" },
    { score: 5, label: "Good", emoji: "😊", bgColor: "bg-lime-50/80", lightBg: "bg-lime-50/90", borderColor: "border-lime-200", hoverBorderColor: "hover:border-lime-300", textColor: "text-lime-600" },
    { score: 6, label: "Great", emoji: "😃", bgColor: "bg-green-50/80", lightBg: "bg-green-50/90", borderColor: "border-green-200", hoverBorderColor: "hover:border-green-300", textColor: "text-green-600" },
    { score: 7, label: "Super", emoji: "😁", bgColor: "bg-teal-50/80", lightBg: "bg-teal-50/90", borderColor: "border-teal-200", hoverBorderColor: "hover:border-teal-300", textColor: "text-teal-600" },
    { score: 8, label: "Amazing", emoji: "🥰", bgColor: "bg-cyan-50/80", lightBg: "bg-cyan-50/90", borderColor: "border-cyan-200", hoverBorderColor: "hover:border-cyan-300", textColor: "text-cyan-600" },
    { score: 9, label: "Awesome", emoji: "😎", bgColor: "bg-blue-50/80", lightBg: "bg-blue-50/90", borderColor: "border-blue-200", hoverBorderColor: "hover:border-blue-300", textColor: "text-blue-600" },
    { score: 10, label: "Perfect", emoji: "🤩", bgColor: "bg-purple-50/80", lightBg: "bg-purple-50/90", borderColor: "border-purple-200", hoverBorderColor: "hover:border-purple-300", textColor: "text-purple-600" },
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  // Check if mood already logged today
  useEffect(() => {
    const checkTodayMood = () => {
      const user = auth.currentUser;
      if (!user) return;

      const lastMoodCheck = localStorage.getItem(`lastMoodCheck_${user.uid}`);
      if (lastMoodCheck) {
        const lastCheckDate = new Date(lastMoodCheck);
        const today = new Date();
        
        // If last check was today, disable mood selection
        if (lastCheckDate.toDateString() === today.toDateString()) {
          setHasLoggedToday(true);
        }
      }
    };

    checkTodayMood();
  }, [moodHistory]); // Re-check when mood history updates

  const fetchMoodHistory = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const data = await getMoodEntries({ userId: user.uid });
        setMoodHistory(data);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const getTimeOfDay = (timestamp: string) => {
    const hour = new Date(timestamp).getHours();
    if (hour < 12) return { icon: "🌅", label: "Morning" };
    if (hour < 17) return { icon: "☀️", label: "Afternoon" };
    return { icon: "🌙", label: "Evening" };
  };

  const getMoodColor = (score: number) => {
    if (score >= 7) return "#10b981"; // green
    if (score >= 4) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const getChartAnnotations = () => {
    if (moodHistory.length < 7) return null;

    const lastWeek = moodHistory.slice(0, 7);
    const avgLastWeek = lastWeek.reduce((sum, entry) => sum + entry.mood_score, 0) / lastWeek.length;

    const previousWeek = moodHistory.slice(7, 14);
    if (previousWeek.length === 0) return null;

    const avgPreviousWeek = previousWeek.reduce((sum, entry) => sum + entry.mood_score, 0) / previousWeek.length;

    if (avgLastWeek >= 8) return { text: "🌟 Best week!", color: "#10b981" };
    if (avgLastWeek > avgPreviousWeek + 1) return { text: "📈 Steady improvement!", color: "#10b981" };
    if (avgLastWeek < avgPreviousWeek - 1) return { text: "💙 Let's check in", color: "#3b82f6" };
    return null;
  };

  const saveMoodEntryHandler = async () => {
    if (!selectedMood) {
      toast({
        title: "Pick your vibe first! 🎯",
        description: "How are you really feeling today?",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSaveSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to track your mood",
          variant: "destructive"
        });
        return;
      }

      const moodData = moodOptions.find(m => m.score === selectedMood);

      await saveMoodEntry({
        userId: user.uid,
        moodScore: selectedMood,
        moodLabel: moodData?.label || "",
        notes: moodNotes
      });

      await recordActivity('mood_tracking', `Tracked mood: ${moodData?.label}`);

      setLoading(false);
      setSaveSuccess(true);

      // Show success state for 1.5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        toast({
          title: "✨ Nice! Your mood is tracked",
          description: "You're building a great habit!"
        });
        
        // Store today's check in localStorage
        const user = auth.currentUser;
        if (user) {
          const today = new Date().toISOString();
          localStorage.setItem(`lastMoodCheck_${user.uid}`, today);
          setHasLoggedToday(true);
        }
        
        setSelectedMood(null);
        setMoodNotes("");
        fetchMoodHistory();
      }, 1500);

    } catch (error) {
      console.error("Error saving mood:", error);
      setLoading(false);
      setSaveSuccess(false);
      toast({
        title: "Oops!",
        description: "Couldn't save that. Try again?",
        variant: "destructive"
      });
    }
  };

  const chartData = moodHistory
    .slice(0, 14)
    .reverse()
    .map(entry => {
      return {
        day: new Date(entry.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        }),
        mood: entry.mood_score,
        label: entry.mood_label,
        notes: entry.notes,
        fullDate: new Date(entry.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })
      };
    });

  useEffect(() => {
    if (moodHistory.length === 0) {
      setSevenDayAverage(0);
      return;
    }

    const lastSevenEntries = moodHistory.slice(0, 7);
    const avg = lastSevenEntries.length > 0
      ? lastSevenEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / lastSevenEntries.length
      : 0;

    setSevenDayAverage(avg);
  }, [moodHistory]);

  const averageMood = sevenDayAverage !== null ? sevenDayAverage : 0;

  const getTrendDirection = () => {
    if (moodHistory.length < 2) return "neutral";

    const chartDataForTrend = moodHistory
      .slice(0, 14)
      .reverse();

    if (chartDataForTrend.length < 7) return "neutral";

    const firstHalf = chartDataForTrend.slice(0, Math.floor(chartDataForTrend.length / 2));
    const secondHalf = chartDataForTrend.slice(Math.floor(chartDataForTrend.length / 2));

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / secondHalf.length
      : firstHalfAvg;

    if (secondHalfAvg > firstHalfAvg + 0.5) return "up";
    if (secondHalfAvg < firstHalfAvg - 0.5) return "down";
    return "stable";
  };

  const getMoodContext = () => {
    if (averageMood >= 8) return { message: "You're crushing it! Keep that energy! 🔥", color: "text-blue-600" };
    if (averageMood >= 6) return { message: "You're doing great! Stay positive! 💪", color: "text-green-600" };
    if (averageMood >= 4) return { message: "Hanging in there. We see you! 👊", color: "text-yellow-600" };
    return { message: "Tough week? Let's talk about it. 💙", color: "text-orange-600" };
  };

  const getTrendContext = () => {
    const trend = getTrendDirection();
    if (trend === "up") return { message: "Things are looking up! 📈", color: "text-green-600" };
    if (trend === "down") return { message: "Let's check in together 💬", color: "text-orange-600" };
    return { message: "Staying steady 👍", color: "text-blue-600" };
  };

  const getNotesPlaceholder = () => {
    const placeholders = [
      "What made you feel this way today?",
      "Tell us what's on your mind...",
      "Any highlights from your day?",
      "What's one thing you're grateful for?",
      "How can we support you today?"
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  const [isNotesOpen, setIsNotesOpen] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      {/* Mood Selection Card */}
      <Card className={`border-2 ${hasLoggedToday ? 'opacity-50' : ''}`}>
        <CardContent className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {hasLoggedToday ? "Thanks for checking in today!" : "How are you feeling today?"}
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              {hasLoggedToday ? "Come back tomorrow to log your mood again" : "Tap the one that matches your vibe"}
            </p>
          </div>

          {/* Mood Options - 10 emojis with white circles and colored borders */}
          <div className={`grid grid-cols-5 gap-3 mb-8 md:flex md:flex-nowrap md:justify-center md:gap-4 max-w-6xl mx-auto ${hasLoggedToday ? 'pointer-events-none' : ''}`}>
            {moodOptions.map((mood) => {
              return (
                <button
                  key={mood.score}
                  onClick={() => !hasLoggedToday && setSelectedMood(mood.score)}
                  disabled={hasLoggedToday}
                  aria-label={`Select ${mood.label} mood`}
                  className={`flex flex-col items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-2xl p-2
                    ${selectedMood === mood.score ? 'scale-110' : hasLoggedToday ? '' : 'hover:scale-125'}
                    ${hasLoggedToday ? 'cursor-not-allowed grayscale' : ''}`}
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 border-4 text-3xl md:text-4xl relative
                      ${mood.bgColor} ${mood.borderColor} ${mood.hoverBorderColor} ${selectedMood === mood.score ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
                      ${hasLoggedToday ? 'opacity-50' : ''}`}
                  >
                    {selectedMood === mood.score && (
                      <div 
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: mood.borderColor.replace('border-', '#').substring(0, 7) }}
                      />
                    )}
                    <span role="img" aria-label={mood.label}>
                      {mood.emoji}
                    </span>
                  </div>
                  <span className={`text-xs md:text-sm font-semibold transition-colors
                    ${selectedMood === mood.score ? mood.textColor : hasLoggedToday ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Notes Input - Collapsible */}
          <div className={`mb-6 max-w-md mx-auto ${hasLoggedToday ? 'pointer-events-none opacity-50' : ''}`}>
            <button
              onClick={() => !hasLoggedToday && setIsNotesOpen(!isNotesOpen)}
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-full py-2 mb-2"
              disabled={hasLoggedToday}
            >
              <div className={`transform transition-transform duration-200 ${isNotesOpen ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {hasLoggedToday ? "Notes disabled for today" : (isNotesOpen ? "Hide Note" : "Add a note about your day (Optional)")}
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isNotesOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <Textarea
                placeholder={currentPlaceholder}
                value={moodNotes}
                onChange={(e) => {
                  const filteredText = filterProfanity(e.target.value);
                  setMoodNotes(filteredText);
                }}
                disabled={hasLoggedToday}
                aria-label="Add notes about your mood"
                className="min-h-[100px] text-base border-2 border-gray-200 focus:border-blue-400 rounded-xl resize-none mb-4"
              />
            </div>
          </div>

          {/* Save Button with Enhanced States - Now narrower */}
          <div className="max-w-md mx-auto">
            <Button
              onClick={saveMoodEntryHandler}
              disabled={!selectedMood || loading || saveSuccess || hasLoggedToday}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${saveSuccess ? 'scale-105' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : saveSuccess ? (
                <span className="flex items-center gap-2">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved! ✓
                </span>
              ) : hasLoggedToday ? (
                "Already logged today ✓"
              ) : (
                "Save My Mood"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-violet-50/30 border border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">
                  WEEKLY VIBE
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-extrabold text-slate-900">
                    {typeof averageMood === 'number' ? averageMood.toFixed(1) : '0.0'}
                  </p>
                  <span className="text-sm font-medium text-slate-500">/10</span>
                </div>
              </div>
              <div className="bg-violet-100/50 p-2.5 rounded-xl">
                <Smile className="h-6 w-6 text-violet-500" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs font-medium text-violet-600 mt-2">
              {getMoodContext().message.replace(/[🔥💪👊💙]/g, '').trim()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/30 border border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  TOTAL CHECK-INS
                </p>
                <p className="text-3xl font-extrabold text-slate-900">{moodHistory.length}</p>
              </div>
              <div className="bg-blue-100/50 p-2.5 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs font-medium text-blue-600 mt-2">
              {moodHistory.length >= 7 ? "Awesome streak!" : "Keep it going!"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/30 border border-slate-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  MOOD TREND
                </p>
                <p className="text-3xl font-extrabold text-slate-900 capitalize">
                  {getTrendDirection()}
                </p>
              </div>
              <div className="bg-emerald-100/50 p-2.5 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-500" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs font-medium text-emerald-600 mt-2">
              {getTrendContext().message.replace(/[📈💬👍]/g, '').trim()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Chart with Enhanced Interactivity */}
      {chartData.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg font-bold text-gray-900">
                  Mood Flow (Last 14 Days)
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoodBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    stroke="#e5e7eb"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    stroke="#e5e7eb"
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-xl">
                            <p className="font-bold text-gray-900 text-sm mb-1">{data.fullDate}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-600 text-sm">
                                {data.label} ({data.mood}/10)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorMoodBlue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reflections - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
          <h3 className="text-lg font-bold text-gray-900">Recent Reflections</h3>
        </div>

        {moodHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moodHistory.slice(0, 6).map((entry) => {
              const moodData = moodOptions.find(m => m.score === entry.mood_score);

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      ${moodData?.lightBg || 'bg-gray-100'}`}>
                      <span role="img" aria-label={moodData?.label}>
                        {moodData?.emoji}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-gray-900">{entry.mood_label}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 italic truncate">
                        {entry.notes || "No notes added"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No reflections yet. Start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
