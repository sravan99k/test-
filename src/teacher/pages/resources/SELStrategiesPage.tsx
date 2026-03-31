import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Heart, Users, Activity, Target, BookOpen, BookMarked } from "lucide-react";

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

export const SELStrategiesPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // TOC sections (keep icons from this page)
  const sections: Section[] = [
    { id: 'what-is-sel', title: '1. What is SEL PD?', icon: <Activity className="h-4 w-4" /> },
    { id: 'why-matters', title: '2. Why SEL Matters', icon: <Heart className="h-4 w-4" /> },
    { id: 'core-practices', title: '3. Core SEL Practices', icon: <Target className="h-4 w-4" /> },
    { id: 'school-support', title: '4. School Support', icon: <Users className="h-4 w-4" /> },
    { id: 'self-care', title: '5. Self-Care (Why)', icon: <Heart className="h-4 w-4" /> },
    { id: 'practical-tips', title: '6. Self-Care Techniques', icon: <Target className="h-4 w-4" /> },
    { id: 'signs', title: '7. Signs to Rebalance', icon: <Activity className="h-4 w-4" /> },
    { id: 'sel-selfcare', title: '8. SEL & Self-Care', icon: <Users className="h-4 w-4" /> },
    { id: 'reflection', title: '9. Reflection Exercise', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'final-tip', title: '10. Final Tip', icon: <Target className="h-4 w-4" /> },
  ];

  const sectionRefs = sections.reduce<SectionRefs>((acc, { id }) => {
    acc[id] = useRef<HTMLDivElement>(null);
    return acc;
  }, {});

  useEffect(() => {
    const elements = sections.map(({ id }) => ({ id, element: document.getElementById(id) }))
      .filter((x) => x.element) as { id: string; element: HTMLElement }[];
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: '0px 0px -80% 0px', threshold: 0.1 });
    elements.forEach(({ element }) => observer.current?.observe(element));
    return () => { elements.forEach(({ element }) => observer.current?.unobserve(element)); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
  };

  const toggleSave = () => setIsSaved(!isSaved);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const resource: Resource = {
    id: 1,
    title: "SEL-Related Training & Self-Care Practices",
    category: "Teacher Wellbeing",
    description: "SEL strategies and teacher self-care practices that improve wellbeing, relationships, and classroom climate.",
    type: "Guide",
    content: `# SEL-Related Training & Self-Care Practices

Teaching is not just about delivering lessons — it’s about emotional connection, regulation, and balance. Research shows that when teachers nurture their own emotional well-being and learn Social–Emotional Learning (SEL) strategies, their classrooms become calmer, more engaged, and more compassionate places for students.

## 1. What is SEL Professional Development? {#what-is-sel}
Social–Emotional Learning (SEL) focuses on five key skills:
• Self-awareness 🧠
• Self-management 💪
• Social awareness 🤝
• Relationship skills 💬
• Responsible decision-making 🎯
SEL-focused teacher training helps educators strengthen these skills in themselves — not just teach them to students.
According to Jennings et al. (2017) (Cultivating Emotional Balance for Teachers), teachers who participate in SEL-based professional learning:
• Report less stress and burnout
• Improve classroom climate and student relationships
• Show higher emotional awareness and empathy
💡 In short: emotionally balanced teachers create emotionally safe classrooms.

## 2. Why SEL Training Matters {#why-matters}
Teaching is emotionally demanding. Constant multitasking, student needs, and accountability can drain energy.
SEL-based professional learning helps teachers:
• Manage classroom stress calmly
• Model healthy emotional expression for students
• Respond instead of react during conflict
• Build stronger relationships with students and colleagues
💬 “When teachers take care of their emotions, students feel it too.”

## 3. Core SEL Practices for Teachers {#core-practices}
Here are simple, research-based techniques that align with SEL professional development programs:
a. Emotional Check-Ins
• Before class, pause for 30 seconds and notice how you feel — tense, calm, distracted?
• Label it mentally (“I’m feeling rushed right now”) and take 3 deep breaths before starting.
💡 Increases emotional awareness and reduces reactivity.
b. Mindful Transitions
• Between classes or tasks, take 60 seconds to reset — stretch, sip water, or stand quietly.
💡 Small pauses prevent emotional carryover from one class to the next.
c. Compassion Practice
• At the start of the day, think of one student you’ll intentionally connect with positively.
💡 Builds empathy and strengthens classroom belonging.
d. Reflective Journaling
• Spend 5 minutes weekly writing about a classroom success or challenge.
💡 Encourages self-reflection — key for SEL growth.

## 4. How Schools Can Support SEL Training {#school-support}
• Provide workshops on emotional regulation and mindfulness 🧘‍♀️
• Include SEL in teacher professional development days
• Encourage peer-support groups or teacher circles
• Offer guided mindfulness sessions before or after school
💡 A supportive environment makes SEL sustainable.

## 5. Self-Care for Educators — Why It’s Essential {#self-care}
According to a Frontiers in Psychology study (Mindful Practice for Teachers: Relieving Stress and Enhancing Wellbeing), educators who regularly engage in mindful self-care experience:
• Lower emotional exhaustion
• Greater sense of job satisfaction
• Better classroom management and focus
💬 “Caring for yourself is not self-indulgent — it’s part of your teaching practice.”

## 6. Practical Self-Care Techniques {#practical-tips}
These teacher-tested strategies help maintain calm, energy, and focus throughout the school year:
a. The 3-Minute Pause
• Step away from your desk or screen.
• Inhale deeply for 4 seconds, hold for 2, exhale for 6.
• Notice one thing you can see, hear, and feel.
💡 A fast reset when feeling overwhelmed.
b. “No-Work Zone” Boundaries
• Set at least one hour daily with no grading, email, or school talk.
💡 Protects your recovery time and reduces burnout.
c. Gratitude Note
• Write one short note each week to a colleague, student, or parent expressing thanks.
💡 Boosts positivity and emotional connection.
d. Gentle Movement
• Try stretching or walking before or after school.
💡 Physical release supports mental clarity.
e. Digital Mindfulness
• Avoid checking messages first thing in the morning or before bed.
💡 Helps your mind reset from “teacher mode.”

## 7. Signs You Might Need to Rebalance {#signs}
Check in with yourself regularly. You may need a self-care pause if you notice:
• Constant fatigue or irritability 😣
• Difficulty concentrating
• Detachment from students
• Negative self-talk (“I’m not doing enough”)
💡 Recognizing these signs early allows you to reset before burnout sets in.

## 8. How SEL & Self-Care Work Together {#sel-selfcare}
SEL training builds emotional skills — self-care sustains them. Together they:
• Improve teacher wellbeing 🧘
• Strengthen relationships with students and colleagues 🤝
• Create more emotionally safe learning environments 🌱
💡 Think of SEL as learning the tools, and self-care as using them daily.

## 9. Quick Reflection Exercise {#reflection}
Take 2 minutes:
• What emotion are you feeling right now?
• What’s one small act of care you can do today (breathe, step outside, message a friend)?
"Small daily awareness = long-term resilience."

## 10. Final Tip for Teachers {#final-tip}
Start with just one mindful practice this week — a daily breath, reflection, or short walk.
Tiny, consistent habits protect your well-being and help your students thrive alongside you. 🌼

## Disclaimer {#disclaimer}
⚠️ This guide is for teacher well-being and personal growth. It does not replace professional mental health support. If you feel persistently overwhelmed, reach out to a counselor or healthcare professional.
`,
    author: "Teacher Wellness Institute",
    tags: ["teacher wellbeing", "SEL", "self-care", "professional development", "mindfulness"],
    difficulty: "beginner",
  };

  // Related materials available in ResourcesPage reading materials
  const relatedMaterials: { title: string; path: string; iconBg: string }[] = [
    { title: "Professional Development for Teachers: SEL & Self-Care", path: "/teacher/resources/professional-development", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Effective Parent–Teacher Communication", path: "/teacher/resources/parent-teacher-communication", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Suicide Prevention Guidelines — What Teachers Need to Know", path: "/teacher/resources/suicide-prevention", iconBg: "bg-red-100 dark:bg-red-900/30" },
    { title: "Social-Emotional Learning (SEL) Strategies for the Classroom", path: "/teacher/resources/sel-strategies", iconBg: "bg-green-100 dark:bg-green-900/30" },
    { title: "Positive Behavior Support (PBIS) in the Classroom", path: "/teacher/resources/pbis", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Recognizing Signs of Anxiety & Depression in Students", path: "/teacher/resources/anxiety-depression", iconBg: "bg-pink-100 dark:bg-pink-900/30" },
  ];

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
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                  >
                    <span className="text-muted-foreground">{icon}</span>
                    <span>{title}</span>
                  </button>
                ))}
              </nav>
            </CardContent>

          </Card>
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
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
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
            {/* Description Card */}
            <Card className="bg-muted/50 border-0 mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground">{resource.description}</p>
              </CardContent>
            </Card>

            {/* Parse content into section cards */}
            {(() => {
              const lines = resource.content.split('\n');
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
                  if (!current) continue;
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
                          <li key={i}>{t.replace(/^•\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                    bufferList = [];
                  }
                };
                contentLines.forEach((l, idx) => {
                  const text = l.trim();
                  if (!text) { flushList(); return; }
                  if (/^•\s+/.test(text)) { bufferList.push(text); return; }
                  flushList();
                  // Strip any HTML-like tags if present
                  const noTags = text.replace(/<[^>]+>/g, '').trim();
                  if (!noTags) return;
                  if (noTags.startsWith('💡')) {
                    blocks.push(
                      <div key={`callout-${idx}`} className="p-3 my-2 rounded-xl bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 text-green-800 dark:text-green-200">
                        {noTags}
                      </div>
                    );
                    return;
                  }
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
            <Card className="mt-12 border-green-200">
              <CardContent className="p-6">
                <div>
                  <h3 className="font-semibold">You've completed this guide!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Great job! Consider saving this guide for future reference.
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
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button onClick={scrollToTop} size="icon" className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50" aria-label="Scroll to top">
          <Target className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default SELStrategiesPage;
