import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import {
  Heart, Users, BookOpen, Shield, Eye, CheckCircle, HandHeart, Scale,
  Brain, Target, ChevronRight, Trophy, Star, Globe, Home,
  ArrowRight, Sparkles, Menu, X, Lightbulb, RotateCcw, ArrowLeft
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  earned: boolean
  description: string
}

function App() {
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'kindness', title: 'Kind Citizen Badge', earned: false, description: 'Completed Acts of Kindness week' },
    { id: 'swachhata', title: 'Swachhata Hero Badge', earned: false, description: 'Completed Clean & Green mission' },
    { id: 'digital', title: 'Digital Citizen Star', earned: false, description: 'Took the Digital Dignity pledge' }
  ])

  const [activeSection, setActiveSection] = useState('hero')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('citizenship-achievements')
    if (saved) setAchievements(JSON.parse(saved))
  }, [])

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement =>
        achievement.id === id ? { ...achievement, earned: true } : achievement
      )
      localStorage.setItem('citizenship-achievements', JSON.stringify(updated))
      return updated
    })
  }

  const navigationItems = [
    { id: 'hero', label: 'Hero' }, { id: 'why-it-matters', label: 'Why It Matters' },
    { id: 'core-values', label: 'Core Values' }, { id: 'good-citizenship', label: 'Good Citizenship' },
    { id: 'interactive-tools', label: 'Interactive Tools' }, { id: 'challenges', label: 'Challenges' },
    { id: 'real-life', label: 'Real-Life' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => document.getElementById(item.id))
      const currentSection = sections.find(section => {
        if (!section) return false
        const rect = section.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom > 100
      })
      if (currentSection) setActiveSection(currentSection.id)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-wellness-warm-white relative">
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

      {/* Navigation */}
      {/* Navigation Removed */}

      {/* Main Content */}
      <main className="pt-16">
        <section id="hero" className="min-h-screen"><HeroSection /></section>
        <section id="why-it-matters" className="py-6"><WhyItMattersSection /></section>
        <section id="core-values" className="py-6"><CoreValuesSection /></section>
        <section id="good-citizenship" className="py-6"><IndianCitizenshipSection /></section>
        <section id="interactive-tools" className="py-6"><InteractiveToolsSection achievements={achievements} /></section>
        <section id="help" className="py-6"><WhenToAskForHelpSection /></section>
      </main>
    </div>
  )
}

