import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Heart, Brain, Calendar, Sparkles, RefreshCw, Star, ChevronRight, Zap } from 'lucide-react';
import { GameWorkspace } from './shared/GameWorkspace';
import { useLevelProgress } from './useLevelProgress';

interface MoodTrackerGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface MoodEntry {
  emotion: string;
  question: string;
}

interface Question {
  id: number;
  text: string;
}

const QUESTIONS_PER_SESSION = 5;

const EMOTIONS = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Angry', emoji: '😠' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'Excited', emoji: '🤩' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Frustrated', emoji: '😤' },
  { name: 'Grateful', emoji: '🙏' }
];

const ALL_QUESTIONS: Question[] = [
  { id: 1, text: "You helped a classmate clean up — how did that feel?" },
  { id: 2, text: "A teacher praised your hard work in class today — how did that moment feel?" },
  { id: 3, text: "You got irritated easily today — how did that feel inside?" },
  { id: 4, text: "The teacher gave you a sticker — how was that for you?" },
  { id: 5, text: "You stayed focused through a lot of study — how did that feel inside?" },
  { id: 6, text: "You completed something difficult — what was that like for you?" },
  { id: 7, text: "You forgot your lunch — how was that situation for you?" },
  { id: 8, text: "Someone misunderstood your words — how was that experience?" },
  { id: 9, text: "You practiced deep breathing — how did that feel in your body?" },
  { id: 10, text: "A parent said “I’m proud of you” — how did that feel?" },
  { id: 11, text: "The day started with an argument at home — how did that affect the morning?" },
  { id: 12, text: "Someone opened the door for you — how did that moment go?" },
  { id: 13, text: "You helped decorate the classroom — how did that feel?" },
  { id: 14, text: "You found money on the floor and turned it in — how was that moment?" },
  { id: 15, text: "You reflected on your week — how did that feel?" },
  { id: 16, text: "The school bus was noisy — how did that make you feel?" },
  { id: 17, text: "You received an unexpected gift — what feeling came up?" },
  { id: 18, text: "Someone borrowed your item and returned it safely — how did that make you feel?" },
  { id: 19, text: "A friend didn’t keep a promise — how was that for you?" },
  { id: 20, text: "You stayed up late studying — how did the next day feel?" },
  { id: 21, text: "You forgot an answer during a test — how did that feel inside?" },
  { id: 22, text: "You woke up late — how did the start of the day feel?" },
  { id: 23, text: "A close friend didn’t talk to you during lunch — how did that make things feel inside?" },
  { id: 24, text: "You got a small surprise gift — how did that moment feel?" },
  { id: 25, text: "You worked hard and got appreciated — what kind of feeling did that bring?" },
  { id: 26, text: "You learned a new skill — how did mastering it feel?" },
  { id: 27, text: "Someone made a joke that included you — how was that for you?" },
  { id: 28, text: "The day felt very long — how was that feeling?" },
  { id: 29, text: "You missed someone — how did that feel?" },
  { id: 30, text: "You didn’t give up — how did that determination feel?" },
  { id: 31, text: "You listened carefully to someone — what was that like?" },
  { id: 32, text: "The classroom was noisy — how did that affect you?" },
  { id: 33, text: "Someone compared your work — how did that feel?" },
  { id: 34, text: "You received applause — how did that feel inside?" },
  { id: 35, text: "You practiced mindfulness in class — how was that experience?" },
  { id: 36, text: "A new rule was introduced — how did that feel?" },
  { id: 37, text: "You took a break when overwhelmed — how did that moment feel?" },
  { id: 38, text: "You saw someone helping another person — how did that moment feel?" },
  { id: 39, text: "You realized your own strength — how did that feel?" },
  { id: 40, text: "You helped someone who dropped their books — how did that feel in your heart?" },
  { id: 41, text: "You achieved something small — how did that feel?" },
  { id: 42, text: "Someone criticized your idea — how did that affect you?" },
  { id: 43, text: "You forgot to bring your homework — how did it feel standing there?" },
  { id: 44, text: "The lights went out during class — what was that experience like?" },
  { id: 45, text: "You completed your assignment early — what was that like?" },
  { id: 46, text: "You gave your best, no matter the result — how was that feeling?" },
  { id: 47, text: "A friend shared their problem — how was that moment for you?" },
  { id: 48, text: "Someone new smiled at you — how did that feel?" },
  { id: 49, text: "You were chosen to represent your class in a competition — how was that experience?" },
  { id: 50, text: "You learned from feedback — what was that like?" },
  { id: 51, text: "You spent time alone at break — how was that time for you?" },
  { id: 52, text: "You forgot your water bottle — what did that make you feel like?" },
  { id: 53, text: "You saw a rainbow after school — how did that sight feel?" },
  { id: 54, text: "You helped organize a class event — how was that experience?" },
  { id: 55, text: "The hallway was filled with laughter — what was that atmosphere like?" },
  { id: 56, text: "Someone copied your idea — how was that for you?" },
  { id: 57, text: "A group laughed at something you said — what did that feel like?" },
  { id: 58, text: "You encouraged someone else — what did that bring up?" },
  { id: 59, text: "A project didn’t go as planned — what emotion came with that?" },
  { id: 60, text: "You learned something new and understood it right away — how did that make you feel?" },
  { id: 61, text: "You took time to breathe quietly — how did that moment feel?" },
  { id: 62, text: "You had art class — how did creating something feel?" },
  { id: 63, text: "You spent time with siblings — what was that like?" },
  { id: 64, text: "You woke up feeling tired — how was that morning for you?" },
  { id: 65, text: "You achieved a goal — how did it feel to reach it?" },
  { id: 66, text: "You had to redo something — how did that feel?" },
  { id: 67, text: "The teacher called your name unexpectedly — how did that moment go for you?" },
  { id: 68, text: "You forgave someone — how did that release feel?" },
  { id: 69, text: "You compared yourself to someone else — how did that make you feel?" },
  { id: 70, text: "You helped with cooking — how did that feel?" },
  { id: 71, text: "The day ended peacefully — what was that like?" },
  { id: 72, text: "You got encouragement from family — how did that feel?" },
  { id: 73, text: "Someone thanked you sincerely — how did that gratitude feel?" },
  { id: 74, text: "The class had a fun activity together — how did the energy feel then?" },
  { id: 75, text: "You lost a worksheet — what emotion came up?" },
  { id: 76, text: "You got full marks on a test — how did that success feel?" },
  { id: 77, text: "You stayed organized — what was that experience like?" },
  { id: 78, text: "Someone admired your effort — what was that like?" },
  { id: 79, text: "A teacher smiled at you — what did that do inside?" },
  { id: 80, text: "You practiced a skill every day — how did progress feel?" },
  { id: 81, text: "You played outside in the fresh air — how was that experience?" },
  { id: 82, text: "A rumor spread among friends — how did that situation feel?" },
  { id: 83, text: "You helped motivate someone — how was that experience?" },
  { id: 84, text: "You were unsure of what to do — what was that feeling like?" },
  { id: 85, text: "Someone comforted you — what was that like inside?" },
  { id: 86, text: "You felt peaceful before sleep — what was that like?" },
  { id: 87, text: "You received help from someone at home — how did that feel?" },
  { id: 88, text: "The art project turned out beautifully — how did that result feel?" },
  { id: 89, text: "You stood up for someone — how did that feel in your heart?" },
  { id: 90, text: "You didn’t understand the math lesson — how did that make you feel?" },
  { id: 91, text: "You tripped in the hallway — how did that feel for you?" },
  { id: 92, text: "You surprised yourself — what did that feel like?" },
  { id: 93, text: "You saw someone else being teased — how did that feel in your heart?" },
  { id: 94, text: "You had to wait in a long line — what kind of feeling did that bring?" },
  { id: 95, text: "The teacher appreciated your effort — what kind of emotion came up?" },
  { id: 96, text: "You learned from a mistake — what did that feel like?" },
  { id: 97, text: "You noticed your heartbeat slowing down — what was that like?" },
  { id: 98, text: "You forgot your materials — what was that like?" },
  { id: 99, text: "You joined a new club — what was that like for you?" },
  { id: 100, text: "You made a small mistake — how did that moment feel?" },
  { id: 101, text: "You listened to your favorite song — how did that make you feel?" },
  { id: 102, text: "You finished your homework early — how was that moment for you?" },
  { id: 103, text: "You met someone new — what emotions did you experience?" },
  { id: 104, text: "You got a message from a friend — what feeling came up?" },
  { id: 105, text: "You helped a classmate understand something — how did that feel?" },
  { id: 106, text: "You forgot your lunch at home — how did you feel?" },
  { id: 107, text: "You were chosen for a team — what emotions came with that?" },
  { id: 108, text: "You found money on the ground — what was your reaction?" },
  { id: 109, text: "You worked on a group project — how did that experience feel?" },
  { id: 110, text: "You stayed up late studying — how did that make you feel the next day?" },
  { id: 111, text: "You apologized to someone — what did that feel like?" },
  { id: 112, text: "You received a gift unexpectedly — what did that bring up?" },
  { id: 113, text: "You couldn’t find your way in a new place — how did that feel?" },
  { id: 114, text: "You took care of a pet — what did that make you feel like?" },
  { id: 115, text: "You saw a sad movie — what emotions did you experience?" },
  { id: 116, text: "You shared your opinion in class — how did that feel?" },
  { id: 117, text: "You waited for exam results — what emotions came up?" },
  { id: 118, text: "You were late for school — how did that feel?" },
  { id: 119, text: "You played a new sport — what was that like?" },
  { id: 120, text: "You stayed quiet when you wanted to speak — how did that make you feel?" },
  { id: 121, text: "You cleaned your room — how did that feel afterwards?" },
  { id: 122, text: "You were told to try again after failing — how did you feel?" },
  { id: 123, text: "You spent time with a younger child — what did that make you feel?" },
  { id: 124, text: "You practiced something until you got better — how did that feel?" },
  { id: 125, text: "You forgot someone’s name — what did you feel in that moment?" },
  { id: 126, text: "You walked in the rain — what emotions did that bring?" },
  { id: 127, text: "You lost a game — how did that feel?" },
  { id: 128, text: "You made someone laugh — what was that like?" },
  { id: 129, text: "You spent a quiet afternoon — how did that time feel?" },
  { id: 130, text: "You saw your reflection and smiled — how did that feel?" },
  { id: 131, text: "You learned something about yourself — what was that like?" },
  { id: 132, text: "You were blamed for something you didn’t do — what did that feel like?" },
  { id: 133, text: "You got a compliment — what did that make you feel?" },
  { id: 134, text: "You cleaned up someone else’s mess — what emotions came with that?" },
  { id: 135, text: "You had to say goodbye to a friend — how did that feel?" },
  { id: 136, text: "You received your report card — what feelings came up?" },
  { id: 137, text: "You remembered a happy memory — what emotions did you feel?" },
  { id: 138, text: "You were asked to help — how did that make you feel?" },
  { id: 139, text: "You saw someone else succeed — how did that make you feel?" },
  { id: 140, text: "You read a story that inspired you — what did that feel like?" },
  { id: 141, text: "You made a new friend — how did that experience feel?" },
  { id: 142, text: "You received constructive feedback — what was that like?" },
  { id: 143, text: "You forgot an important detail — how did that feel?" },
  { id: 144, text: "You stood in front of the class — how did that moment feel?" },
  { id: 145, text: "You were included in a group — how did that feel?" },
  { id: 146, text: "You realized you were wrong — what was that like for you?" },
  { id: 147, text: "You solved a difficult problem — how did that make you feel?" },
  { id: 148, text: "You had to ask for help — what did that feel like?" },
  { id: 149, text: "You laughed with your friends — how was that moment?" },
  { id: 150, text: "You finished something you worked hard on — how did that feel?" },
  { id: 151, text: "You received a kind message — how did that make you feel?" },
  { id: 152, text: "You had a disagreement with a friend — what emotions came up?" },
  { id: 153, text: "You spent a whole day outdoors — how did that feel?" },
  { id: 154, text: "You forgot to do your homework — how did that make you feel?" },
  { id: 155, text: "You shared your lunch with someone — what did that feel like?" },
  { id: 156, text: "You saw someone sitting alone — how did that make you feel?" },
  { id: 157, text: "You gave your best in a competition — how did that feel?" },
  { id: 158, text: "You had to wait for your turn — what emotions did you experience?" },
  { id: 159, text: "You finished reading a book — how did that feel?" },
  { id: 160, text: "You realized someone cared for you — what did that feel like?" },
  { id: 161, text: "You were chosen to lead a group — how did that make you feel?" },
  { id: 162, text: "You couldn’t join an event — what emotions did that bring?" },
  { id: 163, text: "You were complimented by a teacher — how did that feel?" },
  { id: 164, text: "You worked with a new partner — how was that experience?" },
  { id: 165, text: "You lost something important — what did that feel like?" },
  { id: 166, text: "You helped tidy the classroom — what emotions came up?" },
  { id: 167, text: "You spent the day with family — how did that make you feel?" },
  { id: 168, text: "You made a mistake and fixed it — how did that feel?" },
  { id: 169, text: "You got to try something creative — what was that like?" },
  { id: 170, text: "You practiced mindfulness — how did that make you feel?" },
  { id: 171, text: "You got ready early in the morning — how did that feel?" },
  { id: 172, text: "You helped someone finish their work — what did that feel like?" },
  { id: 173, text: "You noticed someone feeling sad — how did that make you feel?" },
  { id: 174, text: "You completed a difficult task — how did that feel?" },
  { id: 175, text: "You waited for a reply — what emotions did you experience?" },
  { id: 176, text: "You cleaned up after an event — how did that feel?" },
  { id: 177, text: "You saw someone smile because of you — what was that like?" },
  { id: 178, text: "You had to share something valuable — how did that feel?" },
  { id: 179, text: "You remembered something embarrassing — what emotions came up?" },
  { id: 180, text: "You got praised in front of others — how did that make you feel?" },
  { id: 181, text: "You had to follow strict rules — what did that feel like?" },
  { id: 182, text: "You helped decorate for an event — how did that feel?" },
  { id: 183, text: "You didn’t get the result you expected — what emotions did that bring?" },
  { id: 184, text: "You taught someone something new — how did that feel?" },
  { id: 185, text: "You laughed until your stomach hurt — what was that like?" },
  { id: 186, text: "You helped solve a conflict — what emotions did you feel?" },
  { id: 187, text: "You played a board game with family — how did that feel?" },
  { id: 188, text: "You saw someone helping another — how did that make you feel?" },
  { id: 189, text: "You faced a new challenge — what emotions did that bring?" },
  { id: 190, text: "You felt appreciated — how did that feel?" },
  { id: 191, text: "You tried something new and failed — what did that make you feel?" },
  { id: 192, text: "You worked quietly by yourself — what was that like?" },
  { id: 193, text: "You stayed calm in a tough situation — how did that make you feel?" },
  { id: 194, text: "You visited a new place — how did that experience feel?" },
  { id: 195, text: "You learned a life lesson — what emotions came with that?" },
  { id: 196, text: "You received a surprise — what did that feel like?" },
  { id: 197, text: "You helped carry something heavy — how did that make you feel?" },
  { id: 198, text: "You looked at the stars — what emotions did that bring up?" },
  { id: 199, text: "You overcame a fear — how did that make you feel?" },
  { id: 200, text: "You ended the day with gratitude — what was that like?" },
];

