import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Heart, Users, MessageCircle, Shield, TrendingUp, CheckCircle, Target, Clock, Phone, User, Briefcase, BookOpen, Brain, Lightbulb, Star, Award, ArrowRight, HelpCircle, X, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Google Fonts
const fontLink = () => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

// Types
interface Achievement {
  id: string;
  title: string;
  earned: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  scenario: string;
  solution: string;
}

// Main App Component
const WhenToAskForHelp = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'brave-step', title: 'Brave Step Badge', earned: false },
    { id: 'first-reach', title: 'First Reach Out', earned: false },
    { id: 'problem-solver', title: 'Problem Solver', earned: false },
    { id: 'connection-builder', title: 'Connection Builder', earned: false }
  ]);

  const [currentToolStep, setCurrentToolStep] = useState(0);

  // Load achievements from localStorage on mount
  useEffect(() => {
    fontLink();
    const saved = localStorage.getItem('help-seeking-achievements');
    if (saved) {
      setAchievements(JSON.parse(saved));
    }
  }, []);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement =>
        achievement.id === id
          ? { ...achievement, earned: true }
          : achievement
      );
      localStorage.setItem('help-seeking-achievements', JSON.stringify(updated));
      return updated;
    });
  };



  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">


      {/* Hero Section */}
      <section id="hero" className="min-h-screen">
        <HeroSection />
      </section>

      {/* Why It Matters Section */}
      <section id="why-it-matters" className="py-8 scroll-mt-20">
        <WhyItMattersSection />
      </section>

      {/* Warning Signs Section */}
      <section id="warning-signs" className="py-8">
        <WarningSignsSection />
      </section>

      {/* How to Ask Section */}
      <section id="how-to-ask" className="py-8">
        <HowToAskSection />
      </section>

      {/* Get Help Now Section */}
      <section id="get-help-now" className="py-8">
        <GetHelpNowSection />
      </section>

    </div>
  );
};



// Hero Section Component
const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Back to Resources Button */}
      <motion.a
        href="/resources"
        onClick={(e) => { e.preventDefault(); navigate('/resources'); }}
        className="fixed top-20 left-8 flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors group z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Resources</span>
      </motion.a>

      {/* Simple Background */}
      <div className="absolute inset-0 bg-gray-50"></div>

      {/* Hero Image */}
      <motion.div
        className="absolute right-0 top-10 -translate-y-1/2 z-0 hidden lg:block pr-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="/Resource Images/10. ask for help/12.webp"
          alt="Ask for Help"
          className="w-[550px] h-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl ml-4 md:ml-20 mr-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Hero Icon */}


          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="text-teal-600">Do You Know</span>
            <br />
            <span className="text-violet-600">When to Ask for Help?</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Asking for help is a sign of strength, not weakness. Learn how to recognize when you need support,
            who to reach out to, and how to start a conversation confidently.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => document.getElementById('why-it-matters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn When to Reach Out
          </motion.button>
        </motion.div>


      </div>
    </div>
  );
};

