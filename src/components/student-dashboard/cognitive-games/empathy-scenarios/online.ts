import { EmpathyScenario } from './types';

export const onlineScenarios: EmpathyScenario[] = [
 {
  id: 161,
  category: "Online",
  title: "Someone Posts an Embarrassing Photo",
  situation: "A classmate posts a photo of another student in a funny but embarrassing moment.",
  emotion: { icon: "📸", label: "Embarrassed" },
  responses: [
    {
      text: "Ask them to take it down — it might hurt the person’s feelings.",
      feedback: "Respectful and empathetic.",
      type: "best"
    },
    {
      text: "Share it with others for fun.",
      feedback: "Insensitive and harmful.",
      type: "poor"
    },
    {
      text: "Ignore it and scroll past.",
      feedback: "Neutral but avoids responsibility.",
      type: "neutral"
    },
    {
      text: "Message them privately and explain why it’s not okay.",
      feedback: "Kind and responsible.",
      type: "good"
    }
  ],
  correctAnswer: "Ask them to take it down — it might hurt the person’s feelings.",
  correctExplanation: "Empathy online means protecting others from public embarrassment.",
  tip: "Think before you share — kindness first."
},
{
  id: 162,
  category: "Online",
  title: "Receiving a Mean Comment",
  situation: "You post a photo and someone comments something unkind.",
  emotion: { icon: "💬", label: "Hurt" },
  responses: [
    {
      text: "Ignore the comment and avoid replying angrily.",
      feedback: "Calm and mature.",
      type: "best"
    },
    {
      text: "Reply with a rude message back.",
      feedback: "Escalates conflict.",
      type: "poor"
    },
    {
      text: "Delete the post immediately.",
      feedback: "Avoids the issue but not harmful.",
      type: "neutral"
    },
    {
      text: "Tell a trusted adult or report the comment.",
      feedback: "Smart and safe response.",
      type: "good"
    }
  ],
  correctAnswer: "Ignore the comment and avoid replying angrily.",
  correctExplanation: "Empathy means staying calm and protecting your peace online.",
  tip: "Not every comment deserves your energy."
},
{
  id: 163,
  category: "Online",
  title: "Friend Shares Private Message",
  situation: "You sent a private message, and your friend shares it with others.",
  emotion: { icon: "📱", label: "Betrayed" },
  responses: [
    {
      text: "Talk to your friend calmly about how that made you feel.",
      feedback: "Honest and constructive.",
      type: "best"
    },
    {
      text: "Post something mean about them in return.",
      feedback: "Revenge, not resolution.",
      type: "poor"
    },
    {
      text: "Ignore them completely from now on.",
      feedback: "Avoids but doesn’t solve the issue.",
      type: "neutral"
    },
    {
      text: "Ask them to delete it and not repeat it.",
      feedback: "Polite and responsible.",
      type: "good"
    }
  ],
  correctAnswer: "Talk to your friend calmly about how that made you feel.",
  correctExplanation: "Empathy means expressing your feelings instead of reacting harshly.",
  tip: "Speak up with respect when someone crosses boundaries."
},
{
  id: 164,
  category: "Online",
  title: "Group Chat Exclusion",
  situation: "You find out your friends made a new group chat without you.",
  emotion: { icon: "😔", label: "Left Out" },
  responses: [
    {
      text: "Ask them kindly if you did something that upset them.",
      feedback: "Mature and empathetic.",
      type: "best"
    },
    {
      text: "Create your own group to exclude them back.",
      feedback: "Petty and divisive.",
      type: "poor"
    },
    {
      text: "Pretend it doesn’t bother you.",
      feedback: "Neutral but hides feelings.",
      type: "neutral"
    },
    {
      text: "Talk to one friend privately to understand the situation.",
      feedback: "Calm and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "Ask them kindly if you did something that upset them.",
  correctExplanation: "Empathy seeks understanding instead of retaliation.",
  tip: "Clear communication can repair friendships."
},
{
  id: 165,
  category: "Online",
  title: "Forwarding a Rumor",
  situation: "You receive a message claiming something shocking about a classmate.",
  emotion: { icon: "📲", label: "Curious" },
  responses: [
    {
      text: "Don’t forward it — false news can really hurt someone.",
      feedback: "Responsible and kind.",
      type: "best"
    },
    {
      text: "Share it with a few friends just to see their reactions.",
      feedback: "Spreads harm.",
      type: "poor"
    },
    {
      text: "Ask who sent it before deciding.",
      feedback: "Cautious but uncertain.",
      type: "neutral"
    },
    {
      text: "Delete it and tell others not to spread it.",
      feedback: "Proactive and positive.",
      type: "good"
    }
  ],
  correctAnswer: "Don’t forward it — false news can really hurt someone.",
  correctExplanation: "Empathy means protecting others’ reputation and privacy.",
  tip: "If it’s not kind or true, don’t share it."
},
{
  id: 166,
  category: "Online",
  title: "Friend Oversharing Personal Info",
  situation: "A friend posts personal details like their home address online.",
  emotion: { icon: "⚠️", label: "Worried" },
  responses: [
    {
      text: "Message them privately and suggest they delete it for safety.",
      feedback: "Caring and wise.",
      type: "best"
    },
    {
      text: "Comment publicly warning them in front of everyone.",
      feedback: "Good intention but embarrassing.",
      type: "neutral"
    },
    {
      text: "Ignore it — it’s their choice.",
      feedback: "Avoids responsibility.",
      type: "poor"
    },
    {
      text: "Talk to an adult if they don’t remove it.",
      feedback: "Responsible and cautious.",
      type: "good"
    }
  ],
  correctAnswer: "Message them privately and suggest they delete it for safety.",
  correctExplanation: "Empathy cares for others’ safety without shaming them.",
  tip: "Kind advice works better privately."
},
{
  id: 167,
  category: "Online",
  title: "Online Game Teasing",
  situation: "A player in your game is getting teased by others for losing.",
  emotion: { icon: "🎮", label: "Embarrassed" },
  responses: [
    {
      text: "Tell others to chill — it’s just a game.",
      feedback: "Protective and fair.",
      type: "best"
    },
    {
      text: "Join in teasing for fun.",
      feedback: "Mean and immature.",
      type: "poor"
    },
    {
      text: "Say nothing and keep playing.",
      feedback: "Neutral but avoids empathy.",
      type: "neutral"
    },
    {
      text: "Send the player a message like ‘Don’t worry, you did fine!’",
      feedback: "Encouraging and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Tell others to chill — it’s just a game.",
  correctExplanation: "Empathy defends others without creating more conflict.",
  tip: "Games are more fun when everyone feels safe."
},
{
  id: 168,
  category: "Online",
  title: "Posting Without Consent",
  situation: "You took a funny video of your friend and want to post it.",
  emotion: { icon: "🤳", label: "Excited" },
  responses: [
    {
      text: "Ask your friend first if they’re okay with it.",
      feedback: "Respectful and kind.",
      type: "best"
    },
    {
      text: "Post it anyway — they’ll laugh later.",
      feedback: "Disrespectful to privacy.",
      type: "poor"
    },
    {
      text: "Send it only to close friends.",
      feedback: "Less public but still not consented.",
      type: "neutral"
    },
    {
      text: "Show them first and post only if they agree.",
      feedback: "Considerate and responsible.",
      type: "good"
    }
  ],
  correctAnswer: "Ask your friend first if they’re okay with it.",
  correctExplanation: "Empathy means valuing others’ comfort over your excitement.",
  tip: "Always ask before posting anything about someone."
},
{
  id: 169,
  category: "Online",
  title: "Friend Pretends to Be Someone Else",
  situation: "A friend creates a fake account pretending to be another student as a joke.",
  emotion: { icon: "🎭", label: "Playful" },
  responses: [
    {
      text: "Tell them it’s wrong and could hurt someone.",
      feedback: "Honest and responsible.",
      type: "best"
    },
    {
      text: "Laugh and follow the account.",
      feedback: "Encourages harmful behavior.",
      type: "poor"
    },
    {
      text: "Ignore it and do nothing.",
      feedback: "Neutral but not helpful.",
      type: "neutral"
    },
    {
      text: "Report the account if they don’t stop.",
      feedback: "Safe and responsible action.",
      type: "good"
    }
  ],
  correctAnswer: "Tell them it’s wrong and could hurt someone.",
  correctExplanation: "Empathy means speaking up when others cross ethical lines online.",
  tip: "Digital kindness means honesty, not pretending."
},
{
  id: 170,
  category: "Online",
  title: "Sharing Positive Comments",
  situation: "You see a classmate post about their artwork online.",
  emotion: { icon: "🎨", label: "Proud" },
  responses: [
    {
      text: "Leave a nice comment appreciating their effort.",
      feedback: "Encouraging and uplifting.",
      type: "best"
    },
    {
      text: "Say nothing — others already commented.",
      feedback: "Neutral but misses a chance to spread positivity.",
      type: "neutral"
    },
    {
      text: "Compare it to your work to show you’re better.",
      feedback: "Jealous and negative.",
      type: "poor"
    },
    {
      text: "Share their post and say ‘Great work!’",
      feedback: "Supportive and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Leave a nice comment appreciating their effort.",
  correctExplanation: "Empathy celebrates others’ creativity genuinely.",
  tip: "Kind words online can brighten someone’s entire day."
},
{
  id: 171,
  category: "Online",
  title: "Friend Spreads a Meme About Someone",
  situation: "Your friend shares a meme making fun of a classmate.",
  emotion: { icon: "😂", label: "Amused" },
  responses: [
    {
      text: "Tell your friend it could hurt the person and ask them to stop sharing it.",
      feedback: "Caring and responsible.",
      type: "best"
    },
    {
      text: "Share it too — it’s just a joke.",
      feedback: "Insensitive and unkind.",
      type: "poor"
    },
    {
      text: "Say nothing and scroll past.",
      feedback: "Neutral but ignores harm.",
      type: "neutral"
    },
    {
      text: "Message your friend privately about why it’s not funny.",
      feedback: "Gentle and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "Tell your friend it could hurt the person and ask them to stop sharing it.",
  correctExplanation: "Empathy online means standing up for others’ dignity.",
  tip: "Laugh with kindness, not at someone."
},
{
  id: 172,
  category: "Online",
  title: "Getting Left on Read",
  situation: "You message a friend, but they see it and don’t reply.",
  emotion: { icon: "👀", label: "Ignored" },
  responses: [
    {
      text: "Give them space — they might be busy.",
      feedback: "Patient and understanding.",
      type: "best"
    },
    {
      text: "Send an angry follow-up message.",
      feedback: "Pushy and emotional.",
      type: "poor"
    },
    {
      text: "Post something dramatic about being ignored.",
      feedback: "Passive-aggressive and immature.",
      type: "neutral"
    },
    {
      text: "Message them later asking if everything’s okay.",
      feedback: "Kind and curious.",
      type: "good"
    }
  ],
  correctAnswer: "Give them space — they might be busy.",
  correctExplanation: "Empathy respects others’ time and avoids assumptions.",
  tip: "People aren’t always ignoring you — sometimes they’re just occupied."
},
{
  id: 173,
  category: "Online",
  title: "Accidentally Sending a Wrong Message",
  situation: "You send a private message to the wrong person by mistake.",
  emotion: { icon: "😳", label: "Embarrassed" },
  responses: [
    {
      text: "Apologize right away and explain it was an accident.",
      feedback: "Honest and responsible.",
      type: "best"
    },
    {
      text: "Pretend it wasn’t you.",
      feedback: "Dishonest and confusing.",
      type: "poor"
    },
    {
      text: "Ignore it and hope they forget.",
      feedback: "Neutral but risky.",
      type: "neutral"
    },
    {
      text: "Laugh it off politely and clarify.",
      feedback: "Lighthearted and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Apologize right away and explain it was an accident.",
  correctExplanation: "Empathy online also means taking responsibility quickly.",
  tip: "A simple apology can fix most digital slips."
},
{
  id: 174,
  category: "Online",
  title: "Friend Posts Something Sad",
  situation: "A friend posts a message that sounds upset or hopeless.",
  emotion: { icon: "😢", label: "Sad" },
  responses: [
    {
      text: "Message them privately and ask if they’re okay.",
      feedback: "Caring and brave.",
      type: "best"
    },
    {
      text: "Just like the post to show you saw it.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Ignore it — you don’t want to get involved.",
      feedback: "Uncaring and detached.",
      type: "poor"
    },
    {
      text: "Leave a kind comment like ‘We’re here for you.’",
      feedback: "Supportive and positive.",
      type: "good"
    }
  ],
  correctAnswer: "Message them privately and ask if they’re okay.",
  correctExplanation: "Empathy checks in personally, not just publicly.",
  tip: "A small message can make a big difference to someone struggling."
},
{
  id: 175,
  category: "Online",
  title: "Rumor in a Group Chat",
  situation: "Someone starts spreading a rumor about a classmate in your group chat.",
  emotion: { icon: "💬", label: "Gossip" },
  responses: [
    {
      text: "Ask them to stop — spreading rumors can really hurt people.",
      feedback: "Courageous and respectful.",
      type: "best"
    },
    {
      text: "Laugh along so you fit in.",
      feedback: "Peer pressure and unkind.",
      type: "poor"
    },
    {
      text: "Stay silent until the topic changes.",
      feedback: "Neutral but avoids taking a stand.",
      type: "neutral"
    },
    {
      text: "Defend the person and change the subject kindly.",
      feedback: "Empathetic and strategic.",
      type: "good"
    }
  ],
  correctAnswer: "Ask them to stop — spreading rumors can really hurt people.",
  correctExplanation: "Empathy stands against gossip even when it’s awkward.",
  tip: "True friends don’t spread others’ secrets."
},
{
  id: 176,
  category: "Online",
  title: "Friend Uses Too Many Filters",
  situation: "Your friend posts heavily edited photos of themselves often.",
  emotion: { icon: "📷", label: "Insecure" },
  responses: [
    {
      text: "Compliment their confidence and remind them they look great naturally.",
      feedback: "Kind and reassuring.",
      type: "best"
    },
    {
      text: "Make fun of how fake their pictures look.",
      feedback: "Cruel and mocking.",
      type: "poor"
    },
    {
      text: "Say nothing about it.",
      feedback: "Neutral but unhelpful.",
      type: "neutral"
    },
    {
      text: "Message privately saying they don’t need to edit so much.",
      feedback: "Supportive and honest.",
      type: "good"
    }
  ],
  correctAnswer: "Compliment their confidence and remind them they look great naturally.",
  correctExplanation: "Empathy builds self-esteem instead of judging appearances.",
  tip: "Kind words online boost real confidence."
},
{
  id: 177,
  category: "Online",
  title: "Gaming Rage",
  situation: "During an online match, a teammate makes a mistake and others start yelling.",
  emotion: { icon: "🔥", label: "Frustrated" },
  responses: [
    {
      text: "Say, ‘It’s okay, we’ll get it next round!’",
      feedback: "Calm and encouraging.",
      type: "best"
    },
    {
      text: "Join in shouting at the player.",
      feedback: "Negative and toxic.",
      type: "poor"
    },
    {
      text: "Mute everyone and ignore it.",
      feedback: "Neutral but avoids empathy.",
      type: "neutral"
    },
    {
      text: "Defend the player and remind the team to chill.",
      feedback: "Protective and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Say, ‘It’s okay, we’ll get it next round!’",
  correctExplanation: "Empathy keeps games fun and friendly for everyone.",
  tip: "Good teammates lift others up, not tear them down."
},
{
  id: 178,
  category: "Online",
  title: "Fake News Article",
  situation: "You see an article online with shocking claims but no source.",
  emotion: { icon: "📰", label: "Skeptical" },
  responses: [
    {
      text: "Check if it’s from a trusted site before sharing.",
      feedback: "Smart and responsible.",
      type: "best"
    },
    {
      text: "Share it right away because it looks interesting.",
      feedback: "Reckless and misleading.",
      type: "poor"
    },
    {
      text: "Ignore it completely.",
      feedback: "Safe but unhelpful to others.",
      type: "neutral"
    },
    {
      text: "Comment asking for a source politely.",
      feedback: "Inquisitive and responsible.",
      type: "good"
    }
  ],
  correctAnswer: "Check if it’s from a trusted site before sharing.",
  correctExplanation: "Empathy includes protecting others from misinformation.",
  tip: "Think twice before you click ‘share.’"
},
{
  id: 179,
  category: "Online",
  title: "Sharing Too Much Online",
  situation: "Your classmate often posts personal feelings and fights publicly.",
  emotion: { icon: "😕", label: "Upset" },
  responses: [
    {
      text: "Message them privately to check if they’re okay.",
      feedback: "Caring and safe.",
      type: "best"
    },
    {
      text: "Comment things like ‘Stop being dramatic.’",
      feedback: "Insensitive and rude.",
      type: "poor"
    },
    {
      text: "Unfollow them quietly.",
      feedback: "Neutral self-boundary.",
      type: "neutral"
    },
    {
      text: "Encourage them to talk to someone they trust.",
      feedback: "Empathetic and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "Message them privately to check if they’re okay.",
  correctExplanation: "Empathy helps others feel seen without judging.",
  tip: "Private concern shows true care."
},
{
  id: 180,
  category: "Online",
  title: "Joining a New Online Group",
  situation: "You join a new online study group and don’t know anyone yet.",
  emotion: { icon: "👋", label: "Nervous" },
  responses: [
    {
      text: "Introduce yourself politely and participate respectfully.",
      feedback: "Confident and friendly.",
      type: "best"
    },
    {
      text: "Spam messages so people notice you.",
      feedback: "Annoying and disruptive.",
      type: "poor"
    },
    {
      text: "Stay silent and just watch for a long time.",
      feedback: "Neutral but disengaged.",
      type: "neutral"
    },
    {
      text: "Send a simple ‘Hi everyone!’ message.",
      feedback: "Polite and approachable.",
      type: "good"
    }
  ],
  correctAnswer: "Introduce yourself politely and participate respectfully.",
  correctExplanation: "Empathy makes online spaces welcoming for everyone.",
  tip: "A kind hello sets the tone for good communication."
},
{
  id: 181,
  category: "Online",
  title: "Someone Gets Cyberbullied",
  situation: "You see a student being bullied in the comments section of a post.",
  emotion: { icon: "😞", label: "Upset" },
  responses: [
    {
      text: "Report the comments and message the student to show support.",
      feedback: "Caring and proactive.",
      type: "best"
    },
    {
      text: "Join in with a joke to fit in.",
      feedback: "Cruel and harmful.",
      type: "poor"
    },
    {
      text: "Ignore it — it’s not your problem.",
      feedback: "Neutral but avoids empathy.",
      type: "neutral"
    },
    {
      text: "Comment something kind to balance the negativity.",
      feedback: "Supportive and brave.",
      type: "good"
    }
  ],
  correctAnswer: "Report the comments and message the student to show support.",
  correctExplanation: "Empathy means taking safe action to protect others online.",
  tip: "Be the voice that stands up for kindness."
},
{
  id: 182,
  category: "Online",
  title: "Accidental Offensive Post",
  situation: "Your friend posts a meme that unintentionally offends a community group.",
  emotion: { icon: "🫢", label: "Unaware" },
  responses: [
    {
      text: "Tell your friend politely that the post could be hurtful.",
      feedback: "Caring and respectful.",
      type: "best"
    },
    {
      text: "Comment publicly calling them out harshly.",
      feedback: "Embarrasses them instead of educating.",
      type: "poor"
    },
    {
      text: "Say nothing — it’s not your business.",
      feedback: "Neutral but avoids helping.",
      type: "neutral"
    },
    {
      text: "Send them a private message explaining the issue calmly.",
      feedback: "Empathetic and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "Tell your friend politely that the post could be hurtful.",
  correctExplanation: "Empathy educates gently without shaming others.",
  tip: "Correct privately, praise publicly."
},
{
  id: 183,
  category: "Online",
  title: "Online Class Disruption",
  situation: "During an online class, some students keep interrupting the teacher for fun.",
  emotion: { icon: "🧑‍🏫", label: "Annoyed" },
  responses: [
    {
      text: "Stay quiet and focus on the lesson.",
      feedback: "Respectful and mature.",
      type: "best"
    },
    {
      text: "Join in to make everyone laugh.",
      feedback: "Disruptive and disrespectful.",
      type: "poor"
    },
    {
      text: "Mute your mic and wait patiently.",
      feedback: "Calm and polite.",
      type: "good"
    },
    {
      text: "Complain in the chat angrily.",
      feedback: "Frustrated but not constructive.",
      type: "neutral"
    }
  ],
  correctAnswer: "Stay quiet and focus on the lesson.",
  correctExplanation: "Empathy respects teachers and classmates’ learning time.",
  tip: "Silence can sometimes be the best form of respect."
},
{
  id: 184,
  category: "Online",
  title: "Sharing Someone’s Art Without Credit",
  situation: "You find a cool digital drawing online and want to repost it.",
  emotion: { icon: "🎨", label: "Impressed" },
  responses: [
    {
      text: "Ask permission and give credit to the artist.",
      feedback: "Respectful and honest.",
      type: "best"
    },
    {
      text: "Save and repost without credit.",
      feedback: "Stealing someone’s work.",
      type: "poor"
    },
    {
      text: "Post it and say ‘Not mine’ without tagging the creator.",
      feedback: "Better, but still incomplete.",
      type: "neutral"
    },
    {
      text: "Comment praising the artist and share their original post instead.",
      feedback: "Supportive and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Ask permission and give credit to the artist.",
  correctExplanation: "Empathy respects others’ effort and creativity.",
  tip: "Creators deserve credit for their work."
},
{
  id: 185,
  category: "Online",
  title: "Friend Shares Fake Health Tip",
  situation: "Your friend forwards a health post that seems wrong.",
  emotion: { icon: "💊", label: "Concerned" },
  responses: [
    {
      text: "Check a reliable source and tell them politely it might be fake.",
      feedback: "Helpful and factual.",
      type: "best"
    },
    {
      text: "Ignore it — it’s not serious.",
      feedback: "Neutral but misses a chance to prevent harm.",
      type: "neutral"
    },
    {
      text: "Share it too without checking.",
      feedback: "Spreads misinformation.",
      type: "poor"
    },
    {
      text: "Comment with a verified link explaining the truth.",
      feedback: "Informative and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Check a reliable source and tell them politely it might be fake.",
  correctExplanation: "Empathy prevents harm by promoting truth online.",
  tip: "Think before sharing anything health-related."
},
{
  id: 186,
  category: "Online",
  title: "Teammate Gets Disconnected",
  situation: "In an online game, your teammate suddenly disconnects during a match.",
  emotion: { icon: "⚡", label: "Frustrated" },
  responses: [
    {
      text: "Wait for them or cover for them calmly.",
      feedback: "Patient and kind.",
      type: "best"
    },
    {
      text: "Complain loudly about losing because of them.",
      feedback: "Negative and harsh.",
      type: "poor"
    },
    {
      text: "Say nothing but feel annoyed.",
      feedback: "Neutral but unhelpful.",
      type: "neutral"
    },
    {
      text: "Type in chat, ‘It’s okay, we got this!’",
      feedback: "Encouraging and positive.",
      type: "good"
    }
  ],
  correctAnswer: "Wait for them or cover for them calmly.",
  correctExplanation: "Empathy understands that tech issues happen to everyone.",
  tip: "Patience builds teamwork, even online."
},
{
  id: 187,
  category: "Online",
  title: "Private Info Leak",
  situation: "Someone accidentally shares a document with everyone that includes personal info.",
  emotion: { icon: "📂", label: "Exposed" },
  responses: [
    {
      text: "Let them know privately so they can fix it fast.",
      feedback: "Respectful and discreet.",
      type: "best"
    },
    {
      text: "Tell everyone in the group about it.",
      feedback: "Embarrassing and unkind.",
      type: "poor"
    },
    {
      text: "Ignore it and move on.",
      feedback: "Neutral but doesn’t help.",
      type: "neutral"
    },
    {
      text: "Delete the document and message them to re-upload safely.",
      feedback: "Helpful and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Let them know privately so they can fix it fast.",
  correctExplanation: "Empathy protects others’ privacy and dignity.",
  tip: "Handle others’ information with care."
},
{
  id: 188,
  category: "Online",
  title: "Rude Message in a Group Chat",
  situation: "Someone posts a rude message to a classmate in a shared group chat.",
  emotion: { icon: "😠", label: "Angry" },
  responses: [
    {
      text: "Ask them to stop and remind everyone to be respectful.",
      feedback: "Brave and fair.",
      type: "best"
    },
    {
      text: "Laugh at the message.",
      feedback: "Encourages disrespect.",
      type: "poor"
    },
    {
      text: "Stay silent until it ends.",
      feedback: "Neutral but uninvolved.",
      type: "neutral"
    },
    {
      text: "Send a positive message to calm things down.",
      feedback: "Peaceful and mature.",
      type: "good"
    }
  ],
  correctAnswer: "Ask them to stop and remind everyone to be respectful.",
  correctExplanation: "Empathy defends others without fighting back harshly.",
  tip: "Kind firmness earns respect online."
},
{
  id: 189,
  category: "Online",
  title: "Receiving a Chain Message",
  situation: "You get a chain message that says something bad will happen if you don’t forward it.",
  emotion: { icon: "🔗", label: "Scared" },
  responses: [
    {
      text: "Ignore and delete it — it’s just spam.",
      feedback: "Smart and calm.",
      type: "best"
    },
    {
      text: "Forward it just in case.",
      feedback: "Spreads fear and misinformation.",
      type: "poor"
    },
    {
      text: "Ask your friends if they got it too.",
      feedback: "Curious but spreads the topic.",
      type: "neutral"
    },
    {
      text: "Report it as spam.",
      feedback: "Proactive and safe.",
      type: "good"
    }
  ],
  correctAnswer: "Ignore and delete it — it’s just spam.",
  correctExplanation: "Empathy online means avoiding panic and misinformation.",
  tip: "If it sounds scary and unbelievable — it’s probably fake."
},
{
  id: 190,
  category: "Online",
  title: "Friend’s Account Gets Hacked",
  situation: "Your friend’s social media account starts posting strange links.",
  emotion: { icon: "🔒", label: "Concerned" },
  responses: [
    {
      text: "Tell your friend immediately through another way.",
      feedback: "Responsible and loyal.",
      type: "best"
    },
    {
      text: "Click the links to check them out.",
      feedback: "Unsafe and careless.",
      type: "poor"
    },
    {
      text: "Report the account to the platform.",
      feedback: "Helpful and safe.",
      type: "good"
    },
    {
      text: "Unfollow them quietly.",
      feedback: "Neutral but avoids helping.",
      type: "neutral"
    }
  ],
  correctAnswer: "Tell your friend immediately through another way.",
  correctExplanation: "Empathy protects friends' online safety.",
  tip: "Alert, don't ignore — that's true online friendship."
},
{
  id: 191,
  category: "Online",
  title: "Admitting a Mistake Online",
  situation: "You posted something that turned out to be incorrect.",
  emotion: { icon: "😬", label: "Embarrassed" },
  responses: [
    {
      text: "Edit or delete the post and admit your mistake politely.",
      feedback: "Honest and humble.",
      type: "best"
    },
    {
      text: "Ignore it and hope no one notices.",
      feedback: "Avoids responsibility.",
      type: "neutral"
    },
    {
      text: "Argue with anyone who corrects you.",
      feedback: "Defensive and immature.",
      type: "poor"
    },
    {
      text: "Thank the person who corrected you and fix it.",
      feedback: "Respectful and open-minded.",
      type: "good"
    }
  ],
  correctAnswer: "Edit or delete the post and admit your mistake politely.",
  correctExplanation: "Empathy includes honesty and respect for truth online.",
  tip: "Owning up online earns more respect than pretending."
},
{
  id: 192,
  category: "Online",
  title: "Supporting a New Creator",
  situation: "A new student starts a YouTube channel and gets few views.",
  emotion: { icon: "📹", label: "Discouraged" },
  responses: [
    {
      text: "Watch and leave a kind comment to encourage them.",
      feedback: "Supportive and uplifting.",
      type: "best"
    },
    {
      text: "Make fun of their low views.",
      feedback: "Cruel and discouraging.",
      type: "poor"
    },
    {
      text: "Ignore it completely.",
      feedback: "Neutral but misses kindness.",
      type: "neutral"
    },
    {
      text: "Share their video once to show support.",
      feedback: "Encouraging and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Watch and leave a kind comment to encourage them.",
  correctExplanation: "Empathy online means lifting others up, not judging success.",
  tip: "Every big creator started with one view."
},
{
  id: 193,
  category: "Online",
  title: "Responding to Political Debates Online",
  situation: "You see people arguing about politics in the comments.",
  emotion: { icon: "🗣️", label: "Tense" },
  responses: [
    {
      text: "Stay respectful and avoid posting angry replies.",
      feedback: "Calm and wise.",
      type: "best"
    },
    {
      text: "Insult people who disagree with you.",
      feedback: "Disrespectful and aggressive.",
      type: "poor"
    },
    {
      text: "Write a long comment proving you’re right.",
      feedback: "Unnecessary argument.",
      type: "neutral"
    },
    {
      text: "Encourage polite discussion if needed.",
      feedback: "Peaceful and balanced.",
      type: "good"
    }
  ],
  correctAnswer: "Stay respectful and avoid posting angry replies.",
  correctExplanation: "Empathy online means staying kind even during disagreements.",
  tip: "Listen before replying — it keeps peace online."
},
{
  id: 194,
  category: "Online",
  title: "Overusing Social Media",
  situation: "You realize you’ve been scrolling on your phone for hours and feel drained.",
  emotion: { icon: "📱", label: "Tired" },
  responses: [
    {
      text: "Take a break and do something offline you enjoy.",
      feedback: "Healthy and balanced.",
      type: "best"
    },
    {
      text: "Keep scrolling — it’ll help you relax.",
      feedback: "Avoids the problem.",
      type: "poor"
    },
    {
      text: "Mute notifications for a while.",
      feedback: "Good self-control step.",
      type: "good"
    },
    {
      text: "Complain online about being bored.",
      feedback: "Unproductive reaction.",
      type: "neutral"
    }
  ],
  correctAnswer: "Take a break and do something offline you enjoy.",
  correctExplanation: "Empathy includes caring for your own well-being, too.",
  tip: "Offline time recharges your real-life energy."
},
{
  id: 195,
  category: "Online",
  title: "Accidental Spoiler Post",
  situation: "You post a spoiler from a new show and realize many friends haven’t watched it yet.",
  emotion: { icon: "😅", label: "Oops" },
  responses: [
    {
      text: "Apologize and add a spoiler warning immediately.",
      feedback: "Considerate and responsible.",
      type: "best"
    },
    {
      text: "Say ‘Not my fault you didn’t watch it yet.’",
      feedback: "Defensive and selfish.",
      type: "poor"
    },
    {
      text: "Ignore everyone’s complaints.",
      feedback: "Neutral but careless.",
      type: "neutral"
    },
    {
      text: "Delete the post to avoid upsetting others.",
      feedback: "Thoughtful and polite.",
      type: "good"
    }
  ],
  correctAnswer: "Apologize and add a spoiler warning immediately.",
  correctExplanation: "Empathy thinks about others’ experiences before posting.",
  tip: "A small apology shows big maturity."
},
{
  id: 196,
  category: "Online",
  title: "Friend Keeps Tagging You in Everything",
  situation: "Your friend tags you in every meme and post, even ones you don’t like.",
  emotion: { icon: "🏷️", label: "Annoyed" },
  responses: [
    {
      text: "Tell them politely that you’d prefer fewer tags.",
      feedback: "Honest and respectful.",
      type: "best"
    },
    {
      text: "Block them immediately.",
      feedback: "Extreme and harsh.",
      type: "poor"
    },
    {
      text: "Ignore it and just untag yourself silently.",
      feedback: "Neutral but avoids honesty.",
      type: "neutral"
    },
    {
      text: "Laugh and mention it jokingly next time you chat.",
      feedback: "Light and friendly.",
      type: "good"
    }
  ],
  correctAnswer: "Tell them politely that you’d prefer fewer tags.",
  correctExplanation: "Empathy includes setting boundaries kindly.",
  tip: "Clear communication keeps friendships healthy online."
},
{
  id: 197,
  category: "Online",
  title: "Not Getting Enough Likes",
  situation: "You post something meaningful, but few people like or comment.",
  emotion: { icon: "❤️", label: "Disappointed" },
  responses: [
    {
      text: "Remind yourself that likes don’t define your worth.",
      feedback: "Healthy mindset.",
      type: "best"
    },
    {
      text: "Delete the post immediately.",
      feedback: "Reactive and insecure.",
      type: "poor"
    },
    {
      text: "Post again asking people to like it.",
      feedback: "Attention-seeking.",
      type: "neutral"
    },
    {
      text: "Focus on posting things that make you happy, not others.",
      feedback: "Positive and confident.",
      type: "good"
    }
  ],
  correctAnswer: "Remind yourself that likes don’t define your worth.",
  correctExplanation: "Empathy means being kind to yourself, too.",
  tip: "Your value isn’t measured by reactions."
},
{
  id: 198,
  category: "Online",
  title: "Seeing Hate Speech Online",
  situation: "You come across a post spreading hate toward a group of people.",
  emotion: { icon: "🚫", label: "Disturbed" },
  responses: [
    {
      text: "Report it immediately to the platform.",
      feedback: "Safe and responsible.",
      type: "best"
    },
    {
      text: "Argue angrily in the comments.",
      feedback: "Risky and emotional.",
      type: "poor"
    },
    {
      text: "Scroll past quietly.",
      feedback: "Neutral but uninvolved.",
      type: "neutral"
    },
    {
      text: "Share it to show others how wrong it is.",
      feedback: "Good intent but spreads negativity further.",
      type: "good"
    }
  ],
  correctAnswer: "Report it immediately to the platform.",
  correctExplanation: "Empathy stands up against hate safely, not angrily.",
  tip: "Report, don’t repeat — it stops the spread."
},
{
  id: 199,
  category: "Online",
  title: "Friend Constantly Complains Online",
  situation: "A friend keeps posting negative things every day.",
  emotion: { icon: "☁️", label: "Sad" },
  responses: [
    {
      text: "Check in privately to see if they’re okay.",
      feedback: "Caring and personal.",
      type: "best"
    },
    {
      text: "Comment publicly telling them to stop whining.",
      feedback: "Insensitive and unkind.",
      type: "poor"
    },
    {
      text: "Unfollow quietly to avoid the negativity.",
      feedback: "Neutral self-care.",
      type: "neutral"
    },
    {
      text: "Send them something uplifting or funny.",
      feedback: "Gentle encouragement.",
      type: "good"
    }
  ],
  correctAnswer: "Check in privately to see if they’re okay.",
  correctExplanation: "Empathy means noticing when someone might need support.",
  tip: "Private concern shows genuine friendship."
},
{
  id: 200,
  category: "Online",
  title: "Respecting Digital Boundaries",
  situation: "You’re in an online group where someone keeps oversharing personal stories.",
  emotion: { icon: "🧠", label: "Overwhelmed" },
  responses: [
    {
      text: "Set boundaries kindly and suggest private chat if needed.",
      feedback: "Healthy and respectful.",
      type: "best"
    },
    {
      text: "Make fun of them for oversharing.",
      feedback: "Cruel and mocking.",
      type: "poor"
    },
    {
      text: "Leave the group without saying anything.",
      feedback: "Neutral but avoids addressing the issue.",
      type: "neutral"
    },
    {
      text: "Message them privately and show you care, but suggest balance.",
      feedback: "Thoughtful and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Set boundaries kindly and suggest private chat if needed.",
  correctExplanation: "Empathy respects both your comfort and others’ emotions.",
  tip: "Boundaries + kindness = healthy communication."
}
 
];