const MoodTrackerGame: React.FC<MoodTrackerGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete'>('menu');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<number>>(new Set());
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);
  const { completedLevels, recordLevelCompletion } = useLevelProgress('moodTracker');

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadNextQuestion = (questionPool: Question[], usedIds: Set<number>) => {
    const unused = questionPool.filter(q => !usedIds.has(q.id));
    if (unused.length === 0) {
      const reshuffled = shuffleArray(ALL_QUESTIONS);
      setAvailableQuestions(reshuffled);
      setUsedQuestionIds(new Set());
      setCurrentQuestion(reshuffled[0]);
    } else {
      setCurrentQuestion(unused[0]);
    }
    setSelectedEmotion('');
  };

  const startGame = () => {
    setGameState('playing');
    setMoodEntries([]);
    setSessionQuestionCount(0);
    setUsedQuestionIds(new Set());
    const shuffled = shuffleArray(ALL_QUESTIONS);
    setAvailableQuestions(shuffled);
    const firstQ = shuffled[0];
    setCurrentQuestion(firstQ);
    setSelectedEmotion('');
  };

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
  };

  const handleEntrySubmit = () => {
    if (!selectedEmotion || !currentQuestion) return;

    const entry: MoodEntry = {
      emotion: selectedEmotion,
      question: currentQuestion.text
    };

    const newEntries = [...moodEntries, entry];
    setMoodEntries(newEntries);

    const newUsedIds = new Set(usedQuestionIds);
    newUsedIds.add(currentQuestion.id);
    setUsedQuestionIds(newUsedIds);

    const newCount = sessionQuestionCount + 1;
    setSessionQuestionCount(newCount);

    if (newCount >= QUESTIONS_PER_SESSION) {
      finishGame(newEntries);
    } else {
      loadNextQuestion(availableQuestions, newUsedIds);
    }
  };

  const finishGame = (finalEntries: MoodEntry[]) => {
    setGameState('complete');
    const finalScore = Math.min(100, finalEntries.length * 20); // 5 entries = 100 points

    // Increment level based on total completed sessions to track "mood_pro" badge
    const nextLevel = (completedLevels.size || 0) + 1;
    recordLevelCompletion(nextLevel, 100, 50); // Record each session as a new "level" for tracking

    onComplete(finalScore);
  };

  if (gameState === 'menu') {
    return (
      <div className="w-full h-full flex justify-center bg-white font-sans relative overflow-hidden text-slate-900 py-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="w-full max-w-4xl px-6 flex flex-col relative z-10 pt-4 pb-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">Mood Diary</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest leading-none">Status: Mood Check Active</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onBack}
              className="h-10 px-4 rounded-xl border-2 border-slate-100 bg-white text-slate-500 font-bold hover:bg-blue-50 hover:text-blue-900 transition-all text-[10px] flex items-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-3 h-3" /> DASHBOARD
            </Button>
          </div>

          <div className="rounded-[2.5rem] border-2 border-[#EFF6FF] bg-[#EFF6FF] shadow-2xl shadow-slate-200/50 p-6 mb-8 overflow-hidden">
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center text-xl drop-shadow-sm">
                📖
              </div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Your Personal Emotional Log</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-4 h-[2px] bg-sky-500 rounded-full" />
                  <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">How to Play</h3>
                </div>
                <div className="bg-white border border-slate-50 rounded-3xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5" />
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">Read emotional scenarios and identify your feelings.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">Build emotional awareness through varied situations.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-4 h-[2px] bg-emerald-500 rounded-full" />
                  <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Quick Tips</h3>
                </div>
                <div className="bg-white border border-slate-50 rounded-3xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{QUESTIONS_PER_SESSION} randomized questions per session.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5" />
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">No time limits - focus on real emotional reflection.</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={startGame}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
            >
              START JOURNEY
              <Play className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <GameWorkspace
        title="Mood Diary"
        subtitle="Understanding Feelings"
        currentRound={sessionQuestionCount + 1}
        totalRounds={QUESTIONS_PER_SESSION}
        score={moodEntries.length}
        icon={<Heart className="w-5 h-5 text-white" />}
      >
        <div className="w-full h-full flex flex-col items-center">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col min-h-[350px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-100" />
                <h3 className="text-[9px] font-black text-sky-500 uppercase tracking-[0.3em] mb-6">What Happened?</h3>
                <p className="text-2xl font-black text-slate-800 leading-tight mb-8 italic">
                  "{currentQuestion?.text}"
                </p>

                <div className="mt-auto">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">How would you feel?</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {EMOTIONS.map((emotion) => (
                      <button
                        key={emotion.name}
                        onClick={() => handleEmotionSelect(emotion.name)}
                        className={`group relative p-3 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center ${selectedEmotion === emotion.name
                          ? 'border-sky-50 bg-sky-50 shadow-md'
                          : 'border-slate-50 bg-white hover:border-slate-200'
                          }`}
                      >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{emotion.emoji}</div>
                        <div className={`text-[8px] font-black uppercase tracking-tight ${selectedEmotion === emotion.name ? 'text-sky-700' : 'text-slate-400'}`}>{emotion.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleEntrySubmit}
                disabled={!selectedEmotion}
                className="w-full h-16 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all disabled:opacity-50"
              >
                {sessionQuestionCount < QUESTIONS_PER_SESSION - 1 ? 'NEXT LOG ENTRY' : 'SAVE DIARY'}
                <Play className="w-4 h-4 ml-3" />
              </Button>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-6 h-full shadow-inner">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Feeling History</h3>
                </div>

                {moodEntries.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                    <RefreshCw className="w-10 h-10 mb-3 animate-spin-slow text-slate-300" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Awaiting Inputs...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {moodEntries.slice().reverse().map((entry, index) => {
                      const emotionData = EMOTIONS.find(e => e.name === entry.emotion);
                      return (
                        <div key={index} className="flex items-start gap-3 group bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                            {emotionData?.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black uppercase text-sky-600 tracking-widest">{entry.emotion}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate leading-relaxed font-sans italic">
                              "{entry.question}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gameState === 'complete') {
    const emotionCounts: Record<string, number> = {};
    moodEntries.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    return (
      <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center font-sans overflow-hidden relative py-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#93c5fd 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="w-full max-w-2xl px-4 flex flex-col items-center justify-center relative z-10">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="text-7xl">📝</div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center border-4 border-[#f8fafc] shadow-md">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-2">Mood Summary</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Emotional check-in Complete</p>
          </div>

          <div className="w-full space-y-8">
            <div className="flex justify-center gap-4">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className="w-12 h-12 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Logged</p>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{moodEntries.length}</h4>
                <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">Moments logged</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Span</p>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{Object.keys(emotionCounts).length}</h4>
                <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">Types of feelings</p>
              </div>
            </div>

            <div className="w-full p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Did You Know?</p>
                  <p className="font-bold text-sm italic leading-relaxed opacity-95">"Knowing how you feel helps you grow! Keep it up."</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="h-14 flex-1 rounded-2xl border-2 border-slate-100 bg-transparent text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50"
              >
                Exit
              </Button>
              <Button
                onClick={startGame}
                className="h-14 flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200"
              >
                Play again
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MoodTrackerGame;