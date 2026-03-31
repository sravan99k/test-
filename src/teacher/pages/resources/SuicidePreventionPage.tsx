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
  Star,
  Clock,
  MessageSquare,
  Users,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  AlertTriangle,
  Shield,
  Heart,
  BookMarked
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

export const SuicidePreventionPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const sections: Section[] = [
    { id: 'what-this-is-about', title: '1. What this is about', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'warning-signs', title: '2. Common warning signs', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'immediate-steps', title: '3. Immediate steps (right now)', icon: <Shield className="h-4 w-4" /> },
    { id: 'referral-steps', title: '4. Who to involve (referral steps)', icon: <Users className="h-4 w-4" /> },
    { id: 'safe-scripts', title: '5. What to say — safe scripts', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'follow-up', title: '6. Classroom & follow-up', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'prevention', title: '7. Prevention in practice', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'documentation-legal', title: '8. Documentation & legal', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'research-insight', title: '9. Research insight', icon: <Star className="h-4 w-4" /> },
    { id: 'act-immediately', title: '10. When to act immediately', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'final-tip', title: '11. Final tip', icon: <Lightbulb className="h-4 w-4" /> },
  ];

  const sectionRefs = sections.reduce<SectionRefs>((acc, { id }) => {
    acc[id] = useRef<HTMLDivElement>(null);
    return acc;
  }, {});

  useEffect(() => {
    const elements = sections.map(({ id }) => ({
      id,
      element: document.getElementById(id),
    })).filter(item => item.element) as { id: string; element: HTMLElement }[];

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0.1 }
    );

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
    title: "Suicide Prevention Guidelines — What Teachers Need to Know",
    category: "Emergency",
    description: "Teachers are often the first to notice when a student is struggling. Know how to spot risk, respond safely, and follow school procedures.",
    type: "Guide",
    content: `# Suicide Prevention Guidelines — What Teachers Need to Know

Teachers are often the first adults to notice when a student is struggling. Knowing how to spot risk, respond safely, and follow school procedures can save lives. This guide gives clear, practical steps you can use in class and when you need to escalate concerns.

## 1. What this is about {#what-this-is-about}
Suicide prevention in schools means spotting warning signs early, responding with care, and connecting students to trained mental-health professionals. Teachers do not diagnose — they observe, listen, and refer.

## 2. Common warning signs teachers may notice {#warning-signs}
Watch for changes in a student’s behavior, mood, or school functioning. One sign alone may not mean suicidal risk, but multiple signs or sudden changes are important.
• Talk or writing about death, dying, or “not being here”
• Expressions of hopelessness (“It won’t get better,” “What’s the point?”)
• Withdrawal from friends, activities, or family
• Drop in grades or attendance; missing school often
• Giving away important things or preparing for absence
• Increased risk-taking or self-harm (cuts, burning)
• Sudden calmness after a period of depression (can mean a plan is in place)
💡 Trust your judgment. If you’re worried, take action — don’t wait.

## 3. Immediate steps if a student is at risk (what to do right now) {#immediate-steps}
Stay calm and ensure safety
• Move to a quiet, private place if possible. Don’t leave the student alone if risk appears immediate.
Ask directly, kindly, and non-judgmentally
• Use simple language: “I’ve noticed you seem very down. Are you thinking about hurting yourself or ending your life?”
• Asking directly does not increase risk — it opens the door.
Listen and acknowledge
• Let them speak. Use empathetic phrases: “That sounds really hard,” “I’m glad you told me.”
• Avoid minimizing: don’t say “You’ll be fine” or “Others have it worse.”
Take any threat seriously
• If they say they have a plan or means (e.g., pills, weapon), treat as imminent risk.
Do not promise secrecy
• Say: “I want to help you and keep you safe. I will need to tell the counselor so we can get you support.”
Follow school protocol immediately
• Contact the designated staff (school counselor, nurse, principal) and follow emergency procedures.
• If there is immediate danger, call emergency services (local ambulance/police) per school policy.

## 4. Who to involve and how (referral steps) {#referral-steps}
• School counselor / psychologist — first line for assessment.
• Designated safeguarding officer — for mandatory reporting and documentation.
• Parents / guardians — usually need to be informed unless doing so would increase risk (follow school policy).
• Emergency services / crisis team — if there is imminent danger or a plan with means.
Document what you observed (facts only: what you saw, said, and did), the time, and who you contacted.

## 5. What to say — quick safe scripts for teachers {#safe-scripts}
• “I’m worried about you because you haven’t been yourself lately. Can we talk for a few minutes?”
• “Thank you for telling me. I want to help keep you safe. I will get the counselor to support you now.”
• If they say ‘yes’ to thinking about suicide: “Thank you for telling me. You’re not alone — we will get you help right now.”
💡 Avoid saying: “You’re just seeking attention,” or “You’ll get over it.”

## 6. After the immediate event — classroom & follow-up {#follow-up}
• Keep things calm in class: maintain routines to help other students feel safe.
• Coordinate with counselor: the counselor will decide next steps (assessment, parent contact, safety plan).
• Respect privacy: share only with staff who need to know. Avoid gossip.
• Support reintegration: if the student returns after crisis care, help them rejoin with reduced pressure and check-ins.

## 7. Prevention in everyday classroom practice {#prevention}
• Teach coping skills (mindfulness, problem-solving) and encourage help-seeking.
• Normalize talking about feelings and mental health in age-appropriate ways.
• Build strong teacher-student relationships—students who feel seen are more likely to ask for help.
• Use schoolwide prevention programs and align with PBIS and SEL efforts.

## 8. Documentation & legal/ethical notes {#documentation-legal}
• Record only factual observations (what was said/done, dates, times).
• Follow your school’s reporting and confidentiality policies.
• Be aware of mandatory reporting rules in your region for child safety.

## 9. Research insight   {#research-insight}
Teachers play a key role in school-based suicide prevention: they are often the first to notice warning signs and can connect students to help. (See: The Role of Teachers in School-Based Suicide Prevention — literature reviews and guidance).
School toolkits (e.g., RHIhub Suicide Prevention Toolkit) offer practical steps for policies, staff training, and student support.
💡 These sources recommend clear protocols, staff training, and timely referrals as best practice.

## 10. Quick reference: When to act immediately {#act-immediately}
Act immediately (call emergency services or follow crisis protocol) if a student:
• Has a concrete plan and means (method/item).
• Is imminently dangerous to themself or others.
• Expresses intent and imminence (e.g., “I am going to do it tonight”).

## 11. Final tip for teachers {#final-tip}
If you feel uncertain, err on the side of safety. Reach out to your counselor or safeguarding lead — it’s better to be cautious than miss a chance to help. Your calm, prompt action can make a life-saving difference.

## Disclaimer {#disclaimer}
⚠️ This is a practical school guide for teachers. It is not clinical advice. Always follow your school’s mental health, safeguarding, and emergency procedures. If a student is in immediate danger, call local emergency services right away.
`,
    author: "School Mental Health Team",
    tags: ["suicide prevention", "crisis response", "teacher guide", "safeguarding"],
    difficulty: "Intermediate",
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

          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Immediate Action
            </h4>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              If a student is in immediate danger, follow your crisis protocol and contact emergency services.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1" ref={mainContentRef}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="destructive" className="text-sm font-medium">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
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

            <div className="flex flex-wrap gap-2 mt-4">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">



            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <Card className="bg-muted/50 border-0 mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground">{resource.description}</p>
              </CardContent>
            </Card>

            {(() => {
              // Parse content into sections based on heading anchors ## ... {#id}
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
                  if (!current) {
                    // Skip preface lines before first section heading
                    continue;
                  }
                  current.lines.push(raw);
                }
              }
              if (current) secs.push(current);

              // Helper: render a section's content with basic bullet support
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
                  if (!text) {
                    flushList();
                    return;
                  }
                  if (/^•\s+/.test(text)) {
                    bufferList.push(text);
                    return;
                  }
                  flushList();
                  const noTags = text.replace(/<[^>]+>/g, '').trim();
                  if (!noTags) return;
                  if (noTags.startsWith('💡')) {
                    blocks.push(
                      <div key={`callout-${idx}`} className="p-3 my-2 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/20 border-l-4 border-fuchsia-400 text-fuchsia-800 dark:text-fuchsia-200">
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

            <Card className="mt-12 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">You've reviewed the crisis guide.</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Keep protocols accessible and rehearse referral steps. Your calm response can save lives.
                  </p>
                </div>
              </CardContent>
            </Card>

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

export default SuicidePreventionPage;
