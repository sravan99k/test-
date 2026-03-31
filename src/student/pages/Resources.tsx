import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Brain, Moon, Zap, Sun, Wind, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { resourcesData, ResourceTopic } from '@/data/resourcesData';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20
    }
  }
};

const Resources = () => {
  const { topicId } = useParams<{ topicId?: string }>();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<ResourceTopic | null>(null);

  // Update selected topic when URL changes
  useEffect(() => {
    if (topicId) {
      const topic = resourcesData.find(t => t.id === topicId) || null;
      setSelectedTopic(topic);
    } else {
      setSelectedTopic(null);
    }
  }, [topicId]);

  const handleTopicClick = (topic: ResourceTopic) => {
    const routeMap: Record<string, string> = {
      'stress-management': '/resources/stress-management',
      'sleep-relaxation': '/resources/sleep-relaxation-experience',
      'healthy-mind-habits': '/resources/mind-refresh',
      'focus-study-skill': '/resources/study-focus-superpower',
      'peer-support-sharing': '/resources/peer-support-experience',
      'digital-wellness': '/resources/digital-wellness',
      'growth-mindset-motivation': '/resources/growth-mindset',
      'values-citizenship-education': '/resources/citizenship-education-wellness',
      'when-to-ask-for-help': '/resources/when-to-ask-for-help',
      'physical-wellness-nutrition': '/resources/wellness-body-care'
    };

    const route = routeMap[topic.id] || `/resources/${topic.id}`;
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackClick = () => {
    navigate('/resources');
  };

  return (
    <div id="onboarding-resources-content" className="min-h-screen bg-[#F5F7F9]">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-[#E8F4F9] rounded-b-3xl shadow-sm"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="text-center">
            <h1 id="onboarding-resources-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Mental Health Resources
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-4">
              Simple tools and tips to help you relax, focus, and build a healthier mind every day.
            </p>

            {/* Category Icons */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex justify-center space-x-6 mb-4"
            >
              {[
                { Icon: Brain, label: 'Mind', color: 'text-blue-600' },
                { Icon: Moon, label: 'Sleep', color: 'text-[#5A92AB]' },
                { Icon: Zap, label: 'Energy', color: 'text-yellow-500' },
                { Icon: Wind, label: 'Calm', color: 'text-teal-500' }
              ].map((item, i) => (
                <motion.div variants={itemVariants} key={i} className="flex flex-col items-center">
                  <div className="bg-white p-2 rounded-full shadow-md mb-1">
                    <item.Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {selectedTopic ? (
          <ResourceDetails topic={selectedTopic} onBack={handleBackClick} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Important Note - Right After Hero */}
            <motion.div
              variants={itemVariants}
              className="mb-6 bg-[#EBF6F0] border-l-4 border-[#4C8A69] rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Important Note</h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    This guide is meant for general information and helpful tips only — it's not medical advice. If you're feeling very stressed, anxious, or unwell, please reach out to a parent, teacher, or doctor right away. For serious concerns, contact the helplines provided or seek professional support. Your safety and well-being should always come first.
                  </p>
                </div>
              </div>
            </motion.div>

            <ResourceGrid
              topics={resourcesData}
              onTopicClick={handleTopicClick}
              selectedTopicId={topicId}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface ResourceGridProps {
  topics: ResourceTopic[];
  onTopicClick: (topic: ResourceTopic) => void;
  selectedTopicId?: string;
}

const ResourceGrid = ({ topics, onTopicClick, selectedTopicId }: ResourceGridProps) => {
  return (
    <div id="onboarding-resources-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {topics.map((topic) => {
        return (
          <motion.div
            key={topic.id}
            variants={itemVariants}
            onClick={() => onTopicClick(topic)}
            className={`bg-white rounded-xl shadow-md border-2 ${selectedTopicId === topic.id
              ? 'ring-2 ring-[#5A92AB] border-[#5A92AB]'
              : 'border-gray-100 hover:border-[#5A92AB]'
              } overflow-hidden flex flex-col cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
          >
            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={encodeURI(topic.imageUrl)}
                alt={topic.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  console.error('Image failed to load:', topic.imageUrl);
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.style.display = 'none';
                  const parentDiv = imgElement.parentElement;
                  if (parentDiv) {
                    parentDiv.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-[#EBF5F9]">
                        <div class="text-center">
                          <div class="text-4xl mb-2">📚</div>
                          <div class="text-sm font-medium text-gray-600">${topic.title}</div>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
              <p className="text-xs font-semibold text-[#5A92AB] uppercase tracking-wide mb-2">Wellness Resource</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5A92AB] transition-colors">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
                {topic.introduction}
              </p>

              {/* Prominent CTA Button */}
              {/* Button Color Options:
                  Option 1 (Current): Calm Blue - bg-[#5A92AB] hover:bg-[#4A7F98]
                  Option 2: Soft Green - bg-[#5D9B7A] hover:bg-[#4C8A69]
                  Option 3: Warm Brown - bg-[#9B8768] hover:bg-[#8A7657]
                  Option 4: Soft Lavender - bg-[#9B7EB0] hover:bg-[#8A6D9F]
              */}
              <button className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5A92AB] text-white rounded-lg font-semibold text-sm transition-all duration-300 group-hover:bg-[#4A7F98] group-hover:shadow-lg">
                Explore
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

interface ResourceDetailsProps {
  topic: ResourceTopic;
  onBack: () => void;
}

const ResourceDetails = ({ topic, onBack }: ResourceDetailsProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  // Modal state for 5-4-3-2-1 Grounding Game
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0); // 0..4
  const [groundingInputs, setGroundingInputs] = useState<string[][]>([
    [], [], [], [], []
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
      >
        <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
        Back to Resources
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={encodeURI(topic.imageUrl)}
            alt={topic.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Hero image failed to load:', topic.imageUrl);
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
              const parentDiv = imgElement.parentElement;
              if (parentDiv) {
                parentDiv.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-[#EBF5F9] p-4">
                    <div class="text-center">
                      <div class="text-6xl mb-4">📚</div>
                      <div class="text-2xl font-bold text-gray-700">${topic.title}</div>
                      <div class="text-sm text-gray-500 mt-2">Wellness Resource Guide</div>
                    </div>
                  </div>
                `;
              }
            }}
          />
        </div>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{topic.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{topic.introduction}</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {topic.sections?.map((section, index) => {
          // Check if this is a "Why it matters" section (skip numbering)
          const isWhyItMatters = section.title.toLowerCase().includes('why it matters');

          // Calculate the section number by counting non-"Why it matters" sections before this one
          const sectionNumber = topic.sections
            ?.slice(0, index)
            .filter(s => !s.title.toLowerCase().includes('why it matters'))
            .length + (isWhyItMatters ? 0 : 1);

          return (
            <section key={section.id} id={section.id} className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {isWhyItMatters ? section.title : `${sectionNumber}. ${section.title}`}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    {(() => {
                      // Track if we're inside specific subsections
                      let inDeepBreathing = false;
                      let inTimeManagement = false;
                      let inJournaling = false;
                      // Track for 5-4-3-2-1 grounding replacement
                      let inGroundingBlock = false;
                      let groundingButtonRendered = false;
                      let groundingSkipCount = 0;
                      const isStressCoping = topic.id === 'stress-management' && section.title === 'Coping Techniques';
                      const isQuickStress = topic.id === 'stress-management' && (section.title.includes('Quick') || section.id === 'quick-stress-busters');
                      const isDailyRoutine = topic.id === 'stress-management' && (section.title.includes('Daily Routine') || section.id === 'daily-routine');
                      const isSleepTopic = topic.id === 'sleep-relaxation';
                      const isSleepProblems = isSleepTopic && (section.title.includes('Why Sleep Problems Happen') || section.id === 'why-sleep-problems-happen');
                      const isSleepHygiene = isSleepTopic && (section.title.includes('Sleep Hygiene Tips') || section.id === 'sleep-hygiene');
                      const isSleepConnections = isSleepTopic && (section.title.includes('Connections') || section.id === 'connections');
                      const isAskHelp = topic.id === 'stress-management' && (section.title.includes('When to Ask for Help') || section.id === 'when-to-ask-help');
                      let gratitudeButtonRendered = false;

                      return section.content.split('\n').map((paragraph, pIndex) => {
                        if (paragraph.trim() === '') return null;
                        const line = paragraph.trimStart();

                        // Handle bold text (section/subsection headers)
                        if (line.startsWith('**') && line.endsWith('**')) {
                          const text = line.slice(2, -2);
                          // Enter subsection blocks based on header label
                          if (isStressCoping && text.toLowerCase().startsWith('1. deep breathing')) {
                            inDeepBreathing = true;
                            inTimeManagement = false;
                            inJournaling = false;
                          } else if (isStressCoping && text.toLowerCase().startsWith('5. time management')) {
                            inDeepBreathing = false;
                            inTimeManagement = true;
                            inJournaling = false;
                          } else if (isStressCoping && text.toLowerCase().startsWith('6. journaling/expressing emotions')) {
                            inDeepBreathing = false;
                            inTimeManagement = false;
                            inJournaling = true;
                          } else {
                            inDeepBreathing = false;
                            inTimeManagement = false;
                            inJournaling = false;
                          }
                          return (
                            <h3 key={pIndex} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                              {text}
                            </h3>
                          );
                        }

                        // Handle bullet points
                        if (line.startsWith('•') || line.startsWith('○')) {
                          const contentText = line.slice(1).trim();
                          const isFinalDeepBullet = isStressCoping && inDeepBreathing && /repeat\s*5[–-]10\s*times/i.test(contentText);
                          // For time management, consider the bullet finishing with the phrase containing 'Planning helps you feel in control'
                          const isFinalTimeBullet = isStressCoping && inTimeManagement && /planning\s+helps\s+you\s+feel\s+in\s+control/i.test(contentText);
                          // For journaling, insert after the bullet that starts with 'Add one action'
                          const isFinalJournalBullet = isStressCoping && inJournaling && /^(add\s+one\s+action)/i.test(contentText);

                          // Detect start of 5-4-3-2-1 block in Quick Stress Busters
                          if (!inGroundingBlock && isQuickStress && line.startsWith('•') && /5-4-3-2-1\s+grounding\s+game/i.test(contentText)) {
                            inGroundingBlock = true;
                            groundingButtonRendered = false;
                            groundingSkipCount = 0;
                          }

                          // If inside grounding block and encountering the '○' list, skip them and render a single button once
                          if (inGroundingBlock && line.startsWith('○')) {
                            groundingSkipCount += 1;
                            if (!groundingButtonRendered) {
                              groundingButtonRendered = true;
                              return (
                                <div key={`grounding-btn-${pIndex}`} className="my-3">
                                  <button
                                    onClick={() => setShowGrounding(true)}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    Play 5-4-3-2-1 Grounding Game
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </button>
                                </div>
                              );
                            }
                            // Once we've skipped 5 items, end the block
                            if (groundingSkipCount >= 5) {
                              inGroundingBlock = false;
                            }
                            return null; // skip rendering each '○' line
                          }

                          // Highlight specific helplines in "When to Ask for Help"
                          if (isAskHelp && (/^childline\s+india/i.test(contentText) || /^nimhans\s+helpline/i.test(contentText) || /^school\s+counselor\/teacher/i.test(contentText))) {
                            return (
                              <div key={`h-${pIndex}`} className="my-2">
                                <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                                  <div className="flex items-start">
                                    <span className="text-amber-600 mr-2 mt-1">•</span>
                                    <span className="text-amber-900 font-medium">{contentText}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Sleep: bold label before colon in bullets across targeted sections
                          if ((isSleepProblems || isSleepHygiene || isSleepConnections) && /:/u.test(contentText)) {
                            const [label, ...restParts] = contentText.split(':');
                            const restText = restParts.join(':').trim();
                            return (
                              <div key={`b-${pIndex}`} className="flex items-start mb-2">
                                <span className="text-blue-500 mr-2 mt-1">•</span>
                                <span className="text-gray-700">
                                  <span className="font-semibold">{label}:</span>{restText ? ' ' + restText : ''}
                                </span>
                              </div>
                            );
                          }

                          // Daily Routine: insert CTA after 'Practice Gratitude'
                          if (isDailyRoutine && !gratitudeButtonRendered && /^(practice\s+gratitude)/i.test(contentText)) {
                            gratitudeButtonRendered = true;
                            const bulletEl = (
                              <div key={`b-${pIndex}`} className="flex items-start mb-2">
                                <span className="text-blue-500 mr-2 mt-1">•</span>
                                <span className="text-gray-700">{contentText}</span>
                              </div>
                            );
                            return (
                              <div key={`gratitude-${pIndex}`}>
                                {bulletEl}
                                <div className="mt-4">
                                  <button
                                    onClick={() => navigate('/cognitive-tasks/empathy-roleplay')}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    Practice with Empathy Role-Play
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // Render bullet
                          const bulletEl = (
                            <div key={`b-${pIndex}`} className="flex items-start mb-2">
                              <span className="text-blue-500 mr-2 mt-1">•</span>
                              <span className="text-gray-700">{contentText}</span>
                            </div>
                          );

                          if (isFinalDeepBullet) {
                            // After the last bullet in Deep Breathing, render the Try it button
                            return (
                              <div key={pIndex}>
                                {bulletEl}
                                <div className="mt-4">
                                  <button
                                    onClick={() => navigate('/cognitive-tasks/breathing')}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    Want to try it out? Start Bubble Breathing
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          if (isFinalTimeBullet) {
                            // After the last bullet in Time Management, render the Goals button
                            return (
                              <div key={pIndex}>
                                {bulletEl}
                                <div className="mt-4">
                                  <button
                                    onClick={() => navigate('/wellness/goals')}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    You can manage your time by setting goals
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          if (isFinalJournalBullet) {
                            // After the journaling guidance bullet, render the Journal button
                            return (
                              <div key={pIndex}>
                                {bulletEl}
                                <div className="mt-4">
                                  <button
                                    onClick={() => navigate('/wellness/journal')}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    Want to journal now? Open your Journal
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return bulletEl;
                        }

                        // Handle thumbs up indicators
                        if (paragraph.includes('👉')) {
                          const [text, tip] = paragraph.split('👉');
                          return (
                            <div key={pIndex} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 my-4">
                              <div className="flex items-start">
                                <span className="text-blue-500 mr-2">💡</span>
                                <span className="text-blue-800 font-medium">{tip.trim()}</span>
                              </div>
                            </div>
                          );
                        }

                        // Sleep & Relaxation: highlight teens sleep hours sentence
                        if (isSleepTopic && /Teens \(13–19 years\) need 8–10 hours of sleep every night to feel their best\./.test(paragraph)) {
                          return (
                            <div key={pIndex} className="my-4">
                              <div className="bg-[#EBF5F9] p-4 rounded-lg border-l-4 border-[#5A92AB]">
                                <p className="text-[#2C5F7C] font-medium">
                                  {paragraph}
                                </p>
                              </div>
                            </div>
                          );
                        }

                        // Regular paragraph
                        return (
                          <p key={pIndex} className="text-gray-700 mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Image Section */}
                {section.image && (
                  <div className="lg:w-1/3">
                    <div className="sticky top-8">
                      <img
                        src={encodeURI(section.image)}
                        alt={section.title}
                        className="w-full h-auto max-h-[600px] object-cover rounded-lg shadow-lg border border-gray-200 bg-white cursor-pointer transition-transform hover:scale-105"
                        onClick={(e) => {
                          const img = e.target as HTMLImageElement;
                          const modal = document.createElement('div');
                          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                          modal.onclick = () => modal.remove();

                          const modalImg = document.createElement('img');
                          modalImg.src = img.src;
                          modalImg.className = 'max-w-full max-h-full object-contain rounded-lg';
                          modalImg.onclick = (e) => e.stopPropagation();

                          const closeBtn = document.createElement('button');
                          closeBtn.innerHTML = '×';
                          closeBtn.className = 'absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300';
                          closeBtn.onclick = () => modal.remove();

                          modal.appendChild(modalImg);
                          modal.appendChild(closeBtn);
                          document.body.appendChild(modal);
                        }}
                        onError={(e) => {
                          console.error('Section image failed to load:', section.image);
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                          const parentDiv = imgElement.parentElement;
                          if (parentDiv) {
                            parentDiv.innerHTML = `
                            <div class="w-full h-96 flex items-center justify-center bg-[#F5F7F9] rounded-lg shadow-sm border border-gray-200">
                              <div class="text-center p-4">
                                <div class="text-4xl mb-2">🖼️</div>
                                <div class="text-sm font-medium text-gray-600">${section.title}</div>
                                <div class="text-xs text-gray-400 mt-1">Click to view full size</div>
                              </div>
                            </div>
                          `;
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* 5-4-3-2-1 Grounding Game Modal */}
      {showGrounding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">5-4-3-2-1 Grounding Game</h3>
              <button
                onClick={() => { setShowGrounding(false); setGroundingStep(0); setGroundingInputs([[], [], [], [], []]); }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              {(() => {
                const counts = [5, 4, 3, 2, 1];
                const prompts = ['things you see', 'things you can touch', 'things you hear', 'things you can smell', 'thing you can taste'];
                const helper = ['Look around the room.', 'Feel textures near you.', 'Listen carefully to sounds.', 'Gently notice nearby scents.', 'Take a sip of water or imagine a taste.'];
                const title = ['See', 'Touch', 'Hear', 'Smell', 'Taste'];
                const desired = counts[groundingStep];
                const current = groundingInputs[groundingStep] || [];
                const canNext = current.filter(x => (x ?? '').trim().length > 0).length >= desired;

                const updateInput = (i: number, v: string) => {
                  setGroundingInputs(prev => {
                    const clone = prev.map(arr => [...arr]);
                    if (!clone[groundingStep]) clone[groundingStep] = [];
                    clone[groundingStep][i] = v;
                    return clone as string[][];
                  });
                };

                return (
                  <div>
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Step {groundingStep + 1} of 5
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{title[groundingStep]}: List {desired} {prompts[groundingStep]}</h4>
                    <p className="text-sm text-gray-600 mb-5">{helper[groundingStep]}</p>

                    <div className="space-y-2">
                      {Array.from({ length: desired }).map((_, i) => (
                        <input
                          key={i}
                          type="text"
                          value={current[i] || ''}
                          onChange={(e) => updateInput(i, e.target.value)}
                          placeholder={`Item ${i + 1}`}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => setGroundingStep(s => Math.max(0, s - 1))}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        disabled={groundingStep === 0}
                      >
                        Back
                      </button>

                      {groundingStep < 4 ? (
                        <button
                          onClick={() => setGroundingStep(s => Math.min(4, s + 1))}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          disabled={!canNext}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          onClick={() => { setShowGrounding(false); setGroundingStep(0); setGroundingInputs([[], [], [], [], []]); }}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                          disabled={!canNext}
                        >
                          Finish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Help Resources Footer */}
      <div className="mt-16 bg-amber-50 border border-amber-200 rounded-xl p-6 relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-amber-800 mb-2">Need Additional Support?</h3>
                <div className="text-amber-700 space-y-2">
                  <p>If you're struggling with any of these areas, remember that help is available:</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="font-semibold text-amber-800">Childline India</div>
                      <div className="text-amber-600">📞 1098 (Free, 24/7)</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="font-semibold text-amber-800">NIMHANS Helpline</div>
                      <div className="text-amber-600">📞 080-46110007</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Arrow Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Back to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Resources;