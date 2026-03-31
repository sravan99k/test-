import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, Download, Search, Eye, FileText, Video, Users, Brain, Heart, 
  Shield, Clock, Star, ArrowRight, Sparkles, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReadingMaterial } from '@/types/teacher';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Glassmorphism card component
const GlassCard = ({ children, className = '' }) => (
  <motion.div 
    className={cn(
      'backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/20 shadow-lg',
      'transition-all duration-300 hover:shadow-xl hover:bg-white/80 dark:hover:bg-gray-800/80',
      className
    )}
    whileHover={{ y: -4 }}
  >
    {children}
  </motion.div>
);

// Section header component with icon
const SectionHeader = ({ icon: Icon, title, description, className = '' }) => (
  <motion.div 
    className={cn('mb-8 text-center', className)}
    variants={fadeIn}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mb-4">
      <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
    {description && (
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        {description}
      </p>
    )}
  </motion.div>
);

// Floating illustration component
const FloatingIllustration = ({ src, alt, className = '' }) => (
  <motion.div
    className={cn('relative', className)}
    animate={{
      y: [0, -15, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-auto max-w-xs mx-auto"
    />
  </motion.div>
);

// Parse markdown content into sections for better organization
const parseContentIntoSections = (content: string) => {
  if (!content) return [];
  const sections = [];
  const lines = content.split('\n');
  let currentSection = { title: '', content: [] };
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection.title) {
        sections.push({...currentSection, content: currentSection.content.join('\n')});
      }
      currentSection = { title: line.replace('## ', ''), content: [] };
    } else if (line.trim()) {
      currentSection.content.push(line);
    }
  }
  
  if (currentSection.title || currentSection.content.length > 0) {
    sections.push({...currentSection, content: currentSection.content.join('\n')});
  }
  
  return sections;
};

// Get appropriate icon for section
const getIconForSection = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('sel') || lowerTitle.includes('social-emotional')) 
    return <Brain className="w-6 h-6" />;
  if (lowerTitle.includes('self-care') || lowerTitle.includes('wellbeing')) 
    return <Heart className="w-6 h-6" />;
  if (lowerTitle.includes('practice') || lowerTitle.includes('technique')) 
    return <Sparkles className="w-6 h-6" />;
  if (lowerTitle.includes('classroom') || lowerTitle.includes('student')) 
    return <Users className="w-6 h-6" />;
  return <Star className="w-6 h-6" />;
};

// ReadingMaterial interface is now imported from @/types/teacher

// Reading materials data
const readingMaterials: ReadingMaterial[] = [
  {
    id: 1,
    title: "Professional Development for Teachers: SEL & Self-Care",
    category: "Teacher Wellbeing",
    readTime: "14 min",
    rating: 4.9,
    description: "Essential SEL training and self-care practices to support teacher wellbeing and create emotionally healthy classrooms.",
    type: "Guide",
    content: `# Professional Development for Teachers

## 1. Introduction to SEL for Teachers
Social-Emotional Learning (SEL) is the process through which we understand and manage emotions, set and achieve positive goals, feel and show empathy for others, establish and maintain positive relationships, and make responsible decisions.

### Why SEL Matters for Teachers:
- Reduces teacher burnout and stress
- Improves classroom management
- Enhances student-teacher relationships
- Creates a positive school climate

## 2. The 5 Core Competencies of SEL
1. **Self-Awareness**
   - Recognizing one's emotions and values
   - Accurate self-perception
   - Self-confidence and self-efficacy

2. **Self-Management**
   - Managing stress and emotions
   - Self-discipline and motivation
   - Goal-setting and organization

3. **Social Awareness**
   - Empathy and perspective-taking
   - Appreciating diversity
   - Understanding social norms

4. **Relationship Skills**
   - Communication and collaboration
   - Conflict resolution
   - Seeking and offering help

5. **Responsible Decision-Making**
   - Problem-solving
   - Ethical responsibility
   - Evaluating consequences

## 3. Self-Care Strategies for Teachers

### Physical Self-Care
- **Movement Breaks**: Take 2-3 minute movement breaks between classes
- **Hydration**: Keep a water bottle at your desk
- **Nutrition**: Pack healthy snacks for energy
- **Sleep**: Maintain a consistent sleep schedule

### Emotional Self-Care
- **Mindfulness**: Practice 5 minutes of mindfulness daily
- **Gratitude Journal**: Write 3 things you're grateful for each day
- **Set Boundaries**: Learn to say no when needed
- **Seek Support**: Connect with colleagues or a mentor

### Professional Self-Care
- **Prioritize Tasks**: Use the Eisenhower Matrix
- **Collaborate**: Share resources with colleagues
- **Professional Development**: Attend workshops and training
- **Reflect**: Keep a teaching journal

## 4. Building a Positive Classroom Culture

### Morning Meetings
- Start each day with a check-in
- Share daily intentions
- Practice gratitude

### Classroom Agreements
- Co-create with students
- Keep them positive and simple
- Regularly revisit and revise

### Mindful Transitions
- Use chimes or breathing exercises
- Provide clear transition signals
- Allow processing time

## 5. Managing Stress in the Moment

### STOP Technique
- **S**top what you're doing
- **T**ake a breath
- **O**bserve your thoughts and feelings
- **P**roceed mindfully

### 4-7-8 Breathing
1. Inhale for 4 seconds
2. Hold for 7 seconds
3. Exhale for 8 seconds
4. Repeat 3-4 times

### Grounding Exercise (5-4-3-2-1)
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

## 6. Recognizing Burnout Signs
- Feeling exhausted all the time
- Dreading going to work
- Feeling ineffective or unappreciated
- Increased irritability with students or colleagues
- Difficulty concentrating
- Physical symptoms (headaches, stomachaches)
- Neglecting self-care
- Negative self-talk ("I'm not doing enough")

💡 *Recognizing these signs early allows you to reset before burnout sets in.*

## 7. How SEL & Self-Care Work Together
- SEL skills help you recognize your own emotions and needs
- Self-care practices replenish your emotional reserves
- Together they create a sustainable teaching practice
- Modeling these skills benefits your students as well

## 8. Creating a Personal Self-Care Plan
1. **Assess**: Identify your stress triggers
2. **Plan**: Choose 2-3 strategies to try
3. **Implement**: Schedule them into your week
4. **Evaluate**: Reflect on what's working
5. **Adjust**: Modify as needed

## 9. Resources for Further Learning
- **Books**:
  - "The Burnout Cure" by Chase Mielke
  - "Onward" by Elena Aguilar
  - "The Courage to Teach" by Parker Palmer
- **Apps**:
  - Headspace (mindfulness)
  - Calm (meditation)
  - Reflectly (journaling)
- **Websites**:
  - CASEL.org
  - Edutopia.org
  - Greater Good in Education

## 10. Action Steps for This Week
1. Try one mindfulness practice (even 1 minute counts!)
2. Connect with a colleague about self-care
3. Schedule one small act of self-care each day
4. Notice your stress levels and what helps

Remember: Taking care of yourself isn't selfish—it's essential for being the best teacher you can be for your students. Start small, be consistent, and celebrate your progress!`,
    author: "Wellness Education Team",
    publishDate: "2024-10-01",
    tags: ["SEL", "Teacher Wellbeing", "Self-Care"],
    difficulty: "beginner"
  },
  {
    id: 2,
    title: "Effective Parent–Teacher Communication",
    category: "Classroom Management",
    readTime: "12 min",
    rating: 4.9,
    description: "Strategies for building strong, collaborative relationships with parents to support student success.",
    type: "Guide",
    content: `# Effective Parent–Teacher Communication

Stronger connections between teachers and parents create better learning, behavior, and emotional outcomes for students. This guide helps you build trust, share information clearly, and engage families as true partners in student success.

## 1. Why Parent–Teacher Communication Matters
Research shows that students do better academically and emotionally when parents and teachers work together.

According to Henderson & Mapp (2002), schools with strong family engagement see:
- Higher grades and test scores 📈
- Better attendance and homework completion
- Improved student motivation and behavior
- Greater parent trust in schools

💡 Communication isn't just about sharing updates—it's about building relationships.

## 2. Common Barriers to Communication
Understanding what gets in the way helps you plan better.
- Time constraints: Parents or teachers have busy schedules
- Language or cultural differences 🌏
- Negative past experiences with schools
- Different expectations between home and school
- Fear of being judged (especially for struggling parents)

💡 When communication feels supportive, parents are more likely to stay involved.

## 3. Principles of Effective Communication
Use these 3 simple principles to guide all interactions:

### Be Clear:
- Use simple, jargon-free language.
- Focus on the child's learning, not just problems.

### Be Positive:
- Start with what's going well before discussing challenges.
- Show appreciation for parents' efforts at home.

### Be Collaborative:
- Ask for input: "What works at home?"
- Share decisions — don't just inform.

💬 **Think partnership, not reporting.**

## 4. Everyday Communication Strategies for Teachers

### a. Regular Updates
- Send quick, positive notes or short messages once a week.
- Use platforms like ClassDojo, WhatsApp, or email for reminders and praise.
- Keep updates short and specific: "Riya did a great job explaining her math steps today!"

### b. Family-Friendly Language
- Avoid educational jargon (e.g., "differentiation," "scaffolding").
- Say instead: "We're giving extra help so every child can learn in their own way."

### c. Positive Phone Calls Home
- Don't only call when there's a problem. A quick positive call builds trust.
- 💡 "I just wanted to share that Arjun showed great teamwork today!"

### d. Parent–Teacher Meetings
**Before:**
- Gather examples of student work.
- Plan two positives for every concern.

**During:**
- Use active listening — let parents talk.
- End with an action plan ("We'll both check in next Friday").

**After:**
- Send a short thank-you note summarizing key points.

## 5. Culturally Responsive Communication
- Learn about your students' backgrounds—celebrate diversity.
- Offer translation support or bilingual materials when needed.
- Respect different family structures (e.g., guardians, grandparents).
- Schedule meetings flexibly to accommodate working parents.

💡 **Cultural understanding = stronger relationships.**

## 6. When Issues Arise
If there's a concern (e.g., behavior or learning difficulty):
- Stay calm and neutral — focus on the student's needs.
- Avoid blame — use "we" language: "How can we support him together?"
- Offer specific examples and possible solutions.
- Follow up after the meeting to show ongoing care.

## 7. Quick Communication Framework — "The 3Cs"
Use this simple model from research-based communication practices:

1. **Connect**: Start with warmth ("I appreciate how supportive you've been about homework.")
2. **Communicate**: Share clear, factual observations ("Lately, she seems quieter in class.")
3. **Collaborate**: End with a plan ("Let's both encourage her to speak up more—how does that sound?")

## 8. Building Long-Term Family Partnerships
- Host informal "coffee mornings" or open-class days ☕
- Send home "family activity challenges" (like reading together 10 mins/day)
- Celebrate small successes publicly ("Parent of the Month" shoutout)
- Encourage two-way communication — parents should feel heard, not lectured

💡 **Consistent, caring contact builds trust that lasts all year.**

## 9. How It Connects to Student Outcomes
Strong parent–teacher relationships help:
- Students feel more secure and motivated at school 🧠
- Parents feel more confident supporting learning at home
- Teachers experience fewer classroom behavior issues

Henderson & Mapp (2002) found that family–school partnerships are most effective when communication is consistent, respectful, and focused on learning.

## 10. Final Tip for Teachers
Start small: one positive message, one helpful conversation each week.
Over time, these small connections build big bridges — between school, home, and student success. 🌉

⚠️ **Disclaimer:**
This guide provides general best practices for teachers and schools. Always follow your school's communication and privacy policies when sharing student information.`,
    author: "Education Partnership Team",
    publishDate: "2024-09-20",
    tags: ["Communication", "Parent Engagement", "Classroom Management"],
    difficulty: "beginner"
  },
  {
    id: 3,
    title: "Positive Behavior Support (PBIS) in the Classroom",
    category: "Classroom Management",
    readTime: "10 min",
    rating: 4.8,
    description: "A practical guide to implementing Positive Behavioral Interventions and Supports in your classroom.",
    type: "Guide",
    content: `# Positive Behavior Support (PBIS) in the Classroom

Every classroom runs smoother when students know what's expected and feel supported. Positive Behavior Support (PBIS) is a research-based approach that focuses on teaching and rewarding good behavior instead of just punishing misbehavior.

## 1. What is PBIS?
PBIS stands for Positive Behavioral Interventions and Supports. It's a school-wide framework that helps create a positive, safe, and predictable learning environment.

💡 Instead of saying "Don't run!", PBIS teaches "Please walk safely in the hallway."

## 2. Why PBIS Works
- Encourages positive choices instead of focusing only on mistakes
- Reduces disruptive behavior and bullying
- Improves classroom climate and student-teacher relationships
- Research shows PBIS leads to better academics and stronger social skills

## 3. Core Principles of PBIS

### Teach Expectations Clearly
- Define 3–5 simple rules (e.g., "Be Respectful, Be Responsible, Be Safe").
- Model and practice them regularly.

### Acknowledge & Reward Positive Behavior
- Praise specific actions: "I like how you raised your hand before speaking."
- Use reward systems (stickers, points, or verbal recognition).

### Consistent Consequences
- Handle rule-breaking calmly and fairly.
- Focus on re-teaching the right behavior rather than punishing.

### Use Data & Observation
- Track patterns of misbehavior to see where extra support is needed.

## 4. Simple PBIS Strategies for Teachers

### Behavior Matrix 📝
Post a chart that shows what "Respect, Responsibility, Safety" look like in class, hallways, and playground.

### Praise Ratio 5:1 🙌
Give 5 positive comments for every correction.
Example: "Thank you for helping a classmate" vs. "Stop talking."

### Classroom Acknowledgements 🎉
Use tokens, stars, or group points for teamwork and good choices.

### Pre-Correcting 🔄
Before transitions, remind: "Remember, we walk quietly to the library."

### Restorative Conversations 💬
After misbehavior: "What happened? How can we fix it?" instead of only punishment.

## 5. Quick Classroom Examples
- Hallway → "Walk on the right side, hands by your sides."
- Group Work → "Take turns, listen respectfully."
- Test Time → "Keep voices off, encourage yourself with positive self-talk."

## 6. Research Insights (Simplified)
Schools using PBIS report lower suspension rates and better student outcomes (Bradshaw et al., 2010).
Consistent PBIS improves not only student behavior but also teacher satisfaction and classroom climate.

## 7. Tips for Teachers
- Start small: choose one routine (like lining up) and apply PBIS consistently.
- Be specific when praising: instead of "Good job," say "Thanks for helping your partner."
- Work with colleagues so students experience consistent expectations across the school.

## 8. Extra Support
- If a student continues struggling, provide Tier 2 supports (small groups, check-ins with staff).
- For serious cases, use Tier 3 supports (individual plans, counselor involvement).

## 9. Final Tip
PBIS is about catching students being good 🌟. When students feel recognized and supported, they are more likely to repeat positive behaviors and contribute to a respectful, safe classroom.

⚠️ **Disclaimer:** PBIS is a framework for classroom and school-wide behavior support. For students with persistent or severe behavior challenges, follow your school's referral procedures for additional interventions.`,
    author: "Classroom Management Team",
    publishDate: "2024-10-01",
    tags: ["PBIS", "Behavior Management", "Classroom Management"],
    difficulty: "beginner"
  },
  {
    id: 4,
    title: "Recognizing Signs of Anxiety & Depression in Students",
    category: "Mental Health",
    readTime: "15 min",
    rating: 5.0,
    description: "A comprehensive guide to identifying early signs of anxiety and depression in students and providing appropriate support.",
    type: "Guide",
    content: `# Recognizing Signs of Anxiety & Depression in Students

Supporting students' mental health starts with awareness. Many children and teens struggle silently with anxiety or depression, and teachers are often the first to notice changes. By recognizing early signs, you can make a big difference in their well-being and learning.

## 1. What Are Anxiety & Depression?

**Anxiety:** A strong feeling of worry or fear that doesn't go away, even when things seem fine.

**Depression:** More than just sadness. It's a long-lasting low mood, loss of interest, and difficulty coping with daily life.

💡 Both can affect attention, behavior, and school performance.

## 2. Common Signs Teachers May Notice

### Anxiety
- Constant worry about tests, grades, or friendships
- Restlessness (can't sit still, fidgeting)
- Physical complaints (stomachaches, headaches) with no clear medical reason
- Avoiding school, class presentations, or group work
- Over-perfectionism (erasing work repeatedly, afraid of mistakes)

### Depression
- Frequent sadness, irritability, or withdrawal from classmates
- Loss of interest in activities they used to enjoy (sports, art, games)
- Drop in academic performance
- Changes in sleep or eating (always tired, dozing in class)
- Expressions of hopelessness ("What's the point?", "I can't do anything right")

## 3. Why Early Recognition Matters
- Research shows early detection improves recovery and prevents worsening.
- Untreated anxiety/depression can impact grades, social skills, and long-term health.
- Teachers play a key role since students spend so much time in school.

## 4. Simple Classroom Strategies

### Create a Safe Environment
- Greet students warmly, encourage open conversations.
- Remind them mistakes are part of learning.

### Observe & Note Patterns
- Keep track if a student often looks upset, withdrawn, or overly nervous.
- Compare changes with their usual behavior.

### Offer Small Supports
- Allow short breaks for overwhelmed students.
- Pair them with a supportive peer for group tasks.

### Encourage Healthy Habits
- Promote movement breaks, mindfulness minutes, or journaling.
- Remind students about good sleep and balanced routines.

## 5. When to Seek Extra Help
Encourage professional support if:
- The student shows persistent sadness/worry for 2+ weeks.
- Anxiety/depression is affecting grades or daily functioning.
- The student talks about hopelessness or self-harm.

💡 In such cases, inform the school counselor, mental health team, or follow school protocols for referral.

## 6. Quick "Supportive Responses" Teachers Can Use
- Instead of: "Don't worry so much."\
  Try: "I can see you're worried. Let's take this one step at a time."

- Instead of: "Cheer up."\
  Try: "It seems like you're having a tough day. Want to take a short break or talk to me after class?"

## 7. Extra Support & Resources
- **Childline India (1098)** – 24/7 free helpline for children.
- **NIMHANS Helpline (080-46110007)** – mental health support.
- **School Counselor / Teacher Team** – first point of support within the school.

## 8. Key Research Insights
- Teachers can accurately spot early signs when trained (Reilly et al., 2014).
- Trauma-informed classrooms help reduce anxiety and depression symptoms (Cunningham, 2024).
- Mindfulness and SEL practices lower student stress and improve emotional health (Durlak et al., 2011; Jennings et al., 2017).

## 9. Final Tip for Teachers
Start with awareness—observe, listen, and respond with empathy. Small actions like checking in with a student or creating a calm classroom routine can make a huge difference in helping them feel safe and supported. 🌱`,
    author: "School Mental Health Team",
    publishDate: "2024-09-15",
    tags: ["Mental Health", "Anxiety", "Depression", "Student Support"],
    difficulty: "intermediate"
  },
  {
    id: 5,
    title: "Social-Emotional Learning (SEL) Strategies for the Classroom",
    category: "Classroom Management",
    readTime: "12 min",
    rating: 4.9,
    description: "Practical SEL strategies to help students manage emotions, build relationships, and make responsible decisions.",
    type: "Guide",
    content: `# Social-Emotional Learning (SEL) Strategies for the Classroom

SEL is about helping students understand and manage emotions, build positive relationships, make good decisions, and handle challenges effectively. When students learn these skills, they do better in school and in life.

## 1. What is SEL?
Social-Emotional Learning (SEL) teaches students how to:
- Recognize and manage emotions (self-awareness)
- Set and achieve goals (self-management)
- Show empathy for others (social awareness)
- Build positive relationships (relationship skills)
- Make responsible decisions (decision-making)

💡 Research shows that SEL improves academic outcomes, reduces behavior problems, and supports mental well-being.

## 2. Why SEL Matters
- Creates a safe, supportive classroom environment
- Helps reduce bullying, conflict, and stress
- Improves teamwork and communication
- Supports long-term success beyond academics

## 3. Everyday SEL Practices for Teachers

### Morning Check-In (5 Minutes)
- Ask: "How are you feeling today?"
- Students can use emojis, thumbs up/down, or a mood chart.

💡 Builds emotional awareness and teacher-student connection.

### Circle Time / Sharing Rounds
- Students take turns sharing one good thing or one challenge.

💡 Promotes empathy, listening, and trust.

### Role-Play Scenarios
- Practice handling conflicts or making kind choices through simple skits.

💡 Helps students practice real-life problem solving.

### Calm Corner / Reflection Space
- Create a quiet spot with stress toys, journals, or calming visuals.

💡 Gives students tools to manage emotions independently.

### Gratitude & Kindness Activities
- Encourage writing thank-you notes, kindness jars, or daily appreciation.

💡 Builds positive relationships and classroom culture.

## 4. Simple SEL Classroom Activities

### Feelings Thermometer 🌡️
Students point to how they're feeling (1 = calm, 5 = very upset).

### Mindful Minute 🧘
One minute of quiet breathing or stretching before a lesson.

### Compliment Chain 🤝
Each student gives a compliment to the next person.

### Problem-Solving Steps 🔄
Teach: "Stop → Think → Choose → Act."

## 5. When SEL is Most Helpful
- Before exams (to manage stress)
- During conflicts between students
- At the start or end of the school day
- When introducing teamwork or group projects

## 6. Research Insights (Simplified)
- Large-scale studies show SEL programs improve academics by 11% on average (Durlak et al., 2011).
- SEL reduces disruptive behavior and increases positive classroom climate (CASEL reports).
- Teachers also benefit: classrooms with SEL have lower stress and stronger relationships.

## 7. Tips for Teachers
- Integrate SEL into daily routines rather than one-time lessons.
- Use simple language for younger children:
  - Instead of "self-regulation," say: "Let's practice calming down."
- Model SEL skills—students learn more from your behavior than your words.

## 8. Extra Support
- If students struggle with emotions, encourage them to talk to a counselor.
- Use parent-teacher meetings to explain how SEL skills are being taught at school.

## 9. Final Tip
SEL is not an "extra subject"—it's a foundation for learning. 🌱 By teaching students how to manage emotions, connect with others, and solve problems, you prepare them not just for exams, but for life.

⚠️ **Disclaimer:** This guide is for general educational use. For students with ongoing behavioral or emotional challenges, involve school counselors or mental health professionals.`,
    author: "SEL Education Team",
    publishDate: "2024-10-02",
    tags: ["SEL", "Social-Emotional Learning", "Classroom Strategies"],
    difficulty: "beginner"
  },
  {
    id: 6,
    title: "Suicide Prevention Guidelines — What Teachers Need to Know",
    category: "Mental Health",
    readTime: "15 min",
    rating: 5.0,
    description: "Essential guidance for recognizing warning signs, responding to students in crisis, and following school protocols for suicide prevention.",
    type: "Guidelines",
    content: `# Suicide Prevention Guidelines — What Teachers Need to Know

Teachers are often the first adults to notice when a student is struggling. Knowing how to spot risk, respond safely, and follow school procedures can save lives. This guide gives clear, practical steps you can use in class and when you need to escalate concerns.

## 1. What this is about
Suicide prevention in schools means spotting warning signs early, responding with care, and connecting students to trained mental-health professionals. Teachers do not diagnose — they observe, listen, and refer.

## 2. Common warning signs teachers may notice
Watch for changes in a student's behavior, mood, or school functioning. One sign alone may not mean suicidal risk, but multiple signs or sudden changes are important.

- Talk or writing about death, dying, or "not being here"
- Expressions of hopelessness ("It won't get better," "What's the point?")
- Withdrawal from friends, activities, or family
- Drop in grades or attendance; missing school often
- Giving away important things or preparing for absence
- Increased risk-taking or self-harm (cuts, burning)
- Sudden calmness after a period of depression (can mean a plan is in place)

💡 **Trust your judgment.** If you're worried, take action — don't wait.

## 3. Immediate steps if a student is at risk (what to do right now)

### Stay calm and ensure safety
- Move to a quiet, private place if possible. Don't leave the student alone if risk appears immediate.

### Ask directly, kindly, and non-judgmentally
- Use simple language: "I've noticed you seem very down. Are you thinking about hurting yourself or ending your life?"
- Asking directly does not increase risk — it opens the door.

### Listen and acknowledge
- Let them speak. Use empathetic phrases: "That sounds really hard," "I'm glad you told me."
- Avoid minimizing: don't say "You'll be fine" or "Others have it worse."

### Take any threat seriously
- If they say they have a plan or means (e.g., pills, weapon), treat as imminent risk.

### Do not promise secrecy
- Say: "I want to help you and keep you safe. I will need to tell the counselor so we can get you support."

### Follow school protocol immediately
- Contact the designated staff (school counselor, nurse, principal) and follow emergency procedures.
- If there is immediate danger, call emergency services (local ambulance/police) per school policy.

## 4. Who to involve and how (referral steps)
- **School counselor / psychologist** — first line for assessment.
- **Designated safeguarding officer** — for mandatory reporting and documentation.
- **Parents / guardians** — usually need to be informed unless doing so would increase risk (follow school policy).
- **Emergency services / crisis team** — if there is imminent danger or a plan with means.

📝 **Document** what you observed (facts only: what you saw, said, and did), the time, and who you contacted.

## 5. What to say — quick safe scripts for teachers
- "I'm worried about you because you haven't been yourself lately. Can we talk for a few minutes?"
- "Thank you for telling me. I want to help keep you safe. I will get the counselor to support you now."
- If they say 'yes' to thinking about suicide: "Thank you for telling me. You're not alone — we will get you help right now."

❌ **Avoid saying:** "You're just seeking attention," or "You'll get over it."

## 6. After the immediate event — classroom & follow-up
- Keep things calm in class: maintain routines to help other students feel safe.
- Coordinate with counselor: the counselor will decide next steps (assessment, parent contact, safety plan).
- Respect privacy: share only with staff who need to know. Avoid gossip.
- Support reintegration: if the student returns after crisis care, help them rejoin with reduced pressure and check-ins.

## 7. Prevention in everyday classroom practice
- Teach coping skills (mindfulness, problem-solving) and encourage help-seeking.
- Normalize talking about feelings and mental health in age-appropriate ways.
- Build strong teacher-student relationships—students who feel seen are more likely to ask for help.
- Use schoolwide prevention programs and align with PBIS and SEL efforts.

## 8. Documentation & legal/ethical notes
- Record only factual observations (what was said/done, dates, times).
- Follow your school's reporting and confidentiality policies.
- Be aware of mandatory reporting rules in your region for child safety.

## 9. Research insight (simple)
- Teachers play a key role in school-based suicide prevention: they are often the first to notice warning signs and can connect students to help.
- School toolkits (e.g., RHIhub Suicide Prevention Toolkit) offer practical steps for policies, staff training, and student support.
- These sources recommend clear protocols, staff training, and timely referrals as best practice.

## 10. Quick reference: When to act immediately
Act immediately (call emergency services or follow crisis protocol) if a student:
- Has a concrete plan and means (method/item).
- Is imminently dangerous to themself or others.
- Expresses intent and imminence (e.g., "I am going to do it tonight").

## 11. Final tip for teachers
If you feel uncertain, err on the side of safety. Reach out to your counselor or safeguarding lead — it's better to be cautious than miss a chance to help. Your calm, prompt action can make a life-saving difference.

⚠️ **Disclaimer:** This is a practical school guide for teachers. It is not clinical advice. Always follow your school's mental health, safeguarding, and emergency procedures. If a student is in immediate danger, call local emergency services right away.`,
    author: "School Mental Health Team",
    publishDate: "2024-09-15",
    tags: ["Suicide Prevention", "Mental Health", "Crisis Response", "Student Safety"],
    difficulty: "intermediate"
  }
];

const ResourcesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white pb-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            
            <h1 className="mt-2 text-bold text-gray-900">
              Access teaching materials, guides, and professional development resources
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReadingMaterialsTab />
      </div>
    </div>
  );
};

export default ResourcesPage;

const ReadingMaterialsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<ReadingMaterial | null>(null);
  const navigate = useNavigate();

  const filteredMaterials = readingMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mental Health': return <Heart className="h-4 w-4" />;
      case 'Wellbeing': return <Brain className="h-4 w-4" />;
      case 'Emergency': return <Shield className="h-4 w-4" />;
      case 'Teaching Strategy': return <BookOpen className="h-4 w-4" />;
      case 'Communication': return <Users className="h-4 w-4" />;
      case 'Teacher Wellbeing': return <Heart className="h-4 w-4" />;
      case 'Classroom Management': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="h-4 w-4" />;
      case 'Guide': return <BookOpen className="h-4 w-4" />;
      case 'Article': return <FileText className="h-4 w-4" />;
      case 'Protocol': return <Shield className="h-4 w-4" />;
      case 'Guidelines': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // difficulty styling removed (field no longer shown)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Mental Health': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Wellbeing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Emergency': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Teaching Strategy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Communication': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'Teacher Wellbeing': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Classroom Management': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };


  return (
    <div className="space-y-6">

      {/* Reading Materials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" id="teacher-tour-resources-grid">
        {filteredMaterials.map((material) => {
          // Mapping of resource titles to their image filenames
          const resourceImages: Record<string, string> = {
            'Professional Development for Teachers: SEL & Self-Care': 'Professional Development for Teachers self care.webp',
            'Effective Parent–Teacher Communication': 'Effective Parent Teacher Communication.webp',
            'Positive Behavior Support (PBIS) in the Classroom': 'Positive Behavior Support (PBIS) in the Classroom.webp',
            'Recognizing Signs of Anxiety & Depression in Students': 'Recognizing Signs of Anxiety & Depression in Students.webp',
            'Social-Emotional Learning (SEL) Strategies for the Classroom': 'Social-Emotional Learning (SEL) Strategies for the Classroom.webp',
            'Suicide Prevention Guidelines — What Teachers Need to Know': 'Suicide Prevention Guidelines  What Teachers Need to Know.webp'
          };

          // Get illustration based on resource
          const getIllustration = (item: ReadingMaterial): JSX.Element => {
            const imageName = resourceImages[item.title];
            
            if (imageName) {
              const imagePath = `/Teacher resources images/${imageName}`;
              
              return (
                <div className="relative w-full h-40">
                  <img 
                    src={imagePath}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-600 dark:to-gray-700">
                            <div class="text-center p-2">
                              <div class="text-xs text-gray-500">Image not found:</div>
                              <div class="text-sm font-medium text-gray-600 dark:text-gray-300">${imageName}</div>
                            </div>
                          </div>`;
                      }
                    }}
                  />
                </div>
              );
            }
            
            // Fallback for resources without a specific image
            return (
              <div key={item.id} className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-600 dark:to-gray-700">
                <span className="text-sm font-medium text-center text-gray-600 dark:text-gray-300 px-2">
                  {item.category}
                </span>
              </div>
            );
          };
          
          return (
            <Card key={material.id} className="h-full w-full max-w-xs mx-auto flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-100 hover:shadow-md transition-all">
              {/* Illustration Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 w-full h-40">
                {getIllustration(material)}
              </div>
              <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className={`${getCategoryColor(material.category)} border-0 text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wide`}
                >
                  {getCategoryIcon(material.category)}
                  {material.category}
                </Badge>
              </div>

              <CardTitle className="text-base font-heading font-semibold mb-1.5 line-clamp-2 text-slate-900 dark:text-white tracking-tight leading-snug">
                {material.title}
              </CardTitle>

              <CardDescription className="text-xs text-slate-500 dark:text-gray-300 mb-3 line-clamp-3 leading-relaxed font-medium">
                {material.description}
              </CardDescription>

              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Define the mapping of resource titles to their routes
                      const resourceRoutes = {
                        'Professional Development for Teachers: SEL & Self-Care': '/teacher/resources/professional-development',
                        'Effective Parent–Teacher Communication': '/teacher/resources/parent-teacher-communication',
                        'Suicide Prevention Guidelines — What Teachers Need to Know': '/teacher/resources/suicide-prevention',
                        'Social-Emotional Learning (SEL) Strategies for the Classroom': '/teacher/resources/sel-strategies',
                        'Positive Behavior Support (PBIS) in the Classroom': '/teacher/resources/pbis',
                        'Recognizing Signs of Anxiety & Depression in Students': '/teacher/resources/anxiety-depression'
                      };

                      // If the material has a dedicated page, navigate to it
                      const route = resourceRoutes[material.title as keyof typeof resourceRoutes];
                      if (route) {
                        navigate(route);
                      } else {
                        // Otherwise, open the material in a dialog
                        setSelectedMaterial(material);
                      }
                    }}
                    className="flex-1 h-8 text-xs font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:border-blue-700 dark:hover:text-blue-300 p-0 transition-colors duration-200"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View
                  </Button>

                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Reading Material Dialog */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMaterial && getTypeIcon(selectedMaterial.type)}
              {selectedMaterial?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {selectedMaterial.author}</span>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{selectedMaterial.content}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// FAQ Component for Teacher Resources
export const FAQTab = () => {
  const [openByCategory, setOpenByCategory] = useState<Record<string, number | null>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleAccordion = (category: string, index: number) => {
    setOpenByCategory(prev => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }));
  };

  interface FAQItem {
    question: string;
    answer: string;
    category: string;
  }

  const faqData: FAQItem[] = [
    {
      question: 'How do I navigate the teacher dashboard?',
      answer: 'The teacher dashboard is organized into several sections: Dashboard (overview), Students, Resources, Assessments, and Reports. Use the sidebar menu to navigate between these sections. The main content area will update based on your selection.',
      category: 'General Platform Usage'
    },
    {
      question: 'How can I track individual student progress?',
      answer: 'Navigate to the "Students" section and click on a specific student\'s name. You\'ll see their detailed progress, including completed assignments, assessment scores, and participation metrics.',
      category: 'Student Management'
    },
    {
      question: 'What should I do if a student is having trouble accessing resources?',
      answer: 'First, verify the student\'s login credentials. If they can log in but can\'t access specific resources, check the resource permissions. If issues persist, contact technical support with the student\'s details and the specific resource they\'re trying to access.',
      category: 'Student Management'
    },
    {
      question: 'How do I create and assign assessments?',
      answer: 'Go to the "Assessments" section and click "Create New Assessment." Follow the wizard to set up questions, time limits, and grading criteria. Once created, you can assign it to specific classes or individual students.',
      category: 'Assessments & Grading'
    },
    {
      question: 'Can I customize assessment criteria?',
      answer: 'Yes, when creating or editing an assessment, you can customize the grading rubric, point values, and evaluation criteria to match your specific teaching objectives.',
      category: 'Assessments & Grading'
    },
    {
      question: 'How do I track and record student grades?',
      answer: 'The "Grades" tab in the Assessments section provides a comprehensive gradebook where you can view, edit, and export student grades. You can also generate progress reports from this section.',
      category: 'Assessments & Grading'
    },
    {
      question: 'What should I do if a resource won\'t load?',
      answer: 'First, try refreshing the page and clearing your browser cache. If the issue persists, check your internet connection. If the problem continues, note the resource name and any error messages, then report the issue to technical support.',
      category: 'Technical Support'
    },
    {
      question: 'How do I report a technical issue?',
      answer: 'Click the "Help" button in the bottom right corner and select "Report an Issue." Please include detailed information about the problem, any error messages, and steps to reproduce the issue.',
      category: 'Technical Support'
    },
    {
      question: 'Who should I contact for immediate assistance?',
      answer: 'For urgent issues during school hours, contact the IT helpdesk at it-support@school.edu or call (555) 123-4567. For non-urgent matters, please use the support ticket system.',
      category: 'Technical Support'
    },
    {
      question: 'How can I effectively use these resources in my lessons?',
      answer: 'Resources are designed to be flexible. You can use them as-is or adapt them to fit your teaching style. Look for the "Implementation Tips" section in each resource for specific suggestions on classroom integration.',
      category: 'Best Practices'
    },
    {
      question: 'Are there recommended ways to track student engagement?',
      answer: 'The platform provides engagement metrics in the Analytics section. Additionally, you can use the built-in participation tracking features during live lessons and review completion rates for assigned materials.',
      category: 'Best Practices'
    },
    {
      question: 'Are there training sessions available for new features?',
      answer: 'Yes, we offer monthly webinars and in-person training sessions. Check the "Professional Development" section for upcoming events. Recordings of past sessions are also available.',
      category: 'Training & Professional Development'
    },
    {
      question: 'How can I provide feedback on resources?',
      answer: 'We value your input! Each resource has a feedback button where you can rate it and leave comments. You can also email resources@school.edu with your suggestions.',
      category: 'Training & Professional Development'
    },
    {
      question: 'Where can I find additional teaching resources?',
      answer: 'In addition to the resources section, check out the "Community" tab where teachers share their own materials. You can also find curated external resources in the "Recommended" section.',
      category: 'Training & Professional Development'
    }
  ];

  const categoryAccent: Record<string, { icon: string; headerBg: string; tagColor: string }> = {
    'Student Management': { icon: '', headerBg: 'bg-amber-50 dark:bg-amber-900/20', tagColor: 'text-amber-700 dark:text-amber-300' },
    'Assessments & Grading': { icon: '', headerBg: 'bg-blue-50 dark:bg-blue-900/20', tagColor: 'text-blue-700 dark:text-blue-300' },
    'Technical Support': { icon: '', headerBg: 'bg-rose-50 dark:bg-rose-900/20', tagColor: 'text-rose-700 dark:text-rose-300' },
    'Best Practices': { icon: '', headerBg: 'bg-green-50 dark:bg-green-900/20', tagColor: 'text-green-700 dark:text-green-300' },
    'Training & Professional Development': { icon: '', headerBg: 'bg-blue-50 dark:bg-blue-900/20', tagColor: 'text-blue-700 dark:text-blue-300' },
    'General Platform Usage': { icon: '', headerBg: 'bg-slate-50 dark:bg-slate-900/20', tagColor: 'text-slate-700 dark:text-slate-300' },
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, 'ig'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">{part}</mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  const filteredFAQs = searchTerm
    ? faqData.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqData;

  const categories = [...new Set(faqData.map((item) => item.category))];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FAQs</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Find answers to common questions about using the teacher dashboard and resources
            </p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-96">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search FAQs..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {searchTerm ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Search results for "{searchTerm}"
            </h2>
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={`${faq.category}-${index}`}
                    className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {highlight(faq.question, searchTerm)}
                      </h3>
                      <div className="mt-2 text-gray-600 dark:text-gray-300">
                        {highlight(faq.answer, searchTerm)}
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryFAQs = faqData.filter((faq) => faq.category === category);
              const accent = categoryAccent[category] || {
                icon: '',
                headerBg: 'bg-gray-50 dark:bg-gray-800',
                tagColor: 'text-gray-700 dark:text-gray-300',
              };

              return (
                <div key={category} className="space-y-4">
                  <div className={`${accent.headerBg} p-4 rounded-lg`}>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {categoryFAQs.map((faq, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                      >
                        <button
                          className="w-full px-4 py-3 text-left focus:outline-none"
                          onClick={() => toggleAccordion(category, index)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-400 transition-transform ${
                                openByCategory[category] === index ? 'transform rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>
                        {openByCategory[category] === index && (
                          <div className="px-4 pb-4 pt-2 text-gray-600 dark:text-gray-300">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};