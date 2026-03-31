import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Star, Download, Search, Filter, Eye, FileText, Video, Users, Brain, Heart, Shield } from "lucide-react";

interface ReadingMaterial {
  id: number;
  title: string;
  category: string;
  readTime: string;
  rating: number;
  description: string;
  type: string;
  content: string;
  author: string;
  publishDate: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const ReadingMaterialPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState<ReadingMaterial | null>(null);

  const readingMaterials: ReadingMaterial[] = [
    {
      id: 1,
      title: "Understanding Student Anxiety",
      category: "Mental Health",
      readTime: "15 min",
      rating: 4.8,
      description: "Comprehensive guide on identifying and supporting students with anxiety disorders.",
      type: "Guide",
      content: `# Understanding Student Anxiety

## Introduction
Student anxiety has become increasingly prevalent in today's educational environment. This comprehensive guide will help you identify, understand, and support students experiencing anxiety.

## Signs and Symptoms
### Physical Signs
- Restlessness or fidgeting
- Fatigue
- Difficulty concentrating
- Muscle tension
- Sleep disturbances

### Emotional Signs
- Excessive worry
- Irritability
- Fear of failure
- Avoidance behaviors
- Perfectionism

### Academic Signs
- Decline in performance
- Procrastination
- Difficulty participating in class
- Test anxiety
- Frequent absences

## Supporting Students with Anxiety
### Classroom Strategies
1. **Create a Safe Environment**: Establish clear routines and expectations
2. **Offer Choices**: Allow students some control over their learning
3. **Break Tasks Down**: Divide large assignments into manageable chunks
4. **Use Positive Reinforcement**: Acknowledge effort and progress
5. **Teach Coping Strategies**: Introduce breathing exercises and mindfulness

### Communication Techniques
- Listen without judgment
- Validate their feelings
- Use calm, reassuring language
- Avoid minimizing their concerns
- Collaborate on solutions

## When to Seek Additional Help
Contact school counselors or mental health professionals when:
- Anxiety significantly impacts academic performance
- Student expresses hopelessness
- Physical symptoms persist
- Family dynamics are affected
- Self-harm is mentioned or suspected

## Resources for Further Learning
- National Association of School Psychologists
- Anxiety and Depression Association of America
- Child Mind Institute resources`,
      author: "Dr. Sarah Chen",
      publishDate: "2024-01-15",
      tags: ["anxiety", "mental health", "classroom management", "student support"],
      difficulty: "intermediate" as const
    },
    {
      id: 2,
      title: "Building Classroom Resilience",
      category: "Wellbeing",
      readTime: "20 min",
      rating: 4.9,
      description: "Strategies for creating a supportive classroom environment that promotes resilience.",
      type: "Article",
      content: `# Building Classroom Resilience

## What is Resilience?
Resilience is the ability to bounce back from challenges, adapt to change, and grow stronger through adversity. In the classroom, resilient students are better equipped to handle academic stress, social challenges, and life's inevitable setbacks.

## The Resilient Classroom Framework

### 1. Emotional Safety
Creating an environment where students feel safe to express emotions and take risks:
- Establish clear behavioral expectations
- Model emotional regulation
- Address conflicts constructively
- Celebrate mistakes as learning opportunities

### 2. Positive Relationships
Building strong connections between teacher and students:
- Learn students' names and interests
- Show genuine care and concern
- Provide regular positive feedback
- Create opportunities for peer bonding

### 3. Growth Mindset Culture
Fostering belief that abilities can be developed:
- Praise effort over ability
- Teach about brain plasticity
- Emphasize learning from failures
- Set challenging but achievable goals

## Practical Strategies

### Daily Practices
- Morning check-ins with students
- Gratitude journaling
- Mindfulness moments
- Peer appreciation activities

### Crisis Response
- Have a calm-down corner
- Teach self-regulation techniques
- Provide choices during difficult moments
- Follow up after conflicts

### Building Community
- Class meetings
- Collaborative projects
- Service learning opportunities
- Celebrating diversity

## Measuring Resilience
Track progress through:
- Student self-assessments
- Behavioral observations
- Academic performance
- Peer relationships
- Parent feedback

Remember: Building resilience is a gradual process that requires consistency, patience, and genuine care for each student's wellbeing.`,
      author: "Maria Rodriguez",
      publishDate: "2024-01-12",
      tags: ["resilience", "classroom management", "emotional learning", "positive environment"],
      difficulty: "beginner" as const
    },
    {
      id: 3,
      title: "Engagement Through Mindfulness",
      category: "Teaching Strategy",
      readTime: "12 min",
      rating: 4.7,
      description: "How to incorporate mindfulness practices into daily classroom routines.",
      type: "Research",
      content: `# Engagement Through Mindfulness

## Research Background
Studies show that mindfulness practices in schools can improve attention, emotional regulation, and academic performance. This guide provides evidence-based strategies for integration.

## Quick Mindfulness Techniques

### 2-Minute Breathing Exercise
1. Have students sit comfortably
2. Close eyes or soften gaze
3. Focus on breath for 2 minutes
4. Notice when mind wanders, gently return to breath

### Body Scan for Focus
- Start at the top of the head
- Notice sensations moving down the body
- Helps students reconnect with themselves
- Great for transitions between subjects

### Mindful Listening
- Ring a bell or chime
- Students listen until sound completely fades
- Develops attention and presence
- Can be used before tests or presentations

## Integration Strategies

### Daily Routines
- Morning mindfulness moment
- Pre-lesson centering
- Transition breathing
- End-of-day reflection

### Subject Integration
- Mindful reading (noticing comprehension)
- Math with awareness (checking work mindfully)
- Science observation exercises
- Art as meditation

## Benefits Observed
- Improved focus and attention
- Better emotional regulation
- Reduced classroom disruptions
- Enhanced empathy and kindness
- Lower stress levels

## Getting Started
1. Start with yourself - practice mindfulness
2. Begin with short 1-2 minute exercises
3. Be consistent with timing
4. Make it optional, not forced
5. Model the practice yourself`,
      author: "Dr. James Kim",
      publishDate: "2024-01-08",
      tags: ["mindfulness", "attention", "emotional regulation", "classroom practices"],
      difficulty: "beginner" as const
    },
    {
      id: 4,
      title: "Crisis Intervention Protocols",
      category: "Emergency",
      readTime: "25 min",
      rating: 4.9,
      description: "Step-by-step procedures for handling student crisis situations effectively.",
      type: "Protocol",
      content: `# Crisis Intervention Protocols

## Immediate Response Framework

### Step 1: Assess the Situation
- Ensure immediate safety of all students
- Identify the type of crisis (behavioral, emotional, medical)
- Determine if emergency services are needed
- Remove other students if necessary

### Step 2: De-escalation Techniques
- Remain calm and composed
- Use a low, steady voice
- Give the student space
- Avoid arguing or reasoning during crisis
- Listen without judgment

### Step 3: Support and Stabilize
- Provide reassurance
- Help student regain control
- Use grounding techniques
- Stay with student until help arrives

## Types of Crises

### Emotional Crisis
- Signs: Crying, panic, extreme distress
- Response: Provide comfort, validate feelings
- Follow-up: Contact counselor, parents

### Behavioral Crisis
- Signs: Aggression, defiance, destructive behavior
- Response: Set clear boundaries, ensure safety
- Follow-up: Document incident, behavior plan review

### Mental Health Crisis
- Signs: Self-harm, suicidal ideation, psychosis
- Response: Never leave student alone, contact crisis team
- Follow-up: Professional intervention required

## Communication Protocols

### Immediate Notifications
1. School administrator
2. School counselor/psychologist
3. Parents/guardians
4. Emergency services (if needed)

### Documentation Requirements
- Date and time of incident
- Detailed description of events
- Actions taken
- People involved/notified
- Follow-up plans

## Post-Crisis Support
- Debrief with student when calm
- Plan for re-entry to classroom
- Monitor for ongoing concerns
- Provide additional resources
- Schedule follow-up meetings

## Self-Care for Educators
Crisis situations can be traumatic for teachers too:
- Seek support from colleagues
- Use employee assistance programs
- Practice stress management
- Debrief with administrators
- Consider professional counseling`,
      author: "Crisis Response Team",
      publishDate: "2024-01-20",
      tags: ["crisis", "emergency", "safety", "protocols", "intervention"],
      difficulty: "advanced" as const
    },
    {
      id: 5,
      title: "Parent Communication Guide",
      category: "Communication",
      readTime: "18 min",
      rating: 4.6,
      description: "Best practices for discussing student wellbeing concerns with parents.",
      type: "Guide",
      content: `# Parent Communication Guide

## Establishing Positive Relationships

### Initial Contact
- Introduce yourself early in the year
- Share positive observations about their child
- Explain your communication style and preferences
- Provide multiple ways to reach you

### Building Trust
- Be consistent in communication
- Follow through on commitments
- Respect family values and culture
- Maintain confidentiality appropriately

## Discussing Concerns

### Preparation
- Gather specific examples and data
- Focus on observable behaviors
- Prepare potential solutions
- Choose appropriate timing and setting

### The Conversation
1. **Start Positive**: Begin with strengths
2. **Be Specific**: Use concrete examples
3. **Listen Actively**: Hear their perspective
4. **Collaborate**: Work together on solutions
5. **Plan Follow-up**: Set clear next steps

### Difficult Conversations
- Mental health concerns
- Behavioral issues
- Academic struggles
- Social challenges

## Communication Strategies

### Written Communication
- Clear, professional language
- Focus on facts, not interpretations
- Include positive aspects
- Suggest specific actions

### Phone Calls
- Schedule at convenient times
- Have notes prepared
- Allow time for questions
- Summarize agreements

### Face-to-Face Meetings
- Private, comfortable setting
- Include relevant staff if needed
- Take notes during meeting
- Provide written summary

## Cultural Sensitivity
- Understand family background
- Respect cultural differences
- Use interpreters when needed
- Adapt communication style

## Legal and Ethical Considerations
- Maintain student privacy
- Follow school policies
- Document important conversations
- Know when to involve administrators

## Sample Scripts and Templates
[Include examples of emails, conversation starters, and documentation forms]`,
      author: "Lisa Thompson",
      publishDate: "2024-01-05",
      tags: ["parent communication", "family engagement", "difficult conversations", "collaboration"],
      difficulty: "intermediate" as const
    },
    {
      id: 6,
      title: "Social-Emotional Learning Framework",
      category: "SEL",
      readTime: "30 min",
      rating: 4.8,
      description: "Complete framework for implementing SEL practices in your classroom.",
      type: "Framework",
      content: `# Social-Emotional Learning Framework

## The Five Core Competencies

### 1. Self-Awareness
The ability to recognize and understand one's emotions, thoughts, and values.
- Identifying emotions
- Accurate self-perception
- Recognizing strengths
- Self-confidence
- Self-efficacy

### 2. Self-Management
The ability to regulate emotions, thoughts, and behaviors effectively.
- Impulse control
- Stress management
- Self-discipline
- Self-motivation
- Goal setting

### 3. Social Awareness
The ability to understand others and empathize with diverse perspectives.
- Empathy
- Perspective-taking
- Diversity appreciation
- Respect for others
- Reading social cues

### 4. Relationship Skills
The ability to establish and maintain healthy relationships.
- Communication
- Active listening
- Cooperation
- Seeking help
- Conflict resolution

### 5. Responsible Decision-Making
The ability to make constructive choices about behavior and interactions.
- Problem identification
- Analyzing situations
- Solving problems
- Evaluating actions
- Ethical responsibility

## Implementation Strategies

### Explicit Instruction
- Dedicated SEL lessons
- Direct teaching of skills
- Practice opportunities
- Role-playing activities

### Integration Across Subjects
- Literature discussions about character emotions
- History lessons on perspective-taking
- Science collaboration projects
- Math problem-solving with persistence

### Classroom Environment
- Emotional check-ins
- Calm down corners
- Conflict resolution procedures
- Celebration of growth

## Assessment Methods
- Student self-reflection surveys
- Peer feedback
- Teacher observations
- Portfolio evidence
- Behavior tracking

## Age-Appropriate Adaptations
[Include specific strategies for different grade levels]

## Family and Community Connections
- Parent education workshops
- Home practice activities
- Community service projects
- Cultural responsiveness`,
      author: "SEL Consortium",
      publishDate: "2024-01-03",
      tags: ["social-emotional learning", "SEL", "competencies", "implementation", "assessment"],
      difficulty: "intermediate" as const
    }
  ];

