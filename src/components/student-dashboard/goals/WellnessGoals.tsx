import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";
import {
  saveWellnessGoal,
  getWellnessGoals,
  updateWellnessGoal,
  deleteWellnessGoal,
} from "@/services/wellnessService";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import {
  Flame,
  Check,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ArrowLeft,
  Zap,
  Droplet,
  BookOpen,
  User,
  Moon,
  Heart,
  Smartphone
} from "lucide-react";

// --- Types & Constants ---

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  target_frequency: string;
  is_completed: boolean;
  completed_count: number;
  emoji: string;
  userId: string;
  createdAt: any;
  streak_count?: number;
  last_completed_at?: any;
}

const emojiOptions = ["🧘", "💧", "🏃", "📚", "🍎", "😴", "🎨", "🎸", "🌳", "🤝", "🧹", "📝", "🎮", "🧩", "🚴"];

// Suggestions using Lucide Icons
const allSuggestions = [
  { title: "Drink Water", description: "Stay hydrated", icon: Droplet, freq: "daily", emoji: "💧", color: "text-blue-500" },
  { title: "Read 10 Mins", description: "Brain boost", icon: BookOpen, freq: "daily", emoji: "📚", color: "text-amber-500" },
  { title: "Go for a Walk", description: "Fresh air", icon: User, freq: "daily", emoji: "🏃", color: "text-emerald-500" },
  { title: "Sleep Early", description: "Recharge", icon: Moon, freq: "daily", emoji: "😴", color: "text-indigo-500" },
  { title: "Kindness Act", description: "Spread joy", icon: Heart, freq: "daily", emoji: "🤝", color: "text-rose-500" },
  { title: "No Screens", description: "Before bed", icon: Smartphone, freq: "daily", emoji: "📵", color: "text-slate-500" },
];

const WellnessGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkProfanity } = useProfanityFilter();
  const { recordActivity } = useActivityTracking();

  // --- State ---
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Create Form State
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_frequency: "daily",
    emoji: "🎯",
  });
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);

  // Edit State
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<Partial<WellnessGoal>>({});

  // --- Effects ---
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const fetchedGoals = await getWellnessGoals({ userId: user.uid });
      setGoals(fetchedGoals as WellnessGoal[]);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleAddGoal = async () => {
    if (!user) return;
    if (!newGoal.title.trim()) {
      toast({ title: "Please name your goal!", variant: "destructive" });
      return;
    }
    if (checkProfanity(newGoal.title) || checkProfanity(newGoal.description)) {
      toast({ title: "Let's keep it positive!", variant: "destructive" });
      return;
    }

    try {
      await saveWellnessGoal({
        userId: user.uid,
        ...newGoal,
        is_completed: false,
        completed_count: 0,
        streak_count: 0,
        due_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Goal Added!",
        description: "Let's get started.",
        className: "bg-indigo-50 border-indigo-100 text-indigo-900"
      });

      setNewGoal({ title: "", description: "", target_frequency: "daily", emoji: "🎯" });
      setShowDescriptionInput(false);
      fetchGoals();
      setView('dashboard');
      recordActivity("Created a new wellness goal");
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({ title: "Could not save goal", variant: "destructive" });
    }
  };

  const handleQuickAdd = (template: { title: string, emoji: string, freq: string }) => {
    setNewGoal({
      title: template.title,
      description: "",
      target_frequency: template.freq,
      emoji: template.emoji
    });
    setView('create');
  };

  const handleToggleComplete = async (goalId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCount = !currentStatus ? (goal.completed_count || 0) + 1 : (goal.completed_count || 0);

      setGoals(goals.map(g => g.id === goalId ? { ...g, is_completed: !currentStatus, completed_count: newCount } : g));

      await updateWellnessGoal({
        userId: user.uid,
        goalId,
        updates: {
          is_completed: !currentStatus,
          completed_count: newCount,
        }
      });

      if (!currentStatus) {
        toast({
          title: "Nice work!",
          description: "Goal completed.",
          className: "bg-emerald-50 border-emerald-100 text-emerald-900"
        });
        recordActivity(`Completed goal: ${goal.title}`);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteWellnessGoal({ userId: user!.uid, goalId });
      setGoals(goals.filter((g) => g.id !== goalId));
      toast({ title: "Goal deleted" });
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleEditGoal = (goal: WellnessGoal) => {
    setEditingGoalId(goal.id);
    setEditGoal({ ...goal });
    setOpenMenuId(null);
  };

  const handleSaveEdit = async (goalId: string) => {
    if (!user) return;
    try {
      await updateWellnessGoal({
        userId: user.uid,
        goalId,
        updates: editGoal
      });
      setGoals(goals.map((g) => (g.id === goalId ? { ...g, ...editGoal } as WellnessGoal : g)));
      setEditingGoalId(null);
      toast({ title: "Updated!" });
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);
  const totalCompleted = goals.reduce((acc, curr) => acc + (curr.completed_count || 0), 0);

  // --- Render: Create View ---
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto p-6 font-sans text-slate-800">
        <Button
          variant="ghost"
          onClick={() => setView('dashboard')}
          className="mb-8 pl-0 hover:bg-transparent text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={1.5} />
          <span className="font-bold">Back to Goals</span>
        </Button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Goal</h1>
            <p className="text-slate-500">Set a simple target for yourself.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Goal Name</label>
              <Input
                placeholder="e.g., Read for 15 mins"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="h-12 text-lg bg-white border-slate-200 focus:border-blue-500 rounded-xl"
                maxLength={40}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Frequency</label>
              <div className="flex gap-3">
                {['daily', 'weekly'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setNewGoal({ ...newGoal, target_frequency: freq })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all border ${newGoal.target_frequency === freq
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50'
                      }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowDescriptionInput(!showDescriptionInput)}
                className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                {showDescriptionInput ? "- Remove Note" : "+ Add Note"}
              </button>

              {showDescriptionInput && (
                <Textarea
                  placeholder="Why is this important?"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="bg-white border-slate-200 rounded-xl p-4 min-h-[100px]"
                />
              )}
            </div>

            <Button
              onClick={handleAddGoal}
              className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-4"
            >
              Save Goal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Dashboard View ---
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 font-sans text-slate-800">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Daily Boost</h1>
          <p className="text-slate-500 font-medium">
            {totalCompleted > 0 ? `${totalCompleted} goals completed so far!` : "Ready to start your day?"}
          </p>
        </div>
        <Button
          onClick={() => setView('create')}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} /> New Goal
        </Button>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Today's Goals</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
            </div>
            <p className="text-blue-600 font-medium">No active goals. Add one below!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
              >
                {editingGoalId === goal.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editGoal.title}
                      onChange={e => setEditGoal({ ...editGoal, title: e.target.value })}
                      className="font-bold h-10"
                      autoFocus
                    />
                    <Button onClick={() => handleSaveEdit(goal.id)} className="bg-blue-600 hover:bg-blue-700 text-white h-10">Save</Button>
                    <Button variant="ghost" onClick={() => setEditingGoalId(null)} className="h-10 text-blue-600 hover:text-blue-700">Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{goal.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className="uppercase">{goal.target_frequency}</span>
                        {goal.completed_count > 0 && (
                          <span className="flex items-center gap-1 text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                            <Flame className="w-3 h-3" strokeWidth={1.5} /> {goal.completed_count}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleComplete(goal.id, goal.is_completed, e)}
                        className="h-10 w-10 rounded-full border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 bg-white text-slate-400 hover:text-blue-600 flex items-center justify-center transition-all"
                        title="Mark Done"
                      >
                        <Check className="w-5 h-5" strokeWidth={2} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === goal.id ? null : goal.id);
                          }}
                          className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center"
                        >
                          <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        {openMenuId === goal.id && (
                          <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-10">
                            <button
                              onClick={() => handleEditGoal(goal)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" strokeWidth={1.5} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Quick Adds</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {allSuggestions.map((item, i) => (
            <button
              key={i}
              onClick={() => handleQuickAdd({ title: item.title, emoji: item.emoji, freq: item.freq })}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10 group-hover:bg-opacity-20`}>
                <item.icon className={`w-6 h-6 ${item.color}`} strokeWidth={1.8} />
              </div>
              <span className="text-sm font-semibold text-slate-800 text-center leading-tight">{item.title}</span>
              <span className="text-xs text-slate-400 mt-0.5">{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Completed */}
      {completedGoals.length > 0 && (
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Done Today</h3>
          <div className="space-y-2 opacity-70">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4" strokeWidth={2} />
                </div>
                <span className="font-medium text-slate-500 line-through">{goal.title}</span>
                <button
                  onClick={(e) => handleToggleComplete(goal.id, goal.is_completed, e)}
                  className="ml-auto text-xs font-bold text-blue-600 hover:underline"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default WellnessGoals;
