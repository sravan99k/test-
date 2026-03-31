import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WellnessBodyCareExperience: React.FC = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null);

  const [activeModule, setActiveModule] = useState<'nutrition' | 'hydration' | 'exercise' | 'sleep'>('nutrition');
  const [hydrationCount, setHydrationCount] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);



  // Timer effect for exercise
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setExerciseTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { scrollYProgress } = useScroll();
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];

  const toggleModal = (modalName: string) => {
    setIsModalOpen(isModalOpen === modalName ? null : modalName);
  };



  const showConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    const particles = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        dx: (Math.random() - 0.5) * 2,
        dy: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: Math.random() * 5 + 2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, index) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dy += 0.1;

        if (particle.y > canvas.height) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };

    animate();
  };



  useEffect(() => {
    const handleScroll = () => {
      sectionRefs.forEach((ref, index) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setCurrentSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);





  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-teal-100">
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




      {/* Main Content */}
      <div className="pt-4">
        {/* Section 1: Welcome */}
        <motion.div
          ref={sectionRefs[0]}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          className="min-h-screen flex items-center justify-center px-4"
        >
          {/* Hero Image */}
          <motion.div
            className="absolute -left-10 -top-25 -translate-y-1/2 z-0 hidden lg:block pl-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/Resource Images/9. physical wellness nutrition/12.webp"
              alt="Physical Wellness"
              className="w-[480px] h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

          <div className="max-w-4xl ml-auto mr-4 md:mr-20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >

            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Are You Taking Care of Your Body the Right Way?
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Learn how to fuel your body with a balanced diet and healthy habits! Discover how proper nutrition, exercise, and rest can boost your energy, focus, and confidence — helping you perform better in school and life.
            </p>

            <div className="flex justify-center items-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sectionRefs[1].current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                }}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all"
              >
                Start Your Journey
              </motion.button>
            </div>


          </div>
        </motion.div>

        {/* Section 2: Why It Matters */}
        <motion.div
          ref={sectionRefs[1]}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          className="flex items-center justify-center px-4 py-8 scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8">
              Why It Matters
            </h2>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                <div className="text-center mb-4 flex-grow-0">
                  <img
                    src="/Resource Images/9. physical wellness nutrition/mood.png"
                    alt="Boost Mood"
                    className="w-32 h-32 object-contain mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-800">Boost Mood</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  Exercise and good food make you happier and less stressed. Your body releases natural feel-good chemicals that help you tackle daily challenges with a positive mindset.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                <div className="text-center mb-4 flex-grow-0">
                  <img
                    src="/Resource Images/9. physical wellness nutrition/energy.png"
                    alt="Increase Energy"
                    className="w-32 h-32 object-contain mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-800">Increase Energy</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  Balanced meals and hydration keep you active throughout the day. No more afternoon crashes or feeling drained during important tasks.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                <div className="text-center mb-4 flex-grow-0">
                  <img
                    src="/Resource Images/9. physical wellness nutrition/focus.png"
                    alt="Improve Focus"
                    className="w-32 h-32 object-contain mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-800">Improve Focus</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  A strong body sharpens your brain for better learning. When your body is healthy, your mind stays sharp and focused for studying and exams.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                <div className="text-center mb-4 flex-grow-0">
                  <img
                    src="/Resource Images/9. physical wellness nutrition/strong.png"
                    alt="Grow Strong"
                    className="w-32 h-32 object-contain mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-800">Grow Strong</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  Nutrition and rest help your body develop properly. Build the foundation for lifelong health and confidence in your physical abilities.
                </p>
              </div>
            </div>


          </div>
        </motion.div>

        {/* Section 3: Balanced Living */}
        <motion.div
          ref={sectionRefs[2]}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          className="flex items-center justify-center px-4 py-8"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-gray-800 ">
              Balanced Living Made Simple
            </h2>

            <div className="text-center mb-8">
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Start with one or two healthy habits and practice them daily!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Balanced Indian Plate */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <img
                    src="/Resource Images/9. physical wellness nutrition/plate.png"
                    alt="Balanced Plate"
                    className="w-72 h-72 object-contain mx-auto mb-4"
                  />
                  <h3 className="text-3xl font-bold text-gray-800">Balanced Indian Plate</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">1/2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Fruits & Vegetables</h4>
                      <p className="text-gray-600">Spinach, carrots, mangoes, tomatoes</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">1/4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Whole Grains</h4>
                      <p className="text-gray-600">Roti, brown rice, millets</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">1/4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Protein</h4>
                      <p className="text-gray-600">Dal, eggs, paneer, or lean meat</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl">
                  <p className="text-center text-gray-700 font-medium">
                    This balance gives your body all key nutrients
                  </p>
                </div>


              </div>

              {/* Hydration & Junk Food */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <img
                      src="/Resource Images/9. physical wellness nutrition/hydration.png"
                      alt="Hydration"
                      className="w-32 h-32 object-contain mx-auto mb-4"
                    />
                    <h3 className="text-2xl font-bold text-gray-800">Hydration</h3>
                  </div>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Drink 6–8 glasses of water a day</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Hydration keeps your mind alert and body refreshed</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-3xl p-4 shadow-lg">
                  <div className="text-center">
                    <img
                      src="/Resource Images/9. physical wellness nutrition/nojunk.png"
                      alt="No Junk Food"
                      className="w-96 h-60 object-contain mx-auto"
                    />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Limit Junk Food</h3>
                  </div>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">X</span>
                      </span>
                      <span>Cut back on chips, sugary drinks, and fried snacks</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Your energy lasts longer when you eat real food</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Move, Rest & Recharge */}
        <motion.div
          ref={sectionRefs[3]}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          className="flex items-center justify-center px-4 py-8"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8">
              Move, Rest & Recharge
            </h2>

            <div className="bg-white rounded-3xl p-8 shadow-lg min-h-[600px]">
              {/* Module Tabs */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { id: 'nutrition', label: 'Nutrition', color: 'from-green-400 to-emerald-500' },
                  { id: 'hydration', label: 'Hydration', color: 'from-blue-400 to-cyan-500' },
                  { id: 'exercise', label: 'Exercise', color: 'from-orange-400 to-red-500' },
                  { id: 'sleep', label: 'Sleep', color: 'from-indigo-400 to-purple-500' }
                ].map((module) => (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module.id as any);
                    }}
                    className={`px-6 py-3 rounded-full font-bold transition-all flex items-center space-x-2 ${activeModule === module.id
                      ? `bg-gradient-to-r ${module.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >

                    <span>{module.label}</span>
                  </button>
                ))}
              </div>

              {/* Module Content */}
              <div className="transition-all duration-300">
                {activeModule === 'nutrition' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Healthy Snack Ideas */}
                      <div className="bg-green-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                          <span className="text-2xl mr-2"></span> Healthy Snack Ideas
                        </h3>
                        <div className="space-y-4">
                          {[
                            { name: 'Mixed Nuts', desc: 'Rich in healthy fats and protein' },
                            { name: 'Fruit Chaat', desc: 'Seasonal fruits with chaat masala' },
                            { name: 'Roasted Chana', desc: 'High in protein and fiber' },
                            { name: 'Vegetable Sticks', desc: 'With hummus or yogurt dip' },
                            { name: 'Sprout Salad', desc: 'Packed with nutrients' },
                            { name: 'Buttermilk', desc: 'Refreshing and probiotic' }
                          ].map((snack, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                              <span className="font-semibold text-gray-700">{snack.name}</span>
                              <span className="text-xs text-gray-500">{snack.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meal Planning Tips */}
                      <div className="bg-orange-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                          <span className="text-2xl mr-2">📋</span> Meal Planning Tips
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h4 className="font-bold text-orange-600 mb-1">Breakfast</h4>
                            <p className="text-sm text-gray-600">Include protein and fiber. Try: Poha with veggies, sprouts, or eggs with toast.</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h4 className="font-bold text-green-600 mb-1">Lunch</h4>
                            <p className="text-sm text-gray-600">Balance your plate. Example: Roti, dal, sabzi, and curd.</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h4 className="font-bold text-blue-600 mb-1">Dinner</h4>
                            <p className="text-sm text-gray-600">Lighter meal. Try: Khichdi, vegetable soup, or dal-rice.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brain-Boosting Foods */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="text-2xl mr-2"></span> Brain-Boosting Foods
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'Walnuts', benefit: 'Brain health & memory', icon: '🥜' },
                          { name: 'Berries', benefit: 'Rich in antioxidants', icon: '🍇' },
                          { name: 'Dark Chocolate', benefit: 'Improves focus', icon: '🍫' },
                          { name: 'Water', benefit: 'Essential for brain function', icon: '💧' }
                        ].map((food, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors flex flex-col items-center text-center">
                            <div className="text-3xl mb-2">{food.icon}</div>
                            <div className="font-bold text-gray-800">{food.name}</div>
                            <div className="text-xs text-gray-600">{food.benefit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModule === 'hydration' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-8"
                  >
                    <div className="bg-blue-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">Signs of Dehydration</h3>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                          { sign: 'Headache', icon: '🤕' },
                          { sign: 'Dry Mouth', icon: '👅' },
                          { sign: 'Fatigue', icon: '😫' },
                          { sign: 'Dizziness', icon: '😵' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                            <span className="text-3xl mb-2">{item.icon}</span>
                            <span className="font-medium text-gray-700">{item.sign}</span>
                          </div>
                        ))}
                      </div>

                      <h4 className="text-lg font-bold text-gray-800 mb-4">Urine Color Guide</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 border border-gray-200"></div>
                          <span className="text-sm text-gray-600">Pale Yellow: Hydrated (Good!)</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-yellow-300 border border-gray-200"></div>
                          <span className="text-sm text-gray-600">Yellow: Drink some water</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-yellow-600 border border-gray-200"></div>
                          <span className="text-sm text-gray-600">Dark Yellow: Dehydrated (Drink Now!)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-cyan-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Hydration Tips</h3>
                        <ul className="space-y-3">
                          {[
                            "Start your day with a glass of water",
                            "Keep a water bottle with you at all times",
                            "Add lemon, cucumber, or mint for flavor",
                            "Eat water-rich foods like watermelon"
                          ].map((tip, idx) => (
                            <li key={idx} className="flex items-center space-x-3">
                              <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 text-center">
                        <p className="text-lg text-gray-600 italic">
                          "Sip water slowly to relax your body."
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModule === 'exercise' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-8"
                  >
                    <div className="bg-orange-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                        <span className="text-3xl mr-3"></span> Why Move?
                      </h3>

                      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                        <h4 className="font-bold text-gray-800 mb-4 text-center">Benefits of Daily Movement</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-gray-700">Boosts focus and concentration</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="text-gray-700">Improves mood and reduces stress</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span className="text-gray-700">Increases energy levels naturally</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span className="text-gray-700">Helps you sleep better at night</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-orange-100 rounded-xl p-6 text-center">
                        <h4 className="font-bold text-orange-800 mb-2">Recommended Goal</h4>
                        <div className="text-4xl font-bold text-orange-600 mb-2">60 min</div>
                        <p className="text-orange-700 text-sm">of physical activity every day</p>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-orange-100 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Desk Exercises</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Neck Rolls', reps: '5 each way', desc: 'Gently roll your head in circles' },
                          { name: 'Shoulder Shrugs', reps: '10 reps', desc: 'Lift shoulders up and down' },
                          { name: 'Seated Leg Lifts', reps: '10 each leg', desc: 'Lift legs straight out' },
                          { name: 'Wrist Stretches', reps: '10 sec', desc: 'Gently pull fingers back' },
                          { name: 'Seated Twists', reps: '5 each side', desc: 'Twist torso while seated' },
                          { name: 'Ankle Circles', reps: '10 each way', desc: 'Rotate ankles in circles' }
                        ].map((ex, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                            <div>
                              <div className="font-bold text-gray-800">{ex.name}</div>
                              <div className="text-xs text-gray-500">{ex.desc}</div>
                            </div>
                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                              {ex.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModule === 'sleep' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-8"
                  >
                    <div className="bg-indigo-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">Sleep Needs by Age</h3>
                      <div className="space-y-4 mb-8">
                        <div className="bg-white p-4 rounded-xl flex justify-between items-center">
                          <span className="font-medium text-gray-700">6-13 years</span>
                          <span className="font-bold text-indigo-600">9-11 hrs</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl flex justify-between items-center">
                          <span className="font-medium text-gray-700">14-17 years</span>
                          <span className="font-bold text-indigo-600">8-10 hrs</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-gray-800 mb-4">Quick Tips</h4>
                      <ul className="space-y-3">
                        {[
                          "Keep room cool & dark",
                          "No screens 1 hour before bed",
                          "Consistent sleep schedule"
                        ].map((tip, idx) => (
                          <li key={idx} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">Nightly Wind Down</h3>
                      <div className="space-y-6">
                        {[
                          { time: '1h before', icon: '📵', action: 'No screens' },
                          { time: '45m before', icon: '🚿', action: 'Warm shower' },
                          { time: '30m before', icon: '📖', action: 'Read/Stretch' },
                          { time: '15m before', icon: '🧘', action: 'Deep breaths' },
                          { time: 'Bedtime', icon: '💤', action: 'Lights out' }
                        ].map((step, idx) => (
                          <div key={idx} className="flex items-center relative">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm z-10">
                              {step.icon}
                            </div>
                            {idx !== 4 && (
                              <div className="absolute left-6 top-12 w-0.5 h-8 bg-purple-200 -z-0" />
                            )}
                            <div className="ml-4">
                              <div className="text-xs font-bold text-purple-400 uppercase">{step.time}</div>
                              <div className="font-bold text-gray-700">{step.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 5: When to Ask for Help */}
        <motion.div
          ref={sectionRefs[4]}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          className="flex items-center justify-center px-4 py-8"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8">
              When to Ask for Help
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                <img src="/Resource Images/1. Stress management images/buddycall.png" alt="Call for help" className="w-64 h-auto object-contain" />
                <div className="grid gap-6 w-full max-w-md">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center border-2 border-red-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Childline India</h3>
                    <p className="text-gray-600 mb-4">24/7 helpline for children and teenagers</p>
                    <a href="tel:1098" className="inline-block bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors shadow-md">
                      Call: 1098
                    </a>
                  </div>
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center border-2 border-blue-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">NIMHANS</h3>
                    <p className="text-gray-600 mb-4">National Institute of Mental Health and Neurosciences</p>
                    <a href="tel:08046110007" className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-md">
                      Call: 080-46110007
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}


      {isModalOpen === 'exercise-guide' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Exercise Guide</h3>
              <button
                onClick={() => setIsModalOpen(null)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-600">X</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Morning Stretches",
                  duration: "5-10 minutes",
                  description: "Start your day with gentle stretches to wake up your body and mind.",
                  exercises: ["Arm circles", "Neck rolls", "Gentle spinal twist"]
                },
                {
                  name: "Study Break Moves",
                  duration: "2-5 minutes",
                  description: "Quick movements to relieve tension during study sessions.",
                  exercises: ["Shoulder rolls", "Seated spinal twist", "Deep breathing"]
                },
                {
                  name: "Cardio Boost",
                  duration: "20-30 minutes",
                  description: "Get your heart pumping with these energizing activities.",
                  exercises: ["Brisk walking", "Dancing", "Jumping jacks"]
                },
                {
                  name: "Evening Wind Down",
                  duration: "10-15 minutes",
                  description: "Relax and prepare your body for restful sleep.",
                  exercises: ["Gentle yoga", "Forward folds", "Savasana pose"]
                }
              ].map((routine, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{routine.name}</h4>
                  <p className="text-sm text-blue-600 font-medium mb-3">{routine.duration}</p>
                  <p className="text-gray-600 mb-4">{routine.description}</p>
                  <ul className="space-y-2">
                    {routine.exercises.map((exercise, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-700">{exercise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {isModalOpen === 'healthy-recipes' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Healthy Recipe Ideas</h3>
              <button
                onClick={() => setIsModalOpen(null)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-600">X</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Power Poha",
                  type: "Breakfast",
                  description: "A nutritious start with vegetables and whole grains",
                  ingredients: ["Poha", "Onions", "Tomatoes", "Peanuts", "Curry leaves"],
                  nutrition: "High in fiber, vitamins, and healthy fats"
                },
                {
                  name: "Protein Dal Bowl",
                  type: "Lunch",
                  description: "Complete protein with complex carbohydrates",
                  ingredients: ["Dal", "Brown rice", "Vegetables", "Ghee", "Spices"],
                  nutrition: "Balanced protein, carbs, and essential amino acids"
                },
                {
                  name: "Quinoa Salad",
                  type: "Lunch/Dinner",
                  description: "Modern twist on traditional grains",
                  ingredients: ["Quinoa", "Cucumber", "Tomatoes", "Mint", "Lemon"],
                  nutrition: "Complete protein, minerals, and antioxidants"
                },
                {
                  name: "Green Smoothie",
                  type: "Snack",
                  description: "Blend of greens, fruits, and superfoods",
                  ingredients: ["Spinach", "Banana", "Apple", "Almonds", "Coconut water"],
                  nutrition: "Vitamins, minerals, and natural energy"
                },
                {
                  name: "Ragi Porridge",
                  type: "Breakfast",
                  description: "Traditional millet porridge with modern nutrition",
                  ingredients: ["Ragi flour", "Milk", "Jaggery", "Nuts", "Cardamom"],
                  nutrition: "High in calcium, iron, and fiber"
                },
                {
                  name: "Vegetable Upma",
                  type: "Meal",
                  description: "Quick, nutritious, and satisfying",
                  ingredients: ["Rava", "Mixed vegetables", "Spices", "Curry leaves"],
                  nutrition: "Balanced carbs, vitamins, and minerals"
                }
              ].map((recipe, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-gray-800">{recipe.name}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {recipe.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{recipe.description}</p>
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Ingredients:</h5>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-green-800 text-sm font-medium">{recipe.nutrition}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {isModalOpen === 'exercise-demo' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Exercise Demo</h3>
              <button
                onClick={() => setIsModalOpen(null)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-600">X</span>
              </button>
            </div>

            <div className="space-y-6">
              {[
                {
                  name: "Shoulder Rolls",
                  duration: "30 seconds",
                  description: "Roll your shoulders forward and backward to release tension",
                  steps: ["Sit or stand with straight posture", "Roll shoulders up, back, and down", "Repeat in reverse direction", "Focus on slow, controlled movement"]
                },
                {
                  name: "Arm Overhead Stretch",
                  duration: "30 seconds",
                  description: "Stretch your arms above your head to open your chest",
                  steps: ["Stand with feet hip-width apart", "Interlace fingers and extend arms overhead", "Gently lean to one side", "Hold and switch sides"]
                },
                {
                  name: "Seated Forward Fold",
                  duration: "15 seconds each leg",
                  description: "Release tension in your back and legs",
                  steps: ["Sit with legs extended", "Slowly lean forward from hips", "Reach toward your toes", "Breathe deeply and relax"]
                },
                {
                  name: "Deep Breathing",
                  duration: "1 minute",
                  description: "Center yourself with mindful breathing",
                  steps: ["Sit comfortably with straight spine", "Place one hand on chest, one on belly", "Breathe in slowly through nose", "Exhale slowly through mouth", "Feel belly rise and fall"]
                }
              ].map((exercise, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-800">{exercise.name}</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {exercise.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{exercise.description}</p>
                  <div className="space-y-2">
                    {exercise.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
              <p className="text-center text-gray-700 font-medium">
                Start with gentle movements and gradually increase intensity!
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {isModalOpen === 'breathing-guide' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Breathing Exercise</h3>
              <button
                onClick={() => setIsModalOpen(null)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-600">X</span>
              </button>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl text-white">BREATHE</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">4-7-8 Breathing Technique</h4>
                <p className="text-gray-600 leading-relaxed mb-6">
                  A simple technique to reduce stress and improve focus
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <span className="font-medium text-gray-700">Inhale</span>
                  <span className="text-green-600 font-bold">4 seconds</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                  <span className="font-medium text-gray-700">Hold</span>
                  <span className="text-yellow-600 font-bold">7 seconds</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <span className="font-medium text-gray-700">Exhale</span>
                  <span className="text-blue-600 font-bold">8 seconds</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                START BREATHING
              </motion.button>

              <p className="text-sm text-gray-500 mt-4">
                Repeat 3-4 cycles for best results
              </p>
            </div>
          </motion.div>
        </div>
      )}


    </div>
  );
};

export default WellnessBodyCareExperience;