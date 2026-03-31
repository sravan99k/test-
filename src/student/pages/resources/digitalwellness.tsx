import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Monitor, Smartphone, Clock, Moon, Shield, BarChart3, MessageCircle, Bell, X, Volume2, Moon as MoonIcon, Heart as HeartIcon, Users, Gamepad2, Music, Target, CheckCircle, ArrowLeft, Scale } from 'lucide-react'

// ==================== CSS STYLES ====================
const styles = `
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #2E5A87;
  background-color: #FAF9F6;
}

/* Custom slider styles */
.slider {
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #E8F4FD, #4A90E2);
  outline: none;
  border-radius: 8px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #7FB069;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(127, 176, 105, 0.3);
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(127, 176, 105, 0.4);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #7FB069;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(127, 176, 105, 0.3);
  transition: all 0.3s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(127, 176, 105, 0.4);
}

/* Smooth scrolling for sections */
section {
  scroll-margin-top: 80px;
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Responsive typography */
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
    line-height: 1.2;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1.25rem;
  }
  
  h3 {
    font-size: 1.5rem;
  }

  .section-container {
    padding: 32px 16px;
  }

  .section-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin-bottom: 1.5rem;
  }

  .help-card {
    padding: 1.25rem;
    min-width: unset;
  }

  .help-layout {
    flex-direction: column;
    gap: 16px;
  }

  .help-cards {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
    line-height: 1.15;
  }

  h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.25rem;
  }

  .section-container {
    padding: 24px 12px;
  }

  .section-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 1.25rem;
  }

  .help-card {
    padding: 1rem;
  }

  .help-card h3 {
    font-size: 1.1rem;
  }

  .help-card p {
    font-size: 0.9rem;
  }

  .help-phone {
    padding: 6px 14px;
    font-size: 0.9rem;
  }

  .help-layout {
    gap: 12px;
  }
}

@media (max-width: 360px) {
  h1 {
    font-size: 1.75rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.15rem;
  }

  .section-container {
    padding: 20px 8px;
  }

  .help-card {
    padding: 0.85rem;
  }
}

/* Landscape mobile optimization */
@media (max-width: 768px) and (orientation: landscape) {
  .section-container {
    padding: 24px 16px;
  }

  h1 {
    font-size: 2.25rem;
  }

  h2 {
    font-size: 1.85rem;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  button,
  .help-phone,
  input[type="range"] {
    min-height: 44px;
    min-width: 44px;
  }

  button {
    touch-action: manipulation;
  }

  .slider::-webkit-slider-thumb {
    width: 28px;
    height: 28px;
  }

  .slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
  }
}

/* Accessibility - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible {
  outline: 2px solid #7FB069;
  outline-offset: 2px;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #F5F7FA;
}

::-webkit-scrollbar-thumb {
  background: #A8D5BA;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #7FB069;
}

/* Wellness Color Classes */
.bg-wellness-warm-white { background-color: #FAF9F6; }
.bg-wellness-cream-white { background-color: #FEFDFB; }
.bg-wellness-gentle-gray { background-color: #F5F7FA; }
.bg-wellness-soft-gray { background-color: #E8F4FD; }
.bg-wellness-soft-blue { background-color: #E1F5FE; }
.bg-wellness-cool-blue { background-color: #4A90E2; }
.bg-wellness-calm-blue { background-color: #B3D9FF; }
.bg-wellness-deep-blue { background-color: #2E5A87; }
.bg-wellness-soft-green { background-color: #A8D5BA; }
.bg-wellness-mint-green { background-color: #81C784; }
.bg-wellness-fresh-green { background-color: #7FB069; }

.text-wellness-warm-white { color: #FAF9F6; }
.text-wellness-cream-white { color: #FEFDFB; }
.text-wellness-gentle-gray { color: #F5F7FA; }
.text-wellness-soft-gray { color: #E8F4FD; }
.text-wellness-soft-blue { color: #E1F5FE; }
.text-wellness-cool-blue { color: #4A90E2; }
.text-wellness-calm-blue { color: #B3D9FF; }
.text-wellness-deep-blue { color: #2E5A87; }
.text-wellness-soft-green { color: #A8D5BA; }
.text-wellness-mint-green { color: #81C784; }
.text-wellness-fresh-green { color: #7FB069; }

.border-wellness-gentle-gray { border-color: #F5F7FA; }
.border-wellness-soft-gray { border-color: #E8F4FD; }
.border-wellness-soft-blue { border-color: #E1F5FE; }
.border-wellness-cool-blue { border-color: #4A90E2; }
.border-wellness-mint-green { border-color: #81C784; }
.border-wellness-fresh-green { border-color: #7FB069; }

/* Help Section (cloned from StressManagementApp) */
.section-container { min-height: auto; display: flex; align-items: center; justify-content: center; position: relative; padding: 40px 20px; }
.section-content { max-width: 1200px; width: 100%; text-align: center; position: relative; z-index: 2; }
.section-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 2rem; }
.help-section { width: 100%; }
.help-layout { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; }
.help-cards { display: flex; gap: 24px; flex-wrap: wrap; }
.help-card { background: rgba(255,255,255,0.9); border-radius: 16px; padding: 1.5rem; min-width: 220px; flex: 1 0 220px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); margin-bottom: 16px; }
.help-card h3 { color: #374151; margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: 600; }
.help-card p { color: #64748b; font-size: 0.97rem; margin-bottom: 0.5rem; }
.help-phone { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 8px 16px; border-radius: 20px; font-weight: 500; margin: 0.5rem auto 0 auto; width: fit-content; transition: all 0.3s; }
.help-phone:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.22); }
@media (max-width: 900px) { .help-layout { flex-direction: column; gap: 18px; } .help-cards { flex-direction: column; gap: 12px; } }
@media (max-width: 600px) { .section-container { padding: 28px 6px; } .help-card { padding: 1rem; min-width: unset; } .help-layout { gap: 12px; } }
`

// ==================== SECTION COMPONENTS ====================

