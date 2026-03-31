import { EmpathyScenario } from './types';

export const friendshipScenarios: EmpathyScenario[] = [
{
  id: 1,
  category: "Friendship",
  title: "Friend is Sad",
  situation: "Your friend Alex didn’t make the soccer team and looks really down.",
  emotion: { icon: "😢", label: "Disappointed" },
  responses: [
    {
      text: "I’m really sorry, Alex. That must feel rough. Want to talk about it?",
      feedback: "Perfect! You notice the feeling and offer to listen.",
      type: "best"
    },
    {
      text: "At least you tried. Let’s hang out anyway.",
      feedback: "Kind and positive, though you could show more empathy.",
      type: "good"
    },
    {
      text: "Maybe soccer’s not your thing.",
      feedback: "Sounds honest but not very comforting.",
      type: "neutral"
    },
    {
      text: "Don’t be upset. It’s just a game.",
      feedback: "Dismisses their feelings.",
      type: "poor"
    }
  ],
  correctAnswer: "I’m really sorry, Alex. That must feel rough. Want to talk about it?",
  correctExplanation: "It names the emotion and offers support, which helps friends feel understood.",
  tip: "Start with care before giving advice."
},
{
  id: 2,
  category: "Friendship",
  title: "Forgot Your Birthday",
  situation: "A close friend forgot your birthday and now looks guilty.",
  emotion: { icon: "😬", label: "Apologetic" },
  responses: [
    {
      text: "It’s okay! I know you didn’t mean to forget.",
      feedback: "Shows forgiveness and understanding.",
      type: "best"
    },
    {
      text: "You can make it up to me later.",
      feedback: "Light-hearted but a bit self-focused.",
      type: "good"
    },
    {
      text: "I can’t believe you forgot!",
      feedback: "Expresses hurt but doesn’t help reconnect.",
      type: "neutral"
    },
    {
      text: "Guess I’m not that important.",
      feedback: "Adds guilt and distance.",
      type: "poor"
    }
  ],
  correctAnswer: "It’s okay! I know you didn’t mean to forget.",
  correctExplanation: "Forgiving and reassuring answers repair friendships better than blame.",
  tip: "Empathy also means letting go when someone feels sorry."
},
{
  id: 3,
  category: "Friendship",
  title: "Left Out of a Game",
  situation: "You notice a friend standing alone while others play.",
  emotion: { icon: "😔", label: "Left Out" },
  responses: [
    {
      text: "Hey, want to join our game?",
      feedback: "Warm and inclusive.",
      type: "best"
    },
    {
      text: "They probably don’t want to play.",
      feedback: "Assumes instead of asking.",
      type: "neutral"
    },
    {
      text: "I’ll talk to them later.",
      feedback: "Delays help.",
      type: "good"
    },
    {
      text: "Not my problem.",
      feedback: "Shows no empathy.",
      type: "poor"
    }
  ],
  correctAnswer: "Hey, want to join our game?",
  correctExplanation: "Inviting someone in helps them feel accepted.",
  tip: "Inclusion is one of the simplest forms of empathy."
},
{
  id: 4,
  category: "Friendship",
  title: "Teammate Missed a Goal",
  situation: "During P.E., your teammate misses an easy goal and looks embarrassed.",
  emotion: { icon: "😳", label: "Embarrassed" },
  responses: [
    {
      text: "It’s okay! Everyone misses sometimes. You’ll get the next one.",
      feedback: "Encouraging and supportive.",
      type: "best"
    },
    {
      text: "You’ll need more practice next time.",
      feedback: "Practical but not comforting.",
      type: "good"
    },
    {
      text: "That was a bad miss.",
      feedback: "Critical and discouraging.",
      type: "poor"
    },
    {
      text: "Say nothing and keep playing.",
      feedback: "Neutral but misses a chance to help.",
      type: "neutral"
    }
  ],
  correctAnswer: "It’s okay! Everyone misses sometimes. You’ll get the next one.",
  correctExplanation: "Encouragement reduces embarrassment and keeps teamwork positive.",
  tip: "Lift people up when they make mistakes."
},
{
  id: 5,
  category: "Friendship",
  title: "Friend Argued with Someone",
  situation: "Your friend just had a fight with another classmate and looks upset.",
  emotion: { icon: "😠", label: "Upset" },
  responses: [
    {
      text: "That sounds rough. Want to talk about what happened?",
      feedback: "Shows care and gives space to share.",
      type: "best"
    },
    {
      text: "You should just ignore them.",
      feedback: "Avoids the issue rather than helping process it.",
      type: "neutral"
    },
    {
      text: "You’re right; they were awful.",
      feedback: "Takes sides and may make things worse.",
      type: "poor"
    },
    {
      text: "Let’s cool off first and then figure it out.",
      feedback: "Helps calm the situation but less emotional.",
      type: "good"
    }
  ],
  correctAnswer: "That sounds rough. Want to talk about what happened?",
  correctExplanation: "Listening before judging shows real understanding.",
  tip: "Empathy starts with listening, not fixing."
},
{
  id: 6,
  category: "Friendship",
  title: "Friend Got in Trouble",
  situation: "Your friend was scolded by a teacher and looks embarrassed.",
  emotion: { icon: "😞", label: "Ashamed" },
  responses: [
    {
      text: "That must’ve been hard. You okay?",
      feedback: "Acknowledges feelings with kindness.",
      type: "best"
    },
    {
      text: "I told you not to do that.",
      feedback: "Sounds blaming.",
      type: "poor"
    },
    {
      text: "Let’s just move on.",
      feedback: "Dismisses feelings quickly.",
      type: "neutral"
    },
    {
      text: "Don’t worry, it happens to everyone.",
      feedback: "Normalizes but lacks personal warmth.",
      type: "good"
    }
  ],
  correctAnswer: "That must’ve been hard. You okay?",
  correctExplanation: "Recognizing embarrassment helps friends feel less alone.",
  tip: "Even small reassurance can heal big embarrassment."
},
{
  id: 7,
  category: "Friendship",
  title: "Friend Lost a Pet",
  situation: "Your friend’s pet passed away and they’re very quiet in class.",
  emotion: { icon: "💔", label: "Sad" },
  responses: [
    {
      text: "I’m really sorry about your pet. They meant a lot to you.",
      feedback: "Kind and understanding — perfect empathy.",
      type: "best"
    },
    {
      text: "Don’t think about it too much.",
      feedback: "Avoids the emotion.",
      type: "neutral"
    },
    {
      text: "It was just an animal.",
      feedback: "Insensitive and dismissive.",
      type: "poor"
    },
    {
      text: "I know how that feels; my pet died too.",
      feedback: "Shows connection but shifts focus away.",
      type: "good"
    }
  ],
  correctAnswer: "I’m really sorry about your pet. They meant a lot to you.",
  correctExplanation: "Acknowledging their bond and loss provides comfort.",
  tip: "Let people grieve instead of fixing their sadness."
},
{
  id: 8,
  category: "Friendship",
  title: "Friend Moved Schools",
  situation: "Your close friend is moving to another school and feels sad.",
  emotion: { icon: "😢", label: "Sad" },
  responses: [
    {
      text: "I’ll really miss you. Let’s stay in touch!",
      feedback: "Honest and caring.",
      type: "best"
    },
    {
      text: "At least you’ll meet new people.",
      feedback: "Positive but not very emotional.",
      type: "good"
    },
    {
      text: "Everyone leaves sometime.",
      feedback: "Cold and distant.",
      type: "poor"
    },
    {
      text: "Okay, see you around.",
      feedback: "Polite but detached.",
      type: "neutral"
    }
  ],
  correctAnswer: "I’ll really miss you. Let’s stay in touch!",
  correctExplanation: "Expressing emotion and hope keeps friendship strong.",
  tip: "Saying goodbye with warmth matters."
},
{
  id: 9,
  category: "Friendship",
  title: "Rumor About a Friend",
  situation: "Someone tells you a rumor about your friend that sounds untrue.",
  emotion: { icon: "🤔", label: "Confused" },
  responses: [
    {
      text: "I don’t think that’s true. I’ll check with them first.",
      feedback: "Protects your friend and seeks truth — great empathy.",
      type: "best"
    },
    {
      text: "Really? That’s surprising.",
      feedback: "Curious but spreads rumor tone.",
      type: "neutral"
    },
    {
      text: "Tell me more!",
      feedback: "Encourages gossip.",
      type: "poor"
    },
    {
      text: "Let’s not talk about them behind their back.",
      feedback: "Stops gossip respectfully.",
      type: "good"
    }
  ],
  correctAnswer: "I don’t think that’s true. I’ll check with them first.",
  correctExplanation: "Empathy defends absent friends and avoids gossip.",
  tip: "Stand up quietly for people who aren’t there."
},
{
  id: 10,
  category: "Friendship",
  title: "Friend Is New to Town",
  situation: "A friend just moved from another city and feels out of place.",
  emotion: { icon: "😕", label: "Uncertain" },
  responses: [
    {
      text: "I can show you around and introduce you to others.",
      feedback: "Welcoming and supportive.",
      type: "best"
    },
    {
      text: "You’ll get used to it soon.",
      feedback: "Comforting but short on connection.",
      type: "good"
    },
    {
      text: "That’s tough. Hope it gets better.",
      feedback: "Kind but distant.",
      type: "neutral"
    },
    {
      text: "I’m busy; maybe later.",
      feedback: "Dismissive.",
      type: "poor"
    }
  ],
  correctAnswer: "I can show you around and introduce you to others.",
  correctExplanation: "Offering inclusion helps new friends feel welcome fast.",
  tip: "Small gestures make big differences."
},
{
  id: 11,
  category: "Friendship",
  title: "Friend Didn’t Get Picked",
  situation: "Teams were chosen for a project, and your friend wasn’t picked by anyone.",
  emotion: { icon: "😞", label: "Rejected" },
  responses: [
    {
      text: "Hey, want to join my group? We’d love to have you.",
      feedback: "Inclusive and kind — perfect empathy.",
      type: "best"
    },
    {
      text: "That’s unlucky. Maybe next time.",
      feedback: "Sympathetic but distant.",
      type: "neutral"
    },
    {
      text: "Guess no one wanted you on their team.",
      feedback: "Insensitive and hurtful.",
      type: "poor"
    },
    {
      text: "Don’t worry, I’ll talk to the teacher about it.",
      feedback: "Supportive but slightly indirect.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, want to join my group? We’d love to have you.",
  correctExplanation: "Inviting them shows inclusion and care.",
  tip: "Act quickly to make people feel they belong."
},
{
  id: 12,
  category: "Friendship",
  title: "Friend Shared a Secret",
  situation: "Your friend told you something personal and said not to tell anyone.",
  emotion: { icon: "🤫", label: "Trusting" },
  responses: [
    {
      text: "I’ll keep it private. Thanks for trusting me.",
      feedback: "Shows respect and reliability.",
      type: "best"
    },
    {
      text: "I might tell one person, but it’s fine.",
      feedback: "Breaks trust — not okay.",
      type: "poor"
    },
    {
      text: "That’s serious. Have you told an adult?",
      feedback: "Good if it’s about safety, otherwise cautious.",
      type: "good"
    },
    {
      text: "I don’t want to know secrets.",
      feedback: "Avoids connection.",
      type: "neutral"
    }
  ],
  correctAnswer: "I’ll keep it private. Thanks for trusting me.",
  correctExplanation: "Keeping confidence builds stronger friendships.",
  tip: "Trust is built when words stay safe."
},
{
  id: 13,
  category: "Friendship",
  title: "Friend Won an Award",
  situation: "Your friend wins an art award that you also wanted.",
  emotion: { icon: "😅", label: "Mixed Feelings" },
  responses: [
    {
      text: "Congrats! Your art was awesome — you earned it.",
      feedback: "Sincere and supportive — great friendship energy.",
      type: "best"
    },
    {
      text: "I wish I’d won instead.",
      feedback: "Honest but self-focused.",
      type: "neutral"
    },
    {
      text: "You always get everything.",
      feedback: "Sounds jealous.",
      type: "poor"
    },
    {
      text: "Good job, maybe you can teach me some tips.",
      feedback: "Encouraging with curiosity.",
      type: "good"
    }
  ],
  correctAnswer: "Congrats! Your art was awesome — you earned it.",
  correctExplanation: "Celebrating others’ success strengthens friendships.",
  tip: "Empathy includes being happy for someone else."
},
{
  id: 14,
  category: "Friendship",
  title: "Friend Was Absent",
  situation: "Your friend missed school for a week and looks lost today.",
  emotion: { icon: "😕", label: "Out of Touch" },
  responses: [
    {
      text: "Glad you’re back! Want me to catch you up on what we did?",
      feedback: "Warm welcome and helpful.",
      type: "best"
    },
    {
      text: "You missed a lot. Good luck catching up.",
      feedback: "Neutral but not very friendly.",
      type: "neutral"
    },
    {
      text: "You should’ve come to school.",
      feedback: "Judgmental and unhelpful.",
      type: "poor"
    },
    {
      text: "Need notes? I can share mine.",
      feedback: "Helpful and supportive.",
      type: "good"
    }
  ],
  correctAnswer: "Glad you’re back! Want me to catch you up on what we did?",
  correctExplanation: "A friendly tone plus help shows inclusion.",
  tip: "Reconnecting helps friends feel seen again."
},
{
  id: 15,
  category: "Friendship",
  title: "Friend Apologized Late",
  situation: "A friend apologizes days after saying something rude.",
  emotion: { icon: "😔", label: "Regretful" },
  responses: [
    {
      text: "Thanks for apologizing. I appreciate it.",
      feedback: "Accepts apology graciously.",
      type: "best"
    },
    {
      text: "Too late now.",
      feedback: "Keeps tension alive.",
      type: "poor"
    },
    {
      text: "I’m still hurt, but I’m glad you said sorry.",
      feedback: "Honest and balanced.",
      type: "good"
    },
    {
      text: "Whatever, it’s fine.",
      feedback: "Avoids emotions.",
      type: "neutral"
    }
  ],
  correctAnswer: "Thanks for apologizing. I appreciate it.",
  correctExplanation: "Accepting apologies repairs friendship faster.",
  tip: "Empathy forgives when someone shows real regret."
},
{
  id: 16,
  category: "Friendship",
  title: "Friend Failed a Test",
  situation: "Your friend is upset about getting a poor grade on a big test.",
  emotion: { icon: "😢", label: "Disappointed" },
  responses: [
    {
      text: "I know you worked hard. Want to study together next time?",
      feedback: "Acknowledges effort and offers support.",
      type: "best"
    },
    {
      text: "That test was hard for everyone.",
      feedback: "Normalizes feelings but lacks personal warmth.",
      type: "good"
    },
    {
      text: "Maybe you didn’t study enough.",
      feedback: "Critical rather than caring.",
      type: "poor"
    },
    {
      text: "Oh well, grades aren’t everything.",
      feedback: "Positive but dismissive.",
      type: "neutral"
    }
  ],
  correctAnswer: "I know you worked hard. Want to study together next time?",
  correctExplanation: "Offering help shows empathy and teamwork.",
  tip: "Turn disappointment into motivation with kindness."
},
{
  id: 17,
  category: "Friendship",
  title: "Friend Feels Ignored",
  situation: "You’ve been spending more time with other classmates, and your friend looks left out.",
  emotion: { icon: "😔", label: "Lonely" },
  responses: [
    {
      text: "Sorry if I made you feel left out. Want to hang out later?",
      feedback: "Acknowledges and fixes the issue — strong empathy.",
      type: "best"
    },
    {
      text: "You’re overthinking it.",
      feedback: "Dismissive of feelings.",
      type: "poor"
    },
    {
      text: "We’ve just been busy lately.",
      feedback: "Explains but doesn’t show care.",
      type: "neutral"
    },
    {
      text: "I didn’t realize that. Thanks for telling me.",
      feedback: "Accepts feedback calmly.",
      type: "good"
    }
  ],
  correctAnswer: "Sorry if I made you feel left out. Want to hang out later?",
  correctExplanation: "Admitting fault and reconnecting repairs friendship.",
  tip: "Empathy often means owning our impact."
},
{
  id: 18,
  category: "Friendship",
  title: "Friend Shared Good News",
  situation: "Your friend got selected for a science fair and is super excited.",
  emotion: { icon: "🤩", label: "Excited" },
  responses: [
    {
      text: "Wow, that’s awesome! I’m so proud of you!",
      feedback: "Joyful and genuine — perfect match.",
      type: "best"
    },
    {
      text: "Cool, lucky you.",
      feedback: "Sounds neutral, not joyful.",
      type: "neutral"
    },
    {
      text: "You always get picked.",
      feedback: "Sounds jealous.",
      type: "poor"
    },
    {
      text: "That’s great! Tell me how you did it.",
      feedback: "Encouraging and curious.",
      type: "good"
    }
  ],
  correctAnswer: "Wow, that’s awesome! I’m so proud of you!",
  correctExplanation: "Sharing someone’s excitement strengthens bonds.",
  tip: "Empathy also means celebrating others’ joy."
},
{
  id: 19,
  category: "Friendship",
  title: "Friend Is Nervous to Present",
  situation: "Your friend says they feel scared to speak in front of the class.",
  emotion: { icon: "😨", label: "Nervous" },
  responses: [
    {
      text: "You’ve got this! Want me to sit up front to cheer you on?",
      feedback: "Encouraging and practical help.",
      type: "best"
    },
    {
      text: "Everyone gets nervous sometimes.",
      feedback: "True but not personal.",
      type: "neutral"
    },
    {
      text: "Just talk louder and you’ll be fine.",
      feedback: "Helpful but lacks empathy.",
      type: "good"
    },
    {
      text: "You’re overreacting.",
      feedback: "Invalidates their feelings.",
      type: "poor"
    }
  ],
  correctAnswer: "You’ve got this! Want me to sit up front to cheer you on?",
  correctExplanation: "Offering both words and presence builds confidence.",
  tip: "Support feels stronger when you show up."
},
{
  id: 20,
  category: "Friendship",
  title: "Friend Accidentally Hurt You",
  situation: "During a game, your friend bumped into you and you fell.",
  emotion: { icon: "😕", label: "Sorry" },
  responses: [
    {
      text: "It’s okay, I know it was an accident.",
      feedback: "Forgiving and calm — best response.",
      type: "best"
    },
    {
      text: "Watch where you’re going!",
      feedback: "Angry tone increases tension.",
      type: "poor"
    },
    {
      text: "I’m fine, don’t worry.",
      feedback: "Okay but avoids real communication.",
      type: "neutral"
    },
    {
      text: "Are you okay too? That looked like it hurt.",
      feedback: "Caring toward both people — strong empathy.",
      type: "good"
    }
  ],
  correctAnswer: "It's okay, I know it was an accident.",
  correctExplanation: "Understanding intent reduces conflict.",
  tip: "Forgiveness keeps games and friendships fun."
},
{
  id: 21,
  category: "Friendship",
  title: "Friend Is Being Bullied",
  situation: "You notice your friend getting teased by other students at lunch.",
  emotion: { icon: "😟", label: "Hurt" },
  responses: [
    {
      text: "Hey, that’s not cool. Leave them alone.",
      feedback: "Brave and protective — excellent empathy.",
      type: "best"
    },
    {
      text: "Ignore them, they’ll stop soon.",
      feedback: "Avoids the issue instead of supporting.",
      type: "neutral"
    },
    {
      text: "Laugh to fit in with the group.",
      feedback: "Adds to the harm.",
      type: "poor"
    },
    {
      text: "Let’s go somewhere else together.",
      feedback: "Removes your friend from harm — caring action.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, that’s not cool. Leave them alone.",
  correctExplanation: "Standing up kindly for someone shows strong empathy and courage.",
  tip: "Empathy means using your voice for fairness."
},
{
  id: 22,
  category: "Friendship",
  title: "Friend Didn’t Reply",
  situation: "You texted your friend yesterday, but they haven’t replied yet.",
  emotion: { icon: "🤔", label: "Uncertain" },
  responses: [
    {
      text: "Maybe they’re busy. I’ll wait a bit before asking again.",
      feedback: "Patient and understanding.",
      type: "best"
    },
    {
      text: "Why are you ignoring me?",
      feedback: "Assumes the worst — not empathetic.",
      type: "poor"
    },
    {
      text: "I’ll message them again right now.",
      feedback: "Eager but could pressure them.",
      type: "good"
    },
    {
      text: "Whatever, I don’t care.",
      feedback: "Dismissive of the friendship.",
      type: "neutral"
    }
  ],
  correctAnswer: "Maybe they’re busy. I’ll wait a bit before asking again.",
  correctExplanation: "Empathy means giving people space and understanding.",
  tip: "Don’t jump to conclusions — assume good intentions."
},
{
  id: 23,
  category: "Friendship",
  title: "Friend Was Chosen Last",
  situation: "Your friend looks hurt after being picked last for a team.",
  emotion: { icon: "😞", label: "Left Out" },
  responses: [
    {
      text: "Hey, come join me — we’ll make a great team!",
      feedback: "Inclusive and uplifting.",
      type: "best"
    },
    {
      text: "It’s fine, someone has to be last.",
      feedback: "Dismisses the feeling.",
      type: "poor"
    },
    {
      text: "Don’t worry, you’ll get picked earlier next time.",
      feedback: "Kind but distant.",
      type: "neutral"
    },
    {
      text: "You’re really good; they just didn’t see it yet.",
      feedback: "Supportive and encouraging.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, come join me — we’ll make a great team!",
  correctExplanation: "Inclusion helps friends regain confidence.",
  tip: "Empathy turns exclusion into connection."
},
{
  id: 24,
  category: "Friendship",
  title: "Friend Is Quiet Today",
  situation: "Your usually talkative friend seems quiet and withdrawn.",
  emotion: { icon: "😐", label: "Down" },
  responses: [
    {
      text: "You seem quiet today. Everything okay?",
      feedback: "Observant and caring.",
      type: "best"
    },
    {
      text: "Guess you’re just tired.",
      feedback: "Assumes without asking.",
      type: "neutral"
    },
    {
      text: "Talk to me when you feel like it.",
      feedback: "Respects space but not warm.",
      type: "good"
    },
    {
      text: "You’re being boring.",
      feedback: "Unkind and unhelpful.",
      type: "poor"
    }
  ],
  correctAnswer: "You seem quiet today. Everything okay?",
  correctExplanation: "Simple questions can open up deeper sharing.",
  tip: "Noticing changes shows real empathy."
},
{
  id: 25,
  category: "Friendship",
  title: "Friend Forgot Homework",
  situation: "Your friend forgot to bring their homework and looks stressed.",
  emotion: { icon: "😩", label: "Stressed" },
  responses: [
    {
      text: "Want me to help you explain it to the teacher?",
      feedback: "Supportive and proactive.",
      type: "best"
    },
    {
      text: "Tough luck, I remembered mine.",
      feedback: "Bragging and unhelpful.",
      type: "poor"
    },
    {
      text: "That’s okay, it happens sometimes.",
      feedback: "Kind reassurance but no help.",
      type: "good"
    },
    {
      text: "You should be more careful next time.",
      feedback: "Critical rather than empathetic.",
      type: "neutral"
    }
  ],
  correctAnswer: "Want me to help you explain it to the teacher?",
  correctExplanation: "Offering real help reduces your friend’s stress.",
  tip: "Empathy looks for small ways to make things easier."
},
{
  id: 26,
  category: "Friendship",
  title: "Friend Lost Their Phone",
  situation: "Your friend looks upset because they lost their phone.",
  emotion: { icon: "😫", label: "Frustrated" },
  responses: [
    {
      text: "That’s awful! Let’s try retracing your steps together.",
      feedback: "Caring and action-oriented.",
      type: "best"
    },
    {
      text: "Maybe someone stole it.",
      feedback: "Adds fear, not help.",
      type: "poor"
    },
    {
      text: "I hope you find it soon.",
      feedback: "Kind but passive.",
      type: "neutral"
    },
    {
      text: "Want help checking the classroom?",
      feedback: "Helpful and calm.",
      type: "good"
    }
  ],
  correctAnswer: "That’s awful! Let’s try retracing your steps together.",
  correctExplanation: "Empathy means joining in to solve problems.",
  tip: "When friends panic, your calm helps most."
},
{
  id: 27,
  category: "Friendship",
  title: "Friend Has New Glasses",
  situation: "Your friend seems shy after coming to school with new glasses.",
  emotion: { icon: "😳", label: "Self-conscious" },
  responses: [
    {
      text: "Those glasses look great on you!",
      feedback: "Encouraging and positive.",
      type: "best"
    },
    {
      text: "Did you have to get them?",
      feedback: "Sounds teasing.",
      type: "poor"
    },
    {
      text: "They look okay, I guess.",
      feedback: "Neutral and unsure.",
      type: "neutral"
    },
    {
      text: "I like the style; it suits you.",
      feedback: "Supportive and confident.",
      type: "good"
    }
  ],
  correctAnswer: "Those glasses look great on you!",
  correctExplanation: "Compliments help friends feel comfortable.",
  tip: "Kind words boost confidence quickly."
},
{
  id: 28,
  category: "Friendship",
  title: "Friend Didn’t Invite You",
  situation: "You found out your friend had a party but didn’t invite you.",
  emotion: { icon: "😢", label: "Hurt" },
  responses: [
    {
      text: "Hey, I felt left out when I heard about your party. Can we talk?",
      feedback: "Honest and calm — perfect way to handle it.",
      type: "best"
    },
    {
      text: "Why didn’t you invite me?!",
      feedback: "Accusatory and heated.",
      type: "poor"
    },
    {
      text: "That’s fine, I didn’t want to go anyway.",
      feedback: "Covers hurt with denial.",
      type: "neutral"
    },
    {
      text: "I was sad not to be there, but I hope you had fun.",
      feedback: "Balanced and mature.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, I felt left out when I heard about your party. Can we talk?",
  correctExplanation: "Naming feelings calmly invites understanding.",
  tip: "Empathy also means expressing yourself kindly."
},
{
  id: 29,
  category: "Friendship",
  title: "Friend Is Moving Seats",
  situation: "Your deskmate is being moved to another part of the classroom.",
  emotion: { icon: "😔", label: "Sad" },
  responses: [
    {
      text: "I’ll miss sitting next to you. Let’s still chat at lunch.",
      feedback: "Warm and caring.",
      type: "best"
    },
    {
      text: "Guess I’ll get a new partner now.",
      feedback: "Cold and detached.",
      type: "poor"
    },
    {
      text: "That’s okay, it’ll be different for both of us.",
      feedback: "Neutral and fair.",
      type: "neutral"
    },
    {
      text: "We’ll still be friends even if we don’t sit together.",
      feedback: "Positive reassurance.",
      type: "good"
    }
  ],
  correctAnswer: "I’ll miss sitting next to you. Let’s still chat at lunch.",
  correctExplanation: "Expressing care keeps friendship strong.",
  tip: "Change doesn’t end connection."
},
{
  id: 30,
  category: "Friendship",
  title: "Friend Is Late to Meet",
  situation: "Your friend shows up late to hang out and looks rushed.",
  emotion: { icon: "😬", label: "Sorry" },
  responses: [
    {
      text: "No worries, I’m just glad you made it!",
      feedback: "Forgiving and relaxed.",
      type: "best"
    },
    {
      text: "You’re always late.",
      feedback: "Critical and negative.",
      type: "poor"
    },
    {
      text: "It’s fine, but next time text me.",
      feedback: "Polite reminder, balanced tone.",
      type: "good"
    },
    {
      text: "I almost left without you.",
      feedback: "Frustrated but not mean.",
      type: "neutral"
    }
  ],
  correctAnswer: "No worries, I’m just glad you made it!",
  correctExplanation: "Forgiveness keeps plans fun and friendly.",
  tip: "Empathy means choosing patience over anger."
},
{
  id: 31,
  category: "Friendship",
  title: "Friend Is Feeling Sick",
  situation: "Your friend says they don’t feel well during class.",
  emotion: { icon: "🤒", label: "Unwell" },
  responses: [
    {
      text: "Do you want me to tell the teacher for you?",
      feedback: "Caring and responsible.",
      type: "best"
    },
    {
      text: "You should’ve stayed home.",
      feedback: "Critical instead of helpful.",
      type: "poor"
    },
    {
      text: "Hope you feel better soon.",
      feedback: "Kind but passive.",
      type: "good"
    },
    {
      text: "Don’t cough near me!",
      feedback: "Rude and insensitive.",
      type: "neutral"
    }
  ],
  correctAnswer: "Do you want me to tell the teacher for you?",
  correctExplanation: "Empathy means helping when someone’s uncomfortable.",
  tip: "Kind actions matter more than words."
},
{
  id: 32,
  category: "Friendship",
  title: "Friend Forgot Their Lunch",
  situation: "At lunch, your friend realizes they forgot to bring food.",
  emotion: { icon: "🍱", label: "Hungry" },
  responses: [
    {
      text: "You can share mine if you want.",
      feedback: "Generous and kind — great empathy.",
      type: "best"
    },
    {
      text: "Ask the teacher for help.",
      feedback: "Practical but distant.",
      type: "good"
    },
    {
      text: "Too bad, I’m starving too.",
      feedback: "Unhelpful.",
      type: "poor"
    },
    {
      text: "I’ll eat fast so you don’t feel bad.",
      feedback: "Awkward and unhelpful.",
      type: "neutral"
    }
  ],
  correctAnswer: "You can share mine if you want.",
  correctExplanation: "Sharing helps friends feel cared for and included.",
  tip: "Empathy often means giving a little of what you have."
},
{
  id: 33,
  category: "Friendship",
  title: "Friend Didn’t Do Well in Sports",
  situation: "Your friend was disappointed after losing a sports match.",
  emotion: { icon: "😔", label: "Disappointed" },
  responses: [
    {
      text: "You played really well — that was a tough game.",
      feedback: "Positive and realistic encouragement.",
      type: "best"
    },
    {
      text: "Maybe you’re not good at that sport.",
      feedback: "Critical, not kind.",
      type: "poor"
    },
    {
      text: "Don’t be sad; it’s just a game.",
      feedback: "Tries to help but downplays their effort.",
      type: "neutral"
    },
    {
      text: "Next time I’ll help you train.",
      feedback: "Supportive and hopeful.",
      type: "good"
    }
  ],
  correctAnswer: "You played really well — that was a tough game.",
  correctExplanation: "Acknowledging effort instead of outcome builds resilience.",
  tip: "Encouragement keeps motivation alive."
},
{
  id: 34,
  category: "Friendship",
  title: "Friend Missed the Bus",
  situation: "Your friend missed the school bus and looks panicked.",
  emotion: { icon: "😣", label: "Stressed" },
  responses: [
    {
      text: "It’s okay, I’ll wait with you while you call home.",
      feedback: "Supportive and thoughtful.",
      type: "best"
    },
    {
      text: "Well, that’s your problem.",
      feedback: "Dismissive and unkind.",
      type: "poor"
    },
    {
      text: "You should hurry next time.",
      feedback: "Critical, not comforting.",
      type: "neutral"
    },
    {
      text: "Want me to tell a teacher?",
      feedback: "Helpful and caring.",
      type: "good"
    }
  ],
  correctAnswer: "It’s okay, I’ll wait with you while you call home.",
  correctExplanation: "Empathy means staying with someone who feels anxious.",
  tip: "Presence can be the best comfort."
},
{
  id: 35,
  category: "Friendship",
  title: "Friend Is Having a Bad Day",
  situation: "Your friend says everything is going wrong today.",
  emotion: { icon: "😩", label: "Overwhelmed" },
  responses: [
    {
      text: "Sounds like a rough day. Want to talk or just chill for a bit?",
      feedback: "Offers choice and understanding.",
      type: "best"
    },
    {
      text: "Cheer up, it’s not that bad.",
      feedback: "Minimizes their feelings.",
      type: "neutral"
    },
    {
      text: "That’s nothing, my day was worse.",
      feedback: "Turns focus to yourself.",
      type: "poor"
    },
    {
      text: "Let’s do something fun to take your mind off it.",
      feedback: "Supportive distraction.",
      type: "good"
    }
  ],
  correctAnswer: "Sounds like a rough day. Want to talk or just chill for a bit?",
  correctExplanation: "Letting them choose shows empathy and respect.",
  tip: "Sometimes listening is the best help."
},
{
  id: 36,
  category: "Friendship",
  title: "Friend Is Excited About Something Small",
  situation: "Your friend is thrilled about getting a small prize in class.",
  emotion: { icon: "😁", label: "Happy" },
  responses: [
    {
      text: "That’s awesome! You deserve it!",
      feedback: "Shares their excitement — excellent empathy.",
      type: "best"
    },
    {
      text: "It’s not a big deal.",
      feedback: "Downplays their joy.",
      type: "poor"
    },
    {
      text: "Nice! What did you win?",
      feedback: "Shows interest and positivity.",
      type: "good"
    },
    {
      text: "Cool, I guess.",
      feedback: "Neutral and lukewarm.",
      type: "neutral"
    }
  ],
  correctAnswer: "That’s awesome! You deserve it!",
  correctExplanation: "Empathy means matching someone’s positive feelings.",
  tip: "Celebrate even small wins with your friends."
},
{
  id: 37,
  category: "Friendship",
  title: "Friend Was Left Out of a Joke",
  situation: "Your group laughed at a joke your friend didn’t understand.",
  emotion: { icon: "😕", label: "Left Out" },
  responses: [
    {
      text: "Oh, we were talking about something from earlier — want me to fill you in?",
      feedback: "Inclusive and thoughtful.",
      type: "best"
    },
    {
      text: "Never mind, you wouldn’t get it.",
      feedback: "Excludes and embarrasses.",
      type: "poor"
    },
    {
      text: "It was nothing important.",
      feedback: "Avoids embarrassment but still excludes.",
      type: "neutral"
    },
    {
      text: "Sorry, that probably felt awkward.",
      feedback: "Acknowledges but doesn’t fix inclusion.",
      type: "good"
    }
  ],
  correctAnswer: "Oh, we were talking about something from earlier — want me to fill you in?",
  correctExplanation: "Including someone after they feel left out repairs connection.",
  tip: "Inclusion makes everyone feel they belong."
},
{
  id: 38,
  category: "Friendship",
  title: "Friend Didn’t Win a Prize",
  situation: "Your friend didn’t win in a school competition and looks disappointed.",
  emotion: { icon: "😞", label: "Disappointed" },
  responses: [
    {
      text: "You worked hard — that’s what really matters.",
      feedback: "Focuses on effort, not outcome.",
      type: "best"
    },
    {
      text: "You’ll never win if you don’t try harder.",
      feedback: "Critical and discouraging.",
      type: "poor"
    },
    {
      text: "You’ll win next time, don’t worry.",
      feedback: "Encouraging but simple.",
      type: "good"
    },
    {
      text: "Lots of people lost too.",
      feedback: "Minimizes their disappointment.",
      type: "neutral"
    }
  ],
  correctAnswer: "You worked hard — that’s what really matters.",
  correctExplanation: "Recognizing effort supports emotional resilience.",
  tip: "Empathy celebrates effort, not just success."
},
{
  id: 39,
  category: "Friendship",
  title: "Friend Borrowed and Forgot",
  situation: "Your friend borrowed your notebook and forgot to return it.",
  emotion: { icon: "🤦‍♂️", label: "Forgetful" },
  responses: [
    {
      text: "Hey, could you bring my notebook tomorrow? No worries if you forgot.",
      feedback: "Polite and understanding.",
      type: "best"
    },
    {
      text: "You always forget things.",
      feedback: "Annoyed and blaming.",
      type: "poor"
    },
    {
      text: "It’s fine, I’ll just get another one.",
      feedback: "Forgiving but avoids the issue.",
      type: "neutral"
    },
    {
      text: "Can I grab it from you after class?",
      feedback: "Practical and polite.",
      type: "good"
    }
  ],
  correctAnswer: "Hey, could you bring my notebook tomorrow? No worries if you forgot.",
  correctExplanation: "Gentle reminders keep trust without tension.",
  tip: "Empathy communicates kindly, even in small frustrations."
},
{
  id: 40,
  category: "Friendship",
  title: "Friend Is New to the Group Chat",
  situation: "Your friend just joined a new class group chat and isn’t saying much.",
  emotion: { icon: "💬", label: "Shy" },
  responses: [
    {
      text: "Hey everyone, this is my friend! They’re super nice.",
      feedback: "Warm introduction that helps them feel welcome.",
      type: "best"
    },
    {
      text: "They’ll talk when they want to.",
      feedback: "Neutral but misses a chance to include.",
      type: "neutral"
    },
    {
      text: "Don’t spam the chat, they’re new.",
      feedback: "Protective but awkward.",
      type: "good"
    },
    {
      text: "Why aren’t you saying anything?",
      feedback: "Puts pressure on them.",
      type: "poor"
    }
  ],
  correctAnswer: "Hey everyone, this is my friend! They’re super nice.",
  correctExplanation: "Introducing someone warmly helps them feel included right away.",
  tip: "Empathy brings people into the circle."
}

];
