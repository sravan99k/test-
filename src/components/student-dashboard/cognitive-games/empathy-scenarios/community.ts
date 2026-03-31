import { EmpathyScenario } from './types';

export const communityScenarios: EmpathyScenario[] = [
  {
  id: 121,
  category: "Community",
  title: "Elder Struggles to Cross the Road",
  situation: "You see an elderly person waiting at a busy crossing, looking nervous.",
  emotion: { icon: "🚶‍♂️", label: "Worried" },
  responses: [
    {
      text: "Offer to help them cross safely.",
      feedback: "Kind and respectful.",
      type: "best"
    },
    {
      text: "Ignore them and keep walking.",
      feedback: "Uncaring and dismissive.",
      type: "poor"
    },
    {
      text: "Wait until someone else helps.",
      feedback: "Passive but not harmful.",
      type: "neutral"
    },
    {
      text: "Smile and ask, ‘Would you like me to walk with you?’",
      feedback: "Gentle and polite.",
      type: "good"
    }
  ],
  correctAnswer: "Offer to help them cross safely.",
  correctExplanation: "Empathy means taking action when others need support.",
  tip: "A small act of help builds community trust."
},
{
  id: 122,
  category: "Community",
  title: "Litter in the Park",
  situation: "You notice trash left behind at the park after a picnic.",
  emotion: { icon: "🗑️", label: "Concerned" },
  responses: [
    {
      text: "Pick it up and throw it away properly.",
      feedback: "Responsible and caring for the environment.",
      type: "best"
    },
    {
      text: "Complain about how dirty the park is.",
      feedback: "Critical but not helpful.",
      type: "poor"
    },
    {
      text: "Leave it — it’s not your trash.",
      feedback: "Avoids responsibility.",
      type: "neutral"
    },
    {
      text: "Encourage your friends to help clean it up too.",
      feedback: "Positive leadership.",
      type: "good"
    }
  ],
  correctAnswer: "Pick it up and throw it away properly.",
  correctExplanation: "Empathy includes caring for shared spaces.",
  tip: "Your small actions inspire others to act responsibly."
},
{
  id: 123,
  category: "Community",
  title: "Lost Child at the Market",
  situation: "You see a small child crying alone near a shop.",
  emotion: { icon: "😢", label: "Scared" },
  responses: [
    {
      text: "Stay nearby and call a shop worker or security guard.",
      feedback: "Safe and caring action.",
      type: "best"
    },
    {
      text: "Walk away — it’s not your job.",
      feedback: "Uncaring and unsafe.",
      type: "poor"
    },
    {
      text: "Try to comfort the child but don’t involve adults.",
      feedback: "Risky and incomplete.",
      type: "neutral"
    },
    {
      text: "Ask calmly, ‘Are you lost? Let’s find someone to help.’",
      feedback: "Gentle and appropriate.",
      type: "good"
    }
  ],
  correctAnswer: "Stay nearby and call a shop worker or security guard.",
  correctExplanation: "Empathy also means acting safely and responsibly.",
  tip: "Caring wisely keeps everyone safe."
},
{
  id: 124,
  category: "Community",
  title: "Bus Passenger Drops Wallet",
  situation: "Someone on the bus drops their wallet without noticing.",
  emotion: { icon: "🚌", label: "Unaware" },
  responses: [
    {
      text: "Pick it up and return it to them politely.",
      feedback: "Honest and kind.",
      type: "best"
    },
    {
      text: "Ignore it — someone else will tell them.",
      feedback: "Passive and indifferent.",
      type: "neutral"
    },
    {
      text: "Take it quietly.",
      feedback: "Dishonest and wrong.",
      type: "poor"
    },
    {
      text: "Alert them right away and hand it over.",
      feedback: "Responsible and trustworthy.",
      type: "good"
    }
  ],
  correctAnswer: "Pick it up and return it to them politely.",
  correctExplanation: "Empathy means respecting others’ belongings and peace of mind.",
  tip: "Integrity is empathy in action."
},
{
  id: 125,
  category: "Community",
  title: "Hearing a Loud Argument Nearby",
  situation: "Two people start arguing loudly in a public place.",
  emotion: { icon: "😟", label: "Tense" },
  responses: [
    {
      text: "Stay calm and keep a safe distance, maybe call an adult if it worsens.",
      feedback: "Safe and thoughtful.",
      type: "best"
    },
    {
      text: "Yell at them to stop.",
      feedback: "Aggressive and risky.",
      type: "poor"
    },
    {
      text: "Stand and watch what happens.",
      feedback: "Curious but unhelpful.",
      type: "neutral"
    },
    {
      text: "Quietly move away and tell a responsible person.",
      feedback: "Careful and smart.",
      type: "good"
    }
  ],
  correctAnswer: "Stay calm and keep a safe distance, maybe call an adult if it worsens.",
  correctExplanation: "Empathy also means acting safely and wisely during conflict.",
  tip: "Safety first — then support."
},
{
  id: 126,
  category: "Community",
  title: "Neighbor Struggles with Groceries",
  situation: "You notice your elderly neighbor carrying many heavy bags.",
  emotion: { icon: "🛍️", label: "Tired" },
  responses: [
    {
      text: "Offer to carry some bags to their door.",
      feedback: "Helpful and considerate.",
      type: "best"
    },
    {
      text: "Wave and walk away.",
      feedback: "Dismissive and unhelpful.",
      type: "poor"
    },
    {
      text: "Ask politely if they’d like a hand.",
      feedback: "Gentle and kind.",
      type: "good"
    },
    {
      text: "Watch silently until they finish.",
      feedback: "Passive but harmless.",
      type: "neutral"
    }
  ],
  correctAnswer: "Offer to carry some bags to their door.",
  correctExplanation: "Empathy helps lighten someone’s load, literally and emotionally.",
  tip: "Helping others strengthens community bonds."
},
{
  id: 127,
  category: "Community",
  title: "Hearing a Street Performer Struggling",
  situation: "A musician on the street looks nervous as few people stop to listen.",
  emotion: { icon: "🎵", label: "Shy" },
  responses: [
    {
      text: "Smile or clap politely before leaving.",
      feedback: "Encouraging and respectful.",
      type: "best"
    },
    {
      text: "Laugh with friends and walk off.",
      feedback: "Disrespectful and hurtful.",
      type: "poor"
    },
    {
      text: "Ignore and walk away silently.",
      feedback: "Neutral but cold.",
      type: "neutral"
    },
    {
      text: "Drop a coin and say ‘Nice song!’",
      feedback: "Kind and affirming.",
      type: "good"
    }
  ],
  correctAnswer: "Smile or clap politely before leaving.",
  correctExplanation: "Empathy values others’ effort even in small ways.",
  tip: "A bit of appreciation can brighten someone’s day."
},
{
  id: 128,
  category: "Community",
  title: "Stray Animal Near School",
  situation: "A stray dog is wandering near the school gate looking hungry.",
  emotion: { icon: "🐕", label: "Hungry" },
  responses: [
    {
      text: "Stay calm, keep distance, and inform a teacher or guard.",
      feedback: "Safe and caring.",
      type: "best"
    },
    {
      text: "Run toward it to play.",
      feedback: "Unsafe and impulsive.",
      type: "poor"
    },
    {
      text: "Ignore it and walk by.",
      feedback: "Neutral but avoids responsibility.",
      type: "neutral"
    },
    {
      text: "Leave some food nearby and tell an adult.",
      feedback: "Thoughtful and gentle.",
      type: "good"
    }
  ],
  correctAnswer: "Stay calm, keep distance, and inform a teacher or guard.",
  correctExplanation: "Empathy includes safety for people and animals.",
  tip: "Kindness also means caring wisely."
},
{
  id: 129,
  category: "Community",
  title: "Helping Someone Who Dropped Groceries",
  situation: "A person drops their grocery bag, and items scatter everywhere.",
  emotion: { icon: "🧺", label: "Embarrassed" },
  responses: [
    {
      text: "Quickly help pick up their things.",
      feedback: "Friendly and helpful.",
      type: "best"
    },
    {
      text: "Walk past — someone else will help.",
      feedback: "Avoids responsibility.",
      type: "poor"
    },
    {
      text: "Ask if they’re okay first.",
      feedback: "Caring but slower response.",
      type: "good"
    },
    {
      text: "Watch awkwardly and move on.",
      feedback: "Neutral but unhelpful.",
      type: "neutral"
    }
  ],
  correctAnswer: "Quickly help pick up their things.",
  correctExplanation: "Empathy acts before embarrassment grows.",
  tip: "Quick help is the best help."
},
{
  id: 130,
  category: "Community",
  title: "Person Struggling to Find a Place on the Bus",
  situation: "You see someone standing while you’re seated comfortably.",
  emotion: { icon: "🪑", label: "Uncomfortable" },
  responses: [
    {
      text: "Offer your seat with a smile.",
      feedback: "Respectful and kind.",
      type: "best"
    },
    {
      text: "Pretend not to notice.",
      feedback: "Avoids empathy.",
      type: "poor"
    },
    {
      text: "Look away and stay seated.",
      feedback: "Indifferent behavior.",
      type: "neutral"
    },
    {
      text: "Ask politely, ‘Would you like to sit?’",
      feedback: "Courteous and warm.",
      type: "good"
    }
  ],
  correctAnswer: "Offer your seat with a smile.",
  correctExplanation: "Empathy means sharing comfort when others need it more.",
  tip: "Courtesy keeps communities caring."
},
{
  id: 131,
  category: "Community",
  title: "Thanking a Bus Driver",
  situation: "After your bus ride, most people just walk off quietly.",
  emotion: { icon: "🚌", label: "Neutral" },
  responses: [
    {
      text: "Say ‘Thank you!’ before getting off.",
      feedback: "Polite and positive.",
      type: "best"
    },
    {
      text: "Leave without saying anything.",
      feedback: "Polite silence, but lacks warmth.",
      type: "neutral"
    },
    {
      text: "Complain about the slow ride.",
      feedback: "Negative and rude.",
      type: "poor"
    },
    {
      text: "Smile and nod as you leave.",
      feedback: "Friendly and respectful.",
      type: "good"
    }
  ],
  correctAnswer: "Say ‘Thank you!’ before getting off.",
  correctExplanation: "Empathy includes showing appreciation for small services.",
  tip: "Gratitude spreads kindness quickly."
},
{
  id: 132,
  category: "Community",
  title: "Helping at a Local Event",
  situation: "You notice organizers struggling to set up chairs for a community function.",
  emotion: { icon: "💪", label: "Busy" },
  responses: [
    {
      text: "Ask if you can help them arrange the chairs.",
      feedback: "Cooperative and kind.",
      type: "best"
    },
    {
      text: "Watch for a bit, then walk away.",
      feedback: "Passive and unhelpful.",
      type: "neutral"
    },
    {
      text: "Laugh at how slow they’re going.",
      feedback: "Disrespectful and rude.",
      type: "poor"
    },
    {
      text: "Hold a few chairs while they arrange others.",
      feedback: "Supportive and helpful.",
      type: "good"
    }
  ],
  correctAnswer: "Ask if you can help them arrange the chairs.",
  correctExplanation: "Empathy joins in to make community work easier.",
  tip: "Helping builds belonging."
},
{
  id: 133,
  category: "Community",
  title: "Person Asking for Directions",
  situation: "Someone looks lost and asks you how to reach the post office.",
  emotion: { icon: "🗺️", label: "Confused" },
  responses: [
    {
      text: "Explain clearly or show them the way politely.",
      feedback: "Helpful and respectful.",
      type: "best"
    },
    {
      text: "Ignore them and keep walking.",
      feedback: "Cold and unhelpful.",
      type: "poor"
    },
    {
      text: "Point vaguely and walk off.",
      feedback: "Half-helpful and dismissive.",
      type: "neutral"
    },
    {
      text: "Smile and say, ‘I’m not sure, but maybe the shopkeeper knows.’",
      feedback: "Polite and honest.",
      type: "good"
    }
  ],
  correctAnswer: "Explain clearly or show them the way politely.",
  correctExplanation: "Empathy means taking a moment to help others find their way.",
  tip: "Guiding someone can make their day easier."
},
{
  id: 134,
  category: "Community",
  title: "Helping a Delivery Worker",
  situation: "A delivery worker struggles to find your neighbor’s house in the rain.",
  emotion: { icon: "📦", label: "Frustrated" },
  responses: [
    {
      text: "Show them the right house politely.",
      feedback: "Thoughtful and helpful.",
      type: "best"
    },
    {
      text: "Say ‘Not my problem’ and go inside.",
      feedback: "Rude and uncaring.",
      type: "poor"
    },
    {
      text: "Point to the general direction without checking.",
      feedback: "Neutral but lazy.",
      type: "neutral"
    },
    {
      text: "Smile and tell them exactly where to go.",
      feedback: "Friendly and cooperative.",
      type: "good"
    }
  ],
  correctAnswer: "Show them the right house politely.",
  correctExplanation: "Empathy respects people’s effort, even in small moments.",
  tip: "Respect for workers keeps communities kind."
},
{
  id: 135,
  category: "Community",
  title: "Public Bench Occupied by Belongings",
  situation: "You see someone’s bags taking up space on a crowded bench.",
  emotion: { icon: "🪑", label: "Annoyed" },
  responses: [
    {
      text: "Politely ask, ‘Could you please move your bags so I can sit?’",
      feedback: "Respectful and assertive.",
      type: "best"
    },
    {
      text: "Complain loudly about people being rude.",
      feedback: "Negative and confrontational.",
      type: "poor"
    },
    {
      text: "Stand and wait silently.",
      feedback: "Passive but calm.",
      type: "neutral"
    },
    {
      text: "Smile and gesture kindly toward the spot.",
      feedback: "Gentle and polite.",
      type: "good"
    }
  ],
  correctAnswer: "Politely ask, ‘Could you please move your bags so I can sit?’",
  correctExplanation: "Empathy can be firm and kind at the same time.",
  tip: "Respectful words solve small conflicts easily."
},
{
  id: 136,
  category: "Community",
  title: "Hearing a Friend Tease Someone Online",
  situation: "Your friend posts a mean comment on someone’s photo.",
  emotion: { icon: "💻", label: "Unkind" },
  responses: [
    {
      text: "Tell them that it might hurt the person and suggest deleting it.",
      feedback: "Courageous and kind.",
      type: "best"
    },
    {
      text: "Laugh and add another comment.",
      feedback: "Encourages cruelty.",
      type: "poor"
    },
    {
      text: "Stay silent and hope they stop.",
      feedback: "Neutral but not helpful.",
      type: "neutral"
    },
    {
      text: "Message them privately and explain why it’s not okay.",
      feedback: "Respectful and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "Tell them that it might hurt the person and suggest deleting it.",
  correctExplanation: "Empathy means standing up against online unkindness.",
  tip: "Kindness online counts just as much as in person."
},
{
  id: 137,
  category: "Community",
  title: "Loud Music in a Shared Space",
  situation: "Someone is playing loud music in a public park.",
  emotion: { icon: "🎧", label: "Disturbed" },
  responses: [
    {
      text: "Politely ask if they could lower the volume.",
      feedback: "Calm and considerate.",
      type: "best"
    },
    {
      text: "Yell at them to turn it down.",
      feedback: "Aggressive and rude.",
      type: "poor"
    },
    {
      text: "Move away and say nothing.",
      feedback: "Avoids conflict but passive.",
      type: "neutral"
    },
    {
      text: "Wait and talk nicely after their song ends.",
      feedback: "Tactful and patient.",
      type: "good"
    }
  ],
  correctAnswer: "Politely ask if they could lower the volume.",
  correctExplanation: "Empathy respects others while communicating needs clearly.",
  tip: "Tone matters as much as words."
},
{
  id: 138,
  category: "Community",
  title: "Community Clean-up Drive",
  situation: "Your area is organizing a weekend clean-up activity.",
  emotion: { icon: "🧹", label: "Motivated" },
  responses: [
    {
      text: "Join and help clean your street.",
      feedback: "Active and responsible.",
      type: "best"
    },
    {
      text: "Say you’re too busy to help.",
      feedback: "Avoids participation.",
      type: "neutral"
    },
    {
      text: "Complain that others should do it.",
      feedback: "Negative and selfish.",
      type: "poor"
    },
    {
      text: "Encourage a friend to join too.",
      feedback: "Supportive and inspiring.",
      type: "good"
    }
  ],
  correctAnswer: "Join and help clean your street.",
  correctExplanation: "Empathy means caring for shared spaces together.",
  tip: "Teamwork makes a community shine."
},
{
  id: 139,
  category: "Community",
  title: "Helping a Vendor Pack Up",
  situation: "A street vendor struggles to pack up before it rains.",
  emotion: { icon: "🌧️", label: "Rushed" },
  responses: [
    {
      text: "Offer to help them move things quickly under shelter.",
      feedback: "Thoughtful and kind.",
      type: "best"
    },
    {
      text: "Watch from afar without helping.",
      feedback: "Indifferent and passive.",
      type: "neutral"
    },
    {
      text: "Make a joke about the weather.",
      feedback: "Insensitive to their stress.",
      type: "poor"
    },
    {
      text: "Hold something steady for them while they pack.",
      feedback: "Helpful and gentle.",
      type: "good"
    }
  ],
  correctAnswer: "Offer to help them move things quickly under shelter.",
  correctExplanation: "Empathy reacts helpfully when others are struggling.",
  tip: "Quick kindness is powerful."
},
{
  id: 140,
  category: "Community",
  title: "Helping a Person with Disabilities",
  situation: "You see someone with a walking stick trying to open a door.",
  emotion: { icon: "🚪", label: "Struggling" },
  responses: [
    {
      text: "Open the door and smile politely.",
      feedback: "Respectful and caring.",
      type: "best"
    },
    {
      text: "Push past to enter first.",
      feedback: "Rude and selfish.",
      type: "poor"
    },
    {
      text: "Stand and wait silently.",
      feedback: "Neutral but not helpful.",
      type: "neutral"
    },
    {
      text: "Ask, ‘Would you like some help with the door?’",
      feedback: "Polite and considerate.",
      type: "good"
    }
  ],
  correctAnswer: "Open the door and smile politely.",
  correctExplanation: "Empathy means offering help without making someone feel awkward.",
  tip: "Dignity and kindness go hand in hand."
},
{
  id: 141,
  category: "Community",
  title: "Different Language Speaker Asks for Help",
  situation: "Someone who doesn’t speak your language well asks for directions.",
  emotion: { icon: "🗣️", label: "Confused" },
  responses: [
    {
      text: "Use gestures or simple words to guide them kindly.",
      feedback: "Patient and inclusive.",
      type: "best"
    },
    {
      text: "Ignore them since it’s hard to communicate.",
      feedback: "Dismissive and unkind.",
      type: "poor"
    },
    {
      text: "Say you don’t understand and walk off.",
      feedback: "Honest but cold.",
      type: "neutral"
    },
    {
      text: "Smile and show the way using your phone map.",
      feedback: "Helpful and considerate.",
      type: "good"
    }
  ],
  correctAnswer: "Use gestures or simple words to guide them kindly.",
  correctExplanation: "Empathy bridges communication gaps with patience.",
  tip: "A smile and effort mean more than perfect words."
},
{
  id: 142,
  category: "Community",
  title: "Respecting Cultural Differences",
  situation: "Your neighbor celebrates a festival you’re not familiar with.",
  emotion: { icon: "🎉", label: "Curious" },
  responses: [
    {
      text: "Ask politely about their festival and wish them well.",
      feedback: "Respectful and open-minded.",
      type: "best"
    },
    {
      text: "Make jokes about their customs.",
      feedback: "Insensitive and hurtful.",
      type: "poor"
    },
    {
      text: "Stay away and ignore their celebration.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Smile and say, ‘Happy festival!’",
      feedback: "Friendly and kind.",
      type: "good"
    }
  ],
  correctAnswer: "Ask politely about their festival and wish them well.",
  correctExplanation: "Empathy celebrates differences and learns from them.",
  tip: "Respect builds stronger communities."
},
{
  id: 143,
  category: "Community",
  title: "Recycling Confusion",
  situation: "You see someone accidentally putting plastic in the wrong recycling bin.",
  emotion: { icon: "♻️", label: "Concerned" },
  responses: [
    {
      text: "Gently tell them which bin is correct.",
      feedback: "Helpful and polite.",
      type: "best"
    },
    {
      text: "Mock them for not knowing.",
      feedback: "Unkind and unhelpful.",
      type: "poor"
    },
    {
      text: "Say nothing and fix it later.",
      feedback: "Quietly responsible.",
      type: "good"
    },
    {
      text: "Ignore it — it’s not your problem.",
      feedback: "Indifferent behavior.",
      type: "neutral"
    }
  ],
  correctAnswer: "Gently tell them which bin is correct.",
  correctExplanation: "Empathy teaches without embarrassing others.",
  tip: "Respectful correction encourages better habits."
},
{
  id: 144,
  category: "Community",
  title: "Public Library Noise",
  situation: "Some teens are talking loudly in the library.",
  emotion: { icon: "📚", label: "Irritated" },
  responses: [
    {
      text: "Politely remind them it’s a quiet area.",
      feedback: "Assertive and respectful.",
      type: "best"
    },
    {
      text: "Shout ‘Be quiet!’ at them.",
      feedback: "Rude and escalates conflict.",
      type: "poor"
    },
    {
      text: "Move to another corner silently.",
      feedback: "Avoids conflict but passive.",
      type: "neutral"
    },
    {
      text: "Tell a librarian calmly about the noise.",
      feedback: "Responsible and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Politely remind them it’s a quiet area.",
  correctExplanation: "Empathy solves problems respectfully.",
  tip: "Kind tone turns correction into cooperation."
},
{
  id: 145,
  category: "Community",
  title: "Person Drops Something While Walking",
  situation: "Someone ahead of you drops a handkerchief on the road.",
  emotion: { icon: "🧣", label: "Unaware" },
  responses: [
    {
      text: "Pick it up and call out to return it.",
      feedback: "Helpful and honest.",
      type: "best"
    },
    {
      text: "Keep walking — it’s not yours.",
      feedback: "Neutral but indifferent.",
      type: "neutral"
    },
    {
      text: "Laugh and leave it there.",
      feedback: "Rude and inconsiderate.",
      type: "poor"
    },
    {
      text: "Point to it so they can see it themselves.",
      feedback: "Helpful but minimal effort.",
      type: "good"
    }
  ],
  correctAnswer: "Pick it up and call out to return it.",
  correctExplanation: "Empathy includes caring for strangers’ belongings.",
  tip: "Small honesty creates trust."
},
{
  id: 146,
  category: "Community",
  title: "Water Wastage in Public Tap",
  situation: "You notice a tap running at a park with no one nearby.",
  emotion: { icon: "🚰", label: "Alert" },
  responses: [
    {
      text: "Turn it off to save water.",
      feedback: "Responsible and thoughtful.",
      type: "best"
    },
    {
      text: "Ignore it and keep walking.",
      feedback: "Indifferent behavior.",
      type: "poor"
    },
    {
      text: "Tell a park worker later.",
      feedback: "Responsible but delayed.",
      type: "good"
    },
    {
      text: "Take a photo and share online complaining about waste.",
      feedback: "Negative and performative.",
      type: "neutral"
    }
  ],
  correctAnswer: "Turn it off to save water.",
  correctExplanation: "Empathy extends to caring for shared resources.",
  tip: "Environmental empathy starts with small acts."
},
{
  id: 147,
  category: "Community",
  title: "Volunteering Opportunity",
  situation: "Your school announces a weekend visit to a local care home.",
  emotion: { icon: "🤝", label: "Interested" },
  responses: [
    {
      text: "Join the visit to spend time with residents.",
      feedback: "Kind and proactive.",
      type: "best"
    },
    {
      text: "Say it sounds boring.",
      feedback: "Insensitive and dismissive.",
      type: "poor"
    },
    {
      text: "Let others go instead.",
      feedback: "Neutral but disengaged.",
      type: "neutral"
    },
    {
      text: "Help organize or bring small gifts.",
      feedback: "Thoughtful and caring.",
      type: "good"
    }
  ],
  correctAnswer: "Join the visit to spend time with residents.",
  correctExplanation: "Empathy grows by connecting with different people.",
  tip: "Giving time is one of the kindest gifts."
},
{
  id: 148,
  category: "Community",
  title: "Respecting a Public Worker",
  situation: "You see a sanitation worker cleaning the street early in the morning.",
  emotion: { icon: "🧹", label: "Respectful" },
  responses: [
    {
      text: "Smile and say, ‘Thank you for keeping our street clean!’",
      feedback: "Respectful and warm.",
      type: "best"
    },
    {
      text: "Ignore them completely.",
      feedback: "Neutral but cold.",
      type: "neutral"
    },
    {
      text: "Make jokes about their job.",
      feedback: "Disrespectful and unkind.",
      type: "poor"
    },
    {
      text: "Wave politely as you walk by.",
      feedback: "Friendly and appreciative.",
      type: "good"
    }
  ],
  correctAnswer: "Smile and say, ‘Thank you for keeping our street clean!’",
  correctExplanation: "Empathy appreciates others’ contributions.",
  tip: "Respect turns ordinary moments into connection."
},
{
  id: 149,
  category: "Community",
  title: "Someone Trips on the Pavement",
  situation: "A person nearby stumbles and drops their phone.",
  emotion: { icon: "😳", label: "Embarrassed" },
  responses: [
    {
      text: "Ask if they’re okay and help pick up their phone.",
      feedback: "Caring and quick to help.",
      type: "best"
    },
    {
      text: "Laugh quietly with friends.",
      feedback: "Insensitive and rude.",
      type: "poor"
    },
    {
      text: "Keep walking but glance back.",
      feedback: "Indifferent behavior.",
      type: "neutral"
    },
    {
      text: "Offer your hand and check if they’re hurt.",
      feedback: "Warm and helpful.",
      type: "good"
    }
  ],
  correctAnswer: "Ask if they’re okay and help pick up their phone.",
  correctExplanation: "Empathy eases embarrassment with small kindness.",
  tip: "Quick concern shows big heart."
},
{
  id: 150,
  category: "Community",
  title: "Someone New Moves into Your Building",
  situation: "A new family has just moved into your neighborhood.",
  emotion: { icon: "🏡", label: "Curious" },
  responses: [
    {
      text: "Welcome them and introduce yourself.",
      feedback: "Friendly and inclusive.",
      type: "best"
    },
    {
      text: "Avoid them since you don’t know them yet.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Make jokes about new people.",
      feedback: "Rude and unwelcoming.",
      type: "poor"
    },
    {
      text: "Smile and wave when you see them.",
      feedback: "Kind and approachable.",
      type: "good"
    }
  ],
  correctAnswer: "Welcome them and introduce yourself.",
  correctExplanation: "Empathy helps new people feel part of the community.",
  tip: "A friendly start builds strong neighborhoods."
},
{
  id: 151,
  category: "Community",
  title: "Someone Can't Afford an Item at a Store",
  situation: "At a local shop, you notice someone short on money while paying for groceries.",
  emotion: { icon: "🛒", label: "Embarrassed" },
  responses: [
    {
      text: "Quietly offer to cover the small amount if you can.",
      feedback: "Kind and discreet.",
      type: "best"
    },
    {
      text: "Point it out loudly to others.",
      feedback: "Embarrassing and rude.",
      type: "poor"
    },
    {
      text: "Stay silent and look away.",
      feedback: "Neutral but detached.",
      type: "neutral"
    },
    {
      text: "Offer a reassuring smile and let the shopkeeper handle it.",
      feedback: "Polite and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Quietly offer to cover the small amount if you can.",
  correctExplanation: "Empathy helps without drawing attention or shame.",
  tip: "Discreet kindness shows deep respect."
},
{
  id: 152,
  category: "Community",
  title: "Seeing Someone Being Left Out",
  situation: "At a community picnic, one person sits alone while others chat in groups.",
  emotion: { icon: "🍉", label: "Lonely" },
  responses: [
    {
      text: "Invite them to join your group for a chat.",
      feedback: "Inclusive and friendly.",
      type: "best"
    },
    {
      text: "Ignore them; they probably want to be alone.",
      feedback: "Assumes without care.",
      type: "neutral"
    },
    {
      text: "Make jokes about them sitting alone.",
      feedback: "Cruel and unkind.",
      type: "poor"
    },
    {
      text: "Smile and ask if they’d like some food.",
      feedback: "Gentle and thoughtful.",
      type: "good"
    }
  ],
  correctAnswer: "Invite them to join your group for a chat.",
  correctExplanation: "Empathy builds connection and belonging.",
  tip: "Small invitations make people feel seen."
},
{
  id: 153,
  category: "Community",
  title: "Public Transport Delay",
  situation: "The train is delayed, and people start complaining loudly.",
  emotion: { icon: "🚉", label: "Frustrated" },
  responses: [
    {
      text: "Stay calm and reassure others that it’ll start soon.",
      feedback: "Positive and steady.",
      type: "best"
    },
    {
      text: "Join in and complain too.",
      feedback: "Negative and unhelpful.",
      type: "poor"
    },
    {
      text: "Ignore everyone and keep scrolling on your phone.",
      feedback: "Neutral but detached.",
      type: "neutral"
    },
    {
      text: "Smile and start a light, friendly conversation.",
      feedback: "Uplifting and calm.",
      type: "good"
    }
  ],
  correctAnswer: "Stay calm and reassure others that it’ll start soon.",
  correctExplanation: "Empathy helps keep peace in stressful moments.",
  tip: "Calmness can influence others positively."
},
{
  id: 154,
  category: "Community",
  title: "Child Crying in a Public Place",
  situation: "A small child starts crying loudly at the bus stop.",
  emotion: { icon: "😭", label: "Upset" },
  responses: [
    {
      text: "Smile at the parent or guardian to show understanding.",
      feedback: "Kind and non-judgmental.",
      type: "best"
    },
    {
      text: "Complain about the noise.",
      feedback: "Insensitive and rude.",
      type: "poor"
    },
    {
      text: "Move away quietly.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Make a funny face to distract the child if appropriate.",
      feedback: "Playful and warm.",
      type: "good"
    }
  ],
  correctAnswer: "Smile at the parent or guardian to show understanding.",
  correctExplanation: "Empathy offers silent support, not judgment.",
  tip: "Patience makes public spaces kinder."
},
{
  id: 155,
  category: "Community",
  title: "Community Garden Plants Need Water",
  situation: "You notice the plants in your community garden look dry.",
  emotion: { icon: "🌿", label: "Concerned" },
  responses: [
    {
      text: "Get some water and tend to the plants.",
      feedback: "Caring and proactive.",
      type: "best"
    },
    {
      text: "Wait for someone else to do it.",
      feedback: "Passive and indifferent.",
      type: "neutral"
    },
    {
      text: "Complain about people not doing their job.",
      feedback: "Critical and negative.",
      type: "poor"
    },
    {
      text: "Remind the caretaker gently about watering them.",
      feedback: "Helpful and polite.",
      type: "good"
    }
  ],
  correctAnswer: "Get some water and tend to the plants.",
  correctExplanation: "Empathy includes caring for shared environments.",
  tip: "Nature also needs kindness."
},
{
  id: 156,
  category: "Community",
  title: "Lost Tourist Needs Help",
  situation: "A tourist looks confused while checking their phone map.",
  emotion: { icon: "🧭", label: "Lost" },
  responses: [
    {
      text: "Offer to help them find their location or the nearest landmark.",
      feedback: "Friendly and kind.",
      type: "best"
    },
    {
      text: "Avoid eye contact and walk away.",
      feedback: "Unhelpful and cold.",
      type: "poor"
    },
    {
      text: "Smile but don’t stop to help.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Politely ask, ‘Are you looking for somewhere? I can guide you.’",
      feedback: "Helpful and respectful.",
      type: "good"
    }
  ],
  correctAnswer: "Offer to help them find their location or the nearest landmark.",
  correctExplanation: "Empathy helps others feel welcome in new places.",
  tip: "Hospitality is empathy made visible."
},
{
  id: 157,
  category: "Community",
  title: "Crowded Line at a Shop",
  situation: "The queue at the grocery store is long, and people are getting impatient.",
  emotion: { icon: "🧾", label: "Impatient" },
  responses: [
    {
      text: "Wait calmly and respect everyone’s turn.",
      feedback: "Patient and fair.",
      type: "best"
    },
    {
      text: "Try to push ahead quietly.",
      feedback: "Selfish and rude.",
      type: "poor"
    },
    {
      text: "Complain loudly about the delay.",
      feedback: "Negative and unhelpful.",
      type: "neutral"
    },
    {
      text: "Smile and start a friendly chat with the person next to you.",
      feedback: "Positive and patient.",
      type: "good"
    }
  ],
  correctAnswer: "Wait calmly and respect everyone’s turn.",
  correctExplanation: "Empathy means being fair and patient even in small inconveniences.",
  tip: "Courtesy in crowds keeps peace."
},
{
  id: 158,
  category: "Community",
  title: "Neighborhood Noise Complaint",
  situation: "Your neighbor is playing loud music late at night.",
  emotion: { icon: "🔊", label: "Disturbed" },
  responses: [
    {
      text: "Knock gently and ask if they could lower the volume.",
      feedback: "Respectful and assertive.",
      type: "best"
    },
    {
      text: "Bang on the wall to show anger.",
      feedback: "Aggressive and disrespectful.",
      type: "poor"
    },
    {
      text: "Complain about them to others.",
      feedback: "Gossipy and unhelpful.",
      type: "neutral"
    },
    {
      text: "Send a polite message asking them to reduce the noise.",
      feedback: "Calm and modern approach.",
      type: "good"
    }
  ],
  correctAnswer: "Knock gently and ask if they could lower the volume.",
  correctExplanation: "Empathy means solving issues politely and peacefully.",
  tip: "Politeness prevents problems from growing."
},
{
  id: 159,
  category: "Community",
  title: "Respecting People with Different Abilities",
  situation: "During a community event, you see someone in a wheelchair being ignored in a conversation.",
  emotion: { icon: "🦽", label: "Left Out" },
  responses: [
    {
      text: "Include them naturally in the conversation.",
      feedback: "Inclusive and respectful.",
      type: "best"
    },
    {
      text: "Keep talking to others and avoid eye contact.",
      feedback: "Insensitive and excluding.",
      type: "poor"
    },
    {
      text: "Smile but don’t engage them directly.",
      feedback: "Neutral but distant.",
      type: "neutral"
    },
    {
      text: "Ask them directly what they think.",
      feedback: "Warm and engaging.",
      type: "good"
    }
  ],
  correctAnswer: "Include them naturally in the conversation.",
  correctExplanation: "Empathy means treating everyone with equal respect.",
  tip: "Inclusion makes communities stronger."
},
{
  id: 160,
  category: "Community",
  title: "Public Property Misuse",
  situation: "You see someone drawing graffiti on a public wall.",
  emotion: { icon: "🚫", label: "Concerned" },
  responses: [
    {
      text: "Report it calmly to an authority nearby.",
      feedback: "Responsible and smart.",
      type: "best"
    },
    {
      text: "Join them for fun.",
      feedback: "Irresponsible and wrong.",
      type: "poor"
    },
    {
      text: "Ignore it and walk away.",
      feedback: "Neutral but avoids action.",
      type: "neutral"
    },
    {
      text: "Ask them politely to stop — it damages public spaces.",
      feedback: "Brave and respectful.",
      type: "good"
    }
  ],
  correctAnswer: "Report it calmly to an authority nearby.",
  correctExplanation: "Empathy protects shared spaces responsibly.",
  tip: "Caring for public places shows community pride."
}

];