// Hero Section
const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-wellness-calm-blue via-wellness-warm-white to-wellness-mint-green relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating screen elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              rotate: 0
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              rotate: 360
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {i % 3 === 0 ? <Monitor size={32} className="text-wellness-cool-blue" /> :
              i % 3 === 1 ? <Smartphone size={28} className="text-wellness-soft-blue" /> :
                <Clock size={24} className="text-wellness-mint-green" />}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="absolute right-0 top-[8%] -translate-y-1/2 z-0 hidden lg:block pr-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="/Resource Images/6. digital wellness/12.webp"
          alt="Digital Wellness"
          className="w-[450px] h-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mr-auto ml-4 md:ml-20"
        >
          {/* Main Heading */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-wellness-deep-blue mb-1 leading-tight px-2 sm:px-0"
            style={{ whiteSpace: 'normal' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Feeling Glued to Your Screen?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-wellness-cool-blue mb-1 font-medium px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Can't remember the last time you looked away from your screen?
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-wellness-deep-blue mb-6 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Let's pause, breathe, and rediscover balance in your digital world.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            className="bg-wellness-fresh-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-h-[44px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const element = document.getElementById('why-it-matters')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            Find Digital Balance <Scale className="w-5 h-5 ml-2 mb-1 inline-block" />
          </motion.button>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-wellness-cool-blue"
            >

            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-wellness-warm-white/20 to-transparent pointer-events-none" />
    </section>
  )
}

// Why It Matters Section
const WhyItMattersSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} id="why-it-matters" className="bg-wellness-warm-white pt-12 sm:pt-16 md:pt-20 pb-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,360px)_minmax(0,1fr)] items-center gap-5 max-w-[1100px] mx-auto">
          {/* Left: Illustration */}
          <div className="text-center order-first md:order-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8 }}
              className="mx-auto relative"
            >
              <img
                src="/Resource Images/6. digital wellness/matters.png"
                alt="Digital Balance Illustration"
                className="w-48 sm:w-56 md:w-64 lg:w-80 xl:w-full max-w-[320px] h-auto rounded-3xl mx-auto"
              />
            </motion.div>
          </div>

          {/* Right: Text + Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wellness-deep-blue mb-4 sm:mb-6">
              Why Digital Habits Matter
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-wellness-cool-blue mb-6 sm:mb-8">
              Balanced screen time makes life feel less overwhelming and more manageable.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5 max-w-[720px]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-wellness-calm-blue/20 border border-wellness-cool-blue/30 rounded-2xl p-3 sm:p-4 shadow-sm"
              >
                <h3 className="text-base sm:text-lg font-semibold text-wellness-deep-blue mb-1 sm:mb-2">Less Digital Stress</h3>
                <p className="text-wellness-cool-blue text-xs sm:text-sm leading-relaxed">You reduce digital stress by setting boundaries instead of constant scrolling.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-wellness-mint-green/20 border border-wellness-fresh-green/30 rounded-2xl p-3 sm:p-4 shadow-sm"
              >
                <h3 className="text-base sm:text-lg font-semibold text-wellness-deep-blue mb-1 sm:mb-2">Sleep Better</h3>
                <p className="text-wellness-cool-blue text-xs sm:text-sm leading-relaxed">You sleep better because your brain rests without blue light exposure.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-wellness-soft-blue/20 border border-wellness-deep-blue/30 rounded-2xl p-3 sm:p-4 shadow-sm"
              >
                <h3 className="text-base sm:text-lg font-semibold text-wellness-deep-blue mb-1 sm:mb-2">Feel Present</h3>
                <p className="text-wellness-cool-blue text-xs sm:text-sm leading-relaxed">You feel confident being present in real moments without digital distractions.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-wellness-soft-green/20 border border-wellness-soft-green/30 rounded-2xl p-3 sm:p-4 shadow-sm"
              >
                <h3 className="text-base sm:text-lg font-semibold text-wellness-deep-blue mb-1 sm:mb-2">More Time for You</h3>
                <p className="text-wellness-cool-blue text-xs sm:text-sm leading-relaxed">You save time for hobbies, exercise, or connecting with friends face-to-face.</p>
              </motion.div>
            </div>
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-wellness-cool-blue mt-6 sm:mt-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              For example, taking regular screen breaks can help you recharge your mind and body,
              and a digital-free evening can make sleep come more naturally.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const MindfulHabitsSection = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const screenTimeGuidelines = [
    {
      icon: Clock,
      title: "Set clear daily limits",
      example: "Keep recreational screen time to 1–2 hours. For example, watch a 30‑minute show, then switch to reading or going outside.",
      benefit: "Frees time for other activities and reduces eye strain.",
      color: "text-wellness-cool-blue"
    },
    {
      icon: MoonIcon,
      title: "Create tech‑free times and spaces",
      example: "Keep devices away during meals, family time, and 30–60 minutes before bed.",
      benefit: "Supports real conversation and better sleep.",
      color: "text-wellness-fresh-green"
    },
    {
      icon: Bell,
      title: "Silence non‑essential notifications",
      example: "Mute group chats and game alerts during study hours; keep only important alerts on.",
      benefit: "Cuts distractions and keeps you in control.",
      color: "text-wellness-deep-blue"
    }
  ]

  const cyberSafety = [
    {
      icon: MessageCircle,
      title: "Spot cyberbullying early",
      example: "Look out for repeated mean messages, rumors, or exclusion. If it happens, tell a trusted adult.",
      benefit: "Helps you act quickly and stay safe.",
      color: "text-wellness-cool-blue"
    },
    {
      icon: Shield,
      title: "Use privacy controls",
      example: "Set accounts to private and avoid sharing personal details like your school or address.",
      benefit: "Protects personal information from strangers.",
      color: "text-wellness-fresh-green"
    },
    {
      icon: HeartIcon,
      title: "Practice positive online behavior",
      example: "Pause before posting, avoid arguments, and report harmful content instead of replying.",
      benefit: "Builds a respectful online community.",
      color: "text-wellness-deep-blue"
    }
  ]

  return (
    <section ref={ref} className="bg-gradient-to-br from-wellness-gentle-gray to-wellness-warm-white py-0 mt-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-wellness-deep-blue mb-6">
            Be Smart, Stay Safe
          </h2>
          <p className="text-xl text-wellness-cool-blue max-w-3xl mx-auto">
            Healthy tech habits protect your focus, safety, and peace of mind.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Screen Time Guidelines */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-6 text-center">
              Screen Time Guidelines
            </h3>
            <div className="space-y-4">
              {screenTimeGuidelines.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-wellness-warm-white hover:bg-wellness-soft-gray transition-colors duration-300 group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`p-3 rounded-lg bg-wellness-soft-gray group-hover:bg-wellness-mint-green transition-colors duration-300`}>
                    <item.icon size={22} className={item.color} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-wellness-deep-blue">{item.title}</p>
                    <p className="text-sm text-wellness-cool-blue mt-1"><span className="font-medium">Example:</span> {item.example}</p>
                    <p className="text-sm text-wellness-cool-blue mt-1"><span className="font-medium">Benefit:</span> {item.benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Cyber Safety */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-6 text-center">
                Cyber Safety
              </h3>
              <div className="space-y-4">
                {cyberSafety.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-wellness-warm-white hover:bg-wellness-soft-gray transition-colors duration-300 group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`p-3 rounded-lg bg-wellness-soft-gray group-hover:bg-wellness-mint-green transition-colors duration-300`}>
                      <item.icon size={22} className={item.color} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-wellness-deep-blue">{item.title}</p>
                      <p className="text-sm text-wellness-cool-blue mt-1"><span className="font-medium">Example:</span> {item.example}</p>
                      <p className="text-sm text-wellness-cool-blue mt-1"><span className="font-medium">Benefit:</span> {item.benefit}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="pt-6"
            >

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Digital Mindfulness Section
const DigitalMindfulnessSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeExperience, setActiveExperience] = useState<string | null>(null)

  const mindfulnessExperiences = [
    {
      id: 'habit-builder',
      title: "\"Day in the Life\" Simulator",
      concept: "A resource management game about balance, not perfection",
      mechanics: [
        'Manage Energy ⚡, Social 👥, and Focus 🧠 stats',
        "Make choices throughout your day",
        "Keep all bars from hitting 0 or 100 (burnout)",
        "See personalized feedback on your playstyle"
      ],
      image: "/Resource Images/6. digital wellness/daylife.png",
      emoji: "",
      accent: "from-wellness-soft-blue to-wellness-mint-green"
    },
    {
      id: 'mindful-break',
      title: "Breathe and Flow",
      concept: "A functional breathing and focus utility",
      mechanics: [
        'Breathing Mode: Animated circle guides your breath (4s in, 4s hold, 4s out)',
        'Focus Mode: Pomodoro timer (25:00) for productive work sessions',
        'Lofi Mode: Toggle calming visual waveform',
        'Simple, distraction-free interface'
      ],
      image: "/Resource Images/6. digital wellness/breathe.png",
      emoji: "🎯",
      accent: "from-wellness-soft-blue to-wellness-cream-white"
    },
    {
      id: 'cyber-tree',
      title: "Chat Smart",
      concept: "A realistic chat interface mimicking iMessage/WhatsApp",
      mechanics: [
        'Notification pops up from unknown sender',
        'Choose pre-written replies to handle the situation',
        'Branching scenarios based on your choices',
        'Learn safe vs unsafe responses in real-time'
      ],
      image: "/Resource Images/6. digital wellness/cyber.png",
      emoji: "💬",
      accent: "from-wellness-soft-gray to-wellness-soft-blue"
    },
    {
      id: 'self-assessment',
      title: "What's Your Vibe?",
      concept: "Discover your digital personality type",
      mechanics: [
        "5 rapid-fire slider questions",
        "Uncover your unique Digital Archetype",
        "Get a personalized 24h challenge",
        "Understand your relationship with tech"
      ],
      image: "/Resource Images/6. digital wellness/selfassess.png",
      emoji: "🎭",
      accent: "from-wellness-cream-white to-wellness-mint-green"
    }
  ]

  const selectedExperience = mindfulnessExperiences.find(experience => experience.id === activeExperience)

  // ===== "Day in the Life" Simulator =====
  const morningScenarios = [
    {
      time: "7:00 AM",
      title: "The Morning Alarm",
      prompt: "Your alarm goes off. What do you do?",
      options: [
        { label: "Snooze & Scroll", description: "Check social media in bed", effects: { energy: 0, social: 5, focus: -10 } },
        { label: "Jump up & Workout", description: "Get moving immediately", effects: { energy: -15, social: 0, focus: 15 } },
        { label: "Slow start & Breakfast", description: "Take your time, eat well", effects: { energy: 10, social: -5, focus: 10 } }
      ]
    },
    {
      time: "6:30 AM",
      title: "Morning Routine",
      prompt: "You have 30 minutes before school. How do you spend it?",
      options: [
        { label: "Watch videos while eating", description: "Multitask breakfast and entertainment", effects: { energy: 5, social: 0, focus: -10 } },
        { label: "Prepare mindfully", description: "Organize your day and pack carefully", effects: { energy: 5, social: 0, focus: 15 } },
        { label: "Chat with family", description: "Have breakfast together", effects: { energy: 5, social: 10, focus: 0 } }
      ]
    },
    {
      time: "7:30 AM",
      title: "Commute Time",
      prompt: "On your way to school. What's your focus?",
      options: [
        { label: "Scroll endlessly", description: "Check every app on your phone", effects: { energy: -5, social: 5, focus: -15 } },
        { label: "Listen to music", description: "Relax with your favorite playlist", effects: { energy: 5, social: 0, focus: 5 } },
        { label: "Review notes", description: "Prepare for the day ahead", effects: { energy: 0, social: -5, focus: 15 } }
      ]
    },
    {
      time: "8:00 AM",
      title: "Before First Class",
      prompt: "You arrive early. What do you do?",
      options: [
        { label: "Game on phone", description: "Quick gaming session", effects: { energy: -5, social: 0, focus: -10 } },
        { label: "Catch up with friends", description: "Chat before class starts", effects: { energy: 0, social: 15, focus: -5 } },
        { label: "Find a quiet spot", description: "Center yourself before class", effects: { energy: 5, social: -5, focus: 10 } }
      ]
    },
    {
      time: "7:15 AM",
      title: "Getting Ready",
      prompt: "You're getting dressed. Do you check your phone?",
      options: [
        { label: "Constant checking", description: "Phone in hand the whole time", effects: { energy: -5, social: 5, focus: -15 } },
        { label: "Quick glance", description: "Check notifications once", effects: { energy: 0, social: 5, focus: -5 } },
        { label: "Phone stays away", description: "Focus on getting ready", effects: { energy: 5, social: 0, focus: 10 } }
      ]
    }
  ]

  const middayScenarios = [
    {
      time: "Study Hall",
      title: "The Group Chat Blows Up",
      prompt: "Your friends are messaging non-stop. What do you do?",
      options: [
        { label: "Ignore it completely", description: "Focus on your work", effects: { energy: 0, social: -15, focus: 20 } },
        { label: "Reply to everything", description: "Stay in the conversation", effects: { energy: -5, social: 20, focus: -20 } },
        { label: "Mute & check breaks", description: "Check during breaks only", effects: { energy: 0, social: -5, focus: 10 } }
      ]
    },
    {
      time: "12:30 PM",
      title: "Lunch Break",
      prompt: "Lunch time! How do you spend it?",
      options: [
        { label: "Eat while scrolling", description: "Lunch and social media", effects: { energy: 5, social: 5, focus: -15 } },
        { label: "Sit with friends", description: "No phones, just conversation", effects: { energy: 10, social: 20, focus: 0 } },
        { label: "Eat and review", description: "Catch up on homework", effects: { energy: 5, social: -10, focus: 15 } }
      ]
    },
    {
      time: "2:00 PM",
      title: "Free Period",
      prompt: "You have a free period. What's your move?",
      options: [
        { label: "Social media dive", description: "Catch up on everything online", effects: { energy: -10, social: 10, focus: -15 } },
        { label: "Library study session", description: "Get ahead on assignments", effects: { energy: -5, social: -5, focus: 20 } },
        { label: "Walk and talk", description: "Stroll with friends", effects: { energy: 5, social: 15, focus: -5 } }
      ]
    },
    {
      time: "3:30 PM",
      title: "After School",
      prompt: "School's out! What's your first move?",
      options: [
        { label: "Phone binge", description: "Check everything you missed", effects: { energy: -10, social: 10, focus: -20 } },
        { label: "Extracurricular activity", description: "Sports, club, or hobby", effects: { energy: -10, social: 15, focus: 10 } },
        { label: "Decompress alone", description: "Take a quiet moment", effects: { energy: 10, social: -10, focus: 5 } }
      ]
    },
    {
      time: "1:00 PM",
      title: "Afternoon Slump",
      prompt: "You're feeling tired. How do you recharge?",
      options: [
        { label: "Endless scrolling", description: "Zone out on your phone", effects: { energy: -10, social: 0, focus: -15 } },
        { label: "Quick power nap", description: "15-minute rest", effects: { energy: 15, social: -5, focus: 5 } },
        { label: "Active break", description: "Stretch or walk outside", effects: { energy: 10, social: 5, focus: 10 } }
      ]
    }
  ]

  const eveningScenarios = [
    {
      time: "10:00 PM",
      title: "Late Night Gaming",
      prompt: "Your friends want to game. It's getting late...",
      options: [
        { label: "Play until 2 AM", description: "Just one more round...", effects: { energy: -25, social: 15, focus: -15 } },
        { label: "Sleep immediately", description: "Prioritize rest", effects: { energy: 20, social: -10, focus: 5 } },
        { label: "One hour limit", description: "Set a timer and stick to it", effects: { energy: -5, social: 10, focus: 0 } }
      ]
    },
    {
      time: "8:00 PM",
      title: "Evening Homework",
      prompt: "Time to do homework. What's your approach?",
      options: [
        { label: "TV in background", description: "Work with distractions", effects: { energy: -5, social: 0, focus: -20 } },
        { label: "Focused work session", description: "Phone away, full concentration", effects: { energy: -10, social: -10, focus: 25 } },
        { label: "Study group online", description: "Video call with classmates", effects: { energy: -5, social: 15, focus: 5 } }
      ]
    },
    {
      time: "9:00 PM",
      title: "Wind Down Time",
      prompt: "Getting ready for bed. What's your routine?",
      options: [
        { label: "Screen until sleepy", description: "Scroll until you can't keep eyes open", effects: { energy: -15, social: 5, focus: -20 } },
        { label: "Read a book", description: "Paper book, no screens", effects: { energy: 10, social: -5, focus: 10 } },
        { label: "Light stretching", description: "Gentle movement and breathing", effects: { energy: 15, social: 0, focus: 5 } }
      ]
    },
    {
      time: "7:00 PM",
      title: "Dinner Time",
      prompt: "Family dinner is ready. Where's your phone?",
      options: [
        { label: "On the table", description: "Check it between bites", effects: { energy: 0, social: -15, focus: -10 } },
        { label: "In another room", description: "Full presence with family", effects: { energy: 5, social: 20, focus: 5 } },
        { label: "Quick checks", description: "Glance occasionally", effects: { energy: 0, social: 5, focus: -5 } }
      ]
    },
    {
      time: "11:00 PM",
      title: "Can't Sleep",
      prompt: "You're still awake. What do you do?",
      options: [
        { label: "Scroll social media", description: "Maybe that will help...", effects: { energy: -20, social: 5, focus: -15 } },
        { label: "Breathing exercises", description: "Calm your mind naturally", effects: { energy: 15, social: 0, focus: 10 } },
        { label: "Listen to podcast", description: "Something relaxing", effects: { energy: 5, social: 0, focus: 0 } }
      ]
    }
  ]

  // Select random scenarios on component mount
  const [selectedScenarios, setSelectedScenarios] = useState<typeof morningScenarios>(() => {
    const randomMorning = morningScenarios[Math.floor(Math.random() * morningScenarios.length)]
    const randomMidday = middayScenarios[Math.floor(Math.random() * middayScenarios.length)]
    const randomEvening = eveningScenarios[Math.floor(Math.random() * eveningScenarios.length)]
    return [randomMorning, randomMidday, randomEvening]
  })

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [energy, setEnergy] = useState(50)
  const [social, setSocial] = useState(50)
  const [focus, setFocus] = useState(50)
  const [choiceHistory, setChoiceHistory] = useState<Array<{ scenario: string, choice: string }>>([])
  const [showResult, setShowResult] = useState(false)

  const handleLifeChoice = (optionIndex: number) => {
    const currentScenario = selectedScenarios[scenarioIndex]
    const selectedOption = currentScenario.options[optionIndex]

    // Update stats
    setEnergy(prev => Math.max(0, Math.min(100, prev + selectedOption.effects.energy)))
    setSocial(prev => Math.max(0, Math.min(100, prev + selectedOption.effects.social)))
    setFocus(prev => Math.max(0, Math.min(100, prev + selectedOption.effects.focus)))

    // Log choice
    setChoiceHistory(prev => [...prev, {
      scenario: currentScenario.title,
      choice: selectedOption.label
    }])

    // Move to next scenario or show results
    if (scenarioIndex < selectedScenarios.length - 1) {
      setScenarioIndex(prev => prev + 1)
    } else {
      setShowResult(true)
    }
  }

  const resetLifeSimulator = () => {
    // Select new random scenarios
    const randomMorning = morningScenarios[Math.floor(Math.random() * morningScenarios.length)]
    const randomMidday = middayScenarios[Math.floor(Math.random() * middayScenarios.length)]
    const randomEvening = eveningScenarios[Math.floor(Math.random() * eveningScenarios.length)]
    setSelectedScenarios([randomMorning, randomMidday, randomEvening])

    setScenarioIndex(0)
    setEnergy(50)
    setSocial(50)
    setFocus(50)
    setChoiceHistory([])
    setShowResult(false)
  }

  const getPlaystyleFeedback = () => {
    const avgEnergy = energy
    const avgSocial = social
    const avgFocus = focus

    if (avgSocial > 70 && (avgEnergy < 30 || avgFocus < 30)) {
      return "You're a Social Butterfly, but you're burning out! Remember to balance fun with rest and focus."
    } else if (avgFocus > 70 && avgSocial < 30) {
      return "You're a Productivity Machine, but don't forget to connect with friends! Balance is key."
    } else if (avgEnergy > 70 && avgSocial < 40 && avgFocus < 40) {
      return "You're well-rested but isolated. Try engaging more with others and your work."
    } else if (avgEnergy < 30) {
      return "You're running on empty! Prioritize sleep and self-care to avoid burnout."
    } else if (Math.abs(avgEnergy - 50) < 20 && Math.abs(avgSocial - 50) < 20 && Math.abs(avgFocus - 50) < 20) {
      return "Great balance! You're managing your energy, social life, and focus well."
    } else {
      return "You're finding your rhythm. Keep experimenting to find what works best for you!"
    }
  }

  const getImprovementTips = () => {
    const tips = []

    if (energy < 40) {
      tips.push("Prioritize sleep: Set a consistent bedtime and avoid screens 30-60 minutes before sleep.")
      tips.push("Take breaks: Step away from screens every hour to recharge.")
    }

    if (social < 40) {
      tips.push("Connect in person: Schedule face-to-face time with friends, even if it's just a quick chat.")
      tips.push("Balance online and offline: Use tech to coordinate meetups, not replace them.")
    }

    if (focus < 40) {
      tips.push("Minimize distractions: Turn off non-essential notifications during study or work time.")
      tips.push("Use the Pomodoro technique: Work in focused 25-minute blocks with short breaks.")
    }

    if (energy > 60 && social > 60 && focus > 60) {
      tips.push("Keep up the great work! You're maintaining excellent balance.")
      tips.push("Share your strategies: Help friends find their balance too.")
    }

    if (tips.length === 0) {
      tips.push("Try setting small, achievable goals for each area of your life.")
      tips.push("Reflect daily: Spend 5 minutes thinking about what worked and what didn't.")
    }

    return tips
  }

  // ===== Focus Zone Tool (Breathing Mode) =====
  // Breathing mode state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breathingCycle, setBreathingCycle] = useState(0)

  // Breathing animation cycle
  useEffect(() => {
    const cycleTime = 12000 // 12 seconds total (4s inhale, 4s hold, 4s exhale)
    const interval = setInterval(() => {
      setBreathingCycle(prev => (prev + 1) % 3)
    }, cycleTime / 3)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const phases: Array<'inhale' | 'hold' | 'exhale'> = ['inhale', 'hold', 'exhale']
    setBreathingPhase(phases[breathingCycle])
  }, [breathingCycle])

  // ===== Chat Safety Simulator =====
  const chatScenarios = [
    {
      notification: "Hey, I go to your school...",
      firstMessage: "Hey, I go to your school...",
      secondMessage: "Can you send me a pic? I think I know you",
      firstReplies: [
        { text: "Who is this?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "Sure, here you go", isSafe: false },
        { text: "No, I don't send pics to strangers", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "Wanna be friends? I saw your profile",
      firstMessage: "Wanna be friends? I saw your profile",
      secondMessage: "What's your address? We should hang out",
      firstReplies: [
        { text: "Sure! Where did you see me?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "I live at [address]", isSafe: false },
        { text: "I don't share my address online", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "Click this link for free stuff!",
      firstMessage: "Click this link for free stuff! Limited time only",
      secondMessage: "Just need your email and password to verify",
      firstReplies: [
        { text: "What kind of free stuff?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "OK, here's my info", isSafe: false },
        { text: "This seems like a scam", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "I'm from your class, remember me?",
      firstMessage: "I'm from your class, remember me?",
      secondMessage: "Send me your number so we can chat more",
      firstReplies: [
        { text: "Which class?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "Sure, it's [number]", isSafe: false },
        { text: "I don't give my number to people I don't know", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "You won a prize! Claim it now",
      firstMessage: "You won a prize! Claim it now",
      secondMessage: "Just share your parent's credit card to verify age",
      firstReplies: [
        { text: "What did I win?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "Let me get the card", isSafe: false },
        { text: "This is definitely a scam", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "Hey cutie, saw you at the mall",
      firstMessage: "Hey cutie, saw you at the mall yesterday",
      secondMessage: "Where do you live? I want to meet up",
      firstReplies: [
        { text: "I don't remember seeing you", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "I live near [location]", isSafe: false },
        { text: "I'm not comfortable sharing that", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "Your account will be deleted!",
      firstMessage: "Your account will be deleted unless you verify now",
      secondMessage: "Send your password to keep your account active",
      firstReplies: [
        { text: "How do I verify?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "OK, my password is...", isSafe: false },
        { text: "Real companies never ask for passwords", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "I know your secret...",
      firstMessage: "I know your secret... we need to talk",
      secondMessage: "Send me money or I'll tell everyone",
      firstReplies: [
        { text: "What secret?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "How much do you want?", isSafe: false },
        { text: "This is blackmail. I'm telling an adult", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "Join my group chat!",
      firstMessage: "Join my exclusive group chat! Only cool people",
      secondMessage: "First, send a photo of yourself to prove you're real",
      firstReplies: [
        { text: "What's the group about?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "Sure, here's my photo", isSafe: false },
        { text: "I don't send photos to strangers", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    },
    {
      notification: "Your friend gave me your number",
      firstMessage: "Your friend gave me your number, said you're cool",
      secondMessage: "What school do you go to? Let's meet after class",
      firstReplies: [
        { text: "Which friend?", isSafe: false },
        { text: "Block", isSafe: true }
      ],
      secondReplies: [
        { text: "I go to [school name]", isSafe: false },
        { text: "I don't share that information", isSafe: true },
        { text: "Block", isSafe: true }
      ]
    }
  ]

  const [selectedScenario, setSelectedScenario] = useState(() =>
    chatScenarios[Math.floor(Math.random() * chatScenarios.length)]
  )
  const [chatStep, setChatStep] = useState<'notification' | 'chat' | 'result'>('notification')
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'them' | 'you', text: string }>>([])
  const [chatResult, setChatResult] = useState<'safe' | 'unsafe' | null>(null)

  const startChat = () => {
    setChatStep('chat')
    setChatMessages([
      { sender: 'them', text: selectedScenario.firstMessage }
    ])
  }

  const handleChatReply = (reply: string, isSafe: boolean) => {
    // Add user's reply
    setChatMessages(prev => [...prev, { sender: 'you', text: reply }])

    if (reply === 'Block') {
      // Win scenario - always safe
      setChatResult('safe')
      setChatStep('result')
    } else if (chatMessages.length === 1) {
      // First reply - check if it continues conversation or ends it
      if (isSafe) {
        // Safe choice that ends conversation
        setChatResult('safe')
        setChatStep('result')
      } else {
        // Continues conversation - stranger asks for something
        setTimeout(() => {
          setChatMessages(prev => [...prev, { sender: 'them', text: selectedScenario.secondMessage }])
        }, 1000)
      }
    } else if (chatMessages.length === 3) {
      // Second reply - determine outcome
      if (isSafe) {
        setChatResult('safe')
        setChatStep('result')
      } else {
        setChatResult('unsafe')
        setChatStep('result')
      }
    }
  }

  const resetChat = () => {
    // Select a new random scenario
    setSelectedScenario(chatScenarios[Math.floor(Math.random() * chatScenarios.length)])
    setChatStep('notification')
    setChatMessages([])
    setChatResult(null)
  }

  // ===== Digital Archetype Quiz =====
  const archetypeQuestions = [
    {
      id: 'check_frequency',
      prompt: "How often do you check your phone?",
      leftLabel: "Rarely",
      rightLabel: "Constantly"
    },
    {
      id: 'signal_anxiety',
      prompt: "How do you feel when you have no signal?",
      leftLabel: "Relieved",
      rightLabel: "Panicked"
    },
    {
      id: 'multitasking',
      prompt: "Do you multitask with screens?",
      leftLabel: "Never",
      rightLabel: "Always"
    },
    {
      id: 'night_scrolling',
      prompt: "How late do you scroll at night?",
      leftLabel: "Never",
      rightLabel: "Until 3am"
    },
    {
      id: 'response_time',
      prompt: "Do you respond to messages instantly?",
      leftLabel: "Whenever",
      rightLabel: "Immediately"
    }
  ]

  const [archetypeScores, setArchetypeScores] = useState<number[]>([50, 50, 50, 50, 50])
  const [showArchetypeResult, setShowArchetypeResult] = useState(false)

  const archetypes = [
    {
      name: "The Zen Master",
      range: [0, 150],
      description: "You have incredible digital balance. You control your tech; it doesn't control you.",
      tips: [
        "Share your healthy habits with friends",
        "Try a full day completely offline",
        "Mentor someone struggling with screen time"
      ],
      emoji: "🧘‍♂️"
    },
    {
      name: "The Casual Browser",
      range: [151, 300],
      description: "You're generally healthy but have occasional slip-ups. You know when to disconnect.",
      tips: [
        "Set a 'no phone' rule for the first hour of your day",
        "Charge your phone outside your bedroom",
        "Use app timers to track your usage"
      ],
      emoji: "🙂"
    },
    {
      name: "The Notification Ninja",
      range: [301, 400],
      description: "You're highly responsive and often distracted. FOMO drives your digital habits.",
      tips: [
        "Turn off non-essential notifications",
        "Schedule specific times to check messages",
        "Practice 'Do Not Disturb' mode during homework"
      ],
      emoji: "🥷"
    },
    {
      name: "The Doomscroller",
      range: [401, 500],
      description: "You often get stuck in endless loops of content. Your screen time is high.",
      tips: [
        "Set strict screen time limits for social apps",
        "Find an offline hobby to replace scrolling",
        "Delete the apps that distract you the most"
      ],
      emoji: "🧟"
    }
  ]

  const calculateArchetype = () => {
    const totalScore = archetypeScores.reduce((a, b) => a + b, 0)
    return archetypes.find(a => totalScore >= a.range[0] && totalScore <= a.range[1]) || archetypes[3]
  }

  const handleArchetypeChange = (index: number, value: number) => {
    setArchetypeScores(prev => {
      const newScores = [...prev]
      newScores[index] = value
      return newScores
    })
  }

  const renderExperienceLab = (experienceId: string) => {
    switch (experienceId) {
      case 'habit-builder': {
        const currentScenario = selectedScenarios[scenarioIndex]

        if (showResult) {
          return (
            <div className="space-y-6">
              {/* Results Screen */}
              <div className="text-center">

                <p className="text-wellness-cool-blue mb-6">Here's how you did:</p>
              </div>

              {/* Playstyle Feedback */}
              <div className="bg-wellness-mint-green/20 border-2 border-wellness-mint-green rounded-2xl p-6">
                <h4 className="font-semibold text-wellness-deep-blue mb-2 text-lg">Your Playstyle:</h4>
                <p className="text-wellness-deep-blue">{getPlaystyleFeedback()}</p>
              </div>

              {/* Improvement Tips */}
              <div className="bg-wellness-soft-gray/50 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-wellness-cool-blue font-semibold mb-3">How to Improve:</p>
                <ul className="space-y-2">
                  {getImprovementTips().map((tip, idx) => (
                    <li key={idx} className="text-sm text-wellness-deep-blue flex items-start">
                      <span className="text-wellness-fresh-green mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetLifeSimulator}
                className="w-full bg-wellness-cool-blue text-white py-3 rounded-full font-semibold shadow hover:shadow-lg transition-all"
              >
                Play Again
              </button>
            </div>
          )
        }

        return (
          <div className="space-y-4">
            {/* Scenario */}
            <div className="bg-wellness-soft-gray/50 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wide text-wellness-cool-blue font-semibold">{currentScenario.time}</p>
                <p className="text-[10px] text-wellness-cool-blue">Scenario {scenarioIndex + 1}/{selectedScenarios.length}</p>
              </div>
              <h4 className="text-base font-semibold text-wellness-deep-blue mb-1">{currentScenario.title}</h4>
              <p className="text-wellness-deep-blue text-sm mb-3">{currentScenario.prompt}</p>

              {/* Options */}
              <div className="space-y-3">
                {currentScenario.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLifeChoice(idx)}
                    className="w-full text-left p-3 rounded-xl bg-wellness-warm-white border-2 border-wellness-soft-gray hover:border-wellness-cool-blue transition-all group"
                  >
                    <p className="font-semibold text-sm text-wellness-deep-blue mb-0.5">{option.label}</p>
                    <p className="text-xs text-wellness-cool-blue">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-2">
              {selectedScenarios.map((_, idx) => (
                <div
                  key={idx}
                  className={`h - 2 flex - 1 rounded - full transition - colors ${idx < scenarioIndex ? 'bg-wellness-mint-green' :
                    idx === scenarioIndex ? 'bg-wellness-cool-blue' :
                      'bg-wellness-soft-gray'
                    } `}
                />
              ))}
            </div>
          </div>
        )
      }
      case 'mindful-break':
        return (
          <div className="space-y-4">
            <div className="bg-wellness-cream-white rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
              {/* Breathing Circle with Color Animation */}
              <motion.div
                className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: breathingPhase === 'inhale'
                    ? 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)' // Blue to Green
                    : breathingPhase === 'hold'
                      ? 'linear-gradient(135deg, #34D399 0%, #A78BFA 100%)' // Green to Purple
                      : 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)' // Purple to Pink
                }}
                animate={{
                  scale: breathingPhase === 'inhale' ? 1.4 : breathingPhase === 'hold' ? 1.4 : 1,
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut"
                }}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-2">
                    {breathingPhase === 'inhale' ? 'Breathe In' :
                      breathingPhase === 'hold' ? 'Hold' :
                        'Breathe Out'}
                  </p>

                </div>
              </motion.div>

              <p className="text-wellness-cool-blue mt-6 text-center max-w-lg text-base">
                Follow the circle's rhythm and colors. Breathe in as it expands, hold as it stays, breathe out as it contracts.
              </p>
            </div>
          </div>
        )
      case 'cyber-tree': {
        // Notification Screen
        if (chatStep === 'notification') {
          return (
            <div className="space-y-6">
              {/* Phone Container */}
              <div className="max-w-md mx-auto bg-wellness-deep-blue/10 rounded-3xl p-3 border-4 border-wellness-deep-blue/20">
                {/* Phone Screen */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                  {/* Status Bar */}
                  <div className="bg-wellness-deep-blue/5 px-4 py-2 flex justify-between items-center text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>📡</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* Notification */}
                  <div className="p-4">
                    <div className="bg-wellness-soft-gray/30 rounded-xl p-3 shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-wellness-soft-gray flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src="/Resource Images/6. digital wellness/other.png" alt="Unknown" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-wellness-deep-blue">Messages</p>
                          <p className="text-sm font-medium text-wellness-deep-blue mt-1">Unknown</p>
                          <p className="text-sm text-wellness-cool-blue mt-1 line-clamp-2">{selectedScenario.notification}</p>
                          <p className="text-xs text-wellness-cool-blue/60 mt-2">Just now</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-wellness-cool-blue mb-4">You received a message from an unknown number. What do you do?</p>
                <button
                  onClick={startChat}
                  className="px-8 py-3 rounded-full bg-wellness-cool-blue text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Open Message
                </button>
              </div>
            </div>
          )
        }

        // Chat Interface
        if (chatStep === 'chat') {
          return (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Phone Container - Left Column */}
              <div className="w-full max-w-md mx-auto md:mx-0 bg-wellness-deep-blue/10 rounded-3xl p-3 border-4 border-wellness-deep-blue/20">
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                  {/* Status Bar */}
                  <div className="bg-wellness-deep-blue/5 px-4 py-2 flex justify-between items-center text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>📡</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* Chat Header */}
                  <div className="bg-wellness-soft-gray/50 p-4 flex items-center gap-3 border-b border-wellness-soft-gray">
                    <div className="w-10 h-10 rounded-full bg-wellness-soft-gray flex items-center justify-center overflow-hidden">
                      <img src="/Resource Images/6. digital wellness/other.png" alt="Unknown" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-wellness-deep-blue">Unknown</p>
                      <p className="text-xs text-wellness-cool-blue">Not in your contacts</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="bg-wellness-cream-white p-4 min-h-[250px] max-h-[300px] overflow-y-auto space-y-2">
                    {chatMessages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'you'
                            ? 'bg-wellness-cool-blue text-white'
                            : 'bg-wellness-soft-gray text-wellness-deep-blue'
                            }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reply Options - Right Column */}
              <div className="space-y-4 pt-4">
                <div className="bg-wellness-soft-blue/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-wellness-deep-blue mb-2">Your Turn</h4>
                  <p className="text-sm text-wellness-cool-blue mb-4">Choose the best way to respond to this situation.</p>

                  <div className="space-y-3">
                    {chatMessages.length === 1 && (
                      <>
                        {selectedScenario.firstReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleChatReply(reply.text, reply.isSafe)}
                            className={`w-full text-left p-3 rounded-xl bg-white border-2 border-wellness-soft-gray transition-all shadow-sm ${reply.isSafe
                              ? 'hover:border-wellness-mint-green hover:shadow-md'
                              : 'hover:border-wellness-cool-blue hover:shadow-md'
                              }`}
                          >
                            <p className="font-medium text-wellness-deep-blue mb-1">{reply.text === 'Block' ? '🚫 ' : ''}{reply.text}</p>
                          </button>
                        ))}
                      </>
                    )}
                    {chatMessages.length === 3 && (
                      <>
                        {selectedScenario.secondReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleChatReply(reply.text, reply.isSafe)}
                            className={`w-full text-left p-3 rounded-xl bg-white border-2 border-wellness-soft-gray transition-all shadow-sm ${reply.isSafe
                              ? 'hover:border-wellness-mint-green hover:shadow-md'
                              : 'hover:border-wellness-cool-blue hover:shadow-md'
                              }`}
                          >
                            <p className="font-medium text-wellness-deep-blue mb-1">{reply.text === 'Block' ? '🚫 ' : ''}{reply.text}</p>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // Result Screen
        if (chatStep === 'result') {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`space-y-4 p-6 rounded-2xl ${chatResult === 'safe'
                ? 'bg-wellness-mint-green/20'
                : 'bg-red-50'
                } `}
            >
              <div className="text-center">
                <div className="text-5xl mb-3">{chatResult === 'safe' ? '✅' : '⚠️'}</div>
                <h3 className="text-xl font-bold text-wellness-deep-blue mb-1">
                  {chatResult === 'safe' ? 'Great Job!' : 'Be Careful!'}
                </h3>
                <p className="text-wellness-cool-blue">
                  {chatResult === 'safe'
                    ? 'You made a safe choice by blocking the unknown contact. Never share personal information with strangers online!'
                    : 'Sharing photos or personal info with strangers is risky. Always verify who you\'re talking to and never share sensitive information.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-wellness-cool-blue font-semibold mb-2">Safety Tips:</p>
                <ul className="space-y-2 text-sm text-wellness-deep-blue">
                  <li>• Never share personal photos with unknown contacts</li>
                  <li>• Block and report suspicious messages</li>
                  <li>• Tell a trusted adult if someone makes you uncomfortable</li>
                  <li>• Verify identities before engaging in conversation</li>
                </ul>
              </div>

              <button
                onClick={resetChat}
                className="w-full bg-wellness-cool-blue text-white py-3 rounded-full font-semibold shadow hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )
        }

        return null
      }
      case 'self-assessment':
        if (showArchetypeResult) {
          const archetype = calculateArchetype()
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-wellness-cream-white to-wellness-soft-blue/20 rounded-3xl p-8 text-center shadow-lg border border-wellness-soft-blue/20">
                <p className="text-sm uppercase tracking-wide text-wellness-cool-blue font-semibold mb-2">Your Digital Archetype</p>
                <h3 className="text-3xl font-bold text-wellness-deep-blue mb-4">{archetype.name}</h3>
                <p className="text-lg text-wellness-deep-blue/80 max-w-lg mx-auto mb-8 leading-relaxed">
                  {archetype.description}
                </p>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-wellness-soft-gray inline-block w-full max-w-md text-left">
                  <p className="text-xs uppercase tracking-wide text-wellness-cool-blue font-bold mb-4 text-center">How to Improve</p>
                  <ul className="space-y-3">
                    {archetype.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-wellness-deep-blue">
                        <span className="text-wellness-fresh-green mt-1">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowArchetypeResult(false)
                  setArchetypeScores([50, 50, 50, 50, 50])
                }}
                className="w-full bg-wellness-soft-gray text-wellness-deep-blue py-4 rounded-full font-semibold hover:bg-wellness-soft-blue/20 transition-all"
              >
                Retake Quiz
              </button>
            </motion.div>
          )
        }

        return (
          <div className="space-y-8">
            <div className="space-y-6">
              {archetypeQuestions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-2xl p-6 shadow-sm border border-wellness-soft-gray">
                  <p className="font-semibold text-wellness-deep-blue text-lg mb-4">{question.prompt}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-wellness-cool-blue w-16 text-right">{question.leftLabel}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={archetypeScores[index]}
                      onChange={(e) => handleArchetypeChange(index, Number(e.target.value))}
                      className="flex-1 h-2 bg-wellness-soft-gray rounded-lg appearance-none cursor-pointer accent-wellness-cool-blue"
                    />
                    <span className="text-xs font-medium text-wellness-cool-blue w-16">{question.rightLabel}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowArchetypeResult(true)}
              className="w-full bg-wellness-cool-blue text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Reveal My Archetype
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section ref={ref} className="bg-gradient-to-br from-wellness-mint-green via-wellness-warm-white to-wellness-soft-blue py-0">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-wellness-deep-blue mb-6">
            Digital Mindfulness
          </h2>
          <p className="text-xl text-wellness-cool-blue max-w-3xl mx-auto leading-relaxed">
            Mindfulness starts with small choices — one screen-free moment at a time.
          </p>
        </motion.div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {mindfulnessExperiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, delay: 0.6 + index * 0.15 }}
              className="bg-white/90 backdrop-blur-md border border-wellness-soft-gray rounded-3xl p-8 flex flex-col shadow-xl min-h-[400px] text-center"
            >
              <div className="mb-6 overflow-hidden rounded-2xl relative group h-48 w-full mx-auto bg-wellness-soft-gray/10 flex items-center justify-center">
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-2">
                {experience.title}
              </h3>
              <p className="text-sm text-wellness-cool-blue mb-6 flex-1">
                {experience.concept}
              </p>

              <button
                onClick={() => setActiveExperience(experience.id)}
                className="mt-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-wellness-fresh-green hover:bg-wellness-mint-green text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Try Now
              </button>
            </motion.div>
          ))}
        </div>



        {/* Experience Modals */}
        <AnimatePresence>
          {selectedExperience && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveExperience(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`bg-wellness-cream-white rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${selectedExperience.id === 'mindful-break' ? 'max-w-2xl' : 'max-w-5xl'
                  }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-wellness-gentle-gray">
                  <div>
                    <h3 className="text-2xl font-bold text-wellness-deep-blue flex items-center gap-2 mt-1">

                      {selectedExperience.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveExperience(null)}
                    className="p-2 rounded-full hover:bg-wellness-gentle-gray transition-colors"
                    aria-label="Close experience modal"
                  >
                    <X size={20} className="text-wellness-cool-blue" />
                  </button>
                </div>

                <div className="p-6">
                  {activeExperience && renderExperienceLab(activeExperience)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}



// Healthy Swaps Section
const HealthySwapsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

  const swapIdeas = [
    // all cards are being removed as per request
  ]

  const handleCardFlip = (index: number) => {
    setFlippedCards(prev => new Set(prev).add(index))
  }

  return (
    <section ref={ref} className="bg-gradient-to-br from-wellness-gentle-gray via-wellness-warm-white to-wellness-soft-blue py-0 mt-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-wellness-deep-blue mb-6">
            Healthy Swaps = Happier Days
          </h2>
          <p className="text-xl text-wellness-cool-blue max-w-3xl mx-auto leading-relaxed">
            Every scroll you skip gives you time for what really matters.
          </p>
        </motion.div>

        {/* Split Scene Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-16"
        >
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Endless Scrolling */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 0.7 } : { x: -100, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-wellness-soft-gray rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="text-center">
                  <div className="mb-4 h-24 w-24 mx-auto">
                    <img src="/Resource Images/6. digital wellness/scroll.png" alt="Scrolling" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-lg font-semibold text-wellness-deep-blue mb-2">
                    The Scroll Trap
                  </h3>
                  <p className="text-sm text-wellness-cool-blue mb-4">
                    Endless, mindless consumption
                  </p>

                  {/* Scroll Content */}
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="bg-wellness-warm-white p-2 rounded text-xs text-wellness-cool-blue"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        More content to scroll...
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Red Alert */}
                <motion.div
                  className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Tired & Unfulfilled
                </motion.div>
              </motion.div>

              {/* Right: Real Joy */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="bg-wellness-soft-blue rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="text-center">
                  <div className="mb-4 h-24 w-24 mx-auto">
                    <img src="/Resource Images/6. digital wellness/joy.png" alt="Joy" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-lg font-semibold text-wellness-deep-blue mb-2">
                    Real Joy
                  </h3>
                  <p className="text-sm text-wellness-deep-blue mb-4">
                    Meaningful activities & connections
                  </p>

                  {/* Happy Activities */}
                  <div className="space-y-2">
                    {[
                      { icon: "", text: "Friends laughing together" },
                      { icon: "", text: "Physical activity" },
                      { icon: "", text: "Creative expression" },
                      { icon: "", text: "Learning something new" },
                      { icon: "", text: "Nature & fresh air" },
                      { icon: "", text: "Meaningful reflection" }
                    ].map((activity, i) => (
                      <motion.div
                        key={i}
                        className="bg-wellness-warm-white p-2 rounded text-xs text-wellness-deep-blue"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                      >
                        <span className="mr-2">{activity.icon}</span>
                        {activity.text}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Green Check */}
                <motion.div
                  className="absolute top-4 right-4 bg-wellness-fresh-green text-wellness-deep-blue px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  <span>✓</span>
                  <span>Energized & Fulfilled</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Arrow Transformation - positioned in the gap between cards */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                <div className="w-16 h-16 bg-wellness-fresh-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl text-white font-bold">→</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Swap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {swapIdeas.map((swap, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateY: -90 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 50, rotateY: -90 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="relative h-64 cursor-pointer"
              onClick={() => handleCardFlip(index)}
            >
              <motion.div
                className="w-full h-full rounded-2xl shadow-lg relative overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Front (Before) */}
                <motion.div
                  className={`absolute inset - 0 bg - wellness - soft - gray rounded - 2xl p - 6 flex flex - col justify - center items - center ${flippedCards.has(index) ? 'opacity-0' : 'opacity-100'
                    } `}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-4xl mb-4">{swap.bad.emoji}</div>
                  <h3 className="text-lg font-semibold text-wellness-deep-blue mb-2 text-center">
                    {swap.bad.title}
                  </h3>
                  <p className="text-sm text-wellness-cool-blue text-center">
                    {swap.bad.description}
                  </p>
                  <div className="mt-4 text-xs bg-red-500 text-white px-3 py-1 rounded-full">
                    ❌ Less Fulfilling
                  </div>
                </motion.div>

                {/* Back (After) */}
                <motion.div
                  className={`absolute inset - 0 bg - wellness - mint - green rounded - 2xl p - 6 flex flex - col justify - center items - center ${flippedCards.has(index) ? 'opacity-100' : 'opacity-0'
                    } `}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-4xl mb-4">{swap.good.emoji}</div>
                  <h3 className="text-lg font-semibold text-wellness-deep-blue mb-2 text-center">
                    {swap.good.title}
                  </h3>
                  <p className="text-sm text-wellness-deep-blue text-center mb-3">
                    {swap.good.description}
                  </p>
                  <div className="text-xs bg-wellness-fresh-green text-wellness-deep-blue px-3 py-1 rounded-full font-medium">
                    ✓ {swap.benefit}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center mt-16"
        >

        </motion.div>
      </div>
    </section>
  )
}


// ==================== MODAL COMPONENTS ====================

// Screen Habit Modal
const ScreenHabitModal = ({ onClose, addAchievement }: { onClose: () => void, addAchievement: (achievement: string) => void }) => {
  const [screenTimeData, setScreenTimeData] = useState({
    socialMedia: 3,
    gaming: 2,
    studying: 4,
    streaming: 2,
    messaging: 1
  })
  const [showResults, setShowResults] = useState(false)

  const activities = [
    { key: 'socialMedia', name: 'Social Media', icon: '📱', color: 'text-blue-500' },
    { key: 'gaming', name: 'Gaming', icon: '🎮', color: 'text-purple-500' },
    { key: 'studying', name: 'Studying/Work', icon: '📚', color: 'text-green-500' },
    { key: 'streaming', name: 'Streaming/Video', icon: '📺', color: 'text-red-500' },
    { key: 'messaging', name: 'Messaging/Chat', icon: '💬', color: 'text-yellow-500' }
  ]

  const totalTime = Object.values(screenTimeData).reduce((sum, time) => sum + time, 0)

  const handleSliderChange = (key: string, value: number) => {
    setScreenTimeData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAnalyze = () => {
    setShowResults(true)
    addAchievement('Screen Habit Tracker')
  }

  const getRecommendation = () => {
    const socialMediaTime = screenTimeData.socialMedia
    if (socialMediaTime > 3) {
      return "You're doing great — just 1 more hour offline could help you sleep faster!"
    } else if (socialMediaTime > 2) {
      return "Good balance! Try cutting notifications before bed tonight."
    } else {
      return "Excellent! You're already practicing mindful screen habits."
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-wellness-warm-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-wellness-gentle-gray">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-wellness-mint-green rounded-lg">
                  <BarChart3 size={24} className="text-wellness-deep-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-wellness-deep-blue">
                    Screen Habit Tracker
                  </h2>
                  <p className="text-wellness-cool-blue">
                    How much time do you spend on each activity?
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-wellness-gentle-gray rounded-full transition-colors"
              >
                <X size={24} className="text-wellness-cool-blue" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showResults ? (
              <>
                {/* Activity Sliders */}
                <div className="space-y-6 mb-8">
                  {activities.map((activity) => (
                    <div key={activity.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{activity.icon}</span>
                          <span className="font-medium text-wellness-deep-blue">
                            {activity.name}
                          </span>
                        </div>
                        <span className="text-wellness-cool-blue font-medium">
                          {screenTimeData[activity.key as keyof typeof screenTimeData]}h/day
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="8"
                          step="0.5"
                          value={screenTimeData[activity.key as keyof typeof screenTimeData]}
                          onChange={(e) => handleSliderChange(activity.key, parseFloat(e.target.value))}
                          className="w-full h-2 bg-wellness-soft-gray rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-wellness-soft-green mt-1">
                          <span>0h</span>
                          <span>4h</span>
                          <span>8h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Time */}
                <div className="bg-wellness-soft-blue/20 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-wellness-deep-blue font-medium">Total Daily Screen Time</span>
                    <span className="text-2xl font-bold text-wellness-cool-blue">
                      {totalTime}h
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-wellness-cool-blue">
                    Recommended: 2-4 hours of recreational screen time per day
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  className="w-full bg-wellness-cool-blue text-white py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Analyze My Habits
                </button>
              </>
            ) : (
              /* Results */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-wellness-mint-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 size={32} className="text-wellness-deep-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-wellness-deep-blue mb-2">
                    Your Screen Time Analysis
                  </h3>
                  <p className="text-wellness-cool-blue">
                    Total: {totalTime} hours per day
                  </p>
                </div>

                {/* Breakdown Chart */}
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const hours = screenTimeData[activity.key as keyof typeof screenTimeData]
                    const percentage = totalTime > 0 ? (hours / totalTime) * 100 : 0

                    return (
                      <div key={activity.key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-wellness-deep-blue">{activity.name}</span>
                          <span className="text-wellness-cool-blue">{hours}h ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-wellness-soft-gray rounded-full h-3">
                          <motion.div
                            className={`h - 3 rounded - full ${activity.color.replace('text-', 'bg-')} `}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}% ` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Recommendation */}
                <div className="bg-wellness-fresh-green/20 rounded-2xl p-6 border-2 border-wellness-fresh-green">
                  <div className="flex items-start space-x-3">
                    <Shield size={24} className="text-wellness-fresh-green flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-wellness-deep-blue mb-2">
                        Personalized Recommendation
                      </h4>
                      <p className="text-wellness-cool-blue leading-relaxed">
                        {getRecommendation()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-wellness-soft-blue/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-wellness-deep-blue mb-3">
                    Quick Tips:
                  </h4>
                  <ul className="space-y-2 text-sm text-wellness-cool-blue">
                    <li>• Set app time limits for social media</li>
                    <li>• Use "Do Not Disturb" during focus hours</li>
                    <li>• Take 2-minute breaks every 30 minutes</li>
                    <li>• Create screen-free zones (bedroom, dining table)</li>
                  </ul>
                </div>

                {/* End Message */}
                <div className="text-center pt-4 border-t border-wellness-gentle-gray">
                  <p className="text-wellness-deep-blue font-medium">
                    Awareness is the first step toward control.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Notification Cleanse Modal
const NotificationCleanseModal = ({ onClose, addAchievement }: { onClose: () => void, addAchievement: (achievement: string) => void }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [notifications, setNotifications] = useState([
    { id: 1, app: 'SocialApp', enabled: true, essential: false, icon: '📱' },
    { id: 2, app: 'ChatApp', enabled: true, essential: true, icon: '💬' },
    { id: 3, app: 'NewsApp', enabled: true, essential: false, icon: '📰' },
    { id: 4, app: 'GameApp', enabled: true, essential: false, icon: '🎮' },
    { id: 5, app: 'Shopping', enabled: true, essential: false, icon: '🛒' },
    { id: 6, app: 'Weather', enabled: true, essential: true, icon: '🌤️' }
  ])

  const totalSteps = 3

  const handleNotificationToggle = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id
          ? { ...notif, enabled: !notif.enabled }
          : notif
      )
    )
  }

  const handleStepComplete = (step: number) => {
    if (!completedSteps.has(step)) {
      setCompletedSteps(prev => new Set(prev).add(step))

      if (step === 1) {
        setCurrentStep(2)
      } else if (step === 2) {
        setCurrentStep(3)
      } else if (step === 3) {
        // Complete modal
        addAchievement('Notification Cleanse')
        setTimeout(() => onClose(), 2000)
      }
    }
  }

  const getDisabledNotifications = () => {
    return notifications.filter(notif => !notif.enabled && !notif.essential)
  }

  const isStep1Complete = () => {
    const disabledCount = getDisabledNotifications().length
    return disabledCount >= 3
  }

  const isStep2Complete = () => {
    // Check if Focus Mode is "on" (simulated)
    return true // We'll simulate it's always complete after clicking
  }

  const getStepProgress = () => {
    return (completedSteps.size / totalSteps) * 100
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-wellness-warm-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-wellness-gentle-gray">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-wellness-mint-green rounded-lg">
                  <Bell size={24} className="text-wellness-deep-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-wellness-deep-blue">
                    Notification Cleanse
                  </h2>
                  <p className="text-wellness-cool-blue">
                    Step {currentStep} of {totalSteps}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-wellness-gentle-gray rounded-full transition-colors"
              >
                <X size={24} className="text-wellness-cool-blue" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-wellness-soft-gray rounded-full h-2">
                <motion.div
                  className="bg-wellness-fresh-green h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getStepProgress()}% ` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Turn off non-essential notifications */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Target size={48} className="text-wellness-cool-blue mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-wellness-deep-blue mb-2">
                    Turn off 3 non-essential app alerts
                  </h3>
                  <p className="text-wellness-cool-blue">
                    Keep only the notifications that truly matter to you.
                  </p>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      className={`p - 4 rounded - xl border - 2 transition - all duration - 300 ${!notif.enabled
                        ? 'border-wellness-fresh-green bg-wellness-mint-green/20'
                        : notif.essential
                          ? 'border-wellness-soft-green bg-wellness-cream-white'
                          : 'border-wellness-soft-gray bg-wellness-gentle-gray'
                        } `}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{notif.icon}</span>
                          <div>
                            <span className="font-medium text-wellness-deep-blue">
                              {notif.app}
                            </span>
                            <div className="text-sm text-wellness-cool-blue">
                              {notif.essential ? 'Essential app' : 'Can be disabled'}
                            </div>
                          </div>
                        </div>

                        {notif.essential ? (
                          <div className="text-xs bg-wellness-soft-green text-wellness-deep-blue px-2 py-1 rounded-full">
                            Keep On
                          </div>
                        ) : (
                          <button
                            onClick={() => handleNotificationToggle(notif.id)}
                            className={`relative w - 12 h - 6 rounded - full transition - colors duration - 300 ${notif.enabled ? 'bg-wellness-cool-blue' : 'bg-wellness-soft-gray'
                              } `}
                          >
                            <motion.div
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                              animate={{
                                x: notif.enabled ? 24 : 4
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="text-sm text-wellness-cool-blue mb-4">
                    Disabled: {getDisabledNotifications().length}/3 required
                  </div>
                  {isStep1Complete() && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => handleStepComplete(1)}
                      className="bg-wellness-cool-blue text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Continue to Step 2
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Set Focus Mode */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Volume2 size={48} className="text-wellness-cool-blue mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-wellness-deep-blue mb-2">
                    Set Focus Mode
                  </h3>
                  <p className="text-wellness-cool-blue">
                    Create dedicated time for study, relaxation, or sleep.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: 'Study Mode', description: 'Block distractions, enable educational apps only', icon: '📚' },
                    { name: 'Relax Mode', description: 'Allow calls and essential apps, mute social media', icon: '🧘' },
                    { name: 'Sleep Mode', description: 'Silence all notifications except urgent calls', icon: '😴' }
                  ].map((mode, index) => (
                    <motion.div
                      key={mode.name}
                      className="p-4 rounded-xl border-2 border-wellness-soft-gray hover:border-wellness-cool-blue cursor-pointer transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleStepComplete(2)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{mode.icon}</span>
                        <div>
                          <h4 className="font-semibold text-wellness-deep-blue">{mode.name}</h4>
                          <p className="text-sm text-wellness-cool-blue">{mode.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Watch distractions fade */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Shield size={48} className="text-wellness-fresh-green mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-wellness-deep-blue mb-2">
                    Watch the distractions fade away
                  </h3>
                  <p className="text-wellness-cool-blue">
                    Your mind is becoming calmer and more focused.
                  </p>
                </div>

                {/* Visual Progress */}
                <div className="bg-wellness-gentle-gray rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-wellness-cool-blue mb-2">
                      Focus Level: 95%
                    </div>
                    <div className="text-sm text-wellness-cool-blue">
                      Distractions eliminated
                    </div>
                  </div>

                  <div className="space-y-3">
                    {['Ping!', 'Buzz!', 'Alert!', 'Notification!', 'Reminder!'].map((distraction, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 bg-wellness-warm-white rounded-lg"
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: [1, 0.3, 0], x: [0, 50] }}
                        transition={{ duration: 2, delay: index * 0.3 }}
                      >
                        <span className="text-wellness-cool-blue">{distraction}</span>
                        <span className="text-wellness-fresh-green text-sm">→ Silenced</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Achievement */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 1 }}
                  className="text-center bg-wellness-fresh-green text-wellness-deep-blue p-6 rounded-2xl"
                >
                  <div className="text-4xl mb-2">🎯</div>
                  <h4 className="text-xl font-bold mb-2">Focus Master Badge Earned!</h4>
                  <p>You now have better control over your digital environment.</p>
                </motion.div>

                {/* Final Message */}
                <div className="text-center pt-4 border-t border-wellness-gentle-gray">
                  <p className="text-wellness-deep-blue font-medium text-lg">
                    Peace feels better than pings.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Digital Sunset Modal
const DigitalSunsetModal = ({ onClose, addAchievement }: { onClose: () => void, addAchievement: (achievement: string) => void }) => {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [breathCount, setBreathCount] = useState(0)
  const [isBreathing, setIsBreathing] = useState(false)
  const [screenDimmed, setScreenDimmed] = useState(false)

  const phases = [
    { id: 1, title: "Welcome to Digital Sunset", duration: 2000 },
    { id: 2, title: "Three Deep Breaths", duration: 12000 },
    { id: 3, title: "Screen Fades to Dusk", duration: 5000 },
    { id: 4, title: "Evening Reflection", duration: 8000 },
    { id: 5, title: "Peaceful Transition", duration: 3000 }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPhase < phases.length) {
        setCurrentPhase(prev => prev + 1)
      } else {
        // Complete the routine
        addAchievement('Digital Sunset')
        setTimeout(() => onClose(), 2000)
      }
    }, phases[currentPhase - 1]?.duration || 2000)

    return () => clearTimeout(timer)
  }, [currentPhase, addAchievement, onClose])

  const handleBreathStart = () => {
    setIsBreathing(true)
    let count = 0
    const breathInterval = setInterval(() => {
      count++
      setBreathCount(count)
      if (count >= 3) {
        clearInterval(breathInterval)
        setIsBreathing(false)
      }
    }, 4000) // 4 seconds per breath cycle
  }

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-wellness-calm-blue rounded-full flex items-center justify-center mx-auto">
              <Moon size={48} className="text-wellness-cool-blue" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-4">
                Welcome to Digital Sunset
              </h3>
              <p className="text-wellness-cool-blue leading-relaxed">
                Let's transition from screen time to peaceful evening mode.
                This 30-second routine will help your mind and body prepare for rest.
              </p>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-32 h-32 bg-wellness-mint-green rounded-full flex items-center justify-center mx-auto relative">
              <HeartIcon size={64} className="text-wellness-deep-blue" />
              <motion.div
                className="absolute inset-0 border-4 border-wellness-fresh-green rounded-full"
                animate={isBreathing ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 4, repeat: isBreathing ? 3 : 0 }}
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-4">
                Three Deep Breaths
              </h3>
              <p className="text-wellness-cool-blue mb-4">
                Inhale for 4 seconds, hold for 4, exhale for 4.
              </p>
              <div className="text-lg font-medium text-wellness-fresh-green mb-4">
                {isBreathing ? 'Breathe in...' : breathCount < 3 ? 'Ready to begin?' : 'Great!'}
              </div>
              {breathCount < 3 && (
                <button
                  onClick={handleBreathStart}
                  className="bg-wellness-cool-blue text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Start Breathing Exercise
                </button>
              )}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              className="w-40 h-40 bg-gradient-to-br from-wellness-soft-blue to-wellness-mint-green rounded-full flex items-center justify-center mx-auto relative"
              initial={{ filter: 'brightness(1)' }}
              animate={currentPhase === 3 ? { filter: 'brightness(0.3)' } : {}}
              transition={{ duration: 3 }}
            >
              <motion.div
                className="absolute text-6xl"
                animate={currentPhase === 3 ? { opacity: 0.3, scale: 0.8 } : {}}
                transition={{ duration: 3 }}
              >
                📱
              </motion.div>
              <motion.div
                className="absolute text-6xl"
                initial={{ opacity: 0 }}
                animate={currentPhase === 3 ? { opacity: 1 } : {}}
                transition={{ duration: 3, delay: 1 }}
              >
                🌙
              </motion.div>
            </motion.div>
            <div>
              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-4">
                Screen Fades to Dusk
              </h3>
              <p className="text-wellness-cool-blue leading-relaxed">
                Your devices dim as the evening light fades.
                Notice how your eyes feel more relaxed already.
              </p>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              {[
                { emoji: '📖', text: 'Read a book or journal' },
                { emoji: '🧘', text: 'Practice gentle stretching' },
                { emoji: '💭', text: 'Reflect on your day' },
                { emoji: '☕', text: 'Enjoy a warm beverage' }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-wellness-warm-white rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.5 }}
                >
                  <span className="text-2xl">{activity.emoji}</span>
                  <span className="text-wellness-deep-blue">{activity.text}</span>
                </motion.div>
              ))}
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-4">
                Evening Reflection
              </h3>
              <p className="text-wellness-cool-blue leading-relaxed">
                Take this time to unwind — read, stretch, or simply rest.
                What peaceful activity calls to you tonight?
              </p>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              className="w-24 h-24 bg-wellness-fresh-green rounded-full flex items-center justify-center mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Moon size={48} className="text-wellness-deep-blue" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-semibold text-wellness-deep-blue mb-4">
                Peaceful Transition Complete
              </h3>
              <p className="text-wellness-cool-blue leading-relaxed mb-6">
                You've successfully transitioned to evening mode.
                Your mind and body are now ready for restful sleep.
              </p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-wellness-cream-white rounded-3xl shadow-2xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-wellness-gentle-gray">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-wellness-mint-green rounded-lg">
                  <Moon size={24} className="text-wellness-deep-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-wellness-deep-blue">
                    Digital Sunset Routine
                  </h2>
                  <p className="text-sm text-wellness-cool-blue">
                    Phase {currentPhase} of {phases.length}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-wellness-gentle-gray rounded-full transition-colors"
              >
                <X size={20} className="text-wellness-cool-blue" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="flex space-x-2">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className={`h - 2 flex - 1 rounded - full transition - colors duration - 300 ${phase.id <= currentPhase ? 'bg-wellness-fresh-green' : 'bg-wellness-soft-gray'
                      } `}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 min-h-[400px] flex items-center justify-center">
            {renderPhaseContent()}
          </div>

          {/* Completion Badge */}
          {currentPhase === phases.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="px-6 pb-6"
            >
              <div className="bg-wellness-fresh-green text-wellness-deep-blue p-4 rounded-2xl text-center">
                <div className="text-2xl mb-2">🌙</div>
                <div className="font-semibold">Calm Evenings Badge Earned!</div>
                <div className="text-sm mt-1">You've mastered peaceful evening transitions</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ---- ADDED: Help Section (from StressManagementApp) as a React Component ----
function HelpSection() {
  return (
    <section className="section-container" style={{ marginTop: '0', marginBottom: '0', paddingTop: '0' }}>
      <div className="section-content">
        <h2 className="text-4xl md:text-5xl font-bold text-wellness-deep-blue mb-6 text-center">When to Ask for Help</h2>
        <div className="help-section">
          {/* help animation removed as requested */}
          <div className="help-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <img src="/Resource Images/1. Stress management images/buddycall.png" alt="Call for help" style={{ width: 220, height: 'auto', objectFit: 'contain' }} />
            <div className="help-cards">
              <div className="help-card">
                <h3>Childline India</h3>
                <p>24/7 helpline for children and teenagers</p>
                <a href="tel:1098" className="help-phone">Call: 1098</a>
              </div>
              <div className="help-card">
                <h3>NIMHANS</h3>
                <p>National Institute of Mental Health and Neurosciences</p>
                <a href="tel:08046110007" className="help-phone">Call: 080-46110007</a>
              </div>
            </div>
          </div>
          {/* End help-layout */}
        </div>
      </div>
    </section>
  );
}

// ==================== MAIN APP COMPONENT ====================

function App() {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [, setAchievements] = useState<Set<string>>(new Set())

  // Add achievement
  const addAchievement = (achievement: string) => {
    setAchievements(prev => new Set(prev).add(achievement))
  }

  return (
    <>
      {/* Inject Styles */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="min-h-screen bg-wellness-warm-white overflow-x-hidden relative">
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

        {/* Main Content - Scrollable Sections */}
        <main>
          <div id="hero">
            <HeroSection />
          </div>

          <div id="why-it-matters">
            <WhyItMattersSection />
          </div>

          <div id="mindful-habits">
            <MindfulHabitsSection onOpenModal={() => setActiveModal('screen-habits')} />
          </div>

          <div id="digital-mindfulness">
            <DigitalMindfulnessSection />
          </div>



          <div id="healthy-swaps">
            <HealthySwapsSection />
          </div>

          <HelpSection />
        </main>

        {/* Modals */}
        <AnimatePresence>
          {activeModal === 'screen-habits' && (
            <ScreenHabitModal
              onClose={() => setActiveModal(null)}
              addAchievement={addAchievement}
            />
          )}

          {activeModal === 'notification-cleanse' && (
            <NotificationCleanseModal
              onClose={() => setActiveModal(null)}
              addAchievement={addAchievement}
            />
          )}

          {activeModal === 'digital-sunset' && (
            <DigitalSunsetModal
              onClose={() => setActiveModal(null)}
              addAchievement={addAchievement}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default App