// Hero Section
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => setIsVisible(true), [])

  return (
    <div className="relative min-h-screen flex items-start justify-start overflow-hidden pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-wellness-calm-blue via-wellness-warm-white to-wellness-gentle-gray">
        <motion.div className="absolute top-1/4 left-1/4 w-32 h-32 bg-wellness-soft-blue/20 rounded-full blur-xl" animate={{ y: [0, -30, 0], x: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/3 right-1/4 w-24 h-24 bg-wellness-gentle-gray/30 rounded-full blur-xl" animate={{ y: [0, -20, 0], x: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      </div>

      {/* Hero Image */}
      <motion.div
        className="absolute right-0 -top-10 -translate-y-1/2 z-0 hidden lg:block pr-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="/Resource Images/8. values and citizenship education/12.webp"
          alt="Citizenship Education"
          className="w-[400px] h-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl ml-4 md:ml-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }} transition={{ duration: 1, delay: 0.2 }}>

          <motion.h1 className="text-5xl md:text-7xl font-bold text-wellness-deep-blue mb-2 leading-tight" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <span className="text-wellness-cool-blue">What Kind of</span>{" "}
            <span className="text-wellness-deep-blue">Citizen Do</span><br />
            <span className="text-wellness-cool-blue">You Want to Be?</span>
          </motion.h1>

          <motion.p className="text-lg md:text-xl text-slate-700 mb-6 max-w-4xl mx-auto leading-relaxed font-medium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
            Learn how kindness, honesty, and respect shape a better society. Discover how to build strong values, embrace diversity, and make a positive difference.
          </motion.p>



          <motion.button onClick={() => document.getElementById('why-it-matters')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Become a Changemaker
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

// Why It Matters Section
const WhyItMattersSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const benefits = [
    { title: "Build Character", description: "Develop strong moral foundation", icon: Heart },
    { title: "Promote Unity", description: "Bring people together", icon: Users },
    { title: "Reduce Conflict", description: "Create peaceful environment", icon: Shield },
    { title: "Contribute Positively", description: "Make a difference in society", icon: Lightbulb }
  ]

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-4" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            <span className="text-blue-600">Why It</span>{" "}
            <span className="text-slate-800">Matters</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-0">
          <motion.div className="relative" initial={{ opacity: 0, x: -50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="bg-gradient-to-br from-wellness-calm-blue to-wellness-gentle-gray rounded-l-3xl p-0 h-full flex flex-col justify-center">
              <div className="text-center p-8">
                <img src="/Resource Images/8. values and citizenship education/matters.png" alt="Why it matters" className="w-80 h-auto mx-auto mb-8 object-contain" />
                <motion.div className="bg-wellness-warm-white/80 backdrop-blur-sm rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }}>
                  <p className="text-wellness-deep-blue italic mb-3 text-lg">"Standing up for what is right"</p>
                  <p className="text-wellness-deep-blue italic mb-3 text-lg">"even when no one is watching"</p>
                  <p className="text-wellness-cool-blue font-bold text-xl">builds stronger community.</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div className="space-y-8" initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }}>
            <div className="bg-wellness-warm-white/80 backdrop-blur-sm rounded-r-2xl p-0 h-full">
              <p className="text-lg text-wellness-deep-blue leading-relaxed mb-8">
                Values and citizenship education help you grow into a <span className="font-semibold text-wellness-cool-blue">kind, responsible, and active member</span> of your community.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} className="flex items-start space-x-4" initial={{ opacity: 0, x: 20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}>
                    <div className="p-3 bg-wellness-soft-blue rounded-xl text-wellness-cool-blue flex-shrink-0">
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-wellness-deep-blue mb-1 text-lg">{benefit.title}</h3>
                      <p className="text-wellness-deep-blue/80">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Core Values Section
const CoreValuesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const coreValues = [
    { title: "Respect", description: "Treat everyone with kindness and dignity", icon: Heart, examples: ["Listen to others", "Value different opinions", "Treat everyone equally"] },
    { title: "Responsibility", description: "Take ownership of your actions", icon: Shield, examples: ["Do your homework", "Take care of belongings", "Help at home"] },
    { title: "Empathy", description: "Understand how others feel", icon: Eye, examples: ["Comfort friends", "Help those in need", "Understand emotions"] },
    { title: "Honesty", description: "Always tell the truth, even when it's hard", icon: CheckCircle, examples: ["Admit mistakes", "Return borrowed items", "Speak truthfully"] },
    { title: "Service", description: "Help others selflessly", icon: HandHeart, examples: ["Volunteer work", "Help classmates", "Community service"] },
    { title: "Tolerance", description: "Accept differences in opinions and cultures", icon: Scale, examples: ["Celebrate diversity", "Respect different religions", "Work together despite differences"] }
  ]

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-4" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            <span className="text-blue-600">Core Values</span>{" "}
            <span className="text-slate-800">That Guide Us</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            These fundamental principles shape our character and help us build a stronger, more compassionate community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreValues.map((value, index) => (
            <motion.div key={index}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl border border-slate-100 hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}>

              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500 ease-out opacity-50"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  {React.createElement(value.icon, { className: "w-6 h-6" })}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{value.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed min-h-[2.5rem]">{value.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Action</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {value.examples.map((example, idx) => (
                      <span key={idx} className="inline-block px-2 py-0.5 bg-slate-50 text-slate-600 text-xs rounded-full border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700 transition-all duration-300">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Good Citizenship Section
const IndianCitizenshipSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState('values')

  const tabData = {
    values: {
      title: 'Constitutional Values', icon: Heart, description: 'The fundamental principles that guide good citizenship',
      items: [
        { title: 'Unity in Diversity', description: 'Celebrate differences while maintaining national unity', examples: ['Respect different cultures', 'Learn about traditions', 'Stand against discrimination'] },
        { title: 'Fundamental Rights', description: 'Know and protect your rights and others\' rights', examples: ['Freedom of speech', 'Right to equality', 'Right to education'] },
        { title: 'Secularism', description: 'Equal respect for all religions and beliefs', examples: ['Treat all faiths equally', 'Respect diversity', 'Maintain tolerance'] }
      ]
    },
    duties: {
      title: 'Fundamental Duties', icon: BookOpen, description: 'Your responsibilities as a citizen',
      items: [
        { title: 'Abide by the Constitution', description: 'Follow and respect the laws of the land', examples: ['Follow traffic rules', 'Pay taxes honestly', 'Respect legal processes'] },
        { title: 'Protect Environment', description: 'Preserve and improve the natural environment', examples: ['Keep surroundings clean', 'Save water and electricity', 'Plant trees'] },
        { title: 'Develop Scientific Temper', description: 'Promote reasoning and scientific thinking', examples: ['Question superstitions', 'Follow evidence', 'Encourage innovation'] }
      ]
    },
    participation: {
      title: 'Community Participation', icon: Users, description: 'Active involvement in community building',
      items: [
        { title: 'Voting', description: 'Participate in democratic processes', examples: ['Register to vote', 'Learn about candidates', 'Cast your vote responsibly'] },
        { title: 'Community Service', description: 'Contribute to local community development', examples: ['Volunteer for causes', 'Help in clean-ups', 'Support local initiatives'] },
        { title: 'Civic Awareness', description: 'Stay informed about local and national issues', examples: ['Read newspapers', 'Participate in discussions', 'Understand policies'] }
      ]
    },
    digital: {
      title: 'Digital Citizenship', icon: Globe, description: 'Responsible behavior in the digital world',
      items: [
        { title: 'Digital Ethics', description: 'Follow ethical practices online', examples: ['Respect privacy', 'Avoid cyberbullying', 'Use content responsibly'] },
        { title: 'Online Safety', description: 'Protect yourself and others online', examples: ['Use strong passwords', 'Be cautious with info', 'Report harmful content'] },
        { title: 'Digital Literacy', description: 'Develop skills for the digital age', examples: ['Learn to fact-check', 'Understand tools', 'Promote digital inclusion'] }
      ]
    }
  }

  const activeTabData = tabData[activeTab as keyof typeof tabData]

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-4" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            <span className="text-blue-600">Good Citizenship</span>{" "}
            <span className="text-slate-800">for Students</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Explore the four pillars of good citizenship: constitutional values, fundamental duties, community participation, and digital responsibilities
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(tabData).map(([key, tab], index) => {
            const Icon = tab.icon
            const isActive = activeTab === key

            return (
              <motion.button key={key}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 border ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                onClick={() => setActiveTab(key)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.title}</span>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4 text-slate-800">{activeTabData.title}</h3>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">{activeTabData.description}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {activeTabData.items.map((item, index) => (
                <motion.div key={index}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>

                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h4>
                    <p className="text-slate-600 mb-4 leading-relaxed text-sm">{item.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Actions</div>
                    {item.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="flex items-center space-x-2 text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div className="text-center mt-16">

            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Interactive Tools Section
const InteractiveToolsSection = ({ achievements }: { achievements: Achievement[] }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizResults, setQuizResults] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<number | null>(null)
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0)

  // All available scenarios pool
  const allScenarios = [
    {
      title: 'The Classroom Test',
      description: 'You see a classmate cheating on an important test. They are your friend, but you know cheating is wrong.',
      question: 'What is the most responsible action to take?',
      options: [
        { text: 'Tell the teacher immediately', outcome: 'This shows high integrity, but might strain your friendship immediately.', isBest: false },
        { text: 'Tell your classmate privately to stop', outcome: 'This is a balanced approach that upholds values while giving your friend a chance to correct their mistake.', isBest: true, reason: 'It addresses the wrong behavior directly while being compassionate, allowing your friend to correct their mistake without public humiliation. It also upholds fairness by preventing cheating.' },
        { text: 'Ignore it to avoid conflict', outcome: 'This avoids immediate trouble but allows unfairness to continue, potentially harming your friend in the long run.', isBest: false },
        { text: 'Report it anonymously later', outcome: 'This balances justice with personal protection but delays the solution and doesn\'t give your friend a chance to self-correct.', isBest: false }
      ]
    },
    {
      title: 'The Playground Exclusion',
      description: 'A group of popular students is excluding a new student from their game. You want to join the game but feel bad for the new student.',
      question: 'How do you handle this social pressure?',
      options: [
        { text: 'Join the game and ignore the new student', outcome: 'You get to play, but you miss a chance to show leadership and kindness, and contribute to the exclusion.', isBest: false },
        { text: 'Invite the new student to join you in the game', outcome: 'This shows inclusive leadership and courage to stand up for others, actively promoting a welcoming environment.', isBest: true, reason: 'It directly addresses the exclusion by inviting the new student, demonstrating empathy and fostering a more inclusive play environment. It also sets a positive example for others.' },
        { text: 'Sit out and play with the new student instead', outcome: 'A very kind gesture that supports the new student directly, but doesn\'t challenge the exclusionary behavior of the group.', isBest: false },
        { text: 'Tell a teacher about the exclusion', outcome: 'Involving authority is an option, but trying to solve it socially first is often better for developing social skills and peer relationships.', isBest: false }
      ]
    },
    {
      title: 'The Found Money',
      description: 'You find a $20 bill on the floor in the hallway. No one is around to see you pick it up.',
      question: 'What do you do with the money?',
      options: [
        { text: 'Keep it, finders keepers', outcome: 'This is dishonest and takes something that doesn\'t belong to you.', isBest: false },
        { text: 'Turn it in to the lost and found office', outcome: 'This is the honest action, ensuring the owner has a chance to get their money back.', isBest: true, reason: 'It demonstrates integrity and respect for others\' property, even when no one is watching.' },
        { text: 'Ask friends if they lost money', outcome: 'Well-intentioned, but someone might lie to claim it.', isBest: false },
        { text: 'Leave it there', outcome: 'Someone else might take it; taking action to return it is more responsible.', isBest: false }
      ]
    },
    {
      title: 'The Rumor Mill',
      description: 'You hear a juicy but mean rumor about a classmate being spread in a group chat.',
      question: 'How do you respond?',
      options: [
        { text: 'Share it with just one close friend', outcome: 'Spreading rumors, even to one person, contributes to the problem.', isBest: false },
        { text: 'Ignore the chat', outcome: 'This avoids participation but doesn\'t help stop the harm.', isBest: false },
        { text: 'Post that spreading rumors is not cool', outcome: 'This takes a stand and encourages others to stop, showing digital leadership.', isBest: true, reason: 'It actively interrupts the cycle of bullying and sets a positive standard for online behavior.' },
        { text: 'Leave the group chat immediately', outcome: 'Protects you, but doesn\'t address the issue for the victim.', isBest: false }
      ]
    },
    {
      title: 'The Broken Window',
      description: 'You accidentally break a neighbor\'s window while playing ball. No one saw you do it.',
      question: 'What is your next step?',
      options: [
        { text: 'Run away before anyone sees', outcome: 'This avoids immediate trouble but is dishonest and cowardly.', isBest: false },
        { text: 'Knock on the door and apologize', outcome: 'This shows courage and responsibility, even though it\'s difficult.', isBest: true, reason: 'Taking ownership of your mistakes builds character and trust with others.' },
        { text: 'Wait for them to ask about it', outcome: 'This is passive and avoids taking full responsibility.', isBest: false },
        { text: 'Blame it on the wind', outcome: 'Lying to avoid consequences damages your integrity.', isBest: false }
      ]
    },
    {
      title: 'The Group Project Slacker',
      description: 'One member of your group project isn\'t doing any work, and the deadline is approaching.',
      question: 'How do you handle the situation?',
      options: [
        { text: 'Do their work for them', outcome: 'Gets the job done but enables their lack of responsibility.', isBest: false },
        { text: 'Complain to the teacher behind their back', outcome: 'This might solve the grade issue but destroys trust.', isBest: false },
        { text: 'Talk to them directly and ask how to help', outcome: 'This addresses the issue constructively and offers support.', isBest: true, reason: 'It shows leadership and problem-solving skills by trying to engage the team member before escalating.' },
        { text: 'Kick them out of the group', outcome: 'This is a harsh reaction that creates conflict.', isBest: false }
      ]
    },
    {
      title: 'The Unpopular Opinion',
      description: 'Your friends are making fun of a movie you actually really liked.',
      question: 'What do you say?',
      options: [
        { text: 'Pretend you hated it too', outcome: 'This hides your true self to fit in.', isBest: false },
        { text: 'Say nothing and change the subject', outcome: 'Avoids conflict but misses a chance to be authentic.', isBest: false },
        { text: 'Say "I actually thought it was good"', outcome: 'This shows confidence and honesty about your own preferences.', isBest: true, reason: 'Being true to yourself is important, even in small things. It encourages others to be authentic too.' },
        { text: 'Argue with them angrily', outcome: 'Turning a difference of opinion into a fight isn\'t necessary.', isBest: false }
      ]
    },
    {
      title: 'The Forgotten Homework',
      description: 'You forgot to do your homework. A friend offers to let you copy theirs before class.',
      question: 'What is the right choice?',
      options: [
        { text: 'Copy it quickly', outcome: 'This is academic dishonesty and you don\'t learn the material.', isBest: false },
        { text: 'Change the answers slightly so it looks different', outcome: 'Still dishonest and deceptive.', isBest: false },
        { text: 'Tell the teacher the truth and take the zero', outcome: 'This is hard but shows integrity and responsibility.', isBest: true, reason: 'Honesty is more valuable than a single grade. It builds trust with your teacher.' },
        { text: 'Pretend you lost it', outcome: 'Lying compounds the mistake.', isBest: false }
      ]
    },
    {
      title: 'The Cyberbully Witness',
      description: 'You see someone posting mean comments on a classmate\'s photo.',
      question: 'What action do you take?',
      options: [
        { text: 'Like the mean comments', outcome: 'This encourages the bully and hurts the victim.', isBest: false },
        { text: 'Post a nice comment to support the classmate', outcome: 'This counteracts the negativity with kindness.', isBest: true, reason: 'It supports the victim publicly and shifts the tone of the conversation to be more positive.' },
        { text: 'Screenshot it and send it to friends', outcome: 'This spreads the negativity further.', isBest: false },
        { text: 'Reply with a mean comment to the bully', outcome: 'Fighting fire with fire usually just escalates the conflict.', isBest: false }
      ]
    },
    {
      title: 'The Store Error',
      description: 'A cashier gives you back $10 too much change.',
      question: 'What do you do?',
      options: [
        { text: 'Keep it, it\'s their mistake', outcome: 'Taking advantage of a mistake is dishonest.', isBest: false },
        { text: 'Give the extra money back immediately', outcome: 'This is the honest thing to do.', isBest: true, reason: 'Integrity means doing the right thing even when it benefits you to do the wrong thing.' },
        { text: 'Buy something else with it', outcome: 'Using money that isn\'t yours is stealing.', isBest: false },
        { text: 'Donate it to charity', outcome: 'Good intention, but it\'s still not your money to give.', isBest: false }
      ]
    },
    {
      title: 'The Secret',
      description: 'Your friend tells you a secret that involves them doing something dangerous.',
      question: 'How do you handle this information?',
      options: [
        { text: 'Promise to keep it secret no matter what', outcome: 'This puts your friend at risk.', isBest: false },
        { text: 'Tell a trusted adult immediately', outcome: 'This prioritizes your friend\'s safety over their privacy.', isBest: true, reason: 'Safety is more important than secrecy. A true friend protects their friend from harm.' },
        { text: 'Gossip about it to others', outcome: 'This betrays trust and helps no one.', isBest: false },
        { text: 'Ignore it and hope nothing happens', outcome: 'This is passive and dangerous.', isBest: false }
      ]
    },
    {
      title: 'The Team Selection',
      description: 'You are picking teams for a game. The last person left is someone who isn\'t very good at sports.',
      question: 'What do you say?',
      options: [
        { text: 'Sigh and say "I guess we\'ll take them"', outcome: 'This makes the person feel unwanted and hurt.', isBest: false },
        { text: 'Say "We\'d love to have you on our team!"', outcome: 'This makes the person feel welcomed and valued.', isBest: true, reason: 'Kindness and inclusion matter more than winning. It builds confidence and team spirit.' },
        { text: 'Let the other team take them', outcome: 'Avoids the issue but isn\'t inclusive.', isBest: false },
        { text: 'Ask to play with fewer people', outcome: 'This actively excludes the person.', isBest: false }
      ]
    },
    {
      title: 'The Borrowed Item',
      description: 'You borrowed a book from a friend and accidentally spilled water on it.',
      question: 'What is your response?',
      options: [
        { text: 'Return it and hope they don\'t notice', outcome: 'This is deceptive and disrespectful.', isBest: false },
        { text: 'Hide the book and say you lost it', outcome: 'Lying destroys trust.', isBest: false },
        { text: 'Apologize and offer to replace it', outcome: 'This takes responsibility for your actions.', isBest: true, reason: 'Accidents happen, but how we fix them defines our character. Making it right restores trust.' },
        { text: 'Blame it on your sibling', outcome: 'Unfairly blaming others is wrong.', isBest: false }
      ]
    },
    {
      title: 'The Peer Pressure',
      description: 'Your friends are planning to skip class and want you to come with them.',
      question: 'What do you decide?',
      options: [
        { text: 'Go with them to be cool', outcome: 'Succumbing to pressure compromises your education and values.', isBest: false },
        { text: 'Make up an excuse to not go', outcome: 'Avoids the trouble but isn\'t honest.', isBest: false },
        { text: 'Say "No thanks, I\'m going to class"', outcome: 'This shows strength of character and independence.', isBest: true, reason: 'Standing up for your own education and values is a sign of maturity and leadership.' },
        { text: 'Tell on them to the teacher', outcome: 'This might be seen as betraying trust unnecessarily.', isBest: false }
      ]
    },
    {
      title: 'The Lunch Money',
      description: 'A student forgets their lunch money and is hungry.',
      question: 'How can you help?',
      options: [
        { text: 'Ignore them, it\'s not your problem', outcome: 'Lacks empathy for someone in need.', isBest: false },
        { text: 'Offer to share your lunch or buy them something', outcome: 'This is a generous and kind act.', isBest: true, reason: 'Sharing what you have with those in need builds community and shows compassion.' },
        { text: 'Make fun of them for forgetting', outcome: 'This is cruel and unnecessary.', isBest: false },
        { text: 'Tell them to be more responsible next time', outcome: 'Lecturing doesn\'t help the immediate hunger.', isBest: false }
      ]
    },
    {
      title: 'The Cheating Partner',
      description: 'Your lab partner wants you to do all the work and just put their name on it.',
      question: 'What is the fair solution?',
      options: [
        { text: 'Do it to avoid conflict', outcome: 'This is unfair to you and dishonest.', isBest: false },
        { text: 'Refuse to put their name on it', outcome: 'This creates conflict and might be harsh.', isBest: false },
        { text: 'Insist that you split the work fairly', outcome: 'This enforces fairness and responsibility.', isBest: true, reason: 'Setting boundaries and expecting fair contribution is important for healthy collaboration.' },
        { text: 'Tell the teacher immediately', outcome: 'Escalating immediately might not be necessary.', isBest: false }
      ]
    },
    {
      title: 'The Lost Dog',
      description: 'You see a dog wandering the neighborhood with a collar but no owner.',
      question: 'What do you do?',
      options: [
        { text: 'Ignore it', outcome: 'The dog could get hurt or lost forever.', isBest: false },
        { text: 'Check the tag and call the owner', outcome: 'This is the most helpful action.', isBest: true, reason: 'Helping a helpless animal reunite with its family is an act of kindness and responsibility.' },
        { text: 'Chase it away', outcome: 'This could scare the dog into danger.', isBest: false },
        { text: 'Keep it as your own', outcome: 'This is stealing someone else\'s pet.', isBest: false }
      ]
    },
    {
      title: 'The Jealous Friend',
      description: 'You win an award and your friend seems jealous and makes a mean comment.',
      question: 'How do you react?',
      options: [
        { text: 'Get angry and brag more', outcome: 'This makes the situation worse.', isBest: false },
        { text: 'Ignore them and stop being friends', outcome: 'Ending a friendship over one moment might be rash.', isBest: false },
        { text: 'Ask them if everything is okay', outcome: 'This shows empathy and maturity.', isBest: true, reason: 'Understanding that jealousy often comes from insecurity allows you to be kind rather than reactive.' },
        { text: 'Make a mean comment back', outcome: 'Retaliation only creates more conflict.', isBest: false }
      ]
    },
    {
      title: 'The Environment',
      description: 'You see someone throw a plastic bottle in the trash instead of the recycling bin right next to it.',
      question: 'What do you do?',
      options: [
        { text: 'Yell at them', outcome: 'Aggression rarely changes behavior.', isBest: false },
        { text: 'Move it to the recycling bin yourself', outcome: 'This takes action and sets a quiet example.', isBest: true, reason: 'Actions speak louder than words. Taking care of the environment is everyone\'s responsibility.' },
        { text: 'Leave it there', outcome: 'Missed opportunity to help.', isBest: false },
        { text: 'Complain about it to someone else', outcome: 'Complaining doesn\'t fix the problem.', isBest: false }
      ]
    },
    {
      title: 'The New Kid',
      description: 'A new student from a different country speaks with an accent and others are laughing.',
      question: 'How do you support them?',
      options: [
        { text: 'Laugh along to fit in', outcome: 'This is bullying and hurtful.', isBest: false },
        { text: 'Tell the others to stop being rude', outcome: 'This is brave and defends the student.', isBest: true, reason: 'Standing up against prejudice and bullying creates a safer, more welcoming community for everyone.' },
        { text: 'Stay silent', outcome: 'Silence can be seen as agreement with the bullies.', isBest: false },
        { text: 'Tell the new student to ignore it', outcome: 'This puts the burden on the victim.', isBest: false }
      ]
    }
  ]

  // All available questions pool
  const allQuestions = [
    {
      question: 'When someone disagrees with you, what do you do first?', options: [
        { text: 'Listen to their perspective and try to understand', value: 'empathy' },
        { text: 'Respectfully explain your own viewpoint', value: 'respect' },
        { text: 'Look for common ground to find a solution', value: 'unity' },
        { text: 'Tell them they are wrong and give facts', value: 'directness' }
      ]
    },
    {
      question: 'You find a lost wallet on the street. What is your first instinct?', options: [
        { text: 'Look for ID to return it to the owner', value: 'honesty' },
        { text: 'Give it to a nearby police officer', value: 'responsibility' },
        { text: 'Wait for someone to come looking for it', value: 'patience' },
        { text: 'Take it but feel bad about it', value: 'conflict' }
      ]
    },
    {
      question: 'A friend is feeling sad about a personal problem. How do you help?', options: [
        { text: 'Listen actively and offer emotional support', value: 'empathy' },
        { text: 'Share similar experiences and advice', value: 'connection' },
        { text: 'Suggest practical solutions to fix the problem', value: 'problem-solving' },
        { text: 'Tell them to think positive and move on', value: 'optimism' }
      ]
    },
    {
      question: 'Your group project partner isn\'t doing their share of work. What do you do?', options: [
        { text: 'Talk to them privately to understand what\'s going on', value: 'empathy' },
        { text: 'Do their work yourself to avoid conflict', value: 'patience' },
        { text: 'Tell the teacher immediately', value: 'honesty' },
        { text: 'Divide tasks clearly and hold everyone accountable', value: 'responsibility' }
      ]
    },
    {
      question: 'You witness someone being bullied at school. What\'s your response?', options: [
        { text: 'Stand up for them immediately', value: 'honesty' },
        { text: 'Comfort the victim afterwards', value: 'empathy' },
        { text: 'Report it to a teacher or counselor', value: 'responsibility' },
        { text: 'Try to mediate between both parties', value: 'unity' }
      ]
    },
    {
      question: 'You made a mistake that affected your team. How do you handle it?', options: [
        { text: 'Admit it right away and apologize', value: 'honesty' },
        { text: 'Take responsibility and work to fix it', value: 'responsibility' },
        { text: 'Explain the circumstances that led to it', value: 'directness' },
        { text: 'Ask the team how to make it right', value: 'unity' }
      ]
    },
    {
      question: 'Someone shares a secret with you, but you think they need help. What do you do?', options: [
        { text: 'Keep the secret no matter what', value: 'respect' },
        { text: 'Encourage them to seek help themselves', value: 'empathy' },
        { text: 'Tell a trusted adult if they\'re in danger', value: 'responsibility' },
        { text: 'Wait and observe before taking action', value: 'patience' }
      ]
    },
    {
      question: 'Your friend group is excluding someone new. How do you react?', options: [
        { text: 'Invite the new person to join you', value: 'empathy' },
        { text: 'Talk to your friends about being more inclusive', value: 'respect' },
        { text: 'Organize an activity that includes everyone', value: 'unity' },
        { text: 'Befriend them yourself even if others don\'t', value: 'honesty' }
      ]
    },
    {
      question: 'You\'re assigned to work with someone you don\'t get along with. What\'s your approach?', options: [
        { text: 'Put differences aside and focus on the task', value: 'responsibility' },
        { text: 'Try to understand their perspective better', value: 'empathy' },
        { text: 'Suggest clear roles to minimize conflict', value: 'problem-solving' },
        { text: 'Be polite and professional throughout', value: 'respect' }
      ]
    },
    {
      question: 'You see someone struggling with something you\'re good at. What do you do?', options: [
        { text: 'Offer to help them learn', value: 'empathy' },
        { text: 'Share tips and resources', value: 'connection' },
        { text: 'Show them step-by-step how to do it', value: 'problem-solving' },
        { text: 'Encourage them to keep trying', value: 'optimism' }
      ]
    },
    {
      question: 'Your values conflict with what your friends are doing. How do you respond?', options: [
        { text: 'Speak up about your concerns', value: 'honesty' },
        { text: 'Politely decline to participate', value: 'respect' },
        { text: 'Suggest an alternative everyone can agree on', value: 'unity' },
        { text: 'Do what feels right for you', value: 'responsibility' }
      ]
    },
    {
      question: 'Someone is spreading rumors about you. What\'s your reaction?', options: [
        { text: 'Confront them calmly and ask why', value: 'directness' },
        { text: 'Try to understand what might have upset them', value: 'empathy' },
        { text: 'Ignore it and focus on being yourself', value: 'patience' },
        { text: 'Address it with facts to set the record straight', value: 'honesty' }
      ]
    },
    {
      question: 'A classmate asks to copy your homework. What do you do?', options: [
        { text: 'Refuse politely and explain why it\'s not right', value: 'honesty' },
        { text: 'Offer to help them understand the material instead', value: 'empathy' },
        { text: 'Report them to the teacher', value: 'responsibility' },
        { text: 'Let them copy to maintain the friendship', value: 'conflict' }
      ]
    },
    {
      question: 'You notice a friend is being left out of group activities. What\'s your move?', options: [
        { text: 'Make sure to include them in your plans', value: 'empathy' },
        { text: 'Ask others to be more considerate', value: 'respect' },
        { text: 'Create new activities that welcome everyone', value: 'unity' },
        { text: 'Spend one-on-one time with them', value: 'connection' }
      ]
    },
    {
      question: 'Your teacher makes a mistake in grading that benefits you. What do you do?', options: [
        { text: 'Point out the error immediately', value: 'honesty' },
        { text: 'Consider if others were affected before deciding', value: 'empathy' },
        { text: 'Accept it since it wasn\'t your mistake', value: 'patience' },
        { text: 'Tell the teacher privately after class', value: 'respect' }
      ]
    },
    {
      question: 'Two of your friends are in a conflict and both want your support. How do you handle it?', options: [
        { text: 'Listen to both sides without taking a position', value: 'empathy' },
        { text: 'Help them communicate and resolve it together', value: 'unity' },
        { text: 'Be honest about what you think is fair', value: 'honesty' },
        { text: 'Encourage them to work it out themselves', value: 'patience' }
      ]
    },
    {
      question: 'You\'re chosen as team captain. What\'s your leadership style?', options: [
        { text: 'Make sure everyone\'s voice is heard', value: 'respect' },
        { text: 'Assign roles based on people\'s strengths', value: 'problem-solving' },
        { text: 'Build team spirit and motivation', value: 'unity' },
        { text: 'Lead by example and work hard yourself', value: 'responsibility' }
      ]
    },
    {
      question: 'Someone criticizes your work in front of others. How do you respond?', options: [
        { text: 'Thank them and ask for specific feedback', value: 'respect' },
        { text: 'Defend your work with clear explanations', value: 'directness' },
        { text: 'Consider their perspective and learn from it', value: 'empathy' },
        { text: 'Stay calm and address it privately later', value: 'patience' }
      ]
    },
    {
      question: 'You have to choose between attending a friend\'s event or studying for an important test. What guides your decision?', options: [
        { text: 'Prioritize your responsibilities and study', value: 'responsibility' },
        { text: 'Support your friend and manage study time later', value: 'empathy' },
        { text: 'Try to do both by managing time carefully', value: 'problem-solving' },
        { text: 'Be honest with your friend about your situation', value: 'honesty' }
      ]
    },
    {
      question: 'You see someone littering in your school. What\'s your response?', options: [
        { text: 'Politely ask them to pick it up', value: 'directness' },
        { text: 'Pick it up yourself and set an example', value: 'responsibility' },
        { text: 'Explain why keeping the school clean matters', value: 'respect' },
        { text: 'Report it to school authorities', value: 'honesty' }
      ]
    },
    {
      question: 'A new student seems lonely and sits alone at lunch. What do you do?', options: [
        { text: 'Invite them to sit with you and your friends', value: 'empathy' },
        { text: 'Introduce them to people with similar interests', value: 'connection' },
        { text: 'Organize a welcome activity for new students', value: 'unity' },
        { text: 'Make an effort to talk to them regularly', value: 'respect' }
      ]
    }
  ]

  // State for selected questions
  const [selectedQuestions, setSelectedQuestions] = useState<typeof allQuestions>([])
  const [selectedScenarios, setSelectedScenarios] = useState<typeof allScenarios>([])

  // Function to randomly select 3 questions
  const selectRandomQuestions = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  // Function to randomly select 2 scenarios
  const selectRandomScenarios = () => {
    const shuffled = [...allScenarios].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 2)
  }

  // Initialize questions when quiz starts
  useEffect(() => {
    if (activeQuiz === 0 && selectedQuestions.length === 0) {
      setSelectedQuestions(selectRandomQuestions())
    }
  }, [activeQuiz])

  // Initialize scenarios when modal opens
  useEffect(() => {
    if (activeModal === 'scenarios' && selectedScenarios.length === 0) {
      setSelectedScenarios(selectRandomScenarios())
    }
  }, [activeModal])

  const quizzes = [{
    title: 'My Inner Compass',
    description: 'Discover your core values and how they guide your decisions',
    questions: selectedQuestions
  }]

  const handleQuizAnswer = (value: string) => {
    setSelectedAnswer(value)
    const newResults = { ...quizResults, [currentQuestion]: value }
    setQuizResults(newResults)

    // Auto-advance to next question or show results
    setTimeout(() => {
      if (currentQuestion < quizzes[0].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(newResults[currentQuestion + 1] || null)
      } else {
        setShowResults(true)
      }
    }, 300)
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(quizResults[currentQuestion - 1] || null)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setQuizResults({})
    setShowResults(false)
    setActiveQuiz(0)
    setSelectedQuestions(selectRandomQuestions()) // Select new random questions
  }

  const analyzeResults = () => {
    const values = Object.values(quizResults)
    const valueCounts = values.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const dominantValue = Object.keys(valueCounts).reduce((a, b) => valueCounts[a] > valueCounts[b] ? a : b)

    const valueProfiles = {
      empathy: {
        title: 'The Empathetic Connector',
        description: 'You naturally understand and share the feelings of others. Your ability to connect emotionally makes you a trusted friend and a compassionate leader.',
        strengths: ['Active listening', 'Emotional intelligence', 'Building deep relationships', 'Understanding different perspectives'],
        improvements: [
          'Set healthy boundaries to avoid emotional burnout',
          'Balance empathy with practical problem-solving',
          'Practice self-care to maintain your emotional energy',
          'Learn to say no when needed without feeling guilty'
        ]
      },
      respect: {
        title: 'The Respectful Diplomat',
        description: 'You believe in treating everyone with dignity and honoring diverse viewpoints. Your respectful nature creates harmony and mutual understanding.',
        strengths: ['Diplomatic communication', 'Valuing diversity', 'Creating inclusive environments', 'Maintaining composure'],
        improvements: [
          'Speak up more assertively when your values are challenged',
          'Balance respect for others with standing firm on important issues',
          'Don\'t let politeness prevent you from addressing problems',
          'Practice giving constructive feedback respectfully'
        ]
      },
      unity: {
        title: 'The Harmony Builder',
        description: 'You excel at bringing people together and finding common ground. Your collaborative spirit helps create peaceful, productive environments.',
        strengths: ['Conflict resolution', 'Team building', 'Finding compromise', 'Creating consensus'],
        improvements: [
          'Recognize when compromise isn\'t the best solution',
          'Don\'t sacrifice important principles just to keep peace',
          'Learn to embrace healthy conflict that leads to growth',
          'Stand firm on critical issues even if it creates tension'
        ]
      },
      honesty: {
        title: 'The Truthful Guardian',
        description: 'You are committed to truthfulness and transparency in all situations. Your integrity makes you a reliable and trustworthy person.',
        strengths: ['Building trust', 'Maintaining integrity', 'Clear communication', 'Ethical decision-making'],
        improvements: [
          'Balance honesty with kindness and tact',
          'Consider the timing and context of sharing truth',
          'Develop skills in delivering difficult messages compassionately',
          'Understand that some situations require discretion'
        ]
      },
      responsibility: {
        title: 'The Accountable Leader',
        description: 'You take ownership of your actions and their consequences. Your sense of duty and reliability makes you someone others can depend on.',
        strengths: ['Dependability', 'Following through on commitments', 'Accepting accountability', 'Leading by example'],
        improvements: [
          'Delegate tasks instead of taking on everything yourself',
          'Learn to share responsibility with others',
          'Don\'t be too hard on yourself when things go wrong',
          'Balance responsibility with self-compassion'
        ]
      },
      directness: {
        title: 'The Straightforward Communicator',
        description: 'You value clear, direct communication and getting to the point. Your straightforward approach can be refreshing and efficient.',
        strengths: ['Clear communication', 'Efficiency', 'Cutting through confusion', 'Being authentic'],
        improvements: [
          'Develop more empathy in your communication style',
          'Consider how your directness might affect others emotionally',
          'Practice active listening before responding',
          'Balance honesty with kindness and tact'
        ]
      },
      connection: {
        title: 'The Relational Bridge',
        description: 'You build strong bonds by sharing experiences and creating meaningful connections. Your ability to relate to others strengthens communities.',
        strengths: ['Building relationships', 'Sharing experiences', 'Creating support networks', 'Fostering belonging'],
        improvements: [
          'Ensure you\'re also listening, not just sharing your experiences',
          'Recognize when others need different types of support',
          'Develop skills in offering practical help alongside emotional support',
          'Balance sharing with asking questions'
        ]
      },
      'problem-solving': {
        title: 'The Practical Solver',
        description: 'You approach challenges with a solutions-focused mindset. Your practical nature helps turn problems into opportunities.',
        strengths: ['Analytical thinking', 'Finding solutions', 'Taking action', 'Staying focused on outcomes'],
        improvements: [
          'Remember that sometimes people need emotional support, not solutions',
          'Take time to understand feelings before jumping to fixes',
          'Balance logic with empathy',
          'Ask if someone wants advice before offering solutions'
        ]
      },
      optimism: {
        title: 'The Positive Motivator',
        description: 'You maintain a positive outlook and encourage others to see the bright side. Your optimism can be uplifting and inspiring.',
        strengths: ['Maintaining positive attitude', 'Motivating others', 'Resilience', 'Finding silver linings'],
        improvements: [
          'Validate others\' negative feelings before encouraging positivity',
          'Recognize that toxic positivity can dismiss real concerns',
          'Balance optimism with acknowledging real challenges',
          'Allow yourself and others to feel difficult emotions'
        ]
      },
      patience: {
        title: 'The Calm Observer',
        description: 'You understand the value of waiting and observing before acting. Your patience allows for thoughtful, measured responses.',
        strengths: ['Thoughtful decision-making', 'Staying calm under pressure', 'Avoiding hasty mistakes', 'Giving others time'],
        improvements: [
          'Recognize when action is needed rather than waiting',
          'Don\'t let patience become procrastination',
          'Practice being more proactive in important situations',
          'Balance patience with timely decision-making'
        ]
      },
      conflict: {
        title: 'The Developing Conscience',
        description: 'You\'re aware of the gap between your actions and your values. This awareness is the first step toward positive change.',
        strengths: ['Self-awareness', 'Recognizing internal conflicts', 'Honesty about struggles', 'Potential for growth'],
        improvements: [
          'Align your actions more closely with your values',
          'Seek support from trusted friends or mentors',
          'Practice making small ethical choices to build confidence',
          'Reflect on what\'s preventing you from acting on your values'
        ]
      }
    }

    const profile = valueProfiles[dominantValue as keyof typeof valueProfiles] || {
      title: 'The Balanced Individual',
      description: 'You have a well-rounded approach to values, drawing from multiple perspectives.',
      strengths: ['Flexibility', 'Adaptability', 'Balanced perspective', 'Versatility'],
      improvements: [
        'Identify which values matter most to you in different situations',
        'Develop consistency in your core principles',
        'Practice articulating your values clearly',
        'Strengthen your most important values through intentional practice'
      ]
    }

    return { dominantValue, ...profile }
  }

  const closeModal = () => {
    setActiveModal(null)
    resetQuiz()
    setSelectedScenarioOption(null)
    setActiveScenarioIndex(0)
    setSelectedScenarios([]) // Clear selected scenarios so new ones are picked next time
  }

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-4" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            <span className="text-blue-600">Put Values</span>{" "}
            <span className="text-slate-800">into Action</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-wellness-deep-blue max-w-3xl mx-auto">
            Practice making decisions based on your values through interactive quizzes and real-world scenarios
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* My Inner Compass Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 pt-20 border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-start h-full"
            onClick={() => { setActiveModal('quiz'); setActiveQuiz(0) }}
            initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full h-48 mb-6 flex items-center justify-center overflow-hidden relative group">
              <img src="/Resource Images/8. values and citizenship education/compass.png" alt="Inner Compass" className="w-full h-full object-contain relative z-0" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">My Inner Compass</h3>
            <p className="text-slate-600 mb-6 leading-relaxed flex-grow">
              Discover what values guide your decision-making through this interactive quiz. Understand your core principles.
            </p>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
              Find My Compass
            </button>
          </motion.div>

          {/* What Would You Do? Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-start h-full"
            onClick={() => setActiveModal('scenarios')}
            initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-full h-60 mb-6 flex items-center justify-center overflow-hidden relative group">
              <img src="/Resource Images/8. values and citizenship education/whatdo.png" alt="What Would You Do" className="w-full h-full object-contain relative z-0" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">What Would You Do?</h3>
            <p className="text-slate-600 mb-6 leading-relaxed flex-grow">
              Practice making values-based choices in real-world school situations. See how different choices lead to different outcomes.
            </p>
            <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
              Make a Choice
            </button>
          </motion.div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {activeModal && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>

                {activeModal === 'quiz' && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">

                      <h3 className="text-2xl font-bold text-slate-800">My Inner Compass</h3>
                    </div>



                    {activeQuiz !== null && !showResults && selectedQuestions.length > 0 && (
                      <div>
                        <div className="mb-6">
                          <div className="text-sm text-slate-500 mb-4">
                            Question {currentQuestion + 1} of {quizzes[0].questions.length}
                          </div>
                        </div>

                        <h4 className="text-xl font-semibold text-slate-800 mb-6">{quizzes[0].questions[currentQuestion].question}</h4>
                        <div className="space-y-3 mb-8">
                          {quizzes[0].questions[currentQuestion].options.map((option, index) => (
                            <button key={index} onClick={() => handleQuizAnswer(option.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedAnswer === option.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                              }`}>
                              {option.text}
                            </button>
                          ))}
                        </div>

                        {currentQuestion > 0 && (
                          <div className="flex justify-start">
                            <button onClick={previousQuestion} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
                              ← Previous
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {showResults && (
                      <div className="py-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                          <h4 className="text-3xl font-bold text-slate-800 mb-4">{analyzeResults().title}</h4>
                          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">{analyzeResults().description}</p>
                        </div>

                        {/* Strengths Section */}
                        <div className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-100">
                          <div className="flex items-center space-x-2 mb-4">
                            <Star className="w-5 h-5 text-green-600" />
                            <h5 className="text-lg font-bold text-green-900">Your Strengths</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {analyzeResults().strengths.map((strength: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2 bg-white rounded-lg p-3 border border-green-100">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Improvements Section */}
                        <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
                          <div className="flex items-center space-x-2 mb-4">
                            <Target className="w-5 h-5 text-blue-600" />
                            <h5 className="text-lg font-bold text-blue-900">Ways to Grow</h5>
                          </div>
                          <div className="space-y-3">
                            {analyzeResults().improvements.map((improvement: string, index: number) => (
                              <div key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4 border border-blue-100">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{improvement}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center">
                          <button onClick={resetQuiz} className="flex items-center space-x-2 mx-auto text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                            <RotateCcw className="w-5 h-5" />
                            <span>Retake Assessment</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeModal === 'scenarios' && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">

                      <h3 className="text-xl font-bold text-slate-800">What Would You Do?</h3>
                    </div>

                    {/* Scenario Selection Logic */}
                    {selectedScenarios.length > 0 && (() => {
                      const scenarios = selectedScenarios
                      const scenario = scenarios[activeScenarioIndex]

                      // Check if we are in "Result View" (selectedScenarioOption !== null)
                      if (selectedScenarioOption !== null) {
                        const selectedOption = scenario.options[selectedScenarioOption]
                        const bestOption = scenario.options.find(o => o.isBest)

                        return (
                          <div className="py-6 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${selectedOption.isBest ? 'bg-green-100' : 'bg-amber-100'}`}>
                              {selectedOption.isBest ? <CheckCircle className="w-10 h-10 text-green-600" /> : <Lightbulb className="w-10 h-10 text-amber-600" />}
                            </div>

                            <h4 className="text-2xl font-bold text-slate-800 mb-2">
                              {selectedOption.isBest ? 'Excellent Choice!' : 'Good thought, but there\'s a better way.'}
                            </h4>
                            <p className="text-slate-600 mb-8 text-lg">{selectedOption.outcome}</p>

                            <div className="bg-blue-50 rounded-xl p-6 text-left border border-blue-100 mb-8">
                              <div className="flex items-center space-x-2 mb-3">
                                <Star className="w-5 h-5 text-blue-600" />
                                <h5 className="font-bold text-blue-900">Why "{bestOption?.text}" is the best choice:</h5>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{bestOption?.reason}</p>
                            </div>

                            <button
                              onClick={() => {
                                if (activeScenarioIndex === scenarios.length - 1) {
                                  closeModal()
                                } else {
                                  setSelectedScenarioOption(null)
                                  setActiveScenarioIndex((prevIndex) => prevIndex + 1)
                                }
                              }}
                              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                            >
                              {activeScenarioIndex === scenarios.length - 1 ? 'Finish Scenarios' : 'Next Scenario'}
                            </button>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-6">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h4 className="text-base font-bold text-slate-800 mb-2">Scenario {activeScenarioIndex + 1}: {scenario.title}</h4>
                            <p className="text-sm text-slate-600 mb-3">{scenario.description}</p>
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                              <p className="font-semibold text-slate-800 mb-1 text-sm">Question:</p>
                              <p className="text-slate-600 text-sm">{scenario.question}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {scenario.options.map((option, index) => (
                              <motion.div
                                key={index}
                                onClick={() => setSelectedScenarioOption(index)}
                                className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-blue-300 hover:bg-slate-50"
                                whileHover={{ scale: 1.01 }}
                              >
                                <h5 className="font-semibold text-slate-800 text-sm">{option.text}</h5>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// When to Ask for Help Section
const WhenToAskForHelpSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            <span className="text-blue-600">When to</span>{" "}
            <span className="text-slate-800">Ask for Help</span>
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img
            src="/Resource Images/1. Stress management images/buddycall.png"
            alt="Call for help"
            className="w-64 h-auto object-contain"
          />

          <div className="grid gap-6 w-full max-w-md">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Childline India</h3>
              <p className="text-slate-600 mb-4">24/7 helpline for children and teenagers</p>
              <a
                href="tel:1098"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Call: 1098
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-slate-800 mb-2">NIMHANS</h3>
              <p className="text-slate-600 mb-4">National Institute of Mental Health and Neurosciences</p>
              <a
                href="tel:08046110007"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Call: 080-46110007
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App