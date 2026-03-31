import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalizedDashboard from "@/components/personalized/PersonalizedDashboard";
import MoodTracker from "@/components/mood/MoodTracker";
import GuidedJournal from "@/components/journal/GuidedJournal";
import WellnessGoals from "@/components/goals/WellnessGoals";
import AchievementBadges from "@/components/gamification/AchievementBadges";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/usePageTitle";

import CounselorConnect from "@/components/shared/CounselorConnect";
import PlatformFeedback from "@/components/shared/PlatformFeedback";

const WellnessDashboard = () => {
  usePageTitle("Wellness");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Ensure active tab text is always blue and bold
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .wellness-tab[data-state="active"],
      .wellness-tab[data-state="active"] * {
        color: rgb(37, 99, 235) !important;
        font-weight: 600 !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Cleanup function - properly typed to return void
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Smooth scroll to "My Wellness Journey" section
  const scrollToJourney = () => {
    const el = document.getElementById('wellness-journey');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-teal-100 to-blue-100 rounded-xl mb-10 p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
        <div className="z-10 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-2">Welcome to Your Wellness Journey</h2>
          <p className="text-lg text-teal-700 mb-4 max-w-xl">
            Every step counts. Track your progress, set goals, and connect with a supportive community.
          </p>
          <div className="italic text-teal-600 mb-4">
            “Taking care of your mind is the first step to unlocking your true potential.”
          </div>
          <button
            className="bg-teal-500 text-white font-semibold px-6 py-2 rounded-full transition-all"
            onClick={scrollToJourney}
          >
            Get Started
          </button>
        </div>
        <img
          src="/wellness-illustration.svg"
          alt="Wellness Illustration"
          className="w-48 md:w-64 lg:w-80 mt-6 md:mt-0 z-0"
          style={{ minWidth: 180 }}
        />
        {/* Decorative blurred blob */}
        <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-blue-200 opacity-30 blur-3xl z-0" />
      </div>

      {/* Notification Banner for Negative Mood */}
      {typeof window !== 'undefined' && window.localStorage && (() => {
        // Try to get recent mood from localStorage (as fallback for demo)
        const entry = window.localStorage.getItem('lastMoodEntry');
        if (entry) {
          try {
            const lastMood = JSON.parse(entry);
            const recent = lastMood && lastMood.score <= 3 && new Date().getTime() - new Date(lastMood.created_at).getTime() < 3 * 24 * 60 * 60 * 1000;
            if (recent) {
              return (
                <div className="flex items-center gap-3 bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6" role="alert" aria-live="polite">
                  <span className="text-2xl">😢</span>
                  <span>
                    <span className="font-bold">We're here for you.</span> It looks like you've had a tough day recently. Remember, support is available—reach out to a counselor or try a guided journal entry.
                  </span>
                </div>
              );
            }
          } catch { }
        }
        return null;
      })()}
      <div className="container mx-auto px-4 py-8">
        <div id="wellness-journey" className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Wellness Journey</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personalized space for mental health and well-being. Track your progress,
            connect with others, and access resources tailored just for you.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8 bg-transparent gap-1">
            {[
              { value: 'dashboard', label: 'Dashboard', tooltip: 'Overview of your wellness stats' },
              { value: 'mood', label: 'Mood', tooltip: 'Track your daily mood' },
              { value: 'journal', label: 'Journal', tooltip: 'Guided journaling exercises' },
              { value: 'goals', label: 'Goals', tooltip: 'Set and track wellness goals' },
              { value: 'achievements', label: 'Badges', tooltip: 'Earn badges for progress' },

              { value: 'counselor', label: 'Contact', tooltip: 'Connect with support' },
              { value: 'feedback', label: 'Feedback', tooltip: 'Share your feedback' }
            ].map((tab) => (
              <div key={tab.value} className="relative">
                <div className="group">
                  <TabsTrigger
                    value={tab.value}
                    className={`wellness-tab relative px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors duration-200 ${activeTab === tab.value ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
                    aria-label={tab.tooltip}
                  >
                    {tab.label}
                  </TabsTrigger>
                  <span className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-10 opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity duration-200" style={{ whiteSpace: 'nowrap', bottom: '-2.5rem' }}>{tab.tooltip}</span>
                </div>
              </div>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <PersonalizedDashboard onNavigateToGoals={() => setActiveTab('goals')} />
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <MoodTracker />
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <GuidedJournal />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <WellnessGoals />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementBadges />
          </TabsContent>


          <TabsContent value="counselor" className="space-y-6">
            <CounselorConnect />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <PlatformFeedback />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default WellnessDashboard;
