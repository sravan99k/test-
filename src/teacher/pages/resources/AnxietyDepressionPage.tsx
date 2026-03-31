import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, ArrowLeft, Download, Heart, HeartPulse, Search, BookMarked } from "lucide-react";

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

export const AnxietyDepressionPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // TOC sections using this page's icons
  const sections: Section[] = [
    { id: 'what-are', title: '1. What Are Anxiety & Depression?', icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'signs-anxiety', title: '2A. Signs: Anxiety', icon: <Search className="h-4 w-4" /> },
    { id: 'signs-depression', title: '2B. Signs: Depression', icon: <Search className="h-4 w-4" /> },
    { id: 'why-early', title: '3. Why Early Recognition', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'classroom-strategies', title: '4. Classroom Strategies', icon: <Search className="h-4 w-4" /> },
    { id: 'when-help', title: '5. When to Seek Help', icon: <AlertCircle className="h-4 w-4" /> },
    { id: 'supportive-responses', title: '6. Supportive Responses', icon: <Heart className="h-4 w-4" /> },
    { id: 'resources', title: '7. Resources', icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'research', title: '8. Research Insights', icon: <Search className="h-4 w-4" /> },
    { id: 'final-tip', title: '9. Final Tip', icon: <Heart className="h-4 w-4" /> },
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
    id: 3,
    title: "Recognizing Signs of Anxiety & Depression in Students",
    category: "Mental Health",
    description: "Awareness guide for teachers to recognize signs of anxiety and depression and respond supportively.",
    type: "Awareness Guide",
    content: `# Recognizing Signs of Anxiety & Depression in Students

Supporting students’ mental health starts with awareness. Many children and teens struggle silently with anxiety or depression, and teachers are often the first to notice changes. By recognizing early signs, you can make a big difference in their well-being and learning.

## 1. What Are Anxiety & Depression? {#what-are}
Anxiety: A strong feeling of worry or fear that doesn’t go away, even when things seem fine.
Depression: More than just sadness. It’s a long-lasting low mood, loss of interest, and difficulty coping with daily life.
💡 Both can affect attention, behavior, and school performance.

## 2A. Common Signs Teachers May Notice — Anxiety {#signs-anxiety}
• Constant worry about tests, grades, or friendships
• Restlessness (can’t sit still, fidgeting)
• Physical complaints (stomachaches, headaches) with no clear medical reason
• Avoiding school, class presentations, or group work
• Over-perfectionism (erasing work repeatedly, afraid of mistakes)

## 2B. Common Signs Teachers May Notice — Depression {#signs-depression}
• Frequent sadness, irritability, or withdrawal from classmates
• Loss of interest in activities they used to enjoy (sports, art, games)
• Drop in academic performance
• Changes in sleep or eating (always tired, dozing in class)
• Expressions of hopelessness (“What’s the point?”, “I can’t do anything right”)

## 3. Why Early Recognition Matters {#why-early}
• Research shows early detection improves recovery and prevents worsening.
• Untreated anxiety/depression can impact grades, social skills, and long-term health.
• Teachers play a key role since students spend so much time in school.

## 4. Simple Classroom Strategies {#classroom-strategies}
Create a Safe Environment
• Greet students warmly, encourage open conversations.
• Remind them mistakes are part of learning.
Observe & Note Patterns
• Keep track if a student often looks upset, withdrawn, or overly nervous.
• Compare changes with their usual behavior.
Offer Small Supports
• Allow short breaks for overwhelmed students.
• Pair them with a supportive peer for group tasks.
Encourage Healthy Habits
• Promote movement breaks, mindfulness minutes, or journaling.
• Remind students about good sleep and balanced routines.

## 5. When to Seek Extra Help {#when-help}
Encourage professional support if:
• The student shows persistent sadness/worry for 2+ weeks.
• Anxiety/depression is affecting grades or daily functioning.
• The student talks about hopelessness or self-harm.
💡 In such cases, inform the school counselor, mental health team, or follow school protocols for referral.

## 6. Quick “Supportive Responses” Teachers Can Use {#supportive-responses}
Instead of: “Don’t worry so much.”
Try: “I can see you’re worried. Let’s take this one step at a time.”
Instead of: “Cheer up.”
Try: “It seems like you’re having a tough day. Want to take a short break or talk to me after class?”

## 7. Extra Support & Resources (India example, can localize) {#resources}
• Childline India (1098) – 24/7 free helpline for children.
• NIMHANS Helpline (080-46110007) – mental health support.
• School Counselor / Teacher Team – first point of support within the school.

## 8. Key Research Insights (Simplified) {#research}
• Teachers can accurately spot early signs when trained .
• Trauma-informed classrooms help reduce anxiety and depression symptoms.
• Mindfulness and SEL practices lower student stress and improve emotional health.

## 9. Final Tip for Teachers {#final-tip}
Start with awareness—observe, listen, and respond with empathy.
💡Small actions like checking in with a student or creating a calm classroom routine can make a huge difference in helping them feel safe and supported. 

## Disclaimer {#disclaimer}
⚠️ Disclaimer: This guide is for awareness only. It is not a substitute for professional medical advice. Always follow your school’s mental health and safety protocols.
`,
    author: "National Association of School Psychologists",
    tags: ["anxiety", "depression", "mental health", "teacher support", "SEL"],
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
              <Badge variant="destructive" className="text-sm font-medium">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                {resource.category}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <HeartPulse className="h-3.5 w-3.5 mr-1.5" />
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
                  // Lightbulb callout as rose box
                  if (noTags.startsWith('💡')) {
                    blocks.push(
                      <div key={`callout-${idx}`} className="p-3 my-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-400 text-teal-800 dark:text-teal-200">
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
            <Card className="mt-12 border-red-200">
              <CardContent className="p-6">
                <div>
                  <h3 className="font-semibold">You've completed this guide!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Thank you for supporting student mental health.
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
          <AlertTriangle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default AnxietyDepressionPage;