  const filteredMaterials = readingMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Guide":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Research":
        return "bg-green-100 text-green-800 border-green-200";
      case "Protocol":
        return "bg-red-100 text-red-800 border-red-200";
      case "Article":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Framework":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Mental Health":
        return <Brain className="h-4 w-4" />;
      case "Wellbeing":
        return <Heart className="h-4 w-4" />;
      case "Teaching Strategy":
        return <BookOpen className="h-4 w-4" />;
      case "Emergency":
        return <Shield className="h-4 w-4" />;
      case "Communication":
        return <Users className="h-4 w-4" />;
      case "SEL":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reading Material</h1>
        <p className="text-muted-foreground">Curated wellbeing and guidance content for educators</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reading materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background min-w-[150px]"
            >
              <option value="all">All Categories</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Wellbeing">Wellbeing</option>
              <option value="Teaching Strategy">Teaching Strategy</option>
              <option value="Emergency">Emergency</option>
              <option value="Communication">Communication</option>
              <option value="SEL">SEL</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(material.category)}
                  <Badge className={`border ${getTypeColor(material.type)}`}>
                    {material.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(material.difficulty)} variant="outline">
                    {material.difficulty}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                    <span className="text-sm font-medium">{material.rating}</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">{material.title}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>By {material.author}</span>
                <span>•</span>
                <span>{material.publishDate}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {material.description}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {material.readTime} read
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {material.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {material.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{material.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedMaterial(material)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Read
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reading Material Detail Modal */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMaterial && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold mb-2">
                      {selectedMaterial.title}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {selectedMaterial.author}</span>
                      <span>•</span>
                      <span>{selectedMaterial.publishDate}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedMaterial.readTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`border ${getTypeColor(selectedMaterial.type)}`}>
                        {selectedMaterial.type}
                      </Badge>
                      <Badge className={getDifficultyColor(selectedMaterial.difficulty)} variant="outline">
                        {selectedMaterial.difficulty}
                      </Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                        <span className="text-sm font-medium">{selectedMaterial.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Content */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMaterial.content}
                  </div>
                </div>

                {/* Tags */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">


                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReadingMaterialPage;