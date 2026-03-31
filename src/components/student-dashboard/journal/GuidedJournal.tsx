import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Calendar,
  Smile,
  ChevronDown,
  ChevronUp,
  PenLine,
  Save,
  CloudSun
} from "lucide-react";
import { auth, db } from "@/integrations/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";
import { saveJournalEntry, subscribeToJournalEntries } from "@/services/journalService";

const JOURNAL_TIPS = [
  "There's no right or wrong way to write. Just be you!",
  "Stuck? Try writing about the best part of your day.",
  "It's okay to write just one sentence.",
  "Your journal is a safe space. Be honest with yourself.",
  "Try describing your feelings as if they were weather.",
];

const GuidedJournal = () => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const { filterProfanity } = useProfanityFilter();
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [visibleEntries, setVisibleEntries] = useState(3);

  const journalPrompts = [
    "What made you smile today?",
    "If you could have any superpower right now, what would it be and why?",
    "What was the hardest part of your day?",
    "Who is someone you are grateful for today?",
    "Describe your mood using a color and explain why.",
    "What is one thing you learned about yourself recently?",
    "What are you looking forward to tomorrow?",
    "If you could talk to your future self, what would you say?",
    "What is a challenge you overcame recently?",
    "Write about a place where you feel safe and happy."
  ];

  useEffect(() => {
    generateRandomPrompt();
    loadUserDataAndSubscribe();
  }, []);

  const loadUserDataAndSubscribe = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();

      if (data && data.studentId) {
        setUserData(data);
        const unsubscribe = subscribeToJournalEntries(
          {
            studentId: data.studentId,
            adminId: data.parentAdminId,
            schoolId: data.schoolId,
            organizationId: data.organizationId || null
          },
          (entries) => {
            setJournalEntries(entries);
          }
        );
        return () => unsubscribe();
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const generateRandomPrompt = () => {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const filteredText = filterProfanity(e.target.value);
    setJournalContent(filteredText);
  };

  const promptRef = useRef("");
  useEffect(() => { promptRef.current = currentPrompt; }, [currentPrompt]);

  const handleSaveJournalEntry = async () => {
    if (!journalContent.trim()) {
      toast({ title: "Your journal is empty!", description: "Write a little something first.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !userData?.studentId) {
        toast({ title: "Error", description: "Please log in to save.", variant: "destructive" });
        return;
      }

      await saveJournalEntry({
        studentId: userData.studentId,
        adminId: userData.parentAdminId,
        schoolId: userData.schoolId,
        organizationId: userData.organizationId || null,
        prompt: promptRef.current,
        content: journalContent
      });

      toast({
        title: "Saved! 🎉",
        description: "Your entry has been safely stored.",
        className: "bg-indigo-50 border-indigo-200 text-indigo-800"
      });

      setJournalContent("");
      generateRandomPrompt();

      setTimeout(() => setIsSaving(false), 1000);

    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({ title: "Error", description: "Could not save entry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % JOURNAL_TIPS.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-500" /> My Journal
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Express yourself, one day at a time.</p>
        </div>

        {/* Collapsible Tips Toggle */}
        <div className="w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTips(!showTips)}
            className="w-full md:w-auto rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showTips ? "Hide Tips" : "Show Tips"}
            {showTips ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Tips Content (Collapsible) */}
      {showTips && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm text-indigo-500 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-indigo-900 font-medium italic">"{JOURNAL_TIPS[currentTipIndex]}"</p>
              <Button
                variant="link"
                size="sm"
                onClick={nextTip}
                className="text-indigo-500 h-auto p-0 mt-2 text-xs font-bold hover:text-indigo-700"
              >
                Next Tip →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Writing Area */}
      <Card className="border-none shadow-sm rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardContent className="p-0">

          {/* Prompt Bar - Simplified */}
          <div className="bg-slate-50/30 p-5 md:p-6 pb-2">
            <div className="flex gap-3 items-start">
              <div className="mt-1">
                <Sparkles className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-indigo-900 font-bold text-lg leading-snug tracking-tight">{currentPrompt}</p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={generateRandomPrompt}
                className="text-xs text-slate-400 hover:text-indigo-600 hover:bg-transparent px-0 h-auto font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" /> Try another
              </Button>
            </div>
          </div>

          {/* Text Area - Higher Contrast */}
          <div className="p-5 md:p-8 pt-2">
            <div className="relative">
              <Textarea
                placeholder="Write here... How are you really feeling today?"
                value={journalContent}
                onChange={handleContentChange}
                className="min-h-[240px] text-lg leading-relaxed border border-indigo-100 bg-[#F8F9FF] focus-visible:ring-1 focus-visible:ring-indigo-200 focus-visible:border-indigo-300 resize-none p-6 rounded-2xl placeholder:text-slate-400 text-slate-700 font-medium transition-all"
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pl-1">
                <CloudSun className="w-4 h-4" /> Your safe space
              </p>
              <Button
                onClick={handleSaveJournalEntry}
                disabled={!journalContent.trim() || loading}
                className={`rounded-xl px-6 h-11 font-bold text-sm transition-all duration-200 ${isSaving
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow"
                  }`}
              >
                {isSaving ? (
                  <>Saved! <span className="ml-2">🎉</span></>
                ) : (
                  <>Save Entry</>
                )}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* History Section - Warmer */}
      <div className="space-y-6 pt-6">
        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 px-1">
          <Calendar className="w-5 h-5 text-slate-400" /> Past Reflections
        </h2>

        {journalEntries.length > 0 ? (
          <div className="grid gap-4">
            {journalEntries.slice(0, visibleEntries).map((entry) => {
              let createdAt = entry.created_at;
              let dateObj = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);

              return (
                <div
                  key={entry.id}
                  className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-indigo-50/50 text-indigo-600 border border-indigo-100/50">
                      <span className="text-xs font-bold uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm font-extrabold leading-none">{dateObj.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="h-px w-4 bg-slate-200"></div>
                        <Smile className="w-3 h-3 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {entry.prompt || "Free Reflection"}
                      </p>
                    </div>
                  </div>

                  <div className="pl-[3.5rem]">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-sm">
                      {entry.content}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {journalEntries.length > 3 && visibleEntries <= 3 && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleEntries(journalEntries.length)}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  View All Entries ({journalEntries.length - 3} more)
                </Button>
              </div>
            )}
            
            {visibleEntries > 3 && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleEntries(3)}
                  className="text-slate-500 hover:text-indigo-600 hover:bg-transparent rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  Show Less
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <PenLine className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Your journal is waiting for its first story.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default GuidedJournal;
