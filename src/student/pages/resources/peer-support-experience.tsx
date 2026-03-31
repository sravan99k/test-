import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveSupportCircle, getSupportCircles, deleteSupportCircle } from '@/services/resourcesService';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

interface ChallengeProgress {
  dailyCheckIn: number;
  reflectionJournal: number;
  activeListening: boolean;
  peerGroup: boolean;
}

const PeerSupportExperience: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || '';
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [listeningStep, setListeningStep] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [peerGroupChecks, setPeerGroupChecks] = useState<boolean[]>([false, false, false, false]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Progress states
  const [badges, setBadges] = useState<Badge[]>([
    { id: 'supportive-buddy', name: 'Supportive Buddy', icon: '', earned: false },
    { id: 'kind-listener', name: 'Kind Listener', icon: '', earned: false }
  ]);

  const [challenges, setChallenges] = useState<ChallengeProgress>({
    dailyCheckIn: 0,
    reflectionJournal: 0,
    activeListening: false,
    peerGroup: false
  });

  // Superpower game states
  const [listeningLabStep, setListeningLabStep] = useState(0);
  const [listeningLabChoice, setListeningLabChoice] = useState<number | null>(null);
  const [iFlipStates, setIFlipStates] = useState<boolean[]>([]);
  const [iCardsPrepared, setICardsPrepared] = useState<Array<{ you: string; i: string }>>([]);
  const [conflictStep, setConflictStep] = useState(0);
  const [conflictChoice, setConflictChoice] = useState<number | null>(null);
  const [conflictPrepared, setConflictPrepared] = useState<Array<{
    question: string;
    options: Array<{ text: string; correct: boolean; why: string }>;
  }>>([]);
  const [supportFriends, setSupportFriends] = useState([
    { id: 'you', name: 'You', strengths: ['Good listener'] },
  ]);
  const [roles, setRoles] = useState<Array<{ id: string; label: string; desc: string }>>([
    { id: 'listener', label: 'Listener', desc: 'Hears others without judging and lets them finish.' },
    { id: 'encourager', label: 'Encourager', desc: 'Spreads kind words, praise, and hope.' },
    { id: 'organizer', label: 'Organizer', desc: 'Plans check-ins, meetings, or study times.' },
    { id: 'boundaryKeeper', label: 'Boundary Keeper', desc: 'Protects privacy and reminds others of group rules.' },
  ]);
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendStrengths, setNewFriendStrengths] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleLabel, setEditRoleLabel] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');
  const [editingFriendId, setEditingFriendId] = useState<string | null>(null);
  const [editFriendName, setEditFriendName] = useState('');
  const [editFriendStrengths, setEditFriendStrengths] = useState('');

  // Safe Group Rules Check state
  const [safeTab, setSafeTab] = useState<'learn' | 'decide' | 'practice'>('learn');
  const [safePrepared, setSafePrepared] = useState<Array<{
    text: string;
    tag: 'confidentiality' | 'respect' | 'consent' | 'escalation' | 'kindness';
    correct: 'safe' | 'unsafe' | 'escalate';
    explanation: string;
  }>>([]);
  const [safeChoices, setSafeChoices] = useState<Record<number, 'safe' | 'unsafe' | 'escalate' | null>>({});
  const [actionPrepared, setActionPrepared] = useState<Array<{
    scenario: string;
    options: Array<{ text: string; correct: boolean; why: string }>;
  }>>([]);
  const [actionPicks, setActionPicks] = useState<Record<number, number | null>>({});

  // Active Listening Lab selections
  const [llProblemPick, setLlProblemPick] = useState<number | null>(null);
  const [llActionPick, setLlActionPick] = useState<number | null>(null);
  const [llReplyPick, setLlReplyPick] = useState<number | null>(null);
  const [llPrepared, setLlPrepared] = useState<Array<{
    friend: string;
    badReply: string;
    problems: Array<{ text: string; feedback: string; correct: boolean }>;
    repairs: Array<{ text: string; feedback: string; correct: boolean }>;
  }>>([]);
  const [roleAssignments, setRoleAssignments] = useState<Record<string, string | null>>({
    listener: null,
    encourager: null,
    organizer: null,
    boundaryKeeper: null,
  });

  const [savedCircles, setSavedCircles] = useState<any[]>([]);
  const [circleBanner, setCircleBanner] = useState<string>('');
  const [circleLoading, setCircleLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const items = await getSupportCircles(userId);
        setSavedCircles(items);
      } catch (e) {
        console.error('Failed to load support circles', e);
      }
    })();
  }, [userId]);

  const saveCircle = async () => {
    if (!userId) { alert('Please sign in to save your circle'); return; }
    setCircleLoading(true);
    try {
      const entry = { roles, supportFriends, roleAssignments } as any;
      await saveSupportCircle(userId, entry);
      const items = await getSupportCircles(userId);
      setSavedCircles(items);
      setCircleBanner('Support circle saved to cloud');
      setTimeout(() => setCircleBanner(''), 2000);
    } catch (e) {
      console.error('Error saving support circle', e);
      setCircleBanner('Error saving support circle');
      setTimeout(() => setCircleBanner(''), 2500);
    } finally {
      setCircleLoading(false);
    }
  };

  const loadCircle = (id: string) => {
    const found = savedCircles.find((c: any) => c.id === id);
    if (!found) return;
    setRoles(found.roles || []);
    setSupportFriends(found.supportFriends || []);
    setRoleAssignments(found.roleAssignments || {});
  };

  const removeCircle = async (id: string) => {
    if (!userId) return;
    try {
      await deleteSupportCircle(userId, id);
      setSavedCircles(prev => prev.filter((c: any) => c.id !== id));
    } catch (e) {
      console.error('Error deleting support circle', e);
    }
  };

  // Sound system
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Prepare randomized 4-card set for I-Statements game on open
  useEffect(() => {
    if (activeModal !== 'iStatementsGame') return;

    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const pool: Array<{ you: string; i: string }> = [
      { you: 'You ignored me.', i: "I felt left out when we didn't talk." },
      { you: 'You never listen to me.', i: 'I feel unheard when I talk and there is no response.' },
      { you: 'You always ruin group projects.', i: "I feel stressed when we don’t plan together. Can we divide tasks more clearly?" },
      { you: 'You made me look stupid.', i: 'I felt embarrassed during that moment.' },
      { you: 'You only care about yourself.', i: 'I feel unseen when my needs aren’t considered.' },
      { you: 'You are so lazy.', i: 'I feel frustrated when chores aren’t shared.' },
      { you: 'You never text back.', i: 'I feel worried when I don’t get a reply for a long time.' },
      { you: 'You took my stuff.', i: 'I feel upset when my things are used without asking.' },
      { you: 'You always blame me.', i: 'I feel defensive when I’m blamed without hearing my side.' },
      { you: 'You never show up on time.', i: 'I feel stressed when plans start late.' },
      { you: 'You made a mess.', i: 'I feel overwhelmed when the room is left messy.' },
      { you: 'You are so loud.', i: 'I feel distracted when there’s a lot of noise around me.' },
      { you: 'You never include me.', i: 'I feel hurt when I’m not invited.' },
      { you: 'You always interrupt.', i: 'I feel unheard when I’m interrupted.' },
      { you: 'You forgot me again.', i: 'I feel unimportant when I’m forgotten.' },
      { you: 'You don’t understand me.', i: 'I feel misunderstood in our conversations.' },
      { you: 'You made everything worse.', i: 'I feel disappointed with how this turned out.' },
      { you: 'You never help.', i: 'I feel overwhelmed when I don’t get support.' },
      { you: 'You are rude.', i: 'I feel disrespected by that comment.' },
      { you: 'You always control everything.', i: 'I feel restricted when I don’t get a say.' },
      { you: 'You don’t care about my feelings.', i: 'I feel hurt when my feelings aren’t considered.' },
      { you: 'You started the fight.', i: 'I feel upset about how our talk turned into an argument.' },
      { you: 'You never apologize.', i: 'I feel unresolved when apologies don’t happen.' },
      { you: 'You lied to me.', i: 'I feel let down when I can’t trust what’s said.' },
      { you: 'You only criticize.', i: 'I feel discouraged when I hear only negatives.' },
      { you: 'You don’t keep promises.', i: 'I feel disappointed when plans change without telling me.' },
      { you: 'You are too clingy.', i: 'I feel pressured when I don’t get space.' },
      { you: 'You ignored my boundary.', i: 'I feel unsafe when my boundaries aren’t respected.' },
      { you: 'You always say no.', i: 'I feel stuck when my ideas are rejected.' },
      { you: 'You never take me seriously.', i: 'I feel small when my words are laughed off.' },
      { you: 'You judged me.', i: 'I feel hurt when I’m judged.' },
      { you: 'You made fun of me.', i: 'I feel embarrassed when I’m teased.' },
      { you: 'You don’t listen to feedback.', i: 'I feel ignored when my feedback isn’t considered.' },
      { you: 'You always switch plans.', i: 'I feel stressed when plans change last minute.' },
      { you: 'You don’t share credit.', i: 'I feel unseen when my effort isn’t acknowledged.' },
      { you: 'You kept me waiting.', i: 'I feel anxious when I’m waiting without updates.' },
      { you: 'You took over the conversation.', i: 'I feel silenced when I can’t finish my thoughts.' },
      { you: 'You never check in.', i: 'I feel distant when we don’t talk for a while.' },
      { you: 'You embarrassed me.', i: 'I feel hurt about what happened in front of others.' },
      { you: 'You don’t respect my time.', i: 'I feel undervalued when my time isn’t respected.' },
    ];

    const selected = shuffle(pool).slice(0, 4);
    setICardsPrepared(selected);
    setIFlipStates(new Array(selected.length).fill(false));
  }, [activeModal]);

  // Prepare Safe Group Rules content on open
  useEffect(() => {
    if (activeModal !== 'safeRulesGame') return;

    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const decidePool: Array<{ text: string; tag: 'confidentiality' | 'respect' | 'consent' | 'escalation' | 'kindness'; correct: 'safe' | 'unsafe' | 'escalate'; explanation: string }> = [
      { text: 'Sharing someone’s private story with others without permission.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Private stories stay in the circle. Ask before sharing anything.' },
      { text: 'Listening without interrupting or laughing at someone’s feelings.', tag: 'respect', correct: 'safe', explanation: 'Respectful listening helps people feel safe to share.' },
      { text: 'Talking to a trusted adult if a friend says they feel very unsafe or hopeless.', tag: 'escalation', correct: 'escalate', explanation: 'When there is risk of harm, get adult help even if confidentiality is requested.' },
      { text: 'Making fun of someone’s problems in front of the group.', tag: 'respect', correct: 'unsafe', explanation: 'Mocking breaks trust and safety.' },
      { text: 'Reminding the group to keep conversations private.', tag: 'confidentiality', correct: 'safe', explanation: 'Normalize privacy reminders to protect trust.' },
      { text: 'Posting screenshots from the group chat on social media.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Never share group content outside without consent.' },
      { text: 'Asking "Do you want advice or just to vent?" before giving suggestions.', tag: 'consent', correct: 'safe', explanation: 'Consent first; it gives control to the speaker.' },
      { text: 'Pressuring someone to share more details when they look uncomfortable.', tag: 'consent', correct: 'unsafe', explanation: 'People choose what and when to share.' },
      { text: 'Moving a heavy topic to a private check-in with a facilitator when the group feels overwhelmed.', tag: 'kindness', correct: 'safe', explanation: 'Adjusting format keeps everyone regulated and cared for.' },
      { text: 'Telling a friend "Don\'t tell anyone, but I\'m hurting myself."', tag: 'escalation', correct: 'escalate', explanation: 'Self-harm risk requires adult help even if they ask for secrecy.' },

      { text: 'Sharing your own story to show you understand without being asked.', tag: 'consent', correct: 'unsafe', explanation: 'Even sharing your own story can shift focus; ask if they want to hear it first.' },
      { text: 'Asking before giving someone a supportive touch on the shoulder.', tag: 'consent', correct: 'safe', explanation: 'Always ask before physical contact to respect boundaries.' },
      { text: 'Telling a teacher when a friend shares they haven\'t eaten in days.', tag: 'escalation', correct: 'escalate', explanation: 'Health and safety concerns require adult intervention.' },
      { text: 'Ignoring when someone makes a rude comment about another member.', tag: 'respect', correct: 'unsafe', explanation: 'Silence can be seen as agreement; address disrespect kindly but firmly.' },
      { text: 'Suggesting a break when the conversation gets too intense.', tag: 'kindness', correct: 'safe', explanation: 'Recognizing when to pause shows care for everyone\'s wellbeing.' },
      { text: 'Sharing someone else\'s story but changing their name.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Details can still identify people; keep stories private.' },
      { text: 'Asking the group for permission before sharing something personal.', tag: 'consent', correct: 'safe', explanation: 'This respects everyone\'s comfort and maintains trust.' },
      { text: 'Telling a friend\'s secret to help them get support.', tag: 'escalation', correct: 'escalate', explanation: 'Safety concerns override confidentiality.' },
      { text: 'Laughing at an inappropriate joke to fit in.', tag: 'respect', correct: 'unsafe', explanation: 'This can normalize harmful behavior and make others uncomfortable.' },
      { text: 'Offering to help a friend talk to a trusted adult.', tag: 'kindness', correct: 'safe', explanation: 'Supporting others in getting help is caring.' },
      { text: 'Posting about group activities on social media without checking.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Always get consent before posting about others.' },
      { text: 'Asking before adding someone to a group chat.', tag: 'consent', correct: 'safe', explanation: 'Respect others\' right to choose their connections.' },
      { text: 'Telling a counselor when a friend talks about running away.', tag: 'escalation', correct: 'escalate', explanation: 'Potential danger requires responsible adult involvement.' },
      { text: 'Joining in when others are teasing someone.', tag: 'respect', correct: 'unsafe', explanation: 'Group pressure can make teasing more harmful.' },
      { text: 'Suggesting a quieter space if someone looks uncomfortable.', tag: 'kindness', correct: 'safe', explanation: 'Being attuned to others\' needs shows empathy.' },
      { text: 'Sharing a private message with one other person you trust.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Private means private, no matter who it\'s shared with.' },
      { text: 'Asking if it\'s okay to share your own similar experience.', tag: 'consent', correct: 'safe', explanation: 'This ensures your story will be welcome.' },
      { text: 'Telling a teacher when someone brings weapons to school.', tag: 'escalation', correct: 'escalate', explanation: 'Immediate danger requires immediate adult intervention.' },
      { text: 'Rolling your eyes when someone shares something personal.', tag: 'respect', correct: 'unsafe', explanation: 'Nonverbal disrespect can be just as hurtful as words.' },
      { text: 'Offering to walk with someone to the counselor\'s office.', tag: 'kindness', correct: 'safe', explanation: 'Providing support shows you care about their wellbeing.' },
      { text: 'Taking photos during group activities without asking.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Always get consent before taking or sharing photos.' },
      { text: 'Checking if everyone is comfortable with the discussion topic.', tag: 'consent', correct: 'safe', explanation: 'This creates a safer space for everyone.' },
      { text: 'Telling a trusted adult about suspected abuse or neglect.', tag: 'escalation', correct: 'escalate', explanation: 'Mandatory reporting protects those who can\'t protect themselves.' },
      { text: 'Spreading rumors you heard about someone in the group.', tag: 'respect', correct: 'unsafe', explanation: 'Rumors can cause real harm to people\'s reputations.' },
      { text: 'Offering to help mediate a conflict between friends.', tag: 'kindness', correct: 'safe', explanation: 'Helping resolve conflicts constructively benefits everyone.' },
      { text: 'Sharing someone\'s personal information to help them make friends.', tag: 'confidentiality', correct: 'unsafe', explanation: 'Let people share what they choose, when they choose.' },
      { text: 'Asking before offering advice to someone.', tag: 'consent', correct: 'safe', explanation: 'This respects the other person\'s autonomy.' },
      { text: 'Telling a counselor if someone threatens to harm others.', tag: 'escalation', correct: 'escalate', explanation: 'Threats of violence require immediate professional attention.' },
      { text: 'Ignoring someone when they join the group.', tag: 'respect', correct: 'unsafe', explanation: 'Inclusion makes everyone feel valued and welcome.' },
      { text: 'Offering to help a new member understand the group norms.', tag: 'kindness', correct: 'safe', explanation: 'Helping others feel included strengthens the group.' },
    ];

    const actionsPool: Array<{ scenario: string; options: Array<{ text: string; correct: boolean; why: string }> }> = [
      {
        scenario: 'Someone is mocked after sharing. What do you do?',
        options: [
          { text: 'Pause and restate the rule kindly; invite an apology and repair.', correct: true, why: 'Names the boundary, models repair, and restores safety.' },
          { text: 'Ignore it and continue.', correct: false, why: 'Ignoring normalizes harm and erodes trust.' },
          { text: 'Laugh along to lighten the mood.', correct: false, why: 'Humor at someone\'s expense deepens harm.' },
        ],
      },
      {
        scenario: 'A friend shares thoughts of self-harm privately.',
        options: [
          { text: 'Tell a trusted adult and explain to your friend why you\'re doing it.', correct: true, why: 'Safety overrides secrecy; be transparent and caring.' },
          { text: 'Promise to keep it secret so they trust you.', correct: false, why: 'This blocks life-saving help and puts them at risk.' },
          { text: 'Tell other students to crowdsource solutions.', correct: false, why: 'Privacy breach and poor crisis practice.' },
        ],
      },
      {
        scenario: 'Two people talk over someone who\'s sharing.',
        options: [
          { text: 'Use "one mic" rule: "Let\'s let them finish."', correct: true, why: 'Respectful structure keeps the space safe.' },
          { text: 'Ask the speaker to talk louder.', correct: false, why: 'Shifts responsibility away from interrupters.' },
          { text: 'Change the topic quickly.', correct: false, why: 'Avoids the issue and teaches nothing.' },
        ],
      },
      {
        scenario: 'Someone overshares details that trigger others.',
        options: [
          { text: 'Thank them, set a gentle boundary, and offer a private check-in.', correct: true, why: 'Balances care for the sharer and the group.' },
          { text: 'Tell them to stop and that it\'s inappropriate.', correct: false, why: 'Shaming can silence and harm trust.' },
          { text: 'Let it continue to avoid awkwardness.', correct: false, why: 'Allows potential harm to others.' },
        ],
      },
      {
        scenario: 'A member posts a screenshot of the chat elsewhere.',
        options: [
          { text: 'Remind the privacy rule and ask to delete the post; review consent policy.', correct: true, why: 'Directs repair and re-anchors the rule.' },
          { text: 'Post your own screenshot to balance things.', correct: false, why: 'Doubles the breach and normalizes it.' },
          { text: 'Do nothing; it\'s already out.', correct: false, why: 'Missed repair and accountability moment.' },
        ],
      },
      {
        scenario: 'Someone asks for a hug when another looks upset.',
        options: [
          { text: 'Ask "Would a hug help or would you prefer space?"', correct: true, why: 'Centers consent and comfort.' },
          { text: 'Give a hug to show care.', correct: false, why: 'Physical contact without clear yes can harm.' },
          { text: 'Tell them not to be dramatic.', correct: false, why: 'Dismissive and unsafe.' },
        ],
      },
      {
        scenario: 'You notice someone being excluded from a group activity.',
        options: [
          { text: 'Invite them to join and make space for them.', correct: true, why: 'Proactively includes everyone and builds community.' },
          { text: 'Assume they prefer to be alone.', correct: false, why: 'Might miss someone who wants to join but feels shy.' },
          { text: 'Ask them why they\'re not joining in.', correct: false, why: 'Puts them on the spot; better to simply include them.' },
        ],
      },
      {
        scenario: 'Someone shares something very personal and starts crying.',
        options: [
          { text: 'Offer tissues and say "Take your time; we\'re here."', correct: true, why: 'Shows support without pressure to continue or stop.' },
          { text: 'Quickly change the subject to lighten the mood.', correct: false, why: 'Can feel dismissive.' },
          { text: 'Ask probing questions for more details.', correct: false, why: 'Pries beyond what they chose to share.' },
        ],
      },
      {
        scenario: 'A group member keeps interrupting others.',
        options: [
          { text: 'Politely say "Let\'s hear from [name] who was speaking."', correct: true, why: 'Redirects respectfully while reinforcing the rule.' },
          { text: 'Roll your eyes and sigh loudly.', correct: false, why: 'Creates tension rather than addressing the behavior.' },
          { text: 'Interrupt them back to show how it feels.', correct: false, why: 'Models the same negative behavior you want to stop.' },
        ],
      },
      {
        scenario: 'Someone shares an unpopular opinion.',
        options: [
          { text: 'Say "Thanks for sharing a different perspective."', correct: true, why: 'Values all contributions while maintaining neutrality.' },
          { text: 'Quickly point out why they\'re wrong.', correct: false, why: 'Shuts down open sharing and diverse opinions.' },
          { text: 'Look around to see others\' reactions.', correct: false, why: 'Can make the speaker feel judged or ganged up on.' },
        ],
      },
      {
        scenario: 'A new member is very quiet during their first meeting.',
        options: [
          { text: 'Welcome them and say they can participate when ready.', correct: true, why: 'Respects their comfort level while being inclusive.' },
          { text: 'Call on them directly to share their thoughts.', correct: false, why: 'Might make them feel put on the spot.' },
          { text: 'Ignore them since they\'re not participating.', correct: false, why: 'Makes them feel invisible and unwelcome.' },
        ],
      },
      {
        scenario: 'Two members start arguing during discussion.',
        options: [
          { text: 'Pause and suggest taking turns to speak without interruption.', correct: true, why: 'De-escalates while keeping discussion productive.' },
          { text: 'Take sides to help one person win the argument.', correct: false, why: 'Creates division rather than resolution.' },
          { text: 'Let them argue it out to reach a conclusion.', correct: false, why: 'Allows conflict to potentially escalate.' },
        ],
      },
      {
        scenario: 'Someone shares something you strongly disagree with.',
        options: [
          { text: 'Say "I see it differently" and share your view respectfully.', correct: true, why: 'Models how to disagree constructively.' },
          { text: 'Tell them they\'re wrong and why.', correct: false, why: 'Shuts down open dialogue.' },
          { text: 'Laugh at their opinion.', correct: false, why: 'Disrespectful and discourages sharing.' },
        ],
      },
      {
        scenario: 'A member is always on their phone during meetings.',
        options: [
          { text: 'Gently remind the group about the no-phone rule.', correct: true, why: 'Addresses the issue without singling anyone out.' },
          { text: 'Take their phone away.', correct: false, why: 'Violates personal boundaries and trust.' },
          { text: 'Call them out in front of everyone.', correct: false, why: 'Embarrasses them rather than encouraging participation.' },
        ],
      },
      {
        scenario: 'Someone shares something you think is a joke, but others seem upset.',
        options: [
          { text: 'Ask the group how that landed for everyone.', correct: true, why: 'Allows for checking in and addressing impact.' },
          { text: 'Laugh to show it\'s not a big deal.', correct: false, why: 'Dismisses others\' feelings.' },
          { text: 'Scold the person for being offensive.', correct: false, why: 'Creates defensiveness rather than understanding.' },
        ],
      },
      {
        scenario: 'A member keeps dominating the conversation.',
        options: [
          { text: 'Say "Let\'s hear from someone who hasn\'t shared yet."', correct: true, why: 'Encourages balanced participation.' },
          { text: 'Interrupt them mid-sentence.', correct: false, why: 'Rude and models poor behavior.' },
          { text: 'Talk over them to take back control.', correct: false, why: 'Escalates rather than resolves the issue.' },
        ],
      },
      {
        scenario: 'Someone shares something very personal and the room feels heavy.',
        options: [
          { text: 'Acknowledge their courage in sharing and check in with the group.', correct: true, why: 'Validates the share while caring for the group.' },
          { text: 'Quickly move on to something lighter.', correct: false, why: 'Can feel dismissive of the importance of their share.' },
          { text: 'Ask them why they shared something so intense.', correct: false, why: 'Makes them feel judged for being vulnerable.' },
        ],
      },
      {
        scenario: 'A member is consistently late to meetings.',
        options: [
          { text: 'Privately check if there are any barriers to arriving on time.', correct: true, why: 'Shows care while addressing the issue.' },
          { text: 'Make a joke about their lateness in front of everyone.', correct: false, why: 'Embarrasses them and doesn\'t solve the issue.' },
          { text: 'Lock the door after the meeting starts.', correct: false, why: 'Excludes them rather than including them.' },
        ],
      },
      {
        scenario: 'Someone shares something that might be a joke but feels offensive.',
        options: [
          { text: 'Ask "Can you help me understand what you meant by that?"', correct: true, why: 'Gives them a chance to clarify or reconsider.' },
          { text: 'Laugh nervously to keep the peace.', correct: false, why: 'Implies the comment was acceptable.' },
          { text: 'Immediately tell them they\'re being offensive.', correct: false, why: 'May put them on the defensive rather than encouraging reflection.' },
        ],
      },
      {
        scenario: 'A member shares something that contradicts the group\'s values.',
        options: [
          { text: 'Restate the group\'s values and why they\'re important.', correct: true, why: 'Reinforces boundaries while educating.' },
          { text: 'Tell them they\'re wrong and should leave.', correct: false, why: 'Shuts down potential learning and growth.' },
          { text: 'Ignore it to avoid conflict.', correct: false, why: 'Allows harmful views to go unchallenged.' },
        ],
      },
      {
        scenario: 'The group is making plans that exclude one member.',
        options: [
          { text: 'Speak up and suggest including everyone.', correct: true, why: 'Ensures no one feels left out.' },
          { text: 'Go along with it to avoid making waves.', correct: false, why: 'Perpetuates exclusion.' },
          { text: 'Tell the excluded person about it privately later.', correct: false, why: 'Better to address the exclusion in the moment.' },
        ],
      },
      {
        scenario: 'Someone shares something that makes you uncomfortable.',
        options: [
          { text: 'Use "I" statements to share your feelings.', correct: true, why: 'Takes responsibility for your feelings without blaming.' },
          { text: 'Tell them they shouldn\'t talk about that.', correct: false, why: 'Shuts down sharing without explanation.' },
          { text: 'Leave the room dramatically.', correct: false, why: 'Creates tension without addressing the issue.' },
        ],
      },
      {
        scenario: 'A member keeps interrupting with off-topic comments.',
        options: [
          { text: 'Gently redirect back to the topic.', correct: true, why: 'Keeps discussion focused while being respectful.' },
          { text: 'Roll your eyes and ignore them.', correct: false, why: 'Rude and doesn\'t address the behavior.' },
          { text: 'Let them derail the conversation.', correct: false, why: 'Allows them to dominate and waste time.' },
        ],
      },
      {
        scenario: 'Someone shares something that might be a cry for help.',
        options: [
          { text: 'Check in with them privately after the meeting.', correct: true, why: 'Shows care while respecting their privacy.' },
          { text: 'Share a worse story to make them feel better.', correct: false, why: 'Minimizes their experience.' },
          { text: 'Tell them to talk to a professional.', correct: false, why: 'Can feel dismissive without offering support.' },
        ],
      },
      {
        scenario: 'The group is getting off track with side conversations.',
        options: [
          { text: 'Politely bring focus back to the main discussion.', correct: true, why: 'Keeps the group productive.' },
          { text: 'Start your own side conversation.', correct: false, why: 'Adds to the problem.' },
          { text: 'Sit in silence until someone notices.', correct: false, why: 'Passive-aggressive and unhelpful.' },
        ],
      },
      {
        scenario: 'Someone shares something very personal and the room is silent.',
        options: [
          { text: 'Acknowledge the weight of what was shared.', correct: true, why: 'Validates their courage in sharing.' },
          { text: 'Quickly move to the next topic.', correct: false, why: 'Can feel dismissive.' },
          { text: 'Fill the silence with your own story.', correct: false, why: 'Shifts focus away from them.' },
        ],
      },
      {
        scenario: 'A member keeps using their phone during the meeting.',
        options: [
          { text: 'Gently remind them of the group\'s no-phone policy.', correct: true, why: 'Reinforces group norms kindly.' },
          { text: 'Take their phone away.', correct: false, why: 'Violates personal boundaries.' },
          { text: 'Publicly shame them for being rude.', correct: false, why: 'Creates defensiveness and resentment.' },
        ],
      },
    ];

    setSafeTab('learn');
    // Show only 4 random questions in Decide section
    const decideQuestions = shuffle(decidePool).slice(0, 4);
    setSafePrepared(decideQuestions);
    setSafeChoices({});

    // Show only 3 random practice scenarios
    const practiceScenarios = shuffle(actionsPool).slice(0, 3);
    setActionPrepared(practiceScenarios.map(a => ({ ...a, options: shuffle(a.options) })));
    setActionPicks({});
  }, [activeModal]);

  // Prepare randomized Conflict Choices (30-pool -> 3 chosen) on open
  useEffect(() => {
    if (activeModal !== 'conflictLab') return;

    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const pool: Array<{ question: string; options: Array<{ text: string; correct: boolean }> }> = [
      {
        question: 'How do you start the conversation?', options: [
          { text: 'Send an angry message in the class group chat.', correct: false },
          { text: 'Ignore your friend and do everything yourself.', correct: false },
          { text: 'Ask if you can talk after class, just the two of you.', correct: true },
          { text: 'Complain about them to other classmates.', correct: false },
        ]
      },
      {
        question: 'How do you share your side?', options: [
          { text: 'You never do anything. You are so lazy.', correct: false },
          { text: 'I feel stressed when I have to do most of the work alone. Can we divide tasks more fairly?', correct: true },
          { text: 'It is fine, I will just do it myself.', correct: false },
          { text: 'If you do not help, I will tell the teacher you did nothing.', correct: false },
        ]
      },
      {
        question: 'How do you look for a solution?', options: [
          { text: 'Stop talking to them and find a new partner.', correct: false },
          { text: 'Tell them they must do everything next time.', correct: false },
          { text: 'Suggest that you both list tasks and choose who does what by a deadline.', correct: true },
          { text: 'Do nothing and hope it works out.', correct: false },
        ]
      },
      // Add 27 more concise conflict choices
      {
        question: 'When you feel unheard, what’s a calmer start?', options: [
          { text: 'You never listen.', correct: false },
          { text: 'I feel unheard. Can we try again when we both can focus?', correct: true },
          { text: 'Forget it, I won’t talk.', correct: false },
          { text: 'I’m telling everyone you ignore me.', correct: false },
        ]
      },
      {
        question: 'If a friend is late again, what helps?', options: [
          { text: 'You’re always late. So rude.', correct: false },
          { text: 'I feel stressed when we start late. Can we plan a time that works?', correct: true },
          { text: 'Don’t come next time.', correct: false },
          { text: 'I’ll be late on purpose too.', correct: false },
        ]
      },
      {
        question: 'They interrupted you. What do you say?', options: [
          { text: 'Stop talking over me!', correct: false },
          { text: 'I lose my thoughts when I’m interrupted. Can I finish?', correct: true },
          { text: 'Whatever, I’m done.', correct: false },
          { text: 'Talk to someone else.', correct: false },
        ]
      },
      {
        question: 'How to raise a boundary kindly?', options: [
          { text: 'You always cross lines.', correct: false },
          { text: 'I don’t feel safe when that happens. I need us to agree on this boundary.', correct: true },
          { text: 'Do that again and we’re done.', correct: false },
          { text: 'It’s not a big deal.', correct: false },
        ]
      },
      {
        question: 'When rumors worry you, what first step?', options: [
          { text: 'Confront everyone publicly.', correct: false },
          { text: 'I feel anxious about what I heard. Can we talk about what’s going on?', correct: true },
          { text: 'Post a callout online.', correct: false },
          { text: 'Ignore them forever.', correct: false },
        ]
      },
      {
        question: 'Friend forgot to reply. Best opener?', options: [
          { text: 'Wow, you just don’t care.', correct: false },
          { text: 'I felt worried when I didn’t hear back. Is now a good time to talk?', correct: true },
          { text: 'Fine. I won’t text you again.', correct: false },
          { text: 'You’re so unreliable.', correct: false },
        ]
      },
      {
        question: 'They criticized you harshly. What’s calmer?', options: [
          { text: 'You’re just mean.', correct: false },
          { text: 'I felt discouraged by that comment. Can we talk about it?', correct: true },
          { text: 'I’ll criticize you too.', correct: false },
          { text: 'Whatever.', correct: false },
        ]
      },
      {
        question: 'Plans changed last minute. Your move?', options: [
          { text: 'You ruin everything.', correct: false },
          { text: 'I felt stressed when plans changed. Next time, can we decide earlier?', correct: true },
          { text: 'I’m done making plans.', correct: false },
          { text: 'Tell everyone you messed up.', correct: false },
        ]
      },
      {
        question: 'A teammate didn’t do their part. Start with…', options: [
          { text: 'You’re useless.', correct: false },
          { text: 'I’m feeling overwhelmed doing this alone. Can we re-split tasks?', correct: true },
          { text: 'Forget it, I’ll do it all.', correct: false },
          { text: 'I’ll tell the teacher immediately.', correct: false },
        ]
      },
      {
        question: 'You felt mocked in front of others. Say…', options: [
          { text: 'You embarrassed me on purpose.', correct: false },
          { text: 'I felt hurt when that happened. Can we talk privately?', correct: true },
          { text: 'I’ll embarrass you back.', correct: false },
          { text: 'It’s fine, whatever.', correct: false },
        ]
      },
      {
        question: 'Friend cancels often. Response?', options: [
          { text: 'You always bail.', correct: false },
          { text: 'I feel disappointed when plans are cancelled. Can we choose a time that works?', correct: true },
          { text: 'I won’t invite you anymore.', correct: false },
          { text: 'Tell everyone why you bailed.', correct: false },
        ]
      },
      {
        question: 'They raised their voice. What helps?', options: [
          { text: 'Yell back.', correct: false },
          { text: 'I’m finding it hard to talk when voices are raised. Can we take a breath?', correct: true },
          { text: 'Leave and block them.', correct: false },
          { text: 'Mock them.', correct: false },
        ]
      },
      {
        question: 'How to invite fairness?', options: [
          { text: 'You do it all next time.', correct: false },
          { text: 'I want this to feel fair. Can we list tasks together?', correct: true },
          { text: 'I’ll do nothing next time.', correct: false },
          { text: 'Tell the teacher you failed.', correct: false },
        ]
      },
      {
        question: 'They didn’t apologize. Best move?', options: [
          { text: 'You never say sorry.', correct: false },
          { text: 'I still feel upset. Can we talk about what happened and how to repair?', correct: true },
          { text: 'I’m done with you.', correct: false },
          { text: 'I’ll make you feel bad.', correct: false },
        ]
      },
      {
        question: 'Feeling left out. Start with…', options: [
          { text: 'You exclude me on purpose.', correct: false },
          { text: 'I felt left out. Could we plan something together soon?', correct: true },
          { text: 'I’ll exclude you too.', correct: false },
          { text: 'Forget everyone.', correct: false },
        ]
      },
      {
        question: 'They used your stuff. What do you say?', options: [
          { text: 'You’re a thief.', correct: false },
          { text: 'I feel upset when my things are used without asking. Can we check first?', correct: true },
          { text: 'I’ll hide everything.', correct: false },
          { text: 'It’s not important.', correct: false },
        ]
      },
      {
        question: 'They joked about you. Reply with…', options: [
          { text: 'You’re so mean.', correct: false },
          { text: 'I felt embarrassed by that joke. Please don’t joke about me.', correct: true },
          { text: 'I’ll joke about you too.', correct: false },
          { text: 'I don’t care.', correct: false },
        ]
      },
      {
        question: 'Friend dominated the conversation. Try…', options: [
          { text: 'You always talk too much.', correct: false },
          { text: 'I didn’t get to share. Could I finish my thought?', correct: true },
          { text: 'Whatever.', correct: false },
          { text: 'I’m not talking again.', correct: false },
        ]
      },
      {
        question: 'Missed a boundary. What now?', options: [
          { text: 'You don’t respect me.', correct: false },
          { text: 'I didn’t feel okay with that. I need us to agree on this boundary.', correct: true },
          { text: 'Do that again and see.', correct: false },
          { text: 'It’s fine.', correct: false },
        ]
      },
      {
        question: 'They were sarcastic. Response?', options: [
          { text: 'Be sarcastic back.', correct: false },
          { text: 'I felt put down by that. Can we keep it kind?', correct: true },
          { text: 'Stop talking.', correct: false },
          { text: 'Tell others about them.', correct: false },
        ]
      },
      {
        question: 'Group chat heated up. You…', options: [
          { text: 'Type a long rant.', correct: false },
          { text: 'Ask to move to a calm 1:1 chat.', correct: true },
          { text: 'Leave the group angrily.', correct: false },
          { text: 'Screenshot and post.', correct: false },
        ]
      },
      {
        question: 'You’re overwhelmed. What do you ask?', options: [
          { text: 'You never help me.', correct: false },
          { text: 'I’m overwhelmed. Can you help me with two tasks?', correct: true },
          { text: 'Forget it.', correct: false },
          { text: 'I’ll fail anyway.', correct: false },
        ]
      },
      {
        question: 'They compared you to others. Reply…', options: [
          { text: 'You’re wrong.', correct: false },
          { text: 'I feel discouraged by comparisons. Can we talk about me instead?', correct: true },
          { text: 'I’ll compare you too.', correct: false },
          { text: 'Whatever.', correct: false },
        ]
      },
      {
        question: 'Scheduling conflict. Best approach?', options: [
          { text: 'You ruined my week.', correct: false },
          { text: 'I want to find a time that works for both of us. What’s good for you?', correct: true },
          { text: 'Never mind, forget it.', correct: false },
          { text: 'You’re impossible.', correct: false },
        ]
      },
      {
        question: 'You got blamed unfairly. Start with…', options: [
          { text: 'You’re lying.', correct: false },
          { text: 'I feel blamed and would like to share my side. Can we talk?', correct: true },
          { text: 'I’ll blame you back.', correct: false },
          { text: 'Tell everyone my side.', correct: false },
        ]
      },
      {
        question: 'They forgot an agreement. Try…', options: [
          { text: 'You never remember.', correct: false },
          { text: 'I was counting on that. Can we make a simple reminder next time?', correct: true },
          { text: 'I give up.', correct: false },
          { text: 'It’s all your fault.', correct: false },
        ]
      },
      {
        question: 'Conflict is escalating. You…', options: [
          { text: 'Keep pushing your point.', correct: false },
          { text: 'Suggest a short break and return to talk.', correct: true },
          { text: 'End the friendship now.', correct: false },
          { text: 'Start shouting.', correct: false },
        ]
      },
      {
        question: 'You want fairness next time. Say…', options: [
          { text: 'You do everything next time.', correct: false },
          { text: 'I want this to feel fair next time. Can we plan it together?', correct: true },
          { text: 'I’ll drop out.', correct: false },
          { text: 'I’ll make you do it.', correct: false },
        ]
      },
      {
        question: 'They dismissed your feeling. Respond…', options: [
          { text: 'You’re heartless.', correct: false },
          { text: 'I still feel upset. Can we slow down and listen to each other?', correct: true },
          { text: 'Fine, don’t care.', correct: false },
          { text: 'I’ll dismiss you too.', correct: false },
        ]
      },
      {
        question: 'They want to argue online. You…', options: [
          { text: 'Write paragraphs.', correct: false },
          { text: 'Ask to talk in person when calm.', correct: true },
          { text: 'Block immediately.', correct: false },
          { text: 'Tell others.', correct: false },
        ]
      },
      {
        question: 'You need a boundary about time. Say…', options: [
          { text: 'Stop wasting my time.', correct: false },
          { text: 'I need to end by 6. Can we wrap up then?', correct: true },
          { text: 'I’m done with plans.', correct: false },
          { text: 'Figure it out yourself.', correct: false },
        ]
      },
      {
        question: 'They forgot your message. Start with…', options: [
          { text: 'You ignored me.', correct: false },
          { text: 'I wanted to check in about my last message. Is now okay?', correct: true },
          { text: 'Never mind.', correct: false },
          { text: 'You’re careless.', correct: false },
        ]
      },
      {
        question: 'They escalated quickly. You…', options: [
          { text: 'Escalate back.', correct: false },
          { text: 'Suggest a calmer time to talk.', correct: true },
          { text: 'Say nothing forever.', correct: false },
          { text: 'Tell on them.', correct: false },
        ]
      },
    ];

    const chosen = shuffle(pool).slice(0, 3).map(q => ({
      question: q.question,
      options: shuffle(q.options).map(o => ({
        ...o,
        why: o.correct
          ? 'This response moves the situation toward calm and fairness.'
          : 'This response tends to escalate or shut down the conversation.'
      })),
    }));

    setConflictPrepared(chosen);
    setConflictStep(0);
    setConflictChoice(null);
  }, [activeModal]);

  // Prepare random scenarios for Active Listening Lab on open
  useEffect(() => {
    if (activeModal !== 'listeningLab') return;

    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const pool = [
      {
        friend: "I'm really stressed about exams and things at home.",
        badReply: "You’re overreacting. It’s not a big deal.",
        problems: [
          { text: "It judges their feelings and dismisses the stress.", feedback: "Judging/dismissing breaks trust and makes them feel unheard.", correct: true },
          { text: "It shows patience and care.", feedback: "This reply doesn’t show patience or care.", correct: false },
          { text: "It asks how you can support them.", feedback: "Asking needs is helpful later, but first reflect their feeling.", correct: false },
        ],
        repairs: [
          { text: "It sounds like you’re really stressed. Do you want to talk about what’s worrying you most?", feedback: "Reflects feelings and invites sharing.", correct: true },
          { text: "Don’t worry, it will be fine.", feedback: "Minimizes their feelings and may shut the talk down.", correct: false },
          { text: "You should just study more and forget about home stuff.", feedback: "Advises too soon and dismisses home worries.", correct: false },
        ],
      },
      {
        friend: "I feel like nobody understands me in class.",
        badReply: "That’s not true, you’re just being dramatic.",
        problems: [
          { text: "It calls them dramatic instead of listening.", feedback: "Labeling is invalidating and shuts people down.", correct: true },
          { text: "It invites them to share more.", feedback: "The bad reply didn’t invite sharing.", correct: false },
          { text: "It asks what they need right now.", feedback: "Ask needs after you acknowledge how they feel.", correct: false },
        ],
        repairs: [
          { text: "I’m sorry you feel that way. Do you want to tell me what happened?", feedback: "Validates and opens space to share.", correct: true },
          { text: "Lots of people feel like that, it’s normal.", feedback: "Normalizing alone can feel dismissive.", correct: false },
          { text: "You should just try to fit in more.", feedback: "Prescriptive and can feel blaming.", correct: false },
        ],
      },
      {
        friend: "My parents keep fighting and I can’t focus.",
        badReply: "Everyone’s parents fight. Move on.",
        problems: [
          { text: "It dismisses their pain and compares it away.", feedback: "Comparison minimizes their unique experience.", correct: true },
          { text: "It reflects their feelings.", feedback: "This reply does not reflect their feelings.", correct: false },
          { text: "It asks a curious question.", feedback: "No curiosity here—just dismissal.", correct: false },
        ],
        repairs: [
          { text: "That sounds really hard. Do you want to talk about what’s been toughest?", feedback: "Empathy + gentle question keeps it safe.", correct: true },
          { text: "You’ll be fine, just ignore it.", feedback: "Ignoring rarely helps feeling heard.", correct: false },
          { text: "You should spend more time outside.", feedback: "Advice before listening can miss the point.", correct: false },
        ],
      },
      {
        friend: "I messed up a test and I feel stupid.",
        badReply: "Well, you didn’t study enough.",
        problems: [
          { text: "It blames them instead of caring for the feeling.", feedback: "Blame increases shame and shuts sharing down.", correct: true },
          { text: "It celebrates their effort.", feedback: "There’s no celebration here.", correct: false },
          { text: "It offers to help study together.", feedback: "Offering help can be good later—first care for feelings.", correct: false },
        ],
        repairs: [
          { text: "I’m sorry you’re feeling that way. Want to talk about what was tricky?", feedback: "Validates and invites details.", correct: true },
          { text: "It’s just one test, stop worrying.", feedback: "Minimizes the emotion.", correct: false },
          { text: "Next time, try harder.", feedback: "Prescriptive and blame-y.", correct: false },
        ],
      },
      {
        friend: "I think my best friend is ignoring me.",
        badReply: "You’re being paranoid.",
        problems: [
          { text: "It labels them instead of exploring the feeling.", feedback: "Labeling shuts down trust.", correct: true },
          { text: "It asks more about the situation.", feedback: "This reply didn’t ask anything.", correct: false },
          { text: "It thanks them for sharing.", feedback: "No appreciation expressed here.", correct: false },
        ],
        repairs: [
          { text: "That sounds upsetting. Do you want to tell me what’s been happening?", feedback: "Names the feeling and invites sharing.", correct: true },
          { text: "They’re probably busy, don’t overthink.", feedback: "Assumptions can feel invalidating.", correct: false },
          { text: "Just find new friends.", feedback: "Abrupt advice ignores the emotion.", correct: false },
        ],
      },
      // Add 15 more concise scenarios
      {
        friend: "Lunch time makes me anxious.", badReply: "Just eat faster.",
        problems: [
          { text: "It ignores their anxiety and oversimplifies.", feedback: "Oversimplifying dismisses the feeling.", correct: true },
          { text: "It’s gentle and validating.", feedback: "It isn’t.", correct: false },
          { text: "It offers to listen.", feedback: "It doesn’t offer listening.", correct: false },
        ],
        repairs: [
          { text: "That sounds uncomfortable. Want to tell me what part feels hardest?", feedback: "Validates + curious question.", correct: true },
          { text: "It’s fine, you’ll adjust.", feedback: "Minimizes experience.", correct: false },
          { text: "Sit somewhere else.", feedback: "Advice first can miss feelings.", correct: false },
        ],
      },
      {
        friend: "Group projects scare me.", badReply: "Don’t be a baby.",
        problems: [
          { text: "It insults them instead of caring.", feedback: "Insults shut people down.", correct: true },
          { text: "It seeks to understand.", feedback: "No understanding sought.", correct: false },
          { text: "It shares your own story first.", feedback: "Not always helpful at the start.", correct: false },
        ],
        repairs: [
          { text: "That sounds tough. What part of group projects worries you most?", feedback: "Empathy + open question.", correct: true },
          { text: "You’ll be fine.", feedback: "Minimizes.", correct: false },
          { text: "Just take charge.", feedback: "Premature advice.", correct: false },
        ],
      },
      {
        friend: "Coach yelled at me today.", badReply: "Well, maybe you deserved it.",
        problems: [
          { text: "It blames and shames them.", feedback: "Shame prevents sharing.", correct: true },
          { text: "It validates their feelings.", feedback: "No validation present.", correct: false },
          { text: "It invites details.", feedback: "No curiosity asked.", correct: false },
        ],
        repairs: [
          { text: "I’m sorry that happened. Want to tell me what led up to it?", feedback: "Validation + curiosity.", correct: true },
          { text: "Ignore your coach.", feedback: "Dismissive advice.", correct: false },
          { text: "You should quit.", feedback: "Extreme advice ignores context.", correct: false },
        ],
      },
      {
        friend: "I can’t sleep lately.", badReply: "Stop using your phone.",
        problems: [
          { text: "It jumps to advice without listening.", feedback: "Advice-first can feel cold.", correct: true },
          { text: "It reflects their struggle.", feedback: "No reflection.", correct: false },
          { text: "It invites support needs.", feedback: "Not asked here.", correct: false },
        ],
        repairs: [
          { text: "That’s hard. Do you want to share what’s on your mind at night?", feedback: "Empathy + invite sharing.", correct: true },
          { text: "Just sleep earlier.", feedback: "Over-simplified advice.", correct: false },
          { text: "It’s not a big deal.", feedback: "Minimizes feelings.", correct: false },
        ],
      },
      {
        friend: "I got left out of a party.", badReply: "Maybe they don’t like you.",
        problems: [
          { text: "It’s hurtful and assumes the worst.", feedback: "Assumptions can deepen hurt.", correct: true },
          { text: "It validates their hurt.", feedback: "No validation.", correct: false },
          { text: "It asks what happened.", feedback: "No curiosity.", correct: false },
        ],
        repairs: [
          { text: "That must feel really painful. Do you want to talk about it?", feedback: "Validation + invite.", correct: true },
          { text: "Forget them.", feedback: "Dismissive.", correct: false },
          { text: "Make new friends.", feedback: "Advice-first.", correct: false },
        ],
      },
      {
        friend: "I think I bombed my audition.", badReply: "Guess you’re not cut out for it.",
        problems: [
          { text: "It attacks identity instead of supporting.", feedback: "Attacks increase shame.", correct: true },
          { text: "It’s gentle and kind.", feedback: "It isn't.", correct: false },
          { text: "It explores feelings.", feedback: "It doesn't.", correct: false },
        ],
        repairs: [
          { text: "That’s rough to feel. Want to share what felt hardest?", feedback: "Empathy + reflection.", correct: true },
          { text: "Maybe you should quit.", feedback: "Premature conclusion.", correct: false },
          { text: "Just practice more.", feedback: "Advice-first.", correct: false },
        ],
      },
      {
        friend: "My sibling keeps taking my stuff.", badReply: "Stop being dramatic.",
        problems: [
          { text: "It labels them and invalidates feelings.", feedback: "Invalidation breaks trust.", correct: true },
          { text: "It respects their boundary.", feedback: "No respect offered.", correct: false },
          { text: "It appreciates their honesty.", feedback: "Not present.", correct: false },
        ],
        repairs: [
          { text: "That sounds frustrating. Want to talk through what’s been happening?", feedback: "Names feeling + invites.", correct: true },
          { text: "Just lock your room.", feedback: "Advice-first.", correct: false },
          { text: "It’s normal.", feedback: "Minimizes.", correct: false },
        ],
      },
      {
        friend: "I think I failed my math quiz.", badReply: "You’re just bad at math.",
        problems: [
          { text: "It labels ability and shames them.", feedback: "Shame harms confidence.", correct: true },
          { text: "It offers empathy.", feedback: "No empathy present.", correct: false },
          { text: "It asks details.", feedback: "No curiosity.", correct: false },
        ],
        repairs: [
          { text: "I’m sorry, that feels rough. Want to go over what was confusing?", feedback: "Empathy + specifics.", correct: true },
          { text: "Study harder.", feedback: "Unhelpful blame.", correct: false },
          { text: "It’s just a quiz.", feedback: "Minimization.", correct: false },
        ],
      },
      {
        friend: "I feel lonely lately.", badReply: "You’re too sensitive.",
        problems: [
          { text: "It dismisses and labels their feeling.", feedback: "Dismissal increases isolation.", correct: true },
          { text: "It empathizes.", feedback: "No empathy here.", correct: false },
          { text: "It invites connection.", feedback: "Not invited here.", correct: false },
        ],
        repairs: [
          { text: "Thanks for telling me. Want to talk about when it feels worst?", feedback: "Appreciation + explore.", correct: true },
          { text: "Go hang out more.", feedback: "Advice-first.", correct: false },
          { text: "You’ll be fine.", feedback: "Minimizes.", correct: false },
        ],
      },
      {
        friend: "I’m scared about a rumor about me.", badReply: "Ignore it, it’ll die.",
        problems: [
          { text: "It skips caring and goes to strategy.", feedback: "Strategy without care can feel cold.", correct: true },
          { text: "It validates the fear.", feedback: "Not validated here.", correct: false },
          { text: "It asks what’s happening.", feedback: "No curiosity present.", correct: false },
        ],
        repairs: [
          { text: "That sounds scary. Do you want to tell me what’s going on?", feedback: "Names fear + invites details.", correct: true },
          { text: "Just block everyone.", feedback: "Premature tactic.", correct: false },
          { text: "It doesn’t matter.", feedback: "Minimization.", correct: false },
        ],
      },
      {
        friend: "I got into a fight with my friend.", badReply: "You always pick fights.",
        problems: [
          { text: "It generalizes and blames.", feedback: "Generalizations increase defensiveness.", correct: true },
          { text: "It listens gently.", feedback: "No gentle listening.", correct: false },
          { text: "It offers support.", feedback: "No support offered.", correct: false },
        ],
        repairs: [
          { text: "Sounds rough. Want to walk me through what happened?", feedback: "Empathy + curiosity.", correct: true },
          { text: "Say sorry.", feedback: "Advice-first.", correct: false },
          { text: "Forget them.", feedback: "Dismissive.", correct: false },
        ],
      },
      {
        friend: "Teacher embarrassed me in class.", badReply: "Maybe you deserved it.",
        problems: [
          { text: "It blames instead of caring.", feedback: "Blame blocks safety.", correct: true },
          { text: "It invites sharing.", feedback: "No invitation.", correct: false },
          { text: "It validates feelings.", feedback: "Not validated.", correct: false },
        ],
        repairs: [
          { text: "I’m sorry that happened. Want to tell me more?", feedback: "Validation + invite.", correct: true },
          { text: "Just shake it off.", feedback: "Minimizes.", correct: false },
          { text: "Don’t answer in class.", feedback: "Strategy-first.", correct: false },
        ],
      },
      {
        friend: "I lost my notes and I’m panicking.", badReply: "That’s your fault.",
        problems: [
          { text: "It blames and increases panic.", feedback: "Blame worsens anxiety.", correct: true },
          { text: "It appreciates them sharing.", feedback: "No appreciation.", correct: false },
          { text: "It asks what they need.", feedback: "Not asked.", correct: false },
        ],
        repairs: [
          { text: "That’s stressful. Want help figuring out a plan?", feedback: "Empathy then collaborative plan.", correct: true },
          { text: "Be more careful.", feedback: "Unhelpful judgement.", correct: false },
          { text: "It’s fine.", feedback: "Minimizes.", correct: false },
        ],
      },
      {
        friend: "I don’t want to go to school tomorrow.", badReply: "Stop being lazy.",
        problems: [
          { text: "It labels them and ignores the reason.", feedback: "Labels shut people down.", correct: true },
          { text: "It asks why.", feedback: "Not asked here.", correct: false },
          { text: "It reflects the feeling.", feedback: "Not reflected.", correct: false },
        ],
        repairs: [
          { text: "That sounds heavy. Want to tell me what’s making it hard?", feedback: "Empathy + curiosity.", correct: true },
          { text: "Just go.", feedback: "Dismissive command.", correct: false },
          { text: "You’ll be okay.", feedback: "Minimizes.", correct: false },
        ],
      },
      {
        friend: "I hate how I look.", badReply: "You’re overreacting.",
        problems: [
          { text: "It invalidates a vulnerable feeling.", feedback: "Invalidation deepens hurt.", correct: true },
          { text: "It explores the feeling gently.", feedback: "Not explored.", correct: false },
          { text: "It shows care.", feedback: "Care not shown.", correct: false },
        ],
        repairs: [
          { text: "Thanks for trusting me. Want to share what feels hardest?", feedback: "Appreciation + invite.", correct: true },
          { text: "No you don’t.", feedback: "Dismisses their truth.", correct: false },
          { text: "Just be confident.", feedback: "Oversimplified advice.", correct: false },
        ],
      },
      {
        friend: "I think I annoyed my friend.", badReply: "Probably.",
        problems: [
          { text: "It confirms fear and offers no care.", feedback: "Cold responses harm safety.", correct: true },
          { text: "It validates them.", feedback: "Not validated.", correct: false },
          { text: "It invites more.", feedback: "No invitation.", correct: false },
        ],
        repairs: [
          { text: "That sounds worrying. Want to tell me what happened?", feedback: "Empathy + curiosity.", correct: true },
          { text: "Just apologize now.", feedback: "Advice-first.", correct: false },
          { text: "Forget it.", feedback: "Dismissive.", correct: false },
        ],
      },
      {
        friend: "I can’t catch up on homework.", badReply: "Stop wasting time.",
        problems: [
          { text: "It blames and shames.", feedback: "Shame blocks problem-solving.", correct: true },
          { text: "It offers empathy.", feedback: "No empathy.", correct: false },
          { text: "It explores obstacles.", feedback: "Not explored.", correct: false },
        ],
        repairs: [
          { text: "That’s overwhelming. Want to list what’s pending together?", feedback: "Empathy then plan.", correct: true },
          { text: "Just do it.", feedback: "Minimizes complexity.", correct: false },
          { text: "Skip it.", feedback: "Dismissive.", correct: false },
        ],
      },
      {
        friend: "I’m nervous to text someone back.", badReply: "You’re overthinking.",
        problems: [
          { text: "It dismisses and labels the worry.", feedback: "Dismissal invalidates.", correct: true },
          { text: "It invites details.", feedback: "Not invited.", correct: false },
          { text: "It reflects the feeling.", feedback: "Not reflected.", correct: false },
        ],
        repairs: [
          { text: "Sounds nerve-wracking. Want to talk through what you want to say?", feedback: "Empathy + collaborative support.", correct: true },
          { text: "Just send it.", feedback: "Advice-first.", correct: false },
          { text: "It doesn’t matter.", feedback: "Minimization.", correct: false },
        ],
      },
      {
        friend: "I think I embarrassed myself.", badReply: "No one cares.",
        problems: [
          { text: "It dismisses their embarrassment.", feedback: "Dismissal increases shame.", correct: true },
          { text: "It validates.", feedback: "No validation given.", correct: false },
          { text: "It explores.", feedback: "No curiosity shown.", correct: false },
        ],
        repairs: [
          { text: "That sounds embarrassing. Want to tell me what happened?", feedback: "Validation + curiosity.", correct: true },
          { text: "Forget it.", feedback: "Dismissive.", correct: false },
          { text: "Don’t do that again.", feedback: "Blame and advice.", correct: false },
        ],
      },
      {
        friend: "My friend didn’t reply all day.", badReply: "You’re clingy.",
        problems: [
          { text: "It labels them and shames the need for connection.", feedback: "Labels hurt.", correct: true },
          { text: "It empathizes.", feedback: "No empathy.", correct: false },
          { text: "It asks context.", feedback: "No curiosity.", correct: false },
        ],
        repairs: [
          { text: "That feels worrying. Want to talk about what you’re afraid of?", feedback: "Names worry + invites.", correct: true },
          { text: "Stop texting.", feedback: "Strategy-first.", correct: false },
          { text: "They don’t care.", feedback: "Assumes worst; hurtful.", correct: false },
        ],
      },
      {
        friend: "People laughed when I spoke.", badReply: "Maybe you sounded silly.",
        problems: [
          { text: "It insults them instead of supporting.", feedback: "Insults deepen hurt.", correct: true },
          { text: "It validates.", feedback: "No validation.", correct: false },
          { text: "It invites details.", feedback: "No curiosity.", correct: false },
        ],
        repairs: [
          { text: "That sounds hurtful. Do you want to tell me what happened?", feedback: "Validation + invite.", correct: true },
          { text: "Speak louder next time.", feedback: "Advice-first.", correct: false },
          { text: "Forget it.", feedback: "Dismissive.", correct: false },
        ],
      },
    ];

    const chosen = shuffle(pool).slice(0, 2).map(s => ({
      friend: s.friend,
      badReply: s.badReply,
      problems: shuffle(s.problems),
      repairs: shuffle(s.repairs),
    }));

    setListeningLabStep(0);
    setLlProblemPick(null);
    setLlReplyPick(null);
    setLlPrepared(chosen);
  }, [activeModal]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [soundEnabled]);

  // Play sound effect
  const playSound = (type: 'ping' | 'chime' | 'ambient') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'ping':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      case 'chime':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
      case 'ambient':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + (type === 'ambient' ? 1 : type === 'chime' ? 0.5 : 0.1));
  };

  // Award badge
  const awardBadge = (badgeId: string) => {
    setBadges(prev => prev.map(badge =>
      badge.id === badgeId ? { ...badge, earned: true } : badge
    ));
    setShowConfetti(true);
    playSound('chime');
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Complete challenge
  const completeChallenge = (challengeType: keyof ChallengeProgress) => {
    setChallenges(prev => ({ ...prev, [challengeType]: true }));

    if (challengeType === 'dailyCheckIn' && !challenges.dailyCheckIn) {
      awardBadge('supportive-buddy');
    }
    if (challengeType === 'reflectionJournal' && !challenges.reflectionJournal) {
      awardBadge('kind-listener');
    }

    playSound('ping');
  };

  // Handle active listening modal
  const handleActiveListening = (response: 'good' | 'bad') => {
    setSelectedResponse(response);
    playSound('ping');

    setTimeout(() => {
      if (listeningStep === 0) {
        setListeningStep(1);
        setSelectedResponse(null);
      } else {
        setActiveModal(null);
        setListeningStep(0);
        setSelectedResponse(null);
        completeChallenge('activeListening');
      }
    }, 2000);
  };

  // Handle peer group modal
  const handlePeerGroupCheck = (index: number) => {
    const newChecks = [...peerGroupChecks];
    newChecks[index] = !newChecks[index];
    setPeerGroupChecks(newChecks);
    playSound('ping');

    if (newChecks.every(check => check)) {
      completeChallenge('peerGroup');
    }
  };

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Confetti component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 10,
            x: Math.random() * window.innerWidth,
            opacity: 0
          }}
          transition={{
            duration: 3,

            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-200 font-nunito relative">
      {/* Back to Resources Button */}
      <motion.a
        href="/resources"
        onClick={(e) => { e.preventDefault(); navigate('/resources'); }}
        className="fixed top-20 left-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Resources</span>
      </motion.a>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-400 to-blue-400 z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      {/* Active Listening Lab Game Modal */}
      <AnimatePresence>
        {activeModal === 'listeningLab' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl p-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ×
              </button>
              <h3 className="text-lg md:text-xl font-bold text-blue-800 mb-1 text-center">Active Listening Lab</h3>
              <p className="text-blue-700 text-xs mb-3 text-center">
                Walk through short chats and repair replies so your friend feels heard.
              </p>

              {(() => {
                // Prefer prepared randomized scenarios (20-pool -> 2 chosen)
                const prepared = llPrepared;
                if (!prepared || prepared.length === 0) {
                  return (
                    <div className="space-y-6">
                      <div className="animate-pulse bg-blue-50 rounded-2xl p-5">
                        <div className="h-4 w-24 bg-blue-100 rounded mb-3"></div>
                        <div className="h-5 w-3/4 bg-blue-100 rounded mb-4"></div>
                        <div className="h-4 w-40 bg-blue-100 rounded mb-2"></div>
                        <div className="h-5 w-2/3 bg-blue-100 rounded"></div>
                      </div>
                    </div>
                  );
                }
                // Fallback static scenarios (kept for safety but ignored when prepared is present)
                const scenarios = [
                  {
                    friend: "I'm really stressed about exams and things at home.",
                    badReply: "You’re overreacting. It’s not a big deal.",
                    problems: [
                      "It judges their feelings and dismisses the stress.",
                      "It shows patience and care.",
                      "It asks how you can support them.",
                    ],
                    problemsFeedback: [
                      "Correct. Dismissing or judging feelings breaks trust and makes them feel unheard.",
                      "Not quite. Patience and care would be good, but this reply doesn’t show that.",
                      "Close, asking support needs is helpful later, but first reflect their feeling.",
                    ],
                    actions: [
                      "Reflect their feeling (It sounds like you’re really stressed).",
                      "Change the topic.",
                      "Give advice without listening.",
                    ],
                    actionsFeedback: [
                      "Great choice. Reflection shows you’re listening and validates their emotion.",
                      "Changing the topic can feel like you don’t care about their stress.",
                      "Advice too soon can feel dismissive. Listen first, advise later.",
                    ],
                    repairs: [
                      "It sounds like you’re really stressed. Do you want to talk about what’s worrying you most?",
                      "Don’t worry, it will be fine.",
                      "You should just study more and forget about home stuff.",
                    ],
                    repairsFeedback: [
                      "Spot on. This reply reflects, invites sharing, and offers support.",
                      "This minimizes their feelings and may shut the conversation down.",
                      "This dismisses home worries and gives advice without understanding.",
                    ],
                  },
                  {
                    friend: "I feel like nobody understands me in class.",
                    badReply: "That’s not true, you’re just being dramatic.",
                    problems: [
                      "It calls them dramatic instead of listening.",
                      "It invites them to share more.",
                      "It asks what they need right now.",
                    ],
                    problemsFeedback: [
                      "Correct. Labeling them as dramatic is invalidating.",
                      "Not this time. The bad reply didn’t invite sharing.",
                      "Not quite. Asking needs is helpful later, but first acknowledge how they feel.",
                    ],
                    actions: [
                      "Ask a gentle question.",
                      "Talk only about yourself.",
                      "Interrupt and tell them what to do.",
                    ],
                    actionsFeedback: [
                      "Yes. Gentle questions help them open up and feel understood.",
                      "Talking about yourself shifts focus away from their feelings.",
                      "Interrupting takes control and can make them feel smaller.",
                    ],
                    repairs: [
                      "I’m sorry you feel that way. Do you want to tell me what happened?",
                      "Lots of people feel like that, it’s normal.",
                      "You should just try to fit in more.",
                    ],
                    repairsFeedback: [
                      "Good repair. It validates and invites them to share more.",
                      "This normalizes but doesn’t validate their unique experience.",
                      "This is prescriptive and can feel blaming.",
                    ],
                  },
                ];

                // Use prepared randomized scenarios
                const scenariosToUse = prepared;
                const current = scenariosToUse[listeningLabStep] ?? scenariosToUse[0];

                const stage = 'combined';

                return (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 max-w-xl">
                        <img src="/Resource Images/5. peer  support &sharing/other.png" alt="Friend" className="h-6 w-6 rounded-full object-cover" />
                        <div className="relative">
                          <div className="bg-white border border-blue-100 rounded-2xl rounded-tl-sm px-2.5 py-1.5 shadow-sm text-blue-900/90 text-xs md:text-sm">
                            “{current.friend}”
                          </div>
                          <div className="absolute -left-1 top-3 h-3 w-3 bg-white border-l border-t border-blue-100 rotate-45"></div>
                          <div className="text-xs text-blue-500 mt-1 font-medium">Friend</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 max-w-xl ml-auto justify-end">
                        <div className="relative order-2">
                          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-2.5 py-1.5 shadow-sm text-xs md:text-sm">
                            “{current.badReply}”
                          </div>
                          <div className="absolute -right-1 top-3 h-3 w-3 bg-blue-600 rotate-45"></div>
                          <div className="text-[10px] text-blue-500 mt-0.5 text-right font-medium">You (needs repair)</div>
                        </div>
                        <img src="/Resource Images/5. peer  support &sharing/you.png" alt="You" className="h-6 w-6 rounded-full object-cover order-3" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-blue-900 font-semibold mb-2">What’s the problem with this reply?</p>
                        <div className="space-y-3">
                          {current.problems.map((opt, idx) => (
                            <button
                              key={idx}
                              disabled={llProblemPick !== null}
                              onClick={() => setLlProblemPick(idx)}
                              className={`w-full text-left p-1.5 md:p-2 rounded-xl border text-xs transition-all hover:bg-gray-50 disabled:opacity-75 disabled:cursor-not-allowed shadow-sm ${llProblemPick === idx
                                ? (current.problems[idx]?.correct
                                  ? 'bg-green-50 border-green-500 text-green-800 ring-2 ring-green-200'
                                  : 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200')
                                : 'border-gray-200'
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${llProblemPick === idx ? (current.problems[idx]?.correct ? 'bg-green-500' : 'bg-amber-500') : 'bg-gray-300'}`}></div>
                                <span>{typeof opt === 'string' ? opt : opt.text}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        {llProblemPick !== null ? (
                          <div className={`mt-3 rounded-xl p-4 md:p-5 border ${current.problems[llProblemPick]?.correct ? 'bg-green-50 text-green-900 border-green-200' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${current.problems[llProblemPick]?.correct ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{current.problems[llProblemPick]?.correct ? '✓' : '!'}</div>
                              <h4 className="font-semibold text-base md:text-lg">{current.problems[llProblemPick]?.correct ? 'Why this is best' : 'What could go wrong'}</h4>
                            </div>
                            <p className="text-sm md:text-base leading-relaxed">{current.problems[llProblemPick]?.feedback}</p>
                            <ul className="mt-3 text-sm md:text-base list-disc pl-5 space-y-1 opacity-90">
                              <li>{current.problems[llProblemPick]?.correct ? 'Builds trust by validating feelings.' : 'May make your friend feel judged or shut down.'}</li>
                              <li>{current.problems[llProblemPick]?.correct ? 'Keeps the conversation open and calm.' : 'Closes the conversation before it starts.'}</li>
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm md:text-base text-blue-500 mt-3">Hint: Look for the choice that respects and reflects their feelings.</p>
                        )}
                      </div>

                      <div>
                        <p className="text-blue-900 font-semibold mb-2">Now pick a better reply.</p>
                        <div className="space-y-3">
                          {current.repairs.map((opt, idx) => (
                            <button
                              key={idx}
                              disabled={llReplyPick !== null}
                              onClick={() => setLlReplyPick(idx)}
                              className={`w-full text-left p-1.5 md:p-2 rounded-xl border text-xs transition-all hover:bg-gray-50 disabled:opacity-75 disabled:cursor-not-allowed shadow-sm ${llReplyPick === idx
                                ? (current.repairs[idx]?.correct
                                  ? 'bg-green-50 border-green-500 text-green-800 ring-2 ring-green-200'
                                  : 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200')
                                : 'border-gray-200'
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${llReplyPick === idx ? (current.repairs[idx]?.correct ? 'bg-green-500' : 'bg-amber-500') : 'bg-gray-300'}`}></div>
                                <span>{typeof opt === 'string' ? opt : opt.text}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        {llReplyPick !== null && (
                          <div className={`mt-3 rounded-xl p-4 md:p-5 border ${current.repairs[llReplyPick]?.correct ? 'bg-green-50 text-green-900 border-green-200' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${current.repairs[llReplyPick]?.correct ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{current.repairs[llReplyPick]?.correct ? '✓' : '!'}</div>
                              <h4 className="font-semibold text-base md:text-lg">{current.repairs[llReplyPick]?.correct ? 'Why this is best' : 'What could go wrong'}</h4>
                            </div>
                            <p className="text-sm md:text-base leading-relaxed">{current.repairs[llReplyPick]?.feedback}</p>
                            <ul className="mt-3 text-sm md:text-base list-disc pl-5 space-y-1 opacity-90">
                              <li>{current.repairs[llReplyPick]?.correct ? 'Shows empathy and invites them to share.' : 'Minimizes or dismisses their experience.'}</li>
                              <li>{current.repairs[llReplyPick]?.correct ? 'Helps them feel safe opening up.' : 'Can make them shut down or feel blamed.'}</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-blue-100 mt-2">
                      <span className="text-xs md:text-sm text-blue-500">Scenario {listeningLabStep + 1} of {scenariosToUse.length}</span>
                      <div className="flex gap-2">
                        {listeningLabStep > 0 && (
                          <button
                            onClick={() => {
                              setListeningLabStep(listeningLabStep - 1);
                              setListeningLabChoice(null);
                              setLlProblemPick(null);
                              setLlActionPick(null);
                              setLlReplyPick(null);
                            }}
                            className="px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 text-xs md:text-sm"
                          >
                            Previous
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Require both answers selected
                            if (llProblemPick === null || llReplyPick === null) return;

                            if (listeningLabStep < scenariosToUse.length - 1) {
                              setListeningLabStep(listeningLabStep + 1);
                              setListeningLabChoice(null);
                              setLlProblemPick(null);
                              setLlActionPick(null);
                              setLlReplyPick(null);
                            } else {
                              setActiveModal(null);
                              setListeningLabStep(0);
                              setListeningLabChoice(null);
                              setLlProblemPick(null);
                              setLlActionPick(null);
                              setLlReplyPick(null);
                            }
                          }}
                          className={`px-4 py-1.5 rounded-full text-white text-xs md:text-sm ${(llProblemPick === null || llReplyPick === null)
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                          {listeningLabStep < scenariosToUse.length - 1 ? 'Next scenario' : 'Finish'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* I Statements Flip Cards Modal */}
      <AnimatePresence>
        {activeModal === 'iStatementsGame' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl p-5 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ×
              </button>
              <h3 className="text-xl md:text-2xl font-bold text-red-700 mb-2 text-center">Turn "You" Into "I"</h3>
              <p className="text-red-600 text-xs md:text-sm mb-4 text-center">
                Tap a red card to flip a blaming sentence into a calmer "I" statement.
              </p>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {iCardsPrepared.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIFlipStates(prev => {
                        const next = [...prev];
                        next[idx] = !next[idx];
                        return next;
                      });
                    }}
                    className={`relative rounded-2xl p-3 text-left min-h-[100px] shadow-lg transition-transform border text-xs md:text-sm ${iFlipStates[idx]
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-600 border-red-700 text-white'
                      }`}
                  >
                    <div className="font-semibold mb-2 text-xs uppercase tracking-wide opacity-80">
                      {iFlipStates[idx] ? 'I statement' : 'You statement'}
                    </div>
                    <p>{iFlipStates[idx] ? card.i : card.you}</p>
                    <span className="absolute bottom-3 right-4 text-[10px] opacity-80">
                      {iFlipStates[idx] ? 'Tap to see the old sentence' : 'Tap to flip into "I"'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-sm text-red-700 text-center">
                Good "I" statements start with <span className="font-semibold">I</span>, name your feeling, and describe what happened.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Choices Lab Modal */}
      <AnimatePresence>
        {activeModal === 'conflictLab' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl p-5 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ×
              </button>
              <h3 className="text-xl md:text-2xl font-bold text-indigo-800 mb-2 text-center">Conflict Choices Lab</h3>
              <p className="text-indigo-700 text-xs md:text-sm mb-4 text-center">
                Explore a friendship conflict step by step and pick calmer choices.
              </p>

              {(() => {
                const questions = conflictPrepared;
                if (!questions || questions.length === 0) {
                  return null;
                }
                const item = questions[conflictStep] ?? questions[0];
                const bestIndex = Math.max(0, item.options.findIndex(o => o.correct));

                return (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 max-w-xl">
                        <img src="/Resource Images/5. peer  support &sharing/other.png" alt="Scenario" className="h-10 w-10 rounded-full object-cover" />
                        <div className="relative">
                          <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-indigo-900/90 text-base md:text-lg">
                            {item.question}
                          </div>
                          <div className="absolute -left-1 top-3 h-3 w-3 bg-white border-l border-t border-indigo-100 rotate-45"></div>
                          <div className="text-xs text-indigo-500 mt-1 font-medium">Scenario</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-indigo-900 font-semibold mb-2">
                        Choice {conflictStep + 1} — Pick one option
                      </p>
                      <div className="space-y-3">
                        {item.options.map((opt, idx) => (
                          <button
                            key={idx}
                            disabled={conflictChoice !== null}
                            onClick={() => setConflictChoice(idx)}
                            className={`w-full text-left p-2 md:p-3 rounded-xl border text-xs md:text-sm transition-all hover:bg-indigo-50 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed ${conflictChoice === idx
                              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
                              : 'border-indigo-200'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${conflictChoice === idx ? (idx === bestIndex ? 'bg-green-500' : 'bg-amber-500') : 'bg-indigo-200'}`}></div>
                              <span>{opt.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      {conflictChoice !== null && (
                        <div className={`mt-3 rounded-xl p-4 md:p-5 border ${conflictChoice === bestIndex ? 'bg-green-50 text-green-900 border-green-200' : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${conflictChoice === bestIndex ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{conflictChoice === bestIndex ? '✓' : '!'}</div>
                            <h4 className="font-semibold text-base md:text-lg">{conflictChoice === bestIndex ? 'Why this works' : 'What could go wrong'}</h4>
                          </div>
                          <p className="text-sm md:text-base leading-relaxed">{conflictChoice === bestIndex
                            ? 'This choice is calm, fair, and keeps both the friendship and the goal in mind.'
                            : 'This choice may increase tension or avoid the problem. A calmer, fair step helps the friendship.'}
                          </p>
                          <ul className="mt-3 text-sm md:text-base list-disc pl-5 space-y-1 opacity-90">
                            <li>{conflictChoice === bestIndex ? 'Shows respect and invites collaboration.' : 'Can make the other person defensive or shut down.'}</li>
                            <li>{conflictChoice === bestIndex ? 'Keeps the talk solution-focused.' : 'Moves away from solutions or escalates conflict.'}</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-indigo-100 mt-2">
                      <span className="text-xs md:text-sm text-indigo-500">Choice {conflictStep + 1} of {questions.length}</span>
                      <div className="flex gap-2">
                        {conflictStep > 0 && (
                          <button
                            onClick={() => {
                              setConflictStep(conflictStep - 1);
                              setConflictChoice(null);
                            }}
                            className="px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 text-xs md:text-sm"
                          >
                            Previous
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (conflictChoice === null) return;
                            if (conflictStep < questions.length - 1) {
                              setConflictStep(conflictStep + 1);
                              setConflictChoice(null);
                            } else {
                              setActiveModal(null);
                            }
                          }}
                          className={`px-4 py-1.5 rounded-full text-white text-xs md:text-sm ${conflictChoice === null ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'
                            }`}
                        >
                          {conflictStep < questions.length - 1 ? 'Next choice' : 'Finish'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design Your Support Circle Modal */}
      <AnimatePresence>
        {activeModal === 'supportCircleGame' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ×
              </button>
              <h3 className="text-xl md:text-2xl font-bold text-emerald-800 mb-2 text-center">Design Your Support Circle</h3>
              <p className="text-emerald-700 text-xs md:text-sm mb-4 text-center">
                Drag yourself and friends into roles that match their strengths.
              </p>
              {circleBanner && (
                <div className="text-center text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-3 mb-2 font-semibold">{circleBanner}</div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-emerald-800 mb-1">Roles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3 items-end">
                    <div className="md:col-span-4">
                      <input
                        value={newRoleLabel}
                        onChange={(e) => setNewRoleLabel(e.target.value)}
                        placeholder="Add a role (e.g., Note Taker)"
                        className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <input
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                        placeholder="Short description"
                        className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={() => {
                          if (!newRoleLabel.trim()) return;
                          const id = newRoleLabel.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
                          setRoles((prev) => [...prev, { id, label: newRoleLabel.trim(), desc: newRoleDesc.trim() || 'Custom role' }]);
                          setNewRoleLabel('');
                          setNewRoleDesc('');
                        }}
                        className="w-full h-8 px-2 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const friendId = e.dataTransfer.getData('friendId');
                        if (!friendId) return;
                        setRoleAssignments((prev) => ({ ...prev, [role.id]: friendId }));
                      }}
                      className="border border-emerald-200 rounded-xl p-2 bg-white shadow-sm cursor-move flex items-start justify-between gap-2"
                    >
                      {editingRoleId === role.id ? (
                        <div className="space-y-2">
                          <input
                            value={editRoleLabel}
                            onChange={(e) => setEditRoleLabel(e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            placeholder="Role label"
                          />
                          <input
                            value={editRoleDesc}
                            onChange={(e) => setEditRoleDesc(e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            placeholder="Role description"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setRoles(prev => prev.map(r => r.id === role.id ? { ...r, label: editRoleLabel.trim() || r.label, desc: editRoleDesc.trim() } : r));
                                setEditingRoleId(null);
                                setEditRoleLabel('');
                                setEditRoleDesc('');
                              }}
                              className="px-3 py-1.5 text-xs rounded-full bg-emerald-600 text-white"
                            >Save</button>
                            <button
                              onClick={() => { setEditingRoleId(null); setEditRoleLabel(''); setEditRoleDesc(''); }}
                              className="px-3 py-1.5 text-xs rounded-full border border-emerald-300 text-emerald-700"
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="font-semibold text-emerald-900">{role.label}</div>
                            <p className="text-xs text-emerald-700 mt-1">{role.desc}</p>
                          </div>
                          <div className="mt-2 text-xs text-emerald-900 flex items-center justify-between gap-2">
                            <span className="truncate">
                              {roleAssignments[role.id]
                                ? `Assigned: ${supportFriends.find(f => f.id === roleAssignments[role.id])?.name || ''}`
                                : 'Drop a friend card here'}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  // Clear assignment for this role
                                  setRoleAssignments((prev) => ({ ...prev, [role.id]: null }));
                                }}
                                className="px-2 py-1 border border-emerald-300 rounded-full text-[10px] text-emerald-700 hover:bg-emerald-100"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRoleId(role.id);
                                  setEditRoleLabel(role.label);
                                  setEditRoleDesc(role.desc);
                                }}
                                className="px-2 py-1 border border-emerald-300 rounded-full text-[10px] text-emerald-700 hover:bg-emerald-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // Delete role and clear its assignment key
                                  setRoles(prev => prev.filter(r => r.id !== role.id));
                                  setRoleAssignments(prev => {
                                    const next: Record<string, string | null> = { ...prev };
                                    delete next[role.id as keyof typeof next];
                                    return next;
                                  });
                                }}
                                className="px-2 py-1 border border-red-300 rounded-full text-[10px] text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-emerald-800 mb-1">Friends</h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 items-end">
                    <div className="md:col-span-4">
                      <input
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                        placeholder="Friend name"
                        className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <input
                        value={newFriendStrengths}
                        onChange={(e) => setNewFriendStrengths(e.target.value)}
                        placeholder="Strengths (comma separated)"
                        className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={() => {
                          const name = newFriendName.trim();
                          if (!name) return;
                          const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
                          const strengths = newFriendStrengths.split(',').map(s => s.trim()).filter(Boolean);
                          setSupportFriends(prev => [...prev, { id, name, strengths }]);
                          setNewFriendName('');
                          setNewFriendStrengths('');
                        }}
                        className="w-full h-8 px-2 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 mb-2">Drag each card onto a role. Start by adding your close friends.</p>
                  <div className="space-y-3">
                    {supportFriends.map((friend) => (
                      <div
                        key={friend.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('friendId', friend.id);
                        }}
                        className="border border-emerald-200 rounded-xl p-2 bg-white shadow-sm cursor-move flex items-start justify-between gap-2"
                      >
                        {editingFriendId === friend.id ? (
                          <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                              <div className="md:col-span-4">
                                <input
                                  value={editFriendName}
                                  onChange={(e) => setEditFriendName(e.target.value)}
                                  className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                  placeholder="Name"
                                />
                              </div>
                              <div className="md:col-span-6">
                                <input
                                  value={editFriendStrengths}
                                  onChange={(e) => setEditFriendStrengths(e.target.value)}
                                  className="w-full h-8 px-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                  placeholder="Strengths (comma separated)"
                                />
                              </div>
                              <div className="md:col-span-2 flex gap-2">
                                <button
                                  onClick={() => {
                                    setSupportFriends(prev => prev.map(f => f.id === friend.id ? {
                                      ...f,
                                      name: editFriendName.trim() || f.name,
                                      strengths: editFriendStrengths.split(',').map(s => s.trim()).filter(Boolean)
                                    } : f));
                                    setEditingFriendId(null);
                                    setEditFriendName('');
                                    setEditFriendStrengths('');
                                  }}
                                  className="w-full h-8 px-2 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                                >Save</button>
                                <button
                                  onClick={() => { setEditingFriendId(null); setEditFriendName(''); setEditFriendStrengths(''); }}
                                  className="w-full h-8 px-2 text-xs rounded-lg border border-emerald-300 text-emerald-700"
                                >Cancel</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="font-semibold text-emerald-900">{friend.name}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {friend.strengths.map((s) => (
                                  <span
                                    key={s}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-100"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {friend.id === 'you' && (
                                <span className="text-[10px] text-emerald-600 font-semibold">You</span>
                              )}
                              {friend.id !== 'you' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingFriendId(friend.id);
                                      setEditFriendName(friend.name);
                                      setEditFriendStrengths(friend.strengths.join(', '));
                                    }}
                                    className="text-[10px] px-2 py-1 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSupportFriends(prev => prev.filter(f => f.id !== friend.id));
                                      // remove this friend from any assigned roles
                                      setRoleAssignments(prev => {
                                        const next = { ...prev } as Record<string, string | null>;
                                        Object.keys(next).forEach(k => { if (next[k] === friend.id) next[k] = null; });
                                        return next;
                                      });
                                    }}
                                    className="text-[10px] px-2 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-xs md:text-sm text-emerald-700 text-center">
                You can change your plan anytime. The most important thing is choosing people who are kind, respectful, and safe.
              </div>

              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={saveCircle}
                    disabled={circleLoading || !userId}
                    className={`px-4 py-2 rounded-full text-white text-sm ${circleLoading || !userId ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >{circleLoading ? 'Saving...' : 'Save Circle'}</button>
                </div>
                {savedCircles.length > 0 && (
                  <div className="mt-2">
                    <div className="text-center font-semibold text-emerald-800 mb-1 text-sm">Saved Circles</div>
                    <div className="grid gap-2">
                      {savedCircles.slice(0, 5).map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between border border-emerald-200 rounded-lg px-3 py-2 bg-emerald-50">
                          <div className="text-emerald-900 text-xs font-medium">{c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleString() : (c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleString() : 'Saved circle')}</div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-full text-xs bg-emerald-600 text-white" onClick={() => loadCircle(c.id)}>Load</button>
                            <button className="px-3 py-1 rounded-full text-xs border border-red-300 text-red-700" onClick={() => removeCircle(c.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Group Rules Game Modal */}
      <AnimatePresence>
        {activeModal === 'safeRulesGame' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ×
              </button>
              <h3 className="text-2xl md:text-3xl font-bold text-purple-800 mb-1 text-center">Peer Support Compass</h3>
              <p className="text-purple-700 text-xs md:text-sm mb-4 text-center">
                Learn the rules, test decisions, and practice the right actions.
              </p>

              {/* Sticky tab header */}
              <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-2 bg-white/90 backdrop-blur border-b border-purple-100">
                <div className="flex items-center justify-center flex-wrap gap-2">
                  {([
                    { k: 'learn', label: 'Learn' },
                    { k: 'decide', label: 'Decide' },
                    { k: 'practice', label: 'Practice' },
                  ] as const).map((t) => (
                    <button
                      key={t.k}
                      onClick={() => setSafeTab(t.k)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors shadow-sm ${safeTab === t.k ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'}`}
                    >
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learn: micro-cards */}
              {safeTab === 'learn' && (
                <div className="grid gap-3 mt-4">
                  {[
                    { title: 'Confidentiality', what: 'Keep private things private.', why: 'Trust grows when stories stay in the circle.', how: 'Ask before sharing. Never post screenshots.', ex: '“Can I share this with the counselor to help?”', counter: '“I told my class about your panic attack.”' },
                    { title: 'Non-judgment', what: 'No mocking, shaming, or eye-rolling.', why: 'People open up when they feel safe.', how: 'Reflect feelings. Avoid advice right away.', ex: '“That sounds heavy. I’m here.”', counter: '“You’re overreacting.”' },
                    { title: 'Consent', what: 'Ask before giving advice or hugs.', why: 'Everyone controls their own story and body.', how: 'Use clear questions and wait for yes.', ex: '“Want ideas or just to vent?”', counter: '“Here’s what you must do.”' },
                    { title: 'Respect', what: 'Listen, no interruptions or gossip.', why: 'Respect creates belonging.', how: 'One mic at a time; use kind words.', ex: '“Let’s let them finish.”', counter: '“Whatever, this is boring.”' },
                    { title: 'Safety', what: 'Get help if someone is at risk.', why: 'Lives matter more than secrecy.', how: 'Tell a trusted adult; explain why.', ex: '“I’m worried for you, let’s talk to Ms. Asha.”', counter: '“Don’t tell anyone.”' },
                  ].map((r) => (
                    <div key={r.title} className="border border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white text-purple-900 text-left shadow-sm">
                      <div className="font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded bg-purple-400" />
                        {r.title}
                      </div>
                      <div className="text-sm mt-2"><span className="font-semibold text-purple-800">What:</span> {r.what}</div>
                      <div className="text-sm"><span className="font-semibold text-purple-800">Why:</span> {r.why}</div>
                      <div className="text-sm"><span className="font-semibold text-purple-800">How:</span> {r.how}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Decide: scenarios */}
              {safeTab === 'decide' && (
                <div className="space-y-3 mt-4">
                  {/* Progress bar */}
                  <div className="mb-1">
                    {(() => {
                      const total = safePrepared.length;
                      const answered = Object.keys(safeChoices).length;
                      const pct = total ? Math.round((answered / total) * 100) : 0;
                      return (
                        <div>
                          <div className="flex justify-between text-[11px] text-purple-700 mb-1">
                            <span>Decisions answered</span>
                            <span>{answered}/{total}</span>
                          </div>
                          <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: pct + '%' }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {safePrepared.map((s, idx) => (
                    <div key={idx} className="border border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                      <p className="text-sm md:text-base text-purple-900 mb-3">{s.text}</p>
                      <div className="flex flex-wrap gap-2">
                        {(['safe', 'unsafe', 'escalate'] as const).map(opt => (
                          <button
                            key={opt}
                            onClick={() => setSafeChoices(prev => ({ ...prev, [idx]: opt }))}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors ${safeChoices[idx] === opt ?
                              (opt === 'safe' ? 'bg-green-500 border-green-600 text-white' : opt === 'unsafe' ? 'bg-red-500 border-red-600 text-white' : 'bg-amber-500 border-amber-600 text-white') :
                              (opt === 'safe' ? 'bg-white border-green-300 text-green-700 hover:bg-green-50' : opt === 'unsafe' ? 'bg-white border-red-300 text-red-700 hover:bg-red-50' : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50')
                              }`}
                          >{opt === 'escalate' ? 'Tell a trusted adult' : opt === 'safe' ? 'Safe' : 'Not Safe'}</button>
                        ))}
                      </div>
                      {safeChoices[idx] && (
                        <div className={`mt-3 rounded-lg p-3 text-sm ${safeChoices[idx] === s.correct ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                          <div className="font-semibold mb-1">{safeChoices[idx] === s.correct ? 'Correct' : 'Here’s why'}</div>
                          <div>{s.explanation}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Practice: action pickers */}
              {safeTab === 'practice' && (
                <div className="space-y-3 mt-4">
                  {/* Progress */}
                  <div className="mb-1">
                    {(() => {
                      const total = actionPrepared.length;
                      const answered = Object.values(actionPicks).filter(v => v !== null && v !== undefined).length;
                      const pct = total ? Math.round((answered / total) * 100) : 0;
                      return (
                        <div>
                          <div className="flex justify-between text-[11px] text-purple-700 mb-1">
                            <span>Actions completed</span>
                            <span>{answered}/{total}</span>
                          </div>
                          <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: pct + '%' }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {actionPrepared.map((a, ai) => (
                    <div key={ai} className="border border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                      <p className="text-sm md:text-base text-purple-900 mb-3">{a.scenario}</p>
                      <div className="grid gap-2">
                        {a.options.map((o, oi) => {
                          const picked = actionPicks[ai] ?? null;
                          const isPicked = picked === oi;
                          const isCorrect = o.correct;
                          const locked = picked !== null;
                          return (
                            <button
                              key={oi}
                              onClick={() => setActionPicks(prev => ({ ...prev, [ai]: oi }))}
                              disabled={locked}
                              className={`text-left px-3 py-2 rounded-xl border shadow-sm transition-colors ${!locked ? 'hover:bg-white' : isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}
                            >
                              <span className="font-medium inline-flex items-center gap-2">{o.text}</span>
                              {isPicked && (<div className="text-xs mt-1">{o.why}</div>)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agreement removed as requested */}

              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => {
                    const order = ['learn', 'decide', 'practice'] as const;
                    const idx = order.indexOf(safeTab);
                    if (idx > 0) setSafeTab(order[idx - 1]);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs md:text-sm border border-purple-300 text-purple-700 hover:bg-purple-50"
                >Back</button>
                <button
                  onClick={() => {
                    const order = ['learn', 'decide', 'practice'] as const;
                    const idx = order.indexOf(safeTab);
                    if (safeTab === 'decide' && Object.keys(safeChoices).length < safePrepared.length) return;
                    if (idx < order.length - 1) setSafeTab(order[idx + 1]); else setActiveModal(null);
                  }}
                  disabled={safeTab === 'decide' && Object.keys(safeChoices).length < safePrepared.length}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm text-white shadow ${safeTab === 'decide' && Object.keys(safeChoices).length < safePrepared.length
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >{safeTab === 'practice' ? 'Done' : 'Next'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 1 - Need Someone to Talk To? */}
      <section className="min-h-screen flex items-center justify-center relative">
        {/* Home Image */}
        <img
          src="/Resource Images/5. peer  support &sharing/12.webp"
          alt="Peer Support"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] md:w-[500px] lg:w-[600px] h-auto object-contain opacity-100 pointer-events-none"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))'
          }}
        />
        <div className="text-center px-8 max-w-4xl mr-auto" style={{ transform: 'translateX(4%)' }}>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-blue-800 mb-4"
          >
            Need Someone to Talk To?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xl md:text-2xl text-blue-700 mb-4"
          >
            Ever felt like no one gets what you're going through?
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-lg text-blue-600 mb-12"
          >
            You're not alone. Real connection can help lighten the weight.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg transition-colors"
          >
            Help Me Connect
          </motion.button>
        </div>
      </section>

      {/* Section 2 - Why Peer Support Matters */}
      <section className="py-8 flex items-center justify-center relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            {/* Image on left - only shows on medium screens and up */}
            <img
              src="/Resource Images/5. peer  support &sharing/friends.png"
              alt="Friends supporting each other"
              className="w-full md:w-1/2 lg:w-2/5 h-auto rounded-2xl"
            />

            {/* Text content on right */}
            <div className="w-full md:w-1/2 lg:w-3/5 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6 text-center">
                Why Friends Make a Difference
              </h2>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-lg md:text-xl text-blue-700 mb-6"
              >
                Strong friendships and peer support make you feel understood, less alone, and more confident. When you connect with friends:
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid gap-4 md:grid-cols-2 mb-6"
              >
                <div className="bg-blue-100 border border-blue-200 rounded-2xl p-4 text-left text-blue-800 shadow-sm">
                  <p className="text-base md:text-lg font-medium">
                    You reduce stress by sharing worries, like exam pressure or family issues.
                  </p>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-2xl p-4 text-left text-blue-800 shadow-sm">
                  <p className="text-base md:text-lg font-medium">
                    You feel supported knowing someone listens and cares.
                  </p>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-2xl p-4 text-left text-blue-800 shadow-sm">
                  <p className="text-base md:text-lg font-medium">
                    You build resilience to handle tough times, like arguments or school challenges.
                  </p>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-2xl p-4 text-left text-blue-800 shadow-sm">
                  <p className="text-base md:text-lg font-medium">
                    You create joy by celebrating good moments together, like a festival or a good grade.
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-base md:text-lg text-blue-600 mb-8"
              >
                For example, talking to a friend about a tough day can make it feel lighter, and listening to them can strengthen your bond.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3 - Build Your Support Superpowers */}
      <section className="py-8 flex items-center justify-center relative">
        <div className="px-4 w-full max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-blue-800 mb-4"
          >
            Build Your Support Superpowers
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-lg md:text-xl text-blue-700 mb-8 max-w-3xl mx-auto"
          >
            Try these quick mini-games to practice listening, speaking kindly, solving conflicts, and creating a safe support circle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid gap-6 lg:grid-cols-3 justify-items-center"
          >
            {/* Card 1 - Active Listening Lab */}
            <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 flex flex-col shadow-lg min-h-[320px] w-full max-w-sm">
              <img
                src="/Resource Images/5. peer  support &sharing/listen.png"
                alt="Active Listening"
                className="w-full h-28 object-contain rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-blue-800 mb-2 text-center">Active Listening Lab</h3>
              <p className="text-sm text-blue-700 mb-4 text-center">
                Fix tricky replies so your friend feels truly heard and supported.
              </p>
              <button
                onClick={() => setActiveModal('listeningLab')}
                className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow"
              >
                Try now
              </button>
            </div>

            {/* Card 2 - Turn "You" Into "I" */}
            <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 flex flex-col shadow-lg min-h-[320px] w-full max-w-sm">
              <img
                src="/Resource Images/5. peer  support &sharing/youi.png"
                alt="Turn You into I"
                className="w-full h-28 object-contain rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-blue-800 mb-2 text-center">Turn "You" Into "I"</h3>
              <p className="text-sm text-blue-700 mb-4 text-center">
                Tap red cards to flip blaming sentences into calm "I" statements.
              </p>
              <button
                onClick={() => setActiveModal('iStatementsGame')}
                className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow"
              >
                Try now
              </button>
            </div>

            {/* Card 3 - Conflict Choices Lab */}
            <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 flex flex-col shadow-lg min-h-[320px] w-full max-w-sm">
              <img
                src="/Resource Images/5. peer  support &sharing/conflict.png"
                alt="Conflict Resolution"
                className="w-full h-28 object-contain rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-blue-800 mb-2 text-center">Conflict Choices Lab</h3>
              <p className="text-sm text-blue-700 mb-4 text-center">
                Walk through tougher friendship conflicts and choose calmer paths.
              </p>
              <button
                onClick={() => setActiveModal('conflictLab')}
                className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow"
              >
                Try now
              </button>
            </div>

            {/* Row 2: Centered Card 4 and Card 5 */}
            <div className="lg:col-span-3 flex flex-col md:flex-row justify-center gap-6 w-full">
              {/* Card 4 - Design Your Support Circle */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 flex flex-col shadow-lg min-h-[320px] w-full max-w-sm">
                <img
                  src="/Resource Images/5. peer  support &sharing/friendcircle.png"
                  alt="Support Circle"
                  className="w-full h-28 object-contain rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold text-blue-800 mb-2 text-center">Design Your Support Circle</h3>
                <p className="text-sm text-blue-700 mb-4 text-center">
                  Drag yourself and friends into roles like Listener, Encourager, or Organizer.
                </p>
                <button
                  onClick={() => setActiveModal('supportCircleGame')}
                  className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow"
                >
                  Try now
                </button>
              </div>

              {/* Card 5 - Safe Group Rules Check */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 flex flex-col shadow-lg min-h-[320px] w-full max-w-sm">
                <img
                  src="/Resource Images/5. peer  support &sharing/compass.png"
                  alt="Group Rules"
                  className="w-full h-28 object-contain rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold text-blue-800 mb-2 text-center">Safe Group Rules Check</h3>
                <p className="text-sm text-blue-700 mb-4 text-center">
                  Sort behaviours into "Safe" and "Not safe" to keep your group kind and private.
                </p>
                <button
                  onClick={() => setActiveModal('safeRulesGame')}
                  className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow"
                >
                  Try now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4 - Express Yourself Clearly */}
      <section className="py-8 flex items-center justify-center relative">
        <div className="px-8 max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-blue-800 mb-6 text-center"
          >
            Safety & Accessibility
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Confidentiality Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-orange-600 text-3xl mb-4"></div>
              <h3 className="text-xl font-bold text-orange-800 mb-3">Confidentiality</h3>
              <p className="text-gray-700">Never share a friend's private story outside the group, even with other friends.</p>
            </motion.div>

            {/* Respect & Kindness Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-orange-600 text-3xl mb-4"></div>
              <h3 className="text-xl font-bold text-orange-800 mb-3">Respect & Kindness</h3>
              <p className="text-gray-700">Include everyone, no matter their background, and avoid judging.</p>
            </motion.div>

            {/* Know Your Limits Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-orange-600 text-3xl mb-4"></div>
              <h3 className="text-xl font-bold text-orange-800 mb-3">Know Your Limits</h3>
              <p className="text-gray-700">Don't try to "fix" serious problems. Guide them to a trusted adult, like a teacher or counselor.</p>
            </motion.div>

            {/* Cultural Sensitivity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-orange-600 text-3xl mb-4"></div>
              <h3 className="text-xl font-bold text-orange-800 mb-3">Cultural Sensitivity</h3>
              <p className="text-gray-700">We celebrate all cultures and traditions, from Diwali to Eid, making our group welcoming for everyone.</p>
            </motion.div>

            {/* Accessibility Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-orange-600 text-3xl mb-4"></div>
              <h3 className="text-xl font-bold text-orange-800 mb-3">Accessibility</h3>
              <p className="text-gray-700">No fancy tools needed—just a notebook or a trusted friend to get started with peer support.</p>
            </motion.div>

            {/* Supportive Tone Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-orange-600 text-3xl mb-4"></div>
              <h3 className="text-xl font-bold text-orange-800 mb-3">Supportive Tone</h3>
              <p className="text-gray-700">It's okay to have tough days. We're here to help each other through them, no need to be perfect.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="help-section-wrapper">
        <div className="section-content max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4 text-center">When to Ask for Help</h2>
          <div className="help-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <img
              src="/Resource Images/1. Stress management images/buddycall.png"
              alt="Call for help"
              className="w-56 h-auto object-contain"
            />
            <div className="help-cards space-y-4">
              <div className="help-card bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Childline India</h3>
                <p className="text-gray-700 mb-3">24/7 helpline for children and teenagers</p>
                <a href="tel:1098" className="help-phone bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
                  Call: 1098
                </a>
              </div>
              <div className="help-card bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-2">NIMHANS</h3>
                <p className="text-gray-700 mb-3">National Institute of Mental Health and Neurosciences</p>
                <a href="tel:08046110007" className="help-phone bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
                  Call: 080-46110007
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .help-section-wrapper {
          background: transparent;
          color: inherit;
          margin-top: 1rem;   /* add small gap before (outside) */
          margin-bottom: 0; /* remove extra space after */
          padding: 2rem 1rem;
        }
        
        @media (min-width: 768px) {
          .help-section-wrapper {
            padding: 3rem 2rem;
          }
        }
      `}</style>




      {/* Active Listening Modal */}
      <AnimatePresence>
        {activeModal === 'listening' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-blue-800 mb-6 text-center">
                🎧 Active Listening Practice
              </h3>

              {listeningStep === 0 && (
                <div className="space-y-6">
                  <div className="bg-blue-100 p-6 rounded-xl">
                    <p className="text-lg text-blue-800 mb-4">
                      <strong>Your friend says:</strong> "I'm really nervous about exams."
                    </p>
                    <p className="text-blue-600">How would you respond?</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleActiveListening('bad')}
                      className="w-full p-4 bg-red-100 hover:bg-red-200 rounded-xl text-left transition-colors"
                    >
                      ❌ "You'll be fine, don't stress."
                    </button>
                    <button
                      onClick={() => handleActiveListening('good')}
                      className="w-full p-4 bg-green-100 hover:bg-green-200 rounded-xl text-left transition-colors"
                    >
                      ✅ "I understand, exams can be tough. Want to study together?"
                    </button>
                  </div>

                  {selectedResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-100 p-4 rounded-xl"
                    >
                      <p className="text-green-800">
                        {selectedResponse === 'good'
                          ? "Great choice! Listening with empathy helps your friend feel heard."
                          : "That response might make your friend feel dismissed. Let's try the empathetic response!"
                        }
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {listeningStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-100 p-6 rounded-xl">
                    <p className="text-lg text-blue-800 mb-4">
                      <strong>Your friend says:</strong> "Thanks for listening. How did that make you feel?"
                    </p>
                    <p className="text-blue-600">What's your response?</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleActiveListening('bad')}
                      className="w-full p-4 bg-red-100 hover:bg-red-200 rounded-xl text-left transition-colors"
                    >
                      ❌ "I don't know, I was just trying to help."
                    </button>
                    <button
                      onClick={() => handleActiveListening('good')}
                      className="w-full p-4 bg-green-100 hover:bg-green-200 rounded-xl text-left transition-colors"
                    >
                      ✅ "I feel good knowing I could support you. It's important to me that you feel heard."
                    </button>
                  </div>

                  {selectedResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-100 p-4 rounded-xl"
                    >
                      <p className="text-green-800">
                        Perfect! Showing curiosity and reflection demonstrates genuine care.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-lg font-semibold text-blue-800 mb-4">
                  You just practiced Active Listening! Keep it up.
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold"
                >
                  Continue Journey
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peer Group Modal */}
      <AnimatePresence>
        {activeModal === 'peergroup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-green-800 mb-6 text-center">
                🤝 Build My Peer Group
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Talk to a teacher or counselor first",
                    "Invite kind, respectful friends",
                    "Set group rules (No judgment, Keep things private)",
                    "Assign roles (Listener, Encourager, Organizer, Boundary Keeper)"
                  ].map((item, index) => (
                    <motion.label
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <input
                        type="checkbox"
                        checked={peerGroupChecks[index]}
                        onChange={() => handlePeerGroupCheck(index)}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <span className="text-green-800">{item}</span>
                    </motion.label>
                  ))}
                </div>

                {/* Avatar circle */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative w-32 h-32"
                    animate={{
                      boxShadow: peerGroupChecks.every(check => check)
                        ? "0 0 30px rgba(34, 197, 94, 0.6)"
                        : "0 0 10px rgba(34, 197, 94, 0.3)"
                    }}
                  >
                    <div className="w-32 h-32 border-4 border-green-300 rounded-full flex items-center justify-center text-4xl bg-green-100">
                      👥
                    </div>
                  </motion.div>
                </div>

                {peerGroupChecks.every(check => check) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-100 p-4 rounded-xl text-center"
                  >
                    <p className="text-green-800 font-semibold">
                      You just built a safe space for open conversations!
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold"
                >
                  Complete Building
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buddy Challenge Modal */}
      <AnimatePresence>
        {activeModal === 'buddy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-indigo-800 mb-8 text-center">
                📱 Buddy Challenge
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Weekly Check-In Challenge */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h4 className="text-xl font-bold text-blue-800 mb-4">
                    1️⃣ Weekly Check-In Challenge
                  </h4>
                  <p className="text-blue-700 mb-4">
                    Text or call a friend once a day for 5 days.
                  </p>

                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(day => (
                      <div
                        key={day}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => {
                          if (challenges.dailyCheckIn >= day) return;
                          completeChallenge('dailyCheckIn');
                        }}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 ${challenges.dailyCheckIn >= day
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-blue-300'
                          }`}>
                          {challenges.dailyCheckIn >= day && '✓'}
                        </div>
                        <span className="text-blue-800">Day {day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(challenges.dailyCheckIn / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      {challenges.dailyCheckIn}/5 days completed
                    </p>
                  </div>
                </div>

                {/* Reflection Journal Challenge */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h4 className="text-xl font-bold text-purple-800 mb-4">
                    2️⃣ Reflection Journal Challenge
                  </h4>
                  <p className="text-purple-700 mb-4">
                    Write 1-2 lines daily: "How did you support or get supported today?"
                  </p>

                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <div
                        key={day}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                        onClick={() => {
                          if (challenges.reflectionJournal >= day) return;
                          completeChallenge('reflectionJournal');
                        }}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 ${challenges.reflectionJournal >= day
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-purple-300'
                          }`}>
                          {challenges.reflectionJournal >= day && '✓'}
                        </div>
                        <span className="text-purple-800">Day {day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(challenges.reflectionJournal / 7) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-purple-600 mt-2">
                      {challenges.reflectionJournal}/7 days completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-lg text-indigo-600 mb-4">
                  Complete challenges to earn your badges!
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold"
                >
                  Start Challenges
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeerSupportExperience;