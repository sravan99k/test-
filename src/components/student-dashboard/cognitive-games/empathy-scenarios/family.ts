import { EmpathyScenario } from './types';

export const familyScenarios: EmpathyScenario[] = [
  {
  id: 41,
  category: "Family",
  title: "Sibling Took Your Stuff",
  situation: "Your younger sibling borrowed your headphones without asking.",
  emotion: { icon: "😠", label: "Annoyed" },
  responses: [
    {
      text: "Hey, please ask next time before you use my things, okay?",
      feedback: "Respectful and calm boundary-setting.",
      type: "best"
    },
    {
      text: "Why do you always touch my stuff!",
      feedback: "Expresses anger without solving anything.",
      type: "poor"
    },
    {
      text: "It’s fine, just don’t break them.",
      feedback: "Forgiving but vague.",
      type: "good"
    },
    {
      text: "Ignore it, it’s not worth talking about.",
      feedback: "Avoids the issue completely.",
      type: "neutral"
    }
  ],
  correctAnswer: "Hey, please ask next time before you use my things, okay?",
  correctExplanation: "Calm talk keeps respect while solving the problem.",
  tip: "Empathy means teaching kindly, not shouting."
},
{
  id: 42,
  category: "Family",
  title: "Parent Looks Stressed",
  situation: "Your parent is sitting quietly with a tired face after work.",
  emotion: { icon: "😩", label: "Tired" },
  responses: [
    {
      text: "You look tired. Want me to help with something?",
      feedback: "Caring and helpful — great empathy.",
      type: "best"
    },
    {
      text: "Can you drive me somewhere now?",
      feedback: "Ignores their state.",
      type: "poor"
    },
    {
      text: "Long day again?",
      feedback: "Shows awareness but no help.",
      type: "good"
    },
    {
      text: "Leave them alone; they’ll be fine.",
      feedback: "Avoids connection.",
      type: "neutral"
    }
  ],
  correctAnswer: "You look tired. Want me to help with something?",
  correctExplanation: "Empathy means noticing others’ effort and offering support.",
  tip: "Sometimes helping out says more than words."
},
{
  id: 43,
  category: "Family",
  title: "Argument Between Parents",
  situation: "You hear your parents arguing in another room and feel worried.",
  emotion: { icon: "😟", label: "Worried" },
  responses: [
    {
      text: "It’s okay to feel scared when people argue. Maybe talk to one of them later.",
      feedback: "Recognizes emotion and offers calm action.",
      type: "best"
    },
    {
      text: "Yell at them to stop.",
      feedback: "Adds tension instead of calm.",
      type: "poor"
    },
    {
      text: "Hide in your room until it’s quiet.",
      feedback: "Protects yourself but avoids communication.",
      type: "neutral"
    },
    {
      text: "Tell a trusted adult or counselor how you feel.",
      feedback: "Good step if the arguments are frequent.",
      type: "good"
    }
  ],
  correctAnswer: "It’s okay to feel scared when people argue. Maybe talk to one of them later.",
  correctExplanation: "Empathy includes caring for your own feelings safely.",
  tip: "When things feel heavy, talk to someone you trust."
},
{
  id: 44,
  category: "Family",
  title: "Grandparent Missed Your Call",
  situation: "Your grandparent didn’t answer your call and you feel disappointed.",
  emotion: { icon: "📞", label: "Disappointed" },
  responses: [
    {
      text: "Maybe they were busy or resting. I’ll try again later.",
      feedback: "Patient and understanding.",
      type: "best"
    },
    {
      text: "They never pick up!",
      feedback: "Frustrated and unfair.",
      type: "poor"
    },
    {
      text: "I’ll text them instead.",
      feedback: "Practical and flexible.",
      type: "good"
    },
    {
      text: "Forget it, I won’t bother again.",
      feedback: "Gives up too quickly.",
      type: "neutral"
    }
  ],
  correctAnswer: "Maybe they were busy or resting. I’ll try again later.",
  correctExplanation: "Empathy includes patience with older family members.",
  tip: "Assume the best; people may have reasons you don’t see."
},
{
  id: 45,
  category: "Family",
  title: "Sibling Got a Better Grade",
  situation: "Your younger brother scored higher than you on a test.",
  emotion: { icon: "😅", label: "Jealous" },
  responses: [
    {
      text: "Nice job! I’ll work harder next time too.",
      feedback: "Encouraging and self-aware.",
      type: "best"
    },
    {
      text: "You probably got lucky.",
      feedback: "Dismissive and jealous.",
      type: "poor"
    },
    {
      text: "That’s great for you.",
      feedback: "Polite but distant.",
      type: "neutral"
    },
    {
      text: "Good work! Maybe you can help me study later.",
      feedback: "Supportive and humble.",
      type: "good"
    }
  ],
  correctAnswer: "Nice job! I’ll work harder next time too.",
  correctExplanation: "Appreciating others’ success builds family harmony.",
  tip: "Empathy celebrates others, not compares."
},
{
  id: 46,
  category: "Family",
  title: "Parent Forgot a Promise",
  situation: "Your parent forgot to take you to the park like they said.",
  emotion: { icon: "😞", label: "Disappointed" },
  responses: [
    {
      text: "I was really looking forward to going. Can we plan another day?",
      feedback: "Honest and polite.",
      type: "best"
    },
    {
      text: "You always forget!",
      feedback: "Accusatory and unfair.",
      type: "poor"
    },
    {
      text: "It’s fine, I didn’t really care.",
      feedback: "Hides real feelings.",
      type: "neutral"
    },
    {
      text: "Maybe you were too busy; let’s find another time.",
      feedback: "Understanding and calm.",
      type: "good"
    }
  ],
  correctAnswer: "I was really looking forward to going. Can we plan another day?",
  correctExplanation: "Sharing feelings politely helps build understanding.",
  tip: "Empathy means being honest without blame."
},
{
  id: 47,
  category: "Family",
  title: "Sibling Broke Something",
  situation: "Your sibling accidentally broke your favorite mug and looks scared.",
  emotion: { icon: "😟", label: "Guilty" },
  responses: [
    {
      text: "It’s okay, accidents happen. Let’s clean it up together.",
      feedback: "Forgiving and helpful.",
      type: "best"
    },
    {
      text: "You’re always breaking things!",
      feedback: "Harsh and blaming.",
      type: "poor"
    },
    {
      text: "I’ll tell Mom.",
      feedback: "Adds fear rather than solving it.",
      type: "neutral"
    },
    {
      text: "Be careful next time, okay?",
      feedback: "Fair reminder but slightly critical.",
      type: "good"
    }
  ],
  correctAnswer: "It’s okay, accidents happen. Let’s clean it up together.",
  correctExplanation: "Responding calmly shows care and maturity.",
  tip: "Accidents are chances to show kindness."
},
{
  id: 48,
  category: "Family",
  title: "Parent Praised a Sibling More",
  situation: "Your parent complimented your sibling but didn’t mention your effort.",
  emotion: { icon: "😕", label: "Left Out" },
  responses: [
    {
      text: "I’m glad you’re proud of them. I worked hard too, though.",
      feedback: "Polite and self-expressive.",
      type: "best"
    },
    {
      text: "You never notice me!",
      feedback: "Emotional but accusatory.",
      type: "poor"
    },
    {
      text: "Whatever, I don’t care.",
      feedback: "Avoids feelings completely.",
      type: "neutral"
    },
    {
      text: "Nice for them, I guess.",
      feedback: "Flat and distant.",
      type: "good"
    }
  ],
  correctAnswer: "I’m glad you’re proud of them. I worked hard too, though.",
  correctExplanation: "Expressing needs calmly helps others understand you.",
  tip: "Empathy includes speaking up without anger."
},
{
  id: 49,
  category: "Family",
  title: "Parent Missed School Event",
  situation: "Your parent couldn’t come to your school play because of work.",
  emotion: { icon: "😔", label: "Sad" },
  responses: [
    {
      text: "I was sad you couldn’t come, but I know work’s important.",
      feedback: "Honest and compassionate.",
      type: "best"
    },
    {
      text: "You care more about work than me.",
      feedback: "Hurtful accusation.",
      type: "poor"
    },
    {
      text: "It’s fine, it wasn’t that fun.",
      feedback: "Hides disappointment.",
      type: "neutral"
    },
    {
      text: "Maybe next time you can make it.",
      feedback: "Hopeful and gentle.",
      type: "good"
    }
  ],
  correctAnswer: "I was sad you couldn’t come, but I know work’s important.",
  correctExplanation: "Balancing honesty and understanding shows maturity.",
  tip: "Empathy respects others’ challenges too."
},
{
  id: 50,
  category: "Family",
  title: "Sibling Wants to Join You",
  situation: "Your younger sibling asks to join you while you play with friends.",
  emotion: { icon: "🙂", label: "Hopeful" },
  responses: [
    {
      text: "Sure, come play! I’ll help you fit in.",
      feedback: "Kind and inclusive — great empathy.",
      type: "best"
    },
    {
      text: "No, you’ll embarrass me.",
      feedback: "Rejecting and unkind.",
      type: "poor"
    },
    {
      text: "Maybe later, we’re doing something else now.",
      feedback: "Gentle but not inclusive.",
      type: "neutral"
    },
    {
      text: "Ask first next time, but you can join now.",
      feedback: "Fair and flexible.",
      type: "good"
    }
  ],
  correctAnswer: "Sure, come play! I’ll help you fit in.",
  correctExplanation: "Empathy includes younger siblings in small ways.",
  tip: "Inclusion builds happy families."
},
{
  id: 51,
  category: "Family",
  title: "Parent Is Busy Cooking",
  situation: "Your parent is cooking dinner and you need help with homework.",
  emotion: { icon: "🍳", label: "Busy" },
  responses: [
    {
      text: "I see you’re busy. Can you help me after you finish?",
      feedback: "Polite and respectful of their time.",
      type: "best"
    },
    {
      text: "Come on, it’ll just take a minute!",
      feedback: "Interrupts without patience.",
      type: "poor"
    },
    {
      text: "I’ll wait until dinner’s done.",
      feedback: "Patient but could ask clearly.",
      type: "good"
    },
    {
      text: "Forget it, I’ll figure it out myself.",
      feedback: "Avoids asking for help at all.",
      type: "neutral"
    }
  ],
  correctAnswer: "I see you’re busy. Can you help me after you finish?",
  correctExplanation: "Respecting someone’s task shows empathy and good timing.",
  tip: "Notice when others are already doing something."
},
{
  id: 52,
  category: "Family",
  title: "Family Pet Made a Mess",
  situation: "Your dog chewed up a shoe, and your sibling is worried about getting in trouble.",
  emotion: { icon: "🐶", label: "Nervous" },
  responses: [
    {
      text: "Let’s clean it up before Mom sees. We’ll tell her together.",
      feedback: "Responsible and kind teamwork.",
      type: "best"
    },
    {
      text: "That’s your problem, not mine.",
      feedback: "Unhelpful and cold.",
      type: "poor"
    },
    {
      text: "We can hide it for now.",
      feedback: "Dishonest and risky.",
      type: "neutral"
    },
    {
      text: "It’s okay, mistakes happen. We’ll fix it.",
      feedback: "Supportive and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Let’s clean it up before Mom sees. We’ll tell her together.",
  correctExplanation: "Working together reduces fear and builds trust.",
  tip: "Empathy means helping even when it’s not your fault."
},
{
  id: 53,
  category: "Family",
  title: "Parent Is Sick",
  situation: "Your parent is lying in bed with a fever.",
  emotion: { icon: "🤒", label: "Unwell" },
  responses: [
    {
      text: "Can I bring you some water or medicine?",
      feedback: "Helpful and caring — perfect empathy.",
      type: "best"
    },
    {
      text: "Stay away so I don’t get sick.",
      feedback: "Shows fear, not empathy.",
      type: "poor"
    },
    {
      text: "Hope you get better soon.",
      feedback: "Nice but minimal action.",
      type: "good"
    },
    {
      text: "You’ll be fine by tomorrow.",
      feedback: "Dismisses how they feel.",
      type: "neutral"
    }
  ],
  correctAnswer: "Can I bring you some water or medicine?",
  correctExplanation: "Empathy means noticing needs and acting on them.",
  tip: "Small help makes a big difference at home."
},
{
  id: 54,
  category: "Family",
  title: "Family Dinner Argument",
  situation: "Your siblings start arguing loudly at the dinner table.",
  emotion: { icon: "😤", label: "Angry" },
  responses: [
    {
      text: "Let’s all calm down and eat first.",
      feedback: "Tries to restore peace.",
      type: "best"
    },
    {
      text: "I’ll just leave; this is annoying.",
      feedback: "Avoids the problem.",
      type: "neutral"
    },
    {
      text: "Stop fighting! You’re ruining dinner!",
      feedback: "Adds more shouting.",
      type: "poor"
    },
    {
      text: "Hey, let’s change the topic for a bit.",
      feedback: "Redirects tension smoothly.",
      type: "good"
    }
  ],
  correctAnswer: "Let’s all calm down and eat first.",
  correctExplanation: "Staying calm helps others calm down too.",
  tip: "Empathy keeps the mood steady when tempers rise."
},
{
  id: 55,
  category: "Family",
  title: "Parent Gave You Advice You Didn’t Like",
  situation: "Your parent told you how to handle a friend problem, but you disagree.",
  emotion: { icon: "🤨", label: "Frustrated" },
  responses: [
    {
      text: "Thanks for the advice. I’ll think about it.",
      feedback: "Polite and open-minded.",
      type: "best"
    },
    {
      text: "You don’t understand my life!",
      feedback: "Disrespectful and shuts down talk.",
      type: "poor"
    },
    {
      text: "Okay, but I might try something else.",
      feedback: "Calm honesty — good choice.",
      type: "good"
    },
    {
      text: "Ignore them and walk away.",
      feedback: "Avoids communication.",
      type: "neutral"
    }
  ],
  correctAnswer: "Thanks for the advice. I’ll think about it.",
  correctExplanation: "Empathy listens first, even when you disagree.",
  tip: "Respect keeps conversations open."
},
{
  id: 56,
  category: "Family",
  title: "Sibling Lost a Game",
  situation: "Your younger sibling lost a board game and looks upset.",
  emotion: { icon: "😢", label: "Sad" },
  responses: [
    {
      text: "Good try! Want to play again together?",
      feedback: "Encouraging and fun.",
      type: "best"
    },
    {
      text: "You’re just bad at this game.",
      feedback: "Teasing and unkind.",
      type: "poor"
    },
    {
      text: "It’s just a game; don’t cry.",
      feedback: "Dismisses their feelings.",
      type: "neutral"
    },
    {
      text: "You almost won — you’re getting better!",
      feedback: "Positive and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "Good try! Want to play again together?",
  correctExplanation: "Encouragement teaches resilience and kindness.",
  tip: "Empathy helps others handle disappointment."
},
{
  id: 57,
  category: "Family",
  title: "Parent Got You the Wrong Gift",
  situation: "Your parent bought you a present you didn’t really want.",
  emotion: { icon: "😬", label: "Awkward" },
  responses: [
    {
      text: "Thanks! It’s really nice of you to think of me.",
      feedback: "Shows gratitude before preference.",
      type: "best"
    },
    {
      text: "That’s not what I asked for!",
      feedback: "Ungrateful and hurtful.",
      type: "poor"
    },
    {
      text: "It’s okay, maybe I’ll like it later.",
      feedback: "Polite but lukewarm.",
      type: "neutral"
    },
    {
      text: "Thanks! You always surprise me.",
      feedback: "Friendly and positive tone.",
      type: "good"
    }
  ],
  correctAnswer: "Thanks! It’s really nice of you to think of me.",
  correctExplanation: "Gratitude shows love beyond the item itself.",
  tip: "Empathy focuses on intention, not perfection."
},
{
  id: 58,
  category: "Family",
  title: "Parent Asked You to Do Chores",
  situation: "Your parent reminds you to clean your room right when you’re tired.",
  emotion: { icon: "😒", label: "Annoyed" },
  responses: [
    {
      text: "Okay, I’ll do it in a bit once I rest for a minute.",
      feedback: "Communicates calmly and respectfully.",
      type: "best"
    },
    {
      text: "Why now? I’m not doing it!",
      feedback: "Defiant and rude.",
      type: "poor"
    },
    {
      text: "Fine, whatever.",
      feedback: "Complies but with attitude.",
      type: "neutral"
    },
    {
      text: "Can I finish this and then do it? I promise.",
      feedback: "Respectful negotiation.",
      type: "good"
    }
  ],
  correctAnswer: "Okay, I’ll do it in a bit once I rest for a minute.",
  correctExplanation: "Empathy includes managing tone and timing politely.",
  tip: "Tone matters as much as words."
},
{
  id: 59,
  category: "Family",
  title: "Sibling Interrupted You",
  situation: "You’re talking, and your sibling keeps interrupting.",
  emotion: { icon: "😤", label: "Frustrated" },
  responses: [
    {
      text: "Hey, can I finish first and then it’s your turn?",
      feedback: "Sets a fair boundary kindly.",
      type: "best"
    },
    {
      text: "Stop talking over me!",
      feedback: "Harsh and impatient.",
      type: "poor"
    },
    {
      text: "Never mind, you go ahead.",
      feedback: "Avoids issue and loses voice.",
      type: "neutral"
    },
    {
      text: "Hold on — let me finish this thought.",
      feedback: "Calm and fair communication.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, can I finish first and then it’s your turn?",
  correctExplanation: "Empathy respects turn-taking for both sides.",
  tip: "Fairness keeps conversations friendly."
},
{
  id: 60,
  category: "Family",
  title: "Parent Reminds You About Grades",
  situation: "Your parent talks again about improving your grades, and you feel pressured.",
  emotion: { icon: "😣", label: "Pressured" },
  responses: [
    {
      text: "I know you care. I’m trying my best, and I’ll keep working on it.",
      feedback: "Acknowledges care and sets effort.",
      type: "best"
    },
    {
      text: "Stop nagging me!",
      feedback: "Disrespectful and reactive.",
      type: "poor"
    },
    {
      text: "Okay, I’ll study later.",
      feedback: "Agreeable but noncommittal.",
      type: "neutral"
    },
    {
      text: "I’ll make a plan to improve — can you help me with it?",
      feedback: "Proactive and mature.",
      type: "good"
    }
  ],
  correctAnswer: "I know you care. I’m trying my best, and I’ll keep working on it.",
  correctExplanation: "Balancing respect and effort shows emotional maturity.",
  tip: "Empathy listens beneath the pressure — it’s often love."
},
{
  id: 61,
  category: "Family",
  title: "Sibling Wants to Use the Computer",
  situation: "Your sibling asks to use the computer while you’re in the middle of a project.",
  emotion: { icon: "💻", label: "Impatient" },
  responses: [
    {
      text: "I’ll finish this in 15 minutes, then it’s all yours.",
      feedback: "Fair and respectful of both needs.",
      type: "best"
    },
    {
      text: "No way, I’m using it all day!",
      feedback: "Selfish and uncooperative.",
      type: "poor"
    },
    {
      text: "Ask Mom, not me.",
      feedback: "Avoids responsibility.",
      type: "neutral"
    },
    {
      text: "Can we set a timer and take turns?",
      feedback: "Collaborative and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "I’ll finish this in 15 minutes, then it’s all yours.",
  correctExplanation: "Empathy means balancing fairness with your own needs.",
  tip: "Clear timing reduces conflict at home."
},
{
  id: 62,
  category: "Family",
  title: "Family Plans Changed",
  situation: "Your family cancelled a trip you were excited about.",
  emotion: { icon: "😞", label: "Disappointed" },
  responses: [
    {
      text: "I’m really disappointed, but maybe we can plan something else soon.",
      feedback: "Honest but understanding.",
      type: "best"
    },
    {
      text: "You ruined my weekend!",
      feedback: "Blames others unfairly.",
      type: "poor"
    },
    {
      text: "Whatever, I didn’t care anyway.",
      feedback: "Denies real emotion.",
      type: "neutral"
    },
    {
      text: "Okay, maybe next time we can all go together.",
      feedback: "Hopeful and calm.",
      type: "good"
    }
  ],
  correctAnswer: "I’m really disappointed, but maybe we can plan something else soon.",
  correctExplanation: "Acknowledging feelings politely keeps family harmony.",
  tip: "Empathy shows in how you handle let-downs."
},
{
  id: 63,
  category: "Family",
  title: "Parent Forgot to Pack Your Lunch",
  situation: "You discovered your lunch was missing when you got to school.",
  emotion: { icon: "🥪", label: "Hungry" },
  responses: [
    {
      text: "It’s okay, everyone forgets sometimes.",
      feedback: "Understanding and forgiving.",
      type: "best"
    },
    {
      text: "Thanks a lot, now I have nothing to eat!",
      feedback: "Sarcastic and blaming.",
      type: "poor"
    },
    {
      text: "Can you drop it off later?",
      feedback: "Practical and polite request.",
      type: "good"
    },
    {
      text: "I’ll just buy something from the canteen.",
      feedback: "Independent but emotionless.",
      type: "neutral"
    }
  ],
  correctAnswer: "It’s okay, everyone forgets sometimes.",
  correctExplanation: "Forgiveness builds trust and keeps home life kind.",
  tip: "Mistakes are chances to show grace."
},
{
  id: 64,
  category: "Family",
  title: "Sibling Is Crying",
  situation: "Your little sister is crying after dropping her ice cream.",
  emotion: { icon: "😭", label: "Sad" },
  responses: [
    {
      text: "Oh no! Let’s get some tissues — maybe we can share mine.",
      feedback: "Comforting and proactive.",
      type: "best"
    },
    {
      text: "Stop crying, it’s just ice cream.",
      feedback: "Minimizes her feelings.",
      type: "poor"
    },
    {
      text: "Ignore her; she’ll stop soon.",
      feedback: "Avoids helping.",
      type: "neutral"
    },
    {
      text: "Want to take a lick of mine?",
      feedback: "Sweet and caring.",
      type: "good"
    }
  ],
  correctAnswer: "Oh no! Let’s get some tissues — maybe we can share mine.",
  correctExplanation: "Empathy comforts first before fixing the issue.",
  tip: "Small gestures make big comfort for little ones."
},
{
  id: 65,
  category: "Family",
  title: "Parent Is Running Late",
  situation: "You notice your parent rushing to get ready for work.",
  emotion: { icon: "🏃‍♀️", label: "Rushed" },
  responses: [
    {
      text: "Need me to grab anything for you before you go?",
      feedback: "Helpful and observant.",
      type: "best"
    },
    {
      text: "You’re always late!",
      feedback: "Critical and stressful.",
      type: "poor"
    },
    {
      text: "Guess you’re in a hurry again.",
      feedback: "Neutral comment, not helpful.",
      type: "neutral"
    },
    {
      text: "I packed your water bottle already.",
      feedback: "Thoughtful and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "Need me to grab anything for you before you go?",
  correctExplanation: "Offering help eases stress and shows awareness.",
  tip: "Notice needs before being asked."
},
{
  id: 66,
  category: "Family",
  title: "Family Member Feels Left Out",
  situation: "During dinner, one family member stays quiet while everyone else chats.",
  emotion: { icon: "😶", label: "Left Out" },
  responses: [
    {
      text: "Hey, what do you think about this, Dad?",
      feedback: "Includes the quiet person warmly.",
      type: "best"
    },
    {
      text: "They don’t want to talk.",
      feedback: "Assumes instead of including.",
      type: "neutral"
    },
    {
      text: "We’re talking, don’t interrupt.",
      feedback: "Excludes them further.",
      type: "poor"
    },
    {
      text: "I’ll ask them later what’s up.",
      feedback: "Kind but delayed empathy.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, what do you think about this, Dad?",
  correctExplanation: "Empathy notices who’s left out and draws them in.",
  tip: "Inclusion turns silence into connection."
},
{
  id: 67,
  category: "Family",
  title: "Parent Told You No",
  situation: "You asked for something, but your parent said no.",
  emotion: { icon: "😤", label: "Upset" },
  responses: [
    {
      text: "Okay, I’m disappointed, but I understand.",
      feedback: "Respectful and honest.",
      type: "best"
    },
    {
      text: "That’s so unfair!",
      feedback: "Argues instead of accepting.",
      type: "poor"
    },
    {
      text: "Whatever, I don’t care.",
      feedback: "Pretends not to care.",
      type: "neutral"
    },
    {
      text: "Can I ask again another time?",
      feedback: "Polite persistence.",
      type: "good"
    }
  ],
  correctAnswer: "Okay, I’m disappointed, but I understand.",
  correctExplanation: "Acknowledging disappointment without anger builds trust.",
  tip: "Empathy helps you manage your own emotions kindly."
},
{
  id: 68,
  category: "Family",
  title: "Parent Forgot to Pick You Up",
  situation: "You waited after school and your parent arrived late, looking apologetic.",
  emotion: { icon: "⌛", label: "Anxious" },
  responses: [
    {
      text: "I was a bit worried, but I’m glad you’re here now.",
      feedback: "Calm and forgiving.",
      type: "best"
    },
    {
      text: "You forgot me again!",
      feedback: "Blaming and unhelpful.",
      type: "poor"
    },
    {
      text: "It’s fine, I waited anyway.",
      feedback: "Neutral, hides feelings.",
      type: "neutral"
    },
    {
      text: "Next time can you text me if you’re late?",
      feedback: "Practical and polite.",
      type: "good"
    }
  ],
  correctAnswer: "I was a bit worried, but I’m glad you’re here now.",
  correctExplanation: "Balancing honesty and care keeps communication open.",
  tip: "Empathy says the truth kindly."
},
{
  id: 69,
  category: "Family",
  title: "Sibling Took Credit",
  situation: "Your sibling got praised for something you both worked on.",
  emotion: { icon: "😠", label: "Annoyed" },
  responses: [
    {
      text: "Hey, that was our project — let’s tell them we did it together.",
      feedback: "Assertive but fair.",
      type: "best"
    },
    {
      text: "You always take all the credit!",
      feedback: "Accusatory and angry.",
      type: "poor"
    },
    {
      text: "It doesn’t matter who gets the credit.",
      feedback: "Avoids fairness.",
      type: "neutral"
    },
    {
      text: "Next time, I’ll speak up sooner.",
      feedback: "Reflective and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, that was our project — let’s tell them we did it together.",
  correctExplanation: "Empathy balances fairness without hostility.",
  tip: "You can stand up for yourself kindly."
},
{
  id: 70,
  category: "Family",
  title: "Parent Said No to Screen Time",
  situation: "Your parent told you to stop using your phone during dinner.",
  emotion: { icon: "📱", label: "Annoyed" },
  responses: [
    {
      text: "Okay, I’ll put it away. Let’s just eat together.",
      feedback: "Cooperative and polite.",
      type: "best"
    },
    {
      text: "It’s just one message!",
      feedback: "Argues instead of respecting the rule.",
      type: "poor"
    },
    {
      text: "Fine, but I was in the middle of something.",
      feedback: "Semi-cooperative but defensive.",
      type: "neutral"
    },
    {
      text: "I’ll finish this later — sorry about that.",
      feedback: "Acknowledges rule and takes responsibility.",
      type: "good"
    }
  ],
  correctAnswer: "Okay, I’ll put it away. Let’s just eat together.",
  correctExplanation: "Empathy respects shared family time.",
  tip: "Being present shows care for those around you."
},
{
  id: 71,
  category: "Family",
  title: "Parent Had a Bad Day",
  situation: "Your parent comes home quiet and doesn’t talk much during dinner.",
  emotion: { icon: "😔", label: "Tired" },
  responses: [
    {
      text: "Long day? Want to talk about it later?",
      feedback: "Shows awareness and patience.",
      type: "best"
    },
    {
      text: "Why are you so grumpy?",
      feedback: "Critical and insensitive.",
      type: "poor"
    },
    {
      text: "They’re just tired, I guess.",
      feedback: "Observant but distant.",
      type: "neutral"
    },
    {
      text: "I’ll clear the table so they can rest.",
      feedback: "Helpful and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Long day? Want to talk about it later?",
  correctExplanation: "Checking in without pressure shows thoughtful empathy.",
  tip: "Empathy waits for the right time to talk."
},
{
  id: 72,
  category: "Family",
  title: "Sibling Took the Remote",
  situation: "You were watching a show and your sibling grabbed the TV remote to change the channel.",
  emotion: { icon: "📺", label: "Irritated" },
  responses: [
    {
      text: "Hey, I was watching that — can we take turns?",
      feedback: "Fair and calm.",
      type: "best"
    },
    {
      text: "Give it back now!",
      feedback: "Aggressive and demanding.",
      type: "poor"
    },
    {
      text: "Whatever, I’ll just go to my room.",
      feedback: "Avoids resolving the issue.",
      type: "neutral"
    },
    {
      text: "Can I finish this episode first?",
      feedback: "Polite negotiation.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, I was watching that — can we take turns?",
  correctExplanation: "Respectful communication avoids small fights.",
  tip: "Empathy means finding balance, not winning."
},
{
  id: 73,
  category: "Family",
  title: "Family Member Forgot Your Birthday",
  situation: "A family member forgot to wish you on your birthday.",
  emotion: { icon: "🥹", label: "Hurt" },
  responses: [
    {
      text: "It’s okay, maybe they were busy. I can remind them later.",
      feedback: "Kind and forgiving.",
      type: "best"
    },
    {
      text: "Wow, guess you don’t care about me.",
      feedback: "Harsh and guilt-inducing.",
      type: "poor"
    },
    {
      text: "I’ll just act like it’s no big deal.",
      feedback: "Hides your feelings.",
      type: "neutral"
    },
    {
      text: "Hey, you forgot to wish me! It’s okay though.",
      feedback: "Honest but gentle.",
      type: "good"
    }
  ],
  correctAnswer: "It’s okay, maybe they were busy. I can remind them later.",
  correctExplanation: "Empathy gives grace for small mistakes.",
  tip: "Forgiveness keeps relationships light."
},
{
  id: 74,
  category: "Family",
  title: "Parent Gave You Unwanted Advice",
  situation: "Your parent gives advice again on how to handle your friends.",
  emotion: { icon: "🙄", label: "Annoyed" },
  responses: [
    {
      text: "I know you care. I’ll think about it, thanks.",
      feedback: "Respectful and balanced.",
      type: "best"
    },
    {
      text: "You already told me this!",
      feedback: "Irritated and dismissive.",
      type: "poor"
    },
    {
      text: "Okay, sure, whatever you say.",
      feedback: "Passive response.",
      type: "neutral"
    },
    {
      text: "Thanks, I’ll see how it goes.",
      feedback: "Friendly and calm.",
      type: "good"
    }
  ],
  correctAnswer: "I know you care. I’ll think about it, thanks.",
  correctExplanation: "Empathy listens to intentions, not just words.",
  tip: "Parents repeat advice because they care."
},
{
  id: 75,
  category: "Family",
  title: "Parent Asks About Your Day",
  situation: "You come home tired and your parent asks, 'How was school?'",
  emotion: { icon: "😐", label: "Tired" },
  responses: [
    {
      text: "It was fine, just a long day. How was yours?",
      feedback: "Polite and reciprocal.",
      type: "best"
    },
    {
      text: "Can we not talk about it?",
      feedback: "Honest but closed off.",
      type: "neutral"
    },
    {
      text: "Boring, like always.",
      feedback: "Dismissive and negative.",
      type: "poor"
    },
    {
      text: "Pretty normal. Did anything fun happen at work?",
      feedback: "Keeps connection going.",
      type: "good"
    }
  ],
  correctAnswer: "It was fine, just a long day. How was yours?",
  correctExplanation: "Empathy turns small chats into two-way care.",
  tip: "Simple sharing builds strong bonds."
},
{
  id: 76,
  category: "Family",
  title: "Sibling Teased You in Front of Others",
  situation: "Your sibling made a joke about you in front of family friends.",
  emotion: { icon: "😠", label: "Embarrassed" },
  responses: [
    {
      text: "That joke made me feel embarrassed — please don’t do that again.",
      feedback: "Assertive but calm.",
      type: "best"
    },
    {
      text: "You’re so mean!",
      feedback: "Emotional and attacking.",
      type: "poor"
    },
    {
      text: "Laugh it off and ignore it.",
      feedback: "Avoids expressing feelings.",
      type: "neutral"
    },
    {
      text: "Let’s not tease each other next time, okay?",
      feedback: "Constructive and balanced.",
      type: "good"
    }
  ],
  correctAnswer: "That joke made me feel embarrassed — please don’t do that again.",
  correctExplanation: "Empathy includes setting healthy boundaries respectfully.",
  tip: "You can be kind and firm at once."
},
{
  id: 77,
  category: "Family",
  title: "Parent Needs Help With Technology",
  situation: "Your parent is struggling to use a new app on their phone.",
  emotion: { icon: "📱", label: "Confused" },
  responses: [
    {
      text: "Here, let me show you how it works.",
      feedback: "Helpful and patient.",
      type: "best"
    },
    {
      text: "How do you not know this?",
      feedback: "Impatient and rude.",
      type: "poor"
    },
    {
      text: "Just Google it.",
      feedback: "Unhelpful and dismissive.",
      type: "neutral"
    },
    {
      text: "I can help, but it might take a few tries.",
      feedback: "Supportive and realistic.",
      type: "good"
    }
  ],
  correctAnswer: "Here, let me show you how it works.",
  correctExplanation: "Empathy uses patience when others learn slowly.",
  tip: "Teach with kindness, not pride."
},
{
  id: 78,
  category: "Family",
  title: "Family Member Apologized",
  situation: "A family member says sorry for something they said earlier.",
  emotion: { icon: "🤝", label: "Regretful" },
  responses: [
    {
      text: "Thanks for saying sorry — I forgive you.",
      feedback: "Healing and kind.",
      type: "best"
    },
    {
      text: "Yeah, you should be sorry.",
      feedback: "Keeps tension alive.",
      type: "poor"
    },
    {
      text: "It’s okay, let’s move on.",
      feedback: "Accepts apology but short.",
      type: "good"
    },
    {
      text: "Don’t worry about it.",
      feedback: "Minimizes feelings.",
      type: "neutral"
    }
  ],
  correctAnswer: "Thanks for saying sorry — I forgive you.",
  correctExplanation: "Empathy accepts and appreciates apologies.",
  tip: "Forgiveness rebuilds trust faster."
},
{
  id: 79,
  category: "Family",
  title: "Parent Asks for Quiet",
  situation: "Your parent is working from home and asks everyone to keep the noise down.",
  emotion: { icon: "🤫", label: "Focused" },
  responses: [
    {
      text: "Okay, we’ll play quietly until you’re done.",
      feedback: "Respectful and cooperative.",
      type: "best"
    },
    {
      text: "You always tell us to be quiet!",
      feedback: "Defensive and dismissive.",
      type: "poor"
    },
    {
      text: "We’ll try, but we might get loud again.",
      feedback: "Partly considerate.",
      type: "neutral"
    },
    {
      text: "Got it — we’ll go play in another room.",
      feedback: "Thoughtful and proactive.",
      type: "good"
    }
  ],
  correctAnswer: "Okay, we’ll play quietly until you’re done.",
  correctExplanation: "Empathy respects others’ focus and space.",
  tip: "Quiet care helps people work better."
},
{
  id: 80,
  category: "Family",
  title: "Parent Gave You Extra Responsibility",
  situation: "Your parent asked you to watch your sibling while they finish errands.",
  emotion: { icon: "🙂", label: "Responsible" },
  responses: [
    {
      text: "Sure, I’ll look after them until you’re back.",
      feedback: "Reliable and mature.",
      type: "best"
    },
    {
      text: "Why me? They can take care of themselves.",
      feedback: "Complaining and unhelpful.",
      type: "poor"
    },
    {
      text: "Okay, but just for a little while.",
      feedback: "Agreeable but limited.",
      type: "neutral"
    },
    {
      text: "I’ll keep them busy with a game.",
      feedback: "Engaged and caring.",
      type: "good"
    }
  ],
  correctAnswer: "Sure, I’ll look after them until you’re back.",
  correctExplanation: "Empathy includes taking responsibility when others trust you.",
  tip: "Being dependable builds family trust."
}

];
