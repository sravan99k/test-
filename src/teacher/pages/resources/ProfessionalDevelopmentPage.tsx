import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Heart,
  Brain,
  HeartPulse,
  Lightbulb,
  Users,
  BookMarked,
  BookCheck,
  BookHeart,
  BookOpenCheck,
  BookText,
  ChevronRight,
  CheckCircle2,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MessageSquare,
  Activity,
  Target
} from "lucide-react";

interface SectionRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface Resource {
  id: number;
  title: string;
  category: string;
  description: string;
  type: string;
  content: string;
  author: string;
  tags: string[];
  difficulty: string;
}

export const ProfessionalDevelopmentPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Create refs for each section
  const sections: Section[] = [
    { id: 'what-is-sel', title: '1. What is SEL?', icon: <Brain className="h-4 w-4" /> },
    { id: 'why-matters', title: '2. Why It Matters', icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'core-practices', title: '3. Core Practices', icon: <BookCheck className="h-4 w-4" /> },
    { id: 'school-support', title: '4. School Support', icon: <Users className="h-4 w-4" /> },
    { id: 'self-care', title: '5. Self-Care', icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'practical-tips', title: '6. Practical Tips', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'signs', title: '7. Signs to Watch', icon: <BookOpenCheck className="h-4 w-4" /> },
    { id: 'reflection', title: '8. Reflection', icon: <BookHeart className="h-4 w-4" /> },
  ];

  const sectionRefs = sections.reduce<SectionRefs>((acc, { id }) => {
    acc[id] = useRef<HTMLDivElement>(null);
    return acc;
  }, {});

  // Set up intersection observer for table of contents highlighting
  useEffect(() => {
    const elements = sections.map(({ id }) => ({
      id,
      element: document.getElementById(id),
    })).filter(item => item.element) as { id: string; element: HTMLElement }[];

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1,
      }
    );

    elements.forEach(({ element }) => {
      observer.current?.observe(element);
    });

    return () => {
      elements.forEach(({ element }) => {
        observer.current?.unobserve(element);
      });
    };
  }, []);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  // Toggle save resource
  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Resource data
  const resource: Resource = {
    id: 1,
    title: "Professional Development for Teachers: SEL & Self-Care",
    category: "Teacher Wellbeing",
    description: "Essential SEL training and self-care practices to support teacher wellbeing and create emotionally healthy classrooms.",
    type: "Guide",
    content: `# Professional Development for Teachers
## SEL & Self-Care Practices for Educators

Teaching is not just about delivering lessons — it's about emotional connection, regulation, and balance. Research shows that when teachers nurture their own emotional well-being and learn Social–Emotional Learning (SEL) strategies, their classrooms become calmer, more engaged, and more compassionate places for students.

## 1. What is SEL Professional Development? 

Social–Emotional Learning (SEL) focuses on five key competencies:

<Card className="my-6 bg-muted/50 border-l-4 border-primary">
  <CardContent className="p-4">
    <h3 className="font-semibold mb-3 text-lg">Core SEL Competencies</h3>
    <ul className="space-y-2">
      <li className="flex items-start gap-2">
        <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Self-awareness</h4>
          <p className="text-sm text-muted-foreground">- Recognizing one's emotions and values</p>
        </div>
      </li>
      <li className="flex items-start gap-2">
        <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium">Self-management</h4>
          <p className="text-sm text-muted-foreground">- Regulating emotions and behaviors</p>
        </div>
      </li>
      <li className="flex items-start gap-2">
        <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium">Social awareness</h4>
          <p className="text-sm text-muted-foreground">- Understanding and empathizing with others</p>
        </div>
      </li>
      <li className="flex items-start gap-2">
        <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium">Relationship skills</h4>
          <p className="text-sm text-muted-foreground">- Building healthy relationships</p>
        </div>
      </li>
      <li className="flex items-start gap-2">
        <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium">- Responsible decision-making</h4>
          <p className="text-sm text-muted-foreground">- Making constructive choices</p>
        </div>
      </li>
    </ul>
  </CardContent>
</Card>

💡 SEL-focused teacher training helps educators strengthen these skills in themselves — not just teach them to students.

<Card className="my-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
  <CardContent className="p-4">

    <p className="text-sm text-blue-600 dark:text-blue-300">
      teachers who participate in SEL-based professional learning:
    </p>
    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
      <li className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
       - Report less stress and burnout
      </li>
      <li className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
       - Improve classroom climate and student relationships
      </li>
      <li className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
      - Show higher emotional awareness and empathy
      </li>
    </ul>
    <div className="mt-3 p-3 bg-white dark:bg-blue-900/30 rounded-md">
      <p className="font-medium text-blue-800 dark:text-blue-100">
        💡 <span className="font-semibold">Key Insight:</span> Emotionally balanced teachers create emotionally safe classrooms.
      </p>
    </div>
  </CardContent>
</Card>

## 2. Why SEL Training Matters 

Teaching is emotionally demanding. Constant multitasking, student needs, and accountability can drain energy.

<Card className="my-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
    <Lightbulb className="h-5 w-5" />
     <b> Benefits of SEL Training </b>
  </h3>
  <div className="grid gap-3 md:grid-cols-2">
    <div className="p-3 bg-white dark:bg-green-900/30 rounded-md">
      <h4 className="font-medium text-green-700 dark:text-green-200">For Teachers:</h4>
      <ul className="mt-2 space-y-1.5 text-sm text-green-700/90 dark:text-green-300">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
         - Better stress management
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
         - Improved work-life balance
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
         - Enhanced job satisfaction
        </li>
      </ul>
    </div>
    <div className="p-3 bg-white dark:bg-green-900/30 rounded-md">
      <h4 className="font-medium text-green-700 dark:text-green-200">For Students:</h4>
      <ul className="mt-2 space-y-1.5 text-sm text-green-700/90 dark:text-green-300">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
          - Improved classroom climate
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
         - Better student-teacher relationships
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
         - Enhanced academic performance
        </li>
      </ul>
    </div>
  </div>
  <div className="mt-4 p-3 bg-white dark:bg-green-900/30 rounded-md border-l-2 border-green-400">
    <p className="italic text-green-700 dark:text-green-200">
      💡 "When teachers take care of their emotions, students feel it too. Our emotional state directly impacts the learning environment we create."
    </p>
  </div>
</Card>

## 3. Core SEL Practices for Teachers 

Here are research-based techniques that align with SEL professional development programs:

 a. Emotional Check-Ins
- Before class, pause for 30 seconds and notice how you feel — tense, calm, distracted?
- Label it mentally ("I'm feeling rushed right now") and take 3 deep breaths before starting.
💡 "Increases emotional awareness and reduces reactivity."

 b. Mindful Transitions
- Between classes or tasks, take 60 seconds to reset — stretch, sip water, or stand quietly.
💡 "Small pauses prevent emotional carryover from one class to the next."

c. Compassion Practice
- At the start of the day, think of one student you'll intentionally connect with positively.
💡 "Builds empathy and strengthens classroom belonging."

d. Reflective Journaling
- Spend 5 minutes weekly writing about a classroom success or challenge.
💡 "Encourages self-reflection — key for SEL growth."

## 4. How Schools Can Support SEL Training
- Provide workshops on emotional regulation and mindfulness 
- Include SEL in teacher professional development days
- Encourage peer-support groups or teacher circles
- Offer guided mindfulness sessions before or after school

💡 "A supportive environment makes SEL sustainable."

## 5. Self-Care for Educators — Why It's Essential
According to a "Frontiers in Psychology" study (Mindful Practice for Teachers: Relieving Stress and Enhancing Wellbeing), educators who regularly engage in mindful self-care experience:
- Lower emotional exhaustion
- Greater sense of job satisfaction
- Better classroom management and focus

💡 💬 ""Caring for yourself is not self-indulgent — it's part of your teaching practice.""

## 6. Practical Self-Care Techniques
These teacher-tested strategies help maintain calm, energy, and focus throughout the school year:

a. The 3-Minute Pause
- Step away from your desk or screen.
- Inhale deeply for 4 seconds, hold for 2, exhale for 6.
- Notice one thing you can see, hear, and feel.
💡 "A fast reset when feeling overwhelmed."

 b. "No-Work Zone" Boundaries
- Set at least one hour daily with no grading, email, or school talk.
💡 "Protects your recovery time and reduces burnout."

c. Gratitude Note
- Write one short note each week to a colleague, student, or parent expressing thanks.
💡 "Boosts positivity and emotional connection."

 d. Gentle Movement
- Try stretching or walking before or after school.
💡 "Physical release supports mental clarity."

 e. Digital Mindfulness
- Avoid checking messages first thing in the morning or before bed.
💡 "Helps your mind reset from "teacher mode." "

## 7. Signs You Might Need to Rebalance
Check in with yourself regularly. You may need a self-care pause if you notice:
- Constant fatigue or irritability 
- Difficulty concentrating
- Detachment from students
- Negative self-talk ("I'm not doing enough")

💡 "Recognizing these signs early allows you to reset before burnout sets in."

## 8. How SEL & Self-Care Work Together
SEL training builds emotional skills — self-care sustains them. Together they:
- Improve teacher wellbeing 
- Strengthen relationships with students and colleagues 
- Create more emotionally safe learning environments 

💡 "Think of SEL as learning the tools, and self-care as using them daily."

## 9. Quick Reflection Exercise
Take 2 minutes:
1. What emotion are you feeling right now?
2. What's one small act of care you can do today (breathe, step outside, message a friend)?

💡"Small daily awareness = long-term resilience."

## 10. Final Tip for Teachers
Start with just one mindful practice this week — a daily breath, reflection, or short walk.

"Tiny, consistent habits protect your well-being and help your students thrive alongside you." 

⚠️ "Disclaimer:"
This guide is for teacher well-being and personal growth. It does not replace professional mental health support. If you feel persistently overwhelmed, reach out to a counselor or healthcare professional.`,
    author: "Teacher Wellness Institute",
    tags: ["teacher wellbeing", "SEL", "self-care", "professional development", "mindfulness"],
    difficulty: "beginner"
  };

  // Related materials available in ResourcesPage reading materials
  const relatedMaterials: { title: string; path: string; iconBg: string }[] = [
    { title: "Effective Parent–Teacher Communication", path: "/teacher/resources/parent-teacher-communication", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Suicide Prevention Guidelines — What Teachers Need to Know", path: "/teacher/resources/suicide-prevention", iconBg: "bg-red-100 dark:bg-red-900/30" },
    { title: "Social-Emotional Learning (SEL) Strategies for the Classroom", path: "/teacher/resources/sel-strategies", iconBg: "bg-green-100 dark:bg-green-900/30" },
    { title: "Positive Behavior Support (PBIS) in the Classroom", path: "/teacher/resources/pbis", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Recognizing Signs of Anxiety & Depression in Students", path: "/teacher/resources/anxiety-depression", iconBg: "bg-pink-100 dark:bg-pink-900/30" },
    { title: "Professional Development for Teachers: SEL & Self-Care", path: "/teacher/resources/professional-development", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
  ];

  // Pick up to two suggestions that exist in ResourcesPage and are not the current resource
  const suggestions = useMemo(() => {
    const items = relatedMaterials.filter(r => r.title !== resource.title);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items.slice(0, 2);
  }, [resource.title]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:bg-primary/10 w-full justify-start mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map(({ id, title, icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                  >
                    <span className="text-muted-foreground">{icon}</span>
                    <span>{title}</span>
                  </button>
                ))}
              </nav>
            </CardContent>

          </Card>

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Tip
            </h4>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              Try the 3-Minute Pause technique between classes to reset and refocus.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1" ref={mainContentRef}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-sm font-medium">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                {resource.category}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <BookText className="h-3.5 w-3.5 mr-1.5" />
                {resource.type}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {resource.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
              <span>By {resource.author}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">



            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Callout */}
            <div className="mb-6 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-400">
              <p className="text-sm text-violet-800 dark:text-violet-200">
                💡 A quick reflection before you begin can help you get the most from this guide.
              </p>
            </div>

            {/* Description Card */}
            <Card className="bg-muted/50 border-0 mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground">{resource.description}</p>
              </CardContent>
            </Card>

            {/* Main Content parsed into visual sections */}
            {(() => {
              // Prepare content with anchors for all sections
              const contentWithAnchors = resource.content
                .replace('## 1. What is SEL Professional Development?',
                  `## 1. What is SEL Professional Development? {#what-is-sel}`)
                .replace('## 2. Why SEL Training Matters',
                  `## 2. Why SEL Training Matters {#why-matters}`)
                .replace('## 3. Core SEL Practices for Teachers',
                  `## 3. Core SEL Practices for Teachers {#core-practices}`)
                .replace('## 4. How Schools Can Support SEL Training',
                  `## 4. How Schools Can Support SEL Training {#school-support}`)
                .replace('## 5. Self-Care for Educators — Why It\'s Essential',
                  `## 5. Self-Care for Educators — Why It's Essential {#self-care}`)
                .replace('## 6. Practical Self-Ccare Techniques',
                  `## 6. Practical Self-Ccare Techniques {#practical-tips}`)
                .replace('## 6. Practical Self-Care Techniques',
                  `## 6. Practical Self-Care Techniques {#practical-tips}`)
                .replace(/## 7\. Signs You Might Need to Rebalance/g,
                  `## 7. Signs You Might Need to Rebalance {#signs}`)
                .replace(/## 8\. How SEL & Self-Care Work Together/g,
                  `## 8. How SEL & Self-Care Work Together {#sel-selfcare}`)
                .replace('## 9. Quick Reflection Exercise',
                  `## 9. Quick Reflection Exercise {#reflection}`)
                .replace('## 10. Final Tip for Teachers',
                  `## 10. Final Tip for Teachers {#final-tip}`);

              // Split into sections by anchored headings: ## Title {#id}
              const lines = contentWithAnchors.split('\n');
              type Sec = { id: string; title: string; lines: string[] };
              const secs: Sec[] = [];
              let current: Sec | null = null;
              const headingRe = /^##\s*(.+?)\s*\{#([^}]+)\}\s*$/;
              for (const raw of lines) {
                const m = raw.match(headingRe);
                if (m) {
                  if (current) secs.push(current);
                  current = { id: m[2], title: m[1], lines: [] };
                } else {
                  if (!current) continue; // Skip preface before first section
                  current.lines.push(raw);
                }
              }
              if (current) secs.push(current);

              const renderSectionBody = (contentLines: string[]) => {
                const blocks: React.ReactNode[] = [];
                let bufferList: string[] = [];
                const flushList = () => {
                  if (bufferList.length) {
                    blocks.push(
                      <ul className="list-disc pl-5 space-y-1" key={`ul-${blocks.length}`}>
                        {bufferList.map((t, i) => (
                          <li key={i}>{t.replace(/^[-•]\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                    bufferList = [];
                  }
                };
                contentLines.forEach((l, idx) => {
                  // Remove any inline HTML/JSX tags (e.g., <Card>, <h3>, <Brain />) to render clean text
                  const text = l.trim();
                  const noTags = text.replace(/<[^>]+>/g, '').trim();
                  if (!noTags) { flushList(); return; }
                  // Accumulate bullets
                  if (/^[-•]\s+/.test(noTags)) { bufferList.push(noTags); return; }
                  // Flush list before rendering non-bullet content
                  flushList();
                  // If original line had an <h4>...</h4>, render as bold
                  if (/<\s*h4\b[^>]*>/i.test(text)) {
                    blocks.push(
                      <p key={`h4-${idx}`} className="leading-relaxed font-semibold">
                        {noTags}
                      </p>
                    );
                    return;
                  }
                  // Render lightbulb callouts as styled boxes
                  if (noTags.startsWith('💡')) {
                    blocks.push(
                      <div key={`callout-${idx}`} className="p-3 my-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-400 text-violet-800 dark:text-violet-200">
                        {noTags}
                      </div>
                    );
                    return;
                  }
                  // Default paragraph
                  blocks.push(
                    <p key={`p-${idx}`} className="leading-relaxed">
                      {noTags}
                    </p>
                  );
                });
                flushList();
                return blocks;
              };

              return (
                <div className="space-y-6">
                  {secs.map((s) => (
                    <div key={s.id} id={s.id} ref={sectionRefs[s.id]} className="scroll-mt-24">
                      <Card className="border border-muted/60">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl font-semibold">{s.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          {renderSectionBody(s.lines)}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Completion Card */}
            <Card className="mt-12 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">You've completed this guide!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Great job! You've taken an important step toward enhancing your teaching practice.
                    Consider saving this guide for future reference.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Resources */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4">You Might Also Like</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((item) => (
                  <Card
                    key={item.title}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(item.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`${item.iconBg} p-2 rounded-lg`}>
                          <BookMarked className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t p-6">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button variant="outline" onClick={scrollToTop}>
                Back to Top
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Was this guide helpful?</span>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50"
          aria-label="Scroll to top"
        >
          <ChevronRight className="h-5 w-5 transform -rotate-90" />
        </Button>
      )}
    </div>
  );
};

export default ProfessionalDevelopmentPage;
