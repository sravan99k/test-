import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Award, BarChart2, TrendingUp, Users, ClipboardCheck, BookMarked } from "lucide-react";

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

export const PBISPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // TOC sections using existing page icons
  const sections: Section[] = [
    { id: 'what-is-pbis', title: '1. What is PBIS?', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'why-works', title: '2. Why PBIS Works', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'core-principles', title: '3. Core Principles', icon: <ClipboardCheck className="h-4 w-4" /> },
    { id: 'strategies', title: '4. Strategies', icon: <Users className="h-4 w-4" /> },
    { id: 'examples', title: '5. Classroom Examples', icon: <Award className="h-4 w-4" /> },
    { id: 'research', title: '6. Research Insights', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'tips', title: '7. Tips for Teachers', icon: <ClipboardCheck className="h-4 w-4" /> },
    { id: 'extra-support', title: '8. Extra Support', icon: <Users className="h-4 w-4" /> },
    { id: 'final-tip', title: '9. Final Tip', icon: <TrendingUp className="h-4 w-4" /> },
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
    id: 2,
    title: "Positive Behavior Support (PBIS) in the Classroom",
    category: "Behavior Support",
    description: "A practical PBIS guide to teach expectations, reinforce positives, and build a safe, predictable classroom.",
    type: "Framework",
    content: `# Positive Behavior Support (PBIS) in the Classroom

Every classroom runs smoother when students know what’s expected and feel supported. Positive Behavior Support (PBIS) is a research-based approach that focuses on teaching and rewarding good behavior instead of just punishing misbehavior.

## 1. What is PBIS? {#what-is-pbis}
PBIS stands for Positive Behavioral Interventions and Supports. It’s a school-wide framework that helps create a positive, safe, and predictable learning environment.
💡 Instead of saying “Don’t run!”, PBIS teaches “Please walk safely in the hallway.”

## 2. Why PBIS Works {#why-works}
• Encourages positive choices instead of focusing only on mistakes
• Reduces disruptive behavior and bullying
• Improves classroom climate and student-teacher relationships
• Research shows PBIS leads to better academics and stronger social skills

## 3. Core Principles of PBIS {#core-principles}
Teach Expectations Clearly
• Define 3–5 simple rules (e.g., “Be Respectful, Be Responsible, Be Safe”).
• Model and practice them regularly.
Acknowledge & Reward Positive Behavior
• Praise specific actions: “I like how you raised your hand before speaking.”
• Use reward systems (stickers, points, or verbal recognition).
Consistent Consequences
• Handle rule-breaking calmly and fairly.
• Focus on re-teaching the right behavior rather than punishing.
Use Data & Observation
• Track patterns of misbehavior to see where extra support is needed.

## 4. Simple PBIS Strategies for Teachers {#strategies}
Behavior Matrix 📝
• Post a chart that shows what “Respect, Responsibility, Safety” look like in class, hallways, and playground.
Praise Ratio 5:1 🙌
• Give 5 positive comments for every correction.
• Example: “Thank you for helping a classmate” vs. “Stop talking.”
Classroom Acknowledgements 🎉
• Use tokens, stars, or group points for teamwork and good choices.
Pre-Correcting 🔄
• Before transitions, remind: “Remember, we walk quietly to the library.”
Restorative Conversations 💬
• After misbehavior: “What happened? How can we fix it?” instead of only punishment.

## 5. Quick Classroom Examples {#examples}
• Hallway → “Walk on the right side, hands by your sides.”
• Group Work → “Take turns, listen respectfully.”
• Test Time → “Keep voices off, encourage yourself with positive self-talk.”

## 6. Research Insights (Simplified) {#research}
• Schools using PBIS report lower suspension rates and better student outcomes (Bradshaw et al., 2010).
• Consistent PBIS improves not only student behavior but also teacher satisfaction and classroom climate.

## 7. Tips for Teachers {#tips}
• Start small: choose one routine (like lining up) and apply PBIS consistently.
• Be specific when praising: instead of “Good job,” say “Thanks for helping your partner.”
• Work with colleagues so students experience consistent expectations across the school.

## 8. Extra Support {#extra-support}
• If a student continues struggling, provide Tier 2 supports (small groups, check-ins with staff).
• For serious cases, use Tier 3 supports (individual plans, counselor involvement).

## 9. Final Tip {#final-tip}
PBIS is about catching students being good 🌟. When students feel recognized and supported, they are more likely to repeat positive behaviors and contribute to a respectful, safe classroom.

## Disclaimer {#disclaimer}
⚠️ Disclaimer: PBIS is a framework for classroom and school-wide behavior support. For students with persistent or severe behavior challenges, follow your school’s referral procedures for additional interventions.
`,
    author: "PBIS National Technical Assistance Center",
    tags: ["PBIS", "behavior", "classroom management", "positive reinforcement"],
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
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40">
                <Award className="h-3.5 w-3.5 mr-1.5" />
                PBIS
              </Badge>
              <Badge variant="outline" className="text-sm">
                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
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
                      <div key={`callout-${idx}`} className="p-3 my-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 text-blue-800 dark:text-blue-200">
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
            <Card className="mt-12 border-blue-200">
              <CardContent className="p-6">
                <div>
                  <h3 className="font-semibold">You've completed this guide!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Great work implementing PBIS strategies.
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
          <TrendingUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default PBISPage;