// Why It Matters Section Component
const WhyItMattersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      title: "Feel Less Alone",
      description: "Talking to someone lifts a huge weight",
      icon: Heart
    },
    {
      title: "Solve Problems Early",
      description: "Get help before worries grow",
      icon: Shield
    },
    {
      title: "Build Resilience",
      description: "Become more confident for the future",
      icon: TrendingUp
    },
    {
      title: "Stay Connected",
      description: "Strengthen bonds with others",
      icon: Users
    }
  ];

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-teal-600">Why It</span>{" "}
            <span className="text-violet-600">Matters</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 items-center">
          {/* Right Content - Visualization (Now Left) */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative overflow-hidden flex items-center justify-center max-w-sm mx-auto">
              <img
                src="/Resource Images/10. ask for help/matters.png"
                alt="Why asking for help matters"
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Left Content (Now Right) */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-transparent p-0">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Asking for help is a powerful skill that brings real benefits to your life —
                <span className="font-semibold text-teal-600"> it's not weakness</span>. It helps you:
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-teal-500">
                      {React.createElement(benefit.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Warning Signs Section Component
const WarningSignsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const emotionalSigns = [
    "Feeling overwhelmed or hopeless",
    "Significant changes in eating or sleeping patterns",
    "Loss of interest in activities you used to enjoy"
  ];

  const physicalSigns = [
    "Difficulty concentrating or making decisions",
    "Withdrawing from friends and family",
    "Physical symptoms like headaches or stomachaches with no medical cause"
  ];

  const commonSituations = [
    "Schoolwork or understanding concepts",
    "Dealing with stress or anxiety",
    "Problems with friends or relationships",
    "Family issues or conflicts at home",
    "Feeling sad, angry, or overwhelmed",
    "Making important decisions",
    "Health concerns (physical or mental)",
    "Financial difficulties"
  ];

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-1">
            <span className="text-amber-600">Signs You Might</span>{" "}
            <span className="text-teal-600">Need Help</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            It's okay to reach out when you notice these signs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Emotional Signs */}
          <motion.div
            className="bg-violet-50 rounded-3xl p-6 border border-violet-100"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">

              <h3 className="text-2xl font-bold text-gray-800">
                Emotional Signs
              </h3>
            </div>
            <ul className="space-y-2">
              {emotionalSigns.map((sign, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {sign}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Physical & Behavioral Signs */}
          <motion.div
            className="bg-teal-50 rounded-3xl p-6 border border-teal-100"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center mb-4">

              <h3 className="text-2xl font-bold text-gray-800">
                Physical & Behavioral Signs
              </h3>
            </div>
            <ul className="space-y-2">
              {physicalSigns.map((sign, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {sign}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Common Situations */}
        <motion.div
          className="bg-indigo-50 rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-indigo-100"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Common Situations Where Help is Valuable
          </h3>
          <p className="text-center text-gray-600 mb-6">It's okay to ask for support with...</p>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-4xl mx-auto">
            {commonSituations.map((situation, index) => (
              <motion.div
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700 text-lg">{situation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Remember Note */}
        <motion.div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-lg text-amber-800 font-medium">
            <span className="font-bold">Remember:</span> You don't need to wait until things feel "bad enough" to ask for help. Reaching out early can prevent problems from getting worse.
          </p>
        </motion.div>
      </div>
    </div>
  );
};



const WhenWhoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const situations = [
    {
      title: "When You're Struggling with Schoolwork",
      description: "If assignments feel overwhelming or you don't understand the material",
      who: ["Teacher", "Tutor", "Study Group", "Parent"]
    },
    {
      title: "When You Feel Anxious or Worried",
      description: "When stress or anxiety is affecting your daily life",
      who: ["School Counselor", "Parent", "Friend", "Healthcare Provider"]
    },
    {
      title: "When You Have Social Problems",
      description: "If you're dealing with conflicts or feeling isolated",
      who: ["Friend", "Parent", "Teacher", "School Counselor"]
    },
    {
      title: "When Making Big Decisions",
      description: "When you need guidance on important choices",
      who: ["Parent", "Mentor", "Teacher", "Trusted Adult"]
    }
  ];

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-teal-600">When &</span>{" "}
            <span className="text-violet-600">Who</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Knowing when to ask for help and who to reach out to are important skills
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {situations.map((situation, index) => (
            <motion.div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-teal-100"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <Clock className="w-6 h-6 text-teal-500 mr-3" />
                  When
                </h3>
                <p className="text-gray-700 font-semibold mb-2">{situation.title}</p>
                <p className="text-gray-600">{situation.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="w-6 h-6 text-violet-500 mr-3" />
                  Who to Ask
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {situation.who.map((person, personIndex) => (
                    <motion.div
                      key={personIndex}
                      className="bg-gradient-to-r from-teal-100 to-violet-100 rounded-lg p-3 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.1 + personIndex * 0.05 }}
                    >
                      <span className="text-gray-700 font-medium">{person}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Tips */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-teal-100 to-violet-100 rounded-3xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Key Tips for Asking
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-800 mb-2">Be Specific</h4>
              <p className="text-gray-600">Explain exactly what you need help with</p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-800 mb-2">Be Honest</h4>
              <p className="text-gray-600">Share your true feelings and concerns</p>
            </div>
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-800 mb-2">Be Open</h4>
              <p className="text-gray-600">Listen to suggestions and feedback</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// How to Ask Section Component
const HowToAskSection = () => {
  const ref = useRef(null);
  const timelineRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [practiceStep, setPracticeStep] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // All 30 scenarios
  const allScenarios = [
    {
      category: "Academic",
      speaker: "Math Teacher",
      question: "I've noticed you've been struggling with the algebra problems. How can I help you understand better?",
      options: [
        { text: "I don't get any of this.", correct: false },
        { text: "I'm having trouble with solving equations with variables on both sides. Could you explain that again?", correct: true },
        { text: "I'll just copy the answers from someone.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Science Teacher",
      question: "You seem confused about the lab assignment. What part is giving you trouble?",
      options: [
        { text: "I don't understand the hypothesis part. Can you explain what makes a good hypothesis?", correct: true },
        { text: "The whole thing is too hard.", correct: false },
        { text: "I'll figure it out later.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "English Teacher",
      question: "Your essay needs some work. Would you like to discuss it?",
      options: [
        { text: "I'm struggling with organizing my main arguments. Could we go over the structure?", correct: true },
        { text: "Whatever, I tried my best.", correct: false },
        { text: "Can I just rewrite it for extra credit?", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "School Counselor",
      question: "You've seemed down lately. Is everything okay?",
      options: [
        { text: "I'm fine.", correct: false },
        { text: "I've been feeling really anxious about exams and it's affecting my sleep. Can we talk about coping strategies?", correct: true },
        { text: "It's nothing important.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Parent",
      question: "You've been very quiet this week. What's on your mind?",
      options: [
        { text: "Nothing.", correct: false },
        { text: "I've been feeling overwhelmed with everything. Can we talk about it?", correct: true },
        { text: "Just leave me alone.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Friend",
      question: "I noticed you've been avoiding our group. Did something happen?",
      options: [
        { text: "I've been feeling left out during conversations. Can we talk about it?", correct: true },
        { text: "You guys are annoying.", correct: false },
        { text: "I'm just busy.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Classmate",
      question: "Want to join our study group?",
      options: [
        { text: "I'd like to, but I'm not sure I can keep up. Could you tell me more about how it works?", correct: true },
        { text: "No, I study better alone.", correct: false },
        { text: "Maybe another time.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "History Teacher",
      question: "Your project is due next week. How's it coming along?",
      options: [
        { text: "I'm having trouble finding reliable sources. Could you recommend some?", correct: true },
        { text: "It's fine.", correct: false },
        { text: "I haven't started yet.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Trusted Adult",
      question: "You seem stressed. Want to talk about it?",
      options: [
        { text: "I'm dealing with a lot right now and don't know where to start. Can you help me prioritize?", correct: true },
        { text: "I can handle it.", correct: false },
        { text: "It's not a big deal.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Tutor",
      question: "What topic should we focus on today?",
      options: [
        { text: "I'm really struggling with fractions and percentages. Can we work on those?", correct: true },
        { text: "I don't know.", correct: false },
        { text: "Whatever you think.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Team Coach",
      question: "You seem distracted during practice. Everything alright?",
      options: [
        { text: "I'm worried about balancing sports and schoolwork. Do you have any advice?", correct: true },
        { text: "I'm fine, just tired.", correct: false },
        { text: "Practice is boring.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Sibling",
      question: "You've been really moody. What's wrong?",
      options: [
        { text: "I've been dealing with some friendship issues. Can I talk to you about it?", correct: true },
        { text: "Mind your own business.", correct: false },
        { text: "Nothing's wrong.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Art Teacher",
      question: "Your project doesn't seem to match the assignment. Can we discuss it?",
      options: [
        { text: "I misunderstood the requirements. Can you clarify what you're looking for?", correct: true },
        { text: "I thought it was good enough.", correct: false },
        { text: "I'll just redo it.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Club Advisor",
      question: "You haven't been participating much in club activities. Is there a reason?",
      options: [
        { text: "I'm interested but feeling a bit shy. Could you help me find a way to get more involved?", correct: true },
        { text: "The club is boring.", correct: false },
        { text: "I'm too busy.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Grandparent",
      question: "You don't seem like yourself lately. Want to talk?",
      options: [
        { text: "I've been feeling pressured about my future. Can we talk about it?", correct: true },
        { text: "I'm okay.", correct: false },
        { text: "It's complicated.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Music Teacher",
      question: "You're struggling with this piece. What's the challenge?",
      options: [
        { text: "I can't get the rhythm right in measures 12-16. Could you break it down for me?", correct: true },
        { text: "It's too hard.", correct: false },
        { text: "I don't like this song.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Peer Mentor",
      question: "How are you adjusting to the new school year?",
      options: [
        { text: "I'm finding it hard to make new friends. Do you have any suggestions?", correct: true },
        { text: "It's whatever.", correct: false },
        { text: "Fine, I guess.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "School Nurse",
      question: "You've been coming in with headaches a lot. Is something stressing you out?",
      options: [
        { text: "I think stress might be causing them. Can you help me identify what's triggering it?", correct: true },
        { text: "I just need some medicine.", correct: false },
        { text: "It's nothing.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Computer Science Teacher",
      question: "Your code isn't running. Want me to take a look?",
      options: [
        { text: "Yes, please. I think there's an error in my loop but I can't find it.", correct: true },
        { text: "I'll figure it out.", correct: false },
        { text: "Coding is too confusing.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Lunch Monitor",
      question: "I noticed you're eating alone. Would you like me to help you find a group to sit with?",
      options: [
        { text: "That would be helpful. I'm new and don't know many people yet.", correct: true },
        { text: "I prefer being alone.", correct: false },
        { text: "No thanks.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Youth Leader",
      question: "You seem withdrawn during group activities. Is everything okay?",
      options: [
        { text: "I'm feeling a bit overwhelmed with personal stuff. Can we talk privately?", correct: true },
        { text: "I'm just not interested.", correct: false },
        { text: "Everything's fine.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "PE Teacher",
      question: "You're not participating in class. Are you injured?",
      options: [
        { text: "I'm feeling self-conscious about my athletic ability. Is there a way I can participate that's less intimidating?", correct: true },
        { text: "I just don't feel like it.", correct: false },
        { text: "PE is pointless.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Drama Teacher",
      question: "You seem nervous about the upcoming performance. Want to practice together?",
      options: [
        { text: "Yes, I'm really anxious about forgetting my lines. Can we run through them?", correct: true },
        { text: "I'll be fine.", correct: false },
        { text: "I don't want to do it anymore.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Family Member",
      question: "You've been spending a lot of time in your room. Is something bothering you?",
      options: [
        { text: "I've been feeling sad and I'm not sure why. Can we talk about it?", correct: true },
        { text: "I just want privacy.", correct: false },
        { text: "Leave me alone.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Library Teacher",
      question: "You look lost. Can I help you find something?",
      options: [
        { text: "I need resources for my research paper but don't know where to start. Can you guide me?", correct: true },
        { text: "I'm just browsing.", correct: false },
        { text: "I'll find it myself.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Bus Driver",
      question: "Some kids have been bothering you on the bus. Do you want to talk about it?",
      options: [
        { text: "Yes, they've been teasing me and it's making me uncomfortable. Can you help?", correct: true },
        { text: "It's not a big deal.", correct: false },
        { text: "I can handle it.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Mentor",
      question: "You seem less enthusiastic lately. What's changed?",
      options: [
        { text: "I'm doubting myself a lot recently. Can we talk about building confidence?", correct: true },
        { text: "Nothing's changed.", correct: false },
        { text: "I'm just tired.", correct: false }
      ]
    },
    {
      category: "Academic",
      speaker: "Language Teacher",
      question: "Your pronunciation needs work. Would you like extra practice?",
      options: [
        { text: "Yes, I'm struggling with certain sounds. Could you show me the mouth positions?", correct: true },
        { text: "I sound fine to me.", correct: false },
        { text: "Languages are too hard.", correct: false }
      ]
    },
    {
      category: "Social",
      speaker: "Cafeteria Worker",
      question: "You haven't been eating much. Is the food okay?",
      options: [
        { text: "I've been stressed and it's affecting my appetite. Is there someone I can talk to about it?", correct: true },
        { text: "The food is gross.", correct: false },
        { text: "I'm not hungry.", correct: false }
      ]
    },
    {
      category: "Emotional",
      speaker: "Guidance Counselor",
      question: "Your grades have dropped. Let's talk about what's going on.",
      options: [
        { text: "I've been dealing with family issues that are distracting me. Can you help me create a plan?", correct: true },
        { text: "I don't care about grades.", correct: false },
        { text: "It's temporary.", correct: false }
      ]
    }
  ];

  // Select 5 random scenarios on component mount
  useEffect(() => {
    const shuffled = [...allScenarios].sort(() => 0.5 - Math.random());
    setSelectedScenarios(shuffled.slice(0, 5));
  }, []);

  // Track scroll progress for timeline
  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const element = timelineRef.current;
        const rect = element.getBoundingClientRect();
        const elementHeight = element.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate how much of the timeline is visible
        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.min(elementHeight, viewportHeight - rect.top);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        const progress = Math.min(100, Math.max(0, (visibleHeight / elementHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      title: "Step 1: Identify What You Need",
      description: "Be as specific as possible about what kind of help you need. Are you looking for advice, emotional support, or practical assistance?"
    },
    {
      title: "Step 2: Choose the Right Person",
      description: "Consider who would be best suited to help you. This might be a friend, family member, teacher, counselor, or professional."
    },
    {
      title: "Step 3: Find the Right Time",
      description: "Choose a time when you're both free to talk without distractions. You might say, \"Do you have a few minutes to talk? I could use some advice.\""
    },
    {
      title: "Step 4: Be Direct and Honest",
      description: "Clearly state what you're struggling with and what kind of help you need. For example: \"I've been feeling really overwhelmed with schoolwork. Could you help me figure out a better way to manage my time?\""
    },
    {
      title: "Step 5: Be Open to Suggestions",
      description: "The person might offer solutions you haven't considered. Be open to their perspective while also being honest about what will work for you."
    }
  ];

  const phrases = [
    "\"I'm having trouble with ___. Could you help me?\"",
    "\"I'm feeling ___. I could really use someone to talk to.\"",
    "\"I'm not sure how to handle this situation. Can I get your advice?\"",
    "\"I need some help with ___. Do you have time to talk?\"",
    "\"I'm feeling stuck. Can I run something by you?\"",
    "\"I could use some support with ___. Would you be willing to help?\""
  ];

  const handlePracticeResponse = (isCorrect, optionIndex) => {
    setSelectedOption(optionIndex);
    if (isCorrect) {
      setFeedback({ type: 'success', message: "Great choice! Being specific helps the person understand exactly what you need." });
    } else {
      setFeedback({ type: 'error', message: "Try again. Remember, being specific and honest is better than giving up or being vague." });
    }
  };

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 ">
            <span className="text-violet-600">How to Ask</span>{" "}
            <span className="text-amber-600">for Help</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Practical steps to reach out
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Timeline Steps */}
          <div className="relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Steps to Ask</h3>

            {/* Timeline Line */}
            <div className="absolute left-5 top-16 bottom-0 w-1 bg-amber-300"></div>

            <div className="space-y-8 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-start relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg bg-amber-500"
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-violet-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold text-violet-800 mb-2">{step.title.split(': ')[1]}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Phrases & Practice */}
          <div className="space-y-8">
            {/* Helpful Phrases */}
            <motion.div
              className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <MessageCircle className="w-8 h-8 text-amber-600 mr-3" />
                Helpful Phrases
              </h3>
              <div className="space-y-3">
                {phrases.map((phrase, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-gray-700 font-medium border-l-4 border-amber-400">
                    {phrase}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Practice Trigger */}
            <motion.div
              className="bg-violet-600 rounded-3xl p-8 text-white text-center shadow-xl cursor-pointer hover:bg-violet-700 transition-colors"
              onClick={() => setIsPracticeModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-violet-200" />
              <h3 className="text-2xl font-bold mb-2">Practice Conversation</h3>
              <p className="text-violet-100 mb-6">Role-play asking for help in a safe environment</p>
              <button className="bg-white text-violet-600 px-8 py-3 rounded-full font-bold hover:bg-violet-50 transition-colors">
                Start Practice
              </button>
            </motion.div>
          </div>
        </div>

        {/* Practice Modal */}
        {isPracticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                onClick={() => setIsPracticeModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="bg-violet-600 p-4 text-white flex-shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold">Practice Conversations</h3>
                </div>
                <p className="text-violet-100 text-sm">Role-play asking for help in different scenarios</p>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {selectedScenarios.length > 0 && (
                  <>
                    <div className="flex items-center justify-end mb-4">
                      <span className="text-xs text-gray-500">{practiceStep + 1} of {selectedScenarios.length} scenarios</span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-start mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 flex-1">
                          <p className="text-gray-800 font-medium mb-1 text-sm">{selectedScenarios[practiceStep]?.speaker} says:</p>
                          <p className="text-gray-600 text-base">"{selectedScenarios[practiceStep]?.question}"</p>
                        </div>
                      </div>

                      <p className="text-gray-700 font-bold mb-3 ml-12 text-sm">How would you respond?</p>

                      <div className="space-y-2 ml-12">
                        {selectedScenarios[practiceStep]?.options.map((option, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrect = option.correct;
                          const showResult = isSelected && feedback;

                          return (
                            <button
                              key={idx}
                              onClick={() => handlePracticeResponse(option.correct, idx)}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${showResult
                                ? isCorrect
                                  ? 'border-green-400 bg-green-50'
                                  : 'border-red-400 bg-red-50'
                                : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                                }`}
                            >
                              {option.text}
                            </button>
                          );
                        })}
                      </div>

                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-4 ml-12 p-3 rounded-xl ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                              <p className="font-medium text-sm">{feedback.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => {
                    if (practiceStep > 0) {
                      setPracticeStep(practiceStep - 1);
                      setFeedback(null);
                      setSelectedOption(null);
                    }
                  }}
                  disabled={practiceStep === 0}
                  className="px-6 py-2 text-violet-600 font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-violet-50 rounded-lg transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    if (practiceStep < selectedScenarios.length - 1) {
                      setPracticeStep(practiceStep + 1);
                      setFeedback(null);
                      setSelectedOption(null);
                    } else {
                      // Last scenario - close modal
                      setIsPracticeModalOpen(false);
                      setPracticeStep(0);
                      setFeedback(null);
                      setSelectedOption(null);
                    }
                  }}
                  className="px-6 py-2 bg-violet-600 text-white font-medium hover:bg-violet-700 rounded-lg transition-colors"
                >
                  {practiceStep === selectedScenarios.length - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

// Get Help Now Section Component
const GetHelpNowSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const helplines = [
    {
      name: "Childline India",
      description: "24/7 emergency phone outreach for children in need of care and protection",
      number: "1098",
      color: "bg-red-100 text-red-800 border-red-200"
    },
    {
      name: "NIMHANS Helpline",
      description: "Mental health support and counseling services",
      number: "080-46110007",
      color: "bg-orange-100 text-orange-800 border-orange-200"
    },
    {
      name: "iCall",
      description: "Psychological counseling and support",
      number: "022-25521111",
      color: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      name: "Vandrevala Foundation",
      description: "24/7 mental health support and counseling",
      number: "9999 666 555",
      color: "bg-green-100 text-green-800 border-green-200"
    }
  ];

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-1">
            Get Help <span className="text-red-600">Now</span>
          </h2>
          <p className="text-xl text-gray-600">
            Helpline Directory • <span className="font-semibold text-red-500">24/7 support is available</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {helplines.map((helpline, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl border-2 ${helpline.color} transition-transform hover:scale-105`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold mb-2">{helpline.name}</h3>
              <p className="text-sm opacity-90 mb-4 min-h-[40px]">{helpline.description}</p>
              <div className="flex items-center justify-between bg-white/50 rounded-xl p-3">
                <span className="text-2xl font-bold tracking-wider">{helpline.number}</span>
                <a href={`tel:${helpline.number.replace(/\s/g, '')}`} className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Tools Section Component
const ToolsSection = ({ currentToolStep, setCurrentToolStep, onUnlockAchievement }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const tools = [
    {
      title: "Check-in Questions",
      description: "Ask yourself these questions to see if you need help",
      questions: [
        "Do I feel overwhelmed or stressed?",
        "Am I struggling to understand something important?",
        "Do I feel alone or isolated?",
        "Is a problem affecting my daily life?"
      ]
    },
    {
      title: "Conversation Starters",
      description: "Easy ways to begin asking for help",
      starters: [
        "I'm having trouble with... could you help me?",
        "I've been feeling... and I think I need support",
        "Could we talk about...?",
        "I'm not sure what to do about..."
      ]
    },
    {
      title: "Prepare Your Thoughts",
      description: "Think through what you want to say",
      preparation: [
        "What specifically do I need help with?",
        "How have I been feeling lately?",
        "What have I tried already?",
        "What kind of support would be most helpful?"
      ]
    }
  ];

  const completeTool = (toolIndex) => {
    if (toolIndex === currentToolStep) {
      setCurrentToolStep(currentToolStep + 1);
      onUnlockAchievement('problem-solver');
    }
  };

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-teal-600">Interactive</span>{" "}
            <span className="text-violet-600">Tools</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Practical tools to help you recognize when you need help and how to ask for it
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 ${index === currentToolStep
                ? 'border-teal-400 ring-4 ring-teal-200'
                : index < currentToolStep
                  ? 'border-teal-300 bg-teal-50/50'
                  : 'border-teal-100'
                }`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${index === currentToolStep ? 'bg-teal-500' : index < currentToolStep ? 'bg-teal-300' : 'bg-gray-200'
                  }`}>
                  {index < currentToolStep ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{tool.title}</h3>
                <p className="text-gray-600 mt-2">{tool.description}</p>
              </div>

              <div className="space-y-4">
                {tool.questions && tool.questions.map((question, qIndex) => (
                  <motion.div
                    key={qIndex}
                    className="bg-gradient-to-r from-teal-50 to-violet-50 rounded-lg p-4 cursor-pointer hover:from-teal-100 hover:to-violet-100 transition-all duration-200"
                    onClick={() => completeTool(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <p className="text-gray-700">{question}</p>
                    </div>
                  </motion.div>
                ))}

                {tool.starters && tool.starters.map((starter, sIndex) => (
                  <motion.div
                    key={sIndex}
                    className="bg-gradient-to-r from-violet-50 to-amber-50 rounded-lg p-4 cursor-pointer hover:from-violet-100 hover:to-amber-100 transition-all duration-200"
                    onClick={() => completeTool(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-4 h-4 text-violet-500" />
                      <p className="text-gray-700 italic">"{starter}"</p>
                    </div>
                  </motion.div>
                ))}

                {tool.preparation && tool.preparation.map((prep, pIndex) => (
                  <motion.div
                    key={pIndex}
                    className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-lg p-4 cursor-pointer hover:from-amber-100 hover:to-teal-100 transition-all duration-200"
                    onClick={() => completeTool(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <p className="text-gray-700">{prep}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {index === currentToolStep && (
                <motion.button
                  className="w-full mt-6 bg-gradient-to-r from-teal-500 to-violet-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-violet-600 transition-all duration-200"
                  onClick={() => completeTool(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete Step
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Challenges Section Component
const ChallengesSection = ({ achievements, onUnlockAchievement }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const challenges = [
    {
      title: "The Fear of Judgment",
      description: "Worried about what others might think",
      scenario: "You're struggling with a subject and think asking for help makes you look weak.",
      solution: "Remember that asking for help shows maturity and a desire to learn and improve."
    },
    {
      title: "Feeling Like a Burden",
      description: "Thinking you're taking up too much of someone's time",
      scenario: "You want to talk to a friend, but feel guilty about bothering them with your problems.",
      solution: "True friends care about you and want to support you. They won't see you as a burden."
    },
    {
      title: "Not Knowing What to Say",
      description: "Feeling unsure about how to start the conversation",
      scenario: "You know you need help but don't know how to put your feelings into words.",
      solution: "Start simple: 'I'm going through something and could really use someone to talk to.'"
    },
    {
      title: "Thinking You Should Handle It Alone",
      description: "Believing you need to be completely independent",
      scenario: "You think asking for help means you're not capable or strong enough.",
      solution: "Even successful people seek help and advice. It's a sign of wisdom, not weakness."
    }
  ];

  const handleChallengeComplete = (challengeId) => {
    if (challengeId === 'brave-step') {
      onUnlockAchievement('brave-step');
    }
  };

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-teal-600">Common</span>{" "}
            <span className="text-violet-600">Challenges</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Address the fears and concerns that might stop you from asking for help
          </p>
        </motion.div>

        {/* Achievements Display */}
        <motion.div
          className="mb-12 bg-gradient-to-r from-teal-100 to-violet-100 rounded-2xl p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-6 h-6 text-teal-600 mr-3" />
            Your Progress
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-lg p-4 text-center transition-all duration-300 ${achievement.earned
                  ? 'border-2 border-teal-400 shadow-md'
                  : 'border-2 border-gray-200 opacity-60'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${achievement.earned
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-200 text-gray-400'
                  }`}>
                  {achievement.earned ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Star className="w-6 h-6" />
                  )}
                </div>
                <p className={`text-sm font-medium ${achievement.earned ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Challenges Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {challenges.map((challenge, index) => (
            <motion.div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-teal-100"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full flex items-center justify-center mr-4">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{challenge.title}</h3>
                    <p className="text-gray-600">{challenge.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Scenario */}
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <Brain className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">The Challenge</h4>
                      <p className="text-red-700">{challenge.scenario}</p>
                    </div>
                  </div>
                </div>

                {/* Solution */}
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">The Solution</h4>
                      <p className="text-green-700">{challenge.solution}</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                className="w-full mt-6 bg-gradient-to-r from-teal-500 to-violet-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-violet-600 transition-all duration-200"
                onClick={() => handleChallengeComplete('brave-step')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                I've Overcome This Challenge
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Connections Section Component
const ConnectionsSection = ({ onUnlockAchievement }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const connections = [
    {
      title: "School Resources",
      description: "People and places at your school who can help",
      items: [
        "Teachers - For academic help and guidance",
        "School Counselor - For personal and emotional support",
        "Principal/Vice Principal - For serious concerns",
        "School Nurse - For health-related issues",
        "Librarian - For research and study help"
      ]
    },
    {
      title: "Family & Friends",
      description: "Your personal support network",
      items: [
        "Parents - For most concerns and guidance",
        "Older siblings - For school and life advice",
        "Close friends - For emotional support",
        "Extended family - For specific expertise",
        "Neighboring adults - For when parents aren't available"
      ]
    },
    {
      title: "Community Resources",
      description: "Professional help in your community",
      items: [
        "Healthcare providers - For medical and mental health",
        "Religious leaders - For spiritual and moral guidance",
        "Community centers - For after-school programs",
        "Sports coaches - For personal development",
        "Mentor programs - For ongoing guidance"
      ]
    }
  ];

  const handleConnectionComplete = () => {
    onUnlockAchievement('connection-builder');
  };

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="text-teal-600">Your</span>{" "}
            <span className="text-violet-600">Connections</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Build your network of support by knowing who you can reach out to in different situations
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {connections.map((connection, index) => (
            <motion.div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-teal-100"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{connection.title}</h3>
                <p className="text-gray-600 mt-2">{connection.description}</p>
              </div>

              <div className="space-y-4">
                {connection.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    className="bg-gradient-to-r from-teal-50 to-violet-50 rounded-lg p-4 hover:from-teal-100 hover:to-violet-100 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: index * 0.2 + itemIndex * 0.05 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Steps */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-teal-100 to-violet-100 rounded-3xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Take Action: Build Your Network
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Identify</h4>
              <p className="text-gray-600">Write down 3 people you can reach out to for help</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Reach Out</h4>
              <p className="text-gray-600">Contact one person this week to check in or ask a question</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Build</h4>
              <p className="text-gray-600">Strengthen your relationships by being supportive to others too</p>
            </div>
          </div>

          <motion.button
            className="block mx-auto bg-gradient-to-r from-teal-500 to-violet-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={handleConnectionComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            I've Identified My Support Network
          </motion.button>
        </motion.div>

        {/* Final Message */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Remember: Asking for Help is a Strength
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              You don't have to face challenges alone. Whether it's schoolwork, personal problems, or just needing someone to listen,
              reaching out for help is one of the most intelligent and brave things you can do.
              Your network of support is waiting for you to connect with them.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-4 text-teal-600">
                <Heart className="w-6 h-6" />
                <span className="font-semibold">You matter. You are not alone.</span>
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};



export default WhenToAskForHelp;
