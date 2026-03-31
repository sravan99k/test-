import { EmpathyScenario } from './types';

export const schoolScenarios: EmpathyScenario[] = [
  {
  id: 81,
  category: "School",
  title: "Friend Forgot Homework",
  situation: "Your friend looks upset because they forgot to bring their homework.",
  emotion: { icon: "😟", label: "Worried" },
  responses: [
    {
      text: "That’s tough. Want me to help you talk to the teacher?",
      feedback: "Supportive and proactive.",
      type: "best"
    },
    {
      text: "Not my problem.",
      feedback: "Uncaring and dismissive.",
      type: "poor"
    },
    {
      text: "You should have remembered it.",
      feedback: "Critical and unhelpful.",
      type: "neutral"
    },
    {
      text: "Maybe explain what happened honestly — teachers understand sometimes.",
      feedback: "Helpful and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "That’s tough. Want me to help you talk to the teacher?",
  correctExplanation: "Empathy means helping others manage their mistakes calmly.",
  tip: "Kind words can calm a worried friend."
},
{
  id: 82,
  category: "School",
  title: "New Student in Class",
  situation: "A new student sits alone during lunch, looking shy.",
  emotion: { icon: "🙂", label: "Nervous" },
  responses: [
    {
      text: "Hey, want to sit with us?",
      feedback: "Welcoming and confident.",
      type: "best"
    },
    {
      text: "They’ll find friends eventually.",
      feedback: "Avoidant and cold.",
      type: "poor"
    },
    {
      text: "Smile at them but don’t say anything.",
      feedback: "Friendly but distant.",
      type: "neutral"
    },
    {
      text: "Introduce yourself and ask about their hobbies.",
      feedback: "Warm and engaging.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, want to sit with us?",
  correctExplanation: "Empathy includes taking the first step toward inclusion.",
  tip: "Everyone feels shy on their first day."
},
{
  id: 83,
  category: "School",
  title: "Classmate Made a Mistake in Presentation",
  situation: "A classmate forgets their lines during a presentation, and everyone giggles.",
  emotion: { icon: "😳", label: "Embarrassed" },
  responses: [
    {
      text: "Give them a small smile of support.",
      feedback: "Nonverbal encouragement — powerful empathy.",
      type: "best"
    },
    {
      text: "Laugh along with others.",
      feedback: "Hurtful and insensitive.",
      type: "poor"
    },
    {
      text: "Just look away and stay quiet.",
      feedback: "Neutral but not helpful.",
      type: "neutral"
    },
    {
      text: "Whisper something like ‘You got this!’",
      feedback: "Kind and encouraging.",
      type: "good"
    }
  ],
  correctAnswer: "Give them a small smile of support.",
  correctExplanation: "Empathy can be shown through simple supportive actions.",
  tip: "A little kindness during embarrassment goes a long way."
},
{
  id: 84,
  category: "School",
  title: "Group Project Disagreement",
  situation: "Your group can’t agree on how to present your project.",
  emotion: { icon: "😤", label: "Frustrated" },
  responses: [
    {
      text: "Let’s hear everyone’s idea first before we decide.",
      feedback: "Encourages fairness and listening.",
      type: "best"
    },
    {
      text: "We’re doing it my way.",
      feedback: "Bossy and uncooperative.",
      type: "poor"
    },
    {
      text: "Whatever, do what you want.",
      feedback: "Gives up, not constructive.",
      type: "neutral"
    },
    {
      text: "Can we mix the best parts of our ideas?",
      feedback: "Collaborative and flexible.",
      type: "good"
    }
  ],
  correctAnswer: "Let’s hear everyone’s idea first before we decide.",
  correctExplanation: "Empathy means giving equal voice to others.",
  tip: "Good teamwork starts with good listening."
},
{
  id: 85,
  category: "School",
  title: "Friend Didn’t Make the Team",
  situation: "Your best friend didn’t get selected for the sports team, and they look sad.",
  emotion: { icon: "😞", label: "Disappointed" },
  responses: [
    {
      text: "I know that hurts. You worked really hard — maybe next time!",
      feedback: "Validates their feelings with encouragement.",
      type: "best"
    },
    {
      text: "At least I made it!",
      feedback: "Insensitive and boastful.",
      type: "poor"
    },
    {
      text: "You’ll be fine; it’s just a team.",
      feedback: "Dismissive and shallow.",
      type: "neutral"
    },
    {
      text: "Let’s go practice together for next tryouts.",
      feedback: "Supportive action with empathy.",
      type: "good"
    }
  ],
  correctAnswer: "I know that hurts. You worked really hard — maybe next time!",
  correctExplanation: "Empathy acknowledges emotion before fixing it.",
  tip: "Comfort first, solutions second."
},
{
  id: 86,
  category: "School",
  title: "Someone Forgot Their Lunch",
  situation: "A classmate realizes they forgot their lunch and looks upset.",
  emotion: { icon: "🥪", label: "Hungry" },
  responses: [
    {
      text: "Want to share some of mine?",
      feedback: "Generous and caring.",
      type: "best"
    },
    {
      text: "You should pack better next time.",
      feedback: "Critical and unkind.",
      type: "poor"
    },
    {
      text: "Ask the teacher if they can help.",
      feedback: "Helpful suggestion but distant.",
      type: "good"
    },
    {
      text: "Stay quiet; it’s not your issue.",
      feedback: "Avoids empathy completely.",
      type: "neutral"
    }
  ],
  correctAnswer: "Want to share some of mine?",
  correctExplanation: "Empathy acts, not just speaks.",
  tip: "Sharing small things builds big friendships."
},
{
  id: 87,
  category: "School",
  title: "Classmate Is Being Teased",
  situation: "You notice a classmate being teased for their accent.",
  emotion: { icon: "😢", label: "Hurt" },
  responses: [
    {
      text: "Hey, that’s not cool — everyone deserves respect.",
      feedback: "Courageous and kind.",
      type: "best"
    },
    {
      text: "Ignore it; it’s not your problem.",
      feedback: "Avoids standing up for others.",
      type: "poor"
    },
    {
      text: "Tell the teacher quietly after class.",
      feedback: "Responsible and thoughtful.",
      type: "good"
    },
    {
      text: "Laugh nervously so you don’t get picked on.",
      feedback: "Avoidant, not empathetic.",
      type: "neutral"
    }
  ],
  correctAnswer: "Hey, that’s not cool — everyone deserves respect.",
  correctExplanation: "Empathy means protecting others from unfair treatment.",
  tip: "Standing up kindly makes you a true friend."
},
{
  id: 88,
  category: "School",
  title: "Teacher Made a Mistake",
  situation: "Your teacher accidentally wrote the wrong date on the board.",
  emotion: { icon: "🧑‍🏫", label: "Unaware" },
  responses: [
    {
      text: "Excuse me, I think the date might be one day off.",
      feedback: "Respectful and polite correction.",
      type: "best"
    },
    {
      text: "Laugh and whisper about it with friends.",
      feedback: "Disrespectful and immature.",
      type: "poor"
    },
    {
      text: "Say nothing — someone else will fix it.",
      feedback: "Avoids speaking up.",
      type: "neutral"
    },
    {
      text: "Raise your hand and point it out kindly.",
      feedback: "Considerate and confident.",
      type: "good"
    }
  ],
  correctAnswer: "Excuse me, I think the date might be one day off.",
  correctExplanation: "Empathy respects teachers while being honest.",
  tip: "Respect and politeness go hand in hand."
},
{
  id: 89,
  category: "School",
  title: "Friend Forgot a Pencil",
  situation: "Your friend looks for a pencil but can’t find one before class starts.",
  emotion: { icon: "✏️", label: "Unprepared" },
  responses: [
    {
      text: "Here, take one of mine.",
      feedback: "Simple, thoughtful act.",
      type: "best"
    },
    {
      text: "Too bad, I only have one.",
      feedback: "Selfish and unkind.",
      type: "poor"
    },
    {
      text: "You always forget things.",
      feedback: "Critical tone.",
      type: "neutral"
    },
    {
      text: "Remind me tomorrow, I’ll bring an extra.",
      feedback: "Future-focused and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "Here, take one of mine.",
  correctExplanation: "Empathy is often shown in small daily gestures.",
  tip: "Sharing builds trust easily."
},
{
  id: 90,
  category: "School",
  title: "Classmate Dropped Books",
  situation: "A student dropped their books in the hallway while others walk past.",
  emotion: { icon: "📚", label: "Embarrassed" },
  responses: [
    {
      text: "Let me help you pick those up.",
      feedback: "Quick and kind action.",
      type: "best"
    },
    {
      text: "Keep walking — someone else will help.",
      feedback: "Avoidant and cold.",
      type: "poor"
    },
    {
      text: "Watch where you’re going!",
      feedback: "Rude and blaming.",
      type: "neutral"
    },
    {
      text: "Smile and help pick one or two books.",
      feedback: "Supportive and friendly.",
      type: "good"
    }
  ],
  correctAnswer: "Let me help you pick those up.",
  correctExplanation: "Empathy responds quickly when someone needs help.",
  tip: "A few seconds of kindness can change someone’s day."
},
{
  id: 91,
  category: "School",
  title: "Group Member Forgot Their Part",
  situation: "During a class project, your teammate forgot to bring their part of the work.",
  emotion: { icon: "😬", label: "Embarrassed" },
  responses: [
    {
      text: "It’s okay, let’s figure out how to fix it together.",
      feedback: "Supportive and solution-focused.",
      type: "best"
    },
    {
      text: "Great, now we’ll lose marks because of you!",
      feedback: "Blaming and harsh.",
      type: "poor"
    },
    {
      text: "You can tell the teacher yourself.",
      feedback: "Cold and detached.",
      type: "neutral"
    },
    {
      text: "Don’t worry, maybe we can explain it honestly to the teacher.",
      feedback: "Kind and responsible.",
      type: "good"
    }
  ],
  correctAnswer: "It’s okay, let’s figure out how to fix it together.",
  correctExplanation: "Empathy helps teammates recover instead of blame.",
  tip: "Team success matters more than mistakes."
},
{
  id: 92,
  category: "School",
  title: "Teacher Gave Unexpected Homework",
  situation: "Your teacher adds extra homework at the end of the day, and everyone groans.",
  emotion: { icon: "😩", label: "Tired" },
  responses: [
    {
      text: "It’s a lot, but we’ll get through it together.",
      feedback: "Positive and motivating.",
      type: "best"
    },
    {
      text: "This is so unfair!",
      feedback: "Negative and unhelpful.",
      type: "poor"
    },
    {
      text: "Just do it later and hope for the best.",
      feedback: "Avoids responsibility.",
      type: "neutral"
    },
    {
      text: "Let’s plan how to divide the work and study smarter.",
      feedback: "Encouraging teamwork and strategy.",
      type: "good"
    }
  ],
  correctAnswer: "It’s a lot, but we’ll get through it together.",
  correctExplanation: "Empathy motivates others instead of complaining.",
  tip: "Positivity helps everyone handle stress better."
},
{
  id: 93,
  category: "School",
  title: "Classmate Scored Lower Than Expected",
  situation: "A friend looks sad after getting a lower grade than they hoped.",
  emotion: { icon: "😞", label: "Disappointed" },
  responses: [
    {
      text: "That must feel frustrating. Want to study together next time?",
      feedback: "Caring and supportive.",
      type: "best"
    },
    {
      text: "You should’ve studied harder.",
      feedback: "Judgmental and insensitive.",
      type: "poor"
    },
    {
      text: "It’s just one test, don’t worry.",
      feedback: "Minimizes their feelings.",
      type: "neutral"
    },
    {
      text: "You’ll bounce back — I’ve seen how hard you try.",
      feedback: "Encouraging and kind.",
      type: "good"
    }
  ],
  correctAnswer: "That must feel frustrating. Want to study together next time?",
  correctExplanation: "Empathy listens and offers help, not fixes.",
  tip: "Sometimes your support matters more than advice."
},
{
  id: 94,
  category: "School",
  title: "You Notice a Classmate Eating Alone",
  situation: "At lunch, a classmate is sitting by themselves quietly.",
  emotion: { icon: "🥺", label: "Lonely" },
  responses: [
    {
      text: "Hey, want to join us?",
      feedback: "Friendly and inclusive.",
      type: "best"
    },
    {
      text: "Maybe they like sitting alone.",
      feedback: "Assumes without asking.",
      type: "neutral"
    },
    {
      text: "They probably have no friends.",
      feedback: "Judgmental and unkind.",
      type: "poor"
    },
    {
      text: "Smile and wave first, then invite them later.",
      feedback: "Warm and considerate.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, want to join us?",
  correctExplanation: "Empathy builds belonging through small invitations.",
  tip: "Inclusion always starts with one person."
},
{
  id: 95,
  category: "School",
  title: "Classmate Forgot Their Lines in a Play",
  situation: "During a school play rehearsal, your classmate freezes on stage.",
  emotion: { icon: "😳", label: "Nervous" },
  responses: [
    {
      text: "You got this! Keep going, we’re right here!",
      feedback: "Encouraging and uplifting.",
      type: "best"
    },
    {
      text: "Come on, hurry up!",
      feedback: "Rude and impatient.",
      type: "poor"
    },
    {
      text: "Look away awkwardly.",
      feedback: "Avoids offering support.",
      type: "neutral"
    },
    {
      text: "Give them a thumbs-up from the side.",
      feedback: "Small, kind gesture.",
      type: "good"
    }
  ],
  correctAnswer: "You got this! Keep going, we’re right here!",
  correctExplanation: "Empathy gives courage when others freeze.",
  tip: "A few supportive words can calm fear fast."
},
{
  id: 96,
  category: "School",
  title: "Friend Is Late to Class",
  situation: "Your friend rushes in late and looks anxious.",
  emotion: { icon: "⌛", label: "Stressed" },
  responses: [
    {
      text: "You okay? Want me to share the notes you missed?",
      feedback: "Caring and proactive.",
      type: "best"
    },
    {
      text: "You’re always late.",
      feedback: "Critical and impatient.",
      type: "poor"
    },
    {
      text: "Just pretend it didn’t happen.",
      feedback: "Avoids addressing feelings.",
      type: "neutral"
    },
    {
      text: "It’s fine, the teacher just started.",
      feedback: "Reassuring and calm.",
      type: "good"
    }
  ],
  correctAnswer: "You okay? Want me to share the notes you missed?",
  correctExplanation: "Empathy helps people recover from small mistakes.",
  tip: "Care shows best through small actions."
},
{
  id: 97,
  category: "School",
  title: "Classmate Spilled Water",
  situation: "A student accidentally spills water all over their desk and looks embarrassed.",
  emotion: { icon: "😳", label: "Embarrassed" },
  responses: [
    {
      text: "It’s okay — here, take some tissues.",
      feedback: "Helpful and reassuring.",
      type: "best"
    },
    {
      text: "Nice job, now the floor’s wet!",
      feedback: "Sarcastic and unkind.",
      type: "poor"
    },
    {
      text: "Ignore it so they can clean up alone.",
      feedback: "Neutral but not helpful.",
      type: "neutral"
    },
    {
      text: "Help them clean and smile.",
      feedback: "Kind and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "It’s okay — here, take some tissues.",
  correctExplanation: "Empathy helps people feel less embarrassed fast.",
  tip: "Quick help stops embarrassment from growing."
},
{
  id: 98,
  category: "School",
  title: "You See a Student Crying in the Hall",
  situation: "Someone you don’t know is crying quietly near the lockers.",
  emotion: { icon: "😢", label: "Sad" },
  responses: [
    {
      text: "Hey, are you okay? Do you want me to get someone?",
      feedback: "Caring and safe approach.",
      type: "best"
    },
    {
      text: "Just walk past and pretend not to see.",
      feedback: "Avoids empathy completely.",
      type: "poor"
    },
    {
      text: "Tell a teacher there’s a student upset in the hallway.",
      feedback: "Helpful but distant.",
      type: "good"
    },
    {
      text: "Glance and move on quietly.",
      feedback: "Passive observation.",
      type: "neutral"
    }
  ],
  correctAnswer: "Hey, are you okay? Do you want me to get someone?",
  correctExplanation: "Empathy includes helping safely, even for strangers.",
  tip: "Kindness to strangers matters too."
},
{
  id: 99,
  category: "School",
  title: "Classmate Forgot Their Notes",
  situation: "A friend forgot their notes for the group study session.",
  emotion: { icon: "🤦‍♀️", label: "Forgetful" },
  responses: [
    {
      text: "No worries, I can share mine with you.",
      feedback: "Helpful and cooperative.",
      type: "best"
    },
    {
      text: "You always forget things like this!",
      feedback: "Critical and negative.",
      type: "poor"
    },
    {
      text: "That’s fine, you can just listen this time.",
      feedback: "Understanding but passive.",
      type: "neutral"
    },
    {
      text: "I’ll email you the summary later.",
      feedback: "Kind and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "No worries, I can share mine with you.",
  correctExplanation: "Empathy means helping even when it’s a small inconvenience.",
  tip: "Helping once can inspire others to help too."
},
{
  id: 100,
  category: "School",
  title: "Teacher Praised Someone Else",
  situation: "Your teacher praised another student for work similar to yours, but not you.",
  emotion: { icon: "😕", label: "Left Out" },
  responses: [
    {
      text: "I’m glad they got praised. I’ll keep improving too.",
      feedback: "Humble and optimistic.",
      type: "best"
    },
    {
      text: "That’s so unfair!",
      feedback: "Jealous and resentful.",
      type: "poor"
    },
    {
      text: "Whatever, I don’t care.",
      feedback: "Avoids feelings.",
      type: "neutral"
    },
    {
      text: "I’ll ask for feedback to know what to do better next time.",
      feedback: "Proactive and curious.",
      type: "good"
    }
  ],
  correctAnswer: "I’m glad they got praised. I’ll keep improving too.",
  correctExplanation: "Empathy celebrates others’ wins without comparison.",
  tip: "Kind confidence grows stronger over time."
},
  {
  id: 101,
  category: "School",
  title: "Friend Didn’t Get Picked for a Role",
  situation: "Your friend wanted a big role in the school play but didn’t get chosen.",
  emotion: { icon: "😔", label: "Disappointed" },
  responses: [
    {
      text: "I know that hurts. Want to help me with my part instead?",
      feedback: "Supportive and encouraging.",
      type: "best"
    },
    {
      text: "At least you tried.",
      feedback: "Neutral, but not comforting.",
      type: "neutral"
    },
    {
      text: "You probably weren’t loud enough.",
      feedback: "Critical and discouraging.",
      type: "poor"
    },
    {
      text: "You’re still really talented — next time could be yours.",
      feedback: "Optimistic and kind.",
      type: "good"
    }
  ],
  correctAnswer: "I know that hurts. Want to help me with my part instead?",
  correctExplanation: "Empathy offers inclusion and purpose after disappointment.",
  tip: "Sharing roles builds connection."
},
{
  id: 102,
  category: "School",
  title: "Student Made a Mess in Art Class",
  situation: "A student accidentally spills paint on the table, looking embarrassed.",
  emotion: { icon: "🎨", label: "Embarrassed" },
  responses: [
    {
      text: "Don’t worry, it happens. Let’s clean it together.",
      feedback: "Helpful and reassuring.",
      type: "best"
    },
    {
      text: "That’s so clumsy!",
      feedback: "Judgmental and mean.",
      type: "poor"
    },
    {
      text: "Stay quiet so no one notices.",
      feedback: "Avoidant and unhelpful.",
      type: "neutral"
    },
    {
      text: "Grab a cloth and help them clean it up.",
      feedback: "Kind and action-focused.",
      type: "good"
    }
  ],
  correctAnswer: "Don’t worry, it happens. Let’s clean it together.",
  correctExplanation: "Empathy helps others recover from small mistakes.",
  tip: "Embarrassment shrinks when someone helps."
},
{
  id: 103,
  category: "School",
  title: "Friend Looks Upset After Class",
  situation: "Your friend looks down and quiet after a class discussion.",
  emotion: { icon: "😞", label: "Upset" },
  responses: [
    {
      text: "You seem upset. Want to talk about it?",
      feedback: "Caring and open-ended.",
      type: "best"
    },
    {
      text: "You’re always moody lately.",
      feedback: "Critical and insensitive.",
      type: "poor"
    },
    {
      text: "Just leave them alone.",
      feedback: "Avoids connection.",
      type: "neutral"
    },
    {
      text: "I noticed you were quiet — you okay?",
      feedback: "Gentle and observant.",
      type: "good"
    }
  ],
  correctAnswer: "You seem upset. Want to talk about it?",
  correctExplanation: "Empathy notices changes and checks in kindly.",
  tip: "Curiosity about others’ feelings builds trust."
},
{
  id: 104,
  category: "School",
  title: "Classmate Is New to a Group Project",
  situation: "A new student joins your project group and looks unsure what to do.",
  emotion: { icon: "🫣", label: "Shy" },
  responses: [
    {
      text: "Hey, we’re working on this part — want to take this section?",
      feedback: "Inclusive and practical.",
      type: "best"
    },
    {
      text: "You’ll figure it out later.",
      feedback: "Dismissive and cold.",
      type: "poor"
    },
    {
      text: "Let someone else explain it.",
      feedback: "Avoids helping directly.",
      type: "neutral"
    },
    {
      text: "I can catch you up if you want.",
      feedback: "Friendly and helpful.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, we’re working on this part — want to take this section?",
  correctExplanation: "Empathy means helping others feel included right away.",
  tip: "Inclusion makes teamwork stronger."
},
{
  id: 105,
  category: "School",
  title: "Friend Is Nervous Before an Exam",
  situation: "Your friend looks anxious right before a big test.",
  emotion: { icon: "😰", label: "Nervous" },
  responses: [
    {
      text: "Take a deep breath — you studied well, you’ve got this.",
      feedback: "Reassuring and calm.",
      type: "best"
    },
    {
      text: "Same, I’m totally going to fail too!",
      feedback: "Increases stress instead of easing it.",
      type: "poor"
    },
    {
      text: "Don’t worry about it.",
      feedback: "Minimizes their feelings.",
      type: "neutral"
    },
    {
      text: "Let’s review one question quickly together.",
      feedback: "Helpful and encouraging.",
      type: "good"
    }
  ],
  correctAnswer: "Take a deep breath — you studied well, you’ve got this.",
  correctExplanation: "Empathy helps reduce anxiety through reassurance.",
  tip: "Confidence grows when shared calmly."
},
{
  id: 106,
  category: "School",
  title: "Friend Didn’t Understand the Lesson",
  situation: "Your friend looks confused during class but doesn’t ask questions.",
  emotion: { icon: "🤔", label: "Confused" },
  responses: [
    {
      text: "Want me to explain that part after class?",
      feedback: "Caring and proactive.",
      type: "best"
    },
    {
      text: "You should’ve paid attention.",
      feedback: "Critical and rude.",
      type: "poor"
    },
    {
      text: "Just read the notes later.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Ask the teacher again — I’ll wait with you.",
      feedback: "Encouraging and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "Want me to explain that part after class?",
  correctExplanation: "Empathy supports learning without judgment.",
  tip: "Helping others learn also strengthens your understanding."
},
{
  id: 107,
  category: "School",
  title: "Group Member Dominates Discussion",
  situation: "In a group project, one student keeps talking and won’t let others speak.",
  emotion: { icon: "😤", label: "Frustrated" },
  responses: [
    {
      text: "Can we all take turns sharing our thoughts?",
      feedback: "Fair and assertive.",
      type: "best"
    },
    {
      text: "You talk too much!",
      feedback: "Harsh and confrontational.",
      type: "poor"
    },
    {
      text: "Stay quiet and let it happen.",
      feedback: "Avoids fairness.",
      type: "neutral"
    },
    {
      text: "Let’s hear what others think too.",
      feedback: "Kind and inclusive.",
      type: "good"
    }
  ],
  correctAnswer: "Can we all take turns sharing our thoughts?",
  correctExplanation: "Empathy means keeping balance without conflict.",
  tip: "Fair communication builds better teams."
},
{
  id: 108,
  category: "School",
  title: "Classmate Made a Joke That Hurt Someone",
  situation: "You see someone make a ‘funny’ comment that hurts another student.",
  emotion: { icon: "😠", label: "Hurt" },
  responses: [
    {
      text: "That wasn’t cool — jokes shouldn’t make people feel bad.",
      feedback: "Brave and empathetic.",
      type: "best"
    },
    {
      text: "It was just a joke, relax.",
      feedback: "Dismisses others’ feelings.",
      type: "poor"
    },
    {
      text: "Say nothing to avoid attention.",
      feedback: "Neutral but silent.",
      type: "neutral"
    },
    {
      text: "Talk to the person privately later and check if they’re okay.",
      feedback: "Quiet empathy, good alternative.",
      type: "good"
    }
  ],
  correctAnswer: "That wasn’t cool — jokes shouldn’t make people feel bad.",
  correctExplanation: "Empathy protects others’ dignity even when it’s awkward.",
  tip: "Kindness is courage in action."
},
{
  id: 109,
  category: "School",
  title: "Teammate Messed Up During Sports",
  situation: "A teammate missed an easy shot and looks disappointed.",
  emotion: { icon: "😓", label: "Embarrassed" },
  responses: [
    {
      text: "Shake it off — we’ll get the next one together!",
      feedback: "Positive and encouraging.",
      type: "best"
    },
    {
      text: "Nice job missing again!",
      feedback: "Mocking and mean.",
      type: "poor"
    },
    {
      text: "Stay silent and move on.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "It happens to everyone — don’t stress it.",
      feedback: "Supportive and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Shake it off — we’ll get the next one together!",
  correctExplanation: "Empathy motivates others to keep trying after mistakes.",
  tip: "Encouragement fuels teamwork."
},
{
  id: 110,
  category: "School",
  title: "Friend Forgot to Bring Money for Lunch",
  situation: "Your friend realizes they forgot lunch money and looks embarrassed.",
  emotion: { icon: "💰", label: "Embarrassed" },
  responses: [
    {
      text: "I can share some of mine, don’t worry.",
      feedback: "Generous and kind.",
      type: "best"
    },
    {
      text: "Guess you’re not eating today!",
      feedback: "Cruel and mocking.",
      type: "poor"
    },
    {
      text: "Ask the teacher if they can help.",
      feedback: "Helpful but distant.",
      type: "good"
    },
    {
      text: "Just skip lunch, it's not a big deal.",
      feedback: "Dismissive and unhelpful.",
      type: "neutral"
    }
  ],
  correctAnswer: "I can share some of mine, don't worry.",
  correctExplanation: "Empathy helps reduce shame with kindness.",
  tip: "Small generosity creates big warmth."
},
{
  id: 111,
  category: "School",
  title: "Friend Failed a Test",
  situation: "Your friend looks really upset after getting a failing grade.",
  emotion: { icon: "😢", label: "Upset" },
  responses: [
    {
      text: "I’m sorry that happened. Want me to help you review next time?",
      feedback: "Caring and supportive.",
      type: "best"
    },
    {
      text: "That’s not my problem.",
      feedback: "Cold and dismissive.",
      type: "poor"
    },
    {
      text: "You’ll get over it.",
      feedback: "Dismisses feelings.",
      type: "neutral"
    },
    {
      text: "You’ve got this next time — you’re smart.",
      feedback: "Encouraging and kind.",
      type: "good"
    }
  ],
  correctAnswer: "I’m sorry that happened. Want me to help you review next time?",
  correctExplanation: "Empathy offers real help instead of empty comfort.",
  tip: "Show support through action."
},
{
  id: 112,
  category: "School",
  title: "Friend Got in Trouble Unfairly",
  situation: "You see your friend being blamed for something they didn’t do.",
  emotion: { icon: "😠", label: "Frustrated" },
  responses: [
    {
      text: "That wasn’t them — I saw what really happened.",
      feedback: "Honest and brave.",
      type: "best"
    },
    {
      text: "Stay quiet so you don’t get involved.",
      feedback: "Avoids standing up for truth.",
      type: "poor"
    },
    {
      text: "Talk to them after and tell them it’s unfair.",
      feedback: "Supportive but delayed.",
      type: "good"
    },
    {
      text: "Ignore it — it’ll sort itself out.",
      feedback: "Passive and unhelpful.",
      type: "neutral"
    }
  ],
  correctAnswer: "That wasn’t them — I saw what really happened.",
  correctExplanation: "Empathy sometimes means speaking up for fairness.",
  tip: "Courage and kindness often go together."
},
{
  id: 113,
  category: "School",
  title: "Friend Didn’t Get Invited to a Party",
  situation: "Your friend feels hurt after finding out others were invited to a party but not them.",
  emotion: { icon: "🥺", label: "Left Out" },
  responses: [
    {
      text: "That must feel bad. Want to hang out this weekend instead?",
      feedback: "Comforting and kind.",
      type: "best"
    },
    {
      text: "Maybe they forgot to invite you.",
      feedback: "Neutral but uncertain.",
      type: "neutral"
    },
    {
      text: "You’re overreacting — it’s just a party.",
      feedback: "Insensitive and invalidating.",
      type: "poor"
    },
    {
      text: "You deserve to be invited — people miss out sometimes.",
      feedback: "Reassuring and empathetic.",
      type: "good"
    }
  ],
  correctAnswer: "That must feel bad. Want to hang out this weekend instead?",
  correctExplanation: "Empathy offers comfort *and* inclusion.",
  tip: "Turning rejection into connection helps heal feelings."
},
{
  id: 114,
  category: "School",
  title: "Group Project Unequal Effort",
  situation: "You did most of the work, but your teammates still got full credit.",
  emotion: { icon: "😤", label: "Annoyed" },
  responses: [
    {
      text: "I feel frustrated — can we talk about dividing tasks better next time?",
      feedback: "Honest and fair communication.",
      type: "best"
    },
    {
      text: "That’s so unfair! I’m done working with them.",
      feedback: "Angry but not constructive.",
      type: "poor"
    },
    {
      text: "Just forget it; not worth it.",
      feedback: "Avoids solving the issue.",
      type: "neutral"
    },
    {
      text: "Maybe next time we can make a clearer plan together.",
      feedback: "Reflective and calm.",
      type: "good"
    }
  ],
  correctAnswer: "I feel frustrated — can we talk about dividing tasks better next time?",
  correctExplanation: "Empathy includes expressing feelings without blame.",
  tip: "Speak up calmly — fairness starts with honesty."
},
{
  id: 115,
  category: "School",
  title: "Friend Forgot Their Presentation Notes",
  situation: "Right before their turn, your friend realizes they left their notes at home.",
  emotion: { icon: "😬", label: "Anxious" },
  responses: [
    {
      text: "You know your topic well — just talk through the main points. You’ve got this!",
      feedback: "Encouraging and confident.",
      type: "best"
    },
    {
      text: "That’s what happens when you’re careless.",
      feedback: "Critical and discouraging.",
      type: "poor"
    },
    {
      text: "Stay quiet and hope they figure it out.",
      feedback: "Avoidant and cold.",
      type: "neutral"
    },
    {
      text: "Want me to hold your slides and cue you?",
      feedback: "Helpful and kind.",
      type: "good"
    }
  ],
  correctAnswer: "You know your topic well — just talk through the main points. You’ve got this!",
  correctExplanation: "Empathy gives courage through encouragement.",
  tip: "Confidence can be contagious."
},
{
  id: 116,
  category: "School",
  title: "Friend Feels Overwhelmed with Homework",
  situation: "Your friend says they can’t handle all the assignments this week.",
  emotion: { icon: "😩", label: "Overwhelmed" },
  responses: [
    {
      text: "That sounds stressful. Want to plan a schedule together?",
      feedback: "Supportive and practical.",
      type: "best"
    },
    {
      text: "Same here — I’m drowning too.",
      feedback: "Shared frustration but no help.",
      type: "neutral"
    },
    {
      text: "Just do it faster.",
      feedback: "Dismissive and unrealistic.",
      type: "poor"
    },
    {
      text: "You can do it — maybe start with one subject at a time.",
      feedback: "Encouraging and solution-based.",
      type: "good"
    }
  ],
  correctAnswer: "That sounds stressful. Want to plan a schedule together?",
  correctExplanation: "Empathy helps others organize their stress constructively.",
  tip: "Practical help often feels like care."
},
{
  id: 117,
  category: "School",
  title: "Friend Did Better Than You",
  situation: "Your friend got a higher grade than you on a test.",
  emotion: { icon: "🙂", label: "Jealous" },
  responses: [
    {
      text: "Nice job! Maybe you can teach me that part I missed.",
      feedback: "Humble and friendly.",
      type: "best"
    },
    {
      text: "You just got lucky.",
      feedback: "Negative and dismissive.",
      type: "poor"
    },
    {
      text: "Cool, I’ll do better next time.",
      feedback: "Neutral but positive.",
      type: "neutral"
    },
    {
      text: "Congrats — that’s awesome!",
      feedback: "Kind and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "Nice job! Maybe you can teach me that part I missed.",
  correctExplanation: "Empathy celebrates others’ success without resentment.",
  tip: "Supportive friends learn together."
},
{
  id: 118,
  category: "School",
  title: "Teacher Scolded the Whole Class",
  situation: "The teacher scolded the entire class because of a few noisy students.",
  emotion: { icon: "😠", label: "Frustrated" },
  responses: [
    {
      text: "Let’s just stay calm — it’ll pass soon.",
      feedback: "Level-headed and calming.",
      type: "best"
    },
    {
      text: "Why are they blaming everyone?",
      feedback: "Frustrated but reactive.",
      type: "poor"
    },
    {
      text: "Complain quietly to a friend.",
      feedback: "Unhelpful venting.",
      type: "neutral"
    },
    {
      text: "Let’s make sure we’re quiet next time so it doesn’t happen again.",
      feedback: "Reflective and responsible.",
      type: "good"
    }
  ],
  correctAnswer: "Let’s just stay calm — it’ll pass soon.",
  correctExplanation: "Empathy keeps peace instead of adding frustration.",
  tip: "Calm reactions cool tense moments."
},
{
  id: 119,
  category: "School",
  title: "Student Lost Their Pen",
  situation: "Someone nearby drops their pen and looks around for it.",
  emotion: { icon: "🖊️", label: "Confused" },
  responses: [
    {
      text: "Here it is — I picked it up for you.",
      feedback: "Quick and kind help.",
      type: "best"
    },
    {
      text: "Not my problem.",
      feedback: "Cold and uncaring.",
      type: "poor"
    },
    {
      text: "Point at it silently.",
      feedback: "Helpful but distant.",
      type: "neutral"
    },
    {
      text: "Hand it to them with a smile.",
      feedback: "Polite and friendly.",
      type: "good"
    }
  ],
  correctAnswer: "Here it is — I picked it up for you.",
  correctExplanation: "Empathy is also about small daily actions.",
  tip: "Tiny kindnesses make school friendlier."
},
{
  id: 120,
  category: "School",
  title: "Classmate Is Nervous About Public Speaking",
  situation: "A student says they hate presenting in front of the class.",
  emotion: { icon: "😬", label: "Anxious" },
  responses: [
    {
      text: "You’ll do great — just imagine you’re talking to friends.",
      feedback: "Encouraging and positive.",
      type: "best"
    },
    {
      text: "Yeah, you’re probably going to mess up.",
      feedback: "Rude and discouraging.",
      type: "poor"
    },
    {
      text: "Stay quiet — it’s not your problem.",
      feedback: "Avoids empathy.",
      type: "neutral"
    },
    {
      text: "Want me to sit up front and smile while you talk?",
      feedback: "Supportive and kind.",
      type: "good"
    }
  ],
  correctAnswer: "You’ll do great — just imagine you’re talking to friends.",
  correctExplanation: "Empathy builds confidence by showing belief in others.",
  tip: "A friendly face can calm big fears."
}

];
