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
  MessageSquare,
  Users,
  Mail,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
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

export const ParentTeacherCommunicationPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Create refs for each section
  const sections: Section[] = [
    { id: 'why-communication-matters', title: '1. Why Communication Matters', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'barriers', title: '2. Common Barriers', icon: <Users className="h-4 w-4" /> },
    { id: 'principles', title: '3. Principles of Effective Communication', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'everyday-strategies', title: '4. Everyday Strategies', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'culturally-responsive', title: '5. Culturally Responsive', icon: <Users className="h-4 w-4" /> },
    { id: 'when-issues-arise', title: '6. When Issues Arise', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'three-cs', title: '7. The 3Cs Framework', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'family-partnerships', title: '8. Long-Term Partnerships', icon: <Users className="h-4 w-4" /> },
    { id: 'outcomes', title: '9. Student Outcomes', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'final-tip', title: '10. Final Tip', icon: <Lightbulb className="h-4 w-4" /> },
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
    title: "Effective Parent–Teacher Communication",
    category: "Parent–Teacher Communication",
    description: "Stronger connections between teachers and parents create better learning, behavior, and emotional outcomes for students. This guide helps you build trust, share information clearly, and engage families as true partners in student success.",
    type: "Guide",
    content: `# Effective Parent–Teacher Communication

Stronger connections between teachers and parents create better learning, behavior, and emotional outcomes for students. This guide helps you build trust, share information clearly, and engage families as true partners in student success.

## 1. Why Parent–Teacher Communication Matters {#why-communication-matters}
Research shows that students do better academically and emotionally when parents and teachers work together.
According to Henderson & Mapp (2002), schools with strong family engagement see:
• Higher grades and test scores 📈
• Better attendance and homework completion
• Improved student motivation and behavior
• Greater parent trust in schools
💡 Communication isn’t just about sharing updates—it’s about building relationships.

## 2. Common Barriers to Communication {#barriers}
Understanding what gets in the way helps you plan better.
• Time constraints: Parents or teachers have busy schedules
• Language or cultural differences 🌏
• Negative past experiences with schools
• Different expectations between home and school
• Fear of being judged (especially for struggling parents)
💡 When communication feels supportive, parents are more likely to stay involved.

## 3. Principles of Effective Communication {#principles}
Use these 3 simple principles to guide all interactions:
Be Clear:
• Use simple, jargon-free language.
• Focus on the child’s learning, not just problems.
Be Positive:
• Start with what’s going well before discussing challenges.
• Show appreciation for parents’ efforts at home.
Be Collaborative:
• Ask for input: “What works at home?”
• Share decisions — don’t just inform.
💡 💬 Think partnership, not reporting.

## 4. Everyday Communication Strategies for Teachers {#everyday-strategies}
a. Regular Updates
• Send quick, positive notes or short messages once a week.
• Use platforms like ClassDojo, WhatsApp, or email for reminders and praise.
• Keep updates short and specific: “Riya did a great job explaining her math steps today!”
b. Family-Friendly Language
• Avoid educational jargon (e.g., “differentiation,” “scaffolding”).
• Say instead: “We’re giving extra help so every child can learn in their own way.”
c. Positive Phone Calls Home
• Don’t only call when there’s a problem. A quick positive call builds trust.
• “I just wanted to share that Arjun showed great teamwork today!”
d. Parent–Teacher Meetings
Before:
• Gather examples of student work.
• Plan two positives for every concern.
During:
• Use active listening — let parents talk.
• End with an action plan (“We’ll both check in next Friday”).
After:
• Send a short thank-you note summarizing key points.

## 5. Culturally Responsive Communication {#culturally-responsive}
• Learn about your students’ backgrounds—celebrate diversity.
• Offer translation support or bilingual materials when needed.
• Respect different family structures (e.g., guardians, grandparents).
• Schedule meetings flexibly to accommodate working parents.
💡 Cultural understanding = stronger relationships.

## 6. When Issues Arise {#when-issues-arise}
If there’s a concern (e.g., behavior or learning difficulty):
• Stay calm and neutral — focus on the student’s needs.
• Avoid blame — use “we” language: “How can we support him together?”
• Offer specific examples and possible solutions.
• Follow up after the meeting to show ongoing care.

## 7. Quick Communication Framework — “The 3Cs” {#three-cs}
Use this simple model from research-based communication practices:
• Connect: Start with warmth (“I appreciate how supportive you’ve been about homework.”)
• Communicate: Share clear, factual observations (“Lately, she seems quieter in class.”)
• Collaborate: End with a plan (“Let’s both encourage her to speak up more—how does that sound?”)

## 8. Building Long-Term Family Partnerships {#family-partnerships}
• Host informal “coffee mornings” or open-class days ☕
• Send home “family activity challenges” (like reading together 10 mins/day)
• Celebrate small successes publicly (“Parent of the Month” shoutout)
• Encourage two-way communication — parents should feel heard, not lectured
💡 Consistent, caring contact builds trust that lasts all year.

## 9. How It Connects to Student Outcomes {#outcomes}
Strong parent–teacher relationships help:
• Students feel more secure and motivated at school 🧠
• Parents feel more confident supporting learning at home
• Teachers experience fewer classroom behavior issues
💡 Henderson & Mapp (2002) found that family–school partnerships are most effective when communication is consistent, respectful, and focused on learning.

## 10. Final Tip for Teachers {#final-tip}
Start small: one positive message, one helpful conversation each week.
Over time, these small connections build big bridges — between school, home, and student success. 🌉

## Disclaimer {#disclaimer}
⚠️ This guide provides general best practices for teachers and schools. Always follow your school’s communication and privacy policies when sharing student information.
`,
    author: "Education Communication Institute",
    tags: [
      "parent communication",
      "family engagement",
      "home-school partnerships",
      "teacher strategies",
      "education"
    ],
    difficulty: "Beginner"
  };

  // Related materials available in ResourcesPage reading materials
  const relatedMaterials: { title: string; path: string; iconBg: string }[] = [
    { title: "Professional Development for Teachers: SEL & Self-Care", path: "/teacher/resources/professional-development", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Suicide Prevention Guidelines — What Teachers Need to Know", path: "/teacher/resources/suicide-prevention", iconBg: "bg-red-100 dark:bg-red-900/30" },
    { title: "Social-Emotional Learning (SEL) Strategies for the Classroom", path: "/teacher/resources/sel-strategies", iconBg: "bg-green-100 dark:bg-green-900/30" },
    { title: "Positive Behavior Support (PBIS) in the Classroom", path: "/teacher/resources/pbis", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Recognizing Signs of Anxiety & Depression in Students", path: "/teacher/resources/anxiety-depression", iconBg: "bg-pink-100 dark:bg-pink-900/30" },
    { title: "Effective Parent–Teacher Communication", path: "/teacher/resources/parent-teacher-communication", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
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

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Tip
            </h4>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              Always start communications with positive observations before addressing areas for growth.
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
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
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


              {/* <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Share2 className="h-4 w-4" />
                Share
              </Button> */}
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Description Card */}
            <Card className="bg-muted/50 border-0 mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground">{resource.description}</p>
              </CardContent>
            </Card>

            {/* Main Content parsed into visual sections */}
            {(() => {
              // Split content into sections by anchored headings: ## Title {#id}
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
                          <li key={i}>{t.replace(/^•\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                    bufferList = [];
                  }
                };
                contentLines.forEach((l, idx) => {
                  const text = l.trim().replace(/<[^>]+>/g, '').trim();
                  if (!text) { flushList(); return; }
                  if (/^•\s+/.test(text)) { bufferList.push(text); return; }
                  flushList();
                  if (text.startsWith('💡')) {
                    blocks.push(
                      <div key={`callout-${idx}`} className="p-3 my-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 text-amber-800 dark:text-amber-200">
                        {text}
                      </div>
                    );
                    return;
                  }
                  blocks.push(
                    <p key={`p-${idx}`} className="leading-relaxed">
                      {text}
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
                    You now have valuable strategies to enhance your parent-teacher communication.
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

export default ParentTeacherCommunicationPage;